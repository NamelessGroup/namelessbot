import {
    type APIApplicationCommandInteractionDataOption,
    InteractionType,
    type APIApplicationCommandInteractionDataSubcommandOption,
    type Client,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ChatInputCommandInteraction,
} from "discord.js";
import { BaseMockInteractionBuilder } from "./BaseMockInteractionBuilder";
import { vi } from "vitest";

export class MockChatInputCommandInteractionBuilder extends BaseMockInteractionBuilder {
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

    public build(): ChatInputCommandInteraction {
        if (this.subcommand != null) {
            this.slashCommandOptions.push(this.subcommand);
        }

        const interaction = Reflect.construct(ChatInputCommandInteraction, [
            this.client,
            {
                ...this.buildBaseInteraction(
                    InteractionType.ApplicationCommand,
                ),
                data: {
                    id: this.slashCommandId,
                    name: this.slashCommandName,
                    type: ApplicationCommandType.ChatInput,
                    guild_id: this.getGuild().id,
                    options: this.slashCommandOptions,
                },
            },
        ]) as ChatInputCommandInteraction;

        interaction.deferReply = vi.fn();
        interaction.followUp = vi.fn();
        interaction.reply = vi.fn();

        return interaction;
    }
}
