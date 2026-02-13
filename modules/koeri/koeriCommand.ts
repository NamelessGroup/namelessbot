import type { ISlashCommand } from "../../types";
import {
    type ApplicationCommandData,
    ApplicationCommandOptionType,
    type ChatInputCommandInteraction,
    ComponentType,
    type MessageSelectOption,
    type Snowflake,
} from "discord.js";
import { ConfigurationFile, get, write } from "../../lib/configmanager";

export interface IKoeriList {
    [combination: number]: number;
}

const maxPossibleCombinations = 64;
const legendaryCombinations = [63];

/**
 * Returns all rating options for combinations.
 *
 * @returns Rating options
 */
function _getRateOptions(): MessageSelectOption[] {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result: MessageSelectOption[] = [];
    for (const num of numbers) {
        result.push({
            label: num.toString(),
            value: num.toString(),
            default: false,
            description: "",
            emoji: null,
        });
    }
    return result;
}

/**
 * Generates a random integer between the supplied bounds.
 *
 * @param lowerBound Lower bound of the generation (inclusive)
 * @param upperBound Upper bound of the generation (inclusive)
 * @returns Random integer
 */
function _randint(lowerBound: number, upperBound: number): number {
    return Math.floor(
        Math.random() * (upperBound - lowerBound + 1) + lowerBound,
    );
}

/**
 * Checks if a user already had a combination previously.
 *
 * @param userId User to check
 * @param combination Combination to check
 * @returns true, if the user already had the supplied combination, false otherwise
 */
function _hasHadCombination(userId: Snowflake, combination: number): boolean {
    const userCfg = get(userId, ConfigurationFile.KOERI);
    if (userCfg === undefined) return false;
    return userCfg[combination] !== undefined;
}

/**
 * Checks whether a user already had all combinations possible.
 *
 * @param userId User to check
 * @param includeLegendary Whether to also check for legendary combinations
 * @returns true, if the user has had all combinations, false otherwise
 */
function _hadEveryCombination(
    userId: Snowflake,
    includeLegendary = false,
): boolean {
    const userCfg = get(userId, ConfigurationFile.KOERI);
    if (userCfg === undefined) return false;
    if (includeLegendary) {
        return Object.keys(userCfg).length >= maxPossibleCombinations - 1;
    } else {
        return (
            Object.keys(userCfg).length >=
            maxPossibleCombinations - 1 - legendaryCombinations.length
        );
    }
}

/**
 * Sets the rating of a user of a specific combination.
 *
 * @param userId User to set rating for
 * @param combination Combination to set the rating for
 * @param rating Rating to set
 */
export async function setRating(
    userId: Snowflake,
    combination: number,
    rating: number,
): Promise<void> {
    let userCfg = get(userId, ConfigurationFile.KOERI);
    userCfg ??= {};
    userCfg[combination] = rating;
    await write(userId, ConfigurationFile.KOERI, userCfg);
}

/**
 * Converts a combination number to an array of booleans, indicating true, if the seasoning is set, false otherwise
 *
 * @param combination Combination to convert
 * @returns Boolean array
 */
function _combinationToBooleanArray(combination: number): boolean[] {
    const result = new Array<boolean>(Math.log2(maxPossibleCombinations)).fill(
        false,
    );
    for (let i = 0; i < result.length; i++) {
        if (combination & (1 << i)) {
            result[i] = true;
        }
    }
    return result.toReversed();
}

/**
 * Converts a combination number to a string.
 *
 * @param combination Combination to convert
 * @param prefix Prefix before each seasoning
 * @returns The combination as a string
 */
function _combinationToSeasonings(
    combination: number,
    prefix = "Gewürz ",
): string {
    const bits = _combinationToBooleanArray(combination);
    const seasonings: string[] = [];
    bits.forEach((val, i) => {
        if (val) {
            seasonings.push(prefix + (i + 1));
        }
    });
    return seasonings.join(", ");
}

/**
 * Returns the amount of seasonings in a combinanion.
 *
 * @param combination Combination to check
 * @returns The amount of seasonings inside that combination
 */
function _combinationToAmountSeasonings(combination: number): number {
    const bits = _combinationToBooleanArray(combination);
    let count = 0;
    for (const b of bits) {
        if (b) {
            count += 1;
        }
    }
    return count;
}

