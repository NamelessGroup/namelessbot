import {readdir, lstat, readFile, writeFile, copyFile} from "fs/promises";
import {ConfigList} from "../types";
import {parse} from 'path';

const configs: ConfigList = {};

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
            console.log("Error while reading config file: ")
            console.log(e);
        }
    }
}

export async function writeConfig(): Promise<void> {
    for(const cfg in configs) {
        await writeConfigFile(cfg + ".json", JSON.stringify(configs[cfg]));
    }
}

export async function readConfigFile(path: string): Promise<string> {
    return await readFile("config/" + path, "utf-8");
}

export async function writeConfigFile(path: string, content: string): Promise<void> {
    await writeFile("config/" + path, content, 'utf-8');
}

export function get(key: string, config: string): unknown {
    if(configs[config] === undefined) throw new ReferenceError(`Config ${config} doesn't exist`);
    return configs[config][key];
}

export async function write(key: string, config: string, value: unknown): Promise<void> {
    if(configs[config] === undefined) throw new ReferenceError(`Config ${config} doesn't exist`);
    configs[config][key] = value;
    await writeConfig();
}
