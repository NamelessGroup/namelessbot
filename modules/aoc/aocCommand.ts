import {ISlashCommand} from "../../types";
import {CommandInteraction} from "discord.js";
import {embedLeaderboard} from "./aocEmbedGenerator";
import {get} from "../../lib/configmanager";
import {DateTime} from "luxon";

/**
 * Slash command definition for /aoc, a command that sends the current leaderboard
 */
export default {
    command: {
        name: "aoc",
        description: "Returns the Advent of Code Leaderboard"
    },
    handler: async function(interaction: CommandInteraction) {
        const now = DateTime.now().setZone("Europe/Berlin");
        const embed = await embedLeaderboard(get("id", "aoc") as number, now.year);
        await interaction.reply({ embeds: [embed] });
    }
} as ISlashCommand;
