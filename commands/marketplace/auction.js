const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');
const fs = require('fs');
const moment = require('moment')

const ErrorEmbed = (errorStr) => {
  const embed = new EmbedBuilder()
    .setTitle("Something happened!")
    .setDescription(`${errorStr}`)
    .setColor("#f50000");

  return embed;
}

const properRound = (num) => {
    return Math.round((num + Number.EPSILON) * 1000) / 1000
}

const generateEmbed = (id, auctionCache) => {
    let listings = auctionCache.auctions
    let listing = listings[id - 1];
    const embed = new EmbedBuilder()
  .setAuthor({
    name: `By: ${listing.organizer}`,
  })
  .setTitle(`**${listing.name}**`)
  .addFields(
    {
      name: "Name",
      value: `${listing.item.name} (#${listing.item.mint})`,
      inline: true
    },
    {
      name: "Rarity",
      value: `${listing.rarity}`,
      inline: true
    });
    try {
        embed.addFields(
            {
            name: "dTI",
            value: `${properRound(listing.dTI.rank.rating)}/10 (Est. BTC: ${properRound(listing.dTI.estimatedPrice)})`,
            inline: true
            });
    } catch(e){
        // Do nothing. This is for colors, avatars, etc.
    }
    embed.addFields({
      name: "Description",
      value: `${listing.item.description}`,
      inline: true
    },{
      name: "Creator",
      value: `${listing.item.creator}`,
      inline: true
    });
    
    try {
      for(let stat of listing.item.stats){
        let statDesc = String(stat.description).replace("$VAL", `${properRound(stat.value)}`)
        embed.addFields({
            name: `${stat.name}`,
            value: `${statDesc} `,
            inline: false
        })
      }
    } catch(e){
      // Have to put it outside since listing.item.stats is being iterated over :smh:
    }
    embed.addFields(
    {
      name: "**Auction Information:**",
      value: " ",
      inline: false
    },
    {
      name: "Starting Bid",
      value: `${properRound(listing.startingPrice)}`,
      inline: true
    },
    {
      name: "Highest Bid",
      value: `${properRound(listing.highestBid)}`,
      inline: true
    },
    {
      name: "Highest Bidder",
      value: `${listing.highestBidder}`,
      inline: true
    },
    {
      name: "Start Date",
      value: `<t:${moment(listing.startDate).unix()}:R>`,
      inline: true
    },
    {
      name: "End Date",
      value: `<t:${moment(listing.endDate).unix()}:R>`,
      inline: true
    },
  )
  .setThumbnail(`https://s0urce.io/items/${listing.item.icon}`)
  .setColor("#0087bd")
  .setFooter({
    text: "Last Refreshed",
  })
  .setTimestamp(auctionCache.cacheAge*1000);
  return embed;
};

async function processButtons(response, prevId, aCache, collectorFilter, interaction){
    dataParsed = aCache;
    let embedsList = []
    try { // In case someone spends more than 30 seconds browsing
      const timeDif = Date.now()/1000 - dataParsed.cacheAge;
      if(timeDif >= 30){ // Update info once every 30 seconds, only when prompted.
          fetch("https://nandertga.ddns.net:4097/api/v2/auctions").then(res => res.json()).then((listings) =>{
              fs.writeFileSync('./auctionCache.json', JSON.stringify({
                      "cacheAge": Date.now()/1000,
                      "auctions": listings
                  },null, 2), {
                  encoding: "utf8",
                  mode: 0o666
                })
          }).catch((e) =>{
            embedsList.push(ErrorEmbed("API didn't respond, information might be outdated."))
          });
          
          console.log(`User ${interaction.user.tag} refreshed cache. (${timeDif})`);
          const data = fs.readFileSync('./auctionCache.json',
            { encoding: 'utf8', flag: 'r' });
          dataParsed = JSON.parse(data);
      }
    } catch(e){
      console.log("Fetch failed! Is the API offline?")
      embedsList.push(ErrorEmbed("API didn't respond, information might be outdated."))
    }

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
          .setLabel('<-')
          .setStyle(ButtonStyle.Primary);

		    let goForwards = new ButtonBuilder()
          .setCustomId('forwards')
          .setLabel('->')
          .setStyle(ButtonStyle.Primary);

        switch(curId){
            case 1:
                goBack.setDisabled(true);
            case Array(dataParsed.auctions)[0].length:
                goForwards.setDisabled(true)
        }

        const row = new ActionRowBuilder()
			    .addComponents(goBack, goForwards);
        const embed = generateEmbed(curId, dataParsed);
        embedsList.push(embed)
        await action.update({ embeds: embedsList, components: [row] })

        processButtons(response, curId, dataParsed, collectorFilter, interaction);
    } catch( exception ){
        console.log(exception) // Just in case ;)
    }
}

module.exports = {
	category: 'marketplace',
    data: new SlashCommandBuilder()
    .setName("auction")
    .setDescription("Everything for auctions")
    .addSubcommand(subcommand =>
        subcommand
            .setName("listings")
            .setDescription("Get all available auctions")
    ),
    async execute(interaction){
        const data = fs.readFileSync('./auctionCache.json',
            { encoding: 'utf8', flag: 'r' });
        dataParsed = JSON.parse(data);
        let embedList = []
        let fetchError = false;
        const timeDif = Date.now()/1000 - dataParsed.cacheAge;
        if(timeDif >= 30){ // Update info once every 30 seconds, only when prompted.
            await fetch("https://nandertga.ddns.net:4097/api/v2/auctions").then(res => res.json()).then((listings) => {
                fs.writeFileSync('./auctionCache.json', JSON.stringify({
                        "cacheAge": Date.now()/1000,
                        "auctions": listings
                    },null, 2), {
                    encoding: "utf8",
                    mode: 0o666
                })
                console.log(`User ${interaction.user.tag} refreshed cache. (${timeDif})`);
                const data = fs.readFileSync('./auctionCache.json',
                  { encoding: 'utf8', flag: 'r' });
                dataParsed = JSON.parse(data);
            }).catch((e) => {
              fetchError = true;
            });
        }
        if(interaction.options.getSubcommand() === "listings"){
          const embed = generateEmbed(Array(dataParsed.auctions)[0].length, dataParsed);
          if(fetchError) {
            embedList.push(ErrorEmbed("API didn't respond, information might be outdated."))
          }
          embedList.push(embed);
          const goBack = new ButtonBuilder()
              .setCustomId('back')
              .setLabel('<-')
              .setStyle(ButtonStyle.Primary);

          const goForwards = new ButtonBuilder()
              .setCustomId('forwards')
              .setLabel('->')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(true);

          const row = new ActionRowBuilder()
              .addComponents(goBack, goForwards);
          const response = await interaction.reply({ embeds: embedList, components: [row] });
          let currentAuction = Array(dataParsed.auctions)[0].length;
          const collectorFilter = i => i.user.id === interaction.user.id; // Only person that triggers 

          await processButtons(response, currentAuction, dataParsed, collectorFilter, interaction)  
        }
    }
}