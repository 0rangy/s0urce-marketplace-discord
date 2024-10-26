// d0t's indexes stats
stats = {
	cpu: [
        { hack: [8, 18], trueDam: [0, 0], pen: [0, 0], chance: [0, 0], dam: [0, 0] },
        { hack: [18.5, 33.5], trueDam: [0, 10], pen: [0, 5], chance: [0, 2.5], dam: [1, 5] },
        { hack: [34, 54], trueDam: [0, 20], pen: [0, 15], chance: [2.5, 3.25], dam: [5, 7.5] },
        { hack: [55, 64.25], trueDam: [0, 30], pen: [0, 20], chance: [4, 6.25], dam: [8.25, 15] },
        { hack: [68.75, 84.75], trueDam: [0, 40], pen: [13, 25], chance: [6.5, 7.5], dam: [17, 25] },
        { hack: [91, 105], trueDam: [43, 50], pen: [19.5, 30], chance: [8.25, 10], dam: [19.5, 30] },
        { hack: [125.5,135.5], trueDam: [55,60], pen: [32.5,35], chance: [11.25,12.5], dam: [32.5,35] }
    ],
	firewall: [
        { hp: [22,62], rd: [0,0], regen: [0,0], medium: [0,0], long: [0,0] },
        { hp: [64,114], rd: [0,7.5], regen: [0,2.5], medium: [0,0], long: [0,0] },
        { hp: [116,166], rd: [0,10], regen: [0,5], medium: [0,30], long: [0,0] },
        { hp: [172,217], rd: [0,12.5], regen: [0,7.5], medium: [22,40], long: [0,25] },
        { hp: [234,269], rd: [0,15], regen: [8,10], medium: [34,0], long: [22,30] },
        { hp: [285,320], rd: [11.5,15], regen: [10.75,12.5], medium: [65,47.5], long: [28,35] },
        { hp: [372,397], rd: [16.25,17.5], regen: [13.75,15], medium: [80,70], long: [37.5,45] }
    ],
	gpu: [
        { idle: [0.000010,0.000014], bart: [0,0], crip: [0,0], },
        { idle: [0.000011,0.000024], bart: [0,10], crip: [2.5,10], },
        { idle: [0.000016,0.000033], bart: [0,12.5], crip: [2.5,12.5], },
        { idle: [0.0000223,0.000043], bart: [0,15], crip: [6,15], },
        { idle: [0.0000348,0.000054], bart: [0,20], crip: [10,20], },
        { idle: [0.0000516,0.000074], bart: [16.25,25], crip: [16.25,25], },
        { idle: [0.000077,0.000094], bart: [22.5,30], crip: [22.5,30], }
    ],
    psu: [
        { boost: [1, 5], },
        { boost: [5, 10], },
        { boost: [10, 15], },
        { boost: [16, 25], },
        { boost: [27, 35], },
        { boost: [36.5, 40], },
        { boost: [50, 55], },
    ],
	port: [
		{ hp: 1000+3*60, rd: 0 },
		{ hp: 1000+3*114, rd: 3*0.075 },
		{ hp: 1000+3*166, rd: 3*0.1 },
		{ hp: 1000+3*217, rd: 3*0.125 },
		{ hp: 1000+3*269, rd: 3*0.15 },
		{ hp: 1000+3*320, rd: 3*0.15 },
        { hp: 1000+3*397, rd: 3*0.175}
    ],
    cputerm: [
        3, 3.5, 4, 4.25, 4.75, 5, 5.5
    ],
	fireterm: [
	    12, 14, 16, 17, 19, 20, 22
    ],
	gpu_term: [
	    0.0000042*0.6, 0.0000042*0.7, 0.0000042*0.8, 0.0000042*0.85, 0.0000042*0.95, 0.0000042, 0.0000042*1.1
    ],
	psu_term: [
    	1.2, 1.4, 1.6, 1.7, 1.9, 2, 2.2
    ],
    // Last updated as of 7/4/2024
    filament_price: [
        0.01, 0.03, 0.1, 0.3, 1.5, 4.5, 67.5
    ],
};

module.exports.stats = stats;

const firewallEncryption = (hp, rd, regen, ad, ms) => {
    rd /= 100;
    const cShort = [3.7027,100];
    const cMed = [8.2857,ad*3];
    const cLong = [13.421,ms*3];

    return [1000+hp*3, rd*3, regen*3*.3, (cShort[0]*cShort[1]+cMed[0]*cMed[1]+cLong[0]*cLong[1])/(cShort[1]+cMed[1]+cLong[1])];
}

