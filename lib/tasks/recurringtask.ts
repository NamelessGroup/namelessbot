import { Client } from "discord.js";
import { TaskExecutor } from "../../types";
import { DateTime } from "luxon";

/**
 * Enum representing each weekday
 */
export enum Weekday {
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
    SUNDAY = 7,
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
     *
     * @param weekday Weekday on which the task should run
     * @param hour Hour which the task should run
     * @param minute Minute which the task should run
     * @param runner Function to execute
     * @param functionArguments Array of additional parameters to pass to the runner function
     */
    constructor(
        weekday: Weekday,
        hour: number,
        minute: number,
        runner: TaskExecutor,
        functionArguments?: unknown[],
    ) {
        this.weekday = weekday;
        this.hour = hour;
        this.minute = minute;
        this.runner = runner;
        if (functionArguments) {
            this.arguments = functionArguments;
        } else {
            this.arguments = [];
        }
    }

    /**
     * Runs this recurring task and catches exceptions.
     *
     * @param client Client to run the task with
     */
    public run(client: Client): void {
        try {
            this.runner(client, ...this.arguments);
        } catch (e) {
            console.log("Caught exception in RecurringTask");
            console.log(e);
        }
    }

    /**
     * Checks whether this task should be executed at the given time
     *
     * @param time Time to check against
     * @returns Whether the task should be executed
     */
    public shouldRunAtTime(time: DateTime): boolean {
        return (
            (this.weekday as number) === time.get('weekday') &&
            this.hour === time.get('hour') &&
            this.minute === time.get('minute')
        );
    }
}
