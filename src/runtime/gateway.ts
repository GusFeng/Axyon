import { createServer, Server } from 'node:http';
import { Context, Fault, Json, Obj, id } from '../contracts';
import { application } from '../core/application';
import { DiscordAdapter, ClientPort } from '../integrations/discord/port';
import { Store } from '../modules/persistence/store';
import { Intelligence } from '../modules/intelligence/engine';
import { configure, askAI, AIError } from '../modules/intelligence/provider';
import { log } from '../modules/observability/metrics';
import { recoverInterrupted } from '../modules/recovery/reconcile';
import { assertDatabaseIntegrity, operationalReadiness } from './readiness';
import { stagingConfiguration, verifyStagingApplication } from './staging';
import { panelFor,panelAction } from '../modules/control-plane/panels';
import { Outcome } from '../core/kernel';
import { liveSmoke } from './smoke';
import { span, stopTelemetry } from '../modules/performance/telemetry';
import { commandSignature } from '../modules/commands/catalog';
// SDK boundary intentionally small; verified against the actual SDK at integration time.
interface Option {
    name: string;
    type: number;
    value?: string | number | boolean;
    options?: Option[];
}
interface User {
    id: string;
    bot: boolean;
}
interface Reply {
    content: string;
    ephemeral?: boolean;
    allowedMentions: {
        parse: never[];
        repliedUser: boolean;
    };
    components?: unknown[];
}
interface Interaction {
    id: string;
    guildId: string | null;
    channelId: string | null;
    user: User;
    commandName: string;
    customId: string;
    options: {
        data: Option[];
    };
    deferred: boolean;
    replied: boolean;
    isChatInputCommand(): boolean;
    isButton(): boolean;
    deferReply(o: {
        ephemeral: boolean;
    }): Promise<unknown>;
    reply(o: Reply): Promise<unknown>;
    editReply(o: Reply): Promise<unknown>;
    followUp(o: Reply): Promise<unknown>;
}
interface Message {
    id: string;
    guildId: string | null;
    channelId: string;
    author: User;
    content: string;
    webhookId: string | null;
    mentions: {
        users: {
            has(id: string): boolean;
        };
    };
    reference?: {
        messageId?: string;
    } | null;
    channel: {
        isThread?(): boolean;
        sendTyping?(): Promise<void>;
        send(o: Reply): Promise<unknown>;
    };
    reply(o: Reply): Promise<unknown>;
}
interface GatewayClient extends ClientPort {
    application: {
        id: string;
    } | null;
    isReady(): boolean;
    on(name: 'interactionCreate', fn: (i: Interaction) => void): void;
    on(name: 'messageCreate', fn: (m: Message) => void): void;
    on(name: 'error' | 'shardError', fn: (e: unknown) => void): void;
    on(name: string, fn: (e: unknown) => void): void;
    once(name: string, fn: () => void): void;
    login(token: string): Promise<string>;
    destroy(): void;
}
interface SDK {
    Client: new (o: {
        intents: number[];
        partials?: number[];
    }) => GatewayClient;
    GatewayIntentBits: Record<string, number>;
    Partials: Record<string, number>;
    Events: Record<string, string>;
}
const errorName = (e: unknown) => e instanceof Fault ? e.code : e instanceof Error ? e.name : 'unknown';
const message = (content: string, components?: unknown[]): Reply => ({ content: content.slice(0, 1900), allowedMentions: { parse: [], repliedUser: false }, ...(components ? { components } : {}) });
function describe(out: Outcome, capability: string): Reply {
    if (out.status === 'confirmation') return message(`Confirmação obrigatória (2 min)\n${out.summary}`, [{type:1,components:[{type:2,style:4,label:'Confirmar',custom_id:`ax:yes:${out.token}`},{type:2,style:2,label:'Cancelar',custom_id:`ax:no:${out.token}`}]}]);
    if(capability==='system.ping'&&out.status==='ok')return message(String(out.data));
    if(out.status==='ok'){const panel=panelFor(capability,out.data);if(panel)return message(panel.text,panel.components)}
    const content=typeof out.data==='string'?out.data:JSON.stringify(out.data,null,2);return message(`${out.status==='simulation'?'Simulação — nenhum efeito aplicado':'Resultado'}\n${content.length>1800?content.slice(0,1750)+'\n… resultado limitado; consulte itens específicos.':content}`);
}
function chunks(text: string): string[] { const parts: string[] = []; let s = ''; for (const c of Array.from(text)) {
    if (s.length + c.length > 1900) {
        parts.push(s);
        s = '';
        if (parts.length === 3)
            break;
    }
    s += c;
} if (s && parts.length < 3)
    parts.push(s); return parts; }
