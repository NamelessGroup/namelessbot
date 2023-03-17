import {ISlashCommand} from "../../types";
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    CommandInteractionOptionResolver
} from "discord.js";
import { addBlock, getBlocks, removeBlock, updateBlock } from "./attendanceTracker";
import { Weekday } from "../../lib/recurringtask";
import {buildResultEmbed, buildTimeTableEmbed} from "./attendanceTrackerVisuals";
import {DateTime} from "luxon";

/**
 * Slash command definition for /timetable
 */
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
                    }, {
                        type: ApplicationCommandOptionType.Boolean,
                        name: "includeindex",
                        description: "Including the index in the block list",
                        required: false
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
                type:ApplicationCommandOptionType.Subcommand,
                name: "tracked",
                description: "Displays the tracked attendace",
                options: [
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "filter",
                        description: "RegEx filter for names of Events",
                        required: false
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "start",
                        description: "first date to look for",
                        required: false
                    },
                    {
                        type: ApplicationCommandOptionType.String,
                        name: "end",
                        description: "last date to look for",
                        required: false
                    }
                ]
            }
        ]
    },
    /**
     * Handler for the /timetable command
     *
     * @param interaction Interaction of the command
     */
    handler: async function(interaction: CommandInteraction) {
        const options = interaction.options as CommandInteractionOptionResolver;
        if (options.getSubcommand() == "list") {
            await interaction.deferReply({ ephemeral: true });
            await interaction.followUp({ ephemeral: true,
                                         embeds:[buildTimeTableEmbed(getBlocks(options.getInteger("weekday"), false, options.getBoolean("includeindex")),
                                             options.getInteger("weekday"))]});
        } else if (options.getSubcommand() == "add") {
            await interaction.deferReply({ ephemeral: true });
            const result = await addBlock({
                weekday: options.getInteger("weekday"),
                startingTime: options.getString("starttime"),
                endingTime: options.getString("endtime"),
                title: options.getString("title")
            });
            if (result) {
                await interaction.followUp({ ephemeral: true, content: "Added successful" });
            } else {
                await interaction.followUp({ ephemeral: true, content: "Couldn't add block. Make sure the times are formatted as hh:mm."});
            }
        } else if (options.getSubcommand() == "remove") {
            await interaction.deferReply({ ephemeral: true });
            const result = await removeBlock(options.getInteger("index"));
            if (result) {
                await interaction.followUp({ ephemeral: true, content: "Removed block successfully. Be aware that block indexes might have shifted now." });
            } else {
                await interaction.followUp({ ephemeral: true, content: "Error while removing block." });
            }
        } else if (options.getSubcommand() == "update") {
            await interaction.deferReply({ ephemeral: true });
            const result = await updateBlock(options.getInteger("index"), {
                weekday: options.getInteger("weekday"),
                startingTime: options.getString("starttime"),
                endingTime: options.getString("endtime"),
                title: options.getString("title")
            });
            if (result) {
                await interaction.followUp({ ephemeral: true, content: "Updated block successfully." });
            } else {
                await interaction.followUp({ ephemeral: true, content: "Error while updating block. Make sure the times are formatted as hh:mm." });
            }
        } else if (options.getSubcommand() == "tracked") {
            await interaction.deferReply({ ephemeral: false });
            const start = options.getString("start") ? DateTime.fromFormat(options.getString("start"), "dd.mm.yyyy") : undefined;
            const end = options.getString("end") ? DateTime.fromFormat(options.getString("end"), "dd.mm.yyyy") : undefined;
            await interaction.reply( {
                embeds: [ buildResultEmbed([], options.getString("filter"), start, end) ],
                ephemeral: false
            });
        }
    }
} as ISlashCommand;