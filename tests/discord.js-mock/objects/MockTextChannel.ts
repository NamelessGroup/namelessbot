import { ChannelType, Client, Guild, TextChannel } from "discord.js"
import { RawGuildChannelData } from "discord.js/typings/rawDataTypes";

export class MockTextChannelBuilder {
    private readonly client: Client;
    private readonly guild: Guild;
    private name: string;
    private id: string;

    constructor(client: Client, guild: Guild) {
        this.client = client;
        this.guild = guild;
        this.name = "Test Channel";
        this.id = "5678";
    }

    private buildData(): RawGuildChannelData {
        return {
            type: ChannelType.GuildText,
            name: this.name,
            id: this.id,
        }
    }

    public build(): TextChannel {
        const channel =  Reflect.construct(TextChannel, [
            this.guild,
            this.buildData(),
            this.client,
        ]) as TextChannel;

        this.client.channels.cache.set(channel.id, channel);

        return channel;
    }
}