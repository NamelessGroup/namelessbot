import { vi, type Mock, expect } from "vitest";
import {
    APIApplicationCommandInteractionDataOption,
    APIApplicationCommandInteractionDataSubcommandOption,
    APIBaseInteraction,
    APIChatInputApplicationCommandInteraction,
    APIInteractionGuildMember,
    APIMessage,
    APIMessageComponentSelectMenuInteraction,
    APIMessageStringSelectInteractionData,
    APIPartialInteractionGuild,
    APITextChannel,
    APIUser,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ButtonInteraction,
    ChannelType,
    ChatInputCommandInteraction,
    Client,
    ComponentType,
    GuildMemberFlags,
    InteractionContextType,
    InteractionReplyOptions,
    InteractionType,
    Locale,
    MessageComponentInteraction,
    MessageEditOptions,
    MessagePayload,
    MessageType,
    StringSelectMenuInteraction,
} from "discord.js";
import {
    RawInteractionData,
    RawMessageComponentInteractionData,
} from "discord.js/typings/rawDataTypes";

export class MockChatInputCommandInteraction extends ChatInputCommandInteraction {
    constructor(client: Client, data: RawInteractionData) {
        super(client as Client<true>, data);
        this.deferReply = vi.fn();
        this.followUp = vi.fn();
        this.reply = vi.fn();
    }
}

class MockStringSelectMenuInteraction extends StringSelectMenuInteraction {
    constructor(
        client: Client,
        data: APIMessageComponentSelectMenuInteraction,
    ) {
        super(
            client as Client<true>,
            data as unknown as APIMessageStringSelectInteractionData,
        );
        this.deferReply = vi.fn();
        this.followUp = vi.fn();
    }
}

class MockMessageComponentInteraction extends MessageComponentInteraction {
    constructor(client: Client, data: RawMessageComponentInteractionData) {
        super(client as Client<true>, data);
        this.deferReply = vi.fn();
        this.followUp = vi.fn();
        this.message.edit = vi.fn();
    }
}

export class MockBuilder {
    protected readonly client: Client;
    protected user: APIUser;

    constructor(client?: Client) {
        this.client = client ?? new Client({ intents: [] });
        this.user = {
            id: "mockUserId",
            username: "mockuser",
            avatar: "",
            discriminator: "",
            global_name: "Mock User",
            locale: Locale.EnglishGB,
        };
    }

    public setUserId(userId: string): this {
        this.user.id = userId;
        return this;
    }

    protected mockGuild(): APIPartialInteractionGuild {
        return {
            id: "",
            features: [],
            locale: Locale.EnglishGB,
        };
    }

    protected mockTextChannel(): APITextChannel {
        return {
            id: "",
            name: "",
            position: 0,
            type: ChannelType.GuildText,
        };
    }

    protected mockMember(): APIInteractionGuildMember {
        return {
            user: this.user,
            deaf: false,
            flags: GuildMemberFlags.IsGuest,
            joined_at: "",
            mute: false,
            permissions: "",
            roles: [],
        };
    }

    protected mockMessage(): APIMessage {
        return {
            id: "",
            attachments: [],
            author: this.user,
            channel_id: "",
            content: "",
            edited_timestamp: "",
            embeds: [],
            mention_everyone: false,
            mention_roles: [],
            mentions: [],
            pinned: false,
            timestamp: "",
            tts: false,
            type: MessageType.Default,
        };
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
            guild: this.mockGuild(),
            guild_id: this.mockGuild().id,
            guild_locale: this.mockGuild().locale,
            channel: this.mockTextChannel(),
            app_permissions: "",
            locale: this.user.locale,
            context: InteractionContextType.Guild,
            user: this.user,
            member: this.mockMember(),
            message: this.mockMessage(),
        } as APIBaseInteraction<T, D>;
    }
}

export class MockChatInputCommandInteractionBuilder extends MockBuilder {
    private slashCommandId: string;
    private slashCommandName: string;
    private slashCommandOptions: APIApplicationCommandInteractionDataOption<InteractionType.ApplicationCommand>[];
    private subcommand: APIApplicationCommandInteractionDataSubcommandOption<InteractionType.ApplicationCommand>;

    constructor(client?: Client) {
        super(client);
        this.slashCommandId = "";
        this.slashCommandName = "";
        this.slashCommandOptions = [];
        this.subcommand = null;
    }

    public setCommandId(commandId: string): this {
        this.slashCommandId = commandId;
        return this;
    }

    public setCommandName(commandName: string): this {
        this.slashCommandName = commandName;
        return this;
    }

    public setSubcommand(subcommand: string): this {
        this.subcommand = {
            name: subcommand,
            type: ApplicationCommandOptionType.Subcommand,
            options: [],
        };
        return this;
    }

    public addStringOption(name: string, value: string): this {
        (this.subcommand?.options ?? this.slashCommandOptions).push({
            name,
            value,
            type: ApplicationCommandOptionType.String,
        });
        return this;
    }

    public addNumberOption(name: string, value: number): this {
        (this.subcommand?.options ?? this.slashCommandOptions).push({
            name,
            value,
            type: ApplicationCommandOptionType.Number,
        });
        return this;
    }

    public addIntegerOption(name: string, value: number): this {
        (this.subcommand?.options ?? this.slashCommandOptions).push({
            name,
            value,
            type: ApplicationCommandOptionType.Integer,
        });
        return this;
    }

    public addBooleanOption(name: string, value: boolean): this {
        (this.subcommand?.options ?? this.slashCommandOptions).push({
            name,
            value,
            type: ApplicationCommandOptionType.Boolean,
        });
        return this;
    }

