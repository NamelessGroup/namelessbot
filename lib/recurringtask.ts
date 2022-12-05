import {Client} from "discord.js";
import {TaskExecutor} from "../types";

/**
 * Enum representing each weekday
 * @enum
 */
export enum Weekday {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY
}

/**
 * Base class for recurring tasks, which are supposed to be executed at a certain weekday & time each week.
 */
export class RecurringTask {
    private readonly weekday: Weekday;
    private readonly hour: number;
    private readonly minute: number;
    private readonly runner: TaskExecutor;
    private readonly arguments: unknown[];

    /**
     * Creates a new recurring task, which will always get run at the specified day & time.
     * @param weekday Weekday on which the task should run
     * @param hour Hour which the task should run
     * @param minute Minute which the task should run
     * @param runner Function to execute
     * @param functionArguments Array of additional parameters to pass to the runner fundtion
     */
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

    /**
     * Runs this recurring task and catches exceptions.
     * @param client Client to run the task with
     */
    async run(client: Client): Promise<void> {
        try {
            this.runner(client, ...this.arguments)
        } catch(e) {
            console.log("Caught exception in RecurringTask")
            console.log(e);
        }
    }

    /**
     * Compare this RecurringTask object to another time.
     *
     * @param weekday The weekday to compare to
     * @param hour The hour to compare to
     * @param minute The minute to compare to
     * @returns 0 if equal, 1 if this object is later as the compared time, -1 otherwise
     */
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
