# Namelessbot
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/namelessgroup/namelessbot/eslint.yml?label=lint)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/namelessgroup/namelessbot)
![Discord.js Version](https://img.shields.io/badge/Discord.js-14.7.1-blue)

Namelessbot is a Discord-Bot that implements many different small features. It is purpose build for our server.
## Language
Namelessbot is a Discord-Bot based on Discord.js and implemented in TypeScript
## Modules
|Module-Name|Description|Maintainer  |
|--|--|--|
|aoc|Prints out the given leaderboard of the Advent of Code competition on a daily basis|[ujqlg](https://github.com/MartinKrausewitz), [Kronox](https://github.com/Kr0nox)|
|attendancetracker|Keeps track of our classes at university. Asks us every evening who will come to which class on the next day|[c0derMo](https://github.com/c0derMo), [Kronox](https://github.com/Kr0nox)|
|koeri|Randomly generates a combination of 6 spices. Ranking of all possible combinations by every server member|[c0derMo](https://github.com/c0derMo)|
|mensa|Prints out the plan for our mensa on a daily basis|[c0derMo](https://github.com/c0derMo)|
|truthtable|Given an boolean expression it generates a truthtable with all variable conditions|[c0derMo](https://github.com/c0derMo)|
|vote|Start a vote that either ends on time or after a majority of people has voted|[ujqlg](https://github.com/MartinKrausewitz)|

## Configuration
All configuration files are located in the `config` folder. All configuration files are in standard JSON format.

### Config file reference
|File name|Content|
|--|--|
| `config.json` | General purpose configuration file. Holds default guild, channel, voter group. |
| `aoc.json` | "Advent of Code"-related config. Holds the year and leaderboard to pull. |
| `attendance.json` | Holds the tracked attendance of all discord users.
| `timetable.json` | Holds the timetable to use in combination with the attendance tracker. |
| `koeri.json` | Holds all rated koeri-combinations per user. |

### Environment variables
Some sensitive information shouldn't get stored in config files, these are stored in environment variables. These can also be specified in a `.env` file in the project root. Mainly holds authorization-related information.

|Environment variable|Content|
|--|--|
|`DISCORD_TOKEN`|Holds the discord bot token used to login|
|`AOC_TOKEN`|Holds the Advent of Code-Session token used to fetch the leaderboard|

## Internal Components
### Slashcommand
Slashcommands are the implementation of Discords slash commands
### Recurring Tasks
These are tasks that get repeated on a regular basis every 7 days on the same weekday.
#### University Recurring Tasks
This special kind of recurring task only gets executed on days, where lectures are held at KIT 