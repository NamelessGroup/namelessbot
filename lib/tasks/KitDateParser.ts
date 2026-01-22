import { DateTime } from "luxon";
import { ofetch } from "ofetch";

/**
 * Parser for transforming the lecture dates from the kit website and checking whether dates are in this span
 */
export default class KitDateParser {
    private static dateRegex =
        "[0-9]{2}[.][0-9]{2}[.][0-9]{4} - [0-9]{2}[.][0-9]{2}[.][0-9]{4}";
    private static dateURL =
        "https://www.sle.kit.edu/imstudium/termine-fristen.php";

    private timeSpans: TimeSpan[];

    /**
     * Fetches the current dates on startup
     */
    constructor() {
        void this.fetchData();
    }

    /**
     * Checks whether the given Date is a timespan where lectures are given
     *
     * @param date Date to check against
     * @returns True if it is inside a week, where lectures are held, false otherwise. True if no timeSpans found
     */
    public isLectureTime(date: DateTime): boolean {
        if (this.timeSpans.length === 0) {
            return true;
        }
        for (const t of this.timeSpans) {
            if (t.isInside(date)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Updates the timeSpans array
     */
    private async fetchData(): Promise<void> {
        const html = await this.getHTML(KitDateParser.dateURL);
        this.timeSpans = this.parseDateStrings(this.queryDateStrings(html));
    }

    /**
     * Parses the html string and extracts all the relevant dates from it
     *
     * @param html html string
     * @returns the dates
     */
    private queryDateStrings(html: string): string[] {
        let tableStart = html.indexOf("<table");
        let index = -1;
        const allTimes = [] as string[];
        do {
            index = html.indexOf("<tr", tableStart);
            if (index === -1) {
                break;
            }
            for (let i = 0; i < 3; i++) {
                while (
                    !html
                        .substring(index, index + 23)
                        .match(KitDateParser.dateRegex)
                ) {
                    index++;
                }
                if (i !== 0) {
                    allTimes.push(html.substring(index, index + 23));
                }

                index += 25;
            }
            tableStart = index;
        } while (index !== 1);
        return allTimes;
    }

    /**
     * Parses the given times from the query function and transforms them into TimeSpans
     *
     * @param dateStrings queried dates
     * @returns The matching TimeSpans
     */
    private parseDateStrings(dateStrings: string[]): TimeSpan[] {
        const tempTimeSpans: TimeSpan[] = [];

        for (let i = 0; i < dateStrings.length; i += 2) {
            const splitsAll = dateStrings[i].split(" - ");
            const splitsFree = dateStrings[i + 1].split(" - ");

            tempTimeSpans.push(
                this.makeTimeSpan(splitsAll[0], splitsFree[0], 0),
            );
            tempTimeSpans.push(
                this.makeTimeSpan(splitsFree[1], splitsAll[1], 2),
            );
        }

        return tempTimeSpans;
    }

    /**
     * Creates a new TimeSpan from the given date strings
     *
     * @param start String of first date
     * @param end String of last date
     * @param startHourSetter Days to add to start date
     * @returns The corresponding TimeSpan
     */
    private makeTimeSpan(
        start: string,
        end: string,
        startHourSetter?: number,
    ): TimeSpan {
        const dateStart = this.stringToDate(start);
        const dateEnd = this.stringToDate(end);

        if (startHourSetter != null) {
            dateStart.plus({ days: startHourSetter });
        }

        return new TimeSpan(dateStart, dateEnd);
    }

    /**
     * Transforms a date from the kit website into a date object
     *
     * @param d string to transform (DD.MM.YYY)
     * @returns The corresponding date
     */
    private stringToDate(d: string): DateTime {
        const date = DateTime.fromFormat(d, "dd.MM.yyyy");
        date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
        return date;
    }

    /**
     * Fetches the html source code form the given url
     *
     * @param url Website to fetch from
     * @returns the html source code
     */
    private async getHTML(url: string): Promise<string> {
        const response = await ofetch<string>(url, {
            parseResponse: (txt) => txt,
        });
        return response;
    }
}

/**
 * Class that represents a time span. [start, end)
 */
class TimeSpan {
    start: DateTime;
    end: DateTime;

    /**
     * Creates timespan [start, end)
     *
     * @param start start time (inclusive)
     * @param end end time (exclusive)
     */
    constructor(start: DateTime, end: DateTime) {
        this.start = start;
        this.end = end;
    }

    /**
     * Checks whether a date is inside this timespan
     *
     * @param date Date to check against
     * @returns Whether the date is in the span
     */
    public isInside(date: DateTime): boolean {
        return date >= this.start && date < this.end;
    }

    /**
     * Transforms this timespan into a string
     *
     * @returns string representation of the timespan
     */
    public toString(): string {
        return `${this.start.toFormat("dd.MM.yyyy")} - ${this.end.toFormat("dd.MM.yyyy")}`;
    }
}
