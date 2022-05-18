import {ISlashCommand} from "../types";
import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import {CommandInteraction} from "discord.js";
import {generateTruthTable, parse} from "../lib/truthtable";

export default {
    command: {
        name: "truthtable",
        description: "Generates a truth table from a boolean expression",
        options: [
            {
                type: ApplicationCommandOptionTypes.STRING,
                name: "boolean_expression",
                description: "Expression to evaluate",
                required: true
            }
        ]
    },
    handler: async function(interaction: CommandInteraction) {
        await interaction.deferReply();

        try {
            let parsedExpression = parse(interaction.options.getString("boolean_expression"));
            let truthTable = generateTruthTable(parsedExpression);

            // Building the table
            let table = "```\n"
            for (let variable of truthTable.variables) {
                table += ` ${variable} |`
            }
            table += "| Result\n"
            for (let result of truthTable.results) {
                for (let assig in result.assignment) {
                    const padding = (truthTable.variables[assig].length - 1) / 2
                    table += " ".repeat(Math.floor(padding) + 1)
                    table += result.assignment[assig] ? "T" : "F";
                    table += " ".repeat(Math.ceil(padding) + 1) + "|"
                }
                table += "|    "
                table += result.result ? "T" : "F";
                table += "\n";
            }
            table += "```"
            await interaction.followUp("TruthTable for `" + parsedExpression.ast.toString(parsedExpression.variables) + "`:\n" + table);
        } catch(e) {
            await interaction.followUp("`" + e.toString() + "`");
        }
    }
} as ISlashCommand
