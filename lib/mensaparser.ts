import { JSDOM } from 'jsdom';
import { decode } from 'he';
import {MessageEmbed} from "discord.js";

interface FoodPlan {
    [line: string]: Meal[]
}

interface Meal {
    name: string;
    price: string;
}

/**
 * Parses HTML, replacing `<br>` with `\n`, removing comments & decoding HTML entities
 * @param innerHTML Input string
 */
function parseTextHTML(innerHTML: string): string {
    return decode(innerHTML
        .replace(new RegExp("<br>", "g"), "\n")
        .replace(new RegExp("<!-- .+ -->", "g"), ""));
}

/**
 * Returns the food plan from the KIT-Adenauerring-Mensa for today
 */
export async function getMensaData(): Promise<FoodPlan> {
    const mensaURL = "https://www.sw-ka.de/de/essen/";
    const dom = await JSDOM.fromURL(mensaURL);
    const document = dom.window.document;

    const rows = document.querySelectorAll('#fragment-c1-1>table>tbody>tr');

    const foodPlan: FoodPlan = {}
    for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        const line = parseTextHTML(row.querySelector('.mensatype>div').innerHTML);
        const foods = row.querySelectorAll('.mensadata>table>tbody>tr');
        const foodList: Meal[] = [];
        for (let j = 0; j < foods.length; j++) {
            try {
                const food = foods.item(j);
                let name = parseTextHTML(food.querySelector('.bg>b').innerHTML);
                const details = food.querySelector('.bg>span');
                if (details) {
                    name += " " + parseTextHTML(details.innerHTML);
                }
                const price = parseTextHTML(food.querySelector('.price_1').innerHTML);
                foodList.push({name, price});
            // eslint-disable-next-line no-empty
            } catch { }
        }
        foodPlan[line] = foodList;
    }
    return foodPlan;
}

/**
 * Builds an embed using the supplied food plan
 */
export function buildMensaEmbed(foodPlan: FoodPlan): MessageEmbed {
    const embed = new MessageEmbed();

    embed.setTitle("Mensaplan vom " + new Date().toLocaleDateString());
    embed.setTimestamp(new Date());

    let count = 0;
    for (const line in foodPlan) {
        if (foodPlan[line].length > 0) {
            const content = foodPlan[line].map(e => {
                if (e.price !== "") {
                    return `${e.name} (${e.price})`
                } else {
                    return `_${e.name}_`;
                }
            }).join("\n");
            embed.addField(line, content, true);
            count++;
            if (count == 2) {
                embed.addField('\u200b', '\u200b');
                count = 0;
            }
        }
    }

    return embed;
}
