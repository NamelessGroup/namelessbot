import {Client} from "discord.js";
import {SLASH_COMMANDS} from "../lib/commands";
import {get} from "../lib/configmanager";
import { IEventListener } from "../types";

/**
 * Event handler for registering slash commands.
 * Will only be ran once, at startup
 */
export default {
    event: 'ready',
    once: true,
    elevated: true,
    handler: async function(client: Client<true>) {
        const DIRECT_GUILD = get("default_guild", "config") as string;
        if(DIRECT_GUILD === "") {
            console.log("! No default_guild is set in 'config.json' - Slash commands can't be registered!");
        } else {
            await client.application.commands.set(SLASH_COMMANDS.map((e) => e.command), DIRECT_GUILD);
        }
    }
} as IEventListener;