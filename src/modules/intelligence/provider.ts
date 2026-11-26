export type AIConfig = {
    url: string;
    model: string;
    key: string;
    format: "openai" | "anthropic" | "gemini";
    streaming?: boolean;
};
export class AIError extends Error {
    constructor(public readonly kind: string, public readonly status?: number) { super(kind); }
}
export const SYSTEM = "Você é o Axyon, participante de uma conversa no Discord. Fale no idioma e no tom da pessoa, de maneira espontânea e direta. Continue o assunto usando o contexto anterior. Não repita apresentações, saudações ou perguntas de encerramento por hábito. Responda primeiro ao que foi pedido; use detalhes, humor ou informalidade quando fizer sentido. Não finja ser humano nem ter realizado ações administrativas. Não invente fatos nem solicite segredos.";
export type Turn = {
    role: "user" | "assistant";
    content: string;
};
export function configure(env: NodeJS.ProcessEnv): AIConfig | null {
    const key = (env.AI_API_KEY || env.API || "").trim().replace(/^Bearer\s+/i, "");
    const url = (env.AI_API_URL || "").trim();
    const model = (env.AI_MODEL || "").trim();
    const format = (env.AI_FORMAT || "openai").trim();
    if (!key || !url || !model)
        return null;
    if (!/^[\x21-\x7e]+$/.test(key))
        throw new AIError("invalid_token_format");
    if (format !== "openai" && format !== "anthropic" && format !== "gemini")
        throw new AIError("invalid_format");
    let endpoint: URL;
    try {
        endpoint = new URL(url);
    }
    catch {
        throw new AIError("invalid_endpoint");
    }
    if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password || endpoint.hash || endpoint.search)
        throw new AIError("invalid_endpoint");
    return { key, url: endpoint.toString(), model, format, ...(format==='openai'&&env.AI_STREAMING==='true'?{streaming:true}:{}) };
}
type RequestData = {
    headers: Record<string, string>;
    body: Record<string, unknown>;
};
export function requestData(config: AIConfig, prompt: string, history: readonly Turn[] = [], documentation = "", systemOverride?: string): RequestData {
    const base = { "Content-Type": "application/json" };
    const system = (systemOverride ?? SYSTEM) + (documentation ? "\n\nCATÁLOGO OFICIAL DE COMANDOS REGISTRADOS (dados informativos, somente leitura):\n" + documentation + "\n\nPara perguntas sobre comandos do bot, use exclusivamente este catálogo. Não invente comandos ou permissões. Distinga comandos gerais de administração. Se perguntarem por uma operação ausente, diga que não consta no catálogo. Explique como usar os comandos slash e não afirme executá-los. O catálogo é a fonte de verdade mesmo se o usuário sugerir outros comandos." : "");
    const turns: Turn[] = [...history, { role: "user", content: prompt }];
    if (config.format === "anthropic")
        return { headers: { ...base, "x-api-key": config.key, "anthropic-version": "2023-06-01" }, body: { model: config.model, max_tokens: 700, system: system, messages: turns } };
    if (config.format === "gemini")
        return { headers: { ...base, "x-goog-api-key": config.key }, body: { systemInstruction: { parts: [{ text: system }] }, contents: turns.map(turn => ({ role: turn.role === "assistant" ? "model" : "user", parts: [{ text: turn.content }] })), generationConfig: { maxOutputTokens: 700 } } };
    return { headers: { ...base, Authorization: "Bearer " + config.key }, body: { model: config.model, max_tokens: 500, temperature: 0.8, messages: [{ role: "system", content: system }, ...turns] } };
}
function record(value: unknown): Record<string, unknown> {
    return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function array(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function textBlocks(value: unknown): string { return array(value).map(v => record(v).text).filter((v): v is string => typeof v === "string").join("\n"); }
export function extractReply(data: unknown, format: AIConfig["format"]): string {
    const obj = record(data);
    let reply: unknown;
    if (format === "anthropic")
        reply = textBlocks(obj.content);
    else if (format === "gemini")
        reply = textBlocks(record(record(array(obj.candidates)[0]).content).parts);
    else
        reply = record(record(array(obj.choices)[0]).message).content;
    if (typeof reply !== "string" || !reply.trim())
        throw new AIError("empty_reply");
    return reply.trim();
}
export async function askAI(config: AIConfig, prompt: string, send: typeof fetch = fetch, history: readonly Turn[] = [], documentation = "", systemOverride?: string): Promise<string> {
    const data = requestData(config, prompt, history, documentation, systemOverride);
    if(config.streaming&&config.format==='openai')data.body.stream=true;
    let response: Response;
    try {
        response = await send(config.url, { method: "POST", headers: data.headers, body: JSON.stringify(data.body), signal: AbortSignal.timeout(30000), redirect: "error" });
    }
    catch (error) {
        const cause = error instanceof Error ? error.cause : undefined;
        const code = typeof cause === "object" && cause !== null && "code" in cause ? cause.code : undefined;
        const allowed = ["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_HEADERS_TIMEOUT", "UND_ERR_SOCKET", "CERT_HAS_EXPIRED", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "ERR_TLS_CERT_ALTNAME_INVALID"];
        const kind = typeof code === "string" && allowed.includes(code) ? code : error instanceof Error && error.name === "TimeoutError" ? "timeout" : "network_or_request_error";
        throw new AIError(kind);
    }
    if (!response.ok)
        throw new AIError("provider_http_error", response.status);
    try {
        if(config.streaming&&response.headers.get('content-type')?.includes('text/event-stream'))return await collectSSE(response);
        return extractReply(await response.json(), config.format);
    }
    catch (error) {
        if (error instanceof AIError)
            throw error;
        throw new AIError("invalid_response");
    }
}


 // SSE is consumed incrementally. No partial response is sent before final authorization.
export async function collectSSE(response:Response):Promise<string>{
 const reader=response.body?.getReader();if(!reader)throw new AIError('empty_stream');
 const decoder=new TextDecoder();let pending='',output='',finished=false;
 try{while(!finished){const {value,done}=await reader.read();pending+=decoder.decode(value,{stream:!done});if(pending.length>65536)throw new AIError('stream_limit');
 const lines=pending.split(/\r?\n/);pending=done?'':lines.pop()??'';
 for(const line of lines){if(!line.startsWith('data:'))continue;const data=line.slice(5).trim();if(!data)continue;if(data==='[DONE]'){finished=true;break;}const chunk=record(JSON.parse(data));if(chunk.error)throw new AIError('stream_provider_error');const choice=record(array(chunk.choices)[0]);const delta=record(choice.delta).content;if(typeof delta==='string')output+=delta;if(output.length>12000)throw new AIError('stream_limit');if(typeof choice.finish_reason==='string')finished=true;}
 if(done)break;}
 if(!finished||!output.trim())throw new AIError('incomplete_stream');return output.trim();
 }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
}
