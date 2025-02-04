// A Simple 'keep-alive' server to bypass "waaah your code wasnt running for an hourrr"
import http from 'http';

const hostname = '0.0.0.0';
const port = 80;

const Emojis = {
	ARROW_LEFT: "<:arrowleft:1328439777917276170>",
	ARROW_RIGHT: "<:arrowright:1328439721185116170>",
	EMPTY: "<:empty:1305677963768893500>",
	BTC: "<:btc:1305563860702462002>",
	COUNTRYWARS: "<:countrywars:1305567532169695293>",
	ONLINE: "<:online:1305568459362533496>",
	PREMIUM: "<:premium:1305568501867741255>",
	RARITY_A: "<:a1:1305567324400783361><:a2:1305567346504630334><:a3:1305567365752164454>",
	RARITY_B: "<:b1:1305567419020083210><:b2:1305567433209282671><:b3:1305567448061448292>",
	RARITY_C: "<:c1:1305567486191603853><:c2:1305567501714985000><:c3:1305567515694469141>",
	RARITY_D: "<:d1:1305568207549235391><:d2:1305568223932186725><:d3:1305568248242372628>",
	RARITY_S: "<:s1:1305568521828438068><:s2:1305568538920095764><:s3:1305568559015137361>",
	RARITY_SS: "<:ss1:1305568613826301975><:ss2:1305568635418316911><:ss3:1305568658709282828>",
	RARITY_SSS: "<:sss1:1305568679617892463><:sss2:1305568696994889730><:sss3:1305568717177880619>",
	RANK_BRONZE: "<:bronze:1305567465446834258>",
	RANK_DIAMOND: "<:diamond:1305568276356661269>",
	RANK_GOLD: "<:gold:1305568294564003850>",
	RANK_GRANDMASTER: "<:grandmaster:1305568311823700050>",
	RANK_MASTER: "<:master:1305568382988320818>",
	RANK_PLATINUM: "<:platinum:1305568479507906571>",
	RANK_SILVER: "<:silver:1305568586298822676>",
	STAFF_NONE: "<:empty:1305677963768893500><:empty:1305677963768893500>",
	ADMIN: "<:admin1:1305567388095479829><:admin2:1305567403463147612>",
	JMOD: "<:jmod1:1305568335785627708><:jmod2:1305568361068892275>",
	MOD: "<:mod1:1305568404123684914><:mod2:1305568426122547231>"
}

export { Emojis }

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Nothing to see here! Maybe one day this will be something. Who knows?');
});

// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });

import * as fs from 'fs';
import { io } from 'socket.io-client';

let properLog = (msg) => {
	let d = new Date();

	let datestring = d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " " +
		d.getHours() + ":" + (d.getMinutes() > 9 ? d.getMinutes() : `0${d.getMinutes()}`);
	fs.appendFile('logs.txt', `[${datestring}]: ${msg}\n`, (err) => {
		 if(err) console.log(err);
	})
}

let configData = JSON.parse(fs.readFileSync('./config.json'));
let token = configData.token;
let s0urce_cookie = configData.s0urce_cookie;
let repoToken = configData.repoAccessToken;

let socket;

let refreshingSession = false;

let refreshSession = async() => {
	refreshingSession = true;
	console.log("Refreshing session...")
	await fetch('https://s0urce.io', {
		headers: {
			Cookie: s0urce_cookie,
			cookie: s0urce_cookie
		}
	})
	socket.emit('playerInput', {'event': 'claimFilamentLoot'})
	socket.emit('playerInput', {'event': 'shredComponentLoot'})
	setTimeout(() => {
		refreshSession();
	}, 60 * 60 * 1000)
}

import { linkingQueue, dCheckIfLoggedIn } from "./commands/player/link.js"
import { isParticipating, getPlayerPB, updatePlayerPB, getLeaderboard, getPlayerPosition } from "./commands/misc/challenges.js"

const properRound = (num) => {
	return Math.round((num + Number.EPSILON) * 1000) / 1000
}

