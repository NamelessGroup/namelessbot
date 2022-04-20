import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import {CommandInteraction} from "discord.js";
import {ISlashCommand} from "../types";
import {BrainfuckInterpreter, InterpreterMode} from "../lib/bfinterpreter";

export let bfint:BrainfuckInterpreter[] = [];
export const MAX_INTERPRETER_INDEX_LENGTH = 1;
let lastIndex = 0;


export function incIndex() {
    return ++lastIndex;
}

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
            },
            {
                type:  ApplicationCommandOptionTypes.STRING,
                name: "regex",
                description: "Regex for Char input"
            }
        ]
    },
    handler: async function(interaction: CommandInteraction) {
        await interaction.deferReply();
        let s: boolean | InterpreterMode = interaction.options.getBoolean("interaction");
        if (s == null) {
            s = undefined
        } else if (s == true) {
            s = InterpreterMode.REQUEST_INPUT;
        } else {
            s = InterpreterMode.INPUT_BEHIND_COMMA;
        }
        const id = bfint.length;
        if (id == 10 ** MAX_INTERPRETER_INDEX_LENGTH - 1) {
            await interaction.editReply("To much interpreters running");

            await interaction.deleteReply();
            return
        }
        const b = new BrainfuckInterpreter(id, interaction.options.getString("brainfuck_code"),
            s as InterpreterMode, interaction, interaction.options.getString("regex"));
        bfint.push(b);
        await b.execute();
    }
} as ISlashCommand

export function destroy(id: number, interaction: CommandInteraction) {
    console.log("Destroying: " + id)
    const out = bfint[id].get();
    bfint[id] = undefined;
    if (out == "") {
        void interaction.followUp("No more Output");
    } else{
        void interaction.followUp(out);
    }
    for (let i = bfint.length - 1; i >= 0; --i) {
        if (bfint[i] == undefined) {
            bfint.pop();
        } else {
            break;
        }
    }
}