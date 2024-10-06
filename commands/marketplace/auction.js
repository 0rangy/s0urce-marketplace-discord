const { SlashCommandBuilder } = require('discord.js');
const https = require("https")
const { writeFileSync } = require('node:fs');

const JSONToFile = (obj, filename) =>
    writeFileSync(`${filename}.json`, JSON.stringify(obj, null, 2));

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
        JSONToFile({"text":"hello"}, "../auctionCache")
        const { cacheAge, auctions } = require("../../auctionCache.json");
        if(Date.now() >= cacheAge + 30000){ // Update info once every 30 seconds, only when prompted.
            fetch("https://nandertga.ddns.net:4097/api/v2/auctions").then(res => res.json()).then((listings) =>{
                console.log(listings[0].ended)
            });
            const { auctions } = require("../../auctionCache.json");
            console.log(`User ${interaction.user.tag} refreshed cache`);
        }


        return interaction.reply(auctions[0].name);
    }
}