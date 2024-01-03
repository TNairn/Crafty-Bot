import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import * as creep from "./commands/creep.js";

config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
    ],
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

async function findMessages(message) {
    const history = await message.channel.messages.fetch({
        before: message.id,
    });
    return history.some((msg) => msg.content === message.content);
}

client.on(Events.MessageCreate, async (message) => {
    if (message.channel.name === "test") {
        //eventually this channel should be splish-splash
        if (message.author.bot) {
            setTimeout(() => {
                message.delete();
            }, 8000);
            return;
        }
        //call function that searches the rest of the channel for a matching message
        const match = await findMessages(message);
        if (match) {
            message.delete();
            message.channel.send(
                "Hello <@" +
                    message.author +
                    ">,\n" +
                    "A matching message has been found, so yours has been deleted."
            );
        }
    }
});
