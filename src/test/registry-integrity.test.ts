import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Registry } from '../core/registry';
import { Capability, Field } from '../contracts';
test('F12 registration is atomic and owns immutable capability metadata',()=>{
 const registry=new Registry();
 const field:Field={type:'string',choices:['original']};
 const cap:Capability={id:'test.a',module:'test',description:'a',effect:'read',fields:{field},actorMask:0n,ai:false,local:async()=>null};
 assert.throws(()=>registry.register({id:'test',dependencies:[],capabilities:[cap,{...cap}]}),/test.a/);
 assert.equal(registry.list().length,0);
 const dependencies:string[]=[];const capabilities=[cap];
 registry.register({id:'test',dependencies,capabilities});
 field.type='boolean';dependencies.push('missing');capabilities.length=0;
 registry.seal();
 assert.equal(registry.get('test.a').fields.field.type,'string');
 assert.equal(registry.manifest()[0].dependencies.length,0);
 assert.equal(registry.manifest()[0].capabilities.length,1);
 assert.ok(Object.isFrozen(registry.get('test.a').fields.field.choices));
});
