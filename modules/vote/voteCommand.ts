import {
    type Message,
    EmbedBuilder,
    ApplicationCommandOptionType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ButtonInteraction,
    type InteractionCollector,
    type GuildMemberRoleManager,
    type BaseMessageOptions,
    type CollectedInteraction,
    type Role,
    type GuildMember,
    type Snowflake,
    type Interaction,
    type ChatInputCommandInteraction,
} from "discord.js";
import type { ISlashCommand } from "../../types";
import { ConfigurationFile, get } from "../../lib/configmanager";

const upEmo = "👍";
const downEmo = "👎";
/**
 * Slash Command definition for /vote.
 */
export default {
    command: {
        name: "vote",
        description: "Starts a voting.",
        options: [
            {
                type: ApplicationCommandOptionType.String,
                name: "name",
                description: "Give this vote a reason",
                required: true,
            },
            {
                type: ApplicationCommandOptionType.Integer,
                name: "votetime",
                description: "Time the vote is running in seconds.",
                required: false,
                minValue: 0,
            },
            {
                type: ApplicationCommandOptionType.Role,
                name: "votegroup",
                description:
                    "The Group that is allowed to vote (You can only start a vote for a group you are a member of)",
                required: false,
                minValue: 0,
            },
        ],
    },
    handler: async function (interaction: ChatInputCommandInteraction) {
        try {
            await interaction.channel.fetch();
        } catch {
            await interaction.reply(
                "Not in this channel! Move to a channel the bot has access to.",
            );
            return;
        }
        // --- Variables
        let usedVotes = 0;
        let msg = "";

        // --- Variables with input
        const options = interaction.options;
        const time = options.getInteger("votetime", false);
        const timed = time != null;
        const title = options.getString("name", true);
        let maingroup = options.getRole("votegroup", false) as Role;
        if (maingroup == null) {
            const guid = get("vote_group", ConfigurationFile.GENERAL);
            maingroup =
                JSON.stringify(guid) === "{}" || guid === ""
                    ? interaction.guild.roles.everyone
                    : interaction.guild.roles.cache.get(guid);
        }

        if (membercantstartvote(interaction.member as GuildMember, maingroup)) {
            await interaction.reply({
                content:
                    "You need to have the group, you want to start a vote for!",
                ephemeral: true,
            });
            return;
        }

        // --- create initial system for time or group voting

        if (timed) {
            msg +=
                "This is a timed vote. The vote is running " +
                time +
                " Seconds!\n";
            msg +=
                "This vote ends <t:" +
                Math.ceil(Date.now() / 1000 + time) +
                ":R> \n";
        } else {
            // get online member
            await maingroup.guild.members.fetch();
            const groupmembers = maingroup.members.map((m) => m.user.id);
            usedVotes = Math.ceil(groupmembers.length / 2);
            // further variables set
            usedVotes = usedVotes === 0 ? 1 : usedVotes;
            msg +=
                "This is a majority voting. " +
                usedVotes +
                " Votes are required for one of the sides!";
        }

        const embed = getEmbedOptions(title, msg, maingroup.id);
        const response = await interaction.reply({
            embeds: embed.embeds,
            components: embed.components,
            withResponse: true,
        });
        const reply = response.resource.message;

        const filter = (interaction: Interaction): boolean => {
            if (!interaction.isButton()) {
                return false;
            }
            return interaction.message.id === reply.id;
        };

        //reaction controller
        const collector = reply.createMessageComponentCollector({
            filter,
        }) as InteractionCollector<CollectedInteraction>;
        const pro = new Set<string>();
        const con = new Set<string>();

        //on reaction
        collector.on("collect", (interaction: ButtonInteraction) => {
            const id = interaction.user.id;
            const roles = interaction.member.roles as GuildMemberRoleManager;
            if (!roles.cache.some((role) => role.id === maingroup.id)) {
                void interaction.reply({
                    content:
                        "You are not allowed to vote. Please contact an Administrator!",
                    ephemeral: true,
                });
                return;
            }
            if (interaction.customId === "vote_up") {
                pro.add(id);
                if (con.has(id)) {
                    con.delete(id);
                    void interaction.reply({
                        content: "You now support the voting!",
                        ephemeral: true,
                    });
                    return;
                }
                void interaction.reply({
                    content: "Voting successful. You support the voting!",
                    ephemeral: true,
                });
            } else if (interaction.customId === "vote_down") {
                con.add(id);
                if (pro.has(id)) {
                    pro.delete(id);
                    void interaction.reply({
                        content: "You are now against the voting!",
                        ephemeral: true,
                    });
                    return;
                }
                void interaction.reply({
                    content: "Voting successful. You are against the topic!",
                    ephemeral: true,
                });
            }
            if (!timed && (pro.size === usedVotes || con.size === usedVotes)) {
                void reply.edit(
                    getEmbedOptions(
                        title,
                        msg,
                        maingroup.id,
                        Math.ceil(Date.now() / 1000 + 30),
                    ),
                );
                setTimeout(() => {
                    void printVotes(pro, con, reply, title, collector);
                }, 30000);
            }
        });

        if (timed) {
            setTimeout(() => {
                void printVotes(pro, con, reply, title, collector);
            }, 1000 * time);
        }
    },
} as ISlashCommand;

