import { mockSlash } from './utils';
import testSlash from "../slashCommands/test";

test('/test - Test A', async () => {
    // Getting our mock input
    const mockInput = mockSlash({
        "test_argument": "Some Argument"
    });

    // Executing our handler
    await testSlash.handler(mockInput.input);

    // Checking our mock function values

    // deferReply was called once
    expect(mockInput.mockDeferReply.mock.calls.length).toBe(1);
    // followUp was called once
    expect(mockInput.mockFollowUp.mock.calls.length).toBe(1);
    // Checking first argument to first followUp-call
    expect(mockInput.mockFollowUp.mock.calls[0][0]).toBe("You typed: `Some Argument`");
});