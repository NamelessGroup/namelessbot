import {EmbedBuilder} from "discord.js";
import {CanteenLine, fetchMensa} from "ka-mensa-fetch";


/**
 * Returns the food plan from the KIT-Adenauerring-Mensa for today.
 *
 * @returns The food plans from the KIT-Adenauerring-Mensa for today
 */
export async function getMensaData(): Promise<CanteenLine[]> {
    const mensaData = await fetchMensa("simplesite", {canteens: ['adenauerring']});
    return mensaData[0].lines;
}

/**
 * Builds an embed using the supplied food plan.
 *
 * @param foodPlan Food plan to build an embed for
 * @returns Embed of the supplied foodplan
 */
export function buildMensaEmbed(foodPlan: CanteenLine[]): EmbedBuilder {
    const embed = new EmbedBuilder();

    embed.setTitle("Mensaplan vom " + new Date().toLocaleDateString());
    embed.setTimestamp(new Date());

    let count = 0;
    for (const line of foodPlan) {
        if (line.meals.length > 0) {
            const content = line.meals.map(e => {
                if (e.price !== "") {
                    return `${getClassificationEmoji(e.classifiers)} ${e.name} (${e.price})`;
                } else {
                    return `${getClassificationEmoji(e.classifiers)} _${e.name}_`;
                }
            }).join("\n");
            embed.addFields({name: line.name, value: content, inline: true});
            count++;
            if (count == 2) {
                embed.addFields({name: '\u200b', value: '\u200b'});
                count = 0;
            }
        }
    }

    return embed;
}

/**
 * Generates the emoji representation of the given classifiers of a meal
 *
 * @param classification Classifiers of meal
 * @returns Emoji of the classifiers
 */
function getClassificationEmoji(classification: string[]): string {
    if (classification.length == 0) {
        return '';
    }
    if (classification.includes('VG')) {
        return ':ear_of_rice:';
    }
    if (classification.includes('VEG')) {
        return ':carrot:';
    }
    if (classification.includes('S') || classification[0].startsWith('S')) {
        return ':pig:';
    }
    if (classification.includes('R') || classification[0].startsWith('R')) {
        return ':cow:';
    }
    return '';
}