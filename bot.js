import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import * as creep from "./commands/creep.js";

config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

function readyDiscord() {
    console.log("Ready! Logged in as " + client.user.tag);
}

client.once(Events.ClientReady, readyDiscord);
client.login(process.env.TOKEN);

async function handleInteraction(interaction) {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === "creep") {
        await creep.execute(interaction);
    }
}

client.on(Events.InteractionCreate, handleInteraction);
