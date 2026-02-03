import { test, expect, vi, afterEach } from "vitest";
import * as configManager from "../../lib/configmanager";
import timetableCommand from "../../modules/attendancetracker/timetableCommand";
import { EmbedBuilder } from "discord.js";
import * as luxon from "luxon";
import { Weekday } from "../../lib/tasks/recurringtask";
import { MockChatInputCommandInteractionBuilder } from "../discord.js-mock/interactions/MockChatInputCommandInteractionBuilder";

// Mocking the config manager
const getMock = vi.spyOn(configManager, "get").mockReturnValue([
    {
        endingTime: "9:00",
        startingTime: "7:00",
        title: "Noone attends",
        weekday: 1,
    },
]);
const writeMock = vi
    .spyOn(configManager, "write")
    .mockImplementation(() => undefined);
vi.spyOn(configManager, "readConfigFile").mockResolvedValue({
    "23.01.2026-writingTests": {
        mockUserId: true,
    },
});

afterEach(() => {
    getMock.mockReset();
    getMock.mockReturnValue([
        {
            endingTime: "9:00",
            startingTime: "7:00",
            title: "Noone attends",
            weekday: 1,
        },
    ]);
    writeMock.mockReset();
    writeMock.mockImplementation(() => undefined);
});

// Mocking DT
vi.spyOn(luxon.DateTime, "now").mockReturnValue(
    luxon.DateTime.fromMillis(1768777200000) as luxon.DateTime<true>,
);

test("/timetable add", async () => {
    const mockSlash = new MockChatInputCommandInteractionBuilder()
        .setSubcommand("add")
        .addIntegerOption("weekday", 3)
        .addStringOption("starttime", "10:00")
        .addStringOption("endtime", "12:00")
        .addStringOption("title", "Test Block")
        .build();

    await timetableCommand.handler(mockSlash);

    expect(mockSlash).toBeDeferred();
    expect(mockSlash).toBeFollowedUpWith({
        ephemeral: true,
        content: "Added successful",
    });
    expect(writeMock).toHaveBeenLastCalledWith(
        "blocks",
        configManager.ConfigurationFile.TIMETABLE,
        [
            {
                endingTime: "9:00",
                startingTime: "7:00",
                title: "Noone attends",
                weekday: 1,
            },
            {
                endingTime: "12:00",
                startingTime: "10:00",
                title: "Test Block",
                weekday: 3,
            },
        ],
    );
});

test("/timetable list - No parameters", async () => {
    const mockSlash = new MockChatInputCommandInteractionBuilder()
        .setSubcommand("list")
        .build();

    await timetableCommand.handler(mockSlash);

    expect(mockSlash).toBeDeferred();
    expect(mockSlash).toBeFollowedUpWith({
        embeds: [
            new EmbedBuilder()
                .addFields(
                    {
                        name: "Montag",
                        value: "<t:1768888800:t> - <t:1768896000:t>: Noone attends\n",
                        inline: true,
                    },
                    { name: "Dienstag", value: "\u200b", inline: true },
                    { name: "Mittwoch", value: "\u200b", inline: true },
                    { name: "Donnerstag", value: "\u200b", inline: true },
                    { name: "Freitag", value: "\u200b", inline: true },
                )
                .setTitle("Stundenplan"),
        ],
        ephemeral: true,
    });
});

test("/timetable list - Specify Weekday", async () => {
    const mockSlash = new MockChatInputCommandInteractionBuilder()
        .setSubcommand("list")
        .addIntegerOption("weekday", Weekday.MONDAY)
        .build();

    await timetableCommand.handler(mockSlash);

    expect(mockSlash).toBeDeferred();
    expect(mockSlash).toBeFollowedUpWith({
        embeds: [
            new EmbedBuilder()
                .addFields({
                    name: "Montag",
                    value: "<t:1768888800:t> - <t:1768896000:t>: Noone attends\n",
                    inline: true,
                })
                .setTitle("Stundenplan für Montag"),
        ],
        ephemeral: true,
    });
});

