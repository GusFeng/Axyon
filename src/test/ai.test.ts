import test from "node:test";
import assert from "node:assert/strict";
import { configure, requestData, extractReply, askAI, AIConfig, AIError } from "../ai/client";
import { mentionPrompt, splitReply } from "../ai/handler";
const env={API:"test-secret",AI_API_URL:"https://example.com/v1/chat/completions",AI_MODEL:"test-model"};
const config:AIConfig={key:"test-secret",url:env.AI_API_URL,model:env.AI_MODEL,format:"openai"};
test("no provider configuration means no AI requests",()=>assert.equal(configure({API:"test-secret"}),null));
test("accept existing API variable",()=>assert.deepEqual(configure(env),config));
test("reject insecure endpoint",()=>assert.throws(()=>configure({...env,AI_API_URL:"http://example.com"}),AIError));
test("openai-compatible request",()=>{const request=requestData(config,"olá");assert.equal(request.headers.Authorization,"Bearer test-secret");assert.equal(request.body.model,"test-model");});
test("provider formats",()=>{assert.equal(requestData({...config,format:"anthropic"},"oi").headers["x-api-key"],config.key);assert.equal(requestData({...config,format:"gemini"},"oi").headers["x-goog-api-key"],config.key);});
test("parse provider responses",()=>{assert.equal(extractReply({choices:[{message:{content:"oi"}}]},"openai"),"oi");assert.equal(extractReply({content:[{text:"oi"}]},"anthropic"),"oi");assert.equal(extractReply({candidates:[{content:{parts:[{text:"oi"}]}}]},"gemini"),"oi");assert.throws(()=>extractReply({},"openai"),AIError);});
test("API call uses configured endpoint and rejects redirects",async()=>{const mock:typeof fetch=async(input,init)=>{assert.equal(input,config.url);assert.equal(init?.redirect,"error");return new Response(JSON.stringify({choices:[{message:{content:"Olá!"}}]}));};assert.equal(await askAI(config,"oi",mock),"Olá!");});
test("HTTP error is handled without exposing credentials",async()=>{const mock:typeof fetch=async()=>new Response("secret body",{status:401});await assert.rejects(askAI(config,"oi",mock),(error:unknown)=>error instanceof AIError&&error.status===401&&error.message==="provider_http_error");});
test("mention removal",()=>assert.equal(mentionPrompt("<@123> olá <@!123>","123"),"olá"));
test("Discord reply length limit",()=>{const parts=splitReply("😀".repeat(5000));assert.ok(parts.length<=3);assert.ok(parts.every(p=>p.length<=1900));});

test("conversation context is included in provider requests",()=>{const history=[{role:"user" as const,content:"Meu nome é Ana"},{role:"assistant" as const,content:"Oi Ana"}];const request=requestData(config,"Qual meu nome?",history);assert.deepEqual((request.body.messages as unknown[]).slice(1),[...history,{role:"user",content:"Qual meu nome?"}]);});

test("official catalog is included in system context, not user message",()=>{const request=requestData(config,"quais comandos?",[],"/ping");const messages=request.body.messages as {role:string;content:string}[];assert.equal(messages[0].role,"system");assert.ok(messages[0].content.includes("CATÁLOGO OFICIAL"));assert.ok(messages[0].content.includes("/ping"));assert.equal(messages[1].content,"quais comandos?");});
