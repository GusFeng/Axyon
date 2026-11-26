import { Capability, Effect } from '../contracts';
export type Surface = 'rest'|'gateway'|'interactions'|'components'|'oauth-install'|'security'|'activities'|'voice-media'|'webhook-events'|'distribution'|'specialized'|'commerce';
export const surfaces: readonly Surface[] = ['rest','gateway','interactions','components','oauth-install','security','activities','voice-media','webhook-events','distribution','specialized','commerce'];
export interface CapabilityEvidence { id: string; module: string; effect: Effect; implementation: 'registered'; validation: 'not-certified'; access: 'context-dependent'; risk: 'R0'|'R2'|'R3'|'R4'; actorMask: string; ai: boolean; automation: boolean; confirmation: boolean; }
export function capabilityEvidence(cap: Capability): CapabilityEvidence {
    return { id:cap.id,module:cap.module,effect:cap.effect,implementation:'registered',validation:'not-certified',access:'context-dependent',
        risk:cap.effect==='read'?'R0':cap.effect==='destructive'?'R4':cap.confirm?'R3':'R2',
        actorMask:String(cap.actorMask),ai:cap.ai,automation:!!cap.automated,confirmation:!!cap.confirm||cap.effect==='destructive' };
}
