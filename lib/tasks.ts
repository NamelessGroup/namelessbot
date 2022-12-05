/* eslint-disable */
import reminder from "../tasks/reminder";
import {RecurringTask, Weekday} from "./recurringtask";
import mensa from "../tasks/mensa";
import aoc from "../tasks/aoc";


export const TASKS = [
    //new RecurringTask(Weekday.TUESDAY, 21, 47, reminder, ["MOAR ARGUMENTS"]),

    // Mensa-Plans
    new RecurringTask(Weekday.MONDAY, 9, 48, mensa),
    new RecurringTask(Weekday.TUESDAY, 9, 48, mensa),
    new RecurringTask(Weekday.WEDNESDAY, 9, 48, mensa),
    new RecurringTask(Weekday.THURSDAY, 9, 48, mensa),
    new RecurringTask(Weekday.FRIDAY, 9, 48, mensa),

    new RecurringTask(Weekday.MONDAY, 22, 5, aoc),
    new RecurringTask(Weekday.TUESDAY, 22, 5, aoc),
    new RecurringTask(Weekday.WEDNESDAY, 22, 5, aoc),
    new RecurringTask(Weekday.THURSDAY, 22, 5, aoc),
    new RecurringTask(Weekday.FRIDAY, 22, 5, aoc),
    new RecurringTask(Weekday.SATURDAY, 22, 5, aoc),
    new RecurringTask(Weekday.SUNDAY, 22, 5, aoc),

]