import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { createHash, timingSafeEqual } from "node:crypto";
import { Client } from "discord.js";
import { createChannel, deleteMessages, InputError, isTextTarget, ping, quantity } from "./operations";

function digest(value: string): Buffer { return createHash("sha256").update(value).digest(); }
export function authorized(provided: unknown, key: string): boolean {
  return typeof provided === "string" && key.length >= 32 && timingSafeEqual(digest(provided),digest(key));
}
function json(res: ServerResponse,status: number,data: unknown) {
  res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"});
  res.end(JSON.stringify(data));
}
async function body(req: IncomingMessage): Promise<Record<string,unknown>> {
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const part of req) {
    const chunk=Buffer.isBuffer(part)?part:Buffer.from(part);
    bytes+=chunk.length;
    if(bytes>8192) throw new InputError("Request too large");
    chunks.push(chunk);
  }
  const raw=Buffer.concat(chunks).toString("utf8");
  const data: unknown = req.headers["content-type"]?.startsWith("application/json") ? JSON.parse(raw) : Object.fromEntries(new URLSearchParams(raw));
  if(!data || typeof data!=="object" || Array.isArray(data)) throw new InputError("Invalid request");
  return data as Record<string,unknown>;
}
export function startControl(client: Client, ready:()=>boolean) {
  const key=process.env.RAIBOT_CONTROL_KEY??"";
  const guildId=process.env.RAIBOT_CONTROL_GUILD??"";
  const enabled=process.env.RAIBOT_CONTROL_ENABLED==="true" && key.length>=32 && /^\d+$/.test(guildId);
  const seen=new Set<string>();
  let active=false;
  let attempts:number[]=[];
  const server=createServer(async(req,res)=>{
    if(req.method==="GET"&&req.url==="/health") return json(res,ready()?200:503,{ready:ready(),remote_enabled:enabled});
    if(req.method!=="POST"||req.url!=="/operate") return json(res,404,{error:"not found"});
    if(!enabled) return json(res,403,{error:"remote control disabled"});
    attempts=attempts.filter(t=>Date.now()-t<60000);
    if(attempts.length>=15) return json(res,429,{error:"rate limited"});
    attempts.push(Date.now());
    let data:Record<string,unknown>;
    try { data=await body(req); } catch { return json(res,400,{error:"invalid request"}); }
    if(!authorized(req.headers.authorization?.replace(/^Bearer /,"")??data.key,key)) return json(res,401,{error:"unauthorized"});
    const {request_id:rid,operation:op}=data;
    if(typeof rid!=="string"||!/^[A-Za-z0-9_-]{8,80}$/.test(rid)||!["ping","createchannel","deletemsg"].includes(String(op))) return json(res,400,{error:"invalid operation or request_id"});
    if(!ready()) return json(res,503,{error:"bot not ready"});
    if(seen.has(rid)) return json(res,409,{error:"request_id already used; inspect logs"});
    if(active||seen.size>=5000) return json(res,503,{error:"busy or request capacity reached"});
    seen.add(rid);active=true;
    try {
      const guild=client.guilds.cache.get(guildId);
      if(!guild) throw new InputError("Authorized guild unavailable");
      const target=async()=>{
        if(typeof data.channel_id!=="string"||!/^\d+$/.test(data.channel_id)) throw new InputError("channel_id required");
        const channel=await client.channels.fetch(data.channel_id,{force:true});
        if(!isTextTarget(channel)||channel.guild.id!==guild.id) throw new InputError("Channel outside authorized guild");
        return channel;
      };
      let result:unknown;
      if(op==="ping"){
        const reply=ping();
        if(data.channel_id){
          const channel=await target();
          const sent=await channel.send({content:reply,allowedMentions:{parse:[]}});
          const msg=await channel.messages.fetch({message:sent.id,force:true});
          if(msg.content!==reply||msg.author.id!==client.user?.id) throw new Error("Reply verification failed");
          result={reply,message_id:msg.id,channel_id:channel.id};
        } else result={reply};
      } else if(op==="createchannel") result=await createChannel(client,guild,data.name,data.kind);
      else {
        if(data.confirmation!=="DELETE") throw new InputError("Explicit DELETE confirmation required");
        const raw=data.count;
        const count=quantity(typeof raw==="string"&&/^\d+$/.test(raw)?Number(raw):raw);
        result=await deleteMessages(await target(),count);
      }
      console.log("CONTROL_RESULT",JSON.stringify({request_id:rid,operation:op,result}));
      return json(res,200,{ok:true,request_id:rid,operation:op,result});
    } catch(error) {
      console.error("CONTROL_FAILED",rid,op,error instanceof Error?error.name:"unknown");
      return json(res,error instanceof InputError?400:502,{ok:false,request_id:rid,error:error instanceof InputError?error.message:"Operation failed; inspect state before retry"});
    } finally {active=false;}
  });
  server.listen(Number(process.env.PORT??8080),"0.0.0.0",()=>console.log("CONTROL_LISTENING",JSON.stringify({remote_enabled:enabled})));
  return server;
}
