import {CommandInteraction, Interaction} from "discord.js";
import {SLASH_COMMANDS} from "../lib/commands";

export default {
    event: 'interactionCreate',
    elevated: true,
    handler: async (interaction: Interaction) => {
        if(!interaction.isCommand()) return;

        const commands = SLASH_COMMANDS.filter((c) => {
            return c.command.name === (interaction as CommandInteraction).commandName
        });

        for(const c of commands) {
            await c.handler(interaction as CommandInteraction);
        }
    }
}