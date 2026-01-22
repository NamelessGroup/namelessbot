import { test, expect } from "vitest";
import { MockChatInputCommandInteractionBuilder } from "./utils";
import testSlash from "../modules/test";
import { Client } from "discord.js";

test("/test - Test A", async () => {
    // Getting our mock input
    const client = new Client({ intents: [] });
    const mockInteraction = new MockChatInputCommandInteractionBuilder(client)
        .addStringOption("test_argument", "Some Argument")
        .build();

    await testSlash.handler(mockInteraction);

    expect(mockInteraction).toBeDeferred();
    expect(mockInteraction).toBeFollowedUpWith("You typed: `Some Argument`");
});
