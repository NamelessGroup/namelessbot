import { test, expect } from "vitest";
import testSlash from "../modules/test";
import { MockChatInputCommandInteractionBuilder } from "./discord.js-mock/interactions/MockChatInputCommandInteractionBuilder";

test("/test - Test A", async () => {
    // Getting our mock input
    const mockInteraction = new MockChatInputCommandInteractionBuilder()
        .addStringOption("test_argument", "Some Argument")
        .build();

    await testSlash.handler(mockInteraction);

    expect(mockInteraction).toBeDeferred();
    expect(mockInteraction).toBeFollowedUpWith("You typed: `Some Argument`");
});
