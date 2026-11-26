import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Store } from '../modules/persistence/store';
import { application } from '../core/application';
import { Context, DiscordPort } from '../contracts';
const G='100000000000000001',C='100000000000000002',A='100000000000000003',H='100000000000000004';
test('F13 synthetic concurrent ingress preserves tenant isolation and deduplicates effects',async()=>{
 const s=new Store();let effects=0;
 const port:DiscordPort={access:async()=>({actor:~0n,bot:~0n,roles:[],owner:false}),execute:async()=>{effects++;return null},verify:async(_,__,r)=>r};
 const app=application(s,port);
 try{
  const samples:number[]=[];
  const requests=Array.from({length:100},(_,i)=>({guild:i%2?H:G,channel:C,actor:A,nonce:'load-'+Math.floor(i/4),source:'slash' as const}));
  const results=await Promise.allSettled(requests.map(async(c:Context)=>{const start=performance.now();try{return await app.kernel.execute('discord.create-message',{texto:'synthetic'},c)}finally{samples.push(performance.now()-start)}}));
  assert.equal(results.filter(x=>x.status==='fulfilled').length,50);
  assert.equal(effects,50);
  assert.equal(s.uncertain(G)+s.uncertain(H),0);
  samples.sort((a,b)=>a-b);
  console.log(JSON.stringify({scenario:'synthetic-100-concurrent',requests:100,accepted:50,duplicate:50,p95Ms:samples[Math.ceil(samples.length*.95)-1]}));
 }finally{s.close()}
});
