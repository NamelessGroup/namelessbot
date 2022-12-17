import {Client, TextChannel} from "discord.js";
import { get } from "../lib/configmanager";
import { Weekday } from "../lib/recurringtask";
import {TaskExecutor} from "../types";
import {buildAttendanceAction, buildTimeTableEmbed} from "../lib/attenndancetrackerVisuals";
import {getBlocks} from "../lib/attendancetracker";

export default (async (client: Client, weekday: Weekday) => {
    // const embed = buildEmbed, actionRow = buildActionRow
    const channel = await client.channels.fetch(get('announcement_channel', 'config') as string) as TextChannel;
    const blocks = getBlocks(weekday, true)
    await channel.send({embeds: [buildTimeTableEmbed(blocks)],
                        components: buildAttendanceAction(blocks)});
}) as TaskExecutor
