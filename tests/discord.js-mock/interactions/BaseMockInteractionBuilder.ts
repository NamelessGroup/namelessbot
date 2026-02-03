import { APIBaseInteraction, APIGuildMember, APIMessage, APIPartialInteractionGuild, APITextChannel, APIUser, Client, Guild, GuildMember, InteractionContextType, InteractionType, Locale, Message, TextChannel, User } from "discord.js";
import { MockGuildBuilder } from "../objects/MockGuild";
import { MockTextChannelBuilder } from "../objects/MockTextChannel";
import { MockMessageBuilder } from "../objects/MockMessage";
import { MockUserBuilder } from "../objects/MockUser";
import { MockMemberBuilder } from "../objects/MockMember";

export class BaseMockInteractionBuilder {
    protected readonly client: Client;
    private guild: Guild;
    private textChannel: TextChannel;
    private message: Message;
    private user: User;
    private member: GuildMember;

    constructor (client?: Client) {
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

    public setTextChannel(textChannel: TextChannel): this {
        this.textChannel = textChannel;
        return this;
    }

    public getTextChannel(): TextChannel {
        this.textChannel ??= new MockTextChannelBuilder(this.client, this.getGuild()).build();
        return this.textChannel;
    }

    public setMessage(message: Message): this {
        this.message = message;
        return this;
    }

    public getMessage(): Message {
        this.message ??= new MockMessageBuilder(this.client, this.getTextChannel(), this.getUser()).build();
        return this.message;
    }

    public setUser(user: User): this {
        this.user = user;
        return this;
    }

    public getUser(): User {
        this.user ??= new MockUserBuilder(this.client).build();
        return this.user;
    }

    public setMember(member: GuildMember): this {
        this.member = member;
        return this;
    }

    public getMember(): GuildMember {
        this.member ??= new MockMemberBuilder(this.client, this.getGuild(), this.getUser()).build();
        return this.member;
    }

    protected buildBaseInteraction<T extends InteractionType, D>(
        type: T
    ): APIBaseInteraction<T, D> {
        console.log(this.getMember().toJSON());
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
            message: this.getMessage().toJSON() as APIMessage,
        } as APIBaseInteraction<T, D>;
    }
}