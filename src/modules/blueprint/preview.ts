import { Fault, id } from '../../contracts';
import { Snapshot } from './observed';
export interface DesiredResource { id:string; kind:'channel'|'role'; name:string; }
export interface Preview { guild:string; observedAt:number; changes: {id:string;kind:'channel'|'role';from:string;to:string}[]; missing:string[]; preserved:string[]; executable:false; }
// Only explicitly identified managed resources may be proposed for renaming.
// Absence never means deletion, even in a complete-looking snapshot.
export function previewManagedNames(snapshot:Snapshot,guild:string,desired:readonly DesiredResource[]):Preview {
    if(snapshot.guild!==guild)throw new Fault('snapshot_scope');
    if(snapshot.coverage!=='bounded')throw new Fault('snapshot_incomplete');
    if(desired.length>50)throw new Fault('blueprint_limit');
    const map=new Map(snapshot.resources.map(x=>[x.kind+':'+x.id,x]));
    const managed=new Set<string>(),changes:Preview['changes']=[],missing:string[]=[];
    for(const d of desired){
        id(d.id);
        if(!['channel','role'].includes(d.kind)||typeof d.name!=='string'||!d.name.trim()||d.name.length>100)throw new Fault('invalid_desired_resource');
        const key=d.kind+':'+d.id;if(managed.has(key))throw new Fault('duplicate_desired_resource');managed.add(key);
        const observed=map.get(key);if(!observed){missing.push(key);continue;}
        if(observed.name!==d.name)changes.push({id:d.id,kind:d.kind,from:observed.name,to:d.name});
    }
    return {guild,observedAt:snapshot.observedAt,changes,missing,preserved:[...map.keys()].filter(k=>!managed.has(k)),executable:false};
}
