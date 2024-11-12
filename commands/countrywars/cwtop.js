import { socket, Emojis } from '../../index.js' 
import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import * as fs from 'fs';
import { generateCwDailyGraph } from '../../utils/balls.js'
import { time } from 'console';

let lastUpdatedTodayGraph = 0;

const ErrorEmbed = (errorStr) => {
    const embed = new EmbedBuilder()
      .setTitle("Something happened!")
      .setDescription(`${errorStr}`)
      .setColor("#f50000");
  
    return embed;
  }
let category= 'countrywars'
let data = new SlashCommandBuilder()
        .setName("cwtop")
        .setDescription("Daily wars leaderboards")
        .addSubcommand(subcommand =>
            subcommand
                .setName("today")
                .setDescription("View daily CW Scores")
        ).addSubcommand(subcommand =>
            subcommand
                .setName("season")
                .setDescription("View CW seasonal leaderboards")
        ).addSubcommand(subcommand =>
            subcommand
                .setName("players")
                .setDescription("View CW top players")
        );
let execute = (async(interaction) => {
        if(interaction.options.getSubcommand() === 'today'){
            const data = fs.readFileSync('./cwDailyCache.json',
                { encoding: 'utf8', flag: 'r' });
            let dataParsed = JSON.parse(data);

            await interaction.deferReply();

            let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
            let countryNames = [];
            for(let country of dataParsed.countries){
                countryNames.push(regionNames.of(country.countryCode));
            }

            let maxLength = 0;
            for(let countryName of countryNames) {
                if (String(countryName).length > maxLength) {
                    maxLength = String(countryName).length;
                }
            }
            
            let scores = []
            for(let country of dataParsed['countries']){
                let position = scores.length +1;
                scores.push(
                    `\`#${position}${position <= 9 ? ' \`' : '\`'} :flag_${String(country.countryCode).toLowerCase()}:  \`${regionNames.of(country.countryCode)}${" ".repeat(maxLength - String(regionNames.of(country.countryCode)).length)}\` ${Emojis.COUNTRYWARS} ${country.score}`
                )
            }
            
            const embed = new EmbedBuilder()
                .setTitle("Country Wars Daily Leaderboard")
                .setDescription(scores.join('\n'));
            embed.setColor("#00b0f4")
            
            await interaction.editReply({ embeds: [embed] })


        } else if(interaction.options.getSubcommand() === 'season') {
            const data = await socket.emitWithAck('playerInput', {
                "event": "getCWLeaderboard",
                "sortKey": "countries"
            });
            let dataParsed = {
                'cacheAge': Date.now()/1000,
                "countries": data.data,
                "currentSeason": data.currentSeason,
                "seasonEnd": data.seasonEnd
            };
            
            await interaction.deferReply();

            let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});
            let countryNames = [];
            for(let country of dataParsed.countries){
                countryNames.push(regionNames.of(country.countryCode));
            }

            let maxLength = 0;
            for(let countryName of countryNames) {
                if (String(countryName).length > maxLength) {
                    maxLength = String(countryName).length;
                }
            }
            
            let scores = []
            for(let country of dataParsed.countries) {
                let position = scores.length +1;
                scores.push(
                    `\`#${position}${position <= 9 ? ' \`' : '\`'} :flag_${String(country.countryCode).toLowerCase()}:  \`${regionNames.of(country.countryCode)}${" ".repeat(maxLength - String(regionNames.of(country.countryCode)).length)}\` ${Emojis.COUNTRYWARS} ${country.score}`
                )
            }

            const embed = new EmbedBuilder()
                .setTitle(`Country Wars Leaderboard Season ${dataParsed.currentSeason}`)
                .setDescription(scores.join('\n'))
            embed.setColor("#00b0f4");
            await interaction.editReply({embeds: [embed]})
        } else if(interaction.options.getSubcommand() === 'players') {
            const data = await socket.emitWithAck('playerInput', {
                "event": "getCWLeaderboard",
                "sortKey": "players"
            })

            let maxLength = 0;
            for(let playerData of data['data']) {
                let player = JSON.parse(playerData.player_profile);
                if (String(player.username).length > maxLength) {
                    maxLength = String(player.username).length;
                }
            }
            
            await interaction.deferReply();
            
            let lb = [];
            let lb2 = [];
            let position = 0;        
            for(let playerData of data['data']) {
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
                        `\`#${position}${position <= 9 ? ' \`' : '\`'} ${userTag}:flag_${String(player.countryCode).toLowerCase()}: ${player.premium ? Emojis.PREMIUM : Emojis.EMPTY} ${levelTag} \`${player.level}${" ".repeat(4 - String(player.level).length)} ${player.username}${" ".repeat(maxLength - String(player.username).length)}\` ${player.online ? Emojis.ONLINE : Emojis.EMPTY}  ${Emojis.COUNTRYWARS} ${playerData.player_cwp}`
                    );
                } else {
                    lb2.push(
                        `\`#${position}${position <= 9 ? ' \`' : '\`'} ${userTag}:flag_${String(player.countryCode).toLowerCase()}: ${player.premium ? Emojis.PREMIUM : Emojis.EMPTY} ${levelTag} \`${player.level}${" ".repeat(4 - String(player.level).length)} ${player.username}${" ".repeat(maxLength - String(player.username).length)}\` ${player.online ? Emojis.ONLINE : Emojis.EMPTY}  ${Emojis.COUNTRYWARS} ${playerData.player_cwp}`
                    );
                }
            }
            const embed = new EmbedBuilder()
                .setTitle(`Country Wars Players Leaderboard`)
                .setDescription(lb.join('\n'))
            const embed2 = new EmbedBuilder()
                .setDescription(lb2.join('\n'))
            embed.setColor("#00b0f4");
            embed2.setColor("#00b0f4")
            await interaction.editReply({embeds: [embed,embed2]})
        }
    });

export {data, category, execute}