import {Client, TextChannel} from "discord.js";
import {TaskExecutor} from "../types";
import {get} from "../lib/configmanager";

/**
 * Task executor for sending us reminders.
 * 
 * @param client Client to send messages with
 * @param message Reminder message to send
 */
export default (async (client: Client, message: string) => {
    await (await client.channels.fetch(get('announcement_channel', 'config') as string) as TextChannel).send(message);
}) as TaskExecutor;
