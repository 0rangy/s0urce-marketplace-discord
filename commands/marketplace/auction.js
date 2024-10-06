const { SlashCommandBuilder } = require('discord.js');
const https = require("https")
const fs = require('node:fs');

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
        fs.writeFileSync('../auctionCache.json', "hello");
        const { cacheAge, auctions } = require("../../auctionCache.json");
        if(Date.now() >= cacheAge + 30000){ // Update info once every 30 seconds, only when prompted.
            fetch("https://nandertga.ddns.net:4097/api/v2/auctions").then((listings) =>{
                fs.writeFileSync('../auctionCache.json', "hello");
            });
            const { auctions } = require("../../auctionCache.json");
            console.log(`User ${interaction.user.tag} refreshed cache`);
        }


        return interaction.reply(auctions[0].name);
    }
}