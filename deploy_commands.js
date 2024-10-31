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
			"options": []
		  },
		  {
			"type": 1,
			"name": "season",
			"description": "View CW seasonal leaderboards",
			"options": []
		  },
		  {
			"type": 1,
			"name": "players",
			"description": "View CW top players",
			"options": []
		  }
		],
		"name": "cwtop",
		"description": "Daily wars leaderboards",
		"type": 1
	  },
	  {
		"options": [
		  {
			"type": 1,
			"name": "listings",
			"description": "Get all available auctions",
			"options": []
		  }
		],
		"name": "auction",
		"description": "Everything for auctions",
		"type": 1
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
		"type": 1
	  },
	  {
		"options": [
		  {
			"type": 3,
			"name": "command",
			"description": "The command to reload.",
			"required": true
		  }
		],
		"name": "reload",
		"description": "Reloads a command.",
		"type": 1
	  },
	  {
		"options": [
		  {
			"type": 1,
			"name": "bitcoin",
			"description": "View the bitcoin leaderboard",
			"options": []
		  },
		  {
			"type": 1,
			"name": "level",
			"description": "View the level leaderboard",
			"options": []
		  }
		],
		"name": "leaderboard",
		"description": "View different in-game leaderboards",
		"type": 1
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
			Routes.applicationGuildCommands(clientId, devGuildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	// } catch (error) {
	// And of course, make sure you catch and log any errors!
	// 	console.error(error);
	// }
})();