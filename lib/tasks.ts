/* eslint-disable */
import reminder from "../tasks/reminder";
import {RecurringTask, Weekday} from "./recurringtask";
import mensa from "../tasks/mensa";
import attendanceTracker from "../tasks/attendanceTracker";


export const TASKS = [
    //new RecurringTask(Weekday.TUESDAY, 21, 47, reminder, ["MOAR ARGUMENTS"]),

    // Mensa-Plans
    new RecurringTask(Weekday.MONDAY, 9, 48, mensa),
    new RecurringTask(Weekday.WEDNESDAY, 9, 48, mensa),
    new RecurringTask(Weekday.FRIDAY, 9, 48, mensa),

    // Attendance-Tracker
    new RecurringTask(Weekday.MONDAY, 7, 0, attendanceTracker, [Weekday.MONDAY]),
    new RecurringTask(Weekday.TUESDAY, 7, 0, attendanceTracker, [Weekday.TUESDAY]),
    new RecurringTask(Weekday.WEDNESDAY, 7, 0, attendanceTracker, [Weekday.WEDNESDAY]),
    new RecurringTask(Weekday.THURSDAY, 7, 0, attendanceTracker, [Weekday.THURSDAY]),
    new RecurringTask(Weekday.FRIDAY, 7, 0, attendanceTracker, [Weekday.FRIDAY]),
]