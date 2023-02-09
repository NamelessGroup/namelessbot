import {ISlashCommand} from "../../types";
import {
    ApplicationCommandData,
    ApplicationCommandOptionType,
    CommandInteraction,
    CommandInteractionOptionResolver,
    ComponentType,
    MessageSelectOption,
    Snowflake
} from "discord.js";
import {get, write} from "../../lib/configmanager";

interface IKoeriList {
    [combination: number]: number
}

interface IStringKoeriList {
    [combination: string]: number
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

/**
 * Generates a random integer between the supplied bounds.
 *
 * @param lowerBound Lower bound of the generation (inclusive)
 * @param upperBound Upper bound of the generation (inclusive)
 * @returns Random integer
 */
function _randint(lowerBound: number, upperBound: number): number {
    return Math.floor(Math.random() * (upperBound - lowerBound + 1) + lowerBound);
}

/**
 * Checks if a user already had a combination previously.
 *
 * @param userId User to check
 * @param combination Combination to check
 * @returns true, if the user already had the supplied combination, false otherwise
 */
function _hasHadCombination(userId: Snowflake, combination: number): boolean {
    const userCfg = get(userId, "koeri") as IKoeriList;
    if(userCfg === undefined) return false;
    return userCfg[combination] !== undefined;
}

/**
 * Checks whether a user already had all combinations possible.
 * 
 * @param userId User to check
 * @param includeLegendary Whether to also check for legendary combinations
 * @returns true, if the user has had all combinations, false otherwise
 */
function _hadEveryCombination(userId: Snowflake, includeLegendary=false): boolean {
    const userCfg = get(userId, "koeri") as IKoeriList;
    if(userCfg === undefined) return false;
    if (includeLegendary) {
        return Object.keys(userCfg).length >= maxPossibleCombinations - 1;
    } else {
        return Object.keys(userCfg).length >= maxPossibleCombinations - 1 - legendaryCombinations.length;
    }
}

/**
 * Sets the rating of a user of a specific combination.
 * 
 * @param userId User to set rating for
 * @param combination Combination to set the rating for
 * @param rating Rating to set
 */
export async function setRating(userId: Snowflake, combination: number, rating: number): Promise<void> {
    let userCfg = get(userId, "koeri") as IKoeriList;
    if(userCfg === undefined) userCfg = {};
    userCfg[combination] = rating;
    await write(userId, "koeri", userCfg);
}

/**
 * Converts a combination number to a string.
 * 
 * @param combination Combination to convert
 * @returns The combination as a string
 */
function _combinationToSeasonings(combination: number): string {
    let s = (combination >>> 0).toString(2);
    while(s.length < Math.log2(maxPossibleCombinations)) {
        s = "0" + s;
    }
    let result = "";
    const sSplit = s.split("");
    for(const i in sSplit) {
        if(sSplit[i] === "1") {
            result += "Gewürz " + (parseInt(i) - 1 + 2) + ", ";
        }
    }
    return result.substring(0, result.length-2);
}

/**
 * Returns the amount of seasonings in a combinanion.
 * 
 * @param combination Combination to check
 * @returns The amount of seasonings inside that combination
 */
function _combinationToAmountSeasonings(combination: number): number {
    let s = (combination >>> 0).toString(2);
    while(s.length < Math.log2(maxPossibleCombinations)) {
        s = "0" + s;
    }
    let result = 0;
    const sSplit = s.split("");
    for(const i in sSplit) {
        if(sSplit[i] === "1") {
            result += 1;
        }
    }
    return result;
}

const command = {
    name: "koeri",
    description: "Generates combinations of koeri-seasonings",
    options: [
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "ratings",
            description: "Display a list of ratings"
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
                    max_value: maxPossibleCombinations-1,
                    required: true
                },
                {
                    type: ApplicationCommandOptionType.Integer,
                    name: "rating",
                    description: "Rating to save",
                    min_value: 1,
                    max_value: 10,
                    required: true
                }
            ]
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
                    max_value: 7
                }
            ]
        },
        {
            type: ApplicationCommandOptionType.Subcommand,
            name: "progress",
            description: "See your koeri-progress",
        }
    ]
} as ApplicationCommandData;

/**
 * Handles a command interaction.
 * 
 * @param interaction Interaction to handle
 */
async function handler(interaction: CommandInteraction): Promise<void> {
    const options = interaction.options as CommandInteractionOptionResolver;
    if(options.getSubcommand() === "generate") {
        await interaction.deferReply();
        if(_hadEveryCombination(interaction.user.id, true)) {
            await interaction.followUp("Du Legende hast das koeriwerk durchgespielt!");
            return;
        } else if(_hadEveryCombination(interaction.user.id)) {
            await interaction.channel.send("https://i.redd.it/ain9jl82md381.jpg");
        }

        let combination = _randint(1, maxPossibleCombinations-1);
        const startingCombination = combination;
        while(_hasHadCombination(interaction.user.id, combination)
            || (legendaryCombinations.includes(combination) && !_hadEveryCombination(interaction.user.id))
            || (options.getInteger("amount_seasonings") !== null && options.getInteger("amount_seasonings") !== _combinationToAmountSeasonings(combination))) {
            combination += 1;
            combination %= maxPossibleCombinations;
            if(combination === 0) {
                combination = 1;
            }
            if(combination === startingCombination) {
                await interaction.followUp("Du hattest bereits alle Kombinationen mit dieser Anzahl Gewürze.");
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
                            placeholder: "Bewertung"
                        }
                    ]
                }
            ]
        });
        return;
    }
    if(options.getSubcommand() === "rate") {
        await interaction.deferReply({ ephemeral: true });
        await setRating(interaction.user.id, options.getInteger("combination"), options.getInteger("rating"));
        await interaction.followUp({
            ephemeral: true,
            content: `Kombination ${options.getInteger("combination")} bewertet mit ${options.getInteger("rating")}`
        });
        return;
    }
    if(options.getSubcommand() === "ratings") {
        await interaction.deferReply();
        const userCfg = get(interaction.user.id, "koeri") as IKoeriList;
        if(userCfg === undefined) {
            await interaction.followUp("Du musst zunächst koeri essen!");
            return;
        }
        let longestCombination = 0;
        const combinations: IStringKoeriList = {};
        for(const combination in userCfg) {
            const str = _combinationToSeasonings(parseInt(combination));
            if(str.length > longestCombination) longestCombination = str.length;
            combinations[str] = userCfg[combination];
        }
        let result = "```";
        for(const combination in combinations) {
            result += combination.padEnd(longestCombination, " ") + " | " + combinations[combination] + "\n";
        }
        result += "```";
        await interaction.followUp(result);
        return;
    }
    if(options.getSubcommand() === "progress") {
        await interaction.deferReply();
        const userCfg = get(interaction.user.id, "koeri") as IKoeriList;
        if(userCfg === undefined) {
            await interaction.followUp("Du musst zunächst koeri essen!");
            return;
        }
        const amountCombinationsRated = Object.keys(userCfg).length;
        const percentage = (amountCombinationsRated / (maxPossibleCombinations - 1)) * 100;
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
        content: 'Please enter an subcommand!'
    });
}

/**
 * Slash command definiton for /koeri
 */
export default {
    command,
    handler
} as ISlashCommand;
