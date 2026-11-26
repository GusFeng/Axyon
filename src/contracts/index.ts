export type Json = null | boolean | number | string | Json[] | {
    [k: string]: Json;
};
export type Obj = {
    [k: string]: Json;
};
export type Source = 'slash' | 'ai' | 'automation' | 'scheduler' | 'component';
export interface Context {
    readonly guild: string;
    readonly channel: string;
    readonly actor: string;
    readonly nonce: string;
    readonly source: Source;
    readonly thread?: boolean;
}
export type Effect = 'read' | 'write' | 'destructive';
export type Risk = 'normal' | 'high';
export interface Field {
    type: 'string' | 'integer' | 'boolean' | 'id';
    required?: boolean;
    min?: number;
    max?: number;
    choices?: readonly (string | number)[];
}
export interface Plan {
    readonly id: string;
    readonly method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    readonly path: string;
    readonly target: Readonly<Record<string, string>>;
    readonly query: Readonly<Record<string, string>>;
    readonly body?: Json;
    readonly actorMask: bigint;
    readonly botMask: bigint;
    readonly effect: Effect;
    readonly reason?: string;
    readonly local?: 'purge' | 'permissions';
}
export interface Capability {
    id: string;
    module: string;
    description: string;
    effect: Effect;
    fields: Readonly<Record<string, Field>>;
    actorMask: bigint;
    ai: boolean;
    automated?: boolean;
    confirm?: boolean;
    plan?: (input: Obj, ctx: Context) => Plan;
    local?: (input: Obj, ctx: Context) => Promise<Json>;
}
export interface Access {
    actor: bigint;
    bot: bigint;
    roles: string[];
    owner: boolean;
    resolvedChannels?: string[];
}
export interface DiscordPort {
    prepare?(plan: Plan, ctx: Context): Promise<Plan>;
    access(ctx: Context, plan?: Plan): Promise<Access>;
    execute(plan: Plan, ctx: Context): Promise<Json>;
    verify(plan: Plan, ctx: Context, result: Json): Promise<Json>;
}
export class Fault extends Error {
    constructor(public readonly code: string, message: string = code) { super(message); this.name = 'Fault'; }
}
export const P = { admin: 8n, manageGuild: 32n, view: 1024n, send: 2048n, manageChannels: 16n, manageRoles: 268435456n, manageMessages: 8192n, history: 65536n, manageWebhooks: 536870912n, manageThreads: 17179869184n } as const;
export const has = (actual: bigint, required: bigint) => Boolean(actual & P.admin) || (actual & required) === required;
export const id = (v: unknown): string => { if (typeof v !== 'string' || !/^\d{17,20}$/.test(v) || BigInt(v) > 18446744073709551615n)
    throw new Fault('invalid_id', 'ID Discord inválido.'); return v; };
export const obj = (v: unknown): Obj => { if (!v || typeof v !== 'object' || Array.isArray(v))
    throw new Fault('invalid_object'); return v as Obj; };
export const str = (v: Json | undefined): string => { if (typeof v !== 'string')
    throw new Fault('invalid_string'); return v; };
export const num = (v: Json | undefined): number => { if (typeof v !== 'number' || !Number.isFinite(v))
    throw new Fault('invalid_number'); return v; };
export const bool = (v: Json | undefined): boolean => { if (typeof v !== 'boolean')
    throw new Fault('invalid_boolean'); return v; };
export function validate(fields: Readonly<Record<string, Field>>, raw: unknown): Obj { const x = obj(raw), out: Obj = Object.create(null); for (const k of Object.keys(x)) {
    if (!Object.hasOwn(fields, k))
        throw new Fault('unknown_field', `Campo não permitido: ${k}`);
} for (const [k, f] of Object.entries(fields)) {
    const v = x[k];
    if (v === undefined) {
        if (f.required)
            throw new Fault('required', `Informe ${k}`);
        continue;
    }
    if (f.type === 'id')
        id(v);
    else if (f.type === 'string') {
        const s = str(v);
        if (s.length < (f.min ?? 1) || s.length > (f.max ?? 2000) || /[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(s))
            throw new Fault('invalid_string', `Valor inválido: ${k}`);
    }
    else if (f.type === 'integer') {
        const n = num(v);
        if (!Number.isSafeInteger(n) || n < (f.min ?? 0) || n > (f.max ?? Number.MAX_SAFE_INTEGER))
            throw new Fault('invalid_integer', `Valor inválido: ${k}`);
    }
    else
        bool(v);
    if (f.choices && !f.choices.some(c => c === v))
        throw new Fault('invalid_choice', `Escolha inválida: ${k}`);
    out[k] = v;
} return out; }
export function canonical(v: Json): string { if (Array.isArray(v))
    return '[' + v.map(canonical).join(',') + ']'; if (v && typeof v === 'object')
    return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical(v[k])).join(',') + '}'; return JSON.stringify(v); }
export function contextKey(c: Context): string { return `${c.guild}:${c.channel}:${c.actor}`; }

