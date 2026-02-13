import { test, expect, vi, afterEach } from "vitest";
import * as configManager from "../../lib/configmanager";
import attendanceTrackerButtonListener from "../../modules/attendancetracker/attendanceTrackerButtonListener";
import * as luxon from "luxon";
import { EmbedBuilder } from "discord.js";
import { MockButtonInteractionBuilder } from "../discord.js-mock/interactions/MockButtonInteractionBuilder";

// Mocking the config manager
const getMock = vi.spyOn(configManager, "get").mockImplementation((_, file) => {
    if (file === configManager.ConfigurationFile.TIMETABLE) {
        return [
            {
                endingTime: "9:00",
                startingTime: "7:00",
                title: "Noone attends",
                weekday: 1,
            },
        ];
    } else if (file === configManager.ConfigurationFile.ATTENDANCE) {
        return {};
    }
});
const writeMock = vi
    .spyOn(configManager, "write")
    .mockImplementation(() => undefined);

afterEach(() => {
    getMock.mockReset();
    getMock.mockImplementation(() => undefined);
    writeMock.mockReset();
    writeMock.mockImplementation(() => undefined);
});

// Mocking DT
vi.spyOn(luxon.DateTime, "now").mockReturnValue(
    luxon.DateTime.fromMillis(1768777200000) as luxon.DateTime<true>,
);

test("Valid interaction", async () => {
    const mockInteraction = new MockButtonInteractionBuilder()
        .setButtonId("attendancetracker-1-noone_attends")
        .build();

    await attendanceTrackerButtonListener.handler(mockInteraction);

    expect(mockInteraction).toBeDeferred();
    expect(mockInteraction.message).toBeEditedWith({
        embeds: [
            new EmbedBuilder()
                .addFields({
                    inline: true,
                    name: "Montag",
                    value: "<t:1768802400:t> - <t:1768809600:t>: Noone attends\n<@9012>",
                })
                .setTitle("Stundenplan für Montag"),
        ],
    });
    expect(writeMock).toHaveBeenLastCalledWith(
        "19.01.2026-noone_attends",
        configManager.ConfigurationFile.ATTENDANCE,
        { 9012: true },
    );
});
