from lib import configmanager


async def task_reminder(client, message):
    channel_id = configmanager.get("announcement_channel")
    channel = client.get_channel(channel_id)
    if channel is None:
        channel = await client.fetch_channel(channel_id)
    await channel.send(":loudspeaker: <&899685638243221545> - Erinnerung: " + message + "!")
