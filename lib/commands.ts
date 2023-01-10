import {IChatCommandList, ISlashCommand} from "../types";

import test from "../messageCommands/test";
import testSlash from "../slashCommands/test";
import brainFUCK from "../slashCommands/brainfuck";
import koeri from "../slashCommands/koeri";
import tictactoe from "../slashCommands/tictactoe";
import mensa from "../slashCommands/mensa";
import vote from "../slashCommands/vote";
import truthtable from "../slashCommands/truthtable";
import timetable from "../slashCommands/timetable";
import aoc from "../slashCommands/aoc";

export const CHAT_COMMAND_PREFIX = "!";

export const CHAT_COMMANDS: IChatCommandList = {
    "test": test
}

export const SLASH_COMMANDS: ISlashCommand[] = [
    testSlash, brainFUCK, koeri, tictactoe, mensa, vote, truthtable, aoc, timetable
]
