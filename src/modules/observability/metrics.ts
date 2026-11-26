import { Store } from '../persistence/store';
import { receiptSignals } from '../security/signals';
export function diagnostics(store: Store, guild: string) { return { uptime_seconds: Math.floor(process.uptime()), memory_mb: Math.round(process.memoryUsage().rss / 1048576), metrics: store.stats(guild), recent: store.recent(guild), uncertain: store.uncertain(guild), securitySignals: receiptSignals(store,guild) }; }
export function log(event: string, fields: Record<string, unknown> = {}) { console.log(JSON.stringify({ time: new Date().toISOString(), event, ...fields })); }

