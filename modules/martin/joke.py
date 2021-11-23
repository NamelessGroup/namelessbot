import json
import os
from lib.configmanager import write_file, read_file
from pathlib import Path
import random


class ReaderWriter:
    src = ""

    def __init__(self, f):
        self.src = f
        p = os.path.join("../../config", "jokes")
        if not os.path.isfile(p):
            Path(p).touch()

    async def readfile(self, va):
        ret = []
        f_back = await read_file(self.src)
        f_split = f_back.split('||')
        for x in f_split:
            #print(x)
            if x == "":
                break
            a = json.loads(x)
            z = []
            for n in va:
                z.append(a[n])
            ret.append(z)
        return ret

    async def deletefile(self):
        await write_file(self.src,'')

    async def writearray(self, va, ar):
        end = ""
        for x in ar:
            if x == "":
                break
            #print(x)
            dic = dict()
            i = 0
            for y in va:
                dic[y] = x[i]
                i += 1
            tstr = json.dumps(dic)
            end += tstr + '||'
        await write_file(self.src, end)


class Jokes:
    rw = ReaderWriter("jokes")
    stdva = ['id', 'joke']
    jokes = []
    intial = 0

    def __init__(self):
        pass

    async def addjoke(self, jo):
        await self.initial()
        tid = 0
        if not self.jokes == []:
            for x in self.jokes:
                for b in self.jokes:
                    print((b[0], tid))
                    if int(b[0]) == tid:
                        tid += 1
        self.jokes.append([str(tid),jo])
        await self.rw.writearray(self.stdva, self.jokes)
        await self.update()
        return tid

    async def remjoke(self, idz):
        await self.initial()
        await self.update()
        i = 0
        for x in self.jokes:
            if x[0] == str(idz):
                self.jokes.pop(i)
            i += 1
        await self.rw.writearray(self.stdva, self.jokes)
        await self.update()
        return idz

    async def telljoke(self, jid=-1):
        tid = 0
        for x in self.jokes:
            if int(x[0]) > int(tid):
                tid = int(x[0])
        if jid == -1:
            resid = random.randint(0, tid)
        else:
            resid = int(jid)
        for x in self.jokes:
            if int(x[0]) == resid:
                return (x[1], resid)
        if self.jokes == [] or jid != -1:
            return -1
        elif jid == -1:
            return self.telljoke()

    async def update(self):
        self.jokes = await self.rw.readfile(self.stdva)
        # print(self.jokes)

    async def initial(self):
        if(self.initial == 0):
            await self.update()
            self.initial = 1


jok = Jokes()


async def command_joke(message, client):
    if message.author == client.user:
        return
    #print("From " + str(message.author.id) + " with " + str(message.content))
    if "arrrrr" in message.content.lower():
        ret = jok.telljoke(-1)
        # print(ret)
        if ret == -1:
            await message.reply("Index not forgiven or no item in list!")
        else:
            await message.reply(ret[0] + " (" + str(ret[1]) + ")")
    if not message.content.startswith("!"):
        return
    # await message.reply("Valid Command")
    com = message.content[1:]
    splitcom = com.split()
    # Commands for joke class
    if splitcom[0] == "joke":
        if splitcom[1] == "tell":
            if len(splitcom) < 3:
                tid = -1
            else:
                tid = splitcom[2]
            ret = await jok.telljoke(tid)
            # print(ret)
            if ret == -1:
                await message.reply("Index not forgiven or no item in list!")
            else:
                await message.reply(ret[0] + " (" + str(ret[1]) + ")")
        if splitcom[1] == "add":
            jokfilter = True
            j = ""
            for i in range(2, len(splitcom)):
                j = j + splitcom[i]
                if i < len(splitcom) - 1:
                    j = j + " "
            j = j.replace('"', '')
            j = j.replace("||", "")
            if jokfilter:
                j = j.replace("/", "")
                j = j.replace("\\", "")
                j = j.replace(";", "")
            zid = await jok.addjoke(j)
            await message.reply("Your Joke has been added. The id is: " + str(zid))
        if splitcom[1] == "del":
            try:
                splitcom[2] = int(splitcom[2])
            except ValueError:
                await message.reply("Invalid Argument")
            ret = await jok.remjoke(splitcom[2])
            await message.reply("Joke with id: " + str(ret) + " deleted!")
        if splitcom[1] == "update":
            await jok.update()


async def jokereact(mes):
    con = mes.content.lower()
    arpot = 0
    if "arrrrr" in con:
        arpot = 100
    else:
        for x in con:
            if x == 'a' or x == 'r':
                arpot += 10
    if arpot < 100:
        if random.randint(0,100) > arpot:
            return

    ret = await jok.telljoke()
    if ret == -1:
        await mes.reply("Index not forgiven or no item in list!")
    else:
        await mes.reply(ret[0] + " (" + str(ret[1]) + ")")



