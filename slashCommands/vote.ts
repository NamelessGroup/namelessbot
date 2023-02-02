import {
    CommandInteraction,
    Message,
    EmbedBuilder,
    ApplicationCommandOptionType,
    CommandInteractionOptionResolver,
    ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, InteractionCollector
} from "discord.js";
import {ISlashCommand} from "../types";
import {get} from "../lib/configmanager";


export default {
    command: {
        name: "vote",
        description: "Starts a voting.",
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "name",
                description: "Give this vote a reason",
                required: true
            },
            {
                type: ApplicationCommandOptionType.Integer,
                name: "votetime",
                description: "Time the vote is running in seconds.",
                required: false,
                minValue: 0
            }
        ]
    },
    handler: async function(interaction: CommandInteraction) {

        // --- Variables

        const upEmo = "👍";
        const downEmo = "👎";

        let usedVotes = 0;
        let msg = "";


        // --- Variables with input
        const options = interaction.options as CommandInteractionOptionResolver;
        const time = options.getInteger("votetime", false);
        const timed = time != undefined;
        const title = options.getString("name", true);


        const guid = get("vote_group", "config") as string;
        const maingroup = interaction.guild.roles.cache.get(guid);

        // --- create initial system for time or group voting

        if (timed) {
            msg += "This is a timed vote. The vote is running " + time + " Seconds!";
        } else {
            // get online member
            const groupmembers = maingroup.members.map(m=>m.user.id);
            usedVotes = Math.ceil(groupmembers.length/2);
            // further variables set
            usedVotes = ((usedVotes == 0) ? 1 : usedVotes);
            msg += "This is a majority voting. " + usedVotes + " Votes required!";
        }


        const voteEmbed = new EmbedBuilder()
            .setTitle((title == "") ? "Simple Voting ": title)
            .setDescription(msg)
            .setColor("#477ce0")
        if (timed) {
            voteEmbed.addFields({name: "Maximal Runtime", value: "" + time + " Seconds", inline: true});
        }


        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder().setEmoji(upEmo).setStyle(ButtonStyle.Success).setCustomId("vote_up"),
                new ButtonBuilder().setEmoji(downEmo).setStyle(ButtonStyle.Danger).setCustomId("vote_down")
            );

        const reply = await interaction.reply({embeds: [voteEmbed], components:[actionRow],  fetchReply:true}) as Message;


        // eslint-disable-next-line
        const filter = (interaction) => {
            if (!interaction.isButton()) {
                return false;
            }
            return interaction.message.id === reply.id;
        };

        //reaction controller
        const collector = reply.createMessageComponentCollector({filter});

        const pro = new Set<string>();
        const con = new Set<string>();

        //on reaction
        collector.on('collect', (interaction: ButtonInteraction) => {
            const id = interaction.user.id;
            if (interaction.customId == "vote_up") {
                pro.add(id)
                if (con.has(id)) {
                    con.delete(id);
                    interaction.reply({content:"You now support the voting!", ephemeral:true})
                    return;
                }
                interaction.reply({content:"Voting successful. You support the voting!", ephemeral:true})
            } else if (interaction.customId == "vote_down") {
                con.add(id)
                if (pro.has(id)) {
                    pro.delete(id);
                    interaction.reply({content:"You are now against the voting!", ephemeral:true})
                    return;
                }
                interaction.reply({content:"Voting successful. You are against the topic!", ephemeral:true})
            }
            if (!timed && pro.size + con.size == usedVotes) {
                setTimeout(() => {
                    printVotes(pro, con, reply, title, collector);
                }, 30000 );
            }
        });

        if (timed) {
            setTimeout(() => {
                printVotes(pro, con, reply, title, collector);
            }, 1000*time);
        }

    }
} as ISlashCommand;


async function printVotes(pro: Set<string>, con: Set<string>, reply: Message, title: string, collector: InteractionCollector<any>) {
    collector.stop();


    let upVotes = Array.from(pro).map(e => {
        return "🟢 <@" + e + ">";
    }).join("\n");
    let downVotes = Array.from(con).map(e => {
        return "🔴 <@" + e + ">";
    }).join("\n");



    upVotes = (upVotes == "") ? "None" : upVotes;
    downVotes = (downVotes == "") ? "None" : downVotes;

    //finished embed

    const msgEmbed = new EmbedBuilder()
        .setColor((con.size < pro.size) ? "#02B22E" : "#cc0000")
        .setTitle((con.size < pro.size) ? "Vote accepted" : "Vote failed")
        .addFields({name: "For", value: upVotes, inline: true}, {name: "Against", value: downVotes, inline: false})
        .setTimestamp();

    //if a title were specified it will be displayed

    if (title != "") {
        msgEmbed.setDescription(title);
    }

    //show embed
    await reply.edit({embeds:[msgEmbed]})
}
