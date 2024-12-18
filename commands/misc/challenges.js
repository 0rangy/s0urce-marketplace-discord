import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle, ActionRow
} from 'discord.js';
import fs from "fs";
import { Emojis } from '../../index.js'
import { checkIfLoggedIn } from "../player/link.js"


let getPlayerPosition = (cId, sName) => {
    const leaderboard = getLeaderboard(cId);
    let pos = 0;
    for(let player of leaderboard){ 
        pos++;
        if(player.playerName === sName){ 
            break;
        }
    }
    return pos;
}
let getLeaderboard = (cId) => {
    const data = fs.readFileSync('./challenges.json',
        { encoding: 'utf8', flag: 'r' });
    let dataParsed = JSON.parse(data);
    let challengeJson = dataParsed['challenges'][cId];
    let leaderboard = []
    for(let participant in challengeJson['participants']){ 
        leaderboard.push({player: challengeJson['participants'][participant], "playerName": participant});
    }
    console.log(leaderboard);
    leaderboard.sort((a, b) => 
        challengeJson['better'] === 'h' ? a.player[challengeJson['lbStat']] - b.player[challengeJson['lbStat']] : b.player[challengeJson['lbStat']] - a.player[challengeJson['lbStat']]
    )
    console.log(leaderboard);
    return leaderboard;
}

let getPlayerPB = (cId, sName) => {
    const data = fs.readFileSync('./challenges.json',
        { encoding: 'utf8', flag: 'r' });
    let dataParsed = JSON.parse(data);
    return dataParsed['challenges'][cId]['participants'][sName]['personalBest'];
}
let updatePlayerPB = (cId, sName, pb) => {
    const data = fs.readFileSync('./challenges.json',
        { encoding: 'utf8', flag: 'r' });
    let dataParsed = JSON.parse(data);
    dataParsed['challenges'][cId]['participants'][sName]['personalBest'] = pb;
    fs.writeFileSync("./challenges.json", JSON.stringify(dataParsed, null, 2));
}

let removeParticipant = (cId, sName) => {
    const data = fs.readFileSync('./challenges.json',
        { encoding: 'utf8', flag: 'r' });
    let dataParsed = JSON.parse(data);
    delete dataParsed['challenges'][cId]['participants'][sName];
    fs.writeFileSync("./challenges.json", JSON.stringify(dataParsed, null, 2));
}
let addParticipant = (cId, sName) => {
    const data = fs.readFileSync('./challenges.json',
        { encoding: 'utf8', flag: 'r' });
    let dataParsed = JSON.parse(data);
    dataParsed['challenges'][cId]['participants'][sName] = JSON.parse(`{"${dataParsed['challenges'][cId]['lbStat']}": ${dataParsed['challenges'][cId]['startingValue']}}`);
    fs.writeFileSync("./challenges.json", JSON.stringify(dataParsed, null, 2));
}
let isParticipating = (cId, sId) => {
    const data = fs.readFileSync('./challenges.json',
        { encoding: 'utf8', flag: 'r' });
    let dataParsed = JSON.parse(data);
    let challengeJson = dataParsed['challenges'][cId];
    for(let playerId in challengeJson.participants) {
        if(playerId === sId){
            return challengeJson.participants[playerId];
        }
    }
    return false;
}

function camelCaseToWords(input) {
    // Split the string at each uppercase letter and preserve the letter
    const words = input.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Capitalize the first letter of each word and make the rest lowercase
    const formattedWords = words
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    return formattedWords;
}

