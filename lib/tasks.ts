/* eslint-disable */
import reminder from "../tasks/reminder";
import {RecurringTask, Weekday} from "./recurringtask";
import mensa from "../tasks/mensa";


export const TASKS = [
    //new RecurringTask(Weekday.TUESDAY, 21, 47, reminder, ["MOAR ARGUMENTS"]),

    // Mensa-Plans
    new RecurringTask(Weekday.MONDAY, 9, 48, mensa),
    new RecurringTask(Weekday.WEDNESDAY, 9, 48, mensa),
    new RecurringTask(Weekday.FRIDAY, 9, 48, mensa)
]