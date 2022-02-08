import {Message} from "discord.js";
import {CHAT_COMMAND_PREFIX, CHAT_COMMANDS} from "../lib/commands";

export default async function messageCreate(message: Message) {
    if(message.author.bot) {
        return;
    }

    if(message.content.startsWith(CHAT_COMMAND_PREFIX)) {
        let command = message.content.split(" ");
        if(CHAT_COMMANDS[command[0].substring(1)] !== undefined) {
            await CHAT_COMMANDS[command[0].substring(1)].handler(message);
        }
    }
}
