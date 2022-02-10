import {Client} from "discord.js";
import {SLASH_COMMANDS} from "../lib/commands";

const DIRECT_GUILD = "899732430796230677";

export default {
    event: 'ready',
    once: true,
    elevated: true,
    handler: async function(client: Client<true>) {
        await client.application.commands.set(SLASH_COMMANDS.map((e) => e.command), DIRECT_GUILD);
    }
}