import {ISlashCommand} from "../types";
import {CommandInteraction} from "discord.js";
import {buildMensaEmbed, getMensaData} from "../lib/mensaparser";

export default {
    command: {
        name: "mensa",
        description: "Returns the foodplan of the mensa for today."
    },
    handler: async function(interaction: CommandInteraction) {
        await interaction.deferReply();
        const embed = buildMensaEmbed(await getMensaData());
        await interaction.followUp({ embeds: [embed] });
    }
} as ISlashCommand;
