import {CommandInteraction, Message, MessageEmbed, ReactionCollectorOptions} from "discord.js";
import {ISlashCommand} from "../types";
import {ApplicationCommandOptionTypes} from "discord.js/typings/enums";
import {get} from "../lib/configmanager";
import {JSONOutput} from "typedoc";


export default {
    command: {
        name: "vote",
        description: "Starts a voting.",
        options: [
            {
                type: ApplicationCommandOptionTypes.STRING,
                name: "name",
                description: "Give this vote a reason",
                required: false
            },
            {
                type: ApplicationCommandOptionTypes.BOOLEAN,
                name: "istimed",
                description: "Makes this Vote to a Timed Vote.",
                required: false,
            },
            {
                type: ApplicationCommandOptionTypes.INTEGER,
                name: "votetime",
                description: "Time the vote is running in seconds",
                required: false,
            }
        ]
    },
    handler: async function(interaction: CommandInteraction) {

        // --- Variables
        let maxLoop = 20;

        const upEmo = "👍";
        const downEmo = "👎";

        let usedVotes = 0;

        let msg = "";

        let reactionAr = new Array(0);

        // --- Variables with input

        let time = interaction.options.getInteger("votetime");


        let timed = interaction.options.getBoolean("istimed");
        timed = (timed == null) ? false : timed;

        let title = interaction.options.getString("name");

        // --- Check for undefined

        time = ((time == undefined || time <= 0) ? 30 : time);

        title = (title == undefined) ? "" : title;

        // --- group variables

        const guid = get("vote_group", "config") as string;
        const maingroup = interaction.guild.roles.cache.get(guid);

        // --- create initial system for time or group voting

        if (timed == true) {
            msg += "This is a timed vote. The vote is running " + time + " Seconds!";
            maxLoop = 1;
        } else {
            // get online member
            const groupmembers = maingroup.members.map(m=>m.user.id);
            usedVotes = Math.round(groupmembers.length/2);
            // further variables set
            usedVotes = ((usedVotes == 0) ? 1 : usedVotes);
            msg += "This is a majority voting. " + usedVotes + " Votes required!";
        }

        // --- MessageEmbed

        const voteAN = new MessageEmbed()
            .setTitle((title == "") ? "Simple Voting ": title)
            .setDescription(msg)
            .setColor("#477ce0")
            .addField("Maximal Runtime", "" + maxLoop * time + " Seconds", true);

        const reply = await interaction.reply({embeds: [voteAN], fetchReply:true}) as Message;


        await reply.react(upEmo);       //react with emote up
        await reply.react(downEmo);     //react with emote down

        const filter = (reaction, user) => { //filter for only getting the up and down emoji
            return user.id != reply.author.id;
        };

        //reaction controller
        const collector = reply.createReactionCollector({filter, dispose: true} as ReactionCollectorOptions);

        //on reaction
        collector.on('collect', (reaction, user) => {
            if (reaction.emoji.name != upEmo && reaction.emoji.name != downEmo) {
                reaction.remove();
            }
            //console.log("collected")
            for (const i of reactionAr) {
                if (i[1] == user.username || reaction.message.member.roles.cache.some((role) => role.name === maingroup.name)) {
                    reaction.users.remove(user);
                    return;
                }
            }
            const pre = ((reaction.emoji.name === upEmo) ? 1 : -1);
            reactionAr.push([pre, user.username]);

            //console.log("saved");
        });

        //on removed reaction
        collector.on('remove', (reaction, user) => {
            const pre = ((reaction.emoji.name === upEmo) ? 1 : -1);
            //push everything to the new array except the matching reaction
            const tempAr = new Array(0);
            for (const i of reactionAr) {
                if (i[0] != pre || i[1] != user.username) {
                    tempAr.push(i);
                }
            }
            reactionAr = tempAr;
        });

        //delay loop
        for (let i = 0; i < maxLoop * time; i++) {
            await delay(1000);
            //counting the votes a user could vote up and down
            //console.log("Test: " + reactionAr.length + ";" + usedVotes + ";" + timed);
            if (reactionAr.length >= usedVotes && timed == false) {
                voteAN.addField("Enough Votes", "Vote ending in " + time + " Seconds");
                await reply.edit({embeds: [voteAN]});
                await delay(time * 1000);
                break;
            }
        }

        //stop the collector
        collector.stop();


        //counting up and down votes and creating the text
        await printVotes(reactionAr, reply, title)
    }
} as ISlashCommand;

//delays a function
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function printVotes(reactionAr, reply, title) {
    let upVotes = "";
    let downVotes = "";

    let up = 0;
    let down = 0;

    for (const i of reactionAr) {
        if (i[0] == -1) {
            downVotes += ("🔴 " + i[1] + "\n");
            down += 1;
        } else {
            upVotes += ("🟢 " + i[1] + "\n");
            up += 1;
        }
    }

    upVotes = (upVotes == "") ? "None" : upVotes;
    downVotes = (downVotes == "") ? "None" : downVotes;

    //remove all reactions

    await reply.reactions.removeAll();

    //finished embed

    const msgEmbed = new MessageEmbed()
        .setColor((down < up) ? "#02B22E" : "#cc0000")
        .setTitle((down < up) ? "Vote accepted" : "Vote failed")
        .addField("For", upVotes, true)
        .addField("Against", downVotes, true)
        .setTimestamp();

    //if a title were specified it will be displayed

    if (title != "") {
        msgEmbed.setDescription(title);
    }

    //show embed
    await reply.edit({embeds:[msgEmbed]})
}