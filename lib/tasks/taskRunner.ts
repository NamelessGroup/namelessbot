import {Client} from "discord.js";
import {DateTime} from "luxon";
import { TASKS } from "../registry";

let taskLoop: NodeJS.Timer;

/**
 * Checks whether any tasks are supposed to be ran now, and runs them
 * 
 * @param client Client to run the tasks with
 */
function checkForTasks(client: Client): void {
    const now = DateTime.now().setZone("Europe/Berlin");
    for(const t of TASKS) {
        if(t.shouldRunAtTime(now)) {
            void t.run(client);
        }
    }
}

/**
 * Starts the {@link lib/recurringtask.RecurringTask} loop
 * 
 * @param client Client to run the tasks with
 */
export function startRecurringTaskLoop(client: Client): void {
    taskLoop = setInterval(checkForTasks, 60000, client);
}

/**
 * Stops the {@link lib/recurringtask.RecurringTask} loop
 */
export function stopRecurringTaskLoop(): void {
    clearInterval(taskLoop);
}