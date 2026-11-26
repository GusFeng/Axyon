// Short-lived, bounded, generation-fenced single-flight snapshots. Never used for writes.
export class SnapshotCache<T> {
 private generation=0;
 private values=new Map<string,{until:number,value:Promise<T>,generation:number}>();
 readonly counters={hit:0,miss:0,invalidations:0};
 constructor(private ttl=2000,private limit=512,private clock=()=>Date.now()){}
 invalidate(){this.generation++;this.values.clear();this.counters.invalidations++;}
 async get(key:string,load:()=>Promise<T>):Promise<T>{
   const now=this.clock(), old=this.values.get(key);
   if(old&&old.until>now){this.counters.hit++;const result=await old.value;return old.generation===this.generation?result:load();}
   this.counters.miss++;const generation=this.generation;
   if(this.values.size>=this.limit)this.values.delete(this.values.keys().next().value!);
   const value=Promise.resolve().then(load);
   const entry={until:now+this.ttl,value,generation};this.values.set(key,entry);
   try{const result=await value;if(generation!==this.generation){if(this.values.get(key)===entry)this.values.delete(key);return load();}return result;}
   catch(e){if(this.values.get(key)===entry)this.values.delete(key);throw e;}
 }
}
