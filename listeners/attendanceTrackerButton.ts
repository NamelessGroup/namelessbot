import { Interaction } from "discord.js";
import { updateAttendance } from "../lib/attendancetracker";

const REGEX = /attendancetracker-(\d)-(.+)/

export default {
    event: 'interactionCreate',
    elevated: false,
    handler: async function(interaction: Interaction) {
        if (!interaction.isButton()) return;
        const match = REGEX.exec(interaction.customId);
        if (!match) return;
        await interaction.deferReply({ ephemeral: true });
        await updateAttendance(interaction.message, parseInt(match[1]), match[2], interaction.user.id);
        await interaction.followUp({ ephemeral: true, content: "Attendance successfully updated."});
    }
}