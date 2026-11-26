"""RaiBot permanent slash and remote command interfaces."""
import asyncio
import os
import logging
import discord
from discord import app_commands
from operations import ping, create_channel, delete_messages
from control import start_control

log = logging.getLogger("raibot")
PONG = "pong"
EXPECTED = {"ping", "deletemsg", "createchannel"}

async def respond_ping(interaction):
    await interaction.response.send_message(ping())
    original = await interaction.original_response()
    if original.content != PONG:
        raise RuntimeError("Discord response content mismatch")
    log.info("PING_VERIFIED interaction_id=%s message_id=%s content=pong", interaction.id, original.id)

class RaiClient(discord.Client):
    def __init__(self):
        super().__init__(intents=discord.Intents(guilds=True))
        self.tree = app_commands.CommandTree(self)
        self.control_runner = None

    async def setup_hook(self):
        guild = discord.Object(id=int(os.environ["DISCORD_GUILD_ID"])) if os.environ.get("DISCORD_GUILD_ID") else None
        if guild:
            self.tree.copy_global_to(guild=guild)
        existing = await self.tree.fetch_commands(guild=guild)
        if any(c.name not in EXPECTED or c.type != discord.AppCommandType.chat_input for c in existing):
            raise RuntimeError("Unexpected unrelated commands; registration aborted")
        await self.tree.sync(guild=guild)
        confirmed = await self.tree.fetch_commands(guild=guild)
        if {c.name for c in confirmed} != EXPECTED:
            raise RuntimeError("Command registration verification failed")
        for cmd in confirmed:
            log.info("COMMAND_VERIFIED name=%s command_id=%s scope=%s", cmd.name, cmd.id, "guild" if guild else "global")
        self.control_runner = await start_control(self)

    async def on_ready(self):
        log.info("GATEWAY_READY bot_id=%s guild_count=%s", self.user.id, len(self.guilds))

    async def close(self):
        if self.control_runner:
            await self.control_runner.cleanup()
        await super().close()

client = RaiClient()

@client.tree.command(name="ping", description="Responde pong.")
async def ping_command(interaction: discord.Interaction):
    await respond_ping(interaction)

@client.tree.command(name="deletemsg", description="Apaga até 100 mensagens recentes do canal atual.")
@app_commands.guild_only()
@app_commands.default_permissions(manage_messages=True)
@app_commands.checks.has_permissions(manage_messages=True)
@app_commands.describe(quantidade="Quantidade de mensagens recentes a apagar")
async def delete_command(interaction: discord.Interaction, quantidade: app_commands.Range[int, 1, 100]):
    await interaction.response.defer(ephemeral=True)
    result = await delete_messages(interaction.channel, quantidade)
    log.info("SLASH_DELETE_RESULT guild_id=%s actor_id=%s result=%s", interaction.guild_id, interaction.user.id, result)
    await interaction.followup.send(f"Apagadas: {result['deleted']} de {quantidade}. Ausência verificada: {result['verified_absent']}.", ephemeral=True)

@client.tree.command(name="createchannel", description="Cria um canal de texto ou voz.")
@app_commands.guild_only()
@app_commands.default_permissions(manage_channels=True)
@app_commands.checks.has_permissions(manage_channels=True)
@app_commands.describe(nome="Nome do canal", tipo="Texto ou voz")
@app_commands.choices(tipo=[app_commands.Choice(name="Texto", value="text"), app_commands.Choice(name="Voz", value="voice")])
async def create_command(interaction: discord.Interaction, nome: str, tipo: app_commands.Choice[str]):
    await interaction.response.defer(ephemeral=True)
    result = await create_channel(client, interaction.guild, nome, tipo.value)
    log.info("SLASH_CREATE_RESULT guild_id=%s actor_id=%s result=%s", interaction.guild_id, interaction.user.id, result)
    await interaction.followup.send(f"Canal criado e verificado: <#{result['channel_id']}>", ephemeral=True)

@client.tree.error
async def on_error(interaction, error):
    original = getattr(error, "original", error)
    log.warning("SLASH_FAILED command=%s error=%s status=%s", getattr(interaction.command, "name", None), type(original).__name__, getattr(original, "status", None))
    msg = str(original) if isinstance(original, (ValueError, PermissionError)) else "Operação não concluída. Confira as permissões e os logs."
    if interaction.response.is_done():
        await interaction.followup.send(msg, ephemeral=True)
    else:
        await interaction.response.send_message(msg, ephemeral=True)

def main():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
    logging.getLogger("discord").setLevel(logging.WARNING)
    token = os.environ.get("DISCORD_BOT_TOKEN", "").strip()
    if not token:
        log.error("AWAITING_DISCORD_BOT_TOKEN")
        return
    try:
        client.run(token, log_handler=None)
    except Exception as error:
        log.error("BOT_START_FAILED type=%s status=%s", type(error).__name__, getattr(error, "status", None))
        raise SystemExit(1) from None

if __name__ == "__main__":
    main()
