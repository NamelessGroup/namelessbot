import { expect, test } from "vitest";
import { MockChatInputCommandInteractionBuilder } from "../utils";
import truthtableCommand from "../../modules/truthtable/truthtableCommand";

test("/truthtable - Test A", async () => {
    const mockSlash = new MockChatInputCommandInteractionBuilder()
        .addStringOption("boolean_expression", "a & b")
        .build();

    await truthtableCommand.handler(mockSlash);

    expect(mockSlash).toBeDeferred();
    expect(mockSlash).toBeFollowedUpWith(
        [
            "TruthTable for `(a & b)`:",
            "```",
            " a | b || Result",
            " F | F ||    F",
            " F | T ||    F",
            " T | F ||    F",
            " T | T ||    T",
            "```",
        ].join("\n"),
    );
});

test("/truthtable - Test B", async () => {
    const mockSlash = new MockChatInputCommandInteractionBuilder()
        .addStringOption("boolean_expression", "a | b")
        .build();

    await truthtableCommand.handler(mockSlash);

    expect(mockSlash).toBeDeferred();
    expect(mockSlash).toBeFollowedUpWith(
        [
            "TruthTable for `(a | b)`:",
            "```",
            " a | b || Result",
            " F | F ||    F",
            " F | T ||    T",
            " T | F ||    T",
            " T | T ||    T",
            "```",
        ].join("\n"),
    );
});
