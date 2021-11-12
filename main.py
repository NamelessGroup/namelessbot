import discord
from discord.ext import tasks

import mittwoch
from recurringtask import RecurringTask
from weekday import Weekday
import mensa
import datetime
import configmanager

configmanager.readFile()
client = discord.Client()

recurring_tasks = [
    RecurringTask(Weekday.WEDNESDAY, 10, 0, mensa.timer_mensa, client),   # Mensa - Wednesday
    RecurringTask(Weekday.THURSDAY, 10, 0, mensa.timer_mensa, client),    # Mensa - Thursday
    RecurringTask(Weekday.FRIDAY, 10, 0, mensa.timer_mensa, client),      # Mensa - Friday

    RecurringTask(Weekday.FRIDAY, 15, 5, mittwoch.mittwoch, client),    # Mittwoch - Wednesday
]
commands = {
    "mensa": mensa.command_mensa,
   #"alarrrrrm": arrrrr.command_alarrrrrm,
}
command_prefix = "!"


@client.event
async def on_ready():
    print("Yes")
    loop.start()


@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith(command_prefix):
        args = message.content.split(" ")
        if args[0][1:] in commands:
            await commands[args[0][1:]](message, client)


@tasks.loop(minutes=1)
async def loop():
    d = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=1)))
    for task in recurring_tasks:
        if task.compare_time(Weekday(d.weekday()), d.hour, d.minute) == 0:
            await task.run()

client.run(configmanager.get("botToken"))