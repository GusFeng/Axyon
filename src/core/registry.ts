import { Capability, Fault } from '../contracts';
export interface Module {
    id: string;
    essential?: boolean;
    dependencies: readonly string[];
    capabilities: readonly Capability[];
    start?: () => Promise<void>;
    stop?: () => Promise<void>;
}
export class Registry {
    private modules = new Map<string, Module>();
    private caps = new Map<string, Capability>();
    private order: string[] = [];
    private sealed = false;
    register(m: Module) { if (this.sealed || this.modules.has(m.id))
        throw new Fault('duplicate_module', m.id); const ids = new Set<string>();
    const caps = m.capabilities.map(c => {
        if (c.module !== m.id || this.caps.has(c.id) || ids.has(c.id))
            throw new Fault('duplicate_capability', c.id);
        ids.add(c.id);
        const fields = Object.freeze(Object.fromEntries(Object.entries(c.fields).map(([key, field]) =>
            [key, Object.freeze({ ...field, ...(field.choices ? { choices: Object.freeze([...field.choices]) } : {}) })])));
        return Object.freeze({ ...c, fields });
    });
    // Publish only after the entire module validates, so a rejected module
    // cannot leave orphan capabilities or retain mutable manifest references.
    for (const c of caps) this.caps.set(c.id, c);
    this.modules.set(m.id, Object.freeze({ ...m, dependencies:Object.freeze([...m.dependencies]), capabilities:Object.freeze(caps) })); }
    seal() { const visiting = new Set<string>(), done = new Set<string>(); const visit = (key: string) => { if (visiting.has(key))
        throw new Fault('dependency_cycle', key); if (done.has(key))
        return; const m = this.modules.get(key); if (!m)
        throw new Fault('missing_dependency', key); visiting.add(key); for (const dep of m.dependencies) {
        const d = this.modules.get(dep);
        if (m.essential && !d?.essential)
            throw new Fault('essential_dependency', dep);
        visit(dep);
    } visiting.delete(key); done.add(key); this.order.push(key); }; for (const key of this.modules.keys())
        visit(key); this.sealed = true; return this; }
    get(id: string) { const c = this.caps.get(id); if (!c)
        throw new Fault('unknown_capability', id); return c; }
    list() { return [...this.caps.values()]; }
    manifest() { return this.order.map(id => this.modules.get(id)!); }
    enabled(id: string, states: Record<string, boolean>): boolean { const m = this.modules.get(id); if (!m)
        return false; return !!m.essential || (states[id] !== false && m.dependencies.every(d => this.enabled(d, states))); }
    async start() { if (!this.sealed)
        throw new Fault('registry_unsealed'); const started: Module[] = []; try {
        for (const m of this.manifest()) {
            await m.start?.();
            started.push(m);
        }
    }
    catch (e) {
        for (const m of started.reverse())
            await m.stop?.().catch(() => { });
        throw e;
    } }
    async stop() { for (const m of this.manifest().reverse())
        await m.stop?.(); }
}

