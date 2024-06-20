import { IEventListener, ISlashCommand } from "../types";
import { RecurringTask, Weekday } from "./tasks/recurringtask";

import aocCommand from "../modules/aoc/aocCommand";
import timetableCommand from "../modules/attendancetracker/timetableCommand";
import koeriCommand from "../modules/koeri/koeriCommand";
import mensaCommand from "../modules/mensa/mensaCommand";
import truthtableCommand from "../modules/truthtable/truthtableCommand";
import voteCommand from "../modules/vote/voteCommand";

import aocTask from "../modules/aoc/aocTask";
import attendanceTrackerTask from "../modules/attendancetracker/attendanceTrackerTask";
import koeriSelectionMenu from "../modules/koeri/koeriSelectionMenuListener";
import attendanceTrackerButton from "../modules/attendancetracker/attendanceTrackerButtonListener";
import UniversityDayRecurringTask from "./tasks/universityDayRecurringtask";

export const SLASH_COMMANDS: ISlashCommand[] = [
    koeriCommand, mensaCommand, voteCommand, truthtableCommand, aocCommand, timetableCommand
];

export const TASKS = [
    // Mensa-Plans

    /*
     * new UniversityDayRecurringTask(Weekday.MONDAY, 9, 48, mensaTask),
     * new UniversityDayRecurringTask(Weekday.TUESDAY, 9, 48, mensaTask),
     * new UniversityDayRecurringTask(Weekday.WEDNESDAY, 9, 48, mensaTask),
     * new UniversityDayRecurringTask(Weekday.THURSDAY, 9, 48, mensaTask),
     * new UniversityDayRecurringTask(Weekday.FRIDAY, 9, 48, mensaTask),
     */

    // Advent of Code
    new RecurringTask(Weekday.MONDAY, 22, 5, aocTask),
    new RecurringTask(Weekday.TUESDAY, 22, 5, aocTask),
    new RecurringTask(Weekday.WEDNESDAY, 22, 5, aocTask),
    new RecurringTask(Weekday.THURSDAY, 22, 5, aocTask),
    new RecurringTask(Weekday.FRIDAY, 22, 5, aocTask),
    new RecurringTask(Weekday.SATURDAY, 22, 5, aocTask),
    new RecurringTask(Weekday.SUNDAY, 22, 5, aocTask),

    // Attendance-Tracker
    new UniversityDayRecurringTask(Weekday.SUNDAY, 20, 0, attendanceTrackerTask, [Weekday.MONDAY], 1),
    new UniversityDayRecurringTask(Weekday.MONDAY, 20, 0, attendanceTrackerTask, [Weekday.TUESDAY], 1),
    new UniversityDayRecurringTask(Weekday.TUESDAY, 20, 0, attendanceTrackerTask, [Weekday.WEDNESDAY], 1),
    new UniversityDayRecurringTask(Weekday.WEDNESDAY, 20, 0, attendanceTrackerTask, [Weekday.THURSDAY], 1),
    new UniversityDayRecurringTask(Weekday.THURSDAY, 20, 0, attendanceTrackerTask, [Weekday.FRIDAY], 1),
];

export const LISTENERS: IEventListener[] = [
    koeriSelectionMenu,
    attendanceTrackerButton
];