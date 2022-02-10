import {Client} from "discord.js";
import {SLASH_COMMANDS} from "../lib/commands";

const DIRECT_GUILD = "351806976713293826";

export default {
    event: 'ready',
    once: true,
    elevated: true,
    handler: async function(client: Client<true>) {
        await client.application.commands.set(SLASH_COMMANDS.map((e) => e.command), DIRECT_GUILD);
    }
}