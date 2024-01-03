import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";
import * as fs from "fs";
import * as readline from "readline";
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
const filepath = "splash.txt";

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

async function findMatch(message) {
    try {
        const fileStream = fs.createReadStream(filepath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });

        let match = false;

        const waitForClose = new Promise((resolve) => {
            rl.once("close", () => {
                resolve(match);
            });
        });

        rl.on("line", (line) => {
            if (line === message.content) {
                match = true;
                //rl.removeAllListeners("line"); // Detach the 'line' event
                rl.close();
            }
        });

        await waitForClose;
        return match;
    } catch (error) {
        console.error("Error in findMatch:", error);
        return false; // Return false on error
    }
}

client.on(Events.MessageCreate, async (message) => {
    if (message.channel.name === "splish-splash") {
        if (message.author.bot) {
            setTimeout(() => {
                message.delete();
            }, 8000);
            return;
        }
        //call function that searches the rest of the channel for a matching message
        const match = await findMatch(message);
        if (match) {
            message.delete();
            message.channel.send(
                "Hello <@" +
                    message.author +
                    ">,\n" +
                    "A matching message has been found, so yours has been deleted."
            );
        } else {
            fs.appendFileSync(filepath, message.content + "\n");
        }
    }
});
