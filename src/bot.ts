import { ApplicationCommandType, Client, Events, GatewayIntentBits, MessageFlags, PermissionFlagsBits, Routes, SlashCommandBuilder } from "discord.js";
import { createChannel, deleteMessages, errorCode, InputError, isTextTarget, ping } from "./operations";
import { startControl } from "./control";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Responde pong."),
  new SlashCommandBuilder().setName("deletemsg").setDescription("Apaga até 100 mensagens recentes do canal atual.")
    .setDMPermission(false).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o => o.setName("quantidade").setDescription("Quantidade de mensagens recentes a apagar").setRequired(true).setMinValue(1).setMaxValue(100)),
  new SlashCommandBuilder().setName("createchannel").setDescription("Cria um canal de texto ou voz.")
    .setDMPermission(false).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(o => o.setName("nome").setDescription("Nome do canal").setRequired(true))
    .addStringOption(o => o.setName("tipo").setDescription("Texto ou voz").setRequired(true).addChoices({name:"Texto",value:"text"},{name:"Voz",value:"voice"})),
];
let ready = false;
const expected = new Set(commands.map(c => c.name));
const server = startControl(client, () => ready);
client.once(Events.ClientReady, async c => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID;
    const route = guildId ? Routes.applicationGuildCommands(c.application.id, guildId) : Routes.applicationCommands(c.application.id);
    type Registered = {name:string;type:number;id:string};
    const existing = await c.rest.get(route) as Registered[];
    if (existing.some(cmd => !expected.has(cmd.name) || cmd.type !== ApplicationCommandType.ChatInput))
      throw new Error("Unexpected unrelated commands; registration aborted");
    await c.rest.put(route, {body:commands.map(command => command.toJSON())});
    const confirmed = await c.rest.get(route) as Registered[];
    if (confirmed.length !== expected.size || confirmed.some(cmd => !expected.has(cmd.name)))
      throw new Error("Command registration verification failed");
    for (const cmd of confirmed.values()) console.log("COMMAND_VERIFIED", JSON.stringify({name:cmd.name,command_id:cmd.id,scope:guildId?"guild":"global"}));
    ready = true;
    console.log("GATEWAY_READY", JSON.stringify({bot_id:c.user.id,guild_count:c.guilds.cache.size,runtime:process.version,language:"TypeScript"}));
  } catch (error) {
    console.error("REGISTRATION_FAILED", error instanceof Error ? error.name : "unknown", errorCode(error));
    process.exit(1);
  }
});
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  try {
    if (interaction.commandName === "ping") {
      await interaction.reply(ping());
      const message = await interaction.fetchReply();
      if (message.content !== ping()) throw new Error("Discord response mismatch");
      console.log("PING_VERIFIED", JSON.stringify({interaction_id:interaction.id,message_id:message.id,content:message.content}));
      return;
    }
    if (!interaction.inCachedGuild()) throw new InputError("Use este comando em um servidor.");
    if (interaction.commandName === "deletemsg") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageMessages)) throw new InputError("Permissão Gerenciar mensagens necessária.");
      if (!isTextTarget(interaction.channel)) throw new InputError("Use um canal de texto.");
      await interaction.deferReply({flags:MessageFlags.Ephemeral});
      const result = await deleteMessages(interaction.channel, interaction.options.getInteger("quantidade",true));
      console.log("SLASH_DELETE_RESULT", JSON.stringify({guild_id:interaction.guildId,actor_id:interaction.user.id,...result}));
      await interaction.editReply(`Apagadas: ${result.deleted} de ${result.requested}. Ausência verificada: ${result.verified_absent}.`);
    } else if (interaction.commandName === "createchannel") {
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) throw new InputError("Permissão Gerenciar canais necessária.");
      await interaction.deferReply({flags:MessageFlags.Ephemeral});
      const result = await createChannel(client,interaction.guild,interaction.options.getString("nome",true),interaction.options.getString("tipo",true));
      console.log("SLASH_CREATE_RESULT", JSON.stringify({guild_id:interaction.guildId,actor_id:interaction.user.id,...result}));
      await interaction.editReply(`Canal criado e verificado: <#${result.channel_id}>`);
    }
  } catch (error) {
    console.error("SLASH_FAILED",interaction.commandName,error instanceof Error?error.name:"unknown",errorCode(error));
    const message = error instanceof InputError ? error.message : "Operação não concluída. Confira as permissões e os logs.";
    try {
      if (interaction.deferred) await interaction.editReply(message);
      else if (interaction.replied) await interaction.followUp({content:message,flags:MessageFlags.Ephemeral});
      else await interaction.reply({content:message,flags:MessageFlags.Ephemeral});
    } catch { console.error("SLASH_ERROR_RESPONSE_FAILED", interaction.id); }
  }
});
client.on(Events.Error,error=>console.error("DISCORD_CLIENT_ERROR",error.name));
const token = process.env.DISCORD_BOT_TOKEN?.trim();
if (!token) { console.error("AWAITING_DISCORD_BOT_TOKEN"); process.exit(1); }
client.login(token).catch(error=>{console.error("BOT_START_FAILED",error instanceof Error?error.name:"unknown",errorCode(error));process.exit(1);});
const stop=()=>{ready=false;server.close();client.destroy();};
process.once("SIGTERM",stop);
process.once("SIGINT",stop);
