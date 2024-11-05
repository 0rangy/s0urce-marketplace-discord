import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } from 'discord.js';
import { socket, attemptSocketConection } from '../../index.js';

const properRound = (num) => {
    return Math.round((Number(num) + Number.EPSILON) * 1000) / 1000
}

const ErrorEmbed = (errorStr) => {
    const embed = new EmbedBuilder()
      .setTitle("Something happened!")
      .setDescription(`${errorStr}`)
      .setColor("#f50000");
    return embed;
}

const playerEmbed = (player) => {
    const embed = new EmbedBuilder();
    embed.setTitle(`${player.username}'s Profile`);
    let userTag = "";

    if(player.player_badge === "JMOD") {
        userTag = "<:jmod1:1297953641994391654><:jmod2:1297953643101949993>";
    } else if (player.player_badge === "MOD") {
        userTag = "<:mod1:1297979928804986942><:mod2:1297979929824067596>";
    } else if (player.player_badge === "ADMIN") {
        userTag = "<:admin1:1297939284728479795><:admin2:1297939272967651338>";
    }
    if(player.username === 'Evrixol'){
        userTag = userTag = "<:admin1:1297939284728479795><:admin2:1297939272967651338>";
    }

    let levelTag = "<:bronze:1295854402636353607>";
    if(player.level > 10) {
        levelTag = "<:silver:1295854401327464589>";
    } if(player.level > 25) {
        levelTag = "<:gold:1295854400140607559>";
    } if(player.level > 50) {
        levelTag = "<:platinum:1295854406025216051>";
    } if(player.level > 75) {
        levelTag = "<:diamond:1295854407564398674>";
    } if(player.level > 100) {
        levelTag = "<:master:1295854404699947038>";
    } if(player.level > 125) {
        levelTag = "<:grandmaster:1295854328376197212>";
    };

    let nameColor = "Default";
    try {
        nameColor = String(player.nameColor.name).split("Color")[1].trim();
    } catch {
        nameColor = "Default";
    };
    
    let bgColor = "Default";
    try {
        bgColor = String(player.namePlate.name).split("Color")[1].trim();
    } catch {
        bgColor = "Default";
    };

    


    embed.setDescription(`\n${userTag} :flag_${String(player.countryCode).toLowerCase()}: ${player.premium ? "<:premium:1298066540540723250>" : ''} ${levelTag} Level ${player.level} ${player.online ? '<:online:1298066024507248703>' : ''}`);
    embed.addFields(
    {
        name: "Balance",
        value: `<:btc:1295855267312963758> ${properRound(player.btc)}⠀⠀⠀⠀⠀`,
        inline: true
    },
    {
        name: "Name Color",
        value: nameColor,
        inline: true
    },
    {
        name: "Nameplate",
        value: bgColor,
        inline: true
    },
    {
        name: "Profile Description",
        value: player.quote + " ",
        inline: false
    },
    );
    if(player.avatar !== null){
        embed.setThumbnail(`https://s0urce.io/items/${player.avatar.icon}`);
    }
    embed.setColor("#00b0f4");

    return embed;
}

const getRarityEmojiString = (rarity) => {
    let emojiString = ''
    if(rarity === ('d' || 'common')) {
        emojiString = '<:d1:1298104350035415055><:d2:1298104358512361533><:d3:1298104359909064785>'
    } else if(rarity === ('c' || 'uncommon')) { // Uncommon
        emojiString = '<:c1:1298072932668538942><:c2:1298072934136414320><:c3:1298072935076069489>'
    } else if(rarity === ('b' || 'rare')) { // Rare
        emojiString = '<:b1:1298072388747001876><:b2:1298072390152093727><:b3:1298072391326502912>'
    } else if(rarity === ('a' || 'epic')) { // Epic
        emojiString = '<:a1:1298104729208881172><:a2:1298104730257592371><:a3:1298104731457163405>'
    } else if(rarity === ('s' || 'legendary')) { // Legendary
        emojiString = '<:s1:1298070710513565737><:s2:1298070711495032913><:s3:1298070712933810227>'
    } else if(rarity === ('ss' || 'mythic')) { // Mythic
        emojiString = '<:ss1:1298105245234364526><:ss2:1298105246387671050><:ss3:1298105247293509633>'
    } else if(rarity === ('sss' || 'ethereal')) { // Ethereal
        emojiString = '<:sss1:1298105607873626256><:sss2:1298105609022865479><:sss3:1298105610100801689>'
    } 
    return emojiString;
}

