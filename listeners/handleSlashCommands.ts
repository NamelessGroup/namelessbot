import {CommandInteraction, Interaction} from "discord.js";
import {SLASH_COMMANDS} from "../lib/commands";
import { IEventListener } from "../types";

/**
 * Event handler for handling slash commands
 */
export default {
    event: 'interactionCreate',
    elevated: true,
    handler: async (interaction: Interaction) => {
        if(!interaction.isCommand()) return;

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
} as IEventListener;