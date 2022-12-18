import {ISlashCommand} from "../types";
import {CommandInteraction} from "discord.js";
import {embedLeaderboard} from "../lib/aocleaderboardparser";
import {get} from "../lib/configmanager";

export default {
    command: {
        name: "aoc",
        description: "Returns the Advent of Code Leaderboard"
    },
    handler: async function(interaction: CommandInteraction) {
        const embed = await embedLeaderboard(get("id", "aoc") as number, get("year", "aoc") as number);
        await interaction.reply({ embeds: [embed] });
    }
} as ISlashCommand;