import { Capability, Fault, Obj, Json, P, str, id } from '../../contracts';
import { Registry } from '../../core/registry';
import { Store } from '../persistence/store';
import { diagnostics } from '../observability/metrics';
import { editSetting, defaults } from '../configuration/settings';
import { fields as f, Projection } from '../operations/definitions';
export function administrative(registry: Registry, store: Store): {
    caps: Capability[];
    projections: Projection[];
} {
    const caps: Capability[] = [], projections: Projection[] = [];
    function add(root: string, sub: string | undefined, description: string, options: Capability['fields'], local: NonNullable<Capability['local']>, write = false, admin = true) { const cap: Capability = { id: `system.${root}${sub ? '.' + sub : ''}`, module: 'control-plane', description, effect: write ? 'write' : 'read', fields: options, actorMask: admin ? P.manageGuild : 0n, ai: false, local }; caps.push(cap); projections.push({ root, sub, cap: cap.id, description, options: { ...options } }); }
    add('ping', undefined, 'Verifica resposta do bot.', {}, async () => 'pong', false, false);
    add('status', undefined, 'Estado local do framework.', {}, async () => ({ status: 'running', modules: registry.manifest().length, capabilities: registry.list().length, uptime_seconds: Math.floor(process.uptime()) }), false, false);
    add('diagnostico', undefined, 'Diagnóstico local e métricas de execução.', {}, async (_, c) => ({ ...diagnostics(store, c.guild), database: 'sqlite' }));
    add('ajuda', 'inicio', 'Lista grupos de capacidades.', {}, async () => ({ modules: registry.manifest().map(m => m.id), usage: 'Use /ajuda buscar para encontrar capacidades.' }), false, false);
    add('ajuda', 'buscar', 'Busca capacidades implementadas.', { termo: f.s() }, async (i) => registry.list().filter(c => c.id.includes(str(i.termo).toLowerCase()) || c.description.toLowerCase().includes(str(i.termo).toLowerCase())).slice(0, 20).map(c => ({ id: c.id, description: c.description })), false, false);
    add('ia', 'status', 'Configuração da IA no servidor.', {}, async (_, c) => store.settings(c.guild).value.ai as unknown as Json);
    const keys = ['enabled', 'mode', 'mentions', 'direct', 'blocked', 'allowUsers', 'denyUsers', 'allowRoles', 'denyRoles', 'memory', 'retentionMinutes', 'language', 'style', 'personality', 'domains', 'emergency', 'dryRun', 'threads', 'dms', 'protectedChannels', 'protectedRoles', 'protectedUsers'];
    add('ia', 'configurar', 'Configura comportamento, canais, acesso, memória e segurança.', { chave: f.choice(keys), valor: { type: 'string', required: true, min: 0, max: 1000 } }, async (i, c) => { const r = store.settings(c.guild); const next = editSetting(r.value, str(i.chave), str(i.valor)); const rev = store.save(c.guild, r.revision, next); if (!next.ai.memory)
        store.clearMemory(c.guild); return { revision: rev, setting: i.chave, value: i.valor }; }, true);
    add('ia', 'diagnostico', 'Mostra estado e resultados registrados, sem inferência sintética.', {}, async (_, c) => ({ configured: !!(process.env.AI_API_KEY || process.env.API) && !!process.env.AI_API_URL && !!process.env.AI_MODEL, model: process.env.AI_MODEL ?? null, metrics: store.stats(c.guild), recent: store.recent(c.guild) }));
    add('ia', 'consentimento', 'Autoriza memória pessoal neste servidor.', { ativo: f.b(true) }, async (i, c) => { store.consent(c.guild, c.actor, i.ativo === true); return { consent: i.ativo }; }, true, false);
    add('ia', 'esquecer', 'Exclui memória deste usuário no servidor.', {}, async (_, c) => { store.consent(c.guild, c.actor, false); return { deleted: true }; }, true, false);
    add('modulos', 'listar', 'Lista módulos, dependências e estados efetivos.', {}, async (_, c) => { const s = store.settings(c.guild).value; return registry.manifest().map(m => ({ id: m.id, essential: !!m.essential, enabled: registry.enabled(m.id, s.modules), dependencies: [...m.dependencies] })); });
    add('modulos', 'definir', 'Ativa ou desativa um módulo opcional.', { modulo: f.s(), ativo: f.b(true) }, async (i, c) => { const m = registry.manifest().find(x => x.id === i.modulo); if (!m || m.essential)
        throw new Fault('essential_or_unknown_module'); const r = store.settings(c.guild); r.value.modules[m.id] = i.ativo === true; return { revision: store.save(c.guild, r.revision, r.value), enabled: registry.enabled(m.id, r.value.modules) }; }, true);
    add('registros', 'acoes', 'Mostra registros recentes sem conteúdo ou credenciais.', {}, async (_, c) => store.recent(c.guild));
    add('sistema', 'metricas', 'Métricas reais por servidor.', {}, async (_, c) => store.stats(c.guild));
    add('sistema', 'limites', 'Limites configurados localmente.', {}, async () => ({ ai_per_minute_per_guild: 10, ai_per_actor: 3, ai_concurrency: 3, confirmation_seconds: 120, job_min_interval_seconds: 60 }));
    add('configurar', 'ver', 'Configurações do servidor.', {}, async (_, c) => store.settings(c.guild).value as unknown as Json);
    add('axyon', 'estado', 'Resumo da plataforma.', {}, async (_, c) => ({ capabilities: registry.list().length, modules: registry.manifest().length, revision: store.settings(c.guild).revision }));
    add('axyon', 'operacoes', 'Pesquisa operações implementadas.', { filtro: f.s(false) }, async (i) => registry.list().filter(x => !i.filtro || x.id.includes(str(i.filtro))).slice(0, 25).map(x => ({ id: x.id, effect: x.effect, ai: x.ai })));
    add('ajuda', 'modulo', 'Descreve módulo e capacidades.', { nome: f.s() }, async (i) => { const m = registry.manifest().find(x => x.id === i.nome); if (!m)
        throw new Fault('unknown_module'); return { id: m.id, essential: !!m.essential, dependencies: [...m.dependencies], capabilities: m.capabilities.map(x => x.id) }; }, false, false);
    add('ajuda', 'comando', 'Consulta capacidade pelo identificador.', { nome: f.s() }, async (i) => { const c = registry.get(str(i.nome)); return { id: c.id, description: c.description, fields: c.fields as unknown as Json, effect: c.effect }; }, false, false);
    add('axyon', 'modulos', 'Exibe manifesto de módulos.', {}, async (_, c) => { const s = store.settings(c.guild).value; return registry.manifest().map(m => ({ id: m.id, enabled: registry.enabled(m.id, s.modules) })); });
    add('axyon', 'configurar', 'Mostra acesso ao plano de controle.', {}, async () => ({ configuration: '/configurar ver', ai: '/ia configurar', modules: '/modulos definir' }));
    add('configurar', 'definir', 'Define configuração da IA ou segurança.', { chave: f.choice(keys), valor: { type: 'string', required: true, min: 0, max: 1000 } }, async (i, c) => { const r = store.settings(c.guild); const next = editSetting(r.value, str(i.chave), str(i.valor)); const revision = store.save(c.guild, r.revision, next); if (!next.ai.memory)
        store.clearMemory(c.guild); return { revision }; }, true);
    add('configurar', 'redefinir', 'Redefine uma configuração específica para o padrão.', { chave: f.choice(keys) }, async (i, c) => { const r = store.settings(c.guild); const key = str(i.chave); const base = defaults(); const value = Object.hasOwn(base.ai, key) ? (base.ai as unknown as Record<string, unknown>)[key] : (base as unknown as Record<string, unknown>)[key]; const raw = Array.isArray(value) ? value.join(',') : String(value ?? ''); const next = editSetting(r.value, key, raw); const revision = store.save(c.guild, r.revision, next); if (!next.ai.memory)
        store.clearMemory(c.guild); return { revision, key }; }, true);
    add('configurar', 'exportar', 'Exporta configuração deste servidor, sem credenciais.', {}, async (_, c) => store.settings(c.guild).value as unknown as Json);
    add('registros', 'config', 'Consulta revisão de configuração.', {}, async (_, c) => ({ revision: store.settings(c.guild).revision }));
    add('registros', 'agenda', 'Consulta rotinas registradas.', {}, async (_, c) => store.jobs(c.guild).map(j => ({ id: j.id, enabled: j.enabled, next: j.next })));
    add('sistema', 'sessao', 'Informa runtime e processo.', {}, async () => ({ runtime: process.version, uptime_seconds: Math.floor(process.uptime()), pid: process.pid }));
    add('gateway', 'estado', 'Informa transporte ativo no processo.', {}, async () => ({ transport: 'discord.js Gateway', runtime: process.version, source: 'process configuration' }));
    add('gateway', 'intents', 'Informa intents solicitadas pelo processo.', {}, async () => ({ guilds: true, guildMessages: true, messageContent: process.env.DISCORD_MESSAGE_CONTENT === 'true', guildMembers: process.env.DISCORD_GUILD_MEMBERS === 'true', directMessages: process.env.AXYON_ENABLE_DMS === 'true' }));
    add('comandos', 'listar', 'Lista capacidades da interface local.', {}, async () => registry.list().map(c => ({ id: c.id, description: c.description })).slice(0, 25));
    add('comandos', 'info', 'Consulta contrato de capacidade.', { comando: f.s() }, async (i) => { const c = registry.get(str(i.comando)); return { id: c.id, description: c.description, effect: c.effect, permission: String(c.actorMask) }; });
    add('conexoes', 'estado', 'Exibe integrações configuradas sem segredos.', {}, async () => ({ discord: 'Gateway', ai: !!(process.env.AI_API_KEY || process.env.API) && !!process.env.AI_API_URL && !!process.env.AI_MODEL, storage: process.env.AXYON_DB_PATH ? 'sqlite-file' : 'sqlite-memory', oauth: false }));
    return { caps, projections };
}

