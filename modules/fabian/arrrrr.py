from discord import FFmpegPCMAudio
import asyncio
import re


async def command_alarrrrrm(message, client):
    user = message.author
    voice = user.voice
    if voice != None:
        if voice.channel.category.name != "actual wichtiger stuff":
            vc = await voice.channel.connect()
            audio = FFmpegPCMAudio("assets/audio/Alarm.mp3", executable=r"path to ffmpeg.exe")
            vc.play(audio)
            while vc.is_playing():
                await asyncio.sleep(1)
            await vc.disconnect()
        else:
            await message.channel.send('Ungültiger Voice Channel.')
    else:
        await message.channel.send('Ungültiger Voice Channel')


async def ar(message):
    if message.channel.category.name == "Textkanäle":
        if re.findall("[aA][rR]{1,4}(?![rR])", message.content):
            nachricht = message.content
            nachricht = re.sub("[aA][rR]{1,4}(?![rR])", "arrrrr", nachricht)
            await message.reply("```Alarrrrrm deine Nachricht ist falsch! \nHier ist die Richtige Version: \n\n" + nachricht + "```")

