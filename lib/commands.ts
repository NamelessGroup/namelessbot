import {IChatCommandList, ISlashCommand} from "../types";

import test from "../messageCommands/test";
import testSlash from "../slashCommands/test";
import brainFUCK from "../slashCommands/brainfuck";
import koeri from "../slashCommands/koeri";

export const CHAT_COMMAND_PREFIX = "!";

export const CHAT_COMMANDS: IChatCommandList = {
    "test": test
}

export const SLASH_COMMANDS: ISlashCommand[] = [
    testSlash, brainFUCK, koeri
]
