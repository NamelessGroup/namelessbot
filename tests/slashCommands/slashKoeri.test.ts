import { get, write } from '../../lib/configmanager';
import { mockSlash } from '../utils';
import koeri, { setRating } from '../../slashCommands/koeri';
import { ComponentType } from 'discord.js';

// Mocking the config manager
const getMock = get as jest.Mock;
const writeMock = write as jest.Mock;

jest.mock('../lib/configmanager');

// Mocking Math.random
const random = jest.spyOn(global.Math, "random");

test('/koeri - Set rating test', async () => {
    getMock.mockReturnValue(undefined);
    
    await setRating("abc", 12, 13);

    expect(writeMock.mock.lastCall[0]).toBe("abc");
    expect(writeMock.mock.lastCall[1]).toBe("koeri");
    expect(writeMock.mock.lastCall[2]).toEqual({12: 13});
});

test('/koeri generate - Test A', async () => {
    getMock.mockReturnValue(undefined);
    random.mockReturnValueOnce(0.2233);
    // combination 15 - 3, 4, 5, 6

    const mockInput = mockSlash({}, "generate");

    await koeri.handler(mockInput.input);

    expect(mockInput.mockFollowUp.mock.lastCall[0]).toEqual({
        content: "Koeri-Kombination: Gewürz 3, Gewürz 4, Gewürz 5, Gewürz 6",
        components: _getGenerateComponents(15)
    })
});

test('/koeri generate - Test B', async () => {
    getMock.mockReturnValue({15: 10});
    random.mockReturnValueOnce(0.2233);
    // combination 15 - 3, 4, 5, 6 - But colides and becomes 16 - 2

    const mockInput = mockSlash({}, "generate");

    await koeri.handler(mockInput.input);

    expect(mockInput.mockFollowUp.mock.lastCall[0]).toEqual({
        content: "Koeri-Kombination: Gewürz 2",
        components: _getGenerateComponents(16)
    })
});

test('/koeri rate - Test A', async () => {
    getMock.mockReturnValue(undefined);

    const mockInput = mockSlash({
        "combination": 22,
        "rating": 10
    }, "rate");

    await koeri.handler(mockInput.input);

    expect(writeMock.mock.lastCall[0]).toBe("mockUser");
    expect(writeMock.mock.lastCall[1]).toBe("koeri");
    expect(writeMock.mock.lastCall[2]).toEqual({22: 10});
    expect(mockInput.mockFollowUp.mock.lastCall[0]).toEqual({
        ephemeral: true,
        content: "Kombination 22 bewertet mit 10"
    });
});

test('/koeri rate - Test B', async () => {
    getMock.mockReturnValue({22: 8, 19: 3});

    const mockInput = mockSlash({
        "combination": 22,
        "rating": 10
    }, "rate");

    await koeri.handler(mockInput.input);

    expect(writeMock.mock.lastCall[0]).toBe("mockUser");
    expect(writeMock.mock.lastCall[1]).toBe("koeri");
    expect(writeMock.mock.lastCall[2]).toEqual({22: 10, 19: 3});
    expect(mockInput.mockFollowUp.mock.lastCall[0]).toEqual({
        ephemeral: true,
        content: "Kombination 22 bewertet mit 10"
    });
});

test('/koeri ratings - Test A', async () => {
    getMock.mockReturnValue(undefined);

    const mockInput = mockSlash({}, "ratings");

    await koeri.handler(mockInput.input);

    expect(mockInput.mockFollowUp.mock.lastCall[0]).toBe("Du musst zunächst koeri essen!")
});

test('/koeri ratings - Test B', async () => {
    getMock.mockReturnValue({12: 10});

    const mockInput = mockSlash({}, "ratings");

    await koeri.handler(mockInput.input);

    expect(mockInput.mockFollowUp.mock.lastCall[0]).toBe("```Gewürz 3, Gewürz 4 | 10\n```");
});

test('/koeri progress - Test A', async () => {
    getMock.mockReturnValue(undefined);

    const mockInput = mockSlash({}, "progress");

    await koeri.handler(mockInput.input);

    expect(mockInput.mockFollowUp.mock.lastCall[0]).toBe("Du musst zunächst koeri essen!")
});

test('/koeri progress - Test B', async () => {
    getMock.mockReturnValue({19: 10, 20: 10, 63: 6});

    const mockInput = mockSlash({}, "progress");

    await koeri.handler(mockInput.input);

    expect(mockInput.mockFollowUp.mock.lastCall[0]).toBe("Koeri-Fortschritt:\n`....................  3 / 63 (4.76%)`")
});

// Utility functions for testing /koeri
function _getGenerateComponents(combination: number) {
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

function _getRateOptions() {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = [];
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