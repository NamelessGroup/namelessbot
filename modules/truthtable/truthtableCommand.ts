import {ISlashCommand} from "../../types";
import {ApplicationCommandOptionType, CommandInteraction, CommandInteractionOptionResolver} from "discord.js";
import {generateTruthTable, parse} from "./truthtable";

/**
 * Slash command definition for /truthtable
 */
export default {
    command: {
        name: "truthtable",
        description: "Generates a truth table from a boolean expression",
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "boolean_expression",
                description: "Expression to evaluate",
                required: true
            }
        ]
    },
    handler: async function(interaction: CommandInteraction) {
        await interaction.deferReply();
        const options = interaction.options as CommandInteractionOptionResolver;

        try {
            const parsedExpression = parse(options.getString("boolean_expression"));
            const truthTable = generateTruthTable(parsedExpression);

            // Building the table
            let table = "```\n";
            for (const variable of truthTable.variables) {
                table += ` ${variable} |`;
            }
            table += "| Result\n";
            for (const result of truthTable.results) {
                for (const assig in result.assignment) {
                    const padding = (truthTable.variables[assig].length - 1) / 2;
                    table += " ".repeat(Math.floor(padding) + 1);
                    table += result.assignment[assig] ? "T" : "F";
                    table += " ".repeat(Math.ceil(padding) + 1) + "|";
                }
                table += "|    ";
                table += result.result ? "T" : "F";
                table += "\n";
            }
            table += "```";
            await interaction.followUp("TruthTable for `" + parsedExpression.ast.toString(parsedExpression.variables) + "`:\n" + table);
        } catch(e) {
            await interaction.followUp("`" + e.toString() + "`");
        }
    }
} as ISlashCommand;
