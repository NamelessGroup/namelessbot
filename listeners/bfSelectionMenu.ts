import {Interaction} from "discord.js";
import {bfint, MAX_INTERPRETER_INDEX_LENGTH} from "../slashCommands/brainfuck";

export default {
    event: 'interactionCreate',
    elevated: true,
    handler: async(interaction: Interaction) => {
        if(!interaction.isSelectMenu()) return;
        if(!interaction.customId.startsWith("brainfuck")) return;

        await interaction.deferReply();

        const id = interaction.customId.slice(9, 9 + MAX_INTERPRETER_INDEX_LENGTH);
        bfint[id].setNextChar(interaction.values[0]);
        await bfint[id].execute();
        await interaction.deleteReply();
    }
}