import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { Store } from '../modules/persistence/store';
import { recoverInterrupted } from '../modules/recovery/reconcile';

test('SQLite online snapshot restores a consistent tenant-isolated point in time without replaying receipts', () => {
    const dir = mkdtempSync(join(tmpdir(), 'axyon-restore-'));
    const sourcePath = join(dir, 'source.sqlite');
    const snapshotPath = join(dir, 'snapshot.sqlite');
    const guild = '100000000000000001';
    const otherGuild = '100000000000000002';
    const actor = '100000000000000003';
    const source = new Store(sourcePath);
    try {
        const before = source.settings(guild);
        before.value.ai.style = 'snapshot';
        assert.equal(source.save(guild, before.revision, before.value), 1);
        assert.equal(source.claim(guild, 'completed'), true);
        source.finish(guild, 'completed', 'done');
        assert.equal(source.claim(guild, 'interrupted'), true);
        assert.equal(source.claim(otherGuild, 'completed'), true);
        source.finish(otherGuild, 'completed', 'done');
        source.consent(guild, actor, true);
        source.db.prepare('VACUUM INTO ?').run(snapshotPath);

        const after = source.settings(guild);
        after.value.ai.style = 'later';
        assert.equal(source.save(guild, after.revision, after.value), 2);
        assert.equal(source.claim(guild, 'after-snapshot'), true);

        const verification = new DatabaseSync(snapshotPath, { readOnly: true });
        try {
            assert.equal(verification.prepare('PRAGMA integrity_check').get()?.integrity_check, 'ok');
            assert.equal(verification.prepare('PRAGMA user_version').get()?.user_version, 1);
        } finally {
            verification.close();
        }

        const restored = new Store(snapshotPath);
        try {
            assert.equal(restored.settings(guild).revision, 1);
            assert.equal(restored.settings(guild).value.ai.style, 'snapshot');
            assert.equal(restored.settings(otherGuild).revision, 0);
            assert.equal(restored.hasConsent(guild, actor), true);
            assert.equal(restored.hasConsent(otherGuild, actor), false);
            assert.equal(recoverInterrupted(restored), 1);
            assert.equal(restored.uncertain(guild), 1);
            assert.equal(restored.uncertain(otherGuild), 0);
            assert.equal(restored.claim(guild, 'completed'), false);
            assert.equal(restored.claim(guild, 'interrupted'), false);
            assert.equal(restored.claim(otherGuild, 'completed'), false);
            // The snapshot is older than the source: post-snapshot effects need
            // independent reconciliation before any actual production cutover.
            assert.equal(restored.db.prepare('SELECT count(*) AS n FROM receipts WHERE guild=? AND nonce=?').get(guild, 'after-snapshot')?.n, 0);
            assert.equal(source.settings(guild).revision, 2);
            assert.equal(source.db.prepare('SELECT status FROM receipts WHERE guild=? AND nonce=?').get(guild, 'interrupted')?.status, 'started');
        } finally {
            restored.close();
        }
    } finally {
        source.close();
        rmSync(dir, { recursive: true, force: true });
    }
});
