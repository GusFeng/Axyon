import { ChannelType, Client, DiscordAPIError, Guild, GuildMember, Message, PermissionFlagsBits, TextChannel, ThreadChannel } from "discord.js";

export const ping = (): string => "pong";
export class InputError extends Error {}
export function quantity(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 100)
    throw new InputError("Quantidade deve estar entre 1 e 100.");
  return value;
}
export function channelName(value: unknown, kind: "text" | "voice"): string {
  if (typeof value !== "string") throw new InputError("Nome obrigatório.");
  const name = value.trim();
  if (name.length < 1 || name.length > 100 || /[\x00-\x1f]/.test(name))
    throw new InputError("Nome inválido (1 a 100 caracteres).");
  return kind === "text" ? name.toLowerCase().replace(/\s+/g, "-") : name;
}
export function channelKind(value: unknown): "text" | "voice" {
  if (value !== "text" && value !== "voice") throw new InputError("Tipo deve ser texto ou voz.");
  return value;
}
export type TextTarget = TextChannel | ThreadChannel;
export function isTextTarget(channel: unknown): channel is TextTarget {
  return channel instanceof TextChannel || channel instanceof ThreadChannel;
}
export function errorCode(error: unknown): number | string | undefined {
  return error instanceof DiscordAPIError ? error.code : undefined;
}
export function unknownMessage(error: unknown): boolean {
  return errorCode(error) === 10008;
}
async function botMember(guild: Guild): Promise<GuildMember> {
  return guild.members.me ?? await guild.members.fetchMe();
}
export async function createChannel(client: Client, guild: Guild, rawName: unknown, rawKind: unknown) {
  const kind = channelKind(rawKind);
  const name = channelName(rawName, kind);
  const member = await botMember(guild);
  if (!member.permissions.has(PermissionFlagsBits.ManageChannels))
    throw new InputError("O bot precisa de Gerenciar canais.");
  const type = kind === "text" ? ChannelType.GuildText : ChannelType.GuildVoice;
  const created = await guild.channels.create({ name, type, reason: "RaiBot createchannel" });
  const confirmed = await client.channels.fetch(created.id, { force: true });
  if (!confirmed || !("guildId" in confirmed) || confirmed.guildId !== guild.id || confirmed.type !== type || confirmed.name !== created.name)
    throw new Error("Canal criado, mas a verificação falhou.");
  return { channel_id: confirmed.id, name: confirmed.name, type: kind };
}
export async function deleteMessages(channel: TextTarget, rawCount: unknown) {
  const count = quantity(rawCount);
  const member = await botMember(channel.guild);
  const perms = channel.permissionsFor(member);
  if (!perms?.has([PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ViewChannel]))
    throw new InputError("O bot precisa de Gerenciar mensagens e Ler histórico.");
  const messages = await channel.messages.fetch({ limit: count, cache: false });
  const recent: Message[] = [], old: Message[] = [];
  const cutoff = Date.now() - 14 * 86400000 + 60000;
  for (const message of messages.values()) (message.createdTimestamp > cutoff ? recent : old).push(message);
  const deleted = new Set<string>();
  if (recent.length >= 2) {
    const removed = await channel.bulkDelete(recent, true);
    for (const id of removed.keys()) deleted.add(id);
  }
  for (const message of [...recent.filter(m => !deleted.has(m.id)), ...old]) {
    try { await message.delete(); deleted.add(message.id); }
    catch (error) { if (!unknownMessage(error)) throw error; }
  }
  let verified = 0;
  for (const id of deleted) {
    try { await channel.messages.fetch({ message: id, force: true, cache: false }); }
    catch (error) { if (unknownMessage(error)) verified++; else throw error; }
  }
  return { requested: count, deleted: deleted.size, verified_absent: verified, channel_id: channel.id };
}
