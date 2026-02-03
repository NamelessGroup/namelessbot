import { expect, test, vi } from "vitest";
import { DateTime } from "luxon";
import { RecurringTask, Weekday } from "../lib/tasks/recurringtask";

const globalTask = vi.hoisted(() => {
    const func = vi.fn();
    return {
        func,
    };
});

vi.mock(import("../lib/registry"), () => {
    return {
        TASKS: [new RecurringTask(Weekday.WEDNESDAY, 6, 18, globalTask.func)],
    };
});

import { startRecurringTaskLoop } from "../lib/tasks/taskRunner";

test("RecurringTask::shouldRunAtTime", () => {
    const func = vi.fn();
    const task = new RecurringTask(Weekday.WEDNESDAY, 6, 18, func);

    expect(
        task.shouldRunAtTime(
            DateTime.fromObject({
                year: 2026,
                month: 2,
                day: 4,
                hour: 6,
                minute: 18,
            }),
        ),
    ).toBe(true);
    expect(
        task.shouldRunAtTime(
            DateTime.fromObject({
                year: 2026,
                month: 2,
                day: 4,
                hour: 6,
                minute: 19,
            }),
        ),
    ).toBe(false);
    expect(
        task.shouldRunAtTime(
            DateTime.fromObject({
                year: 2026,
                month: 2,
                day: 4,
                hour: 7,
                minute: 18,
            }),
        ),
    ).toBe(false);
    expect(
        task.shouldRunAtTime(
            DateTime.fromObject({
                year: 2026,
                month: 2,
                day: 5,
                hour: 6,
                minute: 18,
            }),
        ),
    ).toBe(false);
});

test("TaskRunner", () => {
    vi.useFakeTimers();
    vi.setSystemTime(
        DateTime.fromObject({
            year: 2026,
            month: 2,
            day: 4,
            hour: 6,
            minute: 17,
        }).toJSDate(),
    );

    startRecurringTaskLoop(null);
    vi.runOnlyPendingTimers();
    expect(globalTask.func).toBeCalledTimes(1);
});
