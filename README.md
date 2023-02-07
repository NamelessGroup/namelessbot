# Namelessbot
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/namelessgroup/namelessbot/eslint.yml?label=lint)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/namelessgroup/namelessbot)
![Discord.js Version](https://img.shields.io/badge/Discord.js-14.7.1-blue)

Namelessbot is a Discord-Bot that implements many different small features. It is purpose build for our server.
## Language
Namelessbot is a Discord-Bot based on Discord.js and implemented in TypeScript
## Features
|Feature-Name|Description|Maintainer  |
|--|--|--|
|Mensa|Prints out the plan for our mensa on a daily basis|[c0derMo](https://github.com/c0derMo)|
|Koeri|Randomly generates a combination of 6 spices. Ranking of all possible combinations by every server member|[c0derMo](https://github.com/c0derMo)|
|Vote|Start a vote that either ends on time or after a majority of people has voted|[ujqlg](https://github.com/MartinKrausewitz)|
|AoC|Prints out the given leaderboard of the Advent of Code competition on a daily basis|[ujqlg](https://github.com/MartinKrausewitz), [Kronox](https://github.com/Kr0nox)|
|Timetable|Keeps track of our classes at university. Asks us every evening who will come to which class on the next day|[c0derMo](https://github.com/c0derMo), [Kronox](https://github.com/Kr0nox)|
|Truthtable|Given an boolean expression it generates a truthtable with all variable conditions|[c0derMo](https://github.com/c0derMo)|

## Internal Components
### Slashcommand
Slashcommands are the implementation of Discords slash commands
### Recurring Tasks
These are tasks that get repeated on a regular basis every 7 days on the same weekday.