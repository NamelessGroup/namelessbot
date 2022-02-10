import {Interaction, SelectMenuInteraction} from "discord.js";
import {SELECTION_MENUS} from "../lib/commands";


export default {
    event: "interactionCreate",
    elevated: true,
    handler: async (interaction:Interaction) => {
        if (!interaction.isSelectMenu()) return;

        await interaction.deferReply();

        const selectmenu = SELECTION_MENUS.filter((c)=>{
            return c.defaultId === (interaction as SelectMenuInteraction).customId.slice(0, c.compLen == undefined ? c.defaultId.length : c.compLen);
        })

        for(const c of selectmenu) {
            await c.handler(interaction as SelectMenuInteraction)
        }

    }

}