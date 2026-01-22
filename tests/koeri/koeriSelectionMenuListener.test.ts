import { test, expect, vi, afterEach } from "vitest";
import * as configManager from "../../lib/configmanager";
import { MockStringSelectMenuInteractionBuilder } from "../utils";
import koeriSelectionMenuListener from "../../modules/koeri/koeriSelectionMenuListener";

// Mocking the config manager
const getMock = vi
    .spyOn(configManager, "get")
    .mockImplementation(() => undefined);
const writeMock = vi
    .spyOn(configManager, "write")
    .mockImplementation(() => undefined);

afterEach(() => {
    getMock.mockReset();
    getMock.mockImplementation(() => undefined);
    writeMock.mockReset();
    writeMock.mockImplementation(() => undefined);
});

test("Valid interaction", async () => {
    const mockInteraction = new MockStringSelectMenuInteractionBuilder()
        .setUserId("1234")
        .setCustomId("koeri-u1234$12")
        .addValue("8")
        .build();

    await koeriSelectionMenuListener.handler(mockInteraction);

    expect(mockInteraction).toBeDeferred();
    expect(mockInteraction).toBeFollowedUpWith({
        ephemeral: true,
        content: "Kombination 12 bewertet mit 8",
    });
    expect(writeMock).toHaveBeenLastCalledWith(
        "1234",
        configManager.ConfigurationFile.KOERI,
        { 12: 8 },
    );
});
