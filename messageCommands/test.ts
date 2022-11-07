import {Message} from "discord.js";
import {IChatCommandHandler} from "../types";

export default {
    handler: async (msg: Message) => {
        // This is the command executor
        await msg.reply("Y e s");
    }
} as IChatCommandHandler
