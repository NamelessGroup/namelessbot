import axios from "axios";
import {EmbedBuilder} from "discord.js";

const url = "https://adventofcode.com/"
const path = "/leaderboard/private/view/"
interface aoc_data {
    event: string
    owner_id: number
    members: {
        [id:number]:aoc_member
    }
}

interface aoc_member {
    last_start_ts: number
    id: number
    local_score: number
    stars: number
    name: string
    global_score: number
    completion_day_level: {
        [day:number]: {
            1: {
                get_star_ts: number
                star_index: number
            }
            2: {
                get_star_ts: number
                star_index: number
            }
        }
    }
}
export async function requestLeaderboard(id: number, year: number) {
    const concaturl = url + year + path + id + ".json";
    const answer = await axios.get(concaturl, {headers: {'Content-Type' : 'application/json', 'cookie':'session=' + process.env.AOC_SESSION}});
    const data = answer.data as aoc_data;
    const members = Object.values(data.members);
    members.sort((a, b)=> {
        if (a.local_score < b.local_score) {
            return 1;
        } else if (a.local_score > b.local_score) {
            return -1;
        }
        return 0;
    });
    return members;
}

export async function embedLeaderboard(id:number, year: number) {
    const members = await requestLeaderboard(id, year);
    const map = {} as {[key:string]: string}
    for(const m of members) {
        map[m.name] = "";
        for (const k in m.completion_day_level) {
            let a = ":eight_pointed_black_star:";
            if (m.completion_day_level[k]["1"].get_star_ts != 0) {
                if (m.completion_day_level[k]["2"].get_star_ts != 0) {
                    a = ":star2:";
                } else {
                    a = ":star:";
                }
            }
            map[m.name] = map[m.name] + a;
        }
    }
    const embed = new EmbedBuilder().setURL("https://adventofcode.com").setTitle("Advent of Code Leaderboard")
        .addFields({name:"Ranking", value:members.map(e => { return e.name + ": " + e.local_score + map[e.name]  }).join("\n")});
    return embed;
}


