
## Configuration files

All configuration files are located in the `config` folder. All config files are in standard JSON format. If a config file isn't found at server startup, it is copied over from `config/templates`.

### Config file reference
|File name|Content|
|--|--|
| `config.json` | General purpose configuration file. Holds default guild, channel, voter group. |
| `aoc.json` | "Advent of Code"-related config. Holds the year and leaderboard to pull. |
| `attendance.json` | Holds the tracked attendance of all discord users.
| `timetable.json` | Holds the timetable to use in combination with the attendance tracker. |
| `koeri.json` | Holds all rated koeri-combinations per user. |

### Adding config files
A config file should be added to the template directory to ensure it is present on target systems. Afterwards, it can already be referenced using {@link lib/configmanager}.

## Environment variables

Some sensitive information shouldn't get stored in config files, these are stored in environment variables. These can also be specified in a `.env` file in the project root. Mainly holds auth-related information.

|Environment variable|Content|
|--|--|
|`DISCORD_TOKEN`|Holds the discord bot token used to login|
|`AOC_TOKEN`|Holds the Advent of Code-Session token used to fetch the leaderboard|
