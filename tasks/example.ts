/* eslint-disable */
import {Client} from "discord.js";
import {TaskExecutor} from "../types";

export default ((client: Client) => {
    /*
     * Task code goes here
     * the discord js client will be delivered by default, more arguments can be supplied
     * This task needs to be registered in 'lib/tasks.ts'
     */
}) as TaskExecutor
