import { vi, type Mock, expect } from 'vitest';
import { CommandInteraction, InteractionReplyOptions, MessagePayload } from "discord.js";

interface SlashCommandArguments {
    [key: string]: string | number | boolean;
}

export class MockSlashCommand {
    deferReply: Mock;
    followUp: Mock;
    arguments: SlashCommandArguments;
    subcommand?: string;
    handler: (interaction: CommandInteraction) => void | Promise<void>;

    constructor(handler: (interaction: CommandInteraction) => void | Promise<void>) {
        this.deferReply = vi.fn();
        this.followUp = vi.fn();
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

    private buildInteraction(): CommandInteraction {
        return {
            deferReply: this.deferReply,
            followUp: this.followUp,
            options: {
                data: this.arguments,
                getString: (key: string) => this.arguments[key] as string,
                getBoolean: (key: string) => this.arguments[key] as boolean,
                getInteger: (key: string) => this.arguments[key] as number,
                getNumber: (key: string) => this.arguments[key] as number,
                getSubcommand: () => this.subcommand,
            },
            user: {
                id: "mockUser"
            }
        } as unknown as CommandInteraction
    }
}

expect.extend({
    toBeDeferred(received: unknown) {
        if (!(received instanceof MockSlashCommand)) {
            return {
                pass: false,
                message: () => `expected object of type MockSlashCommand, received ${typeof received}`
            }
        }

        return {
            pass: received.deferReply.mock.calls.length === 1,
            message: () => 'expected slash command to be deferred exactly once'
        }
    },
    toBeFollowedUpWith(received: unknown, expected: string | MessagePayload | InteractionReplyOptions) {
        if (!(received instanceof MockSlashCommand)) {
            return {
                pass: false,
                message: () => `expected object of type MockSlashCommand, received ${typeof received}`
            }
        }

        if (received.followUp.mock.calls.length !== 1) {
            return {
                pass: false,
                message: () => `expected slash command to be followed up exactly once`
            }
        }

        return {
            pass: this.equals(received.followUp.mock.lastCall[0], expected),
            message: () => `expected slash command to be followed up with`,
            actual: received.followUp.mock.lastCall[0] as unknown,
            expected: expected,
        }
    }
})

interface CustomMatchers<R = unknown> {
    toBeDeferred: () => R
    toBeFollowedUpWith: (followUp: string | MessagePayload | InteractionReplyOptions) => R
}

declare module 'vitest' {
    interface Matchers<T = any> extends CustomMatchers<T> {} // eslint-disable-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-explicit-any
}