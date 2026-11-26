import { Fault } from '../../contracts';
import { Workflows } from '../workflows/engine';
export class Scheduler {
    constructor(private workflows: Workflows) { }
    private running = false;
    async tick(now = Date.now()) { if (this.running)
        return; this.running = true; try {
        for (const j of this.workflows.store.jobs().filter(j => j.kind === 'schedule' && j.enabled && j.next <= now).slice(0, 20)) {
            try {
                if (!this.workflows.kernel.registry.enabled('scheduler', this.workflows.store.settings(j.guild).value.modules))
                    continue;
                const due = j.next;
                const next = j.interval ? due + Math.max(1, Math.floor((now - due) / j.interval) + 1) * j.interval : 0;
                this.workflows.store.saveJob({ ...j, next, enabled: !!j.interval }, j.revision);
                await this.workflows.fire(j, `schedule:${j.id}:${due}`);
            }
            catch (e) {
                console.warn('SCHEDULE_ERROR', e instanceof Fault ? e.code : 'internal');
            }
        }
    }
    finally {
        this.running = false;
    } }
}

