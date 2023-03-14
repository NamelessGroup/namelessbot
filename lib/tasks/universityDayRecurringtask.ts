import {RecurringTask} from "./recurringtask";
import {DateTime} from "luxon";
import KitDateParser from "./KitDateParser";
import {isHoliday} from "feiertagejs/build/feiertage.js";

/**
 * Special kind of Recurring Task that only gets executed in weeks, where lectures are held
 */
export default class UniversityDayRecurringTask extends RecurringTask {

    private static kitDates = new KitDateParser();

    public override shouldRunAtTime(time: DateTime): boolean {
        if (!super.shouldRunAtTime(time)) {
            return false;
        }

        const jsTime = time.toJSDate();

        //getLanguage();
        return UniversityDayRecurringTask.kitDates.isLectureTime(jsTime) && !isHoliday(jsTime, "BW");

    }

}