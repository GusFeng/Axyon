import { Capability, Context, DiscordPort, Fault, Json, Obj, Plan, canonical, id, obj, str, validate } from '../contracts';
import { createHash } from 'node:crypto';
import { span } from '../modules/performance/telemetry';
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
function approvalDigest(cap: Capability, input: Obj, plan?: Plan): string {
    const data: Json = { capability: cap.id, module: cap.module, effect: cap.effect, actorMask: String(cap.actorMask), input, plan: plan ? { id: plan.id, method: plan.method, path: plan.path, target: { ...plan.target }, query: { ...plan.query }, body: plan.body ?? null, actorMask: String(plan.actorMask), botMask: String(plan.botMask), effect: plan.effect, reason: plan.reason ?? null, local: plan.local ?? null } : null };
    return createHash('sha256').update(canonical(data)).digest('hex');
}
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
            let approval: Obj | undefined;
            if (token) {
                const p = obj(this.store.consume(ctx, token));
                approval = p;
                if (p.cap !== capId)
                    throw new Fault('confirmation_mismatch');
                input = validate(cap.fields, p.input);
                sealed = p.selection;
                const source = p.source;
                if (source !== 'ai' && source !== 'slash')
                    throw new Fault('confirmation_source');
                effective = { ...ctx, source, thread: p.thread === true };
            }
            const initial = this.store.settings(ctx.guild);
            const config = initial.value;
            let plan = cap.plan?.(input, effective);
            if (plan?.local === 'purge' && token) {
                const selection = obj(sealed);
                plan = { ...plan, body: { ...obj(plan.body), ids: selection.ids } };
            }
            const fast = !plan && cap.effect === 'read' && ['system.ping','system.status'].includes(cap.id) && !token && effective.source === 'slash';
            const access = await span('discord.authorize',()=>this.discord.access(effective, plan, fast ? 'snapshot' : 'fresh'));
            authorize(this.registry, config, cap, effective, access, plan);
            if (!token && needsConfirmation(cap, effective) && !(effective.source === 'ai' && config.ai.dryRun)) {
                if (plan && this.discord.prepare)
                    plan = await this.discord.prepare(plan, effective);
                if (effective.source === 'automation' || effective.source === 'scheduler')
                    throw new Fault('confirmation_required');
                if (!this.store.claim(ctx.guild, ctx.nonce))
                    throw new Fault('duplicate');
                claimed = true;
                const confirmation = this.store.confirmation(ctx, { cap: cap.id, input, source: effective.source, thread: !!effective.thread, selection: plan?.local === 'purge' ? obj(plan.body) : null, revision: initial.revision, digest: approvalDigest(cap, input, plan) });
                this.store.finish(ctx.guild, ctx.nonce, 'done');
                claimed = false;
                status = 'confirmation';
                return { status: 'confirmation', token: confirmation, summary: `${cap.description}\n${JSON.stringify(plan?.local === 'purge' ? plan.body : input).slice(0, 900)}` };
            }
            if (!this.store.claim(ctx.guild, ctx.nonce))
                throw new Fault('duplicate', 'Evento já processado.');
            claimed = true;
            // Reads have no asynchronous gap between this authorization and dispatch.
            // Writes and confirmed operations retain an independent fresh verification.
            const freshAccess = cap.effect === 'read' && !token ? access : await span('discord.revalidate',()=>this.discord.access(effective, plan, 'fresh'));
            const current = this.store.settings(ctx.guild);
            const fresh = current.value;
            authorize(this.registry, fresh, cap, effective, freshAccess, plan);
            if (approval && (approval.revision !== current.revision || approval.digest !== approvalDigest(cap, input, plan)))
                throw new Fault('approval_stale', 'O plano ou a política mudou. Solicite nova confirmação.');
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
                result = await span('discord.execute',()=>this.discord.execute(plan!, effective));
                const returned=result;result = await span('discord.verify',()=>this.discord.verify(plan!, effective, returned));
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

