import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
    .setName("creep")
    .setDescription("Display a creepy face.");

export async function execute(interaction) {
    await interaction.reply("<:creeper:1191566770436329573>");
}