test("/timetable list - Include Index", async () => {
    const mockSlash = new MockChatInputCommandInteractionBuilder()
        .setSubcommand("list")
        .addBooleanOption("includeindex", true)
        .build();

    await timetableCommand.handler(mockSlash);

    expect(mockSlash).toBeDeferred();
    expect(mockSlash).toBeFollowedUpWith({
        embeds: [
            new EmbedBuilder()
                .addFields(
                    {
                        name: "Montag",
                        value: "<t:1768888800:t> - <t:1768896000:t>: Noone attends (0)\n",
                        inline: true,
                    },
                    { name: "Dienstag", value: "\u200b", inline: true },
                    { name: "Mittwoch", value: "\u200b", inline: true },
                    { name: "Donnerstag", value: "\u200b", inline: true },
                    { name: "Freitag", value: "\u200b", inline: true },
                )
                .setTitle("Stundenplan"),
        ],
        ephemeral: true,
    });
});

test("/timetable list - Specify Weekday & Include Index", async () => {
    const mockSlash = new MockChatInputCommandInteractionBuilder()
        .setSubcommand("list")
        .addIntegerOption("weekday", Weekday.MONDAY)
        .addBooleanOption("includeindex", true)
        .build();

    await timetableCommand.handler(mockSlash);

    expect(mockSlash).toBeDeferred();
    expect(mockSlash).toBeFollowedUpWith({
        embeds: [
            new EmbedBuilder()
                .addFields({
                    name: "Montag",
                    value: "<t:1768888800:t> - <t:1768896000:t>: Noone attends (0)\n",
                    inline: true,
                })
                .setTitle("Stundenplan für Montag"),
        ],
        ephemeral: true,
    });
});

test("/timetable remove", async () => {
    const mockSlash = new MockChatInputCommandInteractionBuilder()
        .setSubcommand("remove")
        .addIntegerOption("index", 0)
        .build();

    await timetableCommand.handler(mockSlash);

    expect(mockSlash).toBeDeferred();
    expect(mockSlash).toBeFollowedUpWith({
        content:
            "Removed block successfully. Be aware that block indexes might have shifted now.",
        ephemeral: true,
    });

    expect(writeMock).toHaveBeenLastCalledWith(
        "blocks",
        configManager.ConfigurationFile.TIMETABLE,
        [],
    );
});

test("/timetable update", async () => {
    const mockSlash = new MockChatInputCommandInteractionBuilder()
        .setSubcommand("update")
        .addIntegerOption("index", 0)
        .addIntegerOption("weekday", 3)
        .addStringOption("starttime", "15:00")
        .addStringOption("endtime", "16:00")
        .addStringOption("title", "Moved pog")
        .build();

    await timetableCommand.handler(mockSlash);

    expect(mockSlash).toBeDeferred();
    expect(mockSlash).toBeFollowedUpWith({
        content: "Updated block successfully.",
        ephemeral: true,
    });

    expect(writeMock).toHaveBeenLastCalledWith(
        "blocks",
        configManager.ConfigurationFile.TIMETABLE,
        [
            {
                endingTime: "16:00",
                startingTime: "15:00",
                title: "Moved pog",
                weekday: 3,
            },
        ],
    );
});

test("/timetable stats", async () => {
    vi.setSystemTime(1768777200000);
    const mockSlash = new MockChatInputCommandInteractionBuilder()
        .setSubcommand("stats")
        .build();

    await timetableCommand.handler(mockSlash);

    expect(mockSlash).toBeDeferred();
    expect(mockSlash).toBeFollowedUpWith({
        embeds: [
            new EmbedBuilder()
                .addFields(
                    {
                        inline: false,
                        name: "writingTests",
                        value: "<@mockUserId> 1/1 (100%) \n",
                    },
                    {
                        inline: false,
                        name: "\u200B",
                        value: "\u200B",
                    },
                    {
                        inline: false,
                        name: "Total",
                        value: "<@mockUserId> 1/1 (100%) \n",
                    },
                )
                .setTitle("Attendance")
                .setTimestamp(),
        ],
        ephemeral: false,
    });
});
