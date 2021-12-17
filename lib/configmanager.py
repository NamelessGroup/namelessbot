import json
import aiofiles

configs = {
    "global": {},
    "private": {}
}


def read_config():
    """Reads the private & global configs into memory."""
    global configs
    configs["global"] = json.loads(read_file_sync("config.json"))
    configs["private"] = json.loads(read_file_sync("local_config.json"))


async def write_config():
    """Writes the private & global configs to disk."""
    await write_file("../config/local_config.json", json.dumps(configs["global"]))
    await write_file("../config/local_config.json", json.dumps(configs["private"]))


async def read_file(path):
    """Reads a file from the config directory and returns it.

    :param string path: The filename to open, including the ending.
    :returns: The file contents
    :rtype: string
    """
    async with aiofiles.open("config/" + path) as f:
        content = await f.read()
        await f.close()
        return content


def read_file_sync(path):
    """Reads a file from the config directory and returns it synchronous.

    :param string path: The filename to open, including the ending.
    :returns: The file contents
    :rtype: string
    """
    with open("config/" + path) as f:
        content = f.read()
        f.close()
        return content


async def write_file(path, content):
    """Writes contents into a file on the disk.

    :param string path: The file name to write to, including the ending.
    :param string content: The contents to write"""
    async with aiofiles.open("config/" + path, 'w') as f:
        await f.write(content)
        await f.close()


def get(key):
    """Get a key from the config. If the key exists in the private config, that will be used, if not,
    the value will be pulled global config if it exists. If it exists nowhere, this function will return None.

    :param string key: The key to look up
    :returns: Value, if it exists, otherwise None
    :rtype: Union[any, None]"""
    if key in configs["private"]:
        return configs["private"][key]
    elif key in configs["global"]:
        return configs["global"][key]
    else:
        return None


async def write(key, value, config_scope=""):
    """Write a key to the config.
    If a config scope is supplied, that will be used. If not, the function will try to guess:
    If the key exists in the private config, override that, otherwise write it to the global config.

    :param string key: The key to write to
    :param any value: The value to write
    :param string config_scope: either 'private' or 'global'
    :raises: :class:`ValueError`: Invalid config_scope
    """
    global configs
    # if there is a scope: use that
    if config_scope == "private":
        configs["private"][key] = value
    elif config_scope == "global":
        configs["global"][key] = value
    elif config_scope == "":
        # if no scope supplied: try to guess (if its in private, use that)
        if key in configs["private"]:
            configs["private"][key] = value
        else:
            configs["global"][key] = value
    else:
        # if something invalid is passed, it's probably bad, throw something
        raise ValueError()
    await write_config()
   