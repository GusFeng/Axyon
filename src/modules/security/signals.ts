import { id } from '../../contracts';
import { Store } from '../persistence/store';
export type ReceiptSignal = { type:'uncertain_effects'; count:number; severity:'review'; confidence:'observed-local'; response:'manual-review'; }
// No raw event, message, token, or user ID is exposed. Uncertainty is not an attack.
export function receiptSignals(store:Store,guild:string):ReceiptSignal[] {
    id(guild);
    const count=store.uncertain(guild);
    return count>0?[{type:'uncertain_effects',count,severity:'review',confidence:'observed-local',response:'manual-review'}]:[];
}
