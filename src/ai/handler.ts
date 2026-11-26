import { Client, Events } from "discord.js";
import { AIConfig, AIError, askAI, configure } from "./client";
import { isTextTarget } from "../operations";

export function mentionPrompt(content:string,id:string):string {
  return content.replace(new RegExp("<@!?"+id+">","g"),"").trim();
}
export function splitReply(reply:string):string[] {
  const characters=Array.from(reply);
  const limit=1900;
  const bounded=characters.length>limit*3 ? characters.slice(0,limit*3-1).concat("…") : characters;
  const result:string[]=[];
  let part="";
  for(const char of bounded){
    if(part.length+char.length>limit){result.push(part);part="";}
    part+=char;
    if(result.length===3) break;
  }
  if(part && result.length<3)result.push(part);
  return result;
}
export function installAI(client:Client) {
  let config:AIConfig|null=null;
  try {config=configure(process.env);} catch(error) {
    console.warn("AI_CONFIGURATION_INVALID",error instanceof AIError?error.kind:"unknown");
  }
  const guildId=process.env.AI_GUILD_ID || process.env.RAIBOT_CONTROL_GUILD;
  console.log("AI_MENTION_HANDLER",JSON.stringify({configured:Boolean(config),guild_scoped:Boolean(guildId),format:config?.format??null}));
  if(config && process.env.AI_STARTUP_CHECK==="true") {
    const current=config;
    client.once(Events.ClientReady,()=>{void askAI(current,"Responda apenas com a palavra OK.").then(reply=>{
      console.log("AI_PROVIDER_VERIFIED",JSON.stringify({model:current.model,nonempty:Boolean(reply.trim())}));
    }).catch(error=>{
      console.warn("AI_PROVIDER_CHECK_FAILED",JSON.stringify({kind:error instanceof AIError?error.kind:"unknown",status:error instanceof AIError?error.status:undefined}));
    });});
  }
  let inFlight=0;
  let recent:number[]=[];
  const active=new Set<string>(), last=new Map<string,number>();
  client.on(Events.MessageCreate,async message=>{
    if(!message.inGuild() || message.author.bot || message.webhookId || !client.user || !guildId || message.guildId!==guildId) return;
    if(!message.mentions.users.has(client.user.id) || !isTextTarget(message.channel)) return;
    const prompt=mentionPrompt(message.content,client.user.id).slice(0,2000);
    if(!prompt) return;
    const now=Date.now(),id=message.author.id;
    recent=recent.filter(t=>now-t<60000);
    for(const [user,t] of last) if(now-t>60000)last.delete(user);
    if(active.has(id) || now-(last.get(id)??0)<5000 || inFlight>=3 || recent.length>=10) return;
    last.set(id,now);recent.push(now);
    const options={allowedMentions:{parse:[] as [],repliedUser:false}};
    if(!config){
      await message.reply({content:"A integração de IA está instalada, mas ainda precisa da configuração do provedor e do modelo.",...options}).catch(()=>{console.warn("AI_NOTICE_FAILED");});
      return;
    }
    active.add(id);inFlight++;
    try {
      await message.channel.sendTyping().catch(()=>undefined);
      const reply=await askAI(config,prompt);
      const parts=splitReply(reply);
      for(let i=0;i<parts.length;i++){
        if(i===0)await message.reply({content:parts[i],...options});
        else await message.channel.send({content:parts[i],...options});
      }
      console.log("AI_REPLY_SENT",JSON.stringify({message_id:message.id,parts:parts.length}));
    } catch(error) {
      console.warn("AI_REPLY_FAILED",JSON.stringify({kind:error instanceof AIError?error.kind:"discord_or_internal_error",status:error instanceof AIError?error.status:undefined}));
      await message.reply({content:"Não consegui consultar a IA agora. Tente novamente mais tarde.",...options}).catch(()=>undefined);
    } finally {active.delete(id);inFlight--;}
  });
}