let playerPortDict = {};
let startSocket = () => {
	socket = io(`wss://s0urce.io/`, {
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
	
	
	
	
	socket.on('connect', ()=>{
		console.log("Connected")
		setTimeout(() => {
			socket.emit("playGame","", (dt) => {
				console.log(dt)
				
				if(dt.status === 'success') {
					properLog("[SOCKET LOG] Connection successful!");
					if(!refreshingSession) refreshSession();
					socket.emit("playerInput", {
						"event": "joinGlobalChat",
						"join": true
					})
				} else if(dt.status === 'error') {
					properLog("[SOCKET LOG] Connection failed! Retrying in 30 seconds...");
					console.log("Connection failed! Retrying in 30 seconds..");
					socket.disconnect();
					setTimeout(() => {
						console.log("Retrying...")
						startSocket();
						 // Retry connection after 30 seconds
					}, 30000);
				}
			})
		}, 10000)
	})
	
	socket.on("disconnect", (reason) =>{
		console.log("Disconnected: " + reason);
		properLog("[SOCKET LOG] Disconnected: " + reason);
	})
	
	socket.on("connect_error", (err) =>{
		console.log(err)
	})
	
	
	let eventLogBlacklist = ["gotGlobalRoomLogs", "countryWarsProgress", "updateCountryWarsGraph", "initPlayer", "gotGlobalRoomMessage"] // NO LOGGING POINTLESS SHIT
	socket.on("event", (event, data) => {
		if(!eventLogBlacklist.includes(event.event)) console.log(`${event.event}: ${JSON.stringify(event.arguments, null, 2)}\n`)
		if(event.event === "updateCountryWarsGraph") {
			fs.writeFileSync('./cwDailyCache.json', JSON.stringify({
				"cacheAge": Date.now() / 1000,
				"countries": event.arguments[0]
			}, null, 2), {
				encoding: "utf8",
				mode: 0o666
			})
		}else if(event.event === 'gotHackMessage'){
			const eventData = event.arguments[0]
			properLog(`[HACKING LOG] Got hack message '${eventData.message}' from ${eventData.username}`)
		} else if(event.event === 'gotGlobalRoomMessage') {
			const message = event.arguments[0].content;
			const isSystem = event.arguments[0].system;
			if(!isSystem){
				const sender = event.arguments[0].sender;
				// properLog(`[CHAT LOG] ${sender.username} (${sender.authenticated ? 'Authenticated' : 'Unauthenticated'}): ${message}`)
			}
		} else if(event.event === 'gotChatMessage'){
			const message = event.arguments[0].message;
			const username = event.arguments[0].username;
			properLog(`[MESSAGE LOG] Received message from ${username}: ${message}`)
			if(username === "Orangy") {
				const eventMsg = message.split("|");
				console.log(eventMsg[0]);
				socket.emit(eventMsg[0], JSON.parse(eventMsg[1]));
			}
			for(let linkingUser of linkingQueue) {
				if(linkingUser.sName === username) {
					if(message === linkingUser.dId){
						socket.emit('playerInput', {
							"event": "sendChatMessage",
							"id": linkingUser.sId,
							"username": linkingUser.sName,
							"message": "Linked successfully! You can use challenge features now."
						});
						linkingQueue.splice(linkingQueue.indexOf(linkingUser), 1);
						console.log(linkingQueue)
						let linkedUsers = JSON.parse(fs.readFileSync("./linkedUsers.json").toString());
						linkedUsers[linkingUser.dId] = linkingUser.sName;
						fs.writeFileSync("./linkedUsers.json", JSON.stringify(linkedUsers));
					} else {
						socket.emit('playerInput', {
							"event": "sendChatMessage",
							"id": linkingUser.sId,
							"username": linkingUser.sName,
							"message": "ID doesn't match!"
						});
					}
				}
			}
		} else if(event.event === 'logEnemyAttack') {
			const eventData = event.arguments[0]
			playerPortDict[eventData.attacker] = eventData.port;
			if(eventData.progression !== 100) return;
			if(!isParticipating("speedyHacker", eventData.attacker)) return;
			console.log(JSON.stringify(playerPortDict, null, 2));
		} else if(event.event === 'gotHacked') {
			console.log(JSON.stringify(playerPortDict, null, 2));
			const eventData = event.arguments[1]
			const wordsAmt = Array(eventData.wps_info)[0].length;
			const WP2M = (wordsAmt/eventData.total_hack_duration) * 120;
			const hackedPort = playerPortDict[eventData.attacker];
			properLog(`[HACKING LOG] Got hacked on port ${hackedPort+21} by ${eventData.attacker} in ${WP2M} WP2M.`)
			if(!isParticipating(hackedPort === 1 ? 'speedyHacker' : 'speedyHackerEasier', eventData.attacker)) return;
			if(hackedPort === 2) return;
			for(let word of eventData.wps_info) {
				if(word.success !== true) {
					socket.emit('playerInput', {
						"event": "sendChatMessage",
						"id": eventData.id,
						"username": eventData.attacker,
						"message": `Wow impressive, but you failed a word. Doesn't count.`
					});
					return;
				}
			}
			socket.emit('playerInput', {
				"event": "sendChatMessage",
				"id": eventData.id,
				"username": eventData.attacker,
				"message": `You hacked me in ${wordsAmt} words and ${eventData.total_hack_duration} seconds! That's ${properRound(WP2M)} words per 2 minutes.`
			});
			const oldPb = getPlayerPB(hackedPort === 1 ? 'speedyHacker' : 'speedyHackerEasier', eventData.attacker);
			if(oldPb < WP2M){
				updatePlayerPB(hackedPort === 1 ? 'speedyHacker' : 'speedyHackerEasier', eventData.attacker, properRound(WP2M));
				let posText;
				let pos = getPlayerPosition(hackedPort === 1 ? 'speedyHacker' : 'speedyHackerEasier', eventData.attacker);
				if (pos == 3 || (pos > 20 && pos % 10 == 3)) posText = pos+"rd";
				else if (pos == 2 || (pos > 20 && pos % 10 == 2)) posText = pos+"nd";
				else if (pos == 1 || (pos > 20 && pos % 10 == 1)) posText = pos+"st";
				else posText = pos+"th";
				socket.emit('playerInput', {
					"event": "sendChatMessage",
					"id": eventData.id,
					"username": eventData.attacker,
					"message": `New PB in ${hackedPort === 1 ? 'Speedy Hacker Ethereal' : 'Speedy Hacker Legendary'}! ${properRound(oldPb)} -> ${properRound(WP2M)}. You are now ${posText}!`
				});
				properLog(`[CHALLENGES] New PB by ${eventData.attacker}! (${WP2M})`)
			} else {
				socket.emit('playerInput', {
					"event": "sendChatMessage",
					"id": eventData.id,
					"username": eventData.attacker,
					"message": `Yikes! That didn't beat your PB of ${properRound(oldPb)} in ${hackedPort === 1 ? 'Speedy Hacker Ethereal' : 'Speedy Hacker Legendary'}.`
				});
			}
		} else if(event.event === 'rareItemAnnouncement') {
			const eventData = event.arguments[0]
			const eventItem = eventData.item;
			properLog(`[RARE DROP] User ${eventData.username} dropped ${eventItem.rarity} #${eventItem.mint} ${eventItem.type === 'avatar' ? eventItem.name : String(eventItem.type).toUpperCase()} ${eventItem.type === 'avatar' ? '' : `(${eventItem.name})`}`)
		}
	})
};

export { socket }

startSocket();

import axios from 'axios';
import { Client, Collection, Events, GatewayIntentBits, ActivityType, WebSocketManager } from 'discord.js';
import * as cwCommand from './commands/countrywars/cwtop.js';
import * as auctionCommand from './commands/marketplace/auction.js';
import * as playerCommand from './commands/player/player.js';
import * as reloadCommand from './commands/util/reload.js';
import * as lbCommand from './commands/player/leaderboard.js';
import * as changelogCommand from './commands/util/changelog.js';
import * as challengeCommand from './commands/misc/challenges.js';
import * as linkCommand from './commands/player/link.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();
client.commands.set(cwCommand.data.name, cwCommand);
client.commands.set(auctionCommand.data.name, auctionCommand);
client.commands.set(playerCommand.data.name, playerCommand);
client.commands.set(changelogCommand.data.name, changelogCommand); // Broken :/
client.commands.set(challengeCommand.data.name, challengeCommand);
if(String(token).includes('Ub37IY')) {
	client.commands.set(reloadCommand.data.name, reloadCommand); // Only include reload command if code is running on DebugBot
}
client.commands.set(lbCommand.data.name, lbCommand);
client.commands.set(linkCommand.data.name, linkCommand);


// console.log(JSON.stringify(cwCommand.data, null, 2))
// console.log(JSON.stringify(auctionCommand.data, null, 2))
// console.log(JSON.stringify(playerCommand.data, null, 2))
// console.log(JSON.stringify(reloadCommand.data, null, 2))
// console.log(JSON.stringify(lbCommand.data, null, 2))
// console.log(JSON.stringify(changelogCommand.data, null, 2))
// console.log(JSON.stringify(challengeCommand.data, null, 2))
// console.log(JSON.stringify(linkCommand.data, null, 2))



client.on('interactionCreate', async interaction => {
	if (interaction.isChatInputCommand()) {
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
	try {
		const users = fs.readFileSync('./linkedUsers.json',
			{encoding: 'utf8', flag: 'r'});
	} catch {
		fs.writeFileSync('./linkedUsers.json',JSON.stringify({},null, 2), {
			encoding: "utf8",
			mode: 0o666
		});
	}
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
		console.log(`Something fucked with GitHub: ${err}`)
	});
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);