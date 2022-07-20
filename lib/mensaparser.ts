import {MessageEmbed} from "discord.js";
import {CanteenLine, fetchMensa} from "ka-mensa-fetch";


/**
 * Returns the food plan from the KIT-Adenauerring-Mensa for today
 */
export async function getMensaData(): Promise<CanteenLine[]> {
    const mensaData = await fetchMensa("simplesite", {canteens: ['adenauerring']});
    return mensaData[0].lines;
}

/**
 * Builds an embed using the supplied food plan
 */
export function buildMensaEmbed(foodPlan: CanteenLine[]): MessageEmbed {
    const embed = new MessageEmbed();

    embed.setTitle("Mensaplan vom " + new Date().toLocaleDateString());
    embed.setTimestamp(new Date());

    let count = 0;
    for (const line of foodPlan) {
        if (line.meals.length > 0) {
            const content = line.meals.map(e => {
                if (e.price !== "") {
                    return `${e.name} (${e.price})`
                } else {
                    return `_${e.name}_`;
                }
            }).join("\n");
            embed.addField(line.name, content, true);
            count++;
            if (count == 2) {
                embed.addField('\u200b', '\u200b');
                count = 0;
            }
        }
    }

    return embed;
}