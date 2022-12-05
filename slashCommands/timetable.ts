import {ISlashCommand} from "../types";
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    APIEmbedField, ActionRow, ActionRowBuilder, ButtonBuilder
} from "discord.js";
import { addBlock, getBlocks, removeBlock, updateBlock, CalendarBlock } from "../lib/attendancetracker";
import { Weekday } from "../lib/recurringtask";

export default {
    command: {
        name: "timetable",
        description: "Manages the timetable of the bot",
        options: [
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "list",
                description: "Lists all the blocks in the timetable.",
                options: [
                    {
                        type: ApplicationCommandOptionType.Integer,
                        name: "weekday",
                        description: "Weekday to look up",
                        required: false,
                        choices: [
                            { name: "Monday", value: Weekday.MONDAY },
                            { name: "Tuesday", value: Weekday.TUESDAY },
                            { name: "Wednesday", value: Weekday.WEDNESDAY },
                            { name: "Thursday", value: Weekday.THURSDAY },
                            { name: "Friday", value: Weekday.FRIDAY }
                        ]
                    }
                ]
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "add",
                description: "Adds a new block to the timetable.",
                options: [
                    {
                        type: ApplicationCommandOptionType.Integer,
                        name: "weekday",
                        description: "Weekday to look up",
                        required: true,
                        choices: [
                            { name: "Monday", value: Weekday.MONDAY },
                            { name: "Tuesday", value: Weekday.TUESDAY },
                            { name: "Wednesday", value: Weekday.WEDNESDAY },
                            { name: "Thursday", value: Weekday.THURSDAY },
                            { name: "Friday", value: Weekday.FRIDAY }
                        ]
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "starttime",
                        description: "Starting time of the block",
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "endtime",
                        description: "Ending time of the block",
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "title",
                        description: "Title of the block",
                        required: true
                    }
                ]
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "remove",
                description: "Removes a block from the timetable.",
                options: [
                    {
                        type: ApplicationCommandOptionType.Integer,
                        name: "index",
                        description: "Index to delete",
                        required: true
                    }
                ]
            },
            {
                type: ApplicationCommandOptionType.Subcommand,
                name: "update",
                description: "Updates a block in the timetable.",
                options: [
                    {
                        type: ApplicationCommandOptionType.Integer,
                        name: "index",
                        description: "Index to update",
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionType.Integer,
                        name: "weekday",
                        description: "Weekday to look up",
                        required: true,
                        choices: [
                            { name: "Monday", value: Weekday.MONDAY },
                            { name: "Tuesday", value: Weekday.TUESDAY },
                            { name: "Wednesday", value: Weekday.WEDNESDAY },
                            { name: "Thursday", value: Weekday.THURSDAY },
                            { name: "Friday", value: Weekday.FRIDAY }
                        ]
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "starttime",
                        description: "Starting time of the block",
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "endtime",
                        description: "Ending time of the block",
                        required: true
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "title",
                        description: "Title of the block",
                        required: true
                    }
                ]
            },
            {
                type: ApplicationCommandOptionType.SubcommandGroup,
                name: "restrict",
                description: "Restrict block to specific users",
                options: [
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "remove",
                        description: "Removes a user from a block",
                        options: [
                            {
                                type: ApplicationCommandOptionType.Integer,
                                name: "index",
                                description: "Index of the block to update",
                                required: true
                            },
                            {
                                type: ApplicationCommandOptionType.User,
                                name: "user",
                                description: "User to remove",
                                required: true
                            }
                        ]
                    },
                    {
                        type: ApplicationCommandOptionType.Subcommand,
                        name: "add",
                        description: "Adds a user from a block",
                        options: [
                            {
                                type: ApplicationCommandOptionType.Integer,
                                name: "index",
                                description: "Index of the block to update",
                                required: true
                            },
                            {
                                type: ApplicationCommandOptionType.User,
                                name: "user",
                                description: "User to add",
                                required: true
                            }
                        ]
                    }
                ]
            }
        ]
    },
    handler: async function(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const options = interaction.options as CommandInteractionOptionResolver;
        if (options.getSubcommandGroup() == "restrict") {
            const index = options.getInteger("index");
            const block = getBlocks()[index];
            const user = options.getUser("user").id;
            if (options.getSubcommand() == "add") {
                if (!block.forUsers.includes(user)) {
                    block.forUsers.push(user);
                    await updateBlock(index, block);
                    await interaction.followUp({ ephemeral: true, content: "User added to block. "});
                } else {
                    await interaction.followUp({ ephemeral: true, content: "User already added to block. "});
                }
            } else if (options.getSubcommand() == "remove") {
                if (block.forUsers.includes(user)) {
                    block.forUsers = block.forUsers.filter(u => { return u != user });
                    await updateBlock(index, block);
                    await interaction.followUp({ ephemeral: true, content: "User removed from block. "});
                } else {
                    await interaction.followUp({ ephemeral: true, content: "User already removed from block. "});
                }
            }
        } else if (options.getSubcommand() == "list") {
            await interaction.followUp({ ephemeral: true, content: JSON.stringify(getBlocks(options.getInteger("weekday"))),
                embeds:[buildTimeTableEmbed(getBlocks(options.getInteger("weekday")), options.getInteger("weekday"))]});
        } else if (options.getSubcommand() == "add") {
            await addBlock({
                weekday: options.getInteger("weekday"),
                startingTime: options.getString("starttime"),
                endingTime: options.getString("endtime"),
                title: options.getString("title"),
                forUsers: []
            });
            await interaction.followUp({ ephemeral: true, content: "Added successful" });
        } else if (options.getSubcommand() == "remove") {
            const result = await removeBlock(options.getInteger("index"));
            if (result) {
                await interaction.followUp({ ephemeral: true, content: "Removed block successfully." });
            } else {
                await interaction.followUp({ ephemeral: true, content: "Error while removing block." });
            }
        } else if (options.getSubcommand() == "update") {
            const result = await updateBlock(options.getInteger("index"), {
                weekday: options.getInteger("weekday"),
                startingTime: options.getString("starttime"),
                endingTime: options.getString("endtime"),
                title: options.getString("title"),
                forUsers: []
            });
            if (result) {
                await interaction.followUp({ ephemeral: true, content: "Updated block successfully." });
            } else {
                await interaction.followUp({ ephemeral: true, content: "Error while updating block." });
            }
        }
    }
} as ISlashCommand


