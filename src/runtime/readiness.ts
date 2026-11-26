import { Fault } from '../contracts';

// Liveness is separate from operational readiness. The latter gates new ingress
// and scheduled effects, and must never report ready during shutdown.
export function operationalReadiness(initialized: boolean, connected: boolean, stopping: boolean): boolean {
    return initialized && connected && !stopping;
}

export function assertDatabaseIntegrity(check: () => readonly { quick_check?: unknown }[]): void {
    let rows: readonly { quick_check?: unknown }[];
    try { rows = check(); } catch { throw new Fault('database_integrity_failed'); }
    if (rows.length !== 1 || rows[0].quick_check !== 'ok')
        throw new Fault('database_integrity_failed');
}
