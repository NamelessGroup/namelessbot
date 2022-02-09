import reminder from "../tasks/reminder";
import {RecurringTask, Weekday} from "./recurringtask";


export const TASKS = [
    new RecurringTask(Weekday.TUESDAY, 21, 47, reminder, ["MOAR ARGUMENTS"])
]
