import {Client, Intents} from 'discord.js';
import 'dotenv/config'
import {addListeners} from "./lib/listeners";
import {startRecurringTaskLoop} from "./lib/taskRunner";
import {readConfig} from "./lib/configmanager";

const INTENTS = [
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS
]

const client = new Client({intents: INTENTS});

client.on("ready", (client) => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    client.destroy();
})

// Event handlers
addListeners(client, true);

// Recurring tasks
startRecurringTaskLoop(client);

// Reading config
readConfig().then(() => {
    void client.login(process.env.DISCORD_TOKEN);
});
