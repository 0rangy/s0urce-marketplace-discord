const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType, WebSocketManager } = require('discord.js');
const { token } = require('./config.json');


const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

client.once(Events.ClientReady, readyClient => {
    client.user.setActivity('s0urce.io', { type: ActivityType.Playing });
	try {
		fetch("https://nandertga.ddns.net:4097/api/v2/auctions").then(res => res.json()).then((listings) => {
			fs.writeFileSync('./auctionCache.json', JSON.stringify({
					"cacheAge": Date.now()/1000,
					"auctions": listings
				},null, 2), {
				encoding: "utf8",
				mode: 0o666
			})
		}).catch((e) => {
			console.warn("API Offline, fetch failed.")
		});
	} catch(e){
		console.warn(`Fetch failed! Is the API offline?\n${e}`)
	}
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);

const { io } = require('socket.io-client')

// Recursive update function
const updateStats = (socket) => {
	if(socket.connected) {
		console.log("Updating Information...")
		socket.emit("playerInput", {
			"event": "getCWLeaderboard",
			"sortKey": "countries"
		  }, (response) => {
			fs.writeFileSync('./cwSeasonCache.json', JSON.stringify({
				"cacheAge": Date.now()/1000,
				"countries": response.data
			},null, 2), {
			encoding: "utf8",
			mode: 0o666
			})
		  })
		  setTimeout(() =>{
			updateStats(socket);
		  }, 20000)
	}
}


fetch("https://s0urce.io/socket.io/?EIO=4&transport=polling").then((data) => data.text().then((res) =>{
	res = res.slice(1,res.length)
	let resData = JSON.parse(res)

	const socket = io(`wss://s0urce.io/`, {
		path: '/socket.io',
		reconnectionDelayMax: 10000,
		rejectUnauthorized: false,
		transports: ["websocket"],
	  });

	socket.on('connect', ()=>{
		console.log("Connected")
		socket.emit("playGame","API", (dt) => {
			console.log(dt)
		})
		updateStats(socket)
	})

	socket.on("disconnect", () =>{
		console.log("Disconnected")
	})

	socket.on("connect_error", (err) =>{
		console.log(err)
	})

	socket.on("event", (event, data) => {
		console.log(event.event)
		if(event.event === "updateCountryWarsGraph") {
			fs.writeFileSync('./cwDailyCache.json', JSON.stringify({
				"cacheAge": Date.now()/1000,
				"countries": event.arguments[0]
			},null, 2), {
			encoding: "utf8",
			mode: 0o666
			})
		}
	})

  })).catch((err) =>{
	console.error("Something went wrong with s0urce.io/socket.io")
	console.log(err)
  });