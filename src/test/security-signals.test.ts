import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../modules/persistence/store';
import { receiptSignals } from '../modules/security/signals';
const A='100000000000000001',B='100000000000000002';
test('F10 uncertainty is an observed local signal, never automatic attribution or containment',()=>{
 const s=new Store();try{s.claim(A,'private-nonce');s.finish(A,'private-nonce','uncertain');
 assert.deepEqual(receiptSignals(s,B),[]);assert.deepEqual(receiptSignals(s,A),[{type:'uncertain_effects',count:1,severity:'review',confidence:'observed-local',response:'manual-review'}]);
 assert.equal(s.uncertain(A),1);assert.ok(!JSON.stringify(receiptSignals(s,A)).includes('private-nonce'));
 }finally{s.close()}
});
