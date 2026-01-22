import { vi, type Mock, expect } from "vitest";
import {
    BaseInteraction,
    ChatInputCommandInteraction,
    CommandInteraction,
    Interaction,
    InteractionReplyOptions,
    MessagePayload,
    StringSelectMenuInteraction,
} from "discord.js";

interface SlashCommandArguments {
    [key: string]: string | number | boolean;
}

export class MockInteraction {
    deferReply: Mock;
    followUp: Mock;
    mockUserId: string;

    constructor() {
        this.deferReply = vi.fn();
        this.followUp = vi.fn();
        this.mockUserId = "mockUserId";
    }

    setMockUserId(userId: string): this {
        this.mockUserId = userId;
        return this;
    }

    protected buildInteraction(): BaseInteraction &
        Pick<CommandInteraction, "deferReply" | "followUp"> {
        return {
            deferReply: this.deferReply,
            followUp: this.followUp,
            isAnySelectMenu: () => false,
            isAutocomplete: () => false,
            isButton: () => false,
            isChannelSelectMenu: () => false,
            isChatInputCommand: () => false,
            isCommand: () => false,
            isContextMenuCommand: () => false,
            isMentionableSelectMenu: () => false,
            isMessageComponent: () => false,
            isMessageContextMenuCommand: () => false,
            isModalSubmit: () => false,
            isPrimaryEntryPointCommand: () => false,
            isRepliable: () => false,
            isRoleSelectMenu: () => false,
            isStringSelectMenu: () => false,
            isUserContextMenuCommand: () => false,
            isUserSelectMenu: () => false,
            user: {
                id: this.mockUserId,
            },
        } as unknown as BaseInteraction &
            Pick<CommandInteraction, "deferReply" | "followUp">;
    }
}

export class MockSlashCommand extends MockInteraction {
    arguments: SlashCommandArguments;
    subcommand?: string;
    handler: (interaction: CommandInteraction) => void | Promise<void>;

    constructor(
        handler: (interaction: CommandInteraction) => void | Promise<void>,
    ) {
        super();
        this.arguments = {};
        this.handler = handler;
    }

    setSubcommand(subcommand: string): this {
        this.subcommand = subcommand;
        return this;
    }

    setArgument(key: string, value: string | number | boolean): this {
        this.arguments[key] = value;
        return this;
    }

    async call(): Promise<void> {
        await this.handler(this.buildInteraction());
    }

    protected override buildInteraction(): ChatInputCommandInteraction {
        return {
            ...super.buildInteraction(),
            options: {
                data: this.arguments,
                getString: (key: string) => this.arguments[key] as string,
                getBoolean: (key: string) => this.arguments[key] as boolean,
                getInteger: (key: string) => this.arguments[key] as number,
                getNumber: (key: string) => this.arguments[key] as number,
                getSubcommand: () => this.subcommand,
            },
        } as unknown as ChatInputCommandInteraction;
    }
}

export class MockStringSelectMenu extends MockInteraction {
    values: string[];
    customId: string;
    handler: (interaction: Interaction) => void | Promise<void>;

    constructor(handler: (interaction: Interaction) => void | Promise<void>) {
        super();
        this.values = [];
        this.customId = "";
        this.handler = handler;
    }

    setCustomId(id: string): this {
        this.customId = id;
        return this;
    }

    addValue(value: string): this {
        this.values.push(value);
        return this;
    }

    async call(): Promise<void> {
        await this.handler(this.buildInteraction());
    }

    protected override buildInteraction(): StringSelectMenuInteraction {
        return {
            ...super.buildInteraction(),
            isStringSelectMenu: () => true,
            values: this.values,
            customId: this.customId,
        } as unknown as StringSelectMenuInteraction;
    }
}

expect.extend({
    toBeDeferred(received: unknown) {
        if (!(received instanceof MockInteraction)) {
            return {
                pass: false,
                message: () =>
                    `expected object of type MockInteraction, received ${typeof received}`,
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
        if (!(received instanceof MockInteraction)) {
            return {
                pass: false,
                message: () =>
                    `expected object of type MockInteraction, received ${typeof received}`,
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
});

interface CustomMatchers<R = unknown> {
    toBeDeferred: () => R;
    toBeFollowedUpWith: (
        followUp: string | MessagePayload | InteractionReplyOptions,
    ) => R;
}

declare module "vitest" {
    interface Matchers<T = any> extends CustomMatchers<T> {} // eslint-disable-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
}
