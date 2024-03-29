import { Message } from "discord.js";
import {get, readConfigFile, write} from "../../lib/configmanager";
import { Weekday } from "../../lib/tasks/recurringtask";
import {buildTimeTableEmbed, getNextTime} from "./attendanceTrackerVisuals";

export interface CalendarBlock {
    startingTime: string;
    endingTime: string;
    title: string;
    weekday: Weekday;
    attendance?: string[];
    index?: number;
}

interface AttendanceMap {
    [blockId: string]: string[];
}

const TIME_REGEX = /^(1?\d|2[0-3]):[0-5]\d$/;
let attendanceMap = {} as AttendanceMap;

/**
 * Returns all calendar blocks in the database
 *
 * Blocks will be sorted by starting time, ending time and title, in that order.
 *
 * @param weekday Optional weekday to lookup blocks for
 * @param includeAttendence Whether to include attendance or not
 * @param includeIndex Whether to include the block index or not
 * @returns Array of CalendarBlocks
 */
export function getBlocks(weekday?: Weekday, includeAttendence?: boolean, includeIndex?: boolean): CalendarBlock[] {
    let allBlocks = get("blocks", "timetable") as CalendarBlock[];

    if (includeIndex) {
        allBlocks = allBlocks.map((e, idx) => {
            return Object.assign(e, { index: idx });
        });
    }

    allBlocks.sort(sortBlocks);

    if (weekday !== null) {
        const filteredBlocks = allBlocks.filter(e => { return e.weekday == weekday; });
        if (includeAttendence) {
            return filteredBlocks.map(e => {
                return Object.assign(e, { attendance: attendanceMap[e.title.toLowerCase().replace(/\s/g, "_")] });
            });
        }
        return filteredBlocks;
    } else {
        return allBlocks;
    }
}

/**
 * Internal function to compare & sort two CalendarBlocks
 *
 * Sorts / compares by starting time, ending time and title, in that order.
 *
 * @param blockA Block to compare
 * @param blockB Block to compare
 * @returns >0 if Block A is concidered first, <0 if Block B is concidered first, 0 if they are equal
 */
function sortBlocks(blockA: CalendarBlock, blockB: CalendarBlock): number {
    const startingTimeA = blockA.startingTime.split(":");
    const startingTimeB = blockB.startingTime.split(":");
    const endingTimeA = blockA.endingTime.split(":");
    const endingTimeB = blockB.endingTime.split(":");

    if (parseInt(startingTimeA[0]) !== parseInt(startingTimeB[0])) {
        return parseInt(startingTimeA[0]) - parseInt(startingTimeB[0]);
    }
    if (parseInt(startingTimeA[1]) !== parseInt(startingTimeB[1])) {
        return parseInt(startingTimeA[1]) - parseInt(startingTimeB[1]);
    }

    if (parseInt(endingTimeA[0]) !== parseInt(endingTimeB[0])) {
        return parseInt(endingTimeA[0]) - parseInt(endingTimeB[0]);
    }
    if (parseInt(endingTimeA[1]) !== parseInt(endingTimeB[1])) {
        return parseInt(endingTimeA[1]) - parseInt(endingTimeB[1]);
    }

    return blockA.title.localeCompare(blockB.title);
}

/**
 * Adds a block to the database
 *
 * @param block Block data to add
 * @returns true, if the block was added successfully, false otherwise
 */
export async function addBlock(block: CalendarBlock): Promise<boolean> {
    if (!block.startingTime.match(TIME_REGEX) || !block.endingTime.match(TIME_REGEX)) {
        return false;
    }
    const allBlocks = get("blocks", "timetable") as CalendarBlock[];
    if (allBlocks.some(b => { return b.title === block.title && b.weekday === block.weekday; })) {
        return false;
    }
    allBlocks.push(block);
    await write("blocks", "timetable", allBlocks);
    return true;
}

/**
 * Updates a block in the database
 *
 * @param index Index of the block to update
 * @param block New block data
 * @returns true, if the update was successful, false otherwise
 */
export async function updateBlock(index: number, block: CalendarBlock): Promise<boolean> {
    if (!block.startingTime.match(TIME_REGEX) || !block.endingTime.match(TIME_REGEX)) {
        return false;
    }
    const allBlocks = get("blocks", "timetable") as CalendarBlock[];
    if (allBlocks.length <= index) {
        return false;
    }
    if (allBlocks.some(b => { return b.title === block.title && b.weekday === block.weekday; })) {
        return false;
    }
    allBlocks[index] = block;
    await write("blocks", "timetable", allBlocks);
    return true;
}

/**
 * Removes a block in the databasse
 *
 * @param index Index of the block to remove
 * @returns true, if the block was removed successfully, false otherwise
 */
export async function removeBlock(index: number): Promise<boolean> {
    const allBlocks = get("blocks", "timetable") as CalendarBlock[];
    if (allBlocks.length <= index) {
        return false;
    }
    allBlocks.splice(index, 1);
    await write("blocks", "timetable", allBlocks);
    return true;
}

/**
 * Updates attendance for one user on one block.
 *
 * @param message Message to update with the new attendance
 * @param weekday Weekday of the block
 * @param block Block title to update attendance for
 * @param userId User to update attendance for
 */
export async function updateAttendance(message: Message, weekday: Weekday, block: string, userId: string): Promise<void> {
    if (attendanceMap[block] === undefined) {
        attendanceMap[block] = [];
    }
    if (attendanceMap[block].includes(userId)) {
        attendanceMap[block] = attendanceMap[block].filter(e => { return e !== userId; });
    } else {
        attendanceMap[block].push(userId);
    }
    await updateAttendanceFile(weekday, block, userId);

    await message.edit({embeds: [buildTimeTableEmbed(getBlocks(weekday, true), weekday)]});
}

/**
 * Resets the tracked attendance.
 */
export function resetAttendance(): void {
    attendanceMap = {} as AttendanceMap;
}

/**
 * Updates the attendance inside the tracker file.
 *
 * @param weekday Weekday to update attendance for
 * @param block Block to update attendance for
 * @param userId User to update attendance for
 */
async function updateAttendanceFile(weekday: Weekday, block: string, userId: string): Promise<void> {
    const key = getNextTime(weekday, 0, 0).toFormat("dd.MM.yyyy") + "-" + block;
    const fileContent = get(key, "attendance") as Record<string, boolean>;
    fileContent[userId] = !fileContent[userId];
    await write(key, "attendance", fileContent);
}


/**
 * Adds all blocks to the attendance tracker file.
 *
 * @param weekday Weekday to add blocks for
 * @param blocks Blocks to add
 */
export async function writeAllBlocksToAttendanceFile(weekday: Weekday, blocks: CalendarBlock[]): Promise<void> {
    for (const block of blocks) {
        const key = getNextTime(weekday, 0, 0).toFormat("dd.MM.yyyy") + "-" + block.title.toLowerCase().replace(/\s/g, "_");
        if (get(key, "attendance") === undefined) {
            await write(key, "attendance", {});
        }
    }
}

/**
 * Reads the attendance tracker file.
 *
 * @returns all tracked attendance
 */
export async function getTrackedAttendace(): Promise<object[]> {
    return readConfigFile("attendance.json").then(s => {
        return JSON.parse(s);
    });
}
