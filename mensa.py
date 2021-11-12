import configmanager
import mensaparser
from tabulate import tabulate


async def command_mensa(message, client):
    pass


async def timer_mensa(args):
    client = args[0]
    channelId = configmanager.get("announcementChannel")
    channel = client.get_channel(channelId)
    if channel is None:
        channel = await client.fetch_channel(channelId)
    await send_mensa_data(channel)


async def send_mensa_data(channel):
    try:
        mensaData = mensaparser.get_food_plan()
    except Exception:
        return
    tabledata = []
    for line in mensaData:
        if len(mensaData[line]) == 0:
            continue
        lineName = line.split("\n")[0]
        for food in mensaData[line]:
            if len(food[0]) > 32:
                price = food[1]
                splitFood = food[0].split(" ")
                splitFood.reverse()
                temp = ""
                while len(splitFood) > 0:
                    if (len(temp) + len(splitFood[0]) > 50):
                        tabledata.append([lineName, temp, price])
                        if (lineName != ""):
                            lineName = ""
                        if (price != ""):
                            price = ""
                        temp = splitFood.pop()
                    else:
                        temp += " " + splitFood.pop()
                tabledata.append([lineName, temp, price])
                if (lineName != ""):
                    lineName = ""
                if (price != ""):
                    price = ""
            else:
                tabledata.append([lineName, food[0], food[1]])
                if (lineName != ""):
                    lineName = ""
        tabledata.append(["", "", ""])
    tabledata.pop(len(tabledata) - 1)

    table = tabulate(tabledata, tablefmt="pretty")
    if (len(table) > 1900):
        tableLines = table.split("\n")
        tableLines.reverse()
        currentLine = ":fork_knife_plate: Mensaessen für heute: ```"
        while len(tableLines) > 0:
            if (len(currentLine) + len(tableLines[0]) > 1900):
                await channel.send(currentLine + "```")
                currentLine = "```" + tableLines.pop()
            else:
                currentLine += "\n" + tableLines.pop()
        await channel.send(currentLine + "```")
    else:
        await channel.send(":fork_knife_plate: Mensaessen für heute: ```" + table + "```")
