import { fileURLToPath } from "url";

import * as fs from 'fs';
import { io } from 'socket.io-client';
// import { token, s0urce_cookie } from './config.json'  assert { type: "json" };

let configData = JSON.parse(fs.readFileSync('./config.json'));
let token = configData.token;
let s0urce_cookie = configData.s0urce_cookie;
const socket = io(`wss://s0urce.io/`, {
	path: '/socket.io',
	reconnection: true,
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

export { socket }

socket.on('connect', ()=>{
	console.log("Connected")
	setTimeout(() => {
		socket.emit("playGame","", (dt) => {
			console.log(dt)
		})
	}, 2000)
})

socket.on("disconnect", (reason) =>{
	console.log("Disconnected: " + reason)
})

socket.on("connect_error", (err) =>{
	console.log(err)
})

socket.on("event", (event, data) => {
	if(event.event === "updateCountryWarsGraph") {
		fs.writeFileSync('./cwDailyCache.json', JSON.stringify({
			"cacheAge": Date.now()/1000,
			"countries": event.arguments[0]
		},null, 2), {
		encoding: "utf8",
		mode: 0o666
		})
	} else {
		console.log(`${event.event}: ${JSON.stringify(event.arguments, null, 2)}\n`)
	}
})
import * as path from 'path';
import { Client, Collection, Events, GatewayIntentBits, ActivityType, WebSocketManager } from 'discord.js';
import * as cwCommand from './commands/countrywars/cwtop.js';
import * as auctionCommand from './commands/marketplace/auction.js';
import * as playerCommand from './commands/player/player.js';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.commands.set(cwCommand.data.name, cwCommand);
client.commands.set(auctionCommand.data.name, auctionCommand);
client.commands.set(playerCommand.data.name, playerCommand);
console.log(JSON.stringify(cwCommand.data, null, 2))
console.log(JSON.stringify(auctionCommand.data, null, 2))
console.log(JSON.stringify(playerCommand.data, null, 2))

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		
	}
}

client.on('interactionCreate', async interaction => {
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

client.once('ready', readyClient => {
    client.user.setActivity('s0urce.io', { type: ActivityType.Playing });
	fetch("https://nandertga.ddns.net:4097/api/v2/auctions").then(res => res.json()).then((listings) => {
		fs.writeFileSync('./auctionCache.json', JSON.stringify({
				"cacheAge": Date.now()/1000,
				"auctions": listings
			},null, 2), {
			encoding: "utf8",
			mode: 0o666
		})
	}).catch( e => console.warn("API Offline, fetch failed.") );
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);