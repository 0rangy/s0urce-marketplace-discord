import { SlashCommandBuilder } from 'discord.js';




let category = 'util';
let data = new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('The command to reload.')
				.setRequired(true));
let execute = (async(interaction) => {
		const commandName = interaction.options.getString('command', true).toLowerCase();
		const command = interaction.client.commands.get(commandName);

		if (!command) {
			return interaction.reply(`There is no command with name \`${commandName}\`!`);
		}

		// Hopefully this isnt' THAT important :D UPDATE: It's important :(
		// Reload command doesn't work without this :((
		// delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];

		try {
	        interaction.client.commands.delete(command.data.name);
	        let newCommand = await import(`../${command.category}/${command.data.name}.js`);
	        interaction.client.commands.set(newCommand.data.name, newCommand);
	        await interaction.reply(`Command \`${command.data.name}\` was reloaded!`);
		} catch (error) {
	        console.error(error);
	        await interaction.reply(`There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``);
		}
	});
	export {data, category, execute}