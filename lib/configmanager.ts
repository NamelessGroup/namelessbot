import { lstat, mkdir, readFile, writeFile } from "node:fs/promises";
import type { CalendarBlock } from "../modules/attendancetracker/attendanceTracker";
import type { IKoeriList } from "../modules/koeri/koeriCommand";

export enum ConfigurationFile {
    AOC = "aoc",
    ATTENDANCE = "attendance",
    GENERAL = "config",
    KOERI = "koeri",
    TIMETABLE = "timetable",
}

const defaultConfigs = {
    [ConfigurationFile.AOC]: { id: 0 },
    [ConfigurationFile.ATTENDANCE]: {} as Record<
        string,
        Record<string, boolean>
    >,
    [ConfigurationFile.GENERAL]: {
        announcement_channel: "",
        default_guild: "",
        vote_group: "",
    },
    [ConfigurationFile.KOERI]: {} as Record<string, IKoeriList>,
    [ConfigurationFile.TIMETABLE]: {
        blocks: [] as CalendarBlock[],
    },
} as const;

type DefaultConfigs = typeof defaultConfigs;
type ConfigKey<F extends ConfigurationFile> = keyof DefaultConfigs[F];

const configs: Map<ConfigurationFile, unknown> = new Map();

/**
 * Recreates non-existant template configs into '/config'
 */
async function recreateNonexistantConfigs(): Promise<void> {
    try {
        await mkdir("config");
    } catch {
        // This is fine (directory already exists)
    }

    let count = 0;

    for (const key of Object.values(ConfigurationFile)) {
        const fileName = `${key}.json`;
        try {
            await lstat(`config/${fileName}`);
        } catch {
            await writeConfigFile(fileName, defaultConfigs[key]);
            count++;
        }
    }
    if (count > 0) console.log(`Recreated ${count} config files.`);
}

/**
 * Reads all configs in '/config' into memory.
 * If a config is defined in this file, but not present in '/config',
 * the template will be written to disk.
 */
export async function readConfig(): Promise<void> {
    await recreateNonexistantConfigs();

    for (const key of Object.values(ConfigurationFile)) {
        const fileName = `${key}.json`;
        try {
            configs[key] = await readConfigFile(fileName);
        } catch (e) {
            console.error(`Error while reading config file ${fileName}: `);
            console.error(e);
        }
    }
}

/**
 * Write all in-memory-configs to disk.
 */
export async function writeConfig(): Promise<void> {
    for (const cfg in configs) {
        await writeConfigFile(cfg + ".json", configs[cfg]);
    }
}

/**
 * Reads a file from the config directory and returns it's contents.
 *
 * @param path Path to the file
 * @returns File contents
 */
export async function readConfigFile(path: string): Promise<unknown> {
    return JSON.parse(await readFile("config/" + path, "utf-8"));
}

/**
 * Writes a config file to disk.
 *
 * @param path Path to config file
 * @param content File contents
 */
export async function writeConfigFile(
    path: string,
    content: unknown,
): Promise<void> {
    await writeFile(
        "config/" + path,
        JSON.stringify(content, null, 4),
        "utf-8",
    );
}

/**
 * Gets a key from a config.
 * The key is tried to be read from the supplied config.
 * If the config doesn't exist in-memory, a ReferenceError will be thrown.
 * If the key doesn't exist, undefined will be returned.
 *
 * @param key Key to look up
 * @param config Config to look up
 * @throws {ReferenceError} Config doesn't exist
 * @returns Value at key in supplied config, or undefined
 */
export function get<F extends ConfigurationFile, K extends ConfigKey<F>>(
    key: K,
    config: F,
): DefaultConfigs[F][K] {
    if (!configs.has(config))
        throw new ReferenceError(`Config ${config} doesn't exist`);
    if (configs.get(config)[key] == null) return undefined;
    return JSON.parse(
        JSON.stringify(configs.get(config)[key]) || "{}",
    ) as DefaultConfigs[F][K];
}

/**
 * Writes a key to the supplied config.
 * If the supplied config doesn't exist, a ReferenceError will be thrown.
 * All configs will afterwards be written to disk.
 *
 * @param key Key to write to
 * @param config Config to write to
 * @param value Value to write
 * @throws {ReferenceError} Config doesn't exist
 */
export async function write<
    F extends ConfigurationFile,
    K extends ConfigKey<F>,
>(key: K, config: F, value: DefaultConfigs[F][K]): Promise<void> {
    if (!configs.has(config))
        throw new ReferenceError(`Config ${config} doesn't exist`);
    configs.get(config)[key] = value;
    await writeConfig();
}
