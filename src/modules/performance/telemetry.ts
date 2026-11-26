import { trace, SpanStatusCode } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
let sdk:NodeSDK|undefined;
export function startTelemetry(){
 if(sdk||!process.env.OTEL_EXPORTER_OTLP_ENDPOINT&&!process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT)return;
 // Bounded exporter; no raw messages, IDs, tokens, URLs or request bodies are attributes.
 process.env.OTEL_METRICS_EXPORTER='none';
 process.env.OTEL_LOGS_EXPORTER='none';
 process.env.OTEL_TRACES_EXPORTER='otlp';
 process.env.OTEL_BSP_MAX_QUEUE_SIZE??='256';
 process.env.OTEL_BSP_MAX_EXPORT_BATCH_SIZE??='32';
 process.env.OTEL_BSP_SCHEDULE_DELAY??='5000';
 process.env.OTEL_BSP_EXPORT_TIMEOUT??='5000';
 process.env.OTEL_SERVICE_NAME??='axyon';
 try{sdk=new NodeSDK({instrumentations:[]});sdk.start();console.log(JSON.stringify({event:'OTEL_STARTED'}));}
 catch{sdk=undefined;console.warn(JSON.stringify({event:'OTEL_START_FAILED'}));}
}
export async function stopTelemetry(){if(sdk){const s=sdk;sdk=undefined;await Promise.race([s.shutdown().catch(()=>{}),new Promise<void>(r=>setTimeout(r,5000).unref())]);}}
export async function span<T>(name:string,fn:()=>Promise<T>):Promise<T>{
 return trace.getTracer('axyon.performance').startActiveSpan(name,async s=>{try{const result=await fn();s.setStatus({code:SpanStatusCode.OK});return result;}catch(e){s.setStatus({code:SpanStatusCode.ERROR});throw e;}finally{s.end();}});
}
