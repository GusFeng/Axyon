export type AIConfig = { url: string; model: string; key: string; format: "openai" | "anthropic" | "gemini" };
export class AIError extends Error {
  constructor(public readonly kind: string, public readonly status?: number) { super(kind); }
}
export const SYSTEM = "Você é o assistente do bot Buteco no Discord. Responda naturalmente no idioma do usuário, com clareza. Não afirme ter executado ações administrativas; você apenas conversa. Não invente dados nem solicite segredos.";
export function configure(env: NodeJS.ProcessEnv): AIConfig | null {
  const key=(env.AI_API_KEY || env.API || "").trim();
  const url=(env.AI_API_URL || "").trim();
  const model=(env.AI_MODEL || "").trim();
  const format=(env.AI_FORMAT || "openai").trim();
  if (!key || !url || !model) return null;
  if(format!=="openai" && format!=="anthropic" && format!=="gemini") throw new AIError("invalid_format");
  let endpoint: URL;
  try { endpoint=new URL(url); } catch { throw new AIError("invalid_endpoint"); }
  if(endpoint.protocol!=="https:" || endpoint.username || endpoint.password || endpoint.hash || endpoint.search)
    throw new AIError("invalid_endpoint");
  return {key,url:endpoint.toString(),model,format};
}
type RequestData = {headers:Record<string,string>; body:Record<string,unknown>};
export function requestData(config:AIConfig, prompt:string):RequestData {
  const base={"Content-Type":"application/json"};
  if(config.format==="anthropic") return {headers:{...base,"x-api-key":config.key,"anthropic-version":"2023-06-01"},body:{model:config.model,max_tokens:700,system:SYSTEM,messages:[{role:"user",content:prompt}]}};
  if(config.format==="gemini") return {headers:{...base,"x-goog-api-key":config.key},body:{systemInstruction:{parts:[{text:SYSTEM}]},contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:700}}};
  return {headers:{...base,Authorization:"Bearer "+config.key},body:{model:config.model,messages:[{role:"system",content:SYSTEM},{role:"user",content:prompt}]}};
}
function record(value:unknown):Record<string,unknown> {
  return value!==null && typeof value==="object" && !Array.isArray(value) ? value as Record<string,unknown> : {};
}
function array(value:unknown):unknown[] {return Array.isArray(value)?value:[];}
function textBlocks(value:unknown):string {return array(value).map(v=>record(v).text).filter((v):v is string=>typeof v==="string").join("\n");}
export function extractReply(data:unknown,format:AIConfig["format"]):string {
  const obj=record(data);
  let reply:unknown;
  if(format==="anthropic") reply=textBlocks(obj.content);
  else if(format==="gemini") reply=textBlocks(record(record(array(obj.candidates)[0]).content).parts);
  else reply=record(record(array(obj.choices)[0]).message).content;
  if(typeof reply!=="string"||!reply.trim()) throw new AIError("empty_reply");
  return reply.trim();
}
export async function askAI(config:AIConfig,prompt:string,send:typeof fetch=fetch):Promise<string> {
  const data=requestData(config,prompt);
  let response:Response;
  try {response=await send(config.url,{method:"POST",headers:data.headers,body:JSON.stringify(data.body),signal:AbortSignal.timeout(30000),redirect:"error"});}
  catch {throw new AIError("network_or_timeout");}
  if(!response.ok) throw new AIError("provider_http_error",response.status);
  try {return extractReply(await response.json(),config.format);}
  catch(error) {if(error instanceof AIError)throw error;throw new AIError("invalid_response");}
}
