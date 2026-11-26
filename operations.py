"""Shared Discord operations; slash and authenticated remote callers use this module."""
import asyncio
import re
import discord

PONG = "pong"

def ping():
    return PONG

def quantity(value):
    if type(value) is not int or not 1 <= value <= 100:
        raise ValueError("Quantidade deve estar entre 1 e 100.")
    return value

def channel_name(name):
    name = name.strip()
    if not 1 <= len(name) <= 100 or any(ord(c) < 32 for c in name):
        raise ValueError("Nome inválido (1 a 100 caracteres).")
    return name

async def create_channel(client, guild, name, kind):
    name = channel_name(name)
    if kind not in ("text", "voice"):
        raise ValueError("Tipo deve ser text ou voice.")
    if not guild.me or not guild.me.guild_permissions.manage_channels:
        raise PermissionError("O bot precisa de Gerenciar canais.")
    if kind == "text":
        name = re.sub(r"\s+", "-", name.lower())
        channel = await guild.create_text_channel(name, reason="RaiBot createchannel")
        expected = discord.ChannelType.text
    else:
        channel = await guild.create_voice_channel(name, reason="RaiBot createchannel")
        expected = discord.ChannelType.voice
    confirmed = await client.fetch_channel(channel.id)
    if confirmed.guild.id != guild.id or confirmed.type != expected:
        raise RuntimeError("Canal criado, mas a verificação falhou.")
    return {"channel_id": str(confirmed.id), "name": confirmed.name, "type": kind}

async def delete_messages(channel, count):
    count = quantity(count)
    if not isinstance(channel, (discord.TextChannel, discord.Thread)):
        raise ValueError("Use um canal de texto.")
    member = channel.guild.me
    if not member:
        raise PermissionError("Bot indisponível no servidor.")
    perms = channel.permissions_for(member)
    if not (perms.manage_messages and perms.read_message_history and perms.view_channel):
        raise PermissionError("O bot precisa de Gerenciar mensagens e Ler histórico.")
    # Discord.py divides bulk deletions and handles old messages individually.
    removed = await channel.purge(limit=count, bulk=True, reason="RaiBot deletemsg")
    async def verify(message):
        try:
            await channel.fetch_message(message.id)
        except discord.NotFound as error:
            if error.code == 10008:
                return True
            raise
        return False
    verified = 0
    for message in removed:
        verified += int(await verify(message))
    return {"requested": count, "deleted": len(removed), "verified_absent": verified,
            "channel_id": str(channel.id)}
