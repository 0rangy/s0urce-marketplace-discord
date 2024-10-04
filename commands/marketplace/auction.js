const { SlashCommandBuilder } = require('discord.js');
const { execute } = require('../util/reload');

module.exports = {
	category: 'util',
    data: new SlashCommandBuilder()
        .setName("auction"),
    async execute(interaction){

    }
}