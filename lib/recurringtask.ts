import {Client} from "discord.js";
import {TaskExecutor} from "../types";
import {checkForTasks} from "./tasks";

let taskLoop: NodeJS.Timer;

export enum Weekday {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY
}

export class RecurringTask {
    private readonly weekday: Weekday;
    private readonly hour: number;
    private readonly minute: number;
    private readonly runner: TaskExecutor;
    private readonly arguments: unknown[];

    constructor(weekday: Weekday, hour: number, minute: number, runner: TaskExecutor, functionArguments?: unknown[]) {
        this.weekday = weekday;
        this.hour = hour;
        this.minute = minute;
        this.runner = runner;
        if(functionArguments) {
            this.arguments = functionArguments;
        } else {
            this.arguments = [];
        }
    }

    async run(client: Client): Promise<void> {
        try {
            this.runner(client, ...this.arguments)
        } catch(e) {
            console.log("Caught exception in RecurringTask")
            console.log(e);
        }
    }

    compareTime(weekday: Weekday, hour: number, minute: number): number {
        if(this.weekday === weekday && this.hour === hour && this.minute === minute) {
            return 0;
        }
        if((this.weekday > weekday) ||
            (this.weekday === weekday && this.hour > hour) ||
            (this.weekday === weekday && this.hour === hour && this.minute > minute)) {
            return 1
        } else {
            return -1
        }
    }
}

export function startRecurringTaskLoop(client: Client): void {
    taskLoop = setInterval(checkForTasks, 60000, client);
}

export function stopRecurringTaskLoop(): void {
    clearInterval(taskLoop);
}