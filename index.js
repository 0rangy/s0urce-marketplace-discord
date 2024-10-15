const fs = require('node:fs');
const { io } = require('socket.io-client')
const { token, s0urce_cookie } = require('./config.json');

const socket = io(`wss://s0urce.io/`, {
	path: '/socket.io',
	reconnection: false,
	rejectUnauthorized: false,
	transports: ["websocket"],
	transportOptions: {
        polling: {
            extraHeaders: {
                'Cookie': s0urce_cookie
            }
        },
		websocket: {
			extraHeaders: {
                'Cookie': s0urce_cookie
            }
		}
    }
});

exports.socket = socket;

socket.on('connect', ()=>{
	console.log("Connected")
	setTimeout(() => {
		socket.emit("playGame","", (dt) => {
			console.log(dt)
		})
	}, 2000)
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
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ActivityType, WebSocketManager } = require('discord.js');


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