let showLeaderboardEmbed = async(cId, interaction) => {
    const data = fs.readFileSync('./challenges.json',
        { encoding: 'utf8', flag: 'r' });
    let dataParsed = JSON.parse(data);
    let challengeJson = dataParsed['challenges'][cId];
    
    let author = interaction.client.users.cache.get(challengeJson.author);
    
    const embed = new EmbedBuilder()
        .setAuthor({
            name: `${challengeJson.official ? interaction.client.user.displayName : author.displayName}`,
        })
        .setTitle(`${challengeJson.name} Leaderboard`)
        .setColor("#00b0f4")
        .setThumbnail(author.displayAvatarURL());
    if(challengeJson.official){
        embed.setThumbnail(interaction.client.user.displayAvatarURL());
    }

    const leaderboard = getLeaderboard(cId);
    let maxLength = 0;
    for(let player of leaderboard){
        if(String(player.playerName).length > maxLength){
            maxLength = String(player.playerName).length;
        }
    }
    
    const lStr = []
    for(let player of leaderboard) {
        lStr.push(`\`${player.playerName}: ${" ".repeat(maxLength - String(player.playerName).length)}${player.player[challengeJson.lbStat]}\``);
    }
    const lStrReal = lStr.join('\n');
    
    if(!(lStrReal.length >= 1)) {
        embed.setDescription("No one's here! Why don't you be the first?");
    } else {
        embed.setDescription(lStrReal);
    }
    
    const backButton = new ButtonBuilder()
        .setCustomId('backButton')
        .setLabel('Back')
        .setEmoji('⬅️')
        .setStyle(ButtonStyle.Primary);
    const aRow = new ActionRowBuilder().addComponents(backButton)
    
    const response = await interaction.editReply({embeds: [embed], components: [aRow]});
    const collectorFilter = i => i.user.id === interaction.user.id;
    
    try {
        const action = await response.awaitMessageComponent({filter: collectorFilter, time: 600_000});
        if (action.customId === 'backButton') {
            await showChallengeEmbed(interaction, cId, action)
        }
    } catch(error) {
        console.log(error)
    }
}
let showChallengeEmbed = async (interaction, id, action) => {
    const data = fs.readFileSync('./challenges.json',
        { encoding: 'utf8', flag: 'r' });
    let dataParsed = JSON.parse(data);
    let challengeJson = dataParsed['challenges'][id];

    let participantsNum = 0;
    for(let participant in challengeJson.participants){
        participantsNum++;
    }
    
    let author = await interaction.client.users.fetch(challengeJson.author);
    
    const embed = new EmbedBuilder()
        .setAuthor({
            name: `${challengeJson.official ? interaction.client.user.displayName : author.displayName}`,
        })
        .setTitle(`${challengeJson.name}`)
        .setDescription(`${challengeJson.description}`)
        .addFields(
            {
                name: "Participants",
                value: `${participantsNum}`,
                inline: true
            },
            {
                name: "Prize",
                value: `${challengeJson.prize}`,
                inline: true
            },
        )
        .setColor("#00b0f4")
        .setThumbnail(author.displayAvatarURL());
    if(challengeJson.official){
        embed.setThumbnail(interaction.client.user.displayAvatarURL());
    }
    const userLoggedIn = checkIfLoggedIn(interaction.user.username);

    const select = new StringSelectMenuBuilder()
        .setCustomId('challengeSelect')
        .setPlaceholder('Select a challenge here!')

    for(let challenge in dataParsed.challenges){
        let challengeJson = dataParsed['challenges'][challenge];
        const chalOption = new StringSelectMenuOptionBuilder()
                .setLabel(challengeJson.name)
                .setDescription(challengeJson.embedDescription)
                .setValue(challenge);
        if(challenge === id)
            chalOption.setDefault(true);
        select.addOptions(chalOption);
    }
    
    const participateBtn = new ButtonBuilder()
        .setCustomId('participateBtn')
        .setLabel('Participate')
        .setEmoji("🖐️")
        .setStyle(ButtonStyle.Primary);

    const participantsBtn = new ButtonBuilder()
        .setCustomId('participantsBtn')
        .setLabel('Leaderboard')
        .setEmoji('👯')
        .setStyle(ButtonStyle.Primary);
    const backOutBtn = new ButtonBuilder()
        .setCustomId('backOutBtn')
        .setLabel('Back Out')
        .setEmoji('🇽')
        .setStyle(ButtonStyle.Danger);
    let response;
    if(!userLoggedIn){
        embed.addFields({
            name: "Your account isn't linked!",
            value: `Link your Discord account using \`/link\` to parcitipate.`
        });
        participateBtn.setDisabled(true);
        const selRow = new ActionRowBuilder()
            .addComponents(select);
        const row = new ActionRowBuilder()
            .addComponents(participantsBtn, participateBtn);
        response = await action.update({ embeds: [embed], content: "", components: [selRow, row] });
    } else {
        if(isParticipating(id, userLoggedIn)) {
            embed.addFields({
                    name: "Your Stats",
                    value: ` `
                }
            );
            for(let stat in challengeJson['participants'][userLoggedIn]){
                embed.addFields({
                        name: camelCaseToWords(stat),
                        value: `${challengeJson['participants'][userLoggedIn][stat]}`
                    }
                );
            }
        } else {
            embed.addFields({
                    name: "Not Participating",
                    value: `Participate to see your stats`
                }
            );
        }
        if(isParticipating(id, userLoggedIn)) {
            const selRow = new ActionRowBuilder()
                .addComponents(select);
            const row = new ActionRowBuilder()
                .addComponents(participantsBtn, backOutBtn);
            response = await action.update({ embeds: [embed], content: "", components: [selRow, row] });
        } else {
            const selRow = new ActionRowBuilder()
                .addComponents(select);
            const row = new ActionRowBuilder()
                .addComponents(participantsBtn, participateBtn);
            response = await action.update({ embeds: [embed], content: "", components: [selRow, row] });
        }
    }
    const collectorFilter = i => i.user.id === interaction.user.id;
    try {
        const action = await response.awaitMessageComponent({ filter: collectorFilter, time: 600_000 });
        if(action.customId === 'challengeSelect') {
            let challengeId = action.values[0];
            await showChallengeEmbed(interaction, challengeId, action);
        } else if(action.customId === 'participateBtn'){
            addParticipant(id, userLoggedIn);
            await action.reply({embeds:[
                new EmbedBuilder()
                    .setTitle('Success!')
                    .setDescription("You can now participate in this challenge!")
                    .setColor('#00b0f4')
                ], ephemeral: true});
        } else if(action.customId === 'backOutBtn'){
            const modal = new ModalBuilder()
                .setCustomId('confirmBackout')
                .setTitle('Are you sure?');
            const nameIn = new TextInputBuilder()
                .setCustomId('nameInput')
                .setLabel("Enter your in-game name to confirm.")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
            const row2 = new ActionRowBuilder().addComponents(nameIn);
            modal.addComponents(row2);
            await action.showModal(modal);
            const filter = (interaction) => interaction.customId === 'confirmBackout';
            await interaction.awaitModalSubmit({ filter, time: 60_000 })
                .then(async interaction => {
                    const playerName = interaction.fields.getTextInputValue("nameInput");
                    if(playerName !== userLoggedIn) {
                        await interaction.reply({embeds: [new EmbedBuilder()
                                .setTitle('Back Out')
                                .setDescription("You didn't type your name right.")
                                .setColor('#00b0f4')
                            ], ephemeral: true});
                    } else {
                        removeParticipant(id, userLoggedIn);
                        await interaction.reply({embeds: [new EmbedBuilder()
                                .setTitle('Back Out')
                                .setDescription(`You are no longer participating in ${challengeJson.name}.`)
                                .setColor('#00b0f4')
                            ], ephemeral: true});
                    }
                })
        } else if(action.customId === 'participantsBtn'){
            await showLeaderboardEmbed(id, interaction);
        }
    } catch(e) {
        console.log(e)
    }
}