function parse(i: Interaction) { const sub = i.options.data.find(x => x.type === 1); const raw: Obj = {}; for (const x of sub?.options ?? i.options.data) {
    if (x.value === undefined)
        throw new Fault('invalid_option');
    raw[x.name] = x.value;
} return { sub: sub?.name, raw }; }
function context(guild: string | null, channel: string | null, user: User, nonce: string, source: Context['source']): Context { return { guild: id(guild), channel: id(channel), actor: id(user.id), nonce, source }; }
export async function main(env: NodeJS.ProcessEnv = process.env, sdkOverride?: SDK) {
    const token = env.DISCORD_BOT_TOKEN?.trim();
    if (!token)
        throw new Fault('missing_discord_token');
    const guildId = id(env.DISCORD_GUILD_ID || env.AI_GUILD_ID || env.RAIBOT_CONTROL_GUILD);
    const staging = stagingConfiguration(env, guildId);
    if (staging) await verifyStagingApplication(staging, token);
    const sdk = sdkOverride ?? require('discord.js') as SDK;
    if (typeof sdk.Client !== 'function')
        throw new Fault('discord_sdk_unavailable');
    const intent = sdk.GatewayIntentBits;
    const intents = [intent.Guilds, intent.GuildMessages];
    if (env.DISCORD_MESSAGE_CONTENT === 'true')
        intents.push(intent.MessageContent);
    if (env.DISCORD_GUILD_MEMBERS === 'true')
        intents.push(intent.GuildMembers);
    if (env.AXYON_ENABLE_DMS === 'true')
        intents.push(intent.DirectMessages);
    const client = new sdk.Client({ intents, ...(env.AXYON_ENABLE_DMS === 'true' ? { partials: [sdk.Partials.Channel] } : {}) });
    const store = new Store(env.AXYON_DB_PATH || ':memory:');
    try { assertDatabaseIntegrity(() => store.db.prepare('PRAGMA quick_check').all()); }
    catch (e) { store.close(); client.destroy(); throw e; }
    if (!sdkOverride) log('DATABASE_READY', { persistent: !!env.AXYON_DB_PATH, integrity: true, uid:process.getuid?.()??null, smokeRecorded:store.db.prepare("SELECT status FROM receipts WHERE guild=? AND nonce='integration-smoke-v1'").get(guildId)?.status??null });
    log('RECOVERY', { uncertain: recoverInterrupted(store) });
    const adapter = new DiscordAdapter(client,()=>client.isReady()&&env.DISCORD_GUILD_MEMBERS==='true');
    const app = application(store, adapter);
    let aiConfig = null;
    try {
        aiConfig = configure(env);
    }
    catch (e) {
        log('AI_CONFIG_INVALID', { code: errorName(e) });
    }
    const ai = new Intelligence(app.kernel, aiConfig, fetch, app.runtimeCatalog);
    let ready = false, stopping = false;
    let timer: NodeJS.Timeout | undefined;
    let maintenance: NodeJS.Timeout | undefined;
    let catalogRefresh:NodeJS.Timeout|undefined;
    let refreshing=false;
    function publishCatalog(observed:unknown[]){const verified=new Set(app.catalog.roots.filter(root=>{const remote=observed.find(x=>x&&typeof x==='object'&&(x as {name?:string}).name===root.name);return remote&&commandSignature([remote])===commandSignature([root]);}).map(x=>x.name)); app.runtimeCatalog.replace(app.catalog.entries().filter(e=>verified.has(e.root)).map(e=>({root:e.root,sub:e.sub,cap:e.cap,description:e.description,options:Object.keys(e.options),required:Object.entries(e.options).filter(([,v])=>v.required).map(([k])=>k),mask:app.registry.get(e.cap).actorMask|BigInt(app.catalog.roots.find(r=>r.name===e.root)?.default_member_permissions??'0')})));log('RUNTIME_CATALOG_SYNC',{roots:verified.size,entries:app.runtimeCatalog.entries().length});}
    async function refreshCatalog(){if(refreshing||!client.isReady()||!client.application)return;refreshing=true;try{const observed=await client.rest.get(`/applications/${client.application.id}/guilds/${guildId}/commands`);if(!Array.isArray(observed))throw new Fault('catalog_read_failed');publishCatalog(observed);}catch(e){app.runtimeCatalog.clear();log('CATALOG_SYNC_FAILED',{code:errorName(e)});}finally{refreshing=false;}}
    client.on('raw',raw=>{const type=(raw as {t?:string}|null)?.t??'';if(/^(GUILD_(MEMBER|ROLE|CREATE|DELETE|UPDATE)|CHANNEL_|THREAD_|VOICE_STATE_UPDATE)/.test(type))adapter.invalidate();if(type.startsWith('APPLICATION_COMMAND_')){app.runtimeCatalog.clear();track(refreshCatalog());}});
    for(const event of ['guildMemberUpdate','guildMemberRemove','guildRoleUpdate','guildRoleDelete','channelUpdate','channelDelete','threadUpdate','threadDelete','guildUpdate'])client.on(event,()=>adapter.invalidate());
    for(const event of ['shardDisconnect','shardReconnecting','invalidated'])client.on(event,()=>{adapter.invalidate();app.runtimeCatalog.clear();});
    client.on('shardResume',()=>{adapter.invalidate();track(refreshCatalog());});
    const botReplies = new Set<string>();
    const active = new Set<Promise<unknown>>();
    function track(p: Promise<unknown>) { active.add(p); void p.catch(e => log('EVENT_FAILED', { code: errorName(e) })).finally(() => active.delete(p)); }
    const server = createServer((req, res) => { const path = req.url?.split('?')[0]; if (req.method !== 'GET' || !['/health', '/ready'].includes(path ?? '')) {
        res.writeHead(404).end();
        return;
    } const available = operationalReadiness(ready, client.isReady(), stopping); const ok = path === '/health' || available; res.writeHead(ok ? 200 : 503, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }).end(JSON.stringify({ ok, service: 'axyon', ready: available, persistent: !!env.AXYON_DB_PATH })); });
    const port = Number(env.PORT ?? 3000);
    if (!Number.isInteger(port) || port < (sdkOverride ? 0 : 1) || port > 65535)
        throw new Fault('invalid_port');
    await new Promise<void>((resolve, reject) => { server.once('error', reject); server.listen(port, '0.0.0.0', resolve); });
    await app.registry.start();
    client.once(sdk.Events.ClientReady, () => track((async () => { if (!client.application)
        throw new Fault('application_missing'); const route = `/applications/${client.application.id}/guilds/${guildId}/commands`; if (!sdkOverride) { const guild = await client.guilds.fetch(guildId); if (guild.id !== guildId) throw new Fault('guild_scope'); const me = await guild.members.fetchMe({force:true}); if (me.id !== client.user?.id) throw new Fault('bot_identity'); log('DISCORD_REST_VERIFIED', { guild: guild.id, bot: me.id }); try {const info=await client.rest.get('/applications/@me') as {flags?:number}; const flags=Number(info.flags??0); log('DISCORD_INTENT_FLAGS',{messageContent:!!(flags & ((1<<18)|(1<<19))),guildMembers:!!(flags & ((1<<14)|(1<<15)))});} catch(e){log('DISCORD_INTENT_FLAGS_UNAVAILABLE',{code:errorName(e)});} } if (env.AXYON_REGISTER_COMMANDS === 'true') {
        const current = await client.rest.get(route);
        if (!Array.isArray(current))
            throw new Fault('registration_read_failed');
        const known = new Set(app.catalog.roots.map(x => x.name));
        if (current.some(x => !x || typeof x !== 'object' || !known.has(String((x as Record<string, unknown>).name))))
            throw new Fault('unrelated_commands', 'Comandos externos detectados; registro recusado.');
        const desired = app.catalog.roots.map(({ dm_permission, ...r }) => r);
        const unchanged=commandSignature(current)===commandSignature(desired);
        const result = unchanged ? current : await client.rest.put(route, { body: desired });
        if (!Array.isArray(result) || result.length !== app.catalog.roots.length || result.some(x => !known.has(String((x as Record<string, unknown>).name))))
            throw new Fault('registration_verification_failed');
        const observed = unchanged ? current : await client.rest.get(route);
        if (!Array.isArray(observed) || observed.length !== known.size || observed.some(x => !known.has(String((x as Record<string,unknown>).name))) || commandSignature(observed)!==commandSignature(desired)) throw new Fault('registration_readback_failed');
        publishCatalog(observed);
        log('COMMANDS_REGISTERED', { count: observed.length, scope: 'guild', changed: !unchanged });
        if (!sdkOverride && env.AXYON_CLEAN_LEGACY_GLOBAL_COMMANDS === 'true') { const globalRoute=`/applications/${client.application.id}/commands`; const global=await client.rest.get(globalRoute); if(!Array.isArray(global))throw new Fault('global_registration_read_failed'); const legacy=new Set(['ping','deletemsg','createchannel']); let removed=0; for(const item of global){const r=item as {id?:string;name?:string;type?:number}; if(r.type===1 && r.name && legacy.has(r.name) && known.has(r.name)){await client.rest.delete(globalRoute+'/'+id(r.id));removed++;}} const after=await client.rest.get(globalRoute);if(!Array.isArray(after)||after.some(x=>{const r=x as {type?:number;name?:string};return r.type===1&&r.name&&legacy.has(r.name);}))throw new Fault('legacy_global_readback_failed');log('LEGACY_GLOBAL_COMMANDS_RECONCILED',{removed,remaining:after.length}); }
    }
    else {log('COMMAND_REGISTRATION_DISABLED', { candidate: app.catalog.roots.length });if(!sdkOverride)await refreshCatalog();} ready = true;
    if(!sdkOverride)catalogRefresh=setInterval(()=>track(refreshCatalog()),300000); log('GATEWAY_READY', { runtime: process.version, modules: app.registry.manifest().length, capabilities: app.registry.list().length, persistent: !!env.AXYON_DB_PATH, revision: env.RAILWAY_GIT_COMMIT_SHA ?? 'unknown', messageContent:env.DISCORD_MESSAGE_CONTENT==='true',guildMembers:env.DISCORD_GUILD_MEMBERS==='true',dmTransport:env.AXYON_ENABLE_DMS==='true' }); if (!sdkOverride && env.AI_STARTUP_CHECK === 'true') track((async()=>{ if (!aiConfig) { log('AI_PROVIDER_UNCONFIGURED'); return; } const t=performance.now(); try {const result=await span('startup.ai.verify',()=>askAI(aiConfig!,'Responda apenas OK.',fetch,[],'Teste técnico de conectividade. Responda OK.')); log('AI_PROVIDER_VERIFIED',{model:aiConfig.model,ms:Math.round(performance.now()-t),nonempty:!!result.trim(),streamRequested:!!aiConfig.streaming});} catch(e){log('AI_PROVIDER_FAILED',{code:e instanceof AIError?e.kind:errorName(e),status:e instanceof AIError?e.status??0:0});} })()); if(!sdkOverride&&env.AXYON_PERFORMANCE_CHECK==='true')track(span('startup.performance.verify',async()=>{try{const bot=client.user?.id;if(!bot)throw new Fault('bot_identity');const channels=await client.rest.get(`/guilds/${guildId}/channels`);if(!Array.isArray(channels))throw new Fault('channel_inventory');const candidates=channels.filter(x=>x&&typeof x==='object'&&[0,5].includes(Number((x as {type?:number}).type))).slice(0,5);for(const ch of candidates){const channel=id((ch as {id?:string}).id);const c:Context={guild:guildId,channel,actor:bot,source:'slash',nonce:'perf-startup'};try{const start=performance.now();await adapter.access(c,undefined,'fresh');const freshMs=performance.now()-start;await adapter.access(c,undefined,'snapshot');const before=adapter.performance();const warmStart=performance.now();await adapter.access(c,undefined,'snapshot');const warmMs=performance.now()-warmStart;const after=adapter.performance();const settings=store.settings(guildId).value;const access=await adapter.access(c,undefined,'fresh');const entries=app.runtimeCatalog.available(cap=>app.registry.enabled(app.registry.get(cap).module,settings.modules),access);const answer=app.runtimeCatalog.answer('como usar /ping?',entries);log('PERFORMANCE_CHECK',{freshMs:Math.round(freshMs*100)/100,warmMs:Math.round(warmMs*100)/100,cacheHit:after.hit>before.hit,externalAccessAvoided:after.fresh===before.fresh,confirmedPing:!!answer?.includes('/ping'),confirmedRoots:new Set(app.runtimeCatalog.entries().map(x=>x.root)).size});return;}catch{continue;}}throw new Fault('performance_channel_unavailable');}catch(e){log('PERFORMANCE_CHECK_FAILED',{code:errorName(e)});}})); if (!sdkOverride && env.AXYON_LIVE_SMOKE === 'true') track(liveSmoke(client,app,ai,guildId)); timer = setInterval(() => { if (operationalReadiness(ready, client.isReady(), stopping)) track(app.scheduler.tick()); }, 5000); maintenance = setInterval(() => { try {
        store.prune();if(!sdkOverride)log('PERFORMANCE_SNAPSHOT',adapter.performance());
    }
    catch (e) {
        log('MAINTENANCE_FAILED', { code: errorName(e) });
    } }, 60000); })()));
    client.on('interactionCreate', i => track(span('discord.interaction',async () => { if (!operationalReadiness(ready, client.isReady(), stopping) || i.guildId !== guildId || i.user.bot || (!i.isChatInputCommand() && !i.isButton()))
        return; const c = context(i.guildId, i.channelId, i.user, i.id, i.isButton() ? 'component' : 'slash'); try {
        const received=performance.now();await i.deferReply({ ephemeral: true });const ackMs=Math.round(performance.now()-received);
        let reply: Reply;
        if (i.isButton()) {
            const panel=panelAction(i.customId);if(panel){await app.kernel.execute(panel.capability,panel.input,c);reply=describe(await app.kernel.execute(panel.refresh,{}, {...c,nonce:c.nonce+':refresh'}),panel.refresh);}else{
            const match = /^ax:(yes|no):([0-9a-f-]{36})$/.exec(i.customId);
            if (!match)
                throw new Fault('unknown_component');
            if (match[1] === 'no') {
                app.kernel.cancel(c, match[2]);
                reply = message('Operação cancelada.');
            }
            else {
                const out = await app.kernel.confirmToken(c, match[2]);
                reply = describe(out, 'confirmed');
            }
            }
        }
        else {
            const { sub, raw } = parse(i);
            const p = app.catalog.resolve(i.commandName, sub, raw);
            reply = describe(await app.kernel.execute(p.cap, p.input, c), p.cap);
        }
        await i.editReply(reply);
        if (!sdkOverride) log('INTERACTION_REPLY_SENT',{command:i.isButton()?'component':i.commandName,ackMs,totalMs:Math.round(performance.now()-received)});
    }
    catch (e) {
        log('INTERACTION_FAILED', { code: errorName(e), command: i.commandName ?? 'component' });
        const r = message(e instanceof Fault ? e.message : 'Operação não confirmada. Consulte o diagnóstico; não repita automaticamente.');
        if (i.deferred || i.replied)
            await i.editReply(r).catch(() => { });
        else
            await i.reply({ ...r, ephemeral: true }).catch(() => { });
    } })));
    client.on('messageCreate', m => track(span('discord.message',async () => { if (!operationalReadiness(ready, client.isReady(), stopping) || m.author.bot || m.webhookId || !client.user)
        return; if (!m.guildId) {
        if (env.AXYON_ENABLE_DMS !== 'true')
            return;
        try {
            const g = await client.guilds.fetch(guildId);
            const member = await g.members.fetch({ user: m.author.id, force: true });
            const reply = await ai.dm(guildId, m.channelId, m.author.id, m.id, [...member.roles.cache.keys()], m.content);
            if (reply)
                await m.reply(message(reply));
        }
        catch (e) {
            log('DM_FAILED', { code: errorName(e) });
        }
        return;
    } if (m.guildId !== guildId)
        return; const c = context(m.guildId, m.channelId, m.author, m.id, 'ai'); const mention = m.mentions.users.has(client.user.id) || !!(m.reference?.messageId && botReplies.has(m.reference.messageId)); const prompt = m.content.replace(new RegExp(`<@!?${client.user.id}>`, 'g'), '').trim(); if (!prompt)
        return; const s = store.settings(guildId).value; const direct = s.ai.direct.includes(c.channel); if (mention || direct) {
        try {
            const received=performance.now();const r = await ai.handle({ context: c, prompt, mention, thread: !!m.channel.isThread?.() });
            if (r.kind === 'ignored')
                return;
            const sendReply = async (o: Reply) => { const sent = await m.reply(o); if (sent && typeof sent === 'object' && 'id' in sent && typeof sent.id === 'string') {
                botReplies.add(sent.id);
                if (botReplies.size > 1000)
                    botReplies.delete(botReplies.values().next().value!);
            } };
            if (r.kind === 'operation')
                await sendReply(describe(r.outcome, r.capability));
            else {
                const parts = chunks(r.text);
                if (parts.length) {
                    await sendReply(message(parts[0]));
                    for (const part of parts.slice(1))
                        await m.channel.send(message(part));
                }
            }
            if (!sdkOverride) log('AI_REPLY_SENT',{kind:r.kind, model:aiConfig?.model??'none',totalMs:Math.round(performance.now()-received)});
        }
        catch (e) {
            log('AI_FAILED', { code: errorName(e) });
            await m.reply(message(e instanceof Fault ? e.message : 'Não consegui concluir a solicitação.')).catch(() => { });
        }
    }
    else if (env.DISCORD_MESSAGE_CONTENT === 'true')
        await app.automation.event(guildId, c.channel, c.actor, m.id, prompt); })));
    client.on(sdk.Events.ChannelDelete, raw => { if (!raw || typeof raw !== 'object')
        return; const ch = raw as {
        id?: string;
        guildId?: string;
    }; if (ch.guildId !== guildId || !ch.id)
        return; try {
        const r = store.settings(guildId);
        if (r.value.ai.direct.includes(ch.id)) {
            r.value.ai.direct = r.value.ai.direct.filter(x => x !== ch.id);
            store.save(guildId, r.revision, r.value);
            log('DIRECT_CHANNEL_REMOVED');
        }
    }
    catch (e) {
        log('DIRECT_CHANNEL_CLEANUP_FAILED', { code: errorName(e) });
    } });
    client.on('error', e => log('DISCORD_ERROR', { code: errorName(e) }));
    client.on('shardError', e => log('GATEWAY_ERROR', { code: errorName(e) }));
    async function stop() { if (stopping)
        return; stopping = true; ready = false; if (timer)
        clearInterval(timer); if (maintenance)
        clearInterval(maintenance);if(catalogRefresh)clearInterval(catalogRefresh);adapter.invalidate();app.runtimeCatalog.clear(); server.close(); await Promise.race([Promise.allSettled([...active]), new Promise(r => setTimeout(r, 10000).unref())]); client.destroy(); await app.registry.stop(); store.close(); if(!sdkOverride)await stopTelemetry(); }
    if(!sdkOverride){process.once('SIGTERM', () => void stop());process.once('SIGINT', () => void stop());}
    try {
        await client.login(token);
    }
    catch (e) {
        await stop();
        throw e;
    }
    return { stop, app, server };
}

