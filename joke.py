import discord
import json
import random


class ReaderWriter():
    src = ""

    def __init__(self, f):
        self.src = f

    def readfile(self, va):
        ret = []
        with open(self.src, "r") as file:
            for x in file:
                a = json.loads(x)
                z = []
                for n in va:
                    z.append(a[n])
                ret.append(z)
        return ret

    def writefile(self, id, va):  # id value
        with open(self.src, "w") as file:
            j = 0
            for x in id:
                wr = "{"
                i = 0
                for n in x:
                    wr = wr + '"' + n + '":"' + va[j][i] + '"'
                    if (i < len(x) - 1):
                        wr = wr + ","
                    i = i + 1
                wr = wr + "}\n"
                file.write(wr)
                j = j + 1

    def deletefile(self):
        with open(self.src, "w") as file:
            file.write("")

    def appendfile(self, id, val):
        with open(self.src, "a") as file:
            for x in id:
                j = 0
                wr = "{"
                i = 0
                for n in x:
                    wr = wr + '"' + n + '":"' + val[j][i] + '"'
                    if (i < len(x) - 1):
                        wr = wr + ","
                    i = i + 1
                wr = wr + "}\n"
                file.write(wr)
                j = j + 1;


class Jokes():
    rw = ReaderWriter("src\\joke")
    stdva = ['id', 'joke']
    jokes = []

    def __init__(self):
        self.update()

    def addjoke(self, jo):
        tid = 0
        if (self.jokes != []):
            for x in self.jokes:
                for b in self.jokes:
                    print((b[0], tid))
                    if (int(b[0]) == tid):
                        tid += 1
        self.rw.appendfile([self.stdva], [[str(tid), jo]])
        self.update()
        return tid

    def remjoke(self, id):
        beg = self.rw.readfile(self.stdva)
        end = []
        for x in beg:
            if (int(x[0]) != id):
                end.append(x)
        self.rw.deletefile()
        for x in end:
            self.rw.writefile([self.stdva], [x])
        self.update()
        return id

    def telljoke(self, jid="-1"):
        tid = 0
        for x in self.jokes:
            if (int(x[0]) > int(tid)):
                tid = int(x[0])
        if (jid == -1):
            resid = random.randint(0, tid)
        else:
            resid = int(jid)
        for x in self.jokes:
            if (int(x[0]) == resid):
                return (x[1], resid)
        if (self.jokes == [] or jid != -1):
            return -1
        elif (jid == -1):
            return self.telljoke()

    def update(self):
        self.jokes = self.rw.readfile(self.stdva)
        # print(self.jokes)

    pass

jok = Jokes()

async def command_joke(message, client):
    if message.author == client.user:
        return
    print("From " + str(message.author.id) + " with " + str(message.content))
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
    if (splitcom[0] == "joke"):
        if splitcom[1] == "tell":
            if (len(splitcom) < 3):
                tid = -1
            else:
                tid = splitcom[2]
            ret = jok.telljoke(tid)
            # print(ret)
            if ret == -1:
                await message.reply("Index not forgiven or no item in list!")
            else:
                await message.reply(ret[0] + " (" + str(ret[1]) + ")")
        if splitcom[1] == "add":
            jokfilter = False
            j = ""
            for i in range(2, len(splitcom)):
                j = j + splitcom[i]
                if (i < len(splitcom) - 1):
                    j = j + " "
            j.replace('"', '')
            if jokfilter:
                j.replace("/", "")
                j.replace("\\", "")
                j.replace(";", "")
            zid = jok.addjoke(j)
            await message.reply("Your Joke has been added. The id is: " + str(zid))
        if splitcom[1] == "del":
            try:
                splitcom[2] = int(splitcom[2])
            except ValueError:
                await message.reply("Invalid Argument")
            ret = jok.remjoke(splitcom[2])
            await message.reply("Joke with id: " + str(ret) + " deleted!")
        if splitcom[1] == "update":
            jok.update()

