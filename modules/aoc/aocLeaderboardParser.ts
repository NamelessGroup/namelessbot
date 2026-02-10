import type { aocData, aocMember } from "./aocTypes";
import { ofetch } from "ofetch";

const url = "https://adventofcode.com/";
const path = "/leaderboard/private/view/";

/**
 * Gets the current leaderboard data from the AoC servers
 *
 * @param id ID of the leaderboard
 * @param year Year of this AoC competition
 * @returns Array of members of this leaderboard
 */
export async function requestLeaderboard(
    id: number,
    year: number,
): Promise<aocMember[]> {
    const concaturl = url + year + path + id + ".json";
    const data = await ofetch<aocData>(concaturl, {
        headers: {
            "Content-Type": "application/json",
            cookie: "session=" + process.env.AOC_SESSION,
        },
    });
    const members = Object.values(data.members);
    members.sort((a, b) => {
        if (a.local_score < b.local_score) {
            return 1;
        } else if (a.local_score > b.local_score) {
            return -1;
        }
        return 0;
    });
    return members;
}
