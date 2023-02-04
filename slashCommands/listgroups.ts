import {ISlashCommand} from "../types";
import {
    CommandInteraction,
    EmbedBuilder, GuildMemberRoleManager
} from "discord.js";

export default {
    command: {
        name: "listgroups",
        description: "This Command lists the groups of the server",
        options: []
    },
    handler: async function(interaction: CommandInteraction) {
        const roles = interaction.member.roles as GuildMemberRoleManager;
        console.log(roles.cache)
        let phrp = 0 //player highest role position
        roles.cache.forEach((r)=> {
            if (r.position > phrp) {
                phrp = r.position;
            }
        });
        const groups = interaction.guild.roles.cache.filter((role) => { // filter roles below players highest role to not reveal any private role
            return role.position <= phrp;
        }).sort((r, r1) => { //sort the positions of the roles
            return r.position-r1.position;
        }).map((role) => { //map the roles to the message
            return "" + role.name + " -> " + role.position;
        }).join("\n");
        const msgEmbed = new EmbedBuilder()
            .setColor("#0047AB")
            .setTitle("Group List")
            .setDescription(groups)
            .setTimestamp();
        await interaction.reply({embeds:[msgEmbed], ephemeral:true})
    }
} as ISlashCommand