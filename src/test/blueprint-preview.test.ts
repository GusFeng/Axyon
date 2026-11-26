import { test } from 'node:test';
import assert from 'node:assert/strict';
import { observedSnapshot } from '../modules/blueprint/observed';
import { previewManagedNames } from '../modules/blueprint/preview';
const G='100000000000000001',C='100000000000000002',R='100000000000000003';
test('F07 preview is non-executable and preserves resources absent from desired state',()=>{
 const s=observedSnapshot(G,[{id:C,name:'old'}],[{id:R,name:'keep'}],123);
 const p=previewManagedNames(s,G,[{id:C,kind:'channel',name:'new'}]);
 assert.deepEqual(p.changes,[{id:C,kind:'channel',from:'old',to:'new'}]);assert.deepEqual(p.preserved,['role:'+R]);assert.equal(p.executable,false);
 assert.equal(previewManagedNames(s,G,[]).changes.length,0);
 assert.throws(()=>previewManagedNames(s,R,[]),/snapshot_scope/);
 assert.throws(()=>previewManagedNames({...s,coverage:'incomplete'},G,[]),/snapshot_incomplete/);
});
