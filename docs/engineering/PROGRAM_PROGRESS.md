# Architectural transformation — vertical engineering candidate
This branch is an incremental candidate, not a release certificate. Each change preserves the existing application and uses credential-free tests. The current production deployment and legacy resources are not modified.

| Phase | Candidate increment | Remaining gate evidence |
| --- | --- | --- |
| 00 | Baseline, source and deployment mapping | Live legacy identity, SQLite source inventory |
| 01 | CI, synthetic restore, readiness, staging identity | Required branch checks, separate live Discord staging, real restoration |
| 02 | Capability evidence classifications | Complete official API/SDK/event inventory and per-entry eligibility |
| 03 | Confirmation digest and policy revision | Staging human pilot, per-operation postconditions and mandatory audit availability |
| 04 | Atomic memory revocation, isolated backup proof | Data reconciliation, migration and writer ownership |
| 05 | Staging identity before Gateway login; readiness gating | Live staging, ownership and cutover drill |
| 06 | Read-only scoped channel/role observation | Durable projection, event reconciliation, actual comparison |
| 07 | Conservative explicit managed-name preview | Versioned plans, approval/apply/verify in staging |
| 08 | Revision fencing before workflow dispatch | Durable checkpoints/outbox, restart/resume proof |
| 09 | Actor-filtered discovery and strict plan format | Provider routing, evaluations, measured costs |
| 10 | Tenant-local uncertainty review signals | Incident lifecycle, detectors, authorized containment |
| 11 | Strict panel callback values | Human E2E, OAuth, other eligible interfaces |
| 12 | Atomic immutable trusted module registration | External adapter sandbox, revocation and SDK |
| 13 | Synthetic concurrent ingress regression | Live load/failover, SLO/RPO/RTO and coverage certification |

No gate is deemed accepted solely by this file or a passing mock test. Roll back by reverting each phase commit in reverse dependency order on the candidate branch; no schema or cloud changes in these increments. Production writes and live migrations are intentionally absent. Never use legacy D1 data as a staging fixture.
