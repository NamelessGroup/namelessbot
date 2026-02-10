import {
    type APIBaseInteraction,
    type APIPartialInteractionGuild,
    type APITextChannel,
    type APIUser,
    Client,
    type Guild,
    type GuildMember,
    InteractionContextType,
    type InteractionType,
    Locale,
    type Message,
    type TextChannel,
    type User,
} from "discord.js";
import { MockGuildBuilder } from "../objects/MockGuild";
import { MockTextChannelBuilder } from "../objects/MockTextChannel";
import { MockMessageBuilder } from "../objects/MockMessage";
import { MockUserBuilder } from "../objects/MockUser";
import { MockMemberBuilder } from "../objects/MockMember";
import "../matchers";

export class BaseMockInteractionBuilder {
    protected readonly client: Client;
    private guild: Guild;
    private textChannel: TextChannel;
    private message: Message;
    private user: User;
    private member: GuildMember;

    constructor(client?: Client) {
        this.client = client ?? new Client({ intents: [] });
        this.guild = null;
        this.textChannel = null;
        this.message = null;
        this.user = null;
        this.member = null;
    }

    public setGuild(guild: Guild): this {
        this.guild = guild;
        return this;
    }

    public getGuild(): Guild {
        this.guild ??= new MockGuildBuilder(this.client).build();
        return this.guild;
    }

    public setTextChannel(
        textChannel: TextChannel | ((c: Client) => TextChannel),
    ): this {
        if (typeof textChannel === "function") {
            this.textChannel = textChannel(this.client);
        } else {
            this.textChannel = textChannel;
        }
        return this;
    }

    public getTextChannel(): TextChannel {
        this.textChannel ??= new MockTextChannelBuilder(
            this.client,
            this.getGuild(),
        ).build();
        return this.textChannel;
    }

    public setMessage(message: Message | ((c: Client) => Message)): this {
        if (typeof message === "function") {
            this.message = message(this.client);
        } else {
            this.message = message;
        }
        return this;
    }

    public getMessage(): Message {
        this.message ??= new MockMessageBuilder(
            this.client,
            this.getTextChannel(),
            this.getUser(),
        ).build();
        return this.message;
    }

    public setUser(user: User | ((c: Client) => User)): this {
        if (typeof user === "function") {
            this.user = user(this.client);
        } else {
            this.user = user;
        }
        return this;
    }

    public getUser(): User {
        this.user ??= new MockUserBuilder(this.client).build();
        return this.user;
    }

    public setMember(member: GuildMember | ((c: Client) => GuildMember)): this {
        if (typeof member === "function") {
            this.member = member(this.client);
        } else {
            this.member = member;
        }
        return this;
    }

    public getMember(): GuildMember {
        this.member ??= new MockMemberBuilder(
            this.client,
            this.getGuild(),
            this.getUser(),
        ).build();
        return this.member;
    }

    protected buildBaseInteraction<T extends InteractionType, D>(
        type: T,
    ): APIBaseInteraction<T, D> {
        return {
            id: "",
            application_id: "",
            type: type,
            token: "",
            version: 1,
            entitlements: [],
            authorizing_integration_owners: {},
            attachment_size_limit: -1,
            guild: this.getGuild().toJSON() as APIPartialInteractionGuild,
            guild_id: this.getGuild().id,
            guild_locale: this.getGuild().preferredLocale,
            channel: this.getTextChannel().toJSON() as APITextChannel,
            app_permissions: "",
            locale: Locale.EnglishUS,
            context: InteractionContextType.Guild,
            user: this.getUser().toJSON() as APIUser,
            member: MockMemberBuilder.asAPIGuildMember(this.getMember()),
            message: MockMessageBuilder.asAPIMessage(this.getMessage()),
        } as APIBaseInteraction<T, D>;
    }
}
