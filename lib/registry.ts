import { IEventListener, ISlashCommand } from "../types";
import { RecurringTask, Weekday } from "./recurringtask";

import aocCommand from "../modules/aoc/aocCommand";
import timetableCommand from "../modules/attendancetracker/timetableCommand";
import koeriCommand from "../modules/koeri/koeriCommand";
import mensaCommand from "../modules/mensa/mensaCommand";
import truthtableCommand from "../modules/truthtable/truthtableCommand";
import voteCommand from "../modules/vote/voteCommand";

// import mensaTask from "../modules/mensa/mensaTask";
import aocTask from "../modules/aoc/aocTask";
// import attendanceTrackerTask from "../modules/attendancetracker/attendanceTrackerTask";
import koeriSelectionMenu from "../modules/koeri/koeriSelectionMenuListener";
import attendanceTrackerButton from "../modules/attendancetracker/attendanceTrackerButtonListener";

export const SLASH_COMMANDS: ISlashCommand[] = [
    koeriCommand, mensaCommand, voteCommand, truthtableCommand, aocCommand, timetableCommand
];

export const TASKS = [
    // Mensa-Plans
    
    /*
     * new RecurringTask(Weekday.MONDAY, 9, 48, mensaTask),
     * new RecurringTask(Weekday.TUESDAY, 9, 48, mensaTask),
     * new RecurringTask(Weekday.WEDNESDAY, 9, 48, mensaTask),
     * new RecurringTask(Weekday.THURSDAY, 9, 48, mensaTask),
     * new RecurringTask(Weekday.FRIDAY, 9, 48, mensaTask),
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
    
    /*
     * new RecurringTask(Weekday.SUNDAY, 20, 0, attendanceTrackerTask, [Weekday.MONDAY]),
     * new RecurringTask(Weekday.MONDAY, 20, 0, attendanceTrackerTask, [Weekday.TUESDAY]),
     * new RecurringTask(Weekday.TUESDAY, 20, 0, attendanceTrackerTask, [Weekday.WEDNESDAY]),
     * new RecurringTask(Weekday.WEDNESDAY, 20, 0, attendanceTrackerTask, [Weekday.THURSDAY]),
     * new RecurringTask(Weekday.THURSDAY, 20, 0, attendanceTrackerTask, [Weekday.FRIDAY]),
     */
];

export const LISTENERS: IEventListener[] = [
    koeriSelectionMenu,
    attendanceTrackerButton
];