import { Capability, Fault, Json, P } from '../../contracts';
import { Kernel } from '../../core/kernel';
import { Projection } from '../operations/definitions';
import { observedSnapshot, Snapshot } from './observed';
import { DesiredResource, previewManagedNames } from './preview';
export function blueprint(getKernel: () => Kernel): {
    caps: Capability[];
    projections: Projection[];
} { const cap: Capability = { id: 'system.blueprint.export', module: 'blueprint', description: 'Exporta inventário visível de canais e cargos, sem restaurar ou aplicar alterações.', effect: 'read', fields: {}, actorMask: P.manageGuild, ai: false, local: async (_, c) => { const k = getKernel(); const [channels, roles] = await Promise.all([k.execute('discord.list-guild-channels', {}, { ...c, nonce: c.nonce + ':channels' }), k.execute('discord.list-guild-roles', {}, { ...c, nonce: c.nonce + ':roles' })]); if (channels.status !== 'ok' || roles.status !== 'ok')
        throw new Fault('blueprint_incomplete'); return { schema: 1, guild: c.guild, scope: 'visible bounded inventory', channels: channels.data, roles: roles.data, observation: observedSnapshot(c.guild, channels.data, roles.data) as unknown as Json }; } }; const preview:Capability={id:'system.blueprint.preview',module:'blueprint',description:'Simula renomeação de recursos gerenciados, sem aplicar alterações.',effect:'read',fields:{recursos:{type:'string',required:true,max:4000}},actorMask:P.manageGuild,ai:false,local:async(i,c)=>{
    let raw:unknown;try{raw=JSON.parse(String(i.recursos));}catch{throw new Fault('invalid_blueprint_json');}
    if(!Array.isArray(raw)||raw.length>50||raw.some(r=>!r||typeof r!=='object'||Array.isArray(r)||Object.keys(r).some(k=>!['id','kind','name'].includes(k))||typeof r.id!=='string'||typeof r.name!=='string'||!['channel','role'].includes(r.kind)))throw new Fault('invalid_desired_resource');
    const result=await getKernel().execute(cap.id,{}, {...c,nonce:c.nonce+':observe'});
    if(result.status!=='ok'||!result.data||typeof result.data!=='object'||Array.isArray(result.data))throw new Fault('blueprint_incomplete');
    return previewManagedNames(result.data.observation as unknown as Snapshot,c.guild,raw as DesiredResource[]) as unknown as Json;
}};return {caps:[cap,preview],projections:[{root:'blueprint',sub:'exportar',cap:cap.id,description:cap.description,options:{}},{root:'blueprint',sub:'planejar',cap:preview.id,description:preview.description,options:{...preview.fields}}]}; }

