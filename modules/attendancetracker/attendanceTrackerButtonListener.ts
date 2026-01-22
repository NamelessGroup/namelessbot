import { Interaction } from "discord.js";
import { updateAttendance } from "./attendanceTracker";

const REGEX = /attendancetracker-(\d)-(.+)/;

/**
 * Event object for handling the Button presses of a timetable
 */
export default {
    event: "interactionCreate",
    elevated: false,
    /**
     * The handler function for the Button interaction
     *
     * @param interaction The interaction this was called for
     */
    handler: async function (interaction: Interaction): Promise<void> {
        if (!interaction.isButton()) return;
        const match = REGEX.exec(interaction.customId);
        if (!match) return;
        await interaction.deferReply({ ephemeral: true });
        await updateAttendance(
            interaction.message,
            parseInt(match[1]),
            match[2],
            interaction.user.id,
        );
        await interaction.followUp({
            ephemeral: true,
            content: "Attendance successfully updated.",
        });
    },
};
