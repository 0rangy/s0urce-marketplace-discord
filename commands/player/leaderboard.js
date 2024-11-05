import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { socket, attemptSocketConection } from '../../index.js';

const properRound = (num) => {
    return Math.round((Number(num) + Number.EPSILON) * 1000) / 1000
}

const ErrorEmbed = (errorStr) => {
    const embed = new EmbedBuilder()
      .setTitle("Something happened!")
      .setDescription(`${errorStr}`)
      .setColor("#f50000");
    return embed;
}

let category = 'player';
let data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View different in-game leaderboards')
    .addSubcommand(subcommand =>
        subcommand
            .setName("bitcoin")
            .setDescription("View the bitcoin leaderboard")
    ).addSubcommand(subcommand =>
        subcommand
            .setName("level")
            .setDescription("View the level leaderboard")
    );
let execute = (async(interaction) => {
    if(interaction.options.getSubcommand() === 'bitcoin') {
        const response = await socket.timeout(5000).emitWithAck('playerInput',{
            "event": "getLeaderboard",
            "sortKey": "btc"
        }).catch( err => {
            return {'status': 'timeout'};
        });
        if(response.status === 'timeout') {
            await interaction.editReply({embeds: [ErrorEmbed("Disconnected from s0urce.io! Please try again later.\n\n*If this keeps happening, please report to @orangyyy.*")]});
            attemptSocketConection()
            return;
        }


        let lb = []            
        let position = 0
        for(let playerData of response['data']) {
            position += 1;
            let player = JSON.parse(playerData.player_profile);

            let userTag = '';
            if(player.player_badge === "JMOD") {
                userTag = "<:jmod1:1297953641994391654><:jmod2:1297953643101949993>";
            } else if (player.player_badge === "MOD") {
                userTag = "<:mod1:1297979928804986942><:mod2:1297979929824067596>";
            } else if (player.player_badge === "ADMIN") {
                userTag = "<:admin1:1297939284728479795><:admin2:1297939272967651338>";
            }
            if(player.username === 'Evrixol'){
                userTag = userTag = "<:admin1:1297939284728479795><:admin2:1297939272967651338>";
            }
        
            let levelTag = "<:bronze:1295854402636353607>";
            if(player.level > 10) {
                levelTag = "<:silver:1295854401327464589>";
            } if(player.level > 25) {
                levelTag = "<:gold:1295854400140607559>";
            } if(player.level > 50) {
                levelTag = "<:platinum:1295854406025216051>";
            } if(player.level > 75) {
                levelTag = "<:diamond:1295854407564398674>";
            } if(player.level > 100) {
                levelTag = "<:master:1295854404699947038>";
            } if(player.level > 125) {
                levelTag = "<:grandmaster:1295854328376197212>";
            };
            lb.push(
                `*#${position}*   ${userTag} :flag_${String(player.countryCode).toLowerCase()}: ${player.premium ? "<:premium:1298066540540723250>" : ''} ${levelTag} ${player.level} **${player.username}** ${player.online ? '<:online:1298066024507248703>' : ''}:  <:btc:1295855267312963758> ${properRound(playerData.player_btc)}`
            )
        }

        const embed = new EmbedBuilder()
                .setTitle(`Player Bitcoin Leaderboard`)
                .setDescription(lb.join('\n'))
            embed.setColor("#00b0f4");
        await interaction.editReply({embeds: [embed]})
    } else if(interaction.options.getSubcommand() === 'level'){
        const response = await socket.timeout(5000).emitWithAck('playerInput',{
            "event": "getLeaderboard",
            "sortKey": "level"
        }).catch( err => {
            return {'status': 'timeout'};
        });
        if(response.status === 'timeout') {
            await interaction.editReply({embeds: [ErrorEmbed("Disconnected from s0urce.io! Please try again later.\n\n*If this keeps happening, please report to @orangyyy.*")]});
            attemptSocketConection()
            return;
        }

        let lb = []      
        let position = 0;      
        for(let playerData of response['data']) {
            let player = JSON.parse(playerData.player_profile);
            position += 1;

            let userTag = '';
            if(player.player_badge === "JMOD") {
                userTag = "<:jmod1:1297953641994391654><:jmod2:1297953643101949993>";
            } else if (player.player_badge === "MOD") {
                userTag = "<:mod1:1297979928804986942><:mod2:1297979929824067596>";
            } else if (player.player_badge === "ADMIN") {
                userTag = "<:admin1:1297939284728479795><:admin2:1297939272967651338>";
            }
            if(player.username === 'Evrixol'){
                userTag = userTag = "<:admin1:1297939284728479795><:admin2:1297939272967651338>";
            }
        
            let levelTag = "<:bronze:1295854402636353607>";
            if(player.level > 10) {
                levelTag = "<:silver:1295854401327464589>";
            } if(player.level > 25) {
                levelTag = "<:gold:1295854400140607559>";
            } if(player.level > 50) {
                levelTag = "<:platinum:1295854406025216051>";
            } if(player.level > 75) {
                levelTag = "<:diamond:1295854407564398674>";
            } if(player.level > 100) {
                levelTag = "<:master:1295854404699947038>";
            } if(player.level > 125) {
                levelTag = "<:grandmaster:1295854328376197212>";
            };
            lb.push(
                `*#${position}*   ${userTag} :flag_${String(player.countryCode).toLowerCase()}: ${player.premium ? "<:premium:1298066540540723250>" : ''} ${levelTag} ${player.level} **${player.username}** ${player.online ? '<:online:1298066024507248703>' : ''}:  <:btc:1295855267312963758> ${properRound(playerData.player_btc)}`
            )
        }
        const embed = new EmbedBuilder()
                .setTitle(`Player Level Leaderboard`)
                .setDescription(lb.join('\n'))
            embed.setColor("#00b0f4");
        await interaction.editReply({embeds: [embed]})
    }
})

export { category, data, execute }