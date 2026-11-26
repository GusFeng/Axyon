# Architecture — Axyon Node runtime

## Design

A modular monolith with microkernel, typed capability registry and policy-mediated execution, deployed as one Node.js process. Domain definitions live under administration and moderation; the core composes them with optional intelligence, commands, workflows, scheduler, automation and blueprint. Essential services provide persistence, configuration, security, operations, recovery, observability, and the control plane. Lifecycle is ordered by declared dependencies; activation is per guild and checked at effect time. This is functional isolation, not independent deployment of each module.

```
Discord Gateway -> runtime adapter -> command projection / intelligence / event engine
                                  -> Kernel -> registry + input schema
                                  -> fresh Discord permissions + tenant policy
                                  -> confirmation / receipt -> domain plan
                                  -> Discord.js REST or local executor -> verification/audit
SQLite <-> settings, consent, receipts, confirmation tokens, routines, budgets, audit
AI provider <-> bounded conversational request or one structured proposal
```

## Decisions superseding old specification

- **Node.js/Railway**, not Workers/WASM: permanent Gateway connection replaces polling, no Durable Objects or Cloudflare-specific runtime. Cloudflare Workers AI remains one external HTTPS provider; format adapters also support OpenAI-compatible, Anthropic and Gemini shapes. No provider has been called in this local delivery.
- **SQLite first**, not mandatory PostgreSQL: built into available Node 22, real transactions and independent-connection tests, minimal dependency footprint. This is a single-process/volume architecture; PostgreSQL is a future decision if HA, workload or operational requirements justify a service. No spending/provisioning assumed. Memory-only is explicitly ephemeral. Schema version 1; no automatic legacy D1 import or copying personal data.
- **Node test runner**, not Vitest: available offline, typed tests and actual local SQLite/HTTP; no need for additional dependency to obtain meaningful coverage. Static boundary check enforces no AI↔Commands import paths or cycles. No ESLint/Prettier gate claimed.
- **Typed plans**, not arbitrary API bridge: historical matrix provides method/route and baseline permission data; concrete TS declarations own input schema and payload construction. Some old pseudo-permission routes execute through local SDK calculation, never HTTP. Some legacy masks and fields were intentionally made more restrictive. Official endpoint compatibility and full response semantics must be checked in the next integration layer.
- **Security over apparent parity**: deny cross-guild targets, current origin/direct-channel deletion, protected channels/roles/users, unauthorized role hierarchy and privilege assignment, arbitrary route input and token-bearing webhook actions. Purge selects exact recent non-pinned IDs before confirmation and rechecks them; only explicit current actor/guild/channel may consume. Settings CAS returns the revision from the actual write. Every effect uses receipts; uncertain results are not replayed automatically. All read results are bounded and redacted. Exact ID required for AI entity operations; no name-based destructive guesses.
- **Minimal runtime**: no remote control HTTP API, no OAuth token collection, no voice streaming dependency, no payment or monetization activation. Health/readiness only. Single authorized guild by deployment, even though persistence keys are tenant-aware. DMs use membership validation and chat only; thread/reply context is channel/user-scoped, with bot-reply tracking in RAM.

## Limits and failure semantics

A process crash after scheduling state advances but before sending can skip an occurrence; at-most-once is chosen over potentially repeated administrative effects. Receipts marked started on startup become uncertain. There is no distributed coordination or automatic rollback of external Discord operations. The workflow engine supports bounded sequential message steps, not arbitrary branching or full compensation. No persistent conversation unless admin enables and user consents. User memory expiry, delete, budget and audit cleanup are implemented. Audit contains IDs and status/timing, not conversation text or keys. Real cost and latency require provider telemetry and production observation. Local tests use synthetic IDs and fake transport.

## Catalog and source map

`reference/coverage.json` lists all 153 historical operational IDs and 267 historical command leaves from the **received Axyon-Z-main snapshot**. A name match is not a full behavior match; compare options and implementation. `reference/rest-inventory.json` preserves the 250 historical endpoints as a non-executable inventory. `reference/candidate-commands.json` is generated from the actual code; no hidden placeholder commands are registered. `reference/module-manifest.json` records activation dependencies. `reference/capabilities.json` is the implemented schema inventory.
