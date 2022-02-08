import {Client, Intents} from 'discord.js';
import 'dotenv/config'
import messageCreate from "./listeners/messageCreate";

const intents = [
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILDS
]

const client = new Client({intents});

client.on("ready", (client) => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Event handlers
client.on("messageCreate", messageCreate);

void client.login(process.env.DISCORD_TOKEN);
