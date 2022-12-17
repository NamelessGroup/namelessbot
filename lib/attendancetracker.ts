import { Message } from "discord.js";
import { get, write } from "./configmanager";
import { Weekday } from "./recurringtask";
import {buildTimeTableEmbed} from "./attenndancetrackerVisuals";

export interface CalendarBlock {
    startingTime: string;
    endingTime: string;
    title: string;
    forUsers: string[];
    weekday: Weekday
}

interface AttendanceMap {
    [msgId: string]: { [blockId: string]: string[] }
}

const attendanceMap = {} as AttendanceMap;

export function getBlocks(weekday?: Weekday, includeAttendence?: boolean): CalendarBlock[] {
    const allBlocks = get("blocks", "timetable") as CalendarBlock[];
    if (weekday !== null) {
        const filteredBlocks = allBlocks.filter(e => { return e.weekday == weekday });
        if (includeAttendence) {
            return filteredBlocks.map(e => {
                return Object.assign(e, { attendance: attendanceMap[e.title.toLowerCase().replace(/\w/g, "_")] });
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
    if (attendanceMap[message.id] === undefined) {
        attendanceMap[message.id] = {}
    }
    if (attendanceMap[message.id][block] === undefined) {
        attendanceMap[message.id][block] = [];
    }
    if (attendanceMap[message.id][block].includes(userId)) {
        attendanceMap[message.id][block] = attendanceMap[message.id][block].filter(e => { return e !== userId });
    } else {
        attendanceMap[message.id][block].push(userId);
    }


    // TODO: const embed = buildEmbed
    await message.edit({embeds: [buildTimeTableEmbed(getBlocks(weekday, true), weekday)]});
}