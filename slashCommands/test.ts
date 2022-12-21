import {ISlashCommand} from "../types";
import {ApplicationCommandOptionType, CommandInteraction, CommandInteractionOptionResolver} from "discord.js";

/**
 * Slash command definition for /test
 */
export default {
    command: {
        name: "test",
        description: "This is a test command",
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "test_argument",
                description: "Some test argument",
            }
        ]
    },
    handler: async function(interaction: CommandInteraction) {
        await interaction.deferReply();
        console.log(interaction.options.data);
        const options = interaction.options as CommandInteractionOptionResolver;
        await interaction.followUp("You typed: `" + options.getString("test_argument") + "`");
    }
} as ISlashCommand;