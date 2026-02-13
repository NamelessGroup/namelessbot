import { expect, test, vi } from "vitest";
import aocCommand from "../../modules/aoc/aocCommand";
import * as configManager from "../../lib/configmanager";
import * as ofetch from "ofetch";
import { EmbedBuilder } from "discord.js";
import { DateTime } from "luxon";
import { MockChatInputCommandInteractionBuilder } from "../discord.js-mock/interactions/MockChatInputCommandInteractionBuilder";

// Mocking the config manager
vi.spyOn(configManager, "get").mockReturnValue("aocLbId");

// Mocking ofetch
vi.mock("ofetch");
const ofetchMock = vi.mocked(ofetch.ofetch).mockResolvedValue({
    event: "Test Event",
    owner_id: 1234,
    members: {
        1: {
            last_start_ts: 1,
            id: 1,
            local_score: 3,
            stars: 2,
            name: "Player One",
            glocal_score: 0,
            completion_day_level: {
                0: {
                    1: {
                        get_star_ts: 1,
                        star_index: 1,
                    },
                    2: {
                        get_star_ts: 2,
                        star_index: 2,
                    },
                },
            },
        },
        2: {
            last_start_ts: 1,
            id: 2,
            local_score: 8,
            stars: 4,
            name: "Player Two",
            glocal_score: 0,
            completion_day_level: {
                0: {
                    1: {
                        get_star_ts: 1,
                        star_index: 1,
                    },
                    2: {
                        get_star_ts: 2,
                        star_index: 2,
                    },
                },
                1: {
                    1: {
                        get_star_ts: 1,
                        star_index: 1,
                    },
                },
            },
        },
    },
});

test("/aoc - No arguments", async () => {
    const mockSlash = new MockChatInputCommandInteractionBuilder().build();
    vi.stubEnv("AOC_SESSION", "aocSessionToken");

    await aocCommand.handler(mockSlash);

    const year = DateTime.now().setZone("Europe/Berlin").year;
    expect(ofetchMock).toHaveBeenLastCalledWith(
        `https://adventofcode.com/${year}/leaderboard/private/view/aocLbId.json`,
        {
            headers: {
                "Content-Type": "application/json",
                cookie: "session=aocSessionToken",
            },
        },
    );
    expect(mockSlash).toBeRepliedToWith({
        embeds: [
            new EmbedBuilder()
                .addFields(
                    { name: "Player Two: 8", value: ":star2::star:" },
                    { name: "Player One: 3", value: ":star2:" },
                )
                .setTitle("Advent of Code Leaderboard")
                .setURL("https://adventofcode.com"),
        ],
    });
});

test("/aoc - Year argument", async () => {
    const mockSlash = new MockChatInputCommandInteractionBuilder()
        .addIntegerOption("year", 2022)
        .build();
    vi.stubEnv("AOC_SESSION", "aocSessionToken");

    await aocCommand.handler(mockSlash);

    expect(ofetchMock).toHaveBeenLastCalledWith(
        `https://adventofcode.com/2022/leaderboard/private/view/aocLbId.json`,
        {
            headers: {
                "Content-Type": "application/json",
                cookie: "session=aocSessionToken",
            },
        },
    );
    expect(mockSlash).toBeRepliedToWith({
        embeds: [
            new EmbedBuilder()
                .addFields(
                    { name: "Player Two: 8", value: ":star2::star:" },
                    { name: "Player One: 3", value: ":star2:" },
                )
                .setTitle("Advent of Code Leaderboard")
                .setURL("https://adventofcode.com"),
        ],
    });
});
