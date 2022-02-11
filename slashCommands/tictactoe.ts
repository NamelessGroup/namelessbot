import {ISlashCommand} from "../types";
import {CommandInteraction} from "discord.js";
import {readFileSync} from "fs";
import {bfint, MAX_INTERPRETER_INDEX_LENGTH} from "./brainfuck";
import {BrainfuckInterpreter, InterpreterMode} from "../lib/bfinterpreter";


export default {
    command: {
        name: "tictactoe",
        description: "Play a game tictactoe",
        options: []
    },
    handler: async function(interaction: CommandInteraction) {
        const id = bfint.length;
        if (id == 10 ** MAX_INTERPRETER_INDEX_LENGTH - 1) {
            await interaction.editReply("To much interpreters running");

            await interaction.deleteReply();
            return
        }
        const code = readFileSync("assets/txt/tictactoe.bf").toString()
        const b = new BrainfuckInterpreter(id, code,
            InterpreterMode.REQUEST_INPUT, interaction, "[1-9]");
        bfint.push(b);
        await b.execute();
    }
} as ISlashCommand