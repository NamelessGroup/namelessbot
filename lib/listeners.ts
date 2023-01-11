import {Client} from "discord.js";
import {IEventListener} from "../types";

import registerSlashCommands from "../listeners/registerSlashCommands";
import chatCommands from "../listeners/chatCommands";
import handleSlashCommands from "../listeners/handleSlashCommands";
import bfSelectionMenu from "../listeners/bfSelectionMenu";
import koeriSelectionMenu from "../listeners/koeriSelectionMenu";
import attendanceTrackerMenu from "../listeners/attendanceTrackerButton";

const LISTENERS: IEventListener[] = [
    chatCommands,
    registerSlashCommands,
    handleSlashCommands,
    bfSelectionMenu,
    koeriSelectionMenu,
    attendanceTrackerMenu
]

/**
 * Adds all event listeners to the supplied client.
 * 
 * @param client Client to add listeners to
 * @param includeElevated If true, elevated listeners will also be added
 */
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

/**
 * Removes all event listeners from the supplied client.
 * 
 * @param client Client to remove listeners from
 * @param includeElevated If true, elevated listeners will also be removed
 */
export function removeListeners(client: Client, includeElevated = false): void {
    for(const l of LISTENERS) {
        if(!l.elevated || includeElevated) {
            client.removeListener(l.event, l.handler);
        }
    }
}
