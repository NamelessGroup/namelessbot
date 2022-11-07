import { get, write } from "./configmanager";
import { Weekday } from "./recurringtask";

interface CalendarBlock {
    startingTime: string;
    endingTime: string;
    title: string;
    forUsers: string[];
    weekday: Weekday
}

export function getBlocks(weekday?: Weekday): CalendarBlock[] {
    const allBlocks = get("blocks", "timetable") as CalendarBlock[];
    if (weekday) {
        return allBlocks.filter(e => { return e.weekday == weekday });
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