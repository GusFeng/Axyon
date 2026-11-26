"""RaiBot: a single Discord slash command and observable diagnostics."""
import asyncio
import json
import logging
import os
import urllib.request
import urllib.error

log = logging.getLogger("raibot")
COMMAND = "ping"
PONG = "pong"


async def respond_ping(interaction):
    await interaction.response.send_message(PONG)
    original = await interaction.original_response()
    if original.content != PONG:
        raise RuntimeError("Discord response content mismatch")
    log.info("PING_VERIFIED interaction_id=%s message_id=%s content=pong",
             interaction.id, original.id)


async def channel_smoke(client):
    import discord
    if client.user.id != 1575354711501185117:
        raise RuntimeError("Unexpected bot identity")
    guild = client.get_guild(1573896254419632169)
    if guild is None:
        raise RuntimeError("Test guild not found")
    channels = await guild.fetch_channels()
    log.info("CHANNEL_TEST_TARGET guild_id=%s guild_name=%s", guild.id, guild.name)
    for name, kind, create in (
        ("bar", discord.ChannelType.text, guild.create_text_channel),
        ("pagode", discord.ChannelType.voice, guild.create_voice_channel),
    ):
        try:
            matches = [c for c in channels if c.name == name and c.type == kind]
            if len(matches) > 1:
                raise RuntimeError("Multiple existing matching channels")
            created = not matches
            channel = matches[0] if matches else await create(name, reason="Authorized RaiBot channel creation test")
            confirmed = await client.fetch_channel(channel.id)
            if confirmed.name != name or confirmed.type != kind or confirmed.guild.id != guild.id:
                raise RuntimeError("Channel verification mismatch")
            log.info("CHANNEL_VERIFIED name=%s type=%s channel_id=%s guild_id=%s created=%s", name, kind.value, confirmed.id, guild.id, created)
        except Exception as error:
            log.error("CHANNEL_TEST_FAILED name=%s type=%s error=%s status=%s discord_code=%s", name, kind.value, type(error).__name__, getattr(error, "status", None), getattr(error, "code", None))

def probe_discord():
    """Real public HTTPS request; no credential required."""
    try:
        request = urllib.request.Request(
            "https://discord.com/api/v10/gateway",
            headers={"User-Agent": "RaiBot (https://github.com/GusFeng/RaiBot, 1.0)"})
        with urllib.request.urlopen(request, timeout=12) as response:
            data = json.load(response)
            if response.status != 200 or not data.get("url", "").startswith("wss://"):
                raise ValueError("unexpected Discord response")
            log.info("DISCORD_HTTPS_OK status=%s gateway=%s", response.status, data["url"])
            return True
    except Exception as error:
        log.error("DISCORD_HTTPS_FAILED type=%s status=%s",
                  type(error).__name__, getattr(error, "code", None))
        return False


async def run_bot(token, guild_id):
    import discord
    from discord import app_commands

    guild = discord.Object(id=int(guild_id)) if guild_id else None

    class RaiClient(discord.Client):
        def __init__(self):
            super().__init__(intents=discord.Intents(guilds=True))
            self.tree = app_commands.CommandTree(self)
            self.smoke_started = False

        async def setup_hook(self):
            existing = await self.tree.fetch_commands(guild=guild)
            if any(command.name != COMMAND or command.type != discord.AppCommandType.chat_input
                   for command in existing):
                raise RuntimeError("Use a dedicated Discord application: existing unrelated commands")
            synced = await self.tree.sync(guild=guild)
            confirmed = await self.tree.fetch_commands(guild=guild)
            if len(synced) != 1 or len(confirmed) != 1 or confirmed[0].name != COMMAND:
                raise RuntimeError("Discord registration verification failed")
            log.info("COMMAND_VERIFIED name=ping command_id=%s scope=%s",
                     confirmed[0].id, "guild" if guild else "global")

        async def on_ready(self):
            log.info("GATEWAY_READY bot_id=%s guild_count=%s", self.user.id, len(self.guilds))
            if not self.smoke_started:
                self.smoke_started = True
                try:
                    await channel_smoke(self)
                except Exception as error:
                    log.error("CHANNEL_TEST_ABORTED type=%s status=%s", type(error).__name__, getattr(error, "status", None))

    client = RaiClient()

    @client.tree.command(name=COMMAND, description="Responde pong.", guild=guild)
    async def ping(interaction: discord.Interaction):
        await respond_ping(interaction)

    @client.tree.error
    async def on_error(interaction, error):
        log.error("PING_FAILED interaction_id=%s error_type=%s", interaction.id, type(error).__name__)

    async with client:
        await client.start(token)


def main():
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s %(levelname)s %(name)s %(message)s")
    logging.getLogger("discord").setLevel(logging.WARNING)
    if not probe_discord():
        log.warning("Network probe failed; authenticated connection will be attempted only if configured")
    token = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
    if not token:
        log.warning("AWAITING_DISCORD_BOT_TOKEN; no bot login attempted; exiting to avoid idle usage")
        return
    try:
        asyncio.run(run_bot(token, os.environ.get("DISCORD_GUILD_ID", "").strip()))
    except Exception as error:
        log.error("BOT_START_FAILED type=%s status=%s", type(error).__name__, getattr(error, "status", None))
        raise SystemExit(1) from None


if __name__ == "__main__":
    main()
