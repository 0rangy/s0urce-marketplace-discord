import {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from 'discord.js';
import * as fs from 'fs';
import moment from 'moment';
import { Emojis } from '../../index.js';

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

const getRarityEmojiString = (rarity) => {
  let emojiString = 'error'
  if(rarity === ('d' || 'common')) {
      emojiString = Emojis.RARITY_D
  } else if(rarity === ('c' || 'uncommon')) { // Uncommon
      emojiString = Emojis.RARITY_C
  } else if(rarity === ('b' || 'rare')) { // Rare
      emojiString = Emojis.RARITY_B
  } else if(rarity === ('a' || 'epic')) { // Epic
      emojiString = Emojis.RARITY_A
  } else if(rarity === ('s' || 'legendary')) { // Legendary
      emojiString = Emojis.RARITY_S
  } else if(rarity === ('ss' || 'mythic')) { // Mythic
      emojiString = Emojis.RARITY_SS
  } else if(rarity === ('sss' || 'ethereal')) { // Ethereal
      emojiString = Emojis.RARITY_SSS
  } 
  return emojiString;
}



const generateEmbed = (id, auctionCache) => {
    let listings = auctionCache.auctions
    let listing = listings[id - 1];
    const embed = new EmbedBuilder()
  .setAuthor({
    name: `By: ${listing.organizer} (Auction #${listing.id})`,
  })
  .setTitle(`**${listing.name}**`)
  .addFields(
    {
      name: "Name",
      value: `${listing.item.name} (#${listing.item.mint})`,
      inline: true
    },
    {
      name: "-Rarity-",
      value: `${getRarityEmojiString(String(listing.item.rarity).toLowerCase())}`,
      inline: true
    });
    try {
        embed.addFields(
            {
            name: "dTI",
            value: `${properRound(listing.dTI.rank.rating)}/10 (${Emojis.BTC} ${properRound(listing.dTI.estimatedPrice)})`,
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
        let statDesc = String(stat.description).replace("$VAL", `${stat.value}`)
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
  .setColor("#00b0f4")
  .setFooter({
    text: "Last Refreshed",
  })
  .setTimestamp(auctionCache.cacheAge*1000);
  let fullImageDisplay = ["avatar", "namePlate", "nameColor"]
    if(fullImageDisplay.includes(listing.item.type)) {
        embed.setImage(`https://s0urce.io/items/${listing.item.icon}`)
    } else {
        embed.setThumbnail(`https://s0urce.io/items/${listing.item.icon}`)
    }
  return embed;
};

async function processButtons(response, prevId, aCache, collectorFilter, interaction, filterOptions, filterIndex){
    let dataParsed = aCache;
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

        const filterToggle = new ButtonBuilder()
            .setCustomId('togglefilters')
            .setLabel('Toggle Filters')
            .setEmoji("🗒️")
            .setStyle(ButtonStyle.Danger)
        
        if (action.customId === 'forwards') {
            if (filterOptions.filters) {
                filterIndex++
            } else curId++
        }
        if(action.customId === 'buy') {
            const listing = dataParsed.auctions[filterOptions.filters ? filterOptions.filteredIndexes[filterIndex] - 1 : curId - 1]
            
            const buyEmbed = new EmbedBuilder()
                .setTitle("How to buy from the Auction House")
                .setDescription(`If you read the command's description, you would know that is is an **unofficial** auction house ran by my fellow bot \`Yabluzo\`. That being said, here are the steps:\n\n\`1.\` Go in game using the button below.\n\`2.\` Start a chat with \`Yabluzo\`. If there are a lot of people in the lobby, you might have to add it as a friend to be able to chat with him.\n\`3.\` Type \`marketplace\`\n\`4.\` Type \`funds\` to check if you have enough money for the item you are trying to bid on. (In this case, you will need at least ${Emojis.BTC}\`${properRound(listing.highestBid + 0.001)}\`)\n\`4.1\` If you don't have enough funds, type \`deposit\` and follow the instructions provided.\n\`5.\`Back out from the funds menu by typing \`back\`.\n\`6.\` Type \`auctions\` and then \`view\` to view auctions.\n\`7.\` To view this auction, type \`goto ${listing.id}\`.\n\`8.\` All that's left is sending \`bid\` and telling Yabluzo how much you want to bid.\n\`9.\` Wait a painful amount because people don't know how to properly set an end date.`)
                .setColor("#00b0f4");
            const sourceButton = new ButtonBuilder()
                .setLabel("Go to s0urce.io")
                .setEmoji(Emojis.PREMIUM)
                .setURL('https://s0urce.io')
                .setStyle(ButtonStyle.Link)
            interaction.followUp({ embeds: [buyEmbed], components: [new ActionRowBuilder().addComponents(sourceButton)], ephemeral: true })
        } if(action.customId === 'back') {
            if(filterOptions.filters) {
                filterIndex--
            } else curId--
        } if(action.customId === 'togglefilters') {
            filterOptions.filters = !filterOptions.filters;
        } if(action.customId === 'filters' || (action.customId === 'togglefilters' && filterOptions.filters === true)) {
            filterOptions = {
                "filters": true,
                "hideEnded": false,
                "rarityFilter": [],
                "typeFilter": [],
                "filteredIndexes": []
            }
            if(action.customId !== 'togglefilters') {
                for (let filter of action.values) {
                    if (filter.indexOf("rarity") !== -1) {
                        filterOptions.rarityFilter.push(filter.replace("rarity", ""));
                    } else if (filter.indexOf("type") !== -1) {
                        filterOptions.typeFilter.push(filter.replace("type", "").toLowerCase());
                    }
                    if (filter === "hideEnded") filterOptions.hideEnded = true;
                }
            }
            for(let listing of dataParsed.auctions) {
                if(filterOptions.hideEnded) if(listing.ended && listing.highestBidder !== null) continue;
                if(filterOptions.typeFilter.length > 0) {
                    if(!filterOptions.typeFilter.includes(listing.item.type) && !(filterOptions.typeFilter.includes("cosmetics") && (listing.item.type === "namePlate" || listing.item.type === "nameColor"))) continue;
                }
                if(filterOptions.rarityFilter.length > 0) {
                    if(!filterOptions.rarityFilter.includes(listing.item.rarity)) continue;
                }
                filterOptions.filteredIndexes.push(listing.id);
            }
            filterIndex = filterOptions.filteredIndexes.length - 1;
        }
        
        let goBack = new ButtonBuilder()
          .setCustomId('back')
          .setLabel(' ')
          .setEmoji(Emojis.ARROW_LEFT)
          .setStyle(ButtonStyle.Primary);

        let goForwards = new ButtonBuilder()
          .setCustomId('forwards')
          .setLabel(' ')
          .setEmoji(Emojis.ARROW_RIGHT)
          .setStyle(ButtonStyle.Primary);

        const buyButton  = new ButtonBuilder()
            .setCustomId('buy')
            .setLabel('Buy')
            .setEmoji("💵")
            .setStyle(ButtonStyle.Primary)
        
        let componentList = [];
        if(filterOptions.filters){
            if(filterIndex === 0) goBack.setDisabled(true); else goBack.setDisabled(false);
            if(filterIndex === Array(filterOptions.filteredIndexes)[0].length - 1) goForwards.setDisabled(true); else goForwards.setDisabled(false);
        } else {
            switch (curId) {
                case 1:
                    goBack.setDisabled(true);
                case Array(dataParsed.auctions)[0].length:
                    goForwards.setDisabled(true)
            }
        }
        
        if(filterOptions.filters) {
            filterToggle.setStyle(ButtonStyle.Success);
            const filterSelect = new StringSelectMenuBuilder()
                .setCustomId('filters')
                .setPlaceholder('Select filters')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Hide ended auctions (recommended)")
                        .setValue('hideEnded')
                        .setDefault(filterOptions.hideEnded),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Rarity - Common")
                        .setValue('rarityD')
                        .setDefault(filterOptions.rarityFilter.includes("D")),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Rarity - Uncommon")
                        .setValue('rarityC')
                        .setDefault(filterOptions.rarityFilter.includes("C")),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Rarity - Rare")
                        .setValue('rarityB')
                        .setDefault(filterOptions.rarityFilter.includes("B")),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Rarity - Epic")
                        .setValue('rarityA')
                        .setDefault(filterOptions.rarityFilter.includes("A")),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Rarity - Legendary")
                        .setValue('rarityS')
                        .setDefault(filterOptions.rarityFilter.includes("S")),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Rarity - Mythical")
                        .setValue('raritySS')
                        .setDefault(filterOptions.rarityFilter.includes("SS")),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Rarity - Ethereal")
                        .setValue('raritySSS')
                        .setDefault(filterOptions.rarityFilter.includes("SSS")),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Type - CPU")
                        .setValue('typeCpu')
                        .setDefault(filterOptions.typeFilter.includes("cpu")),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Type - GPU")
                        .setValue('typeGpu')
                        .setDefault(filterOptions.typeFilter.includes('gpu')),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Type - PSU")
                        .setValue('typePsu')
                        .setDefault(filterOptions.typeFilter.includes('psu')),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Type - Firewall")
                        .setValue('typeFirewall')
                        .setDefault(filterOptions.typeFilter.includes('firewall')),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Type - Avatar")
                        .setValue('typeAvatar')
                        .setDefault(filterOptions.typeFilter.includes("avatar")),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Type - Cosmetics")
                        .setValue('typeCosmetics')
                        .setDefault(filterOptions.typeFilter.includes("cosmetics")),
                )
                .setMinValues(0)
                .setMaxValues(14);
            let row2 = new ActionRowBuilder()
                .addComponents(filterSelect);
            componentList.push(row2);
        }


        const row = new ActionRowBuilder()
			    .addComponents(goBack, goForwards, filterToggle, buyButton);
        componentList.push(row);
        let embed;
        if(filterOptions.filteredIndexes.length === 0) {
            embed = ErrorEmbed("Your filters don't match any auctions.");
            buyButton.setDisabled(true);
            goBack.setDisabled(true);
            goForwards.setDisabled(true);
        } else embed = generateEmbed(filterOptions.filters ? filterOptions.filteredIndexes[filterIndex] : curId, dataParsed);
        embedsList.push(embed)
        await action.update({ embeds: embedsList, components: componentList})

        processButtons(response, curId, dataParsed, collectorFilter, interaction, filterOptions, filterIndex);
    } catch( exception ){
        interaction.editReply({ components: [] })
        console.log("Interaction timed out")
        console.log(exception);
    }
}
let category =  'marketplace';
let data = new SlashCommandBuilder()
    .setName("auction")
    .setDescription("Everything for auctions")
    .addSubcommand(subcommand =>
        subcommand
            .setName("listings")
            .setDescription("Get all available auctions")
    );
let  execute = (async(interaction) => {
        await interaction.deferReply();    
    
        const data = fs.readFileSync('./auctionCache.json',
            { encoding: 'utf8', flag: 'r' });
        let dataParsed = JSON.parse(data);
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
                .setLabel(' ')
                .setEmoji(Emojis.ARROW_LEFT)
                .setStyle(ButtonStyle.Primary);
           
            const goForwards = new ButtonBuilder()
                .setCustomId('forwards')
                .setLabel(' ')
                .setEmoji(Emojis.ARROW_RIGHT)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true);
    
            const filterToggle = new ButtonBuilder()
                .setCustomId('togglefilters')
                .setLabel('Toggle Filters')
                .setEmoji("🗒️")
                .setStyle(ButtonStyle.Danger)
            
            const buyButton  = new ButtonBuilder()
                .setCustomId('buy')
                .setLabel('Buy')
                .setEmoji("💵")
                .setStyle(ButtonStyle.Primary)
            
            let filterOptions = { 
                "filters": false,
                "hideEnded": false,
                "filteredIndexes": [],
                "rarityFilter": [],
                "typeFilter": [],
            }
            
            const row = new ActionRowBuilder()
                .addComponents(goBack, goForwards, filterToggle, buyButton);
            const response = await interaction.editReply({ embeds: embedList, components: [row] });
            let currentAuction = Array(dataParsed.auctions)[0].length;
            const collectorFilter = i => i.user.id === interaction.user.id; // Only person that triggers 

            await processButtons(response, currentAuction, dataParsed, collectorFilter, interaction, filterOptions , 0)  
        }
    });
  
    export {data, category, execute}