# AXYON — AI-Native Enterprise Modular Platform

Reconstruction candidate for the Node.js/Railway environment. The Rust Axyon-Z is a **reference**, not a build dependency. All business capabilities are invoked through the same kernel by slash commands, AI, administration components and automated routines.

## Local engineering

Node.js 22.16+ (22.x), npm, TypeScript. Install dependencies with `npm install` on the first connected environment; commit the generated lockfile and subsequently use `npm ci`. Run `npm run check`, then `npm run inventory` to regenerate the traceability catalogs. The package uses the built-in Node SQLite module (experimental warning on Node 22), no native addon build or Rust toolchain. The full Discord.js dependency could not be installed in the isolated authoring environment; see `docs/validation/REPORT.md`.

The built container executes compilation, typecheck, tests and dependency-boundary checks before it starts. No Discord credentials are needed for those tests. The actual SDK, Docker build, Discord connection, and external AI provider remain integration gates, not accomplished claims.

## Runtime

Copy `.env.example` to a private environment configuration, never commit the values. Configure the variables already in the Railway service; `DISCORD_GUILD_ID` is the authorized scope, with compatibility fallback to `AI_GUILD_ID` or `RAIBOT_CONTROL_GUILD`. `AI_API_KEY` or historical `API`, `AI_API_URL`, `AI_MODEL`, `AI_FORMAT` configure the external provider. Model not hardcoded. To run: `npm run build && npm start`.

- `AXYON_REGISTER_COMMANDS=true` explicitly enables **guild-only** synchronization of implemented candidates; unrelated existing roots cause refusal. Default false. Review `reference/candidate-commands.json` first. No global registration or runtime command mutation.
- `DISCORD_MESSAGE_CONTENT=true` is required for unmentioned direct-channel conversations and message-prefix automation; enable the appropriate privileged intent in Discord before using. Explicit mentions work using ordinary Gateway message events. Enable `DISCORD_GUILD_MEMBERS` only if authorized/required. DMs require both `AXYON_ENABLE_DMS=true` and `/ia configurar chave:dms valor:true`, verified membership of the configured guild, and are conversational only.
- `/ia status` and `/modulos listar` open administrative panels. `/ia configurar` controls channels, modes, allow/deny lists, model instructions, retention, domains and protections. AI starts in chat mode, operational requests use `ação:`; write requests require explicit confirmation unless simulation is enabled. Provide exact IDs for targets. `/ia consentimento` and `/ia esquecer` govern individual memory; memory is off by default.
- `/agenda criar`, `/automacao criar`, `/fluxo criar` provide safe message routines; multi-step flows accept a JSON array of `{ "capability": "discord.create-message", "input": { "texto": "...", "canal": "..." } }` objects (max 5). Each step uses current authorization. `/blueprint exportar` exports a bounded visible inventory, not a restore operation.
- `/health` and `/ready` are the only public HTTP routes. The previous remote administrative HTTP endpoint was removed, not merely disabled. No bot-control token endpoint is exposed.
- `AXYON_DB_PATH` empty means ephemeral SQLite memory. For durable settings, receipts and jobs mount a Railway volume and set e.g. `/data/axyon.sqlite`; verify ownership/writability and backups. Do not claim HA, use a single replica. No provisioned volume or database is implied by this package. Do not use a shared SQLite file between distributed replicas.

See `docs/ARCHITECTURE.md`, `docs/validation/REPORT.md`, `reference/coverage.json`, `reference/capabilities.json` and `reference/candidate-commands.json`. These distinguish local implementation from actual API verification and enumerate excluded operations.
