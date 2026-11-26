"""RaiBot: a single Discord slash command and observable diagnostics."""
import asyncio
import json
import logging
import os
import urllib.request
import urllib.error
import discord

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


async def remote_smoke(client):
    # Locate precisely the prior verified ping message; never send elsewhere.
    anchor_id = 1575356867830620280
    target = None
    for guild in client.guilds:
        for channel in [*guild.text_channels, *guild.threads]:
            try:
                anchor = await channel.fetch_message(anchor_id)
            except (discord.NotFound, discord.Forbidden):
                continue
            if anchor.author.id == client.user.id and anchor.content == PONG:
                target = channel
                break
        if target is not None:
            break
    if target is None:
        raise RuntimeError("Original test channel not found")
    log.info("TARGET_VERIFIED guild_id=%s channel_id=%s", target.guild.id, target.id)
    # Check for earlier deliveries from this experiment, avoiding duplicates.
    greeting = None
    pong = None
    async for message in target.history(limit=100, after=discord.Object(id=anchor_id), oldest_first=True):
        if message.author.id != client.user.id:
            continue
        if message.content == "olá, tudo bem?":
            greeting = message
        elif greeting is not None and message.content == PONG:
            pong = message
    async def send_verified(content, nonce, previous=None):
        message = previous or await target.send(content, nonce=nonce, allowed_mentions=discord.AllowedMentions.none())
        fetched = await target.fetch_message(message.id)
        if fetched.content != content or fetched.author.id != client.user.id:
            raise RuntimeError("Discord delivery verification failed")
        log.info("REST_MESSAGE_VERIFIED message_id=%s content=%s reused=%s", fetched.id, content, previous is not None)
        return fetched
    await send_verified("olá, tudo bem?", 1575356867830620281, greeting)
    class Adapter:
        id = "remote-handler-test"
        def __init__(self):
            self.response = self
            self.message = None
        async def send_message(self, content):
            self.message = await send_verified(content, 1575356867830620282, pong)
        async def original_response(self):
            return await target.fetch_message(self.message.id)
    await respond_ping(Adapter())
    log.info("REMOTE_PING_HANDLER_OK real_discord_message=true synthetic_interaction=true")

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
                    await remote_smoke(self)
                except Exception as error:
                    log.error("REMOTE_TEST_FAILED type=%s status=%s", type(error).__name__, getattr(error, "status", None))

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
