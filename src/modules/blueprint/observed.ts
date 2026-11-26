import { Fault, Json, id } from '../../contracts';
export interface ObservedResource { id:string; name:string; kind:'channel'|'role'; parent:string|null; }
export interface Snapshot { guild:string; observedAt:number; coverage:'bounded'|'incomplete'; resources:ObservedResource[]; }
export function observedSnapshot(guild:string, channels:Json, roles:Json, observedAt=Date.now()):Snapshot {
    id(guild);
    const resources:ObservedResource[]=[];
    let incomplete=false;
    const seen=new Set<string>();
    for(const [kind,rows] of [['channel',channels],['role',roles]] as const){
        if(!Array.isArray(rows)){incomplete=true;continue;}
        for(const raw of rows){
            if(!raw||typeof raw!=='object'||Array.isArray(raw)||typeof raw.name!=='string'||typeof raw.id!=='string'){incomplete=true;continue;}
            try{
                const key=id(raw.id);
                if(raw.guild_id!==undefined && raw.guild_id!==guild)throw new Fault('snapshot_scope');
                if(seen.has(kind+':'+key)){incomplete=true;continue;}
                const parent=kind==='channel'&&raw.parent_id!=null?id(raw.parent_id):null;
                seen.add(kind+':'+key);resources.push({id:key,name:raw.name,kind,parent});
            }catch(e){if(e instanceof Fault&&e.code==='snapshot_scope')throw e;incomplete=true;}
        }
    }
    return {guild,observedAt,coverage:incomplete?'incomplete':'bounded',resources};
}
