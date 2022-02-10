import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import {CommandInteraction} from "discord.js";
import {ISlashCommand} from "../types";
import {BrainfuckInterpreter, InterpreterMode} from "../lib/bfinterpreter";

export default {
    command: {
        name: "brainfuck",
        description: "A Command to use Brainfuck",
        options: [
            {
                type: ApplicationCommandOptionTypes.STRING,
                name: "brainfuck_code",
                description: "Some test argument",
                required: true,
            },
            {
                type: ApplicationCommandOptionTypes.BOOLEAN,
                name: "interaction",
                description: "Interaction",
            }
        ]
    },
    handler: async function(interaction: CommandInteraction) {
        let s: boolean | InterpreterMode = interaction.options.getBoolean("interaction");
        if (s == null) {
            s = undefined
        } else if (s == true) {
            s = InterpreterMode.REQUEST_INPUT;
        } else {
            s = InterpreterMode.INPUT_BEHIND_COMMA;
        }
        const b = new BrainfuckInterpreter(interaction.options.getString("brainfuck_code"),
            s as InterpreterMode, interaction);
        await b.execute();
        await interaction.followUp("Brainfuck says: `" + b.get() + "`");
    }
} as ISlashCommand