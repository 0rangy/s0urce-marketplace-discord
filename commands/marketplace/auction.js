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
        const data = fs.readFileSync('./auctionCache.json',
            { encoding: 'utf8', flag: 'r' });
        dataParsed = JSON.parse(data);
        const timeDif = Date.now()/1000 - dataParsed.cacheAge;
        if(timeDif >= 30){ // Update info once every 30 seconds, only when prompted.
            fetch("https://nandertga.ddns.net:4097/api/v2/auctions").then(res => res.json()).then((listings) =>{
                console.log(Date.now())
                fs.writeFileSync('./auctionCache.json', JSON.stringify({
                        "cacheAge": Date.now()/1000,
                        "auctions": listings
                    },null, 2), {
                    encoding: "utf8",
                    mode: 0o666
                  })
            });
            
            console.log(`User ${interaction.user.tag} refreshed cache. (${timeDif})`);
        }
        console.log(`${timeDif}`)

        return interaction.reply(dataParsed.auctions[0].name);
    }
}