import {Client, CommandInteraction, Interaction} from "discord.js";
import { get } from "./configmanager";
import { LISTENERS, SLASH_COMMANDS } from "./registry";

/**
 * Adds all event listeners to the supplied client.
 * 
 * @param client Client to add listeners to
 * @param includeElevated If true, elevated listeners will also be added
 */
export function addListeners(client: Client, includeElevated = false): void {
    for(const l of LISTENERS) {
        if(!l.elevated || includeElevated) {
            if(l.once) {
                client.once(l.event, l.handler);
            } else {
                client.on(l.event, l.handler);
            }
        }
    }

    // Special slash command listeners
    client.once("ready", registerSlashCommands);
    client.on("interactionCreate", handleSlashCommands);
}

/**
 * Removes all event listeners from the supplied client.
 * 
 * @param client Client to remove listeners from
 * @param includeElevated If true, elevated listeners will also be removed
 */
export function removeListeners(client: Client, includeElevated = false): void {
    for(const l of LISTENERS) {
        if(!l.elevated || includeElevated) {
            client.removeListener(l.event, l.handler);
        }
    }
}

/**
 * Registers all slash commands to the guild set in the config.
 * 
 * @param client Client to register slash commands with
 */
async function registerSlashCommands(client: Client<true>): Promise<void> {
    const DIRECT_GUILD = get("default_guild", "config") as string;
    if(DIRECT_GUILD === "") {
        console.log("! No default_guild is set in 'config.json' - Slash commands can't be registered!");
    } else {
        await client.application.commands.set(SLASH_COMMANDS.map((e) => e.command), DIRECT_GUILD);
    }
}

/**
 * Handler for all slash commands.
 * 
 * @param interaction Interaction to handle
 */
async function handleSlashCommands(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand()) return;

    const commands = SLASH_COMMANDS.filter((c) => {
        return c.command.name === (interaction as CommandInteraction).commandName;
    });

    for(const c of commands) {
        try {
            await c.handler(interaction as CommandInteraction);
        } catch (e) {
            console.log(e);
            await interaction.reply("There was an error while trying to parse your command.");
        }
    }
}