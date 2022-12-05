import {ISlashCommand} from "../types";
import {CommandInteraction, TextChannel} from "discord.js";
import {buildMensaEmbed, getMensaData} from "../lib/mensaparser";
import {embedLeaderboard} from "../lib/aocleaderboardparser";
import {get} from "../lib/configmanager";

export default {
    command: {
        name: "aoc",
        description: "Returns the Advent of Code Leaderboard"
    },
    handler: async function(interaction: CommandInteraction) {
        const embed = await embedLeaderboard(get("id", "aoc.json") as number, get("year", "aoc.json") as number)
        const channel = await interaction.client.channels.fetch(get('announcement_channel', 'config') as string) as TextChannel;
        await interaction.reply({ embeds: [embed] })
    }
} as ISlashCommand;
