import { Message } from "discord.js";
import { get, write } from "./configmanager";
import { Weekday } from "./recurringtask";
import {buildTimeTableEmbed} from "./attendancetrackerVisuals";

export interface CalendarBlock {
    startingTime: string;
    endingTime: string;
    title: string;
    weekday: Weekday;
    attendance?: string[];
}

interface AttendanceMap {
    [blockId: string]: string[];
}

let attendanceMap = {} as AttendanceMap;

export function getBlocks(weekday?: Weekday, includeAttendence?: boolean): CalendarBlock[] {
    const allBlocks = get("blocks", "timetable") as CalendarBlock[];
    if (weekday !== null) {
        const filteredBlocks = allBlocks.filter(e => { return e.weekday == weekday });
        if (includeAttendence) {
            return filteredBlocks.map(e => {
                return Object.assign(e, { attendance: attendanceMap[e.title.toLowerCase().replace(/\s/, "_")] });
            })
        }
        return filteredBlocks;
    } else {
        return allBlocks;
    }
}

export async function addBlock(block: CalendarBlock): Promise<void> {
    const allBlocks = get("blocks", "timetable") as CalendarBlock[];
    allBlocks.push(block);
    await write("blocks", "timetable", allBlocks);
}

export async function updateBlock(index: number, block: CalendarBlock): Promise<boolean> {
    const allBlocks = get("blocks", "timetable") as CalendarBlock[];
    if (allBlocks.length <= index) {
        return false;
    }
    allBlocks[index] = block;
    await write("blocks", "timetable", allBlocks);
    return true;
}

export async function removeBlock(index: number): Promise<boolean> {
    const allBlocks = get("blocks", "timetable") as CalendarBlock[];
    if (allBlocks.length <= index) {
        return false;
    }
    allBlocks.splice(index, 1);
    await write("blocks", "timetable", allBlocks);
    return true;
}

export async function updateAttendance(message: Message, weekday: Weekday, block: string, userId: string): Promise<void> {
    if (attendanceMap[block] === undefined) {
        attendanceMap[block] = [];
    }
    if (attendanceMap[block].includes(userId)) {
        attendanceMap[block] = attendanceMap[block].filter(e => { return e !== userId });
    } else {
        attendanceMap[block].push(userId);
    }

    await message.edit({embeds: [buildTimeTableEmbed(getBlocks(weekday, true), weekday)]});
}

export function resetAttendance(): void {
    attendanceMap = {} as AttendanceMap;
}