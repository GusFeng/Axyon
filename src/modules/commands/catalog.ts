import { Fault, Field, Json, Obj } from '../../contracts';
import type { Projection } from '../operations/definitions';
export interface SlashOption {
    name: string;
    description: string;
    type: number;
    required?: boolean;
    choices?: {
        name: string;
        value: string | number;
    }[];
    min_value?: number;
    max_value?: number;
    max_length?: number;
    options?: SlashOption[];
}
export interface SlashRoot {
    name: string;
    description: string;
    type: 1;
    options?: SlashOption[];
    default_member_permissions?: string;
    dm_permission?: boolean;
}
function option(name: string, f: Field): SlashOption { const type = f.type === 'boolean' ? 5 : f.type === 'integer' ? 4 : f.type === 'id' && ['canal', 'categoria'].includes(name) ? 7 : f.type === 'id' && ['pessoa', 'membro', 'autor'].includes(name) ? 6 : f.type === 'id' && name === 'cargo' ? 8 : 3; return { name, description: `${name} (${f.type === 'id' ? 'ID Discord' : f.type})`.slice(0, 100), type, required: !!f.required, ...(f.choices ? { choices: f.choices.map(value => ({ name: String(value), value })) } : {}), ...(type === 4 ? { min_value: f.min, max_value: f.max } : {}), ...(type === 3 ? { max_length: f.type === 'id' ? 20 : f.max ?? 2000 } : {}) }; }
export class CommandCatalog {
    private map = new Map<string, Projection>();
    readonly roots: SlashRoot[];
    constructor(projections: Projection[]) { const roots = new Map<string, SlashRoot>(); for (const p of projections) {
        const key = p.root + (p.sub ? '/' + p.sub : '');
        if (this.map.has(key))
            throw new Fault('duplicate_projection', key);
        this.map.set(key, p);
        const opts = Object.entries(p.options).sort((a, b) => Number(!!b[1].required) - Number(!!a[1].required)).map(([n, f]) => option(n, f));
        let r = roots.get(p.root);
        if (!r) {
            r = { type: 1, name: p.root, description: (p.sub ? `Operações: ${p.root}` : p.description).slice(0, 100), dm_permission: false, options: [] };
            roots.set(p.root, r);
        }
        if (p.sub)
            r.options!.push({ type: 1, name: p.sub, description: p.description.slice(0, 100), options: opts });
        else
            r.options = opts;
        if (['modulos', 'agenda', 'automacao', 'registros', 'sistema', 'diagnostico', 'configurar', 'axyon'].includes(p.root))
            r.default_member_permissions = '32';
    } this.roots = [...roots.values()]; if (this.roots.length > 100 || this.roots.some(r => r.options!.length > 25 || r.options!.some(o => (o.options?.length ?? 0) > 25)))
        throw new Fault('discord_catalog_limit'); }
    resolve(root: string, sub: string | undefined, raw: Obj) { const p = this.map.get(root + (sub ? '/' + sub : '')); if (!p)
        throw new Fault('unknown_command'); return { cap: p.cap, input: { ...raw, ...p.fixed, ...(root === 'createchannel' && raw.tipo === 'text' ? { tipo: 'texto' } : root === 'createchannel' && raw.tipo === 'voice' ? { tipo: 'voz' } : {}) } }; }
    entries() { return [...this.map.values()]; }
    describe() { return this.entries().map(p => `/${p.root}${p.sub ? ' ' + p.sub : ''}: ${p.description}`).join('\n'); }
}

