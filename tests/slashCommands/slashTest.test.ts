import { test, expect } from 'vitest';
import { MockSlashCommand } from '../utils';
import testSlash from "../../modules/test";

test('/test - Test A', async () => {
    // Getting our mock input
    const testMock = new MockSlashCommand(testSlash.handler);

    testMock.setArgument("test_argument", "Some Argument");

    await testMock.call();
    expect(testMock).toBeDeferred();
    expect(testMock).toBeFollowedUpWith("You typed: `Some Argument`");
});