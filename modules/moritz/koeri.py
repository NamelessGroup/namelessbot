import lib.configmanager
import random

config = {}
max_possible_combinations = 64

async def load_koeri_config():
    global config
    config = await lib.configmanager.read_file("koeri.json")

def has_had_combination(user, number):
    return False

async def koeri_command(message, client):
    if config == {}:
        await load_koeri_config()
    number = random.randint(1, max_possible_combinations-1)
    # TODO: Fix if every combination has been had
    while (has_had_combination(message.author, number)):
        number = random.randint(1, max_possible_combinations - 1)
    s = "{0:b}".format(number)
    while len(s) < 7:
        s = "0" + s
    result = ""
    print(s)
    for (idx, i) in enumerate(s):
        print(i)
        print(idx)
        if i == "1":
            result += "Gewürz " + str(idx) + ", "
    await message.channel.send("Kombination: " + result[:-2])