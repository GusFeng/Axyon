import { test } from 'node:test';
import assert from 'node:assert/strict';
import { observedSnapshot } from '../modules/blueprint/observed';
const G='100000000000000001',C='100000000000000002',R='100000000000000003';
test('F06 scoped snapshot distinguishes incomplete observations and omits private properties',()=>{
 const s=observedSnapshot(G,[{id:C,name:'general',guild_id:G,token:'secret'}],[{id:R,name:'role'}],123);
 assert.equal(s.coverage,'bounded');assert.equal(s.observedAt,123);assert.equal(s.resources.length,2);assert.ok(!JSON.stringify(s).includes('secret'));
 assert.equal(observedSnapshot(G,{},[]).coverage,'incomplete');
 assert.throws(()=>observedSnapshot(G,[{id:C,name:'foreign',guild_id:R}],[]),/snapshot_scope/);
});
