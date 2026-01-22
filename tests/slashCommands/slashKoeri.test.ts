import { test, expect, vi, afterEach } from 'vitest';
import * as configManager from '../../lib/configmanager';
import koeri, { setRating } from '../../modules/koeri/koeriCommand';
import { MockSlashCommand } from '../utils';
import { ActionRowData, ComponentType, MessageActionRowComponentData, SelectMenuComponentOptionData } from 'discord.js';

// Mocking the config manager
const getMock = vi.spyOn(configManager, 'get').mockImplementation(() => undefined);
const writeMock = vi.spyOn(configManager, 'write').mockImplementation(() => undefined);

const random = vi.spyOn(globalThis.Math, 'random');

afterEach(() => {
    getMock.mockReset();
    getMock.mockImplementation(() => undefined);
    writeMock.mockReset();
    writeMock.mockImplementation(() => undefined);
});

test('Set rating test', async () => {
    await setRating("abc", 12, 13);

    expect(writeMock).toHaveBeenLastCalledWith("abc", "koeri", {12: 13});
});

test('/koeri generate - Test A', async () => {
    random.mockReturnValueOnce(0.2233);
    // combination 15 - 3, 4, 5, 6

    const mockSlash = new MockSlashCommand(koeri.handler)
        .setSubcommand("generate");
    
    await mockSlash.call();

    expect(mockSlash).toBeFollowedUpWith({
        content: "Koeri-Kombination: Gewürz 3, Gewürz 4, Gewürz 5, Gewürz 6",
        components: _getGenerateComponents(15)
    })
});

test('/koeri generate - Test B', async () => {
    getMock.mockReturnValue({15: 10});
    random.mockReturnValueOnce(0.2233);
    // combination 15 - 3, 4, 5, 6 - But colides and becomes 16 - 2

    const mockSlash = new MockSlashCommand(koeri.handler)
        .setSubcommand("generate");

    await mockSlash.call();

    expect(mockSlash).toBeFollowedUpWith({
        content: "Koeri-Kombination: Gewürz 2",
        components: _getGenerateComponents(16)
    })
});

test('/koeri rate - Test A', async () => {
    const mockSlash = new MockSlashCommand(koeri.handler)
        .setSubcommand("rate")
        .setArgument("combination", 22)
        .setArgument("rating", 10);
    
    await mockSlash.call();

    expect(writeMock).toHaveBeenLastCalledWith("mockUser", "koeri", { 22: 10 });
    expect(mockSlash).toBeFollowedUpWith({
        ephemeral: true,
        content: "Kombination 22 bewertet mit 10"
    });
});

test('/koeri rate - Test B', async () => {
    getMock.mockReturnValue({22: 8, 19: 3});

    const mockSlash = new MockSlashCommand(koeri.handler)
        .setSubcommand("rate")
        .setArgument("combination", 22)
        .setArgument("rating", 10);

    await mockSlash.call();

    expect(writeMock).toHaveBeenLastCalledWith("mockUser", "koeri", { 22: 10, 19: 3 });
    expect(mockSlash).toBeFollowedUpWith({
        ephemeral: true,
        content: "Kombination 22 bewertet mit 10"
    });
});

test('/koeri ratings - Test A', async () => {
    const mockSlash = new MockSlashCommand(koeri.handler)
        .setSubcommand("ratings");
    
    await mockSlash.call();
    
    expect(mockSlash).toBeFollowedUpWith("Du musst zunächst koeri essen!");
});

test('/koeri ratings - Test B', async () => {
    getMock.mockReturnValue({12: 10});

    const mockSlash = new MockSlashCommand(koeri.handler)
        .setSubcommand("ratings");
    
    await mockSlash.call();

    expect(mockSlash).toBeFollowedUpWith("```Gewürz 3, 4 | 10\n```");
});

test('/koeri progress - Test A', async () => {
    const mockSlash = new MockSlashCommand(koeri.handler)
        .setSubcommand("progress");

    await mockSlash.call();

    expect(mockSlash).toBeFollowedUpWith("Du musst zunächst koeri essen!")
});

test('/koeri progress - Test B', async () => {
    getMock.mockReturnValue({19: 10, 20: 10, 63: 6});

    const mockSlash = new MockSlashCommand(koeri.handler)
        .setSubcommand("progress");

    await mockSlash.call();

    expect(mockSlash).toBeFollowedUpWith("Koeri-Fortschritt:\n`....................  3 / 63 (4.76%)`")
});

// Utility functions for testing /koeri
function _getGenerateComponents(combination: number): ActionRowData<MessageActionRowComponentData>[] {
    return [
        {
            type: ComponentType.ActionRow,
            components: [
                {
                    type: ComponentType.StringSelect,
                    customId: `koeri-umockUser$${combination}`,
                    options: _getRateOptions(),
                    placeholder: "Bewertung"
                }
            ]
        }
    ]
}

function _getRateOptions(): SelectMenuComponentOptionData[] {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = [] as SelectMenuComponentOptionData[];
    for(const num of numbers) {
        result.push({
            label: num.toString(),
            value: num.toString(),
            default: false,
            description: "",
            emoji: null
        });
    }
    return result;
}