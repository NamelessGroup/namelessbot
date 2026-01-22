import { ISlashCommand } from "../../types";
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    CommandInteractionOptionResolver,
} from "discord.js";
import { embedLeaderboard } from "./aocEmbedGenerator";
import { ConfigurationFile, get } from "../../lib/configmanager";
import { DateTime } from "luxon";

/**
 * Slash command definition for /aoc, a command that sends the current leaderboard
 */
export default {
    command: {
        name: "aoc",
        description: "Returns the Advent of Code Leaderboard",
        options: [
            {
                type: ApplicationCommandOptionType.Integer,
                name: "year",
                description: "the year of the Advent of Code",
                min_value: 2022,
                max_value: DateTime.now().setZone("Europe/Berlin").year,
                required: false,
            },
        ],
    },
    handler: async function (interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        const requestedYear = options.getInteger("year", false);
        const year =
            requestedYear == null
                ? DateTime.now().setZone("Europe/Berlin").year
                : requestedYear;
        const embed = await embedLeaderboard(
            get("id", ConfigurationFile.AOC),
            year,
        );
        await interaction.reply({ embeds: [embed] });
    },
} as ISlashCommand;
