import { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import * as fs from 'fs'
import moment from 'moment';

// One day I'll make this ErrorEmbed in one file and import it around.
// Today is not that day.
const ErrorEmbed = (errorStr) => {
    const embed = new EmbedBuilder()
      .setTitle("Something happened!")
      .setDescription(`${errorStr}`)
      .setColor("#f50000");
  
    return embed;
  }
  

let commitEmbedBuilder = (ghCache, commitId) => {
    const currentCommit = ghCache['commits'][commitId]['commit'];
    const embed = new EmbedBuilder()
        .setTitle(`Commit #${Array(ghCache['commits'])[0].length - commitId}`)
        .setDescription(`${currentCommit['message']}`)
        .setColor("#00b0f4")
        .setFooter({
            text: "Commit Time",
        })
        .setTimestamp(moment(currentCommit['author']['time']).unix());
    return embed;

}

let processButtons = (async(response, prevId, ghCache, collectorFilter, interaction) => {
    let curId = prevId;
    try {
        const action = await response.awaitMessageComponent({ filter: collectorFilter, time: 600_000 }); // Keep buttons active for 10 mins
        if (action.customId === 'forwards') {
            curId++
        } else if(action.customId === 'back') {
            curId--
        }
        
        let goBack = new ButtonBuilder()
          .setCustomId('back')
          .setLabel(' ')
          .setEmoji('◀️')
          .setStyle(ButtonStyle.Primary);

		    let goForwards = new ButtonBuilder()
          .setCustomId('forwards')
          .setLabel(' ')
          .setEmoji('▶️')
          .setStyle(ButtonStyle.Primary);

        if(curId === 0) 
            goBack.setDisabled(true);
        else if(curId === Array(ghCache.commits)[0].length - 1) 
            goForwards.setDisabled(true);

        const row = new ActionRowBuilder()
			    .addComponents(goBack, goForwards);
        const embed = commitEmbedBuilder(ghCache, curId);
        await action.update({ embeds: [embed], components: [row] })

        processButtons(response, curId, ghCache, collectorFilter, interaction);
    } catch( exception ){
        interaction.editReply({ components: [] })
        console.log(exception)
    }
});

let category = 'util';
let data = new SlashCommandBuilder()
        .setName('changelog')
        .setDescription("View changelogs of this bot")
let execute = (async(interaction) => {
    const data = JSON.parse(fs.readFileSync('./githubCache.json',{ encoding: 'utf8', flag: 'r' }));
    await interaction.deferReply();
    const goBack = new ButtonBuilder()
              .setCustomId('back')
              .setLabel(' ')
              .setEmoji('◀️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true);

          const goForwards = new ButtonBuilder()
              .setCustomId('forwards')
              .setLabel(' ')
              .setEmoji('▶️')
              .setStyle(ButtonStyle.Primary)

          const row = new ActionRowBuilder()
              .addComponents(goBack, goForwards);
          const response = await interaction.editReply({ embeds: [commitEmbedBuilder(data, 0)], components: [row] });
          const collectorFilter = i => i.user.id === interaction.user.id; // Only person that triggers 

          await processButtons(response, 0, data, collectorFilter, interaction)
})
export { category, data, execute }