const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QuickChart = require('quickchart-js');
const fs = require('fs')

const ErrorEmbed = (errorStr) => {
    const embed = new EmbedBuilder()
      .setTitle("Something happened!")
      .setDescription(`${errorStr}`)
      .setColor("#f50000");
  
    return embed;
  }


module.exports = {
	category: 'countrywars',
    data: new SlashCommandBuilder()
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
        ),
    async execute(interaction) {
        if(interaction.options.getSubcommand() === 'today'){
            const data = fs.readFileSync('./cwDailyCache.json',
                { encoding: 'utf8', flag: 'r' });
            dataParsed = JSON.parse(data);
            let embedsList = []

            // Chart time :D
            const chart = new QuickChart();

            let chartLabels = []
            let chartDatasets = []
            let countriesAmt = 0;
            for(let country of dataParsed.countries) {
                if(countriesAmt < 5){
                    chartLabels.push(country.countryCode)
                    chartDatasets.push(country.score)
                } else {
                    break
                }
            }

            chart.setConfig({
                type: "bar",
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: `Points`,
                        data: chartDatasets,
                        backgroundColor: '#1662a4'
                    }]
                }
            }).setWidth(500).setHeight(300).setBackgroundColor('#111112')

            const chartUrl = await chart.getShortUrl()
            const embed = new EmbedBuilder()
                .setTitle("Today's Country Wars Scores")
                .setImage(chartUrl)
                .setFooter({ text: "Last Updated"})
                .setTimestamp(dataParsed.cacheAge*1000)
                .setColor("#1662a4");
            embedsList.push(embed)
            
            await interaction.deferReply();
            await interaction.editReply({ embeds: embedsList })


        } else if(interaction.options.getSubcommand() === 'season') {
            const data = fs.readFileSync('./cwSeasonCache.json',
                { encoding: 'utf8', flag: 'r' });
            dataParsed = JSON.parse(data);
            
            let scores = []
            
            for(let country of dataParsed.countries) {
                scores.push(
                    `*#${scores.length + 1}* :flag_${String(country.countryCode).toLowerCase()}:  ${country.countryCode}: ${country.score}`
                )
            }

            const embed = new EmbedBuilder()
                .setTitle("This Month's Country Wars Leaderboard")
                .setDescription(scores.join('\n'))
                .setFooter({
                    text: "Last Updated",
                })
                .setTimestamp(dataParsed.cacheAge*1000);
            await interaction.reply({embeds: [embed]})
        }
    }
}