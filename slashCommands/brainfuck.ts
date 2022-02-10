import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import {CommandInteraction} from "discord.js";
import {ISlashCommand} from "../types";
import {BrainfuckInterpreter} from "../lib/bfinterpreter";

export default {
    command: {
        name: "brainfuck",
        description: "A Command to use Brainfuck",
        options: [
            {
                type: ApplicationCommandOptionTypes.STRING,
                name: "test_argument",
                description: "Some test argument",
            }
        ]
    },
    handler: async function(interaction: CommandInteraction) {
        let s:string = "";
        if ( interaction.options.getString("test_argument") == null) {
            return;
        } else {
            s = interaction.options.getString("test_argument") as string;
        }
        const b = new BrainfuckInterpreter(s)
        await interaction.followUp("Brainfuck says: `" + b.get() + "`");
    }
} as ISlashCommand