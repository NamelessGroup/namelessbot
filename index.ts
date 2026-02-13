import { Client, IntentsBitField } from "discord.js";
import "dotenv/config";
import { addListeners } from "./lib/listeners";
import {
    startRecurringTaskLoop,
    stopRecurringTaskLoop,
} from "./lib/tasks/taskRunner";
import { readConfig } from "./lib/configmanager";

const INTENTS = [
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildMembers,
];

/**
 * Main bot function
 */
async function main(): Promise<void> {
    const client = new Client({ intents: INTENTS });

    client.on("ready", (client) => {
        console.log(`Logged in as ${client.user.tag}`);
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
        void client.destroy();
        stopRecurringTaskLoop();
    });

    // Event handlers
    addListeners(client);

    // Recurring tasks
    startRecurringTaskLoop(client);

    // Reading config
    await readConfig();
    await client.login(process.env.DISCORD_TOKEN);
}

await main();
