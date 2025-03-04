import { REST, Routes } from 'discord.js';
import * as fs from 'fs';
let configData = JSON.parse(fs.readFileSync('./config.json'));
let clientId = configData.clientId;
let devGuildId = configData.devGuildId;
let token = configData.token;





const commands = [ // Have to fill this manually because of ESM  complications :p
	{
		"options": [
		  {
			"type": 1,
			"name": "today",
			"description": "View daily CW Scores",
			"options": [],
			"integration_types": [0, 1],
			"contexts": [0, 1, 2]
		  },
		  {
			"type": 1,
			"name": "season",
			"description": "View CW seasonal leaderboards",
			"options": [],
			"integration_types": [0, 1],
			"contexts": [0, 1, 2]
		  },
		  {
			"type": 1,
			"name": "players",
			"description": "View CW top players",
			"options": [],
			"integration_types": [0, 1],
			"contexts": [0, 1, 2]
		  }
		],
		"name": "cwtop",
		"description": "Daily wars leaderboards",
		"type": 1,
		"integration_types": [0, 1],
		"contexts": [0, 1, 2]
	  },
	  {
		"options": [
		  {
			"type": 1,
			"name": "listings",
			"description": "Get all available auctions",
			"options": [],
			"integration_types": [0, 1],
			"contexts": [0, 1, 2]
		  }
		],
		"name": "auction",
		"description": "Everything for auctions",
		"type": 1,
		"integration_types": [0, 1],
		"contexts": [0, 1, 2]
	  },
	  {
		"options": [
		  {
			"type": 3,
			"name": "name",
			"description": "The name of the player",
			"required": true
		  }
		],
		"name": "player",
		"description": "View player stats",
		"type": 1,
		"integration_types": [0, 1],
		"contexts": [0, 1, 2]
	  },
	  {
		"options": [
		  {
			"type": 1,
			"name": "bitcoin",
			"description": "View the bitcoin leaderboard",
			"options": [],
			"integration_types": [0, 1],
			"contexts": [0, 1, 2]
		  },
		  {
			"type": 1,
			"name": "level",
			"description": "View the level leaderboard",
			"options": [],
			"integration_types": [0, 1],
			"contexts": [0, 1, 2]
		  }
		],
		"name": "leaderboard",
		"description": "View different in-game leaderboards",
		"type": 1,
		"integration_types": [0, 1],
		"contexts": [0, 1, 2]
	  },
	  {
		"options": [],
		"name": "changelog",
		"description": "View changelogs of this bot",
		"type": 1,
		"integration_types": [0, 1],
		"contexts": [0, 1, 2]
	  },
	{
		"options": [],
		"name": "challenges",
		"description": "Everything challenge related!",
		"type": 1,
		"integration_types": [0, 1],
		"contexts": [0, 1, 2]
	},
	{
		"options": [],
		"name": "about",
		"description": "Shows information about the bot.",
		"type": 1,
		"integration_types": [0, 1],
		"contexts": [0, 1, 2]
	}
];


// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
	// try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	// } catch (error) {
	// 	console.error(error);
	// }
})();