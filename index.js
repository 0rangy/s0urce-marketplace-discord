// A Simple 'keep-alive' server to bypass "waaah your code wasnt running for an hourrr"
import http from 'http';

const hostname = '0.0.0.0';
const port = 80;

const Emojis = {
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

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

import * as fs from 'fs';
import { io } from 'socket.io-client';

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
	socket.emit('playerInput', {'event': 'searchToAddFriend', "searchID": 'Orangy'})
	setTimeout(() => {
		refreshSession();
	}, 60 * 60 * 1000)
}

import { linkingQueue, dCheckIfLoggedIn } from "./commands/player/link.js"
import { isParticipating, getPlayerPB, updatePlayerPB, getLeaderboard, getPlayerPosition } from "./commands/misc/challenges.js"

const properRound = (num) => {
	return Math.round((num + Number.EPSILON) * 1000) / 1000
}

let hackedQueue = []
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
					if(!refreshingSession) refreshSession();
				} else if(dt.status === 'error') {
					console.log("Connection failed! Retrying in 30 seconds..")
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
		console.log("Disconnected: " + reason)
	})
	
	socket.on("connect_error", (err) =>{
		console.log(err)
	})
	
	
	let eventLogBlacklist = ["gotGlobalRoomLogs", "countryWarsProgress", "updateCountryWarsGraph", "initPlayer"] // NO LOGGING POINTLESS SHIT
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
		} else if(event.event === 'gotChatMessage'){
			const message = event.arguments[0].message;
			const username = event.arguments[0].username;
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
			if(eventData.progression !== 100) return;
			if(hackedQueue.indexOf(eventData.attacker) !== -1) return;
			if(!isParticipating("speedyHacker", eventData.attacker)) return;
			if(eventData.port !== 1) {
				socket.emit('playerInput', {
					"event": "sendChatMessage",
					"id": eventData.id,
					"username": eventData.attacker,
					"message": "Nice try, but you have to hack me on port 22 for it to count."
				});
				console.log("not right port")
				return;
			} // At this point, hack counts for challenge
			hackedQueue.push(eventData.attacker);
			console.log(hackedQueue)
		} else if(event.event === 'gotHacked') {
			const eventData = event.arguments[1]
			if(!hackedQueue.includes(eventData.attacker)) return;
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
			const wordsAmt = Array(eventData.wps_info)[0].length;
			const WP2M = (wordsAmt/eventData.total_hack_duration) * 120;
			hackedQueue.splice(hackedQueue.indexOf(eventData.attacker), 1)
			socket.emit('playerInput', {
				"event": "sendChatMessage",
				"id": eventData.id,
				"username": eventData.attacker,
				"message": `You hacked me in ${eventData.total_hack_duration} seconds! That's ${properRound(WP2M)} words per 2 minutes.`
			});
			const oldPb = getPlayerPB('speedyHacker', eventData.attacker);
			if(oldPb < WP2M){
				updatePlayerPB('speedyHacker', eventData.attacker, properRound(WP2M));
				let posText;
				let pos = getPlayerPosition('speedyHacker', eventData.attacker);
				if (pos == 3 || (pos > 20 && pos % 10 == 3)) posText = pos+"rd";
				else if (pos == 2 || (pos > 20 && pos % 10 == 2)) posText = pos+"nd";
				else if (pos == 1 || (pos > 20 && pos % 10 == 1)) posText = pos+"st";
				else posText = pos+"th";
				socket.emit('playerInput', {
					"event": "sendChatMessage",
					"id": eventData.id,
					"username": eventData.attacker,
					"message": `New PB! ${properRound(oldPb)} -> ${properRound(WP2M)}. You are now ${posText}!`
				});
			} else {
				socket.emit('playerInput', {
					"event": "sendChatMessage",
					"id": eventData.id,
					"username": eventData.attacker,
					"message": `Yikes! That didn't beat your PB of ${properRound(oldPb)}.`
				});
			}
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
client.commands.set(changelogCommand.data.name, changelogCommand);
client.commands.set(challengeCommand.data.name, challengeCommand);
if(String(token).includes('Ub37IY')) {
	client.commands.set(reloadCommand.data.name, reloadCommand); // Only include reload commadn if code is running on DebugBot
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