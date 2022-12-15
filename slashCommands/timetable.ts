import {ISlashCommand} from "../types";
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    APIEmbedField, ActionRow, ActionRowBuilder, ButtonBuilder, AnyAPIActionRowComponent, ActionRowComponent, APIActionRowComponent, APIMessageActionRowComponent, ButtonStyle
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
                name: "test",
                description: "for testing"
            },
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
            await interaction.followUp({ ephemeral: true,
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
        } else if (options.getSubcommand() == "test") {
            let blocks = getBlocks(0, true);
            await interaction.followUp({ephemeral: true, embeds: [buildTimeTableEmbed(blocks, 0)],
                components: buildAttendanceAction(blocks)});
        }
    }
} as ISlashCommand


function buildTimeTableEmbed(blocks: CalendarBlock[], weekday?: number) : EmbedBuilder {
    const embed = new EmbedBuilder();

    embed.setTitle("Stundenplan" + (weekday != undefined ? " für " + dayFromInt(weekday):""));

    if (weekday == undefined) {
        for (let i = 0; i < 5; i++) {
            embed.addFields(buildDayField(getDaysBlocks(blocks, i), i))
        }
    } else {
        embed.addFields(buildDayField(blocks, weekday));
    }

    return embed;
}

function buildAttendanceAction(blocks: CalendarBlock[]) : ActionRowBuilder<ButtonBuilder>[] {
    let blockCount = blocks.length;
    let curCount = 0;
    let builders = []
    for (let i = 0; i < Math.ceil(blockCount / 5.0); i++) {
        let builder = new ActionRowBuilder<ButtonBuilder>();
        for (let j = 0; j < Math.min(5, blockCount-curCount); j++) {
            // TODO: System für IDS

            /*
             * Update: id = "attendancetracker-${blockName.toLowerCase().replaceAll(" ", "-")}" ?
             * Wir brauchen nur irgendeine ID, um einen einzelnen Block zu identifizieren, title lowercase & mit _ statt " " vor
             * Außerdem: getBlocks() filtert jetzt wieder richtig, deswegen ist getDayBlocks() u.U nicht mehr notwendig
             */
            builder.addComponents(
                new ButtonBuilder()
                    .setLabel(blocks[i*5+j].title)
                    .setCustomId("attendancetracker-"+blocks[i*5+j].title.toLowerCase().replace(" ", "-"))
                    .setStyle(ButtonStyle.Primary)
            );
        }
        builders.push(builder);
        curCount += 5;
    }
    return builders;
}

function buildDayField(blocks: CalendarBlock[], weekday: number) : APIEmbedField {
    let value = blocks.map(
        e => {
            const top = e.startingTime + " - " + e.endingTime + ": " + e.title + "\n";
            if (e.attendance == undefined) {
                return top;
            } else {
                return top + e.attendance;
            }
    }).reduce(
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