import discord
from discord.ext import tasks

# from modules.martin import joke
from modules.fabian import arrrrr, mittwoch, vote

from lib.recurringtask import RecurringTask
from lib.weekday import Weekday
from modules.moritz import mensa, reminders
import datetime
from lib import configmanager

configmanager.read_config()
client = discord.Client()

recurring_tasks = [
    # Mensa -- Send Mensa plan
    RecurringTask(Weekday.WEDNESDAY, 10, 0, mensa.timer_mensa, client),
    RecurringTask(Weekday.THURSDAY, 10, 0, mensa.timer_mensa, client),
    RecurringTask(Weekday.FRIDAY, 10, 0, mensa.timer_mensa, client),

    # Mittwoch -- Send meme
    RecurringTask(Weekday.WEDNESDAY, 12, 0, mittwoch.mittwoch, client),

    # Reminders -- Remind us to work
    RecurringTask(Weekday.MONDAY, 14, 0, reminders.task_reminder, client, "GBI Übungsblatt"),
    RecurringTask(Weekday.TUESDAY, 18, 0, reminders.task_reminder, client, "HM Übungsblatt"),
    RecurringTask(Weekday.WEDNESDAY, 9, 56, reminders.task_reminder, client, "yes")
]
commands = {
    "mensa": mensa.command_mensa,
    "mittwoch": mittwoch.command_mittwoch,
    #"alarrrrrm": arrrrr.command_alarrrrrm,
    "vote": vote.command_vote,
    # "joke": joke.command_joke,
}
command_prefix = "!"


@client.event
async def on_ready():
    print("NamelessBot started.")
    loop.start()


@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith(command_prefix):
        args = message.content.split(" ")
        if args[0][1:] in commands:
            await commands[args[0][1:]](message, client)

    await arrrrr.ar(message)
    await joke.jokereact(message)



@tasks.loop(minutes=1)
async def loop():
    d = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=1)))
    for task in recurring_tasks:
        if task.compare_time(Weekday(d.weekday()), d.hour, d.minute) == 0:
            await task.run()

client.run(configmanager.get("bot_token"))
