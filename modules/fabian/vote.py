import re
import asyncio
import discord

async def command_vote(message, client):
    emoji1 = '✅'
    emoji2 = '❌'
    nachricht = message.content
    vote = re.sub("!vote ", "", nachricht)
    time = 10
    nachricht2 = await message.channel.send(vote)
    await nachricht2.add_reaction(emoji1)
    await nachricht2.add_reaction(emoji2)
    await asyncio.sleep(time)
    cache_msg = discord.utils.get(client.cached_messages, id=nachricht2.id)
    reaction1 = discord.utils.get(cache_msg.reactions, emoji=emoji1)
    reaction2 = discord.utils.get(cache_msg.reactions, emoji=emoji2)
    if reaction1.count > reaction2.count:
        await nachricht2.reply("Der Vote ist vorbei und war erfolgreich!")
    elif reaction1.count < reaction2.count:
        await nachricht2.reply("Der Vote ist vorbei und ist gescheitert!")
    else:
        await nachricht2.reply("Der Vote ist vorbei und es gab keine einstimmigkeit!")

