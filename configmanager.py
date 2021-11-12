import json

fileContent = None

def readFile():
    global fileContent
    with open("config.json") as f:
        fileContent = json.loads(f.read())

def writeFile():
    global fileContent
    with open("config.json", 'w') as f:
        f.write(json.dumps(fileContent))

def get(key):
    global fileContent
    try:
        return fileContent[key]
    except:
        return None

def set(key, value):
    global fileContent
    fileContent[key] = value
    writeFile()