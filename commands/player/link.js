import {
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js'
import * as fs from 'fs'
import { socket } from '../../index.js'

const ErrorEmbed = (errorStr) => {
    const embed = new EmbedBuilder()
        .setTitle("Something happened!")
        .setDescription(`${errorStr}`)
        .setColor("#f50000");

    return embed;
}

export let linkingQueue = []

let checkIfLoggedIn = (id) => {
    const users = fs.readFileSync('./linkedUsers.json',
        {encoding: 'utf8', flag: 'r'});
    const userData = JSON.parse(users);
    if(id in userData) {
        return userData[id]
    } else {
        return false;
    }
}

let showLinkEmbed = async(interaction) => {
    const embed = new EmbedBuilder()
        .setTitle("Account Linking")
        .setColor('#00b0f4');
    let user = checkIfLoggedIn(interaction.user.username);
    let actionRow = new ActionRowBuilder();
    if(user){ 
        embed.setDescription(`Your account is already linked to \`${user}\`.\n-# If this is a mistake, click the button again :)`);
        let linkButton = new ButtonBuilder()
            .setCustomId("linkbutton")
            .setLabel("Link")
            .setStyle(ButtonStyle.Secondary);
        actionRow.addComponents(linkButton);
    } else {
        embed.setDescription("Link your account by pressing the button below.");
        let linkButton = new ButtonBuilder()
            .setCustomId("linkbutton")
            .setLabel("Link")
            .setStyle(ButtonStyle.Primary);
        actionRow.addComponents(linkButton);
    }
    
    try {
        const response = await interaction.editReply({ embeds: [embed], components: [actionRow], content: "" });
        const collectorFilter = i => i.user.id === interaction.user.id;
        const action = await response.awaitMessageComponent({filter: collectorFilter, time: 600_000});
        if (action.customId === 'linkbutton') {
            const modal = new ModalBuilder()
                .setCustomId('linkModal')
                .setTitle('Account Linking');
            
            const nameInput = new TextInputBuilder()
                .setCustomId('nameInput')
                .setLabel("Your in-game name")
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
            const actionRow2 = new ActionRowBuilder()
                .addComponents(nameInput);
            modal.addComponents(actionRow2);
            await action.showModal(modal);
            const filter = (interaction) => interaction.customId === 'linkModal';
            await interaction.awaitModalSubmit({ filter, time: 60_000 })
                .then(async interaction => {
                    const playerName = interaction.fields.getTextInputValue("nameInput");
                    if(String(playerName).length < 3) {
                        await interaction.reply({embeds: [ErrorEmbed("Profile name must be at least 3 characters!")], ephemeral: true})
                        return;
                    }
                    const response = await socket.emitWithAck("playerInput", {
                        'event': 'searchToAddFriend', 
                        "searchID": playerName
                    })
                    if(response.status !== "success") {
                        try {
                            await interaction.reply({embeds: [ErrorEmbed("Couldn't fetch player! Does this player exist?")], ephemeral: true})
                        } catch(err) {
                            console.error(err)
                            await interaction.editReply({embeds: [ErrorEmbed("Couldn't fetch player! Does this player exist?")], ephemeral: true})
                        }
                        return;
                    }
                    const playerData = response['data'];
                    if(!playerData.online){
                        try {
                            await interaction.reply({embeds: [ErrorEmbed("This player isn't online.")], ephemeral: true})
                        } catch(err) {
                            console.error(err)
                            await interaction.editReply({embeds: [ErrorEmbed("This player isn't online.")], ephemeral: true})
                        }
                        return;
                    }
                    socket.emit("playerInput", {
                        "event": "sendChatMessage",
                        "id": playerData.id,
                        "username": playerData.username,
                        "message": "Hello! Time to finish linking your account to s0urce statistics. Send back the username of your Discord profile to link your account.\n"
                    });
                    
                    const embed2 = new EmbedBuilder()
                        .setTitle('Account Linking')
                        .setDescription(`The account \`${playerData.username}\` has received a message in-game. Follow the instructions to finish linking your account`)
                        .setColor("#00b0f4");
                    linkingQueue.push({"dId": interaction.user.username, "sName": playerData.username, "sId": playerData.id})
                    console.log(linkingQueue)
                    interaction.reply({embeds: [embed2], ephemeral: true});
                })
                .catch(console.error);
        }
    } catch(err) {
        console.log(err)
    }
}

let category = 'player';
let data = new SlashCommandBuilder()
    .setName('link')
    .setDescription('Link your game account to the bot')

let execute = (async(interaction) => {
    await interaction.deferReply();
    await showLinkEmbed(interaction)
});

export { category, data, execute, checkIfLoggedIn }