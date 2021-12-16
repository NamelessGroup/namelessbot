import lib.configmanager
import random

max_possible_combinations = 64


async def has_had_combination(user, number):
    config = lib.configmanager.get("koeri")
    if config is None:
        await lib.configmanager.write("koeri", {}, "private")
        config = {}
    if str(user) not in config:
        config[str(user)] = {}
        return False
    else:
        return str(number) in config[str(user)]


async def add_combination(user, number):
    config = lib.configmanager.get("koeri")
    config[str(user)][str(number)] = -1
    await lib.configmanager.write("koeri", config, "private")


async def had_every_combination(user):
    config = lib.configmanager.get("koeri")
    if config is None:
        await lib.configmanager.write("koeri", {}, "private")
        config = {}
    if str(user) not in config:
        config[str(user)] = {}
        return False
    else:
        return len(config[str(user)]) >= 63


async def set_rating(user, number, rating):
    config = lib.configmanager.get("koeri")
    if config is None:
        await lib.configmanager.write("koeri", {}, "private")
        config = {}
    if str(user) not in config:
        config[str(user)] = {}
        return False
    config[str(user)][str(number)] = rating
    await lib.configmanager.write("koeri", config, "private")


async def koeri_command(message, client):
    if message.content == "!koeri fill":
        for i in range(1, 63):
            if not await has_had_combination(message.author.id, i):
                await add_combination(message.author.id, i)
        return

    number = random.randint(1, max_possible_combinations-1)
    if await had_every_combination(message.author.id):
        await message.reply("Du Legende hast das koeriwerk durchgespielt")
        return
    while await has_had_combination(message.author.id, number):
        number += 1
        number %= 64
        if number == 0:
            number = 1
    s = "{0:b}".format(number)
    while len(s) < 7:
        s = "0" + s
    result = ""
    for (idx, i) in enumerate(s):
        if i == "1":
            result += "Gewürz " + str(idx) + ", "
    await add_combination(message.author.id, number)
    newMessage = await message.reply("Koeri-Kombination: " + result[:-2] + " (" + str(number) + ")\nBewertung: -1")
    await newMessage.add_reaction("1️⃣")
    await newMessage.add_reaction("2️⃣")
    await newMessage.add_reaction("3️⃣")
    await newMessage.add_reaction("4️⃣")
    await newMessage.add_reaction("5️⃣")


async def koeri_add_reaction(reaction, user, client):
    if reaction.message.author != client.user:
        return
    if not reaction.message.content.startswith("Koeri-Kombination"):
        return
    originalMessageId = reaction.message.reference.message_id
    originalChannelId = reaction.message.reference.channel_id
    if user.id != (await client.get_channel(originalChannelId).fetch_message(originalMessageId)).author.id:
        return
    rating = -1
    if reaction.emoji == "1️⃣":
        rating = 1
    if reaction.emoji == "2️⃣":
        rating = 2
    if reaction.emoji == "3️⃣":
        rating = 3
    if reaction.emoji == "4️⃣":
        rating = 4
    if reaction.emoji == "5️⃣":
        rating = 5
    if rating != -1:
        message = reaction.message.content
        number = message.split("(")[1].split(")")[0]
        await set_rating(user.id, number, rating)
        newMessage = message.split("\n")[0] + "\nBewertung: " + str(rating)
        await reaction.message.edit(content=newMessage)