# F01.3 initial isolated staging profile

The runtime refuses non-production Railway environments unless explicitly configured as staging. For the initial staging profile, set AXYON_ENVIRONMENT=staging, DISCORD_GUILD_ID to the dedicated test guild, AXYON_STAGING_APPLICATION_ID to the dedicated test application, and the two AXYON_PRODUCTION_* IDs to the production identity. Supply the test bot token via the staging secret manager only. Do not copy production secrets, volume, data, or AI credentials. Keep AXYON_DB_PATH empty, DMs disabled and global legacy cleanup disabled. The application identity is verified against the official Discord Get Current Application endpoint before Gateway login; the existing startup guild membership check remains authoritative. Keep command registration off until the test guild is authorized.

This profile is ephemeral intentionally. A separately provisioned volume and persistent staging profile require a subsequent explicit data isolation proof. GitHub CI exercises configuration and the REST contract using synthetic credentials and responses. This does not create a Railway environment, register a Discord application, or prove live staging connectivity.

Official contract: https://github.com/discord/discord-api-docs/blob/main/developers/resources/application.mdx#get-current-application

Rollback: revert the profile and tests; no database migration.
