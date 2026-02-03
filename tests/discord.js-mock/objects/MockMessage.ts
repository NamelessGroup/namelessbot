import { Client, Message, MessageType, TextChannel, User } from "discord.js"
import { RawMessageData } from "discord.js/typings/rawDataTypes";
import { MockUserBuilder } from "./MockUser";

export class MockMessageBuilder {
    private readonly client: Client;
    private readonly channel: TextChannel;
    private readonly author: User;
    private content: string;

    constructor(client: Client, channel: TextChannel, author: User) {
        this.client = client;
        this.channel = channel;
        this.author = author;
        this.content = "";
    }

    private buildData(): RawMessageData {
        return {
            id: "3456",
            channel_id: this.channel.id,
            author: MockUserBuilder.asAPIUser(this.author),
            content: this.content,
            timestamp: Date.now().toString(),
            edited_timestamp: null,
            tts: false,
            mention_everyone: false,
            mention_roles: [],
            attachments: [],
            embeds: [],
            pinned: false,
            type: MessageType.Default,
            mentions: [],
        }
    }

    public build(): Message {
        const message =  Reflect.construct(Message, [
            this.client,
            this.buildData()
        ]) as Message<true>;

        this.channel.messages.cache.set(message.id, message);

        return message;
    }
}