import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Responde pong."),
  new SlashCommandBuilder().setName("deletemsg").setDescription("Apaga até 100 mensagens recentes do canal atual.")
    .setDMPermission(false).setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(o => o.setName("quantidade").setDescription("Quantidade de mensagens recentes a apagar").setRequired(true).setMinValue(1).setMaxValue(100)),
  new SlashCommandBuilder().setName("createchannel").setDescription("Cria um canal de texto ou voz.")
    .setDMPermission(false).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption(o => o.setName("nome").setDescription("Nome do canal").setRequired(true))
    .addStringOption(o => o.setName("tipo").setDescription("Texto ou voz").setRequired(true).addChoices({name:"Texto",value:"text"},{name:"Voz",value:"voice"})),
];
