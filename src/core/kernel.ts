import { Capability, Context, DiscordPort, Fault, Json, Obj, id, obj, str, validate } from '../contracts';
import { Store } from '../modules/persistence/store';
import { Registry } from './registry';
import { authorize, needsConfirmation } from '../modules/security/policy';
export type Outcome = {
    status: 'ok' | 'simulation';
    data: Json;
} | {
    status: 'confirmation';
    token: string;
    summary: string;
};
export class Kernel {
    constructor(readonly registry: Registry, readonly store: Store, readonly discord: DiscordPort) { }
    async execute(capId: string, raw: unknown, ctx: Context, token?: string): Promise<Outcome> {
        const start = performance.now();
        let status = 'denied', claimed = false;
        try {
            id(ctx.guild);
            id(ctx.channel);
            id(ctx.actor);
            if (!['slash', 'ai', 'automation', 'scheduler', 'component'].includes(ctx.source))
                throw new Fault('invalid_source');
            if (!ctx.nonce || ctx.nonce.length > 200)
                throw new Fault('invalid_nonce');
            let cap: Capability = this.registry.get(capId);
            let input: Obj = token ? {} : validate(cap.fields, raw);
            let effective = ctx;
            let sealed: Json | undefined;
            if (token) {
                const p = obj(this.store.consume(ctx, token));
                if (p.cap !== capId)
                    throw new Fault('confirmation_mismatch');
                input = validate(cap.fields, p.input);
                sealed = p.selection;
                const source = p.source;
                if (source !== 'ai' && source !== 'slash')
                    throw new Fault('confirmation_source');
                effective = { ...ctx, source, thread: p.thread === true };
            }
            const config = this.store.settings(ctx.guild).value;
            let plan = cap.plan?.(input, effective);
            if (plan?.local === 'purge' && token) {
                const selection = obj(sealed);
                plan = { ...plan, body: { ...obj(plan.body), ids: selection.ids } };
            }
            const access = await this.discord.access(effective, plan);
            authorize(this.registry, config, cap, effective, access, plan);
            if (!token && needsConfirmation(cap, effective) && !(effective.source === 'ai' && config.ai.dryRun)) {
                if (plan && this.discord.prepare)
                    plan = await this.discord.prepare(plan, effective);
                if (effective.source === 'automation' || effective.source === 'scheduler')
                    throw new Fault('confirmation_required');
                if (!this.store.claim(ctx.guild, ctx.nonce))
                    throw new Fault('duplicate');
                claimed = true;
                const confirmation = this.store.confirmation(ctx, { cap: cap.id, input, source: effective.source, thread: !!effective.thread, selection: plan?.local === 'purge' ? obj(plan.body) : null });
                this.store.finish(ctx.guild, ctx.nonce, 'done');
                claimed = false;
                status = 'confirmation';
                return { status: 'confirmation', token: confirmation, summary: `${cap.description}\n${JSON.stringify(plan?.local === 'purge' ? plan.body : input).slice(0, 900)}` };
            }
            if (!this.store.claim(ctx.guild, ctx.nonce))
                throw new Fault('duplicate', 'Evento já processado.');
            claimed = true;
            const freshAccess = await this.discord.access(effective, plan);
            const fresh = this.store.settings(ctx.guild).value;
            authorize(this.registry, fresh, cap, effective, freshAccess, plan);
            if (!token && effective.source === 'ai' && config.ai.dryRun && !fresh.ai.dryRun && cap.effect !== 'read')
                throw new Fault('simulation_changed');
            if (effective.source === 'ai' && fresh.ai.dryRun && cap.effect !== 'read') {
                this.store.finish(ctx.guild, ctx.nonce, 'done');
                claimed = false;
                status = 'simulation';
                return { status: 'simulation', data: { capability: cap.id, input } };
            }
            let result: Json;
            if (plan) {
                status = 'executing';
                result = await this.discord.execute(plan, effective);
                result = await this.discord.verify(plan, effective, result);
            }
            else if (cap.local) {
                status = 'executing';
                result = await cap.local(input, effective);
            }
            else
                throw new Fault('no_executor');
            this.store.finish(ctx.guild, ctx.nonce, 'done');
            claimed = false;
            status = 'ok';
            return { status: 'ok', data: result };
        }
        catch (e) {
            if (claimed)
                this.store.finish(ctx.guild, ctx.nonce, status === 'executing' ? 'uncertain' : 'failed');
            status = status === 'executing' ? 'uncertain' : 'denied';
            throw e;
        }
        finally {
            try {
                this.store.audit(ctx, capId, status, performance.now() - start);
            }
            catch {
                console.error('AUDIT_WRITE_FAILED');
            }
        }
    }
    async confirmToken(ctx: Context, token: string) { const cap = str(obj(this.store.peekConfirmation(ctx, token)).cap); return this.execute(cap, {}, ctx, token); }
    async confirm(ctx: Context, token: string, capId: string) { return this.execute(capId, {}, ctx, token); }
    cancel(ctx: Context, token: string) { this.store.consume(ctx, token); return { cancelled: true }; }
}

