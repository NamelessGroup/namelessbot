import { APIApplicationCommandInteractionDataOption, InteractionType, APIApplicationCommandInteractionDataSubcommandOption, Client, ApplicationCommandOptionType, ApplicationCommandType, APIChatInputApplicationCommandInteraction } from "discord.js";
import { MockChatInputCommandInteraction } from "../../utils";
import { BaseMockInteractionBuilder } from "./BaseMockInteractionBuilder";

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
                guild_id: this.getGuild().id,
                options: this.slashCommandOptions,
            },
        } as APIChatInputApplicationCommandInteraction);
    }
}