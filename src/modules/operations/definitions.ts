import { Capability, Context, Effect, Fault, Field, Json, Obj, Plan, P, id, str, num } from '../../contracts';
import { historicalOperations } from './reference';
export const fields = { s: (required = true, max = 100): Field => ({ type: 'string', required, max }), i: (required = true, min = 0, max = 100): Field => ({ type: 'integer', required, min, max }), b: (required = false): Field => ({ type: 'boolean', required }), id: (required = true): Field => ({ type: 'id', required }), choice: (choices: readonly (string | number)[], required = true): Field => ({ type: typeof choices[0] === 'number' ? 'integer' : 'string', required, choices }) };
export const f = fields;
const refs = new Map<string, typeof historicalOperations[number]>(historicalOperations.map(r => [r.id, r]));
export interface Projection {
    root: string;
    sub?: string;
    cap: string;
    description: string;
    options: Record<string, Field>;
    rename?: Record<string, string>;
    fixed?: Obj;
}
export const projections: Projection[] = [];
export const operations: Capability[] = [];
const owner = (domain: string) => ['moderacao', 'automod', 'auditoria'].includes(domain) ? 'moderation' : 'administration';
interface Def {
    path: string;
    operation: string;
    description: string;
    options?: Record<string, Field>;
    target?: Record<string, string>;
    query?: Record<string, string>;
    body?: (i: Obj, c: Context) => Json;
    ai?: boolean;
    automated?: boolean;
    confirm?: boolean;
    effect?: Effect;
    local?: Plan['local'];
    extra?: bigint;
    alias?: string;
    fixed?: Obj;
}
export const copy = (input: Obj, mapping: Record<string, string>): Obj => Object.fromEntries(Object.entries(mapping).filter(([k]) => input[k] !== undefined).map(([k, v]) => [v, input[k]]));
export const channel = (i: Obj, c: Context) => id(i.canal ?? c.channel);
export const channelTarget = { channel: 'canal' }, messageTarget = { channel: 'canal', message: 'mensagem' }, memberTarget = { user: 'pessoa' }, roleTarget = { role: 'cargo' }, threadTarget = { channel: 'topico' }, eventTarget = { event: 'id' }, ruleTarget = { rule: 'regra' };
export const cOpt = { canal: f.id(false) }, mOpt = { mensagem: f.id(), ...cOpt }, memberOpt = { pessoa: f.id() }, roleOpt = { cargo: f.id() }, threadOpt = { topico: f.id() }, eventOpt = { id: f.id() }, ruleOpt = { regra: f.id() }, reason = { motivo: f.s(false, 400) };
export function define(d: Def) { const ref = refs.get('discord.' + d.operation); if (!ref)
    throw new Error('unknown legacy op ' + d.operation); const [root, sub] = d.path.split('/'); const capId = 'discord.' + d.operation + (d.alias ? '.' + d.alias : ''); const options = d.options ?? {}; const effect = d.effect ?? ref.effect; const mask = (d.operation === 'update-guild-member' && d.extra ? d.extra : BigInt(ref.actor)) | (d.extra ?? 0n); const botMask = (d.operation === 'update-guild-member' && d.extra ? d.extra : BigInt(ref.bot)) | (d.extra ?? 0n); const c: Capability = { id: capId, module: owner(ref.domain), description: d.description, effect, fields: options, actorMask: mask, ai: d.ai ?? false, automated: d.automated, confirm: d.confirm ?? ref.confirm, plan: (input, ctx) => { const t: Record<string, string> = { guild: ctx.guild }; const mapping = d.target ?? {}; for (const key of [...ref.route.matchAll(/\{(\w+)\}/g)].map(x => x[1])) {
        if (key === 'guild')
            continue;
        const name = mapping[key] ?? key;
        const value = input[name] ?? (key === 'channel' && name === 'canal' ? ctx.channel : undefined);
        if (key === 'answer') {
            t[key] = String(num(value));
            continue;
        }
        if (key === 'code' || key === 'emoji') {
            const v = str(value);
            if (!v || v.length > 100 || /[\x00-\x1f/\\?#]/.test(v) || v === '.' || v === '..')
                throw new Fault('invalid_path');
            t[key] = v;
        }
        else
            t[key] = id(value);
    } const path = ref.route.replace(/\{(\w+)\}/g, (_, k: string) => encodeURIComponent(t[k])); const q: Record<string, string> = {}; for (const [k, v] of Object.entries(d.query ?? {}))
        if (input[k] !== undefined) {
            if (!(ref.query as readonly string[]).includes(v))
                throw new Fault('query_not_allowed', v);
            q[v] = String(input[k]);
        } const body = d.body?.(input, ctx); if (ref.method === 'PATCH' && body && typeof body === 'object' && !Array.isArray(body) && !Object.keys(body).length)
        throw new Fault('empty_update'); return { id: capId, method: ref.method as Plan['method'], path, target: t, query: q, body, actorMask: mask, botMask, effect, reason: typeof input.motivo === 'string' ? input.motivo : undefined, local: d.local ?? (['get-channel-member-permissions', 'get-channel-role-permissions', 'get-guild-member-permissions', 'get-guild-role-permissions'].includes(d.operation) ? 'permissions' : undefined) }; } }; operations.push(c); projections.push({ root, sub, cap: capId, description: d.description, options, fixed: d.fixed }); }
export function read(path: string, operation: string, description: string, options: Record<string, Field> = {}, target?: Record<string, string>, query?: Record<string, string>, ai = false) { define({ path, operation, description, options, target, query, ai }); }
export function write(path: string, operation: string, description: string, options: Record<string, Field> = {}, target?: Record<string, string>, body?: Def['body'], extra: Partial<Def> = {}) { define({ path, operation, description, options, target, body, ...extra }); }

