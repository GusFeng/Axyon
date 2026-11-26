import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { Context, Fault, Json, Obj } from '../../contracts';
import { defaults, Settings } from '../configuration/settings';
export type ReceiptStatus = 'started' | 'done' | 'uncertain' | 'failed';
export interface Job {
    id: string;
    guild: string;
    actor: string;
    channel: string;
    capability: string;
    input: Obj;
    steps?: {
        capability: string;
        input: Obj;
    }[];
    kind: 'schedule' | 'event';
    trigger: string;
    interval: number;
    next: number;
    enabled: boolean;
    revision: number;
}
export class Store {
    readonly db: DatabaseSync;
    constructor(path = ':memory:') { this.db = new DatabaseSync(path); const schema = Number(this.db.prepare('PRAGMA user_version').get()?.user_version ?? 0); if (schema > 1) {
        this.db.close();
        throw new Fault('unsupported_database_version');
    } this.db.exec(`PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS settings(guild TEXT PRIMARY KEY, revision INTEGER NOT NULL, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS receipts(guild TEXT NOT NULL, nonce TEXT NOT NULL, status TEXT NOT NULL, created INTEGER NOT NULL, PRIMARY KEY(guild,nonce)); CREATE TABLE IF NOT EXISTS confirmations(id TEXT PRIMARY KEY,guild TEXT NOT NULL,actor TEXT NOT NULL,channel TEXT NOT NULL,expires INTEGER NOT NULL,data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, guild TEXT NOT NULL, actor TEXT NOT NULL, capability TEXT NOT NULL, source TEXT NOT NULL,status TEXT NOT NULL,ms INTEGER NOT NULL,at INTEGER NOT NULL); CREATE INDEX IF NOT EXISTS audit_guild ON audit(guild,at); CREATE TABLE IF NOT EXISTS jobs(guild TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,revision INTEGER NOT NULL, PRIMARY KEY(guild,id)); CREATE TABLE IF NOT EXISTS budget(guild TEXT NOT NULL,actor TEXT NOT NULL,window INTEGER NOT NULL,n INTEGER NOT NULL,PRIMARY KEY(guild,actor,window)); CREATE TABLE IF NOT EXISTS consent(guild TEXT NOT NULL, actor TEXT NOT NULL, PRIMARY KEY(guild,actor)); CREATE TABLE IF NOT EXISTS memory(guild TEXT NOT NULL,channel TEXT NOT NULL,actor TEXT NOT NULL,expires INTEGER NOT NULL,data TEXT NOT NULL,PRIMARY KEY(guild,channel,actor));`); this.db.exec('PRAGMA user_version=1'); if (path !== ':memory:')
        this.db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;'); }
    settings(guild: string): {
        revision: number;
        value: Settings;
    } { const row = this.db.prepare('SELECT revision,data FROM settings WHERE guild=?').get(guild); if (!row)
        return { revision: 0, value: defaults() }; return { revision: Number(row.revision), value: JSON.parse(String(row.data)) as Settings }; }
    save(guild: string, expected: number, value: Settings): number { const raw = JSON.stringify(value); const row = expected === 0 ? this.db.prepare('INSERT INTO settings(guild,revision,data) VALUES(?,1,?) ON CONFLICT DO NOTHING RETURNING revision').get(guild, raw) : this.db.prepare('UPDATE settings SET revision=revision+1,data=? WHERE guild=? AND revision=? RETURNING revision').get(raw, guild, expected); if (!row)
        throw new Fault('revision_conflict', 'Configuração alterada por outro administrador. Tente novamente.'); return Number(row.revision); }
    claim(guild: string, nonce: string): boolean { return !!this.db.prepare("INSERT INTO receipts VALUES(?,?,'started',?) ON CONFLICT DO NOTHING RETURNING nonce").get(guild, nonce, Date.now()); }
    finish(guild: string, nonce: string, status: ReceiptStatus) { this.db.prepare('UPDATE receipts SET status=? WHERE guild=? AND nonce=?').run(status, guild, nonce); }
    confirmation(c: Context, data: Json, ttl = 120000): string { const token = randomUUID(); this.db.prepare('INSERT INTO confirmations VALUES(?,?,?,?,?,?)').run(token, c.guild, c.actor, c.channel, Date.now() + ttl, JSON.stringify(data)); return token; }
    peekConfirmation(c: Context, token: string): Json { const row = this.db.prepare('SELECT data FROM confirmations WHERE id=? AND guild=? AND actor=? AND channel=? AND expires>?').get(token, c.guild, c.actor, c.channel, Date.now()); if (!row)
        throw new Fault('confirmation_invalid'); return JSON.parse(String(row.data)) as Json; }
    consume(c: Context, token: string): Json { const row = this.db.prepare('DELETE FROM confirmations WHERE id=? AND guild=? AND actor=? AND channel=? AND expires>? RETURNING data').get(token, c.guild, c.actor, c.channel, Date.now()); if (!row)
        throw new Fault('confirmation_invalid', 'Confirmação inválida, expirada ou já consumida.'); return JSON.parse(String(row.data)) as Json; }
    audit(c: Context, cap: string, status: string, ms: number) { this.db.prepare('INSERT INTO audit(guild,actor,capability,source,status,ms,at) VALUES(?,?,?,?,?,?,?)').run(c.guild, c.actor, cap, c.source, status, Math.max(0, Math.round(ms)), Date.now()); }
    uncertain(guild: string): number { return Number(this.db.prepare("SELECT count(*) n FROM receipts WHERE guild=? AND status IN ('started','uncertain')").get(guild)?.n ?? 0); }
    stats(guild: string): Json { return this.db.prepare('SELECT status,count(*) n,round(avg(ms),1) avg_ms,max(ms) max_ms FROM audit WHERE guild=? GROUP BY status').all(guild) as unknown as Json; }
    recent(guild: string): Json { return this.db.prepare('SELECT capability,source,status,ms,at FROM audit WHERE guild=? ORDER BY id DESC LIMIT 20').all(guild) as unknown as Json; }
    reserve(guild: string, actor: string, limit = 10, perActor = 3, now = Date.now()): boolean { const w = Math.floor(now / 60000); this.db.exec('BEGIN IMMEDIATE'); try {
        const q = this.db.prepare('SELECT n FROM budget WHERE guild=? AND actor=? AND window=?');
        if (Number(q.get(guild, '*', w)?.n ?? 0) >= limit || Number(q.get(guild, actor, w)?.n ?? 0) >= perActor) {
            this.db.exec('ROLLBACK');
            return false;
        }
        const u = this.db.prepare('INSERT INTO budget VALUES(?,?,?,1) ON CONFLICT(guild,actor,window) DO UPDATE SET n=n+1');
        u.run(guild, '*', w);
        u.run(guild, actor, w);
        this.db.exec('COMMIT');
        return true;
    }
    catch (e) {
        this.db.exec('ROLLBACK');
        throw e;
    } }
    hasConsent(guild: string, actor: string): boolean { return !!this.db.prepare('SELECT actor FROM consent WHERE guild=? AND actor=?').get(guild, actor); }
    consent(guild: string, actor: string, enabled: boolean) { if (enabled)
        this.db.prepare('INSERT OR IGNORE INTO consent VALUES(?,?)').run(guild, actor);
    else {
        this.db.prepare('DELETE FROM consent WHERE guild=? AND actor=?').run(guild, actor);
        this.clearMemory(guild, actor);
    } }
    getMemory(c: Context): Json { const r = this.db.prepare('SELECT data FROM memory WHERE guild=? AND channel=? AND actor=? AND expires>?').get(c.guild, c.channel, c.actor, Date.now()); return r ? JSON.parse(String(r.data)) as Json : []; }
    setMemory(c: Context, data: Json, minutes: number) { this.db.prepare('INSERT INTO memory VALUES(?,?,?,?,?) ON CONFLICT(guild,channel,actor) DO UPDATE SET expires=excluded.expires,data=excluded.data').run(c.guild, c.channel, c.actor, Date.now() + minutes * 60000, JSON.stringify(data)); }
    clearMemory(guild: string, actor?: string) { if (actor)
        this.db.prepare('DELETE FROM memory WHERE guild=? AND actor=?').run(guild, actor);
    else
        this.db.prepare('DELETE FROM memory WHERE guild=?').run(guild); }
    jobs(guild?: string): Job[] { return (guild ? this.db.prepare('SELECT data FROM jobs WHERE guild=?').all(guild) : this.db.prepare('SELECT data FROM jobs').all()).map(r => JSON.parse(String(r.data)) as Job); }
    saveJob(j: Job, expected: number) { const next = { ...j, revision: expected + 1 }; const r = expected === 0 ? this.db.prepare('INSERT INTO jobs VALUES(?,?,?,?) ON CONFLICT DO NOTHING RETURNING revision').get(j.guild, j.id, JSON.stringify(next), next.revision) : this.db.prepare('UPDATE jobs SET data=?,revision=? WHERE guild=? AND id=? AND revision=? RETURNING revision').get(JSON.stringify(next), next.revision, j.guild, j.id, expected); if (!r)
        throw new Fault('job_conflict'); return next; }
    removeJob(guild: string, id: string, expected: number) { if (!this.db.prepare('DELETE FROM jobs WHERE guild=? AND id=? AND revision=? RETURNING id').get(guild, id, expected))
        throw new Fault('job_conflict'); }
    prune(now = Date.now()) { this.db.prepare('DELETE FROM confirmations WHERE expires<=?').run(now); this.db.prepare('DELETE FROM memory WHERE expires<=?').run(now); this.db.prepare('DELETE FROM budget WHERE window<?').run(Math.floor(now / 60000) - 2); this.db.prepare("DELETE FROM receipts WHERE status IN ('done','failed') AND created<?").run(now - 7 * 86400000); this.db.prepare('DELETE FROM audit WHERE at<?').run(now - 30 * 86400000); }
    close() { this.db.close(); }
}

