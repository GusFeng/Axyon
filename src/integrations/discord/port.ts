import { Access, Context, DiscordPort, Fault, Json, Obj, P, Plan, has, id, obj, str } from '../../contracts';
import { SnapshotCache } from '../../modules/performance/cache';
// A narrow structural boundary for discord.js. No SDK object enters the kernel.
export interface Bits {
    bitfield: bigint;
}
export interface Role {
    id: string;
    managed: boolean;
    permissions: Bits;
    comparePositionTo(other: Role): number;
}
export interface Member {
    id: string;
    permissions: Bits;
    roles: {
        cache: {
            keys(): IterableIterator<string>;
        };
        highest: Role;
    };
}
export interface Channel {
    id: string;
    guildId: string;
    type: number;
    parentId?: string | null;
    permissionsFor(m: Member | Role): Bits | null;
    isThread?(): boolean;
}
export interface Guild {
    id: string;
    ownerId: string;
    members: {
        fetch(options: {
            user: string;
            force: boolean;
        }): Promise<Member>;
        fetchMe(options?: {
            force: boolean;
        }): Promise<Member>;
    };
    channels: {
        fetch(id: string, options?: {
            force: boolean;
        }): Promise<Channel | null>;
    };
    roles: {
        fetch(id: string, options?: {
            force: boolean;
        }): Promise<Role | null>;
    };
}
export interface Rest {
    get(path: string, options?: RestOptions): Promise<unknown>;
    post(path: string, options?: RestOptions): Promise<unknown>;
    put(path: string, options?: RestOptions): Promise<unknown>;
    patch(path: string, options?: RestOptions): Promise<unknown>;
    delete(path: string, options?: RestOptions): Promise<unknown>;
}
interface RestOptions {
    body?: unknown;
    query?: URLSearchParams;
    reason?: string;
}
export interface ClientPort {
    user: {
        id: string;
    } | null;
    guilds: {
        fetch(id: string): Promise<Guild>;
    };
    rest: Rest;
}
const member = (g: Guild, user: string) => g.members.fetch({ user, force: true });
function object(v: unknown): Record<string, unknown> { return v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {}; }
const permissions = (ch: Channel, m: Member | Role) => ch.permissionsFor(m)?.bitfield ?? 0n;
const SAFE_KEYS = new Set(['id', 'name', 'type', 'guild_id', 'channel_id', 'parent_id', 'position', 'topic', 'nsfw', 'rate_limit_per_user', 'archived', 'locked', 'username', 'global_name', 'nick', 'user', 'roles', 'color', 'permissions', 'managed', 'mentionable', 'hoist', 'status', 'description', 'enabled', 'scheduled_start_time', 'scheduled_end_time', 'member_count', 'user_count', 'approximate_member_count', 'approximate_presence_count', 'content', 'author', 'timestamp', 'edited_timestamp', 'pinned', 'messages', 'items', 'threads', 'members', 'sound_id', 'volume', 'emoji_name', 'emoji_id', 'available', 'expires_at', 'code', 'max_age', 'max_uses', 'uses', 'temporary', 'verification_level', 'communication_disabled_until', 'mute', 'deaf', 'audit_log_entries', 'action_type', 'target_id', 'user_id', 'reason', 'permissions_effective', 'deleted', 'requested', 'skipped', 'verified', 'result', 'count', 'recipient_count', 'name_localizations', 'max_members', 'default_auto_archive_duration', 'invites_disabled_until', 'dms_disabled_until', 'users', 'pruned', 'counts', 'poll', 'answers', 'question', 'text', 'allow_multiselect', 'results']);
export function publicData(v: unknown, depth = 0): Json { if (depth > 5)
    return null; if (v === null || typeof v === 'boolean')
    return v; if (typeof v === 'string')
    return v.slice(0, 1000); if (typeof v === 'number')
    return Number.isFinite(v) ? v : null; if (Array.isArray(v))
    return v.slice(0, 25).map(x => publicData(x, depth + 1)); if (v && typeof v === 'object') {
    const result: Obj = {};
    for (const [k, x] of Object.entries(v))
        if (SAFE_KEYS.has(k))
            result[k] = publicData(x, depth + 1);
    return result;
} return null; }
export class DiscordAdapter implements DiscordPort {
    private snapshots=new SnapshotCache<Access>();
    private totals={calls:0,fresh:0,ms:0};
    constructor(private client: ClientPort,private gatewayHealthy:()=>boolean=()=>false) { }
    invalidate(){this.snapshots.invalidate();}
    performance(){return {...this.totals,...this.snapshots.counters};}
    private async channel(g: Guild, channel: string): Promise<Channel> { const c = await g.channels.fetch(id(channel), { force: true }); if (!c || c.guildId !== g.id)
        throw new Fault('channel_scope', 'Canal não pertence ao servidor.'); return c; }
    private async identities(c: Context) { const g = await this.client.guilds.fetch(c.guild); if (g.id !== c.guild)
        throw new Fault('guild_scope'); const [a, b] = c.actor===this.client.user?.id ? await g.members.fetchMe({force:true}).then(m=>[m,m] as const) : await Promise.all([member(g, c.actor), g.members.fetchMe({ force: true })]); return { g, a, b }; }
    async access(ctx: Context, plan?: Plan, mode:'fresh'|'snapshot'='fresh'): Promise<Access> {
        const start=performance.now();this.totals.calls++;
        try {if(mode==='snapshot'&&!plan&&this.gatewayHealthy())return await this.snapshots.get(ctx.guild+':'+ctx.channel+':'+ctx.actor,()=>this.accessFresh(ctx));return await this.accessFresh(ctx,plan);}
        finally{this.totals.ms+=Math.round(performance.now()-start);}
    }
    private async accessFresh(ctx:Context,plan?:Plan):Promise<Access>{
        this.totals.fresh++;
        const g=await this.client.guilds.fetch(ctx.guild);if(g.id!==ctx.guild)throw new Fault('guild_scope');
        const self=g.members.fetchMe({force:true});
        const [a,b,origin]=await Promise.all([ctx.actor===this.client.user?.id?self:member(g,ctx.actor),self,this.channel(g,ctx.channel)]);
        if (!has(permissions(origin, a), P.view) || !has(permissions(origin, b), P.view))
            throw new Fault('origin_access');
        const resolvedChannels: string[] = [];
        let actor = a.permissions.bitfield, bot = b.permissions.bitfield;
        const owner = g.ownerId === a.id;
        if (plan) {
            const t = plan.target;
            const target = t.channel ? t.channel===origin.id ? origin : await this.channel(g, t.channel) : null;
            if (target) {
                resolvedChannels.push(target.id);
                actor = permissions(target, a);
                bot = permissions(target, b);
                if (!has(actor, P.view) || !has(bot, P.view))
                    throw new Fault('channel_access');
                if (target.isThread?.() && plan.effect !== 'read' && !has(actor, 1n << 38n) && plan.id === 'discord.create-message')
                    throw new Fault('thread_send_permission');
                if (target.isThread?.() && plan.id === 'discord.create-message' && !has(bot, 1n << 38n))
                    throw new Fault('thread_bot_send_permission');
            }
            const body = object(plan.body);
            const other = new Set<string>();
            for (const k of ['parent_id', 'channel_id', 'webhook_channel_id'])
                if (typeof body[k] === 'string')
                    other.add(id(body[k]));
            if (Array.isArray(plan.body) && plan.id !== 'discord.bulk-update-guild-roles')
                for (const item of plan.body) {
                    const o = object(item);
                    if (typeof o.id === 'string')
                        other.add(id(o.id));
                }
            for (const cid of other) {
                const ch = cid===origin.id?origin:target?.id===cid?target:await this.channel(g, cid);
                resolvedChannels.push(ch.id);
                const mask = plan.id === 'discord.update-guild-member.move' ? P.view | (1n << 20n) | (1n << 24n) : plan.id === 'discord.follow-channel' ? P.view | P.manageWebhooks : plan.id === 'discord.create-guild-scheduled-event' ? P.view | (1n << 33n) : P.view | P.manageChannels;
                if (!has(permissions(ch, a), mask) || !has(permissions(ch, b), mask))
                    throw new Fault('secondary_channel_access');
                if (body.parent_id === cid && ch.type !== 4)
                    throw new Fault('not_category');
            }
            if (t.webhook) {
                const wh = object(await this.client.rest.get(`/webhooks/${t.webhook}`));
                if (wh.guild_id !== ctx.guild || typeof wh.channel_id !== 'string')
                    throw new Fault('webhook_scope');
                const ch = await this.channel(g, wh.channel_id);
                resolvedChannels.push(ch.id);
                actor = permissions(ch, a);
                bot = permissions(ch, b);
                if (!has(actor, P.view | P.manageWebhooks) || !has(bot, P.view | P.manageWebhooks))
                    throw new Fault('webhook_access');
            }
            if (t.code) {
                if (plan.id.includes('template')) {
                    const list = await this.client.rest.get(`/guilds/${ctx.guild}/templates`);
                    if (!Array.isArray(list) || !list.some(x => object(x).code === t.code))
                        throw new Fault('template_scope');
                }
                else {
                    const list = await this.client.rest.get(`/guilds/${ctx.guild}/invites`);
                    if (!Array.isArray(list) || !list.some(x => object(x).code === t.code))
                        throw new Fault('invite_scope');
                }
            }
            if (t.overwrite) {
                if (plan.id === 'discord.set-channel-permission-overwrite') {
                    const allowed = BigInt(String(body.allow)), denied = BigInt(String(body.deny));
                    if ((allowed & P.admin) !== 0n || !has(actor, allowed | denied) || !has(bot, allowed | denied))
                        throw new Fault('privilege_escalation');
                    if (body.type === 0) {
                        const r = await g.roles.fetch(t.overwrite, { force: true });
                        if (!r || r.managed || (!owner && a.roles.highest.comparePositionTo(r) <= 0) || b.roles.highest.comparePositionTo(r) <= 0)
                            throw new Fault('overwrite_hierarchy');
                    }
                    else {
                        const m = await member(g, t.overwrite);
                        if (m.id === g.ownerId || m.id === a.id || m.id === b.id || (!owner && a.roles.highest.comparePositionTo(m.roles.highest) <= 0) || b.roles.highest.comparePositionTo(m.roles.highest) <= 0)
                            throw new Fault('overwrite_hierarchy');
                    }
                }
                else {
                    throw new Fault('overwrite_removal_requires_review', 'Remoção de sobrescrita exige revisão das permissões herdadas.');
                }
            }
            if (plan.id === 'discord.bulk-update-guild-roles') {
                if (!Array.isArray(plan.body))
                    throw new Fault('invalid_role_order');
                for (const row of plan.body) {
                    const o = object(row);
                    const r = await g.roles.fetch(id(o.id), { force: true });
                    if (!r || r.managed || r.id === g.id || (!owner && a.roles.highest.comparePositionTo(r) <= 0) || b.roles.highest.comparePositionTo(r) <= 0)
                        throw new Fault('role_hierarchy'); /* numeric positions can cross a role boundary: conservative refuse if no position data */
                    const ar = (a.roles.highest as unknown as {
                        position?: number;
                    }).position, br = (b.roles.highest as unknown as {
                        position?: number;
                    }).position;
                    if (typeof ar !== 'number' || typeof br !== 'number' || typeof o.position !== 'number' || (!owner && o.position >= ar) || o.position >= br)
                        throw new Fault('role_position');
                }
            }
            if (t.user) {
                if (plan.effect !== 'read' && /unban-user/.test(plan.id)) { /* user may no longer be a member */ }
                else if (plan.id === 'discord.get-guild-ban') { /* guild-bound ban */ }
                else {
                    const m = await member(g, t.user);
                    if (plan.effect !== 'read') {
                        if (m.id === g.ownerId || m.id === b.id || m.id === a.id)
                            throw new Fault('protected_member');
                        if (!owner && a.roles.highest.comparePositionTo(m.roles.highest) <= 0 || b.roles.highest.comparePositionTo(m.roles.highest) <= 0)
                            throw new Fault('role_hierarchy');
                        if (plan.id.includes('timeout') && has(m.permissions.bitfield, P.admin))
                            throw new Fault('admin_timeout');
                    }
                }
            }
            if (t.role) {
                const role = await g.roles.fetch(t.role, { force: true });
                if (!role)
                    throw new Fault('role_scope');
                if (plan.effect !== 'read') {
                    if (role.managed || role.id === g.id || (!owner && a.roles.highest.comparePositionTo(role) <= 0) || b.roles.highest.comparePositionTo(role) <= 0)
                        throw new Fault('role_hierarchy');
                    if (plan.id === 'discord.update-guild-role.permissions') {
                        const requested = BigInt(String(body.permissions));
                        if ((requested & P.admin) !== 0n || !has(a.permissions.bitfield, requested) || !has(b.permissions.bitfield, requested))
                            throw new Fault('privilege_escalation');
                    }
                    if (plan.id === 'discord.add-guild-member-role' && ((role.permissions.bitfield & P.admin) !== 0n || !has(a.permissions.bitfield, role.permissions.bitfield) || !has(b.permissions.bitfield, role.permissions.bitfield)))
                        throw new Fault('privileged_role');
                }
            }
            if (plan.id === 'discord.create-thread.forum' && ![15, 16].includes(target?.type ?? -1))
                throw new Fault('not_forum');
            if (plan.id === 'discord.update-message') {
                const m = object(await this.client.rest.get(`/channels/${t.channel}/messages/${t.message}`));
                if (object(m.author).id !== this.client.user?.id)
                    throw new Fault('not_bot_message');
            }
            if (plan.id === 'discord.delete-channel.category' && target?.type !== 4)
                throw new Fault('not_category');
            if (plan.id === 'discord.delete-channel.thread' && !target?.isThread?.())
                throw new Fault('not_thread');
        }
        return { actor, bot, roles: [...a.roles.cache.keys()], owner, resolvedChannels };
    }
    async prepare(plan: Plan, ctx: Context): Promise<Plan> { if (plan.local !== 'purge')
        return plan; const t = plan.target; const b = obj(plan.body); const rows = await this.client.rest.get(`/channels/${t.channel}/messages`, { query: new URLSearchParams({ limit: String(b.count) }) }); if (!Array.isArray(rows))
        throw new Fault('unexpected_messages'); const cut = Date.now() - 13 * 86400000; const ids = rows.filter(x => { const o = object(x); return !o.pinned && (!b.author || object(o.author).id === b.author) && typeof o.timestamp === 'string' && Date.parse(o.timestamp) > cut; }).map(x => id(object(x).id)); if (!ids.length)
        throw new Fault('no_eligible_messages', 'Nenhuma mensagem elegível para exclusão.'); return { ...plan, body: { ...b, ids } }; }
    async execute(plan: Plan, ctx: Context): Promise<Json> {
        if (plan.local === 'permissions') {
            const { g } = await this.identities(ctx);
            const target = plan.target.user ? await member(g, plan.target.user) : await g.roles.fetch(plan.target.role, { force: true });
            if (!target)
                throw new Fault('permission_target_missing');
            const value = plan.target.channel ? permissions(await this.channel(g, plan.target.channel), target) : target.permissions.bitfield;
            return { permissions_effective: String(value) };
        }
        if (plan.local === 'purge') {
            const data = obj(plan.body);
            if (!Array.isArray(data.ids) || data.ids.length > 100 || !data.ids.length)
                throw new Fault('purge_selection_missing');
            const ids = data.ids.map(id);
            const path = `/channels/${plan.target.channel}/messages`;
            for (const mid of ids) {
                const m = object(await this.client.rest.get(`${path}/${mid}`));
                if (m.pinned || data.author && object(m.author).id !== data.author || typeof m.timestamp !== 'string' || Date.parse(m.timestamp) <= Date.now() - 13 * 86400000)
                    throw new Fault('purge_selection_changed');
            }
            if (ids.length === 1)
                await this.client.rest.delete(`${path}/${ids[0]}`);
            else
                await this.client.rest.post(`${path}/bulk-delete`, { body: { messages: ids } });
            return { requested: Number(data.count), deleted: ids.length, ids };
        }
        const options: RestOptions = { ...(plan.body === undefined ? {} : { body: plan.body }), ...(Object.keys(plan.query).length ? { query: new URLSearchParams(plan.query) } : {}), ...(plan.reason ? { reason: plan.reason } : {}) };
        const method = plan.method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';
        const r = await this.client.rest[method](plan.path, options);
        if(plan.effect!=='read')this.invalidate();
        if (plan.id === 'discord.guild-role-member-counts') {
            const source = object(r);
            const counts: Obj = {};
            for (const [k, v] of Object.entries(source))
                if (/^\d{17,20}$/.test(k) && typeof v === 'number' && Number.isSafeInteger(v) && v >= 0)
                    counts[k] = v;
            return Object.keys(counts).length ? counts : publicData(r);
        }
        if (plan.id === 'discord.list-guild-channels' || plan.id === 'discord.get-active-guild-threads' || plan.id.includes('archived-threads')) {
            const { g, a, b } = await this.identities(ctx);
            const rows = Array.isArray(r) ? r : Array.isArray(object(r).threads) ? object(r).threads as unknown[] : [];
            const visible = [];
            for (const row of rows.slice(0, 100)) {
                try {
                    const ch = await this.channel(g, id(object(row).id));
                    if (has(permissions(ch, a), P.view) && has(permissions(ch, b), P.view))
                        visible.push(row);
                }
                catch { }
            }
            return publicData(visible);
        }
        return publicData(r);
    }
    async verify(plan: Plan, ctx: Context, result: Json): Promise<Json> {
        if (plan.local === 'purge') {
            const d = obj(result);
            const ids = Array.isArray(d.ids) ? d.ids.map(id) : [];
            for (const mid of ids) {
                try {
                    await this.client.rest.get(`/channels/${plan.target.channel}/messages/${mid}`);
                    throw new Fault('delete_not_verified');
                }
                catch (e) {
                    if (Number(object(e).code) !== 10008)
                        throw e;
                }
            }
            return { requested: d.requested, deleted: d.deleted, verified: true };
        }
        if (plan.method === 'DELETE' && plan.path.match(/^\/channels\/\d+(?:\/messages\/\d+)?$/)) {
            try {
                await this.client.rest.get(plan.path);
                throw new Fault('delete_not_verified');
            }
            catch (e) {
                if (![10003, 10008].includes(Number(object(e).code)))
                    throw e;
            }
            return { verified: true };
        }
        if (plan.id.startsWith('discord.create-guild-channel')) {
            const o = obj(result);
            const ch = object(await this.client.rest.get(`/channels/${id(o.id)}`));
            if (ch.guild_id !== ctx.guild || ch.id !== o.id)
                throw new Fault('create_not_verified');
            return { ...o, verified: true };
        }
        return result === null ? { accepted: true, verification: 'Discord HTTP success; no read-back' } : result;
    }
}