import { itemTodPM, apiItemToGrade, estimatePrice } from '../../utils/dTIHelper.js';

const getItemDisplayEmbed = (item) => {
    const embed = new EmbedBuilder();
    embed.setTitle("Item Viewer");
    embed.addFields(
    {
        name: "Name",
        value: `${item.name} (#${item.mint})`,
        inline: true
    });
    try {
        const percentile = itemTodPM(item)
        let percentileText;
        if (percentile == 3 || (percentile > 20 && percentile % 10 == 3)) percentileText = percentile+"rd Percentile"; 
        else if (percentile == 2 || (percentile > 20 && percentile % 10 == 2)) percentileText = percentile+"nd Percentile";
        else if (percentile == 1 || (percentile > 20 && percentile % 10 == 1)) percentileText = percentile+"st Percentile";
        else percentileText = percentile+"th Percentile";

        embed.addFields(
            {
                name: "⠀Rarity",
                value: `${getRarityEmojiString(String(item.rarity).toLowerCase())}\n⠀${percentileText}`,
                inline: true
            });
    } catch (err) {
        console.log(err);
        embed.addFields(
            {
                name: "⠀Rarity",
                value: `${getRarityEmojiString(String(item.rarity).toLowerCase())}`,
                inline: true
            });
    }
    try {
        embed.addFields(
        {
            name: "dTI",
            value: `${apiItemToGrade(item)}/10\n<:btc:1295855267312963758> ${String(estimatePrice(item))}`,
            inline: true
        })
    } catch(err) {
        // console.log(err)
        embed.addFields(
            {
                name: "dTI",
                value: "Not Available",
                inline: true
            })
    }
    embed.addFields(
    {
        name: "Descrption",
        value: `${item.description}`,
        inline: true
    },
    {
        name: "Creator",
        value: `${item.creator}`,
        inline: true
    },);
    try { // Copied straight out of auctions.js, like a lot of the shelf code :P
        for(let stat of item.stats){
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
    let fullImageDisplay = ["avatar", "namePlate", "nameColor"]
    if(fullImageDisplay.includes(item.type)) {
        embed.setImage(`https://s0urce.io/items/${item.icon}`)
    } else {
        embed.setThumbnail(`https://s0urce.io/items/${item.icon}`)
    }
    embed.setColor("#00b0f4");
    return embed;
}

async function viewShelfEmbed(interaction, data, shelfItems, response, action, slot) {
    console.log(`Shelf slot number ${slot}`)
    console.log(shelfItems)
    const goBack = new ButtonBuilder()
              .setCustomId('back')
              .setLabel(' ')
              .setEmoji('◀️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(slot === 1 ? true : false);

    const goForwards = new ButtonBuilder()
        .setCustomId('forwards')
        .setLabel(' ')
        .setEmoji('▶️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(shelfItems.length === slot ? true : false)

    const exitButton = new ButtonBuilder()
        .setCustomId('exit')
        .setLabel('Back')
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder()
        .addComponents(goBack, goForwards, exitButton);
    await action.update({ embeds: [getItemDisplayEmbed(shelfItems[slot - 1])], components: [row] })
    
    try {
        const collectorFilter = i => i.user.id === interaction.user.id;
        const newAction = await response.awaitMessageComponent({ filter: collectorFilter, time: 600_000 });
        if(newAction.customId === 'forwards') {
            await viewShelfEmbed(interaction, data, shelfItems, response, newAction, slot + 1)
        } else if(newAction.customId === 'back') {
            await viewShelfEmbed(interaction, data, shelfItems, response, newAction, slot - 1)
        } else if(newAction.customId === 'exit') {
            const embed = playerEmbed(data)

            const viewAvatar = new ButtonBuilder()
            .setCustomId('viewavatar')
            .setLabel('View Avatar')
            .setEmoji('🙍‍♂️')
            .setStyle(ButtonStyle.Primary);
            if(data.avatar === null) {
                viewAvatar.setDisabled(true)
            };
            const viewNameColor = new ButtonBuilder()
            .setCustomId('viewnamecolor')
            .setLabel('View Name Color')
            .setEmoji('🏮')
            .setStyle(ButtonStyle.Primary);
            if(data.nameColor === null) {
                viewNameColor.setDisabled(true)
            };
            const viewNamePlate = new ButtonBuilder()
            .setCustomId('viewnameplate')
            .setLabel('View Nameplate')
            .setEmoji('🪪')
            .setStyle(ButtonStyle.Primary);
            if(data.namePlate === null) {
                viewNamePlate.setDisabled(true)
            };

            const actionRowTop = new ActionRowBuilder()
                .addComponents(viewAvatar, viewNameColor, viewNamePlate);
            
            let maxShelf = data.premium ? 5 : 2;
            let occupiedShelf = 0;
            for(let key in data) {
                if(!key.startsWith('shelf_')){ continue; }
                else {
                    occupiedShelf += data[key] === null ? 0 : 1;
                }
            }

            const viewShelf = new ButtonBuilder()
            .setCustomId('viewshelf')
            .setLabel(`View Shelf (${occupiedShelf}/${maxShelf})`)
            .setEmoji('📜')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(occupiedShelf > 0 ? false : true);

            const actionRowBottom = new ActionRowBuilder()
                .addComponents(viewShelf);
            await newAction.update({ embeds: [embed], components: [actionRowTop, actionRowBottom]});

            let shelfItems2 = []
            for(let key in data) {
                if(!key.startsWith('shelf_')) continue;
                if(!data[key]) continue; 
                shelfItems2.push(data[key])
            }

            try {
                const action = await response.awaitMessageComponent({ filter: collectorFilter, time: 600_000 }); // Keep buttons active for 10 mins
                if (action.customId === 'viewavatar') {
                    const back = new ButtonBuilder()
                        .setCustomId('back')
                        .setLabel('Back')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Danger);

                    const actionRow = new ActionRowBuilder()
                        .addComponents(back);
                    action.update({ embeds: [getItemDisplayEmbed(data.avatar)], components: [actionRow]})
                    await handleBackButton(response, collectorFilter, data, interaction);
                } else if(action.customId === 'viewnameplate') {
                    const back = new ButtonBuilder()
                        .setCustomId('back')
                        .setLabel('Back')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Danger);

                    const actionRow = new ActionRowBuilder()
                        .addComponents(back);
                    action.update({ embeds: [getItemDisplayEmbed(data.namePlate)], components: [actionRow]})
                    await handleBackButton(response, collectorFilter, data, interaction);
                } else if(action.customId === 'viewnamecolor') {
                    const back = new ButtonBuilder()
                        .setCustomId('back')
                        .setLabel('Back')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Danger);

                    const actionRow = new ActionRowBuilder()
                        .addComponents(back);
                    action.update({ embeds: [getItemDisplayEmbed(data.nameColor)], components: [actionRow]})
                    await handleBackButton(response, collectorFilter, data, interaction);
                } else if(action.customId === 'viewshelf') {
                    await viewShelfEmbed(interaction, data, shelfItems2, response, action, 1)
                }
            } catch(err){
                console.error(err);
            }
        }
    } catch(err) {
        await interaction.editReply({ embeds: [ErrorEmbed(err)], components: [] })
        console.log("Interaction timed out. \n" + err)
    }
}

async function handleBackButton(response, collectorFilter, data, interaction) {
    try {
        const action = await response.awaitMessageComponent({ filter: collectorFilter, time: 600_000 }); // Keep buttons active for 10 mins
        if (action.customId === 'back') {
            const embed = playerEmbed(data)

            const viewAvatar = new ButtonBuilder()
            .setCustomId('viewavatar')
            .setLabel('View Avatar')
            .setEmoji('🙍‍♂️')
            .setStyle(ButtonStyle.Primary);
            if(data.avatar === null) {
                viewAvatar.setDisabled(true)
            };
            const viewNameColor = new ButtonBuilder()
            .setCustomId('viewnamecolor')
            .setLabel('View Name Color')
            .setEmoji('🏮')
            .setStyle(ButtonStyle.Primary);
            if(data.nameColor === null) {
                viewNameColor.setDisabled(true)
            };
            const viewNamePlate = new ButtonBuilder()
            .setCustomId('viewnameplate')
            .setLabel('View Nameplate')
            .setEmoji('🪪')
            .setStyle(ButtonStyle.Primary);
            if(data.namePlate === null) {
                viewNamePlate.setDisabled(true)
            };

            const actionRowTop = new ActionRowBuilder()
                .addComponents(viewAvatar, viewNameColor, viewNamePlate);
            
            let maxShelf = data.premium ? 5 : 2;
            let occupiedShelf = 0;
            for(let key in data) {
                if(!key.startsWith('shelf_')){ continue; }
                else {
                    occupiedShelf += data[key] === null ? 0 : 1;
                }
            }

            const viewShelf = new ButtonBuilder()
            .setCustomId('viewshelf')
            .setLabel(`View Shelf (${occupiedShelf}/${maxShelf})`)
            .setEmoji('📜')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(occupiedShelf > 0 ? false : true);

            const actionRowBottom = new ActionRowBuilder()
                .addComponents(viewShelf);
            await action.update({ embeds: [embed], components: [actionRowTop, actionRowBottom]});

            let shelfItems2 = []
            for(let key in data) {
                if(!key.startsWith('shelf_')) continue;
                if(!data[key]) continue; 
                shelfItems2.push(data[key])
            }

            try {
                const action = await response.awaitMessageComponent({ filter: collectorFilter, time: 600_000 }); // Keep buttons active for 10 mins
                if (action.customId === 'viewavatar') {
                    const back = new ButtonBuilder()
                        .setCustomId('back')
                        .setLabel('Back')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Danger);

                    const actionRow = new ActionRowBuilder()
                        .addComponents(back);
                    action.update({ embeds: [getItemDisplayEmbed(data.avatar)], components: [actionRow]})
                    await handleBackButton(response, collectorFilter, data, interaction);
                } else if(action.customId === 'viewnameplate') {
                    const back = new ButtonBuilder()
                        .setCustomId('back')
                        .setLabel('Back')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Danger);

                    const actionRow = new ActionRowBuilder()
                        .addComponents(back);
                    action.update({ embeds: [getItemDisplayEmbed(data.namePlate)], components: [actionRow]})
                    await handleBackButton(response, collectorFilter, data, interaction);
                } else if(action.customId === 'viewnamecolor') {
                    const back = new ButtonBuilder()
                        .setCustomId('back')
                        .setLabel('Back')
                        .setEmoji('⬅️')
                        .setStyle(ButtonStyle.Danger);

                    const actionRow = new ActionRowBuilder()
                        .addComponents(back);
                    action.update({ embeds: [getItemDisplayEmbed(data.nameColor)], components: [actionRow]})
                    await handleBackButton(response, collectorFilter, data, interaction);
                } else if(action.customId === 'viewshelf') {
                    await viewShelfEmbed(interaction, data, shelfItems2, response, action, 1)
                }
            } catch(err){
                console.error(err);
            }
        }
    } catch(err){ 
        interaction.editReply({ embeds: [ErrorEmbed(err)], components: [] })
        console.log("Interaction timed out. \n" + err)
    }
}

