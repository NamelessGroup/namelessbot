import { EmbedBuilder } from "discord.js";
import { requestLeaderboard } from "./aocLeaderboardParser";

/**
 * Generates the embed for displaying a leaderboard
 *
 * @param id ID of the leaderboard
 * @param year Year of this AoC competition
 * @returns The Embed for showing the leaderboard
 */
export async function embedLeaderboard(
    id: number,
    year: number,
): Promise<EmbedBuilder> {
    const members = await requestLeaderboard(id, year);
    const map = {} as { [key: string]: string };
    for (const m of members) {
        map[m.name] = "";
        for (const k in m.completion_day_level) {
            let emoji = ":eight_pointed_black_star:";
            if (
                m.completion_day_level[k]["1"] != null &&
                m.completion_day_level[k]["1"].get_star_ts !== 0
            ) {
                if (
                    m.completion_day_level[k]["2"] != null &&
                    m.completion_day_level[k]["2"].get_star_ts !== 0
                ) {
                    emoji = ":star2:";
                } else {
                    emoji = ":star:";
                }
            }
            map[m.name] = map[m.name] + emoji;
        }
    }

    return new EmbedBuilder()
        .setURL("https://adventofcode.com")
        .setTitle("Advent of Code Leaderboard")
        .addFields(
            ...members
                .filter((m) => map[m.name] != null && map[m.name].length > 0)
                .map((m) => {
                    return {
                        name: m.name + ": " + m.local_score,
                        value: map[m.name],
                    };
                }),
        );
}
