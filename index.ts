import {Client, IntentsBitField} from 'discord.js';
import 'dotenv/config';
import {addListeners} from "./lib/listeners";
import {startRecurringTaskLoop, stopRecurringTaskLoop} from "./lib/tasks/taskRunner";
import {readConfig} from "./lib/configmanager";

const INTENTS = [
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildMembers
];

const client = new Client({intents: INTENTS});

client.on("ready", (client) => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    client.destroy();
    stopRecurringTaskLoop();
});

// Event handlers
addListeners(client, true);

// Recurring tasks
startRecurringTaskLoop(client);

// Reading config
readConfig().then(() => {
    void client.login(process.env.DISCORD_TOKEN);
});
