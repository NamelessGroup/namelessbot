import {IChatCommandList, ISelectionMenu, ISlashCommand} from "../types";

import test from "../messageCommands/test";
import testSlash from "../slashCommands/test";
import brainFUCK from "../slashCommands/brainfuck";
import koeri from "../slashCommands/koeri";
import brainFUCKsm from "../selectionMenus/brainfucksm";
import tictactoe from "../slashCommands/tictactoe";

export const CHAT_COMMAND_PREFIX = "!";

export const CHAT_COMMANDS: IChatCommandList = {
    "test": test
}

export const SLASH_COMMANDS: ISlashCommand[] = [
    testSlash, brainFUCK, koeri, tictactoe
]

export const SELECTION_MENUS: ISelectionMenu[] = [
    brainFUCKsm
]
