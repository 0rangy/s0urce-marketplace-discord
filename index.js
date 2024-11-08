// A Simple 'keep-alive' server to bypass "waaah your code wasnt running for an hourrr"
import http from 'http';

const hostname = '127.0.0.1';
const port = 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Nothing to see here! Maybe one day this will be something. Who knows?');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

import * as fs from 'fs';
import { io } from 'socket.io-client';
// import { token, s0urce_cookie } from './config.json'  assert { type: "json" };

let configData = JSON.parse(fs.readFileSync('./config.json'));
let token = configData.token;
let s0urce_cookie = configData.s0urce_cookie;
let repoToken = configData.repoAccessToken;

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

let refreshSession = (async() => {
	console.log("Refreshing session...")
	await fetch('https://s0urce.io', {
		headers: {
			Cookie: s0urce_cookie,
			cookie: s0urce_cookie
		}
	})
	setTimeout(() => {
		refreshSession();
	}, 60 * 60 * 1000)
})

socket.on('connect', ()=>{
	console.log("Connected")
	setTimeout(() => {
		socket.emit("playGame","", (dt) => {
			console.log(dt)
			if(dt.status === 'success') refreshSession()
		})
	}, 2000)
})

socket.on("disconnect", (reason) =>{
	console.log("Disconnected: " + reason)
})

socket.on("connect_error", (err) =>{
	console.log(err)
})

let eventLogBlacklist = ["gotGlobalRoomLogs", "countryWarsProgress", "initPlayer"]
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
		if(eventLogBlacklist.includes(event.event)) return;
		console.log(`${event.event}: ${JSON.stringify(event.arguments, null, 2)}\n`)
	}
})
import axios from 'axios';
import { Client, Collection, Events, GatewayIntentBits, ActivityType, WebSocketManager } from 'discord.js';
import * as cwCommand from './commands/countrywars/cwtop.js';
import * as auctionCommand from './commands/marketplace/auction.js';
import * as playerCommand from './commands/player/player.js';
import * as reloadCommand from './commands/util/reload.js';
import * as lbCommand from './commands/player/leaderboard.js';
import * as changelogCommand from './commands/util/changelog.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.commands.set(cwCommand.data.name, cwCommand);
client.commands.set(auctionCommand.data.name, auctionCommand);
client.commands.set(playerCommand.data.name, playerCommand);
client.commands.set(changelogCommand.data.name, changelogCommand);
if(String(token).includes('Ub37IY')) {
	client.commands.set(reloadCommand.data.name, reloadCommand); // Only include reload commadn if code is running on DebugBot
}
client.commands.set(lbCommand.data.name, lbCommand);


// console.log(JSON.stringify(cwCommand.data, null, 2))
// console.log(JSON.stringify(auctionCommand.data, null, 2))
// console.log(JSON.stringify(playerCommand.data, null, 2))
// console.log(JSON.stringify(reloadCommand.data, null, 2))
// console.log(JSON.stringify(lbCommand.data, null, 2))
// console.log(JSON.stringify(changelogCommand.data, null, 2))



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


function censor(censor) {
	var i = 0;
	
	return function(key, value) {
	  if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) 
		return '[Circular]'; 
	  
	  if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
		return '[Unknown]';
	  
	  ++i; // so we know we aren't using the original object anymore
	  
	  return value;  
	}
  }


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
	const response = axios.get('https://api.github.com/repos/0rangy/s0urce-marketplace-discord/commits',{
        headers:{
            'Authorization':`token ${repoToken}`
        }
    }).then( commits => {
		fs.writeFileSync('./githubCache.json', JSON.stringify({
				"cacheAge": Date.now()/1000,
				"commits": commits.data
			}, null, 2), {
			encoding: "utf8",
			mode: 0o666
		})
	}).catch( err => {
		console.log("Something fucked with GitHub!\n", err)
	});
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);