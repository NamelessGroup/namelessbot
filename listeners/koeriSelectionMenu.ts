import {Interaction} from "discord.js";
import {setRating} from "../slashCommands/koeri";

const REGEX = /koeri-u(\d+)\$(\d+)/;

/**
 * Handler for the koeri interaction.
 */
export default {
    event: 'interactionCreate',
    elevated: true,
    handler: async function(interaction: Interaction) {
        if(!interaction.isSelectMenu()) return;
        const match = REGEX.exec(interaction.customId);
        if(!match) return;
        await interaction.deferReply({ ephemeral: true });
        if(interaction.user.id !== match[1]) {
            await interaction.followUp({ ephemeral: true, content: "Dies ist nicht deine Kombination!"});
            return;
        }
        await setRating(match[1], parseInt(match[2]), parseInt(interaction.values[0]));
        await interaction.followUp({ ephemeral: true, content: `Kombination ${match[2]} bewertet mit ${interaction.values[0]}` });
    }
};