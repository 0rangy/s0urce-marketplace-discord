const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QuickChart = require('quickchart-js');
const fs = require('fs')
const emoji = require('node-emoji')
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
        .setDescription("Daily wars information")
        .addSubcommand(subcommand =>
            subcommand
                .setName("today")
                .setDescription("View daily CW Scores")
        ),
    async execute(interaction) {
        if(interaction.options.getSubcommand() === 'today'){
            const data = fs.readFileSync('./cwCache.json',
                { encoding: 'utf8', flag: 'r' });
            dataParsed = JSON.parse(data);
            let embedsList = []
            const timeDif = Date.now()/1000 - dataParsed.cacheAge;
            if(timeDif >= 30){ // Update info once every 30 seconds, only when prompted.
                await fetch("https://nandertga.ddns.net:4097/api/v2/countryWarsTopToday").then(res => res.json()).then((countries) => {
                    fs.writeFileSync('./cwCache.json', JSON.stringify({
                            "cacheAge": Date.now()/1000,
                            "countries": countries
                        },null, 2), {
                        encoding: "utf8",
                        mode: 0o666
                    })
                    console.log(`User ${interaction.user.tag} refreshed cache. (${timeDif})`);
                    const data = fs.readFileSync('./cwCache.json',{ encoding: 'utf8', flag: 'r' });
                    dataParsed = JSON.parse(data);
                }).catch((e) => {
                embedsList.push(ErrorEmbed("API didn't respond, information might be outdated."))
                });
            }
            // Chart time :D
            const chart = new QuickChart();

            console.log(emoji.emojify(':heart:'))
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
            console.log(chartUrl)

            await interaction.reply({ embeds: embedsList })
        }
    }
}