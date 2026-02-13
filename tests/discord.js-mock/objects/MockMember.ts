import {
    type APIGuildMember,
    type APIUser,
    type Client,
    type Guild,
    GuildMember,
    type User,
} from "discord.js";
import type { RawGuildMemberData } from "discord.js/typings/rawDataTypes";
import { MockUserBuilder } from "./MockUser";

export class MockMemberBuilder {
    private readonly client: Client;
    private readonly guild: Guild;
    private readonly user: User;

    constructor(client: Client, guild: Guild, user: User) {
        this.client = client;
        this.guild = guild;
        this.user = user;
    }

    private buildData(): RawGuildMemberData {
        return {
            guild_id: this.guild.id,
            permissions: "",
            roles: [],
            joined_at: new Date().toISOString(),
            user: this.user.toJSON() as APIUser,
        };
    }

    public build(): GuildMember {
        const guildMember = Reflect.construct(GuildMember, [
            this.client,
            this.buildData(),
            this.guild,
        ]) as GuildMember;

        this.guild.members.cache.set(guildMember.id, guildMember);

        return guildMember;
    }

    public static asAPIGuildMember(member: GuildMember): APIGuildMember {
        return {
            roles: [],
            deaf: false,
            mute: false,
            flags: member.flags.toJSON(),
            joined_at: member.joinedAt.toISOString(),
            user: MockUserBuilder.asAPIUser(member.user),
        };
    }
}
