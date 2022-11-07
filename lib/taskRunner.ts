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

export function startRecurringTaskLoop(client: Client): void {
    taskLoop = setInterval(checkForTasks, 60000, client);
}

export function stopRecurringTaskLoop(): void {
    clearInterval(taskLoop);
}