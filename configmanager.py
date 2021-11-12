import json

fileContent = None


def read_file():
    global fileContent
    with open("config.json") as f:
        fileContent = json.loads(f.read())


def write_file():
    global fileContent
    with open("config.json", 'w') as f:
        f.write(json.dumps(fileContent))


def get(key):
    global fileContent
    try:
        return fileContent[key]
    except:
        return None


def write(key, value):
    global fileContent
    fileContent[key] = value
    write_file()
