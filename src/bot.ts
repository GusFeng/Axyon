import { main } from './runtime/gateway';
import { startTelemetry, stopTelemetry } from './modules/performance/telemetry';
import { Fault } from './contracts';
import { lstatSync, chownSync, chmodSync, existsSync } from 'node:fs';

// Railway mounts volumes as root. Prepare only the dedicated data directory,
// then irrevocably drop privileges before connecting to Discord or the AI API.
function prepareVolume(): void {
    if (process.getuid?.() !== 0) return;
    if (process.env.AXYON_DB_PATH !== '/data/axyon.sqlite') throw new Fault('unexpected_root_runtime');
    const dir = lstatSync('/data');
    if (!dir.isDirectory() || dir.isSymbolicLink()) throw new Fault('invalid_data_mount');
    chownSync('/data', 1000, 1000);
    chmodSync('/data', 0o700);
    for (const suffix of ['', '-wal', '-shm', '-journal']) {
        const path = '/data/axyon.sqlite' + suffix;
        if (!existsSync(path)) continue;
        const entry = lstatSync(path);
        if (!entry.isFile() || entry.isSymbolicLink()) throw new Fault('invalid_database_file');
        chownSync(path, 1000, 1000);
        chmodSync(path, 0o600);
    }
    process.setgroups?.([]);
    process.setgid?.(1000);
    process.setuid?.(1000);
    if (process.getuid?.() === 0) throw new Fault('privilege_drop_failed');
}
void (async () => { prepareVolume(); startTelemetry(); await main(); })().catch(async e => {
    console.error('START_FAILED', e instanceof Fault ? e.code : e instanceof Error ? e.name : 'unknown');
    await stopTelemetry();
    process.exitCode = 1;
});
