import {ISelectionMenu} from "../types";
import {SelectMenuInteraction} from "discord.js";
import {bfint} from "../slashCommands/brainfuck";

export default {
    defaultId: "brainfuck",
    compLen: 9,
    handler(interaction: SelectMenuInteraction) {
        const id = interaction.customId.slice(this.compLen);
        bfint[id].setNextChar(interaction.values[0]);
        bfint[id].execute();
    }
} as ISelectionMenu