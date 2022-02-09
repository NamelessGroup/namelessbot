import {IChatCommandList, ISlashCommand} from "../types";

import test from "../messageCommands/test";
import testSlash from "../slashCommands/test";

export const CHAT_COMMAND_PREFIX = "!";

export const CHAT_COMMANDS: IChatCommandList = {
    "test": test
}

export const SLASH_COMMANDS: ISlashCommand[] = [
    testSlash
]
