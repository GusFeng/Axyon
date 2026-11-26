# F01 recovery proof (isolated)

Scope: a synthetic on-disk SQLite database, online snapshot using SQLite VACUUM INTO, independent integrity verification, and recovery of the snapshot in isolation. No production connection, Discord credentials, Railway volume, or Cloudflare data are required.

## Validation
Run `npm ci`, `npm run check`, and the delivery gate. The regression checks a consistent point-in-time snapshot with the source database still open in WAL mode, schema version, tenant-scoped configuration and consent, receipt deduplication, and conversion of interrupted receipts into uncertain outcomes.

## Production recovery boundary
This is an executable recovery proof, not a production backup or a disaster recovery drill. Never copy only the live database file while WAL writes may be pending. Before a real restore, quiesce the writer, preserve the current source and its backups, verify the snapshot offline, invalidate pending confirmations, and reconcile external Discord effects since the snapshot. A restored database cannot know effects that occurred after the snapshot; do not automatically replay them. Restart only with a single authorized writer. Retention, encrypted backup storage, RPO/RTO, and a production restore drill remain separate acceptance criteria.

Rollback: revert the test and this document; no runtime or schema changes.