const showMainEmbed = async (interaction) => {
    const embed = new EmbedBuilder()
        .setTitle("Challenges")
        .setDescription(`Here you can find a list of user made challenges that have some kind of reward. These challenges can go from easy to borderline impossible, with difficulty indicators matching the rarities in game. (${Emojis.RARITY_D} to ${Emojis.RARITY_SSS})

-# This system currently isn't as customizable as I would like, hopefully one day people will be able to add challenges in a single command.`)
        .setColor('#00b0f4');

    const select = new StringSelectMenuBuilder()
        .setCustomId('challengeSelect')
        .setPlaceholder('Select a challenge here!')

    const data = fs.readFileSync('./challenges.json',
        { encoding: 'utf8', flag: 'r' });
    let dataParsed = JSON.parse(data);
    let chalAmt = 0;
    for(let challenge in dataParsed.challenges){
        chalAmt++;
        let challengeJson = dataParsed['challenges'][challenge];
        select.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(challengeJson.name)
                .setDescription(challengeJson.embedDescription)
                .setValue(challenge),
        );
    }

    embed.addFields({
        name: "Challenges",
        value: String(chalAmt),
        inline: true
    });
    
    const actionRow = new ActionRowBuilder()
        .addComponents(select);
    const collectorFilter = i => i.user.id === interaction.user.id;
    const response = await interaction.editReply({ embeds: [embed], content: "", components: [actionRow] });
    try {
        const action = await response.awaitMessageComponent({ filter: collectorFilter, time: 600_000 });
        if(action.customId === 'challengeSelect') {
            let challengeId = action.values[0];
            await showChallengeEmbed(interaction, challengeId, action);
        }
    } catch(e) {
        console.log(e)
    }
    
}

let category = 'misc';
let data = new SlashCommandBuilder()
    .setName("challenges")
    .setDescription("Everything challenge related!")
let execute = (async(interaction) => {
    await interaction.deferReply();
    await showMainEmbed(interaction);
});

export { category, data, execute, isParticipating, getPlayerPB, updatePlayerPB, getLeaderboard, getPlayerPosition };