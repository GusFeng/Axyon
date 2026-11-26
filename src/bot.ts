import { main } from './runtime/gateway';
import { Fault } from './contracts';
void main().catch(e => { console.error('START_FAILED', e instanceof Fault ? e.code : e instanceof Error ? e.name : 'unknown'); process.exitCode = 1; });

