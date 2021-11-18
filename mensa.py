import configmanager
import mensaparser
from tabulate import tabulate


async def command_mensa(message, client):
    await send_mensa_data(message.channel)


async def timer_mensa(args):
    client = args[0]
    channel_id = configmanager.get("announcement_channel")
    channel = client.get_channel(channel_id)
    if channel is None:
        channel = await client.fetch_channel(channel_id)
    await send_mensa_data(channel)


async def send_mensa_data(channel):
    try:
        mensa_data = mensaparser.get_food_plan()
    except Exception:
        return
    table_data = []
    for line in mensa_data:
        if len(mensa_data[line]) == 0:
            continue
        line_name = line.split("\n")[0]
        for food in mensa_data[line]:
            if len(food[0]) > 32:
                price = food[1]
                split_food = food[0].split(" ")
                split_food.reverse()
                temp = ""
                while len(split_food) > 0:
                    if len(temp) + len(split_food[0]) > 50:
                        table_data.append([line_name, temp, price])
                        if line_name != "":
                            line_name = ""
                        if price != "":
                            price = ""
                        temp = split_food.pop()
                    else:
                        temp += " " + split_food.pop()
                table_data.append([line_name, temp, price])
                if line_name != "":
                    line_name = ""
            else:
                table_data.append([line_name, food[0], food[1]])
                if line_name != "":
                    line_name = ""
        table_data.append(["", "", ""])
    table_data.pop(len(table_data) - 1)

    table = tabulate(table_data, tablefmt="pretty")
    if len(table) > 1900:
        table_lines = table.split("\n")
        table_lines.reverse()
        current_line = ":fork_knife_plate: Mensaessen für heute: ```"
        while len(table_lines) > 0:
            if len(current_line) + len(table_lines[0]) > 1900:
                await channel.send(current_line + "```")
                current_line = "```" + table_lines.pop()
            else:
                current_line += "\n" + table_lines.pop()
        await channel.send(current_line + "```")
    else:
        await channel.send(":fork_knife_plate: Mensaessen für heute: ```" + table + "```")

