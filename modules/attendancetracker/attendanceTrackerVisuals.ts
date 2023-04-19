import {CalendarBlock, getBlocks} from "./attendanceTracker";
import {ActionRowBuilder, APIEmbedField, ButtonBuilder, ButtonStyle, EmbedBuilder} from "discord.js";
import {DateTime} from "luxon";

/**
 * Builds the embed that containing the day(s) requested in the timetable layout
 *
 * @param blocks Blocks sorted by their time in the day. For single days it is expected that only blocks of a single day are given
 * @param weekday Optional parameter. If given only the corresponding day will be in the embed. Otherwise, the entire week will be added
 * @returns The built embed
 */
export function buildTimeTableEmbed(blocks: CalendarBlock[], weekday?: number) : EmbedBuilder {
    const embed = new EmbedBuilder();

    embed.setTitle("Stundenplan" + (weekday != undefined ? " für " + dayFromInt(weekday):""));

    if (weekday == undefined) {
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
export function buildAttendanceAction(blocks: CalendarBlock[]) : ActionRowBuilder<ButtonBuilder>[] {
    const blockCount = Math.min(blocks.length, 25);
    let curCount = 0;
    const builders = [];
    for (let i = 0; i < Math.ceil(blockCount / 5.0); i++) {
        // this inner loop creates the buttons for one row
        const builder = new ActionRowBuilder<ButtonBuilder>();
        for (let j = 0; j < Math.min(5, blockCount-curCount); j++) {

            const block = blocks[i*5+j];
            builder.addComponents(
                new ButtonBuilder()
                    .setLabel(block.title)
                    .setCustomId("attendancetracker-" + block.weekday + "-"
                        + block.title.toLowerCase().replace(/\s/g, "_"))
                    .setStyle(ButtonStyle.Primary)
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
function buildDayField(blocks: CalendarBlock[], weekday: number) : APIEmbedField {
    if (blocks == undefined || blocks.length == 0) {
        return {
            name: dayFromInt(weekday),
            value: "\u200b",
            inline: true
        } as APIEmbedField;
    }
    const value = blocks.map(
        e => {
            // map each day to a string of its times and title
            const top = prettyTime(weekday, e.startingTime) + " - " + prettyTime(weekday, e.endingTime) + ": " + e.title;
            let result = top;

            // add the index if it is given
            if (e.index !== undefined) {
                result = top + ` (${e.index})\n`;
            } else {
                result += "\n";
            }

            // add the attendance if it is given
            if (e.attendance !== undefined) {
                const attendance = e.attendance.map(e => { return "<@" + e + ">"; }).join("\n");
                result += attendance;
            }
            
            return result;
        }).reduce(
        // concatenate all string representations of blocks into a single string
        (sumTillThisPoint, nextElement) => {
            if (nextElement != "") {
                return sumTillThisPoint + "\n" + nextElement;
            }
            return sumTillThisPoint;
        }
    );

    return {
        name: dayFromInt(weekday),
        value: value != "" ? value : "\u200b",
        inline: true
    } as APIEmbedField;
}

/**
 * Given any common time representation it gets formatted into hh:mm
 *
 * @param weekday Weekday of time
 * @param unPrettyTime Any time representation of format: ([0-9]{1-2}) [:.] (([0-9]{1-2}.*)|[0-9]{0-2})
 * @returns Formatted time
 */
function prettyTime(weekday: number, unPrettyTime: string) : string {
    const parts = unPrettyTime.split(/:|\\./);
    const hours = parts[0].match(/\d+/) ? parts[0] : "0";
    const minutes = parts.length >= 2 ? (parts[1].match(/\d+/) ? parts[1] : "0") : "0";
    try {
        return "<t:" + Math.trunc(getNextTime(weekday, parseInt(hours), parseInt(minutes)).toMillis() / 1000) + ":t>";
    } catch (e) {
        return (hours.length == 1 ? "0":"") + hours + ":" + (minutes.length == 1 ? "0":"") + minutes;
    }

}

/**
 * Returns the german string representation of a given weekday
 *
 * @param weekday Weekday requested
 * @returns String representation of the given weekday
 */
function dayFromInt(weekday: number) : string {
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
export function getNextTime(weekday: number, hour: number, minute: number) : DateTime {
    let date = DateTime.now().setZone("Europe/Berlin");
    while (date.weekday - 1 != weekday) {
        date = date.plus({days:1});
    }
    date = date.set({ hour: hour, minute: minute });
    return date;
}