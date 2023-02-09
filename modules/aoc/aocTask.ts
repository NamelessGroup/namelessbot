import {Client, TextChannel} from "discord.js";
import {TaskExecutor} from "../../types";
import {embedLeaderboard} from "./aocLeaderboardParser";
import {get} from "../../lib/configmanager";
import {DateTime} from "luxon";

/**
 * TaskExecutor that sends the current standings for the AoC competition.
 * Sends final results the day after AoC ends and a reminder the day before it starts.
 * Does not send messages outside the AoC competition time frame.
 *
 * @param client Client to execute task with
 */
export default (async (client: Client) => {
    const now = DateTime.now().setZone("Europe/Berlin");
    if (now.month == 11 && now.day == 30) {
        const channel = await client.channels.fetch(get('announcement_channel', 'config') as string) as TextChannel;
        await channel.send({ content: `:star: Advent of Code ${now.year} starts tomorrow :star2:`});
        return;
    }
    if (now.month != 12 || now.day > 26) {
        return;
    }

    const content = now.day == 26 ? `Final Results of AoC ${now.year}` : ``;
    const embed = await embedLeaderboard(get("id", "aoc") as number, now.year);
    const channel = await client.channels.fetch(get('announcement_channel', 'config') as string) as TextChannel;
    await channel.send({ content: content, embeds: [embed] });
}) as TaskExecutor;
