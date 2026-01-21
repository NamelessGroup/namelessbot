import {ISlashCommand} from "../types";
import {ApplicationCommandOptionType, CommandInteraction, CommandInteractionOptionResolver} from "discord.js";

/**
 * Slash command definition for /truthtable
 */
export default {
    command: {
        name: "test",
        description: "Test command",
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "test_argument",
                description: "Test",
                required: true
            }
        ]
    },
    handler: async function(interaction: CommandInteraction) {
        await interaction.deferReply();
        const options = interaction.options as CommandInteractionOptionResolver;

        await interaction.followUp(`You typed: \`${options.getString("test_argument")}\``);
    }
} as ISlashCommand;
