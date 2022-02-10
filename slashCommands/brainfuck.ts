import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import {CommandInteraction} from "discord.js";
import {ISlashCommand} from "../types";
import {BrainfuckInterpreter, InterpreterMode} from "../lib/bfinterpreter";

export let bfint:BrainfuckInterpreter[] = [];

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
        const id = bfint.length;
        const b = new BrainfuckInterpreter(id , interaction.options.getString("brainfuck_code"),
            s as InterpreterMode, interaction);
        bfint.push(b);
        await b.execute();
    }
} as ISlashCommand

export function destroy(id: number, interaction: CommandInteraction) {
    console.log("Destroying: " + id)
    let out = bfint[id].get();
    bfint[id] = undefined;
    if (out == "") {
        void interaction.followUp("No more Output");
    }
    void interaction.followUp(out);
    for (let i = bfint.length - 1; i >= 0; --i) {
        if (bfint[i] == undefined) {
            bfint.pop();
        } else {
            break;
        }
    }
}