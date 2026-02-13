import { type APIUser, type Client, User } from "discord.js";
import type { RawUserData } from "discord.js/typings/rawDataTypes";

export class MockUserBuilder {
    private readonly client: Client;
    private name: string;
    private id: string;

    constructor(client: Client) {
        this.client = client;
        this.name = "Test User";
        this.id = "9012";
    }

    private buildData(): RawUserData {
        return {
            username: this.name,
            id: this.id,
        };
    }

    public setId(id: string): this {
        this.id = id;
        return this;
    }

    public build(): User {
        const user = Reflect.construct(User, [
            this.client,
            this.buildData(),
        ]) as User;

        this.client.users.cache.set(user.id, user);

        return user;
    }

    public static asAPIUser(user: User): APIUser {
        return {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            global_name: user.globalName,
            avatar: user.avatar,
        };
    }
}
