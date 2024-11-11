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
            let embedsList = []


            await interaction.deferReply()
            const timeDif = Date.now()/1000 - lastUpdatedTodayGraph;
            if(timeDif >= 30){
                await generateCwDailyGraph(dataParsed)
                lastUpdatedTodayGraph = Date.now()/1000
                console.log("Updating")
            }
            const attachment = new AttachmentBuilder('./image.png')
            console.log(attachment.toJSON())
            const embed = new EmbedBuilder()
                .setTitle("Today's Country Wars Scores")
                .setImage('attachment://image.png')
                .setFooter({ text: "Last Updated"})
                .setTimestamp(lastUpdatedTodayGraph*1000)
            embed.setColor("#00b0f4");
            embedsList.push(embed)
            
            await interaction.editReply({ embeds: embedsList, files: [attachment] })


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
            
            let scores = []
            
            for(let country of dataParsed.countries) {
                scores.push(
                    `*#${scores.length + 1}* :flag_${String(country.countryCode).toLowerCase()}:  ${country.countryCode}: ${country.score} ${Emojis.COUNTRYWARS}`
                )
            }

            const embed = new EmbedBuilder()
                .setTitle(`Country Wars Leaderboard Season ${dataParsed.currentSeason}`)
                .setDescription(scores.join('\n'))
            embed.setColor("#00b0f4");
            await interaction.reply({embeds: [embed]})
        } else if(interaction.options.getSubcommand() === 'players') {
            const data = await socket.emitWithAck('playerInput', {
                "event": "getCWLeaderboard",
                "sortKey": "players"
            })
            
            let lb = []    
            let position = 0;        
            for(let playerData of data['data']) {
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
                    `*#${position}* ${userTag} :flag_${String(player.countryCode).toLowerCase()}: ${player.premium ? Emojis.PREMIUM : ''} ${levelTag} ${player.level} **${player.username}** ${player.online ? Emojis.ONLINE : ''}:  ${Emojis.COUNTRYWARS} ${playerData.player_cwp}`
                )
            }
            const embed = new EmbedBuilder()
                .setTitle(`Country Wars Players Leaderboard`)
                .setDescription(lb.join('\n'))
            embed.setColor("#00b0f4");
            await interaction.reply({embeds: [embed]})
        }
    });

export {data, category, execute}