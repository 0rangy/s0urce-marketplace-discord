const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { socket } = require('../../index');

const playerEmbed = (player) => {

}


module.exports = {
    category: 'player',
    data: new SlashCommandBuilder()
        .setName("player")
        .setDescription("View player stats")
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the player')),
    async execute(interaction) {
        console.log(socket.connected)
        let response = await socket.emitWithAck('playerInput', {'event': 'searchToAddFriend', "searchID": interaction.options.getString('name')});
        console.log(JSON.stringify(response.data, null, 2))
        await interaction.reply('<:asdasd:1295728174289784966>');
    }
}