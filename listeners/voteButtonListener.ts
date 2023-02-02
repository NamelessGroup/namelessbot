import {Client, Interaction} from "discord.js";
import {addVote} from "../slashCommands/vote";

export default (client: Client): void => {
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith("vote")) return;
        const idParts = interaction.customId.split("_");
        const title = idParts[1];
        const upVote = idParts[2] === "up";
        addVote(title, interaction.user.id, upVote);
    });
};