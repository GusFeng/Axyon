# F01.6 runtime readiness and containment

The readiness endpoint, new slash/component ingress, message ingress and scheduled dispatch use the same operational predicate: initialization complete, Discord connected, not stopping. Liveness stays available during a temporary gateway outage. Database quick_check must succeed before registering the runtime or connecting to Discord; errors are normalized and do not disclose database diagnostics. This is not a distributed lock, a production alert, or proof of live recovery.

Acceptance: truth-table test, invalid integrity responses, sanitized integrity exception, synthetic real HTTP readiness transition during gateway disconnect and recovery, existing regression suite, inventories and Docker build. Rollback: revert this commit; no schema or dependency changes.
