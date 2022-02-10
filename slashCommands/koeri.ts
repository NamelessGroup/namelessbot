import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import {ISlashCommand} from "../types";
import {ApplicationCommandData, CommandInteraction, Snowflake} from "discord.js";
import {get, write} from "../lib/configmanager";

interface IKoeriList {
    [combination: number]: number
}

const maxPossibleCombinations = 128;
const legendaryCombinations = [63, 127];

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

async function _setRating(userId: Snowflake, combination: number, rating: number): Promise<void> {
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
    for(let i in sSplit) {
        if(sSplit[i] === "1") {
            if(i as unknown as number === 0) {
                result += "Salz, ";
            } else {
                result += "Gewürz " + i + ", "
            }
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
    for(let i in sSplit) {
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

const handler = async (interaction: CommandInteraction) => {
    console.log(interaction.options.data);
    if(interaction.options.getSubcommand() === "generate") {
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
        }
        await interaction.followUp(_combinationToSeasonings(combination));
        return;
    }
    await interaction.followUp("No koeri for you yet");
}

export default {
    command,
    handler
} as ISlashCommand;