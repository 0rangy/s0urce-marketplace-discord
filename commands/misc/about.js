import {EmbedBuilder, SlashCommandBuilder} from "discord.js";
import fs from "fs";
import {btcCount, btcLastUpdated, btcPerSecond, Emojis, ethFilaCount, properRound} from "../../index.js";

let showMainEmbed = async (interaction) => {
    let funnyStats = JSON.parse(fs.readFileSync("./funnyStats.json").toString().trim());
    let moneyLost = funnyStats['btcLost']
    
    let liveBtcAmt = btcCount + ((Date.now() - btcLastUpdated)/1000) * btcPerSecond;
    
    const embed = new EmbedBuilder()
        .setTitle("About s0urce Statistics")
        .setDescription("<@1296147059581124629> is a Discord bot made by `@orangyyy` originally meant to provide... well... *statistics* for [s0urce.io](https://www.s0urce.io). It has expanded to include a few challenge related functionalities and will probably get even more in the future.")
        .addFields(
            {
                name: "Funny Stats",
                value: " ",
                inline: false
            },
            {
                name: "BTC Lost From Hacks",
                value: `${Emojis.BTC} ${properRound(moneyLost) * -1}`,
                inline: true
            },
            {
                name: "Current Amount Of Filaments",
                value:`${properRound(ethFilaCount)}`,
                inline: true
            },
            {
                name: "Live BTC Count",
                value: `${Emojis.BTC} ${properRound(liveBtcAmt)}`,
                inline: true
            },
        )
        .setThumbnail("https://cdn.discordapp.com/avatars/1296147059581124629/5764d4e95a41f6335f2068b3b017aaf2.webp?size=80")
        .setColor("#00b0f4");
    interaction.reply({ embeds: [embed] });
}

let category = 'misc';
let data = new SlashCommandBuilder()
    .setName("about")
    .setDescription("Shows information about the bot.")
let execute = (async(interaction) => {
    showMainEmbed(interaction);
});

export { category, data, execute };