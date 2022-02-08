import {Client, TextChannel} from "discord.js";
import {TaskExecutor} from "../types";

export default (async (client: Client, message: string) => {
    await (await client.channels.fetch("351806976713293826") as TextChannel).send(message);
}) as TaskExecutor