    public build(): MockChatInputCommandInteraction {
        if (this.subcommand != null) {
            this.slashCommandOptions.push(this.subcommand);
        }

        return new MockChatInputCommandInteraction(this.client, {
            ...this.buildBaseInteraction(InteractionType.ApplicationCommand),
            data: {
                id: this.slashCommandId,
                name: this.slashCommandName,
                type: ApplicationCommandType.ChatInput,
                guild_id: this.mockGuild().id,
                options: this.slashCommandOptions,
            },
        } as APIChatInputApplicationCommandInteraction);
    }
}

export class MockStringSelectMenuInteractionBuilder extends MockBuilder {
    private stringSelectMenuId: string;
    private stringSelectMenuValues: string[];

    constructor(client?: Client) {
        super(client);
        this.stringSelectMenuId = "";
        this.stringSelectMenuValues = [];
    }

    public setCustomId(customId: string): this {
        this.stringSelectMenuId = customId;
        return this;
    }

    public addValue(value: string): this {
        this.stringSelectMenuValues.push(value);
        return this;
    }

    public build(): MockStringSelectMenuInteraction {
        return new MockStringSelectMenuInteraction(this.client, {
            ...this.buildBaseInteraction(InteractionType.MessageComponent),
            data: {
                component_type: ComponentType.StringSelect,
                custom_id: this.stringSelectMenuId,
                values: this.stringSelectMenuValues,
            },
            channel_id: this.mockTextChannel().id,
        } as APIMessageComponentSelectMenuInteraction);
    }
}

export class MockButtonInteractionBuilder extends MockBuilder {
    private customButtonId: string;

    constructor(client?: Client) {
        super(client);
        this.customButtonId = "";
    }

    public setButtonId(buttonId: string): this {
        this.customButtonId = buttonId;
        return this;
    }

    public build(): ButtonInteraction {
        return new MockMessageComponentInteraction(this.client, {
            ...this.buildBaseInteraction(InteractionType.MessageComponent),
            data: {
                component_type: ComponentType.Button,
                custom_id: this.customButtonId,
            },
            channel_id: this.mockTextChannel().id,
        } as RawMessageComponentInteractionData) as ButtonInteraction;
    }
}

function hasMockAttribute<T>(
    received: Partial<T>,
    key: keyof T,
): received is T {
    return (
        typeof received === "object" &&
        key in received &&
        typeof received[key] === "function" &&
        "mock" in received[key]
    );
}

expect.extend({
    toBeDeferred(received: unknown) {
        if (!hasMockAttribute<{ deferReply: Mock }>(received, "deferReply")) {
            return {
                pass: false,
                message: () => "received object has no mock of 'deferReply'",
            };
        }

        return {
            pass: received.deferReply.mock.calls.length === 1,
            message: () =>
                `expected interaction to be deferred exactly once, received: ${received.deferReply.mock.calls.length}`,
        };
    },
    toBeFollowedUpWith(
        received: unknown,
        expected: string | MessagePayload | InteractionReplyOptions,
    ) {
        if (!hasMockAttribute<{ followUp: Mock }>(received, "followUp")) {
            return {
                pass: false,
                message: () => "received object has no mock of 'followUp'",
            };
        }

        if (received.followUp.mock.calls.length !== 1) {
            return {
                pass: false,
                message: () =>
                    `expected interaction to be followed up exactly once`,
            };
        }

        return {
            pass: this.equals(received.followUp.mock.lastCall[0], expected),
            message: () => `expected interaction to be followed up with`,
            actual: received.followUp.mock.lastCall[0] as unknown,
            expected: expected,
        };
    },
    toBeRepliedToWith(
        received: unknown,
        expected: string | MessagePayload | InteractionReplyOptions,
    ) {
        if (!hasMockAttribute<{ reply: Mock }>(received, "reply")) {
            return {
                pass: false,
                message: () => "received object has no mock of 'reply'",
            };
        }

        if (received.reply.mock.calls.length !== 1) {
            return {
                pass: false,
                message: () =>
                    `expected interaction to be replied to exactly once`,
            };
        }

        return {
            pass: this.equals(received.reply.mock.lastCall[0], expected),
            message: () => `expected interaction to be replied up with`,
            actual: received.reply.mock.lastCall[0] as unknown,
            expected: expected,
        };
    },
    toBeEditedWith(
        received: unknown,
        expected: string | MessagePayload | MessageEditOptions,
    ) {
        if (!hasMockAttribute<{ edit: Mock }>(received, "edit")) {
            return {
                pass: false,
                message: () => "received object has no mock of 'edit'",
            };
        }

        if (received.edit.mock.calls.length !== 1) {
            return {
                pass: false,
                message: () => `expected object to be edited to exactly once`,
            };
        }

        return {
            pass: this.equals(received.edit.mock.lastCall[0], expected),
            message: () => `expected object to be edited with`,
            actual: received.edit.mock.lastCall[0] as unknown,
            expected: expected,
        };
    },
});

interface CustomMatchers<R = unknown> {
    toBeDeferred: () => R;
    toBeFollowedUpWith: (
        followUp: string | MessagePayload | InteractionReplyOptions,
    ) => R;
    toBeRepliedToWith: (
        reply: string | MessagePayload | InteractionReplyOptions,
    ) => R;
    toBeEditedWith: (edit: string | MessagePayload | MessageEditOptions) => R;
}

declare module "vitest" {
    interface Matchers<T = any> extends CustomMatchers<T> {} // eslint-disable-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
}