let category = 'player';
let data = new SlashCommandBuilder()
        .setName("player")
        .setDescription("View player stats")
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the player')
                .setRequired(true));
let execute = (async(interaction) => {
        if(String(interaction.options.getString('name')).length < 3) {
            await interaction.reply({embeds: [ErrorEmbed("Profile name must be at least 3 characters!")]})
            return;
        }
        interaction.deferReply()
        let response = await socket.timeout(5000).emitWithAck('playerInput', {'event': 'searchToAddFriend', "searchID": interaction.options.getString('name')}).catch(async(e) => {
            return {"status":"timeout"};
        });
        if(response.status === 'timeout') {
            await interaction.editReply({embeds: [ErrorEmbed("Disconnected from s0urce.io! Please try again later.\n\n*If this keeps happening, please report to @orangyyy.*")]});
            attemptSocketConection()
            return;
        }
        if(response.status !== "success") {
            try {
                await interaction.editReply({embeds: [ErrorEmbed("Couldn't fetch statistics! Does this player exist?")]})
            } catch(err) {
                console.error(err)
                await interaction.editReply({embeds: [ErrorEmbed("Couldn't fetch statistics! Does this player exist?")]})
            }
            return;
        }
        console.log(JSON.stringify(response, null, 2))        

        const embed = playerEmbed(response.data)

        const viewAvatar = new ButtonBuilder()
          .setCustomId('viewavatar')
          .setLabel('View Avatar')
          .setEmoji('🙍‍♂️')
          .setStyle(ButtonStyle.Primary);
        if(response.data.avatar === null) {
            viewAvatar.setDisabled(true)
        };
        const viewNameColor = new ButtonBuilder()
          .setCustomId('viewnamecolor')
          .setLabel('View Name Color')
          .setEmoji('🏮')
          .setStyle(ButtonStyle.Primary);
        if(response.data.nameColor === null) {
            viewNameColor.setDisabled(true)
        };
        const viewNamePlate = new ButtonBuilder()
          .setCustomId('viewnameplate')
          .setLabel('View Nameplate')
          .setEmoji('🪪')
          .setStyle(ButtonStyle.Primary);
        if(response.data.namePlate === null) {
            viewNamePlate.setDisabled(true)
        };

        const actionRowTop = new ActionRowBuilder()
            .addComponents(viewAvatar, viewNameColor, viewNamePlate);
        
        let maxShelf = response.data.premium ? 5 : 2;
        let occupiedShelf = 0;
        for(let key in response.data) {
            if(!key.startsWith('shelf_')) continue;
            if(!response.data[key]) continue; 
            else {
                occupiedShelf += response.data[key] === null ? 0 : 1;
            }
        }

        const viewShelf = new ButtonBuilder()
          .setCustomId('viewshelf')
          .setLabel(`View Shelf (${occupiedShelf}/${maxShelf})`)
          .setEmoji('📜')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(occupiedShelf > 0 ? false : true);

        const actionRowBottom = new ActionRowBuilder()
            .addComponents(viewShelf);
        const interactionResponse = await interaction.reply({ embeds: [embed], components: [actionRowTop, actionRowBottom]});

        let shelfItems = []
        for(let key in response.data) {
            if(!key.startsWith('shelf_')) continue;
            if(!response.data[key]) continue; 
            shelfItems.push(response.data[key])
        }
        const collectorFilter = i => i.user.id === interaction.user.id;

        try {
            const action = await interactionResponse.awaitMessageComponent({ filter: collectorFilter, time: 600_000 }); // Keep buttons active for 10 mins
            if (action.customId === 'viewavatar') {
                const back = new ButtonBuilder()
                    .setCustomId('back')
                    .setLabel('Back')
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Danger);

                const actionRow = new ActionRowBuilder()
                    .addComponents(back);
                action.update({ embeds: [getItemDisplayEmbed(response.data.avatar)], components: [actionRow]})
                await handleBackButton(interactionResponse, collectorFilter, response.data, interaction);
            } else if(action.customId === 'viewnameplate') {
                const back = new ButtonBuilder()
                    .setCustomId('back')
                    .setLabel('Back')
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Danger);

                const actionRow = new ActionRowBuilder()
                    .addComponents(back);
                action.update({ embeds: [getItemDisplayEmbed(response.data.namePlate)], components: [actionRow]})
                await handleBackButton(interactionResponse, collectorFilter, response.data, interaction);
            } else if(action.customId === 'viewnamecolor') {
                const back = new ButtonBuilder()
                    .setCustomId('back')
                    .setLabel('Back')
                    .setEmoji('⬅️')
                    .setStyle(ButtonStyle.Danger);

                const actionRow = new ActionRowBuilder()
                    .addComponents(back);
                action.update({ embeds: [getItemDisplayEmbed(response.data.nameColor)], components: [actionRow]})
                await handleBackButton(interactionResponse, collectorFilter, response.data, interaction);
            } else if(action.customId === 'viewshelf') {
                await viewShelfEmbed(interaction, response.data, shelfItems, interactionResponse, action, 1)
            }
        } catch(err){
            interaction.editReply({ embeds: [ErrorEmbed(err)], components: [] })
            console.log("Interaction timed out.")
            console.error(err)
        }
    });
    export {data, category, execute}