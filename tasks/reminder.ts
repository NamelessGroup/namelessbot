import {Client, TextChannel} from "discord.js";

export default async (client: Client, message: string) => {
    await (await client.channels.fetch("351806976713293826") as TextChannel).send(message);
}
