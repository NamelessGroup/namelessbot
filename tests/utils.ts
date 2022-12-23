import { CommandInteraction } from "discord.js";

interface SlashCommandArguments {
    [key: string]: string | number | boolean;
}

interface MockSlashInput {
    input: CommandInteraction;
    mockDeferReply: jest.Mock;
    mockFollowUp: jest.Mock;
}

export function mockSlash(slashCommandArguments: SlashCommandArguments, subcommand?: string): MockSlashInput {
    const mockDeferReply = jest.fn();
    const mockFollowUp = jest.fn();

    // Mocking options getter
    const mockGetString = jest.fn((key) => slashCommandArguments[key] as string);
    const mockGetBoolean = jest.fn((key) => slashCommandArguments[key] as boolean);
    const mockGetNumber = jest.fn((key) => slashCommandArguments[key] as number);
    const mockGetSubcommand = jest.fn(() => subcommand);

    const commandInteraction = {
        deferReply: mockDeferReply,
        followUp: mockFollowUp,
        options: {
            data: slashCommandArguments,
            getString: mockGetString,
            getBoolean: mockGetBoolean,
            getInteger: mockGetNumber,
            getNumber: mockGetNumber,
            getSubcommand: mockGetSubcommand
        }
    } as unknown as CommandInteraction;

    return {
        input: commandInteraction,
        mockDeferReply,
        mockFollowUp
    }
}