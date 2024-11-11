import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { socket, Emojis } from '../../index.js';

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
        const response = await socket.emitWithAck('playerInput',{
            "event": "getLeaderboard",
            "sortKey": "btc"
        })
        
        let lb = []            
        let position = 0
        for(let playerData of response['data']) {
            position += 1;
            let player = JSON.parse(playerData.player_profile);

            let userTag = '';
            if(player.player_badge === "JMOD") {
                userTag = Emojis.JMOD;
            } else if (player.player_badge === "MOD") {
                userTag = Emojis.MOD;
            } else if (player.player_badge === "ADMIN") {
                userTag = Emojis.ADMIN;
            }
            if(player.username === 'Evrixol'){
                userTag = userTag = Emojis.ADMIN;
            }
        
            let levelTag = Emojis.RANK_BRONZE
            if(player.level > 10) {
                levelTag = Emojis.RANK_SILVER;
            } if(player.level > 25) {
                levelTag = Emojis.RANK_GOLD;
            } if(player.level > 50) {
                levelTag = Emojis.RANK_PLATINUM;
            } if(player.level > 75) {
                levelTag = Emojis.RANK_DIAMOND;
            } if(player.level > 100) {
                levelTag = Emojis.RANK_MASTER;
            } if(player.level > 125) {
                levelTag = Emojis.RANK_GRANDMASTER;
            };
            lb.push(
                `*#${position}*   ${userTag} :flag_${String(player.countryCode).toLowerCase()}: ${player.premium ? Emojis.PREMIUM : ''} ${levelTag} ${player.level} **${player.username}** ${player.online ? Emojis.ONLINE : ''}:  ${Emojis.BTC} ${properRound(playerData.player_btc)}`
            )
        }

        const embed = new EmbedBuilder()
                .setTitle(`Player Bitcoin Leaderboard`)
                .setDescription(lb.join('\n'))
            embed.setColor("#00b0f4");
        await interaction.reply({embeds: [embed]})
    } else if(interaction.options.getSubcommand() === 'level'){
        const response = await socket.emitWithAck('playerInput',{
            "event": "getLeaderboard",
            "sortKey": "level"
        })

        let lb = []      
        let position = 0;      
        for(let playerData of response['data']) {
            let player = JSON.parse(playerData.player_profile);
            position += 1;

            let userTag = '';
            if(player.player_badge === "JMOD") {
                userTag = Emojis.JMOD;
            } else if (player.player_badge === "MOD") {
                userTag = Emojis.MOD;
            } else if (player.player_badge === "ADMIN") {
                userTag = Emojis.ADMIN;
            }
            if(player.username === 'Evrixol'){
                userTag = userTag = Emojis.ADMIN;
            }
        
            let levelTag = Emojis.RANK_BRONZE
            if(player.level > 10) {
                levelTag = Emojis.RANK_SILVER;
            } if(player.level > 25) {
                levelTag = Emojis.RANK_GOLD;
            } if(player.level > 50) {
                levelTag = Emojis.RANK_PLATINUM;
            } if(player.level > 75) {
                levelTag = Emojis.RANK_DIAMOND;
            } if(player.level > 100) {
                levelTag = Emojis.RANK_MASTER;
            } if(player.level > 125) {
                levelTag = Emojis.RANK_GRANDMASTER;
            };
            lb.push(
                `*#${position}*   ${userTag} :flag_${String(player.countryCode).toLowerCase()}: ${player.premium ? Emojis.PREMIUM : ''} ${levelTag} ${player.level} **${player.username}** ${player.online ? Emojis.ONLINE : ''}:  ${Emojis.BTC} ${properRound(playerData.player_btc)}`
            )
        }
        const embed = new EmbedBuilder()
                .setTitle(`Player Level Leaderboard`)
                .setDescription(lb.join('\n'))
            embed.setColor("#00b0f4");
        await interaction.reply({embeds: [embed]})
    }
})

export { category, data, execute }