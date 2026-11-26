import { Fault } from '../../contracts';
import { Workflows } from '../workflows/engine';
export class Automation {
    constructor(private workflows: Workflows) { }
    async event(guild: string, channel: string, actor: string, eventId: string, text: string) { if (!this.workflows.kernel.registry.enabled('automation', this.workflows.store.settings(guild).value.modules))
        return; for (const j of this.workflows.store.jobs(guild).filter(j => j.kind === 'event' && j.enabled && j.channel === channel && text.startsWith(j.trigger)).slice(0, 3)) {
        if (j.actor !== actor)
            continue;
        await this.workflows.fire(j, `event:${j.id}:${eventId}`);
    } }
}

