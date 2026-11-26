import { Store } from '../persistence/store';
// A started receipt from a crashed process is not safe to retry: external effect may have happened.
export function recoverInterrupted(store: Store): number { return Number(store.db.prepare("UPDATE receipts SET status='uncertain' WHERE status='started'").run().changes); }

