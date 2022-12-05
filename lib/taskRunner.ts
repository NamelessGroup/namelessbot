import {Client} from "discord.js";
import {DateTime} from "luxon";
import {TASKS} from "./tasks";

let taskLoop: NodeJS.Timer;

async function checkForTasks(client: Client) {
    const now = DateTime.now().setZone("Europe/Berlin");
    for(const t of TASKS) {
        if(t.compareTime(now.weekday-1, now.hour, now.minute) === 0) {
            await t.run(client);
        }
    }
}

/**
 * Starts the {@link RecurringTask} loop
 * @param client Client to run the tasks with
 */
export function startRecurringTaskLoop(client: Client): void {
    taskLoop = setInterval(checkForTasks, 60000, client);
}

/**
 * Stops the {@link RecurringTask} loop
 */
export function stopRecurringTaskLoop(): void {
    clearInterval(taskLoop);
}