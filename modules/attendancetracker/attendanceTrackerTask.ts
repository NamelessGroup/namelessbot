import {Client, TextChannel} from "discord.js";
import { get } from "../../lib/configmanager";
import { Weekday } from "../../lib/tasks/recurringtask";
import {TaskExecutor} from "../../types";
import {buildAttendanceAction, buildTimeTableEmbed} from "./attendanceTrackerVisuals";
import {getBlocks, resetAttendance} from "./attendanceTracker";

/**
 * TaskExecutor for printing the timetable with attendance buttons of the given weekday <br>
 *
 * @param client Client to execute the task with
 * @param weekday Weekday to execute the task with
 */
export default (async (client: Client, weekday: Weekday) => {
    resetAttendance();
    const channel = await client.channels.fetch(get('announcement_channel', 'config') as string) as TextChannel;
    const blocks = getBlocks(weekday, true);
    await channel.send({embeds: [buildTimeTableEmbed(blocks, weekday)],
                        components: buildAttendanceAction(blocks)});
}) as TaskExecutor;
