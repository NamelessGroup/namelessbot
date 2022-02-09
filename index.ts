import {Client, Intents} from 'discord.js';
import 'dotenv/config'
import { checkForTasks } from "./lib/tasks";
import {addListeners} from "./lib/listeners";

const INTENTS = [
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS
]

const client = new Client({intents: INTENTS});

client.on("ready", (client) => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Event handlers
addListeners(client, true);

// Recurring tasks
setInterval(checkForTasks, 60000, client);

void client.login(process.env.DISCORD_TOKEN);
