import {
    CommandInteraction,
    Message,
    EmbedBuilder,
    ApplicationCommandOptionType,
    CommandInteractionOptionResolver,
    ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction, InteractionCollector, GuildMemberRoleManager, BaseMessageOptions, CollectedInteraction
} from "discord.js";
import {ISlashCommand} from "../types";
import {get} from "../lib/configmanager";

const upEmo = "👍";
const downEmo = "👎";

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
            msg += "This is a timed vote. The vote is running " + time + " Seconds!\n";
            msg += "This vote ends <t:" + Math.ceil(Date.now()/1000 + time) + ":R> \n"
        } else {
            // get online member
            const groupmembers = maingroup.members.map(m=>m.user.id);
            usedVotes = Math.ceil(groupmembers.length/2);
            // further variables set
            usedVotes = ((usedVotes == 0) ? 1 : usedVotes);
            msg += "This is a majority voting. " + usedVotes + " Votes required!";
        }

        const embed = getEmbedOptions(title, msg);
        const reply = await interaction.reply({ embeds: embed.embeds, components: embed.components, fetchReply: true }) as Message;

        // eslint-disable-next-line
        const filter = (interaction) => {
            if (!interaction.isButton()) {
                return false;
            }
            return interaction.message.id === reply.id;
        };

        //reaction controller
        const collector = reply.createMessageComponentCollector({filter}) as InteractionCollector<CollectedInteraction>;
        const pro = new Set<string>();
        const con = new Set<string>();

        //on reaction
        collector.on('collect', (interaction: ButtonInteraction) => {
            const id = interaction.user.id;
            const roles = interaction.member.roles as GuildMemberRoleManager;
            if (roles.cache.some((role) => role.name !== maingroup.name)) {
                interaction.reply({content:"You are not allowed to vote. Please contact an Administrator!", ephemeral:true});
                return;
            }
            if (interaction.customId == "vote_up") {
                pro.add(id);
                if (con.has(id)) {
                    con.delete(id);
                    interaction.reply({content:"You now support the voting!", ephemeral:true})
                    return;
                }
                interaction.reply({content:"Voting successful. You support the voting!", ephemeral:true})
            } else if (interaction.customId == "vote_down") {
                con.add(id);
                if (pro.has(id)) {
                    pro.delete(id);
                    interaction.reply({content:"You are now against the voting!", ephemeral:true});
                    return;
                }
                interaction.reply({content:"Voting successful. You are against the topic!", ephemeral:true})
            }
            if (!timed && pro.size + con.size == usedVotes) {
                reply.edit(getEmbedOptions(title, msg, Math.ceil(Date.now()/1000 + 30)))
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


async function printVotes(pro: Set<string>, con: Set<string>, reply: Message, title: string, collector: InteractionCollector<CollectedInteraction>): Promise<void> {
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

function getEmbedOptions(title:string, msg: string, timestamp?:number): BaseMessageOptions {
    const voteEmbed = new EmbedBuilder()
        .setTitle((title == "") ? "Simple Voting ": title)
        .setDescription(msg)
        .setColor("#477ce0");

    if (timestamp != undefined) {
        voteEmbed.addFields({name: "Vote is ending", value: "This vote ends <t:" + timestamp + ":R> \n"});
    }

    const actionRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder().setEmoji(upEmo).setStyle(ButtonStyle.Success).setCustomId("vote_up"),
            new ButtonBuilder().setEmoji(downEmo).setStyle(ButtonStyle.Danger).setCustomId("vote_down")
        );


    return {embeds: [voteEmbed], components:[actionRow]};
}