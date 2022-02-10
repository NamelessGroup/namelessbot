import {Client} from "discord.js";
import {IEventListener} from "../types";

import registerSlashCommands from "../listeners/registerSlashCommands";
import chatCommands from "../listeners/chatCommands";
import handleSlashCommands from "../listeners/handleSlashCommands";
import handleSelectionMenu from "../listeners/handleSelectionMenu";

const LISTENERS: IEventListener[] = [
    chatCommands,
    registerSlashCommands,
    handleSlashCommands,
    handleSelectionMenu
]

export function addListeners(client: Client, includeElevated = false): void {
    for(const l of LISTENERS) {
        if(!l.elevated || includeElevated) {
            if(l.once) {
                client.once(l.event, l.handler);
            } else {
                client.on(l.event, l.handler);
            }
        }
    }
}

export function removeListeners(client: Client, includeElevated = false): void {
    for(const l of LISTENERS) {
        if(!l.elevated || includeElevated) {
            client.removeListener(l.event, l.handler);
        }
    }
}
