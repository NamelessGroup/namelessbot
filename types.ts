import {ApplicationCommandData, Client, CommandInteraction, Message, SelectMenuInteraction} from "discord.js";

export interface IChatCommandList {
    [key: string]: IChatCommandHandler
}

export interface IChatCommandHandler {
    handler: ChatCommandExecutor
}

export interface IEventListener {
    event: string;
    elevated?: boolean;
    handler: EventHandler;
    once?: boolean;
}

export interface ISlashCommand {
    command: ApplicationCommandData;
    handler(interaction: CommandInteraction): void;
}

export interface ISelectionMenu {
    defaultId: string;
    compLen?: number;
    handler(interaction: SelectMenuInteraction): void;
}

export type EventHandler = (...args: any[]) => Promise<void>;  // eslint-disable-line @typescript-eslint/no-explicit-any
export type TaskExecutor = (client: Client, ...args: any[]) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
export type ChatCommandExecutor = (message: Message) => Promise<void>;

export interface ConfigList {
    [configName: string]: Config
}

export interface Config {
    [key: string]: unknown
}
