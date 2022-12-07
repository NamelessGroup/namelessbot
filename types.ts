import {ApplicationCommandData, Client, CommandInteraction, Message} from "discord.js";

/**
 * List for storing {@link IChatCommandHandler}
 */
export interface IChatCommandList {
    [key: string]: IChatCommandHandler
}

/**
 * Interface for ChatCommands
 */
export interface IChatCommandHandler {
    /**
     * Handler to be executed when the command is invoked
     */
    handler: ChatCommandExecutor
}

/**
 * Interface for generic event listener
 */
export interface IEventListener {
    /**
     * Event to listen to.
     */
    event: string;
    /**
     * If true, listener will be marked as elevated.
     * Listener may be treated differently by {@link addListeners} and {@link removeListeners}
     */
    elevated?: boolean;
    /**
     * Handler to be executed when the event is triggered.
     */
    handler: EventHandler;
    /**
     * If true, the handler will only be triggered once.
     */
    once?: boolean;
}

/**
 * Interface for slash commands
 */
export interface ISlashCommand {
    /**
     * Details about the slash command
     */
    command: ApplicationCommandData;
    /**
     * Handler to be executed when the command is invoked.
     *
     * @param interaction Interaction sent to the event handler
     */
    handler(interaction: CommandInteraction): void;
}

/**
 * Interface for EventHandler
 */
export type EventHandler = (...args: any[]) => Promise<void>;  // eslint-disable-line @typescript-eslint/no-explicit-any
/**
 * Interface for Task executors
 */
export type TaskExecutor = (client: Client, ...args: any[]) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
/**
 * Interface for ChatCommand executors
 */
export type ChatCommandExecutor = (message: Message) => Promise<void>;

/**
 * List for storing {@link Config} files
 */
export interface ConfigList {
    [configName: string]: Config
}

/**
 * Representation of a single config
 */
export interface Config {
    [key: string]: unknown
}
