import {ISelectionMenu} from "../types";
import {SelectMenuInteraction} from "discord.js";
import {bfint, MAX_INTERPRETER_INDEX_LENGTH} from "../slashCommands/brainfuck";

export default {
    defaultId: "brainfuck",
    compLen: 9,
    handler(interaction: SelectMenuInteraction) {
        const id = interaction.customId.slice(this.compLen, this.compLen + MAX_INTERPRETER_INDEX_LENGTH);
        bfint[id].setNextChar(interaction.values[0]);
        bfint[id].execute();
        void interaction.deleteReply();
    }
} as ISelectionMenu