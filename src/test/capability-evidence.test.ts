import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capabilityEvidence, surfaces } from '../core/capability-evidence';
import { Capability } from '../contracts';
const cap:Capability={id:'test.read',module:'test',description:'read',effect:'read',fields:{},actorMask:0n,ai:false,local:async()=>null};
test('F02 capability inventory separates registration, access and validation',()=>{
 assert.equal(new Set(surfaces).size,12);
 assert.equal(capabilityEvidence(cap).validation,'not-certified');
 assert.equal(capabilityEvidence(cap).access,'context-dependent');
 assert.equal(capabilityEvidence({...cap,effect:'destructive'}).risk,'R4');
 assert.equal(capabilityEvidence({...cap,effect:'destructive'}).confirmation,true);
});
