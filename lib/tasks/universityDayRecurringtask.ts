import { RecurringTask, Weekday } from "./recurringtask";
import { DateTime } from "luxon";
import KitDateParser from "./KitDateParser";
import { isHoliday } from "feiertagejs";
import { TaskExecutor } from "../../types";

/**
 * Special kind of Recurring Task that only gets executed in weeks, where lectures are held
 */
export default class UniversityDayRecurringTask extends RecurringTask {
    private static kitDates = new KitDateParser();
    private lookAheadDays: number;

    /**
     * Creates a new recurring task, which will always get run at the specified day & time and when the day has lectures.
     *
     * @param weekday Weekday on which the task should run
     * @param hour Hour which the task should run
     * @param minute Minute which the task should run
     * @param runner Function to execute
     * @param functionArguments Array of additional parameters to pass to the runner function
     * @param lookAheadDays Days to check in advance for being a day with lectures
     */
    constructor(
        weekday: Weekday,
        hour: number,
        minute: number,
        runner: TaskExecutor,
        functionArguments?: unknown[],
        lookAheadDays?: number,
    ) {
        super(weekday, hour, minute, runner, functionArguments);
        if (lookAheadDays) {
            this.lookAheadDays = lookAheadDays;
        } else {
            this.lookAheadDays = 0;
        }
    }

    public override shouldRunAtTime(time: DateTime): boolean {
        if (!super.shouldRunAtTime(time)) {
            return false;
        }

        const addedTime = time.plus({ days: this.lookAheadDays });
        return (
            UniversityDayRecurringTask.kitDates.isLectureTime(addedTime) &&
            !isHoliday(addedTime.toJSDate(), "BW")
        );
    }
}
