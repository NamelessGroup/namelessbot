import {ISlashCommand} from "../types";
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    CommandInteractionOptionResolver
} from "discord.js";
import { addBlock, getBlocks, removeBlock, updateBlock } from "../lib/attendancetracker";
import { Weekday } from "../lib/recurringtask";
import {buildTimeTableEmbed, buildAttendanceAction} from "../lib/attendancetrackerVisuals"

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
        const options = interaction.options as CommandInteractionOptionResolver;
        if (options.getSubcommandGroup() == "restrict") {
            await interaction.deferReply({ ephemeral: true });
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
                await interaction.deferReply({ ephemeral: true });
                if (block.forUsers.includes(user)) {
                    block.forUsers = block.forUsers.filter(u => { return u != user });
                    await updateBlock(index, block);
                    await interaction.followUp({ ephemeral: true, content: "User removed from block. "});
                } else {
                    await interaction.followUp({ ephemeral: true, content: "User already removed from block. "});
                }
            }
        } else if (options.getSubcommand() == "list") {
            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ ephemeral: true,
                                         embeds:[buildTimeTableEmbed(getBlocks(options.getInteger("weekday")),
                                             options.getInteger("weekday"))]});
        } else if (options.getSubcommand() == "add") {
            await interaction.deferReply({ ephemeral: true });
            await addBlock({
                weekday: options.getInteger("weekday"),
                startingTime: options.getString("starttime"),
                endingTime: options.getString("endtime"),
                title: options.getString("title"),
                forUsers: []
            });
            await interaction.followUp({ ephemeral: true, content: "Added successful" });
        } else if (options.getSubcommand() == "remove") {
            await interaction.deferReply({ ephemeral: true });
            const result = await removeBlock(options.getInteger("index"));
            if (result) {
                await interaction.followUp({ ephemeral: true, content: "Removed block successfully." });
            } else {
                await interaction.followUp({ ephemeral: true, content: "Error while removing block." });
            }
        } else if (options.getSubcommand() == "update") {
            await interaction.deferReply({ ephemeral: true });
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
            await interaction.deferReply({ ephemeral: false });
            /*
             * Temporary testing command
             * TODO: remove before merge
             */
            const blocks = getBlocks(0, true);
            await interaction.followUp({ephemeral: false, embeds: [buildTimeTableEmbed(blocks, 0)],
                                        components: buildAttendanceAction(blocks)});
        }
    }
} as ISlashCommand