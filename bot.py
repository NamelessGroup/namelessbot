import discord
from discord.ext import tasks
import datetime
import mensaparser
from tabulate import tabulate
import math

client = discord.Client()
statuses = {
    "6-0:0": {"type": discord.ActivityType.watching, "message": "sich das GBI Blatt an", "status": discord.Status.dnd},
    "0-20:0": {"type": discord.ActivityType.playing, "message": "verzweifelt am GBI Blatt rum", "status": discord.Status.online},
    "1-9:30": {"type": discord.ActivityType.watching, "message": "sich das HM Blatt an", "status": discord.Status.dnd},
    "1-21:0": {"type": discord.ActivityType.playing, "message": "verzweifelt am HM Blatt rum", "status": discord.Status.online},
    "2-9:30": {"type": discord.ActivityType.watching, "message": "sich das LA Blatt an", "status": discord.Status.dnd},
    "3-12:30": {"type": discord.ActivityType.watching, "message": "sich die Proggen Aufgaben an", "status": discord.Status.dnd},
    "4-14:00": {"type": discord.ActivityType.playing, "message": "irgendwas, außer Uni", "status": discord.Status.idle}
}
hs = {
    "hsaf": "r/0x843007CD16CEDF4DB19740F3FA75C9BF",
    "audimax": "k/konkit-059",
    "daimler": "k/konkit-004"
}
reminder = {
    "0-14:0": "GBI Übungsblatt",
    "1-18:0": "HM Übungsblatt"
}
mensaPost = [
    "2-10:0",
    "3-10:0",
    "4-10:0"
]
announcementChannel = "899631201797673002"

@client.event
async def on_ready():
    print('We have logged in as {0.user}'.format(client))
    reminderLoop.start()

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith('!checkin'):
        args = message.content.split(" ")
        if len(args) >= 2:
            if hs[args[1].lower()] != None:
                await message.reply("https://www.kon.kit.edu/qr.php/" + hs[args[1].lower()])
            else:
                await message.reply("Kein Hörsaal mit diesem Namen.")
        else:
            await message.reply('Gib einen Hörsaal an!')
    if message.content.startswith('!mensa'):
        await sendMensaData(message.channel)

@tasks.loop(minutes=1)
async def reminderLoop():
    d = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=1)))
    s = str(d.weekday()) + "-" + str(d.hour) + ":" + str(d.minute)
    print("CET Time rn: " + d.isoformat() + "  -  " + s)
    if(s in reminder):
        print("We have a reminder!")
        if(client.is_ready()):
            channel = client.get_channel(announcementChannel)
            if(channel is None):
                channel = await client.fetch_channel(announcementChannel)
            await channel.send(":loudspeaker: <&899685638243221545> - Erinnerung: " + reminder[s] + "!")
    if(s in mensaPost):
        print("We should post mensa data!")
        channel = client.get_channel(announcementChannel)
        if(channel is None):
            channel = await client.fetch_channel(announcementChannel)
        await sendMensaData(channel)
    if(s in statuses):
        print("We should change the status!")
        activity = discord.Activity()
        activity.name = statuses[s]["message"]
        activity.type = statuses[s]["type"]
        await client.change_presence(activity=activity, status=statuses[s]["status"])

async def sendMensaData(channel):
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
                        if(len(temp) + len(splitFood[0]) > 50):
                            tabledata.append([lineName, temp, price])
                            if(lineName != ""):
                                lineName = ""
                            if(price != ""):
                                price = ""
                            temp = splitFood.pop()
                        else:
                            temp += " " + splitFood.pop()
                    tabledata.append([lineName, temp, price])
                    if(lineName != ""):
                        lineName = ""
                    if(price != ""):
                        price = ""
                else:
                    tabledata.append([lineName, food[0], food[1]])
                    if(lineName != ""):
                        lineName = ""
            tabledata.append(["", "", ""])
        tabledata.pop(len(tabledata)-1)

        table = tabulate(tabledata, tablefmt="pretty")
        if(len(table) > 1900):
            tableLines = table.split("\n")
            tableLines.reverse()
            currentLine = ":fork_knife_plate: Mensaessen für heute: ```"
            while len(tableLines) > 0:
                if(len(currentLine) + len(tableLines[0]) > 1900):
                    await channel.send(currentLine + "```")
                    currentLine = "```" + tableLines.pop()
                else:
                    currentLine += "\n" + tableLines.pop()
            await channel.send(currentLine + "```")
        else:
            await channel.send(":fork_knife_plate: Mensaessen für heute: ```" + table + "```")


client.run('OTAxMTEwMjAwODU2MTAwOTc1.YXLGRQ.3LKCu-q5T-KkYMSzPLBjsbB36J8')