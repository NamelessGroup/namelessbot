import {Client} from "discord.js";
import { get } from "../lib/configmanager";
import { Weekday } from "../lib/recurringtask";
import {TaskExecutor} from "../types";

export default (async (client: Client, weekday: Weekday) => {
    // const embed = buildEmbed, actionRow = buildActionRow
    const channel = await client.channels.fetch(get('announcement_channel', 'config') as string) as TextChannel;
    await channel.send({embeds: []});
}) as TaskExecutor
