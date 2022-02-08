import {Client} from "discord.js";

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
    private readonly runner: Function;
    private readonly arguments: any;

    constructor(weekday: Weekday, hour: number, minute: number, runner: Function, functionArguments?: unknown[]) {
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

    compare_time(weekday: Weekday, hour: number, minute: number): number {
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
