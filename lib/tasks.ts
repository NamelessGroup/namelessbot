import reminder from "../tasks/reminder";
import {Client} from "discord.js";
import {DateTime} from "luxon";
import {RecurringTask, Weekday} from "./recurringtask";


const TASKS = [
    new RecurringTask(Weekday.TUESDAY, 21, 47, reminder, ["MOAR ARGUMENTS"]),
]


export async function checkForTasks(client: Client) {
    const now = DateTime.now().setZone("Europe/Berlin");
    for(const t of TASKS) {
        if(t.compare_time(now.weekday-1, now.hour, now.minute) === 0) {
            await t.run(client);
        }
    }
}
