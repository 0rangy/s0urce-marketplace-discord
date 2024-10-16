const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { socket } = require('../../index');

const properRound = (num) => {
    return Math.round((num + Number.EPSILON) * 1000) / 1000
}

const ErrorEmbed = (errorStr) => {
    const embed = new EmbedBuilder()
      .setTitle("Something happened!")
      .setDescription(`${errorStr}`)
      .setColor("#f50000");
  
    return embed;
}

const playerEmbed = (player) => {
    const embed = new EmbedBuilder();
    embed.setTitle(`${player.username}'s Profile`);
    let userTag = "";

    if(player.player_badge === "JMOD") {
        userTag = "<:jmod:id>"
    } else if (player.player_badge === "MOD") {
        userTag = "<:mod:id>"
    }

    let levelTag = "<:bronze:1295854402636353607>";
    if(player.level > 10) {
        levelTag = "<:silver:1295854401327464589>";
    } if(player.level > 25) {
        levelTag = "<:gold:1295854400140607559>";
    } if(player.level > 50) {
        levelTag = "<:platinum:1295854406025216051>";
    } if(player.level > 75) {
        levelTag = "<:diamond:1295854407564398674>";
    } if(player.level > 100) {
        levelTag = "<:master:1295854404699947038>";
    } if(player.level > 125) {
        levelTag = "<:grandmaster:1295854328376197212>";
    };

    let nameColor = "Default";
    try {
        nameColor = String(player.nameColor.name).split("Color")[1].trim();
    } catch {
        nameColor = "Default";
    };
    
    let bgColor = "Default";
    try {
        bgColor = String(player.namePlate.name).split("Color")[1].trim();
    } catch {
        bgColor = "Default";
    };

    


    embed.setDescription(`${userTag} :flag_${String(player.countryCode).toLowerCase()}: ${levelTag} Level ${player.level}`);
    embed.addFields(
    {
        name: "Balance",
        value: `<:btc:1295855267312963758> ${properRound(player.btc)}`,
        inline: true
    },
    {
        name: "Premium",
        value: player.premium ? "Yes" : "No",
        inline: true
    },
    {
        name: "Status",
        value: player.online ? "Online" : "Offline",
        inline: true
    },
    {
        name: "Name Color",
        value: nameColor,
        inline: true
    },
    {
        name: "Nameplate",
        value: bgColor,
        inline: true
    },
    {
        name: "Profile Description",
        value: player.quote + " ",
        inline: false
    },
    );
    if(player.avatar !== null){
        embed.setThumbnail(`https://s0urce.io/items/${player.avatar.icon}`);
    }
    embed.setColor("#00b0f4");

    return embed;
}


module.exports = {
    category: 'player',
    data: new SlashCommandBuilder()
        .setName("player")
        .setDescription("View player stats")
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the player')
                .setRequired(true)),
    async execute(interaction) {
        if(String(interaction.options.getString('name')).length < 3) {
            await interaction.reply({embeds: [ErrorEmbed("Profile name must be at least 3 characters!")]})
            return;
        }
        let response = await socket.emitWithAck('playerInput', {'event': 'searchToAddFriend', "searchID": interaction.options.getString('name')});
        if(response.status !== "success") {
            await interaction.reply({embeds: [ErrorEmbed("Couldn't fetch statistics! Does this player exist?")]})
            return;
        }
        console.log(JSON.stringify(response, null, 2))        

        const embed = playerEmbed(response.data)

        await interaction.reply({ embeds: [embed]});
    }
}