const penTest = (port, cpu, aTPH) => {
    let t = 0;
    const damage = cpu[0]*(1+cpu[1]-port[1])+cpu[2];

    while (port[0] - damage + port[2]*aTPH > 0) {
        port[0] -= damage;
        port[0] += port[2]*aTPH;
        t += aTPH;
    }
    return t + aTPH*(port[0]+port[2]*aTPH)/damage;
}

const netBTCperHour = (idle, barter, crypto) => {
    const npcsPerHour = 27.69;
    idle *= 3600;
    barter /= 100;
    barter = ((1+barter)*0.00864000-0.00864000) * npcsPerHour;
    crypto /= 100;
    crypto = ((1+crypto)*0.00180000-0.00180000) * npcsPerHour;

    return idle + barter + crypto;
}


const dPS = (dTI,level,rarity,type) => {
    let basePrice = this.stats.filament_price[rarity];
    const value = (level-1)*3*basePrice + basePrice;
    if (type != "cpu" && type != "router") basePrice /= 2
    if (rarity < 5) {
        if (dTI < 7) return (value).toFixed(4);
        else if (dTI < 8) return "~" + (value + (dTI-7)*basePrice/3).toFixed(4);
        else if (dTI < 9) return "~" + (value + (dTI-8)*basePrice/3*2 + basePrice/3).toFixed(4);
        else if (dTI < 9.9) return "~" + (value + (dTI-9)*basePrice + basePrice).toFixed(4);
    } else if (rarity < 6) {
        if (dTI < 5) return (value).toFixed(4);
        else if (dTI < 6) return "~" + (value + (dTI-5)*basePrice/3).toFixed(4);
        else if (dTI < 7) return "~" + (value + (dTI-6)*basePrice/3*2 + basePrice/3).toFixed(4);
        else if (dTI < 8) return "~" + (value + (dTI-7)*basePrice + basePrice).toFixed(4);
        else if (dTI < 9) return "~" + (value + (dTI-7)*basePrice*5/3 + basePrice*2).toFixed(4);
        else if (dTI < 9.7) return "~" + (value + (dTI-7)*basePrice*10/3 + basePrice*11/3).toFixed(4);
    } else {
        if (dTI < 5) return (value).toFixed(4);
        else if (dTI < 6) return "~" + (value + (dTI-5)*basePrice/3).toFixed(4);
        else if (dTI < 7) return "~" + (value + (dTI-6)*basePrice/2 + basePrice/3).toFixed(4);
        else if (dTI < 8) return "~" + (value + (dTI-7)*basePrice + basePrice*5/6).toFixed(4);
        else if (dTI < 9) return "~" + (value + (dTI-8)*basePrice*2 + basePrice*11/6).toFixed(4);
        else if (dTI < 9.5) return "~" + (value + (dTI-8)*basePrice*5 + basePrice*23/6).toFixed(4);

    }
    return "Invaluable";
}

const dGI = (idle,barter,crypto,level,rarity) => {
    const item = this.stats.gpu[rarity];
    const bestGPU = netBTCperHour(item.idle[1]+this.stats.gpu_term[rarity]*level,item.bart[1],item.crip[1]);
    const worstGPU = netBTCperHour(item.idle[0]+this.stats.gpu_term[rarity]*level,item.bart[0],item.crip[0]);
    const actualGPU = netBTCperHour(idle,barter,crypto);
    const qualityRange = bestGPU - worstGPU;
    const actualRange = actualGPU - worstGPU;
    let gpuRank = 1+((actualRange/qualityRange)*9);
    if (gpuRank < 1) gpuRank = 1;

    return gpuRank;
}

const boostBTCperHour = (boost,rarity) => {
    const idle = (this.stats.gpu[rarity].idle[1]+this.stats.gpu_term[rarity]) * 3600
    boost /= 100;

    return idle*(1+boost) - idle;
}

const dPI = (boost,level,rarity) => {
    const item = this.stats.psu[rarity];
    const bestPSU = boostBTCperHour(item.boost[1]+this.stats.psu_term[rarity]*level,rarity)
    const worstPSU = boostBTCperHour(item.boost[0]+this.stats.psu_term[rarity]*level,rarity)
    const actualPSU = boostBTCperHour(boost,rarity)
    const qualityRange = bestPSU - worstPSU;
    const actualRange = actualPSU - worstPSU;
    let psuRank = 1+((actualRange/qualityRange)*9);
    if (psuRank < 1) psuRank = 1;

    return psuRank;
}

