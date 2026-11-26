import { randomUUID } from 'node:crypto';
import { Context, Fault, id, obj } from '../contracts';
import { application } from '../core/application';
import { ClientPort } from '../integrations/discord/port';
import { Intelligence } from '../modules/intelligence/engine';
import { log } from '../modules/observability/metrics';

const code = (e:unknown) => e instanceof Fault ? e.code : e instanceof Error ? e.name : 'unknown';
const record = (v:unknown) => v && typeof v==='object' && !Array.isArray(v) ? v as Record<string,unknown> : {};
// Opt-in, one-time production smoke. Bot principal only; never impersonates a user.
// The fixture is isolated. Cleanup only touches the newly created fixture after read-back.
export async function liveSmoke(client:ClientPort,app:ReturnType<typeof application>,ai:Intelligence,guild:string) {
    const store=app.kernel.store, receipt='integration-smoke-v1';
    if(!store.claim(guild,receipt)){log('LIVE_SMOKE_SKIPPED',{reason:'already_claimed'});return;}
    const bot=client.user?.id;
    if(!bot){store.finish(guild,receipt,'failed');return;}
    const stamp=randomUUID().slice(0,8), name='axyon-smoke-'+stamp, topic='Axyon isolated integration fixture '+stamp;
    let fixture:string|undefined, passed=0,failed=0, cleaned=false;
    const step=async(name:string,fn:()=>Promise<void>)=>{try{await fn();passed++;log('LIVE_SMOKE_STEP',{step:name,status:'pass'});}catch(e){failed++;log('LIVE_SMOKE_STEP',{step:name,status:'fail',code:code(e)});}};
    const check=(ok:unknown,reason:string)=>{if(!ok)throw new Fault(reason)};
    try {
        const row=record(await client.rest.post('/guilds/'+guild+'/channels',{body:{name,type:0,topic,permission_overwrites:[{id:guild,type:0,allow:'0',deny:'1024'},{id:bot,type:1,allow:'68624',deny:'0'}]},reason:'Axyon isolated integration smoke'}));
        fixture=id(row.id); const current=record(await client.rest.get('/channels/'+fixture));
        check(current.guild_id===guild&&current.name===name&&current.topic===topic,'fixture_readback');
        log('LIVE_SMOKE_FIXTURE',{id:fixture});
        const channel=fixture;
        const ctx=(suffix:string):Context=>({guild,channel,actor:bot,nonce:'smoke:'+stamp+':'+suffix,source:'slash'});
        const execute=async(cap:string,input:unknown,suffix:string)=>{const r=await app.kernel.execute(cap,input,ctx(suffix));if(r.status!=='ok')throw new Fault('smoke_unexpected_outcome');return r.data};
        await step('kernel_ping',async()=>check(await execute('system.ping',{},'ping')==='pong','ping_readback'));
        await step('channel_read',async()=>check(obj(await execute('discord.get-channel',{canal:channel},'channel')).id===channel,'channel_readback'));
        let mid:string|undefined;
        await step('message_send',async()=>{const r=obj(await execute('discord.create-message',{canal:channel,texto:'AXYON_SMOKE_'+stamp},'send'));mid=id(r.id);const observed=record(await client.rest.get('/channels/'+channel+'/messages/'+mid));check(observed.content==='AXYON_SMOKE_'+stamp&&record(observed.author).id===bot,'message_readback');});
        await step('message_edit_read',async()=>{if(!mid)throw new Fault('fixture_message_missing');await execute('discord.update-message',{canal:channel,mensagem:mid,texto:'AXYON_SMOKE_EDIT_'+stamp},'edit');const result=obj(await execute('discord.get-message',{canal:channel,mensagem:mid},'read'));check(result.content==='AXYON_SMOKE_EDIT_'+stamp,'edit_readback');});
        await step('confirmation_cancel',async()=>{if(!mid)throw new Fault('fixture_message_missing');const c=ctx('confirm');const result=await app.kernel.execute('discord.delete-message',{canal:channel,mensagem:mid},c);if(result.status!=='confirmation')throw new Fault('confirmation_missing');app.kernel.cancel(ctx('cancel'),result.token);let denied=false;try{await app.kernel.confirmToken(ctx('replay'),result.token)}catch(e){denied=e instanceof Fault&&e.code==='confirmation_invalid'}check(denied,'confirmation_replay');check(record(await client.rest.get('/channels/'+channel+'/messages/'+mid)).id===mid,'cancel_readback');});
        await step('protected_origin',async()=>{let denied=false;try{await app.kernel.execute('discord.delete-channel',{canal:channel},ctx('protected'))}catch(e){denied=e instanceof Fault&&e.code==='protected_ingress'}check(denied,'origin_not_protected');});
        await step('admin_panels',async()=>{const a=obj(await execute('system.ia.status',{},'ia'));const m=await execute('system.modulos.listar',{},'modules');check(typeof a.enabled==='boolean'&&Array.isArray(m)&&m.length===app.registry.manifest().length,'panel_data');});
        await step('real_ai_engine',async()=>{const result=await ai.handle({context:{...ctx('ai'),source:'ai'},prompt:'Responda apenas OK.',mention:true,thread:false});check(result.kind==='text'&&!!result.text.trim()&&!result.text.includes('não configurada')&&!result.text.includes('Limite temporário'),'ai_engine_response');});
        await step('workflow_send',async()=>{const result=await app.workflows.fire({id:'smoke-'+stamp,guild,channel,actor:bot,capability:'discord.create-message',input:{canal:channel,texto:'AXYON_SMOKE_WORKFLOW_'+stamp},kind:'schedule',trigger:'',interval:0,next:0,enabled:true,revision:0},'smoke:'+stamp+':workflow');check(result&&obj(result).id,'workflow_readback');});
    } catch(e){failed++;log('LIVE_SMOKE_SETUP_FAILED',{code:code(e)});}
    finally {
        if(fixture)try{
            const r=record(await client.rest.get('/channels/'+fixture));
            const messages=await client.rest.get('/channels/'+fixture+'/messages',{query:new URLSearchParams({limit:'100'})});
            if(r.guild_id!==guild||r.name!==name||r.topic!==topic||!Array.isArray(messages)||messages.length>=100||messages.some(m=>record(record(m).author).id!==bot))throw new Fault('fixture_cleanup_not_safe');
            await client.rest.delete('/channels/'+fixture,{reason:'Cleanup isolated Axyon smoke fixture'});
            try {await client.rest.get('/channels/'+fixture);throw new Fault('fixture_cleanup_readback')}catch(e){if(Number(record(e).code)!==10003)throw e;}
            cleaned=true;
        }catch(e){failed++;log('LIVE_SMOKE_CLEANUP_FAILED',{id:fixture,code:code(e)});}
        store.finish(guild,receipt,failed?'uncertain':'done');
        log('LIVE_SMOKE_FINISHED',{passed,failed,cleaned});
    }
}
