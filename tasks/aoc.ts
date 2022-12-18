import {Client, TextChannel} from "discord.js";
import {TaskExecutor} from "../types";
import {embedLeaderboard} from "../lib/aocleaderboardparser"
import {get} from "../lib/configmanager";

export default (async (client: Client) => {
    const embed = await embedLeaderboard(get("id", "aoc") as number, get("year", "aoc") as number);
    const channel = await client.channels.fetch(get('announcement_channel', 'config') as string) as TextChannel;
    await channel.send({ embeds: [embed] });
}) as TaskExecutor