const dFI = (hp, rd, rg, enc, level, rarity) => {
    const item = this.stats.firewall[rarity];
    const cpu = this.stats.cpu[rarity];
    const cpuV = hackPower(cpu.hack[1]+this.stats.cputerm[rarity]*(level-1), cpu.trueDam[1], cpu.pen[1], cpu.chance[1], cpu.dam[1]);
    const cpsAverage = 5;
    const bestPort = firewallEncryption(item.hp[1]+this.stats.fireterm[rarity]*(level-1),item.rd[1],item.regen[1],item.medium[1],item.long[1]);
    const worstPort = firewallEncryption(item.hp[0]+this.stats.fireterm[rarity]*(level-1),item.rd[0],item.regen[0],item.medium[0],item.long[0]);
    const bestHoldout = penTest(bestPort, cpuV, bestPort[3]/cpsAverage+.3);
    const worstHoldout = penTest(worstPort, cpuV, worstPort[3]/cpsAverage+.3);
    const actualHoldout = penTest([hp,rd,rg],cpuV,enc/cpsAverage+.3);
    const qualityRange = worstHoldout - bestHoldout;
    const qualityActually = worstHoldout - actualHoldout;
    let fireRank = 1+(qualityActually/qualityRange*9);
    if (fireRank < 1) fireRank = 1;

    return fireRank;
}

const hackPower = (hack, trueDam, pen, chance, dam) => {
    pen /= 100;
    chance /= 100;
    dam /= 100;
    return [(100+hack)+(0.05+chance)*(100+hack)*(0.3+dam), pen, trueDam];
}

const dCI = (raw, pen, trueDam, level, rarity) => {
    const item = this.stats.cpu[rarity];
    const port = this.stats.port[rarity];
    
    const bestHackPower = hackPower(item.hack[1]+this.stats.cputerm[rarity]*(level-1), item.trueDam[1], item.pen[1], item.chance[1], item.dam[1]);
    const worstHackPower = hackPower(item.hack[0]+this.stats.cputerm[rarity]*(level-1), item.trueDam[0], item.pen[0], item.chance[0], item.dam[0]);
    const best = port.hp/(bestHackPower[0]*(1+bestHackPower[1]-port.rd)+bestHackPower[2])
    const worst = port.hp/(worstHackPower[0]*(1+worstHackPower[1]-port.rd)+worstHackPower[2])
    const actual = port.hp/(raw*(1+pen-port.rd) + trueDam)
    const qualityRange = worst - best;
    const qualityActually = worst - actual;
    let cpuRank = 1+((qualityActually/qualityRange)*9);
    if (cpuRank < 1) cpuRank = 1;

    return cpuRank;
}

const getItemGrade = (type, level, index, effects) => {
    switch(type) {
        case "cpu":
            const hack = effects["Hack Damage"];
            const trueDam = effects["True Damage"] || 0;
            const pen = effects["Hack Armor Penetration"] || 0;
            const chance = effects["Hack Critical Damage Chance"] || 0;
            const dam = effects["Hack Critical Damage Bonus"] || 0;
            const [raw, penV, trueDamV] = hackPower(hack, trueDam, pen, chance, dam);
            return dCI(raw, penV, trueDamV, level, index).toFixed(4);
        case "gpu":
            const idle = effects["Idle Crypto Mining"]
            const bart = effects["More Crypto Reward"] || 0
            const crip = effects["Better Barter"] || 0
            return dGI(idle, bart, crip, level, index).toFixed(4);
        case "psu":
            const boost = effects["Crypto Mining Power"]
            return dPI(boost, level, index).toFixed(4)
        case "router":
            const hp = effects["Firewall Health"];
            const rd = effects["Firewall Damage Reduction"] || 0;
            const rg = effects["Firewall Regeneration"] || 0;
            const ad = effects["Firewall Advanced Encryption"] || 0;
            const ms = effects["Firewall Master Encryption"] || 0;
            const [hpP, rdP, rgP, encryption] = firewallEncryption(hp,rd,rg,ad,ms);
            return dFI(hpP, rdP, rgP, encryption, level, index).toFixed(4);
    default:
            return -1;
    }
}



const rarities = ["d", "c", "b", "a", "s", "ss", "sss"];

const statsToEffect = (stats) => {
    let effects = {}
    stats.forEach((stat) => {
        effects[stat.name] = stat.value
    })
    return effects;
}

module.exports.itemTodTI = (item) => {
    return getItemGrade(item.type,item.upgradeLevel,rarities.indexOf(String(item.rarity).toLowerCase()),statsToEffect(item.stats))
}

module.exports.estimatePrice = (item) => {
    let itemdTI = this.itemTodTI(item);
    let price = dPS(itemdTI,item.upgradeLevel, rarities.indexOf(String(item.rarity).toLowerCase()), item.type);
    return dPS(itemdTI,item.upgradeLevel, rarities.indexOf(String(item.rarity).toLowerCase()), item.type);
}