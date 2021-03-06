from lib import configmanager
import datetime
from discord import File


async def mittwoch(client):
    channelId = configmanager.get("announcement_channel", "config")
    channel = client.get_channel(channelId)
    if channel is None:
        channel = await client.fetch_channel(channelId)
    await channel.send("Es ist Mittwoch meine Kerle!")
    await channel.send(file=File('assets/img/mittwoch.jpg'))


async def command_mittwoch(message, client):
    today = datetime.datetime.today().weekday()
    if today == 2:
        await message.channel.send('Heute ist Mittwoch!')
    else:
        if today < 2:
            days = 2 - today
        else:
            days = 9 - today
        if today < 2:
            await message.channel.send("Der nächste Mittwoch ist morgen!")
        else:
            await message.channel.send('Der nächste Mittwoch ist in ' + str(days) + " Tagen!")
