import lib.configmanager
import random

max_possible_combinations = 128
legendary_combinations = [63, 127]


async def has_had_combination(user, number):
    config = lib.configmanager.get(str(user), "koeri")
    if config is None:
        return False
    else:
        return str(number) in config


async def had_every_combination(user, include_legendary=False):
    config = lib.configmanager.get(str(user), "koeri")
    if config is None:
        return False
    else:
        if include_legendary:
            return len(config) >= max_possible_combinations - 1
        else:
            return len(config) >= max_possible_combinations - 1 - len(legendary_combinations)


async def set_rating(user, number, rating):
    config = lib.configmanager.get(str(user), "koeri")
    if config is None:
        config = {}
    config[str(number)] = rating
    await lib.configmanager.write(str(user), config, "koeri")


async def koeri_ratings(user):
    config = lib.configmanager.get(str(user), "koeri")
    if config is None:
        return "Du musst zunächst koeri essen!"
    s = "```"
    for i in config[str(user)]:
        s += "(" + str(i) + ") " + number_to_seasonings(i) + " | " + str(config[str(user)][str(i)]) + "\n"
    s += "```"
    return s


def number_to_seasonings(number):
    s = "{0:b}".format(int(number))
    while len(s) < 7:
        s = "0" + s
    result = ""
    for (idx, i) in enumerate(s):
        if i == "1":
            if idx == 0:
                result += "Salz, "
            else:
                result += "Gewürz " + str(idx) + ", "
    return result[:-2]


async def koeri_command(message, client):
    author_id = message.author.id
    if message.content == "!koeri ratings":
        await message.reply(await koeri_ratings(author_id))
        return
    if message.content.startswith("!koeri rate"):
        params = message.content.split(" ")
        if len(params) != 4:
            await message.reply("Bitte benutze korrekte Syntax.")
            return
        try:
            number = int(params[2])
            rating = int(params[3])
        except ValueError:
            await message.reply("Bitte gib zwei Zahlen an.")
            return
        if number > max_possible_combinations - 1 or number < 1:
            await message.reply("Bitte bewerte Nummer 1-" + str(max_possible_combinations - 1) + ".")
            return
        if rating > 5 or rating < 1:
            await message.reply("Bitte bewerte mit 1-5.")
            return
        await set_rating(author_id, number, rating)
        await message.reply("Kombination " + str(number) + " bewertet mit " + str(rating) + ".")
        return

    number = random.randint(1, max_possible_combinations - 1)
    if await had_every_combination(author_id, True):
        await message.reply("Du Legende hast das koeriwerk durchgespielt")
        return
    elif await had_every_combination(author_id):
        await message.channel.send("https://i.redd.it/ain9jl82md381.jpg")
    while await has_had_combination(author_id, number) or (number in legendary_combinations
                                                           and not await had_every_combination(author_id)):
        number += 1
        number %= max_possible_combinations
        if number == 0:
            number = 1
    result = number_to_seasonings(number)
    new_message = await message.reply("Koeri-Kombination: " + result + " (" + str(number) + ")\nBewertung: -1")
    await new_message.add_reaction("1️⃣")
    await new_message.add_reaction("2️⃣")
    await new_message.add_reaction("3️⃣")
    await new_message.add_reaction("4️⃣")
    await new_message.add_reaction("5️⃣")


async def koeri_add_reaction(reaction, user, client):
    if reaction.message.author != client.user:
        return
    if not reaction.message.content.startswith("Koeri-Kombination"):
        return
    original_message_id = reaction.message.reference.message_id
    original_channel_id = reaction.message.reference.channel_id
    if user.id != (await client.get_channel(original_channel_id).fetch_message(original_message_id)).author.id:
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
        new_message = message.split("\n")[0] + "\nBewertung: " + str(rating)
        await reaction.message.edit(content=new_message)
