const { SlashCommandBuilder, EmbedBuilder, Embed} = require('discord.js');
const fs = require('fs');
const moment = require('moment')

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
    },
    {
      name: "dTI",
      value: `${listing.dTI.rank.rating}/10 (Est. BTC: ${listing.dTI.estimatedPrice})`,
      inline: true
    },
    {
      name: "Description",
      value: `${listing.item.description}`,
      inline: false
    });
    for(let stat of listing.item.stats){
        let statDesc = String(stat.description).replace("$VAL", `${stat.value}`)
        embed.addFields({
            name: `${stat.name}`,
            value: `${statDesc} `,
            inline: false
          })
    }
    embed.addFields(
    {
      name: "**Auction Stats:**",
      value: " ",
      inline: false
    },
    {
      name: "Starting Bid",
      value: `${listing.startingPrice}`,
      inline: true
    },
    {
      name: "Highest Bid",
      value: `${listing.highestBid}`,
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
        // const timeDif = Date.now()/1000 - dataParsed.cacheAge;
        // if(timeDif >= 30){ // Update info once every 30 seconds, only when prompted.
        //     fetch("https://nandertga.ddns.net:4097/api/v2/auctions").then(res => res.json()).then((listings) =>{
        //         console.log(Date.now())
        //         fs.writeFileSync('./auctionCache.json', JSON.stringify({
        //                 "cacheAge": Date.now()/1000,
        //                 "auctions": listings
        //             },null, 2), {
        //             encoding: "utf8",
        //             mode: 0o666
        //           })
        //     });
            
        //     console.log(`User ${interaction.user.tag} refreshed cache. (${timeDif})`);
        // }
        // console.log(`${timeDif}`)
        const embed = generateEmbed(2, dataParsed);

        await interaction.reply({ embeds: [embed] });
    }
}