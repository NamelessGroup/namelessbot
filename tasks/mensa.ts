import {Client, TextChannel} from "discord.js";
import {buildMensaEmbed, getMensaData} from "../lib/mensaparser";
import {get} from "../lib/configmanager";
import {TaskExecutor} from "../types";

export default (async (client: Client) => {
    const embed = buildMensaEmbed(await getMensaData());
    const channel = await client.channels.fetch(get('announcement_channel', 'config') as string) as TextChannel;
    await channel.send({embeds: [embed]});
}) as TaskExecutor
