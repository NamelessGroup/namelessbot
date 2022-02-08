import {Message} from "discord.js";

export default {
    handler: async (msg: Message) => {
        // This is the command executor
        await msg.reply("Y e s");
    }
}
