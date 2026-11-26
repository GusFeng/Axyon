import { Fault, id } from '../../contracts';
export interface Settings {
    modules: Record<string, boolean>;
    ai: {
        enabled: boolean;
        mode: 'chat' | 'read' | 'operate';
        mentions: boolean;
        direct: string[];
        blocked: string[];
        allowUsers: string[];
        denyUsers: string[];
        allowRoles: string[];
        denyRoles: string[];
        memory: boolean;
        retentionMinutes: number;
        language: string;
        style: string;
        personality: string;
        domains: string[];
        emergency: boolean;
        dryRun: boolean;
        dms: boolean;
        threads: boolean;
    };
    protectedChannels: string[];
    protectedRoles: string[];
    protectedUsers: string[];
}
export const defaults = (): Settings => ({ modules: {}, ai: { enabled: true, mode: 'chat', mentions: true, direct: [], blocked: [], allowUsers: [], denyUsers: [], allowRoles: [], denyRoles: [], memory: false, retentionMinutes: 30, language: 'pt-BR', style: 'direto', personality: '', domains: [], emergency: false, dryRun: false, dms: false, threads: true }, protectedChannels: [], protectedRoles: [], protectedUsers: [] });
export function editSetting(s: Settings, key: string, value: string): Settings { const n = structuredClone(s); const a = n.ai; const yes = () => { if (value !== 'true' && value !== 'false')
    throw new Fault('invalid_boolean'); return value === 'true'; }; const list = () => { const values = value.split(',').map(x => x.trim()).filter(Boolean); if (values.length > 50)
    throw new Fault('too_many_ids'); return [...new Set(values.map(id))]; }; switch (key) {
    case 'enabled':
    case 'mentions':
    case 'memory':
    case 'emergency':
    case 'dryRun':
    case 'dms':
    case 'threads':
        a[key] = yes();
        break;
    case 'mode':
        if (value !== 'chat' && value !== 'read' && value !== 'operate')
            throw new Fault('invalid_mode');
        a.mode = value;
        break;
    case 'direct':
    case 'blocked':
    case 'allowUsers':
    case 'denyUsers':
    case 'allowRoles':
    case 'denyRoles':
        a[key] = list();
        break;
    case 'protectedChannels':
    case 'protectedRoles':
    case 'protectedUsers':
        n[key] = list();
        break;
    case 'retentionMinutes': {
        const v = Number(value);
        if (!Number.isInteger(v) || v < 1 || v > 1440)
            throw new Fault('invalid_retention');
        a.retentionMinutes = v;
        break;
    }
    case 'language':
    case 'style':
    case 'personality':
        if (value.length > (key === 'personality' ? 1000 : 80))
            throw new Fault('too_long');
        a[key] = value;
        break;
    case 'domains': {
        const v = value.split(',').map(x => x.trim()).filter(Boolean);
        if (v.length > 30 || v.some(x => !/^[a-z][a-z0-9-]{0,30}$/.test(x)))
            throw new Fault('invalid_domain');
        a.domains = [...new Set(v)];
        break;
    }
    default: throw new Fault('unknown_setting', key);
} return n; }
export function allowedAI(s: Settings, actor: string, roles: string[], channel: string, mention: boolean, thread: boolean): boolean { const a = s.ai; return a.enabled && !a.emergency && !a.blocked.includes(channel) && (!thread || a.threads) && (a.direct.includes(channel) || (mention && a.mentions)) && !a.denyUsers.includes(actor) && !roles.some(r => a.denyRoles.includes(r)) && (!a.allowUsers.length && !a.allowRoles.length || a.allowUsers.includes(actor) || roles.some(r => a.allowRoles.includes(r))); }

