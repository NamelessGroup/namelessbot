import {IChatCommandList, ISelectionMenu, ISlashCommand} from "../types";

import test from "../messageCommands/test";
import testSlash from "../slashCommands/test";
import brainFUCK from "../slashCommands/brainfuck";
import koeri from "../slashCommands/koeri";
import {SelectMenuInteraction} from "discord.js";
import brainFUCKsm from "../selectionMenus/brainfucksm";

export const CHAT_COMMAND_PREFIX = "!";

export const CHAT_COMMANDS: IChatCommandList = {
    "test": test
}

export const SLASH_COMMANDS: ISlashCommand[] = [
    testSlash, brainFUCK, koeri
]

export const SELECTION_MENUS: ISelectionMenu[] = [
    brainFUCKsm
]
