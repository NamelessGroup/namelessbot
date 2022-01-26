import json
import aiofiles
from pathlib import Path

configs = {}


def read_config():
    """
    Reads all (template)-configs into memory.
    If a config exists in config/templates and doesn't exist in the config directory, the template is loaded.
    If a config exists in both the config/templates and the config directory, the one in the config directory is loaded.
    """
    global configs

    configs_to_load = []
    for path in Path().glob("./config/templates/*.json"):
        configs_to_load.append(path)
    for path in Path().glob("./config/*.json"):
        for template in configs_to_load:
            if template.name == path.name:
                configs_to_load.remove(template)
                configs_to_load.append(path)

    for config in configs_to_load:
        configs[config.stem] = json.loads(read_file_sync(str(config), ""))


async def write_config():
    """Writes all configs to disk."""
    for config in configs:
        await write_file(config + ".json", json.dumps(configs[config]))


async def read_file(path, root="config/"):
    """Reads a file from the config directory and returns it.

    :param string path: The filename to open, including the ending.
    :param string root: Path root, defaults to config/
    :returns: The file contents
    :rtype: string
    """
    async with aiofiles.open(root + path) as f:
        content = await f.read()
        await f.close()
        return content


def read_file_sync(path, root="config/"):
    """Reads a file from the config directory and returns it synchronous.

    :param string path: The filename to open, including the ending.
    :param string root: Path root, defaults to config/
    :returns: The file contents
    :rtype: string
    """
    with open(root + path) as f:
        content = f.read()
        f.close()
        return content


async def write_file(path, content, root="config/"):
    """Writes contents into a file on the disk.

    :param string path: The file name to write to, including the ending.
    :param string root: Path root, defaults to config/
    :param string content: The contents to write
    """
    async with aiofiles.open(root + path, 'w') as f:
        await f.write(content)
        await f.close()


def get(key, config):
    """Get a key from a config.
    The key is tried to be read from the supplied config.
    If the config doesn't exist, a ValueError will be raised.
    If the key doesn't exist, Null will be returned.

    :param string key: The key to look up
    :param string config: Config to look up at
    :raises :class:`ValueError`: Config doesn't exist
    :returns: Value, if it exists, otherwise None
    :rtype: Union[any, None]"""
    if config in configs:
        if key in configs[config]:
            return configs[config][key]
        else:
            return None
    else:
        raise ValueError()


async def write(key, value, config):
    """Write a key to the supplied config.
    If the supplied config doesn't exist, a ValueError will be raised.

    :param string key: The key to write to
    :param any value: The value to write
    :param string config: The config to write to
    :raises: :class:`ValueError`: Config doesn't exist
    """
    global configs

    if config in configs:
        configs[config][key] = value
    else:
        raise ValueError()
    await write_config()
