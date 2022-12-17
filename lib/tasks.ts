/* eslint-disable */
import reminder from "../tasks/reminder";
import {RecurringTask, Weekday} from "./recurringtask";
import mensa from "../tasks/mensa";
import aoc from "../tasks/aoc";
import attendanceTracker from "../tasks/attendanceTracker";


export const TASKS = [
    //new RecurringTask(Weekday.TUESDAY, 21, 47, reminder, ["MOAR ARGUMENTS"]),

    // Mensa-Plans
    new RecurringTask(Weekday.MONDAY, 9, 48, mensa),
    new RecurringTask(Weekday.TUESDAY, 9, 48, mensa),
    new RecurringTask(Weekday.WEDNESDAY, 9, 48, mensa),
    new RecurringTask(Weekday.THURSDAY, 9, 48, mensa),
    new RecurringTask(Weekday.FRIDAY, 9, 48, mensa),

    // Advent of Code
    new RecurringTask(Weekday.MONDAY, 22, 5, aoc),
    new RecurringTask(Weekday.TUESDAY, 22, 5, aoc),
    new RecurringTask(Weekday.WEDNESDAY, 22, 5, aoc),
    new RecurringTask(Weekday.THURSDAY, 22, 5, aoc),
    new RecurringTask(Weekday.FRIDAY, 22, 5, aoc),
    new RecurringTask(Weekday.SATURDAY, 22, 5, aoc),
    new RecurringTask(Weekday.SUNDAY, 22, 5, aoc),

    // Attendance-Tracker
    new RecurringTask(Weekday.MONDAY, 6, 0, attendanceTracker, [Weekday.MONDAY]),
    new RecurringTask(Weekday.TUESDAY, 6, 0, attendanceTracker, [Weekday.TUESDAY]),
    new RecurringTask(Weekday.WEDNESDAY, 6, 0, attendanceTracker, [Weekday.WEDNESDAY]),
    new RecurringTask(Weekday.THURSDAY, 6, 0, attendanceTracker, [Weekday.THURSDAY]),
    new RecurringTask(Weekday.FRIDAY, 6, 0, attendanceTracker, [Weekday.FRIDAY]),
]