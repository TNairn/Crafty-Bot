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

// File stores the entire history of splish-splash text channel.
const filepath = "splash.txt";

function readyDiscord() {
    console.log("Ready! Logged in as " + client.user.tag);
}

client.once(Events.ClientReady, readyDiscord);
client.login(process.env.TOKEN);

async function handleCommand(interaction) {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === "creep") {
        await creep.execute(interaction);
    }
}

client.on(Events.InteractionCreate, handleCommand);

// Function that searches splish-splash history for a message that matches the parmeter.
async function findMatch(message) {
    try {
        // Setup file reading system.
        const fileStream = fs.createReadStream(filepath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity,
        });

        let match = false;

        // Establish Promise to ensure match is finalized before return.
        const waitForClose = new Promise((resolve) => {
            rl.once("close", () => {
                resolve(match);
            });
        });

        // Check each line in splash.txt for a match.
        rl.on("line", (line) => {
            if (line === message.content) {
                match = true;
                rl.close();
            }
        });

        // Wait for search completion and return the value of match.
        await waitForClose;
        return match;
    } catch (error) {
        console.error("Error in findMatch:", error);
        return false; // Return false on error.
    }
}

client.on(Events.MessageCreate, async (message) => {
    // For any new message in splish-splash channel.
    if (message.channel.name === "splish-splash") {
        // If it is a bot message, delete it after 8 seconds and return.
        if (message.author.bot) {
            setTimeout(() => {
                message.delete();
            }, 8000);
            return;
        }
        // Call function that searches the channel history for a matching message.
        const match = await findMatch(message);

        // If a match is found, delete it and notify why.
        if (match) {
            message.delete();
            message.channel.send(
                "Hello <@" +
                    message.author +
                    ">,\n" +
                    "A matching message has been found, so yours has been deleted."
            );
        } else {
            // If no match found, add the message to the channel message history file.
            fs.appendFileSync(filepath, message.content + "\n");
        }
    }
    // Behavior for new messages in other channels can be placed here.
});
