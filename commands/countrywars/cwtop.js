import { socket, attemptSocketConection } from '../../index.js' 
import { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import * as fs from 'fs';
import { generateCwDailyGraph } from '../../utils/balls.js'
import { errorMonitor } from 'events';


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

            interaction.reply({ embeds: [ErrorEmbed("This command is currently broken. Sorry!")]})
            return;
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
            interaction.deferReply()
            const data = await socket.timeout(5000).emitWithAck('playerInput', {
                "event": "getCWLeaderboard",
                "sortKey": "countries"
            }).catch( err => {
                return {"status":"timeout"};
            });``
            if(data.status === 'timeout') {
                await interaction.editReply({embeds: [ErrorEmbed("Disconnected from s0urce.io! Please try again later.\n\n*If this keeps happening, please report to @orangyyy.*")]});
                attemptSocketConection()
                return;
            }
            let dataParsed = {
                'cacheAge': Date.now()/1000,
                "countries": data.data,
                "currentSeason": data.currentSeason,
                "seasonEnd": data.seasonEnd
            };
            
            let scores = []
            
            for(let country of dataParsed.countries) {
                scores.push(
                    `*#${scores.length + 1}* :flag_${String(country.countryCode).toLowerCase()}:  ${country.countryCode}: ${country.score} <:countrywars:1295762816111743107>`
                )
            }

            const embed = new EmbedBuilder()
                .setTitle(`Country Wars Leaderboard Season ${dataParsed.currentSeason}`)
                .setDescription(scores.join('\n'))
            embed.setColor("#00b0f4");
            await interaction.editReply({embeds: [embed]})
        } else if(interaction.options.getSubcommand() === 'players') {
            interaction.deferReply()
            const data = await socket.timeout(5000).emitWithAck('playerInput', {
                "event": "getCWLeaderboard",
                "sortKey": "players"
            }).catch( err => {
                return {'status': 'timeout'};
            });
            if(data.status === 'timeout') {
                await interaction.editReply({embeds: [ErrorEmbed("Disconnected from s0urce.io! Please try again later.\n\n*If this keeps happening, please report to @orangyyy.*")]});
                attemptSocketConection()
                return;
            }
            
            let lb = []    
            let position = 0;        
            for(let playerData of data['data']) {
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
                    `*#${position}* ${userTag} :flag_${String(player.countryCode).toLowerCase()}: ${player.premium ? "<:premium:1298066540540723250>" : ''} ${levelTag} ${player.level} **${player.username}** ${player.online ? '<:online:1298066024507248703>' : ''}:  <:countrywars:1295762816111743107> ${playerData.player_cwp}`
                )
            }
            const embed = new EmbedBuilder()
                .setTitle(`Country Wars Players Leaderboard`)
                .setDescription(lb.join('\n'))
            embed.setColor("#00b0f4");
            await interaction.editReply({embeds: [embed]})
        }
    });

export {data, category, execute}