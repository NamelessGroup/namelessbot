import chatCommands from "../listeners/chatCommands";
import {Client} from "discord.js";
import {IEventListener} from "../types";

const LISTENERS: IEventListener[] = [
    chatCommands
]

export function addListeners(client: Client, includeElevated: boolean = false): void {
    for(const l of LISTENERS) {
        if(!l.elevated || includeElevated) {
            client.on(l.event, l.handler);
        }
    }
}

export function removeListeners(client: Client, includeElevated: boolean = false): void {
    for(const l of LISTENERS) {
        if(!l.elevated || includeElevated) {
            client.removeListener(l.event, l.handler);
        }
    }
}