import type { Turn } from "./client";

export class ConversationStore {
  private readonly sessions=new Map<string,{turns:Turn[];updated:number}>();
  constructor(private readonly ttl=30*60*1000,private readonly maxSessions=100,private readonly maxTurns=12) {}
  private prune(now:number) {
    for(const [key,session] of this.sessions)if(now-session.updated>=this.ttl)this.sessions.delete(key);
  }
  get(key:string,now=Date.now()):Turn[] {
    this.prune(now);
    return (this.sessions.get(key)?.turns??[]).map(turn=>({...turn}));
  }
  append(key:string,prompt:string,reply:string,now=Date.now()) {
    const turns:Turn[]=[...this.get(key,now),{role:"user",content:prompt.slice(0,2000)},{role:"assistant",content:reply.slice(0,4000)}];
    this.sessions.delete(key);
    while(this.sessions.size>=this.maxSessions){
      const first=this.sessions.keys().next();
      if(first.done)break;
      this.sessions.delete(first.value);
    }
    this.sessions.set(key,{turns:turns.slice(-this.maxTurns),updated:now});
  }
}
