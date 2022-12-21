import {readdir, lstat, readFile, writeFile, copyFile} from "fs/promises";
import {ConfigList} from "../types";
import {parse} from 'path';

const configs: ConfigList = {};

/**
 * Copies the non-existant template configs into '/config'
 */
async function _copyNonexistantConfigs(): Promise<void> {
    let count = 0;
    for(const f of await readdir("config/templates")) {
        if((await lstat(`config/templates/${f}`)).isFile()) {
            try {
                await lstat(`config/${f}`);
            } catch {
                await copyFile(`config/templates/${f}`, `config/${f}`);
                count++;
            }
        }
    }
    if(count > 0) console.log(`Recreated ${count} config files.`);
}

/**
 * Reads all configs in '/config' into memory.
 * If a config is present in '/config/templates' but not in '/config',
 * the template will be copied over.
 */
export async function readConfig(): Promise<void> {
    const configsToLoad: string[] = [];
    await _copyNonexistantConfigs();
    for(const f of await readdir("config")) {
        if((await lstat("config/" + f)).isFile()) {
            configsToLoad.push(f);
        }
    }

    for(const cfg of configsToLoad) {
        const configName = parse(cfg).name;
        try {
            configs[configName] = JSON.parse(await readConfigFile(cfg));
        } catch(e) {
            console.log("Error while reading config file: ");
            console.log(e);
        }
    }
}

/**
 * Write all in-memory-configs to disk.
 */
export async function writeConfig(): Promise<void> {
    for(const cfg in configs) {
        await writeConfigFile(cfg + ".json", JSON.stringify(configs[cfg]));
    }
}

/**
 * Reads a file from the config directory using 'utf8' and returning its contents as a string.
 * 
 * @param path Path to the file
 * @returns File contents
 */
export async function readConfigFile(path: string): Promise<string> {
    return await readFile("config/" + path, "utf-8");
}

/**
 * Writes a config file to disk using 'utf8'
 * 
 * @param path Path to config file
 * @param content File contents
 */
export async function writeConfigFile(path: string, content: string): Promise<void> {
    await writeFile("config/" + path, content, 'utf-8');
}

/**
 * Gets a key from a config.
 * The key is tried to be read from the supplied config.
 * If the config doesn't exist in-memory, a {@link ReferenceError} will be thrown.
 * If the key doesn't exist, {@link undefined} will be returned.
 * 
 * @param key Key to look up
 * @param config Config to look up
 * @throws ReferenceError Config doesn't exist
 * @returns Value at key in supplied config, or undefined
 */
export function get(key: string, config: string): unknown {
    if(configs[config] === undefined) throw new ReferenceError(`Config ${config} doesn't exist`);
    return configs[config][key];
}

/**
 * Writes a key to the supplied config.
 * If the supplied config doesn't exist, a {@link ReferenceError} will be thrown.
 * All configs will afterwards be written to disk.
 *
 * @param key Key to write to
 * @param config Config to write to
 * @param value Value to write
 * @throws ReferenceError Config doesn't exist
 */
export async function write(key: string, config: string, value: unknown): Promise<void> {
    if(configs[config] === undefined) throw new ReferenceError(`Config ${config} doesn't exist`);
    configs[config][key] = value;
    await writeConfig();
}
