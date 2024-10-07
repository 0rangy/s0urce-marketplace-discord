const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');


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
        const { cacheAge, auctions } = require("../../auctionCache.json");
        if(Date.now() >= cacheAge + 30000){ // Update info once every 30 seconds, only when prompted.
            fetch("https://nandertga.ddns.net:4097/api/v2/auctions").then(res => res.json()).then((listings) =>{
                console.log(Date.now())
                fs.writeFileSync('./auctionCache.json', JSON.stringify({
                        "cacheAge": Date.now(),
                        "auctions": listings
                    },null, 2), {
                    encoding: "utf8",
                    mode: 0o666
                  })
            });
            const { cacheAge, auctions } = require("../../auctionCache.json");
            console.log(`User ${interaction.user.tag} refreshed cache. (${Date.now() - (cacheAge + 30000)})`);
        }


        return interaction.reply(auctions[0].name);
    }
}