/**
 * Prints a Message on a vote end by editing the vote message. The Message contains the voters for and against the Subject.
 * Also stops the collector.
 *
 * @param pro the pro votes
 * @param con the con votes
 * @param reply the message that will be edited
 * @param title the title of the vote
 * @param collector the collector related to the vote, that will be closed
 */
async function printVotes(
    pro: Set<string>,
    con: Set<string>,
    reply: Message,
    title: string,
    collector: InteractionCollector<CollectedInteraction>,
): Promise<void> {
    collector.stop();

    let upVotes = Array.from(pro)
        .map((e) => {
            return "🟢 <@" + e + ">";
        })
        .join("\n");
    let downVotes = Array.from(con)
        .map((e) => {
            return "🔴 <@" + e + ">";
        })
        .join("\n");

    upVotes = upVotes === "" ? "None" : upVotes;
    downVotes = downVotes === "" ? "None" : downVotes;

    //finished embed
    const msgEmbed = new EmbedBuilder()
        .setColor(con.size < pro.size ? "#02B22E" : "#cc0000")
        .setTitle(con.size < pro.size ? "Vote accepted" : "Vote failed")
        .addFields(
            { name: "For", value: upVotes, inline: true },
            { name: "Against", value: downVotes, inline: false },
        )
        .setTimestamp();

    //if a title were specified it will be displayed
    if (title !== "") {
        msgEmbed.setDescription(title);
    }
    //show embed
    await reply.edit({ embeds: [msgEmbed], components: [] });
}

/**
 * This method determine if a member can start a vote. (He has to have the roll he wants to start a vote for)
 *
 * @param member the member that starts a vote
 * @param selectedRole the role he wants to start a vote for
 * @returns True if the member cant start a vote False if he can
 */
function membercantstartvote(member: GuildMember, selectedRole: Role): boolean {
    const roles = member.roles;
    return !roles.cache.has(selectedRole.id);
}

/**
 * Generates the Embed that will be printed for the vote. It tags the group that can vote and additionally can add a relative timestamp.
 *
 * @param title the title of the subject
 * @param msg a Message as Description
 * @param group the group (as Snowflake) that can vote
 * @param timestamp the timestamp of the time on that the vote ends
 * @returns the Embed and the Components (Buttons)
 */
function getEmbedOptions(
    title: string,
    msg: string,
    group: Snowflake,
    timestamp?: number,
): BaseMessageOptions {
    const voteEmbed = new EmbedBuilder()
        .setTitle(title === "" ? "Simple Voting " : title)
        .setDescription(msg)
        .setColor("#477ce0")
        .addFields({
            name: "Allowed Groups",
            value: "Voting for Group <@&" + group + ">",
        });

    if (timestamp != null) {
        voteEmbed.addFields({
            name: "Vote is ending",
            value: "This vote ends <t:" + timestamp + ":R> \n",
        });
    }

    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setEmoji(upEmo)
            .setStyle(ButtonStyle.Success)
            .setCustomId("vote_up"),
        new ButtonBuilder()
            .setEmoji(downEmo)
            .setStyle(ButtonStyle.Danger)
            .setCustomId("vote_down"),
    );

    return { embeds: [voteEmbed], components: [actionRow] };
}
