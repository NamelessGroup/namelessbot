import {
    ApplicationCommandData,
    Client,
    CommandInteraction,
} from "discord.js";

/**
 * Interface for generic event listener
 */
export interface IEventListener {
    /**
     * Event to listen to.
     */
    event: string;
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
    handler(this: void, interaction: CommandInteraction): void | Promise<void>;
}

/**
 * Interface for EventHandler
 */
export type EventHandler = (...args: any[]) => Promise<void>; // eslint-disable-line @typescript-eslint/no-explicit-any
/**
 * Interface for Task executors
 */
export type TaskExecutor = (client: Client, ...args: any[]) => void; // eslint-disable-line @typescript-eslint/no-explicit-any