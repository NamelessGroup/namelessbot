import configmanager

async def mittwoch(args):
    client = args[0]
    channelId = configmanager.get("announcementChannel")
    channel = client.get_channel(channelId)
    if channel is None:
        channel = await client.fetch_channel(channelId)
    await channel.send("Es ist Mittwoch meine Kerle!")