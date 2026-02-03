import {
    InteractionReplyOptions,
    MessageEditOptions,
    MessagePayload,
} from "discord.js";
import { expect, Mock } from "vitest";

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
