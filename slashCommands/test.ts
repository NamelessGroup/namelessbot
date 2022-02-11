import {ISlashCommand} from "../types";
import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import {CommandInteraction} from "discord.js";

export default {
    command: {
        name: "test",
        description: "This is a test command",
        options: [
            {
                type: ApplicationCommandOptionTypes.STRING,
                name: "test_argument",
                description: "Some test argument",
            }
        ]
    },
    handler: async function(interaction: CommandInteraction) {
        await interaction.deferReply();
        console.log(interaction.options.data);
        await interaction.followUp("You typed: `" + interaction.options.getString("test_argument") + "`");
    }
} as ISlashCommand