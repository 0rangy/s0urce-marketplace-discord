import {
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    SlashCommandBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js'
import * as fs from 'fs'
import axios from "axios";

let configData = JSON.parse(fs.readFileSync('./config.json'));
let yabSecret = configData.ORANGYS_SECRET;

export let linkingQueue = []

let checkIfLoggedIn = async (id) => {
    let res = await axios.get(`https://nandertga.ddns.net:4097/api/v2/discordIdToS0urceUsernames/${id}`, {
        headers: {
            'X-API-Key': `${yabSecret}`
        }
    })
    if(res.status === 200 && res.data.length > 0) {
        console.log(res.data)
        return res.data[0];
    } 
    return false;
}

export { checkIfLoggedIn }