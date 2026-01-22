import { CalendarBlock, getBlocks } from "./attendanceTracker";
import {
    ActionRowBuilder,
    APIEmbedField,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";
import { DateTime } from "luxon";

/**
 * Builds the embed that containing the day(s) requested in the timetable layout
 *
 * @param blocks Blocks sorted by their time in the day. For single days it is expected that only blocks of a single day are given
 * @param weekday Optional parameter. If given only the corresponding day will be in the embed. Otherwise, the entire week will be added
 * @returns The built embed
 */
export function buildTimeTableEmbed(
    blocks: CalendarBlock[],
    weekday?: number,
): EmbedBuilder {
    const embed = new EmbedBuilder();

    embed.setTitle(
        "Stundenplan" + (weekday != null ? " für " + dayFromInt(weekday) : ""),
    );

    if (weekday == null) {
        for (let i = 0; i < 5; i++) {
            embed.addFields(buildDayField(getBlocks(i), i));
        }
    } else {
        embed.addFields(buildDayField(blocks, weekday));
    }

    return embed;
}

/**
 * Returns the array that should be given to the components attribute of a message. <br>
 * There is a maximum of 25 blocks, due to Discords limits. <br>
 * Will be printed in rows of 5s
 *
 * @param blocks Blocks that should be given a button. Buttons will be added in the order of this array
 * @returns Array of ActionRowBuilder containing the buttons
 */
export function buildAttendanceAction(
    blocks: CalendarBlock[],
): ActionRowBuilder<ButtonBuilder>[] {
    const blockCount = Math.min(blocks.length, 25);
    let curCount = 0;
    const builders = [] as ActionRowBuilder<ButtonBuilder>[];
    for (let i = 0; i < Math.ceil(blockCount / 5.0); i++) {
        // this inner loop creates the buttons for one row
        const builder = new ActionRowBuilder<ButtonBuilder>();
        for (let j = 0; j < Math.min(5, blockCount - curCount); j++) {
            const block = blocks[i * 5 + j];
            builder.addComponents(
                new ButtonBuilder()
                    .setLabel(block.title)
                    .setCustomId(
                        "attendancetracker-" +
                            block.weekday +
                            "-" +
                            block.title.toLowerCase().replace(/\s/g, "_"),
                    )
                    .setStyle(ButtonStyle.Primary),
            );
        }
        builders.push(builder);
        curCount += 5;
    }
    return builders;
}

/**
 * Builds a field for Discords Embeds for a single day
 *
 * @param blocks Blocks of only the requested day, sorted by their time
 * @param weekday Day this field is for
 * @returns Single embed field for the given day
 */
function buildDayField(
    blocks: CalendarBlock[],
    weekday: number,
): APIEmbedField {
    if (blocks == null || blocks.length === 0) {
        return {
            name: dayFromInt(weekday),
            value: "\u200b",
            inline: true,
        } as APIEmbedField;
    }
    const value = blocks
        .map((e) => {
            // map each day to a string of its times and title
            const top =
                prettyTime(weekday, e.startingTime) +
                " - " +
                prettyTime(weekday, e.endingTime) +
                ": " +
                e.title;
            let result = top;

            // add the index if it is given
            if (e.index !== undefined) {
                result = top + ` (${e.index})\n`;
            } else {
                result += "\n";
            }

            // add the attendance if it is given
            if (e.attendance !== undefined) {
                const attendance = e.attendance
                    .map((e) => {
                        return "<@" + e + ">";
                    })
                    .join("\n");
                result += attendance;
            }

            return result;
        })
        .reduce(
            // concatenate all string representations of blocks into a single string
            (sumTillThisPoint, nextElement) => {
                if (nextElement !== "") {
                    return sumTillThisPoint + "\n" + nextElement;
                }
                return sumTillThisPoint;
            },
        );

    return {
        name: dayFromInt(weekday),
        value: value !== "" ? value : "\u200b",
        inline: true,
    } as APIEmbedField;
}

/**
 * Given any common time representation it gets formatted into hh:mm
 *
 * @param weekday Weekday of time
 * @param unPrettyTime Any time representation of format: ([0-9]{1-2}) [:.] (([0-9]{1-2}.*)|[0-9]{0-2})
 * @returns Formatted time
 */
function prettyTime(weekday: number, unPrettyTime: string): string {
    const parts = unPrettyTime.split(/:|\\./);
    const hours = parts[0].match(/\d+/) ? parts[0] : "0";
    const minutes =
        parts.length >= 2 ? (parts[1].match(/\d+/) ? parts[1] : "0") : "0";
    try {
        return (
            "<t:" +
            Math.trunc(
                getNextTime(
                    weekday,
                    parseInt(hours),
                    parseInt(minutes),
                ).toMillis() / 1000,
            ) +
            ":t>"
        );
    } catch {
        return (
            (hours.length === 1 ? "0" : "") +
            hours +
            ":" +
            (minutes.length === 1 ? "0" : "") +
            minutes
        );
    }
}

/**
 * Returns the german string representation of a given weekday
 *
 * @param weekday Weekday requested
 * @returns String representation of the given weekday
 */
function dayFromInt(weekday: number): string {
    return ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"][weekday];
}

/**
 * Returns the next day of the given weekday with the given time from now on
 *
 * @param weekday Weekday to search for
 * @param hour Hours past midnight of the day
 * @param minute Minutes in the hour
 * @returns Date of the next day with this weekday
 */
export function getNextTime(
    weekday: number,
    hour: number,
    minute: number,
): DateTime {
    let date = DateTime.now().setZone("Europe/Berlin");
    while (date.weekday - 1 !== weekday) {
        date = date.plus({ days: 1 });
    }
    date = date.set({ hour: hour, minute: minute, second: 0, millisecond: 0 });
    return date;
}

interface Attendable {
    id: string;
    count: number;
    attendances: Map<string, number>;
}

/**
 * Builds a Discord Embed for the given results and filter
 *
 * @param results Results to be printed
 * @param filter Regex to filter the results
 * @param start Start of the time range
 * @param end End of the time range
 * @returns Discord Embed
 */
export function buildResultEmbed(
    results: Record<string, Record<string, boolean>>,
    filter?: string,
    start?: DateTime,
    end?: DateTime,
): EmbedBuilder {
    let name = "Attendance";
    if (filter) {
        name += " with filter: " + filter;
    }
    if (start) {
        name += " from " + start.toFormat("dd.MM.yyyy");
    }
    if (end) {
        name += " to " + end.toFormat("dd.MM.yyyy");
    }
    const embed = new EmbedBuilder();
    embed.setTitle(name);

    const blocks = countAttandances(results, start, end);
    const total = {
        id: "Total",
        count: 0,
        attendances: new Map(),
    } as Attendable;

    for (const block of blocks) {
        if (block.count === 0) {
            continue;
        }
        if (!block.id.match(filter ?? ".*")) {
            continue;
        }

        total.count += block.count;
        for (const [attandie, count] of block.attendances) {
            if (total.attendances.has(attandie)) {
                total.attendances.set(
                    attandie,
                    total.attendances.get(attandie) + count,
                );
            } else {
                total.attendances.set(attandie, count);
            }
        }
        embed.addFields(buildResultEmbedField(block));
    }
    embed.addFields({ name: "\u200B", value: "\u200B", inline: false });
    if (total.count > 0) {
        embed.addFields(buildResultEmbedField(total));
    }

    embed.setTimestamp();
    return embed;
}

/**
 * Builds a Discord Embed Field for the given block
 *
 * @param block Block to be printed
 * @returns Discord Embed Field
 */
function buildResultEmbedField(block: Attendable): APIEmbedField {
    let value = "";
    for (const [attandie, count] of block.attendances) {
        value += `<@${attandie}> ${count}/${block.count} (${Math.round((100 * count) / block.count)}%) \n`;
    }

    return {
        name: block.id,
        value: value !== "" ? value : "\u200B",
        inline: false,
    } as APIEmbedField;
}

/**
 * Counts the attendances of the given results
 *
 * @param results Results to be counted
 * @param start Start of the time range
 * @param end End of the time range
 * @returns Array of blocks with their attendances
 */
function countAttandances(
    results: Record<string, Record<string, boolean>>,
    start?: DateTime,
    end?: DateTime,
): Attendable[] {
    const blocks: Attendable[] = [];

    for (const blockKey of Object.keys(results)) {
        const s = blockKey.split("-");
        const name = s[s.length - 1].replace("_", " ");

        let found = false;

        for (const block of blocks) {
            if (block.id === name) {
                found = true;
                continue;
            }
        }

        if (!found) {
            blocks.push({ id: name, count: 0, attendances: new Map() });
        }
    }

    for (const blockKey of Object.keys(results)) {
        const s = blockKey.split("-");
        const name = s[s.length - 1].replace("_", " ");
        const time = DateTime.fromFormat(s[0], "dd.MM.yyyy");

        if (start != null && start > time) {
            continue;
        }
        if (end != null && end < time) {
            continue;
        }

        for (const block of blocks) {
            if (block.id === name) {
                block.count++;
                for (const attandie in results[blockKey]) {
                    if (results[blockKey][attandie]) {
                        if (block.attendances.has(attandie)) {
                            block.attendances.set(
                                attandie,
                                block.attendances.get(attandie) + 1,
                            );
                        } else {
                            block.attendances.set(attandie, 1);
                        }
                    }
                }
            }
        }
    }

    return blocks;
}
