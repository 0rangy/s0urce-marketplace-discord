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

export let getPlayerData = (async(playerName) => {
    const response = await socket.emitWithAck('playerInput', {
        'event': 'searchToAddFriend', 
        "searchID": playerName
    });
    return response.data;
})
export let getPlayerLeaderboardString = (player, maxLength, playerid) => {
    let userTag = Emojis.STAFF_NONE;
    if(player.player_badge === "JMOD") {
        userTag = Emojis.JMOD;
    } else if (player.player_badge === "MOD") {
        userTag = Emojis.MOD;
    } else if (player.player_badge === "ADMIN") {
        userTag = Emojis.ADMIN;
    }
    let easterEggIds = ['397959622767673344', '669537804937592832']
    if((player.username === 'Evrixol') && easterEggIds.includes(playerid)){
        userTag = userTag = Emojis.ADMIN;
    }
    let levelTag = Emojis.RANK_BRONZE
    if(player.level >= 10) {
        levelTag = Emojis.RANK_SILVER;
    } if(player.level >= 25) {
        levelTag = Emojis.RANK_GOLD;
    } if(player.level >= 50) {
        levelTag = Emojis.RANK_PLATINUM;
    } if(player.level >= 75) {
        levelTag = Emojis.RANK_DIAMOND;
    } if(player.level >= 100) {
        levelTag = Emojis.RANK_MASTER;
    } if(player.level >= 125) {
        levelTag = Emojis.RANK_GRANDMASTER;
    }
    return `${userTag}:flag_${String(player.countryCode).toLowerCase()}: ${player.premium ? Emojis.PREMIUM : Emojis.EMPTY} ${levelTag} \`${player.level}${" ".repeat(4 - String(player.level).length)} ${player.username}${" ".repeat(maxLength - String(player.username).length)}\` ${player.online ? Emojis.ONLINE : Emojis.EMPTY}`
}

let execute = (async(interaction) => {
    if(interaction.options.getSubcommand() === 'bitcoin') {
        const response = await socket.emitWithAck('playerInput',{
            "event": "getLeaderboard",
            "sortKey": "btc"
        })

        let maxLength = 0;
        for(let playerData of response['data']){
            let player = JSON.parse(playerData.player_profile);
            if(String(player.username).length > maxLength){
                maxLength = String(player.username).length;
            }
        }
        
        await interaction.deferReply();
        
        let lb = [];          
        let lb2 = [];
        let position = 0
        for(let playerData of response['data']) {
            position += 1;
            let player = JSON.parse(playerData.player_profile);
            
            if(position < 11) {
                lb.push(
                    `\`#${position}${position <= 9 ? ' \`' : '\`'} ${getPlayerLeaderboardString(player, maxLength)} ${Emojis.BTC} ${properRound(playerData.player_btc)}`
                );
            } else {
                lb2.push(
                    `\`#${position}${position <= 9 ? ' \`' : '\`'} ${getPlayerLeaderboardString(player, maxLength)} ${Emojis.BTC} ${properRound(playerData.player_btc)}`
                );
            }
        }
        const embed = new EmbedBuilder()
            .setTitle(`Player Bitcoin Leaderboard`)
            .setDescription(lb.join('\n'))
        embed.setColor("#00b0f4");
        const embed2 = new EmbedBuilder()
            .setDescription(lb2.join('\n'))
        embed2.setColor("#00b0f4");
        await interaction.editReply({embeds: [embed, embed2]})
        
    } else if(interaction.options.getSubcommand() === 'level'){
        const response = await socket.emitWithAck('playerInput',{
            "event": "getLeaderboard",
            "sortKey": "level"
        })

        let maxLength = 0;
        for(let playerData of response['data']){
            let player = JSON.parse(playerData.player_profile);
            if(String(player.username).length > maxLength){
                maxLength = String(player.username).length;
            }
        }
        
        await interaction.deferReply();

        let lb = [];
        let lb2 = [];
        let position = 0;      
        for(let playerData of response['data']) {
            let player = JSON.parse(playerData.player_profile);
            position += 1;

            let userTag = Emojis.STAFF_NONE;
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
            }
            if(position < 11) {
                lb.push(
                    `\`#${position}${position <= 9 ? ' \`' : '\`'} ${userTag}:flag_${String(player.countryCode).toLowerCase()}: ${player.premium ? Emojis.PREMIUM : Emojis.EMPTY} ${levelTag} \`${player.level}${" ".repeat(4 - String(player.level).length)} ${player.username}${" ".repeat(maxLength - String(player.username).length)}\` ${player.online ? Emojis.ONLINE : Emojis.EMPTY}  ${Emojis.BTC} ${properRound(playerData.player_btc)}`
                );
            } else {
                lb2.push(
                    `\`#${position}${position <= 9 ? ' \`' : '\`'} ${userTag}:flag_${String(player.countryCode).toLowerCase()}: ${player.premium ? Emojis.PREMIUM : Emojis.EMPTY} ${levelTag} \`${player.level}${" ".repeat(4 - String(player.level).length)} ${player.username}${" ".repeat(maxLength - String(player.username).length)}\` ${player.online ? Emojis.ONLINE : Emojis.EMPTY}  ${Emojis.BTC} ${properRound(playerData.player_btc)}`
                );
            }
        }
        const embed = new EmbedBuilder()
                .setTitle(`Player Level Leaderboard`)
                .setDescription(lb.join('\n'))
            embed.setColor("#00b0f4");
        const embed2 = new EmbedBuilder()
            .setDescription(lb2.join('\n'))
        embed2.setColor("#00b0f4");
        await interaction.editReply({embeds: [embed, embed2]})
    }
})

export { category, data, execute }