const command = {
    name: "koeri",
    description: "Generates combinations of koeri-seasonings",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "ratings",
            description: "Display a list of ratings",
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "rate",
            description: "Add ratings without generating",
            options: [
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: "combination",
                    description: "Combination to rate",
                    min_value: 1,
                    max_value: maxPossibleCombinations - 1,
                    required: true,
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: "rating",
                    description: "Rating to save",
                    min_value: 1,
                    max_value: 10,
                    required: true,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "generate",
            description: "Generate a seasonings-combination",
            options: [
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: "amount_seasonings",
                    description: "Amount of different seasonings",
                    min_value: 1,
                    max_value: 7,
                },
            ],
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "progress",
            description: "See your koeri-progress",
        },
    ],
} as ApplicationCommandData;

/**
 * Handles a command interaction.
 *
 * @param interaction Interaction to handle
 */
async function handler(
    interaction: ChatInputCommandInteraction,
): Promise<void> {
    const options = interaction.options;
    if (options.getSubcommand() === "generate") {
        await interaction.deferReply();
        if (_hadEveryCombination(interaction.user.id, true)) {
            await interaction.followUp(
                "Du Legende hast das koeriwerk durchgespielt!",
            );
            return;
        } else if (_hadEveryCombination(interaction.user.id)) {
            await interaction.channel.send(
                "https://i.redd.it/ain9jl82md381.jpg",
            );
        }

        let combination = _randint(1, maxPossibleCombinations - 1);
        const startingCombination = combination;
        while (
            _hasHadCombination(interaction.user.id, combination) ||
            (legendaryCombinations.includes(combination) &&
                !_hadEveryCombination(interaction.user.id)) ||
            (options.getInteger("amount_seasonings") != null &&
                options.getInteger("amount_seasonings") !==
                    _combinationToAmountSeasonings(combination))
        ) {
            combination += 1;
            combination %= maxPossibleCombinations;
            if (combination === 0) {
                combination = 1;
            }
            if (combination === startingCombination) {
                await interaction.followUp(
                    "Du hattest bereits alle Kombinationen mit dieser Anzahl Gewürze.",
                );
                return;
            }
        }
        await interaction.followUp({
            content: `Koeri-Kombination: ${_combinationToSeasonings(combination)}`,
            components: [
                {
                    type: ComponentType.ActionRow,
                    components: [
                        {
                            type: ComponentType.StringSelect,
                            customId: `koeri-u${interaction.user.id}$${combination}`,
                            options: _getRateOptions(),
                            placeholder: "Bewertung",
                        },
                    ],
                },
            ],
        });
        return;
    }
    if (options.getSubcommand() === "rate") {
        await interaction.deferReply({ ephemeral: true });
        await setRating(
            interaction.user.id,
            options.getInteger("combination"),
            options.getInteger("rating"),
        );
        await interaction.followUp({
            ephemeral: true,
            content: `Kombination ${options.getInteger("combination")} bewertet mit ${options.getInteger("rating")}`,
        });
        return;
    }
    if (options.getSubcommand() === "ratings") {
        await interaction.deferReply();
        const userCfg = get(interaction.user.id, ConfigurationFile.KOERI);
        if (userCfg === undefined) {
            await interaction.followUp("Du musst zunächst koeri essen!");
            return;
        }
        let longestCombination = 0;
        const combinations: { seasoning: string; rating: number }[] = [];
        for (const combination in userCfg) {
            const str =
                "Gewürz " + _combinationToSeasonings(parseInt(combination), "");
            if (str.length > longestCombination)
                longestCombination = str.length;
            combinations.push({ seasoning: str, rating: userCfg[combination] });
        }

        combinations.sort((a, b) => b.rating - a.rating);

        let result = "```";
        for (const combination of combinations) {
            result +=
                combination.seasoning.padEnd(longestCombination, " ") +
                " | " +
                combination.rating +
                "\n";
        }
        result += "```";
        await interaction.followUp(result);
        return;
    }
    if (options.getSubcommand() === "progress") {
        await interaction.deferReply();
        const userCfg = get(interaction.user.id, ConfigurationFile.KOERI);
        if (userCfg === undefined) {
            await interaction.followUp("Du musst zunächst koeri essen!");
            return;
        }
        const amountCombinationsRated = Object.keys(userCfg).length;
        const percentage =
            (amountCombinationsRated / (maxPossibleCombinations - 1)) * 100;
        let message = "Koeri-Fortschritt:\n`";
        message += "#".repeat(Math.floor(percentage / 5));
        message += ".".repeat(20 - Math.floor(percentage / 5));
        message += `  ${amountCombinationsRated} / ${maxPossibleCombinations - 1} (${percentage.toFixed(2)}%)`;
        message += "`";
        await interaction.followUp(message);
        return;
    }
    await interaction.followUp({
        ephemeral: true,
        content: "Please enter an subcommand!",
    });
}

/**
 * Slash command definiton for /koeri
 */
export default {
    command,
    handler,
} as ISlashCommand;
