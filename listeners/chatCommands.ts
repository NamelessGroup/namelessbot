import {Message} from "discord.js";
import {CHAT_COMMAND_PREFIX, CHAT_COMMANDS} from "../lib/commands";
import { IEventListener } from "../types";

/**
 * Event handler for handling chat-commands
 */
export default {
    event: 'messageCreate',
    elevated: true,
    handler: async function (message: Message) {
        if(message.author.bot) {
            return;
        }

        if(message.content.startsWith(CHAT_COMMAND_PREFIX)) {
            const command = message.content.split(" ");
            if(CHAT_COMMANDS[command[0].substring(1)] !== undefined) {
                await CHAT_COMMANDS[command[0].substring(1)].handler(message);
            }
        }
    }
} as IEventListener;