function buildTimeTableEmbed(blocks: CalendarBlock[], weekday?: number) : EmbedBuilder {
    const embed = new EmbedBuilder();

    embed.setTitle("Stundenplan" + (weekday != undefined ? " für " + dayFromInt(weekday):""));

    if (weekday == undefined) {
        for (let i = 0; i < 5; i++) {
            embed.addFields(buildDayField(blocks, i))
        }
    } else {
        embed.addFields(buildDayField(blocks, weekday));
    }

    return embed;
}

function buildAttendanceAction(blocks: CalendarBlock[], weekday: number) : ActionRowBuilder[] {
    let dayBlocks = getDaysBlocks(blocks, weekday);
    let blockCount = dayBlocks.length;
    let curCount = 0;
    let builders = []
    for (let i = 0; i < Math.ceil(blockCount / 5.0); i++) {
        let builder = new ActionRowBuilder();
        for (let j = blockCount; blockCount < Math.min(5, blockCount-curCount); j++) {
            // TODO: System für IDS
            builder.addComponents(new ButtonBuilder().setCustomId("TODO").setLabel(blocks[i*5+j].title));
        }
        builders.push(builder);
        curCount += 5;
    }
    return builders;
}

function buildDayField(blocks: CalendarBlock[], weekday: number) : APIEmbedField {
    let value = getDaysBlocks(blocks, weekday).map(
        e => {return e.startingTime + " - " + e.endingTime + ": " + e.title + "\n";}
    ).reduce(
        (p,c,i,a) => {
            if (c != "") {
                return p + "\n" + c;
            }
            return p
        }
    )
    console.log(value);
    return {
        name: dayFromInt(weekday),
        value: value != "" ? value : "\u200b",
        inline: true
    } as APIEmbedField;
}

function getDaysBlocks(blocks: CalendarBlock[], weekday: number) : CalendarBlock[] {
    return blocks.filter((e,i,a) => {
        return e.weekday == weekday;
    });
}

function dayFromInt(weekday: number) : string {
    return ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"][weekday];
}