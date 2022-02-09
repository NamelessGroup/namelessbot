import {Client, Message} from "discord.js";

export interface IChatCommandList {
    [key: string]: IChatCommandHandler
}

export interface IChatCommandHandler {
    handler: ChatCommandExecutor
}

export interface IEventListener {
    event: string;
    elevated: boolean;
    handler: EventHandler;
}

export type EventHandler = (...args: any[]) => Promise<void>;  // eslint-disable-line @typescript-eslint/no-explicit-any
export type TaskExecutor = (client: Client, ...args: any[]) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
export type ChatCommandExecutor = (message: Message) => Promise<void>;
