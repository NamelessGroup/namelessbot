import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import {ISlashCommand} from "../types";
import {
    ApplicationCommandData,
    CommandInteraction,
    MessageSelectOptionData,
    Snowflake
} from "discord.js";
import {get, write} from "../lib/configmanager";

interface IKoeriList {
    [combination: number]: number
}

interface IStringKoeriList {
    [combination: string]: number
}

const maxPossibleCombinations = 64;
const legendaryCombinations = [63];

function _getRateOptions(): MessageSelectOptionData[] {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result: MessageSelectOptionData[] = [];
    for(const num of numbers) {
        result.push({
            label: num.toString(),
            value: num.toString()
        });
    }
    return result;
}

function _randint(lowerBound: number, upperBound: number) {
    return Math.floor(Math.random() * (upperBound - lowerBound + 1) + lowerBound);
}

function _hasHadCombination(userId: Snowflake, combination: number): boolean {
    const userCfg = get(userId, "koeri") as IKoeriList;
    if(userCfg === undefined) return false;
    return userCfg[combination] !== undefined;
}

function _hadEveryCombination(userId: Snowflake, includeLegendary=false): boolean {
    const userCfg = get(userId, "koeri") as IKoeriList;
    if(userCfg === undefined) return false;
    if (includeLegendary) {
        return Object.keys(userCfg).length >= maxPossibleCombinations - 1
    } else {
        return Object.keys(userCfg).length >= maxPossibleCombinations - 1 - legendaryCombinations.length
    }
}

export async function setRating(userId: Snowflake, combination: number, rating: number): Promise<void> {
    let userCfg = get(userId, "koeri") as IKoeriList;
    if(userCfg === undefined) userCfg = {};
    userCfg[combination] = rating;
    await write(userId, "koeri", userCfg);
}

function _combinationToSeasonings(combination: number) {
    let s = (combination >>> 0).toString(2);
    while(s.length < Math.log2(maxPossibleCombinations)) {
        s = "0" + s;
    }
    let result = "";
    const sSplit = s.split("");
    for(const i in sSplit) {
        if(sSplit[i] === "1") {
            result += "Gewürz " + i + ", "
        }
    }
    return result.substring(0, result.length-2);
}

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
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            name: "ratings",
            description: "Display a list of ratings"
        },
        {
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            name: "rate",
            description: "Add ratings without generating",
            options: [
                {
                    type: ApplicationCommandOptionTypes.INTEGER,
                    name: "combination",
                    description: "Combination to rate",
                    min_value: 1,
                    max_value: maxPossibleCombinations-1,
                    required: true
                },
                {
                    type: ApplicationCommandOptionTypes.INTEGER,
                    name: "rating",
                    description: "Rating to save",
                    min_value: 1,
                    max_value: 10,
                    required: true
                }
            ]
        },
        {
            type: ApplicationCommandOptionTypes.SUB_COMMAND,
            name: "generate",
            description: "Generate a seasonings-combination",
            options: [
                {
                    type: ApplicationCommandOptionTypes.INTEGER,
                    name: "amount_seasonings",
                    description: "Amount of different seasonings",
                    min_value: 1,
                    max_value: 7
                }
            ]
        }
    ]
} as ApplicationCommandData;

async function handler(interaction: CommandInteraction) {
    if(interaction.options.getSubcommand() === "generate") {
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
            || (interaction.options.getInteger("amount_seasonings") !== null && interaction.options.getInteger("amount_seasonings") !== _combinationToAmountSeasonings(combination))) {
            combination += 1
            combination %= maxPossibleCombinations
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
                    type: "ACTION_ROW",
                    components: [
                        {
                            type: "SELECT_MENU",
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
    if(interaction.options.getSubcommand() === "rate") {
        await interaction.deferReply({ ephemeral: true });
        await setRating(interaction.user.id, interaction.options.getInteger("combination"), interaction.options.getInteger("rating"));
        await interaction.followUp({
            ephemeral: true,
            content: `Kombination ${interaction.options.getInteger("combination")} bewertet mit ${interaction.options.getInteger("rating")}`
        });
        return;
    }
    if(interaction.options.getSubcommand() === "ratings") {
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
    }
}

export default {
    command,
    handler
} as ISlashCommand;
