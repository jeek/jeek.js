import { WholeGame } from "WholeGame.js";

export async function bn8(Game) {
    let shorts = false;
    let stall = {};
    let prices = [];
    let symbols = await (Game.StockMarket.symbols);
    let tickPrice = 0;
    let filesize = {
        "grow.js": await Do(Game.ns, "ns.getScriptRam", "/temp/grow.js"),
        "growstock.js": await Do(Game.ns, "ns.getScriptRam", "/temp/growstock.js"),
        "hack.js": await Do(Game.ns, "ns.getScriptRam", "/temp/back.js"),
        "hackstock.js": await Do(Game.ns, "ns.getScriptRam", "/temp/hackstock.js"),
        "weaken.js": await Do(Game.ns, "ns.getScriptRam", "/temp/weaken.js")
    }
    let maxram = {};
    let neededports = {};
    let reqhackinglevel = {};
    maxram["home"] = await (Game.Servers['home'].maxRam);
    for (let server of Object.keys(stockMapping)) {
        neededports[stockMapping[server]] = await Do(Game.ns, "ns.getServerNumPortsRequired", stockMapping[server]);
        reqhackinglevel[stockMapping[server]] = await Do(Game.ns, "ns.getServerRequiredHackingLevel", stockMapping[server]);
    }
    let scores = {};
    let report = {};
    let starttime = Date.now();
    Game.bn8hackloop();
    let z = 0;
    while (true) {
        if ((!await Do(Game.ns, "ns.stock.has4SDataTIXAPI", ""))) {
            if ((await (Game.StockMarket.portfolioValue)) + (await Do(Game.ns, "ns.getPlayer")).money > 25000000000 * ((await Do(Game.ns, "ns.getBitNodeMultipliers"))).FourSigmaMarketDataApiCost) {
                Game.ns.write('/temp/4s.js', "export async function main(ns) { for (let stock of ns.stock.getSymbols()) { ns.stock.getPosition(stock)[0] ? ns.stock.sellStock(stock, ns.stock.getPosition(stock)[0]) : 0; ns.stock.getPosition(stock)[2] ? ns.stock.sellShort(stock, ns.stock.getPosition(stock)[2]) : 0; } ns.stock.purchase4SMarketDataTixApi(); }",'w')
                await Game.ns.asleep(0);
                Game.ns.run('/temp/4s.js');
            };
        }
        let files = await Do(Game.ns, "ns.ls", "home");
        let zz = 0;
        for (let program of [
            ["BruteSSH.exe", "ns.brutessh"],
            ["FTPCrack.exe", "ns.ftpcrack"],
            ["relaySMTP.exe", "ns.relaysmtp"],
            ["HTTPWorm.exe", "ns.httpworm"],
            ["SQLInject.exe", "ns.sqlinject"]]) {
            if (await Do(Game.ns, "ns.singularity.purchaseTor", "")) {
                let cost = await Do(Game.ns, "ns.singularity.getDarkwebProgramCost", program[0]);
                if ((0 < cost) && (cost * 2 < await (Game.Player.money))) {
                    await Do(Game.ns, "ns.singularity.purchaseProgram", program[0]);
                }
            }
            if (files.includes(program[0])) {
                zz += 1;
            }
        }
        if (zz >= 5 && ((await (Game.Player.hacking)) > 3000) && (await Do(Game.ns, "ns.singularity.getOwnedAugmentations")).includes("The Red Pill")) {
            await Game.winGame();
        }
        while (tickPrice == await Do(Game.ns, "ns.stock.getPurchaseCost", 'ECP', 1, "Long")) {
            await Game.ns.asleep(0);
        }
        tickPrice = await Do(Game.ns, "ns.stock.getPurchaseCost", 'ECP', 1, "Long");

        if (8 == await (Game.Player.bitNodeN))
            await (Game.Grafting.checkIn());

        while ((await Do(Game.ns, "ns.singularity.getUpgradeHomeRamCost")) * 2 < await Do(Game.ns, "ns.getServerMoneyAvailable", "home") && await Do(Game.ns, "ns.singularity.upgradeHomeRam", ""));
        let chances = {};
        let portvalue = 0;
        for (let stock of symbols) {
            chances[stock] = (-.5 + await (Game['StockMarket'].forecast(stock))) * (await (Game['StockMarket'].volatility(stock))) * (await Do(Game.ns, "ns.stock.getPrice", stock));
        }
        symbols = symbols.sort((a, b) => { return chances[b] - chances[a] });
        z = 1 - z;
        for (let stock of symbols) {
            if (z == 1 && !Game.StockMarket.liquidate) {
                let data = await Do(Game.ns, "ns.stock.getPosition", stock);
                if (chances[stock] > 0) {
                    let shares = Math.floor((-100000 + await Do(Game.ns, "ns.getServerMoneyAvailable", 'home')) / (await Do(Game.ns, "ns.stock.getAskPrice", stock)));
                    shares = Math.min(((await Do(Game.ns, "ns.stock.getMaxShares", stock))) - data[0] - data[2], shares);
                    while ((shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(Game.ns, "ns.stock.buyStock", stock, shares))) {
                        shares = Math.floor(shares * .99);
                    }
                    if (shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) {
                        if (shares > 0 && ((await (Game.StockMarket.portfolioValue)) * 9 < (await (Game.money)))) Game.StockMarket.log("Bought " + shares.toString() + " of " + stock);
                    }
                } else {
                    if (data[0] > 0) {
                        Do(Game.ns, "ns.stock.sellStock", stock, data[0]);
                        if (data[0] > 0) Game.StockMarket.log("Sold " + data[0].toString() + " of " + stock);
                    }
                }
            }
            portvalue += (await Do(Game.ns, "ns.stock.getPosition", stock))[0] * (await Do(Game.ns, "ns.stock.getPrice", stock));

        }
        symbols = symbols.reverse();
        for (let stock of symbols) {
            if (0 == z && !Game.StockMarket.liquidate) {
                let data = await Do(Game.ns, "ns.stock.getPosition", stock);
                if (chances[stock] < 0) {
                    let shares = Math.floor((-100000 + await Do(Game.ns, "ns.getServerMoneyAvailable", 'home')) / (await Do(Game.ns, "ns.stock.getAskPrice", stock)));
                    shares = Math.min(((await Do(Game.ns, "ns.stock.getMaxShares", stock))) - data[0] - data[2], shares);
                    while ((shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(Game.ns, "ns.stock.buyShort", stock, shares))) {
                        shares *= .99;
                    }
                    if (shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) {
                        if (shares > 0 && ((await (Game.StockMarket.portfolioValue)) * 9 < (await (Game.money)))) Game.StockMarket.log("Shorted " + shares.toString() + " of " + stock);
                    }
                } else {
                    if (data[2] > 0) {
                        Do(Game.ns, "ns.stock.sellShort", stock, data[2]);
                        if (data[2] > 0) Game.StockMarket.log("Unshorted " + data[2].toString() + " of " + stock);
                    }
                }
            }
            let data = await Do(Game.ns, "ns.stock.getPosition", stock);
            portvalue += (data[2] * (2 * data[3] - await Do(Game.ns, "ns.stock.getAskPrice", stock)));
        }
        let ownedAugs = await Do(Game.ns, "ns.singularity.getOwnedAugmentations");
        let playerhack = (await Do(Game.ns, "ns.getPlayer")).skills.hacking;
        if (8 == await (Game.Player.bitNodeN)) {
            if (playerhack > 3000 && ownedAugs.length >= 30 && !ownedAugs.includes("The Red Pill")) {
                while (((await (Game.Player.money)) > 100e9) && (!((await Do(Game.ns, "ns.singularity.checkFactionInvitations")).includes("Daedalus"))) && (!((await Do(Game.ns, "ns.getPlayer")).factions.includes("Daedalus")))) {
                    await Game.ns.asleep(1000);
                }
                if ((await Do(Game.ns, "ns.singularity.checkFactionInvitations")).includes("Daedalus")) {
                    await Do(Game.ns, "ns.singularity.joinFaction", "Daedalus");
                }
                if ((await Do(Game.ns, "ns.getPlayer")).factions.includes("Daedalus")) {
                    if ((await Do(Game.ns, "ns.singularity.getFactionRep", "Daedalus")) < ((await Do(Game.ns, "ns.singularity.getAugmentationRepReq", "The Red Pill")))) {
                        if ((await Do(Game.ns, "ns.getPlayer")).money > 1e9) {
                            await Do(Game.ns, "ns.singularity.donateToFaction", "Daedalus", Math.floor(.1 * ((await Do(Game.ns, "ns.getPlayer")).money)));
                        }
                    }
                    if ((await Do(Game.ns, "ns.singularity.getFactionRep", "Daedalus")) >= ((await Do(Game.ns, "ns.singularity.getAugmentationRepReq", "The Red Pill")))) {
                        await Do(Game.ns, "ns.singularity.purchaseAugmentation", "Daedalus", "The Red Pill");
                    }
                }
            }
            if (playerhack > 3000 && ownedAugs.length >= 30 && !ownedAugs.includes("The Red Pill") && ((await Do(Game.ns, "ns.singularity.getOwnedAugmentations", true))).includes("The Red Pill")) {
                await Game.SoftReset();
            }
        }
    }
}
export async function bn8hackloop(Game) {
    let filesize = {
        "grow.js": await Do(Game.ns, "ns.getScriptRam", "/temp/grow.js"),
        "growstock.js": await Do(Game.ns, "ns.getScriptRam", "/temp/growstock.js"),
        "hack.js": await Do(Game.ns, "ns.getScriptRam", "/temp/back.js"),
        "hackstock.js": await Do(Game.ns, "ns.getScriptRam", "/temp/hackstock.js"),
        "weaken.js": await Do(Game.ns, "ns.getScriptRam", "/temp/weaken.js")
    }
    let minsec = await DoAll(Game.ns, "ns.getServerMinSecurityLevel", Object.keys(stockMapping).map(x => stockMapping[x]));
    let volatility = {};
    for (let stock of await (Game['StockMarket'].symbols)) {
        volatility[stock] = await Game['StockMarket'].volatility(stock);
    }
    let player = await Do(Game.ns, "ns.getPlayer");
    let serverdata = await DoAll(Game.ns, "ns.getServer", Object.values(stockMapping));
    let weakentime = {};
    for (let server of Object.values(stockMapping)) {
        weakentime[server] = await Do(Game.ns, "ns.formulas.hacking.weakenTime", await Do(Game.ns, "ns.getServer", server), player);
    }
    for (let i of Object.keys(stockMapping).sort((a, b) => { return weakentime[stockMapping[a]] - weakentime[stockMapping[b]] })) {
        let files = await Do(Game.ns, "ns.ls", "home");
        let z = 0;
        if (files.includes("BruteSSH.exe")) {
            await Do(Game.ns, "ns.brutessh", stockMapping[i]);
            z += 1;
        }
        if (files.includes("SQLInject.exe")) {
            await Do(Game.ns, "ns.sqlinject", stockMapping[i]);
            z += 1;
        }
        if (files.includes("HTTPWorm.exe")) {
            await Do(Game.ns, "ns.httpworm", stockMapping[i]);
            z += 1;
        }
        if (files.includes("FTPCrack.exe")) {
            await Do(Game.ns, "ns.ftpcrack", stockMapping[i]);
            z += 1;
        }
        if (files.includes("relaySMTP.exe")) {
            await Do(Game.ns, "ns.relaysmtp", stockMapping[i]);
            z += 1;
        }
        let buffer = 10;
        if (1e6 < await Do(Game.ns, "ns.getServerMaxRam", "home")) {
            buffer = 100;
        }
        if ((z >= await Do(Game.ns, "ns.getServerNumPortsRequired", stockMapping[i])) && ((await Do(Game.ns, "ns.getPlayer")).skills.hacking) >= ((await Do(Game.ns, "ns.getServerRequiredHackingLevel", stockMapping[i])))) {
            await Do(Game.ns, "ns.nuke", stockMapping[i]);
            await (Game.Servers[stockMapping[i]].prep());
            while ((await (Game['StockMarket'].forecast(i))) > .1 && (await (Game['StockMarket'].forecast(i))) < .9) {
                while (minsec[i] < await Do(Game.ns, "ns.getServerSecurityLevel", stockMapping[i])) {
                    let threads = Math.max(1, Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["weaken.js"]));
                    let pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                    while (pid == 0 && threads > 1) {
                        await Game.ns.asleep(0);
                        threads -= 1;
                        pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                    }
                    while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.asleep(0); }
                }
                while ((await Do(Game.ns, "ns.getServerMoneyAvailable", stockMapping[i])) * 4 / 3 > (await Do(Game.ns, "ns.getServerMaxMoney", stockMapping[i]))) {
                    let threads = Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["hackstock.js"]);
                    if (threads > 0) {
                        let pid = Game.ns.run((await (Game['StockMarket'].forecast(i))) > .5 ? "/temp/hack.js" : "/temp/hackstock.js", threads, stockMapping[i]);
                        while (pid == 0 && threads > 0) {
                            await Game.ns.asleep(0);
                            threads -= 1;
                            pid = Game.ns.run((await (Game['StockMarket'].forecast(i))) > .5 ? "/temp/hack.js" : "/temp/hackstock.js", threads, stockMapping[i]);
                        }
                        while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.asleep(0); }
                    } else {
                        Game.ns.asleep(0);
                    }
                    while ((await Do(Game.ns, "ns.getServerMinSecurityLevel", stockMapping[i])) < (await Do(Game.ns, "ns.getServerSecurityLevel", stockMapping[i]))) {
                        let threads = Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["weaken.js"]);
                        let pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                        Game.ns.asleep(0);
                        while (pid == 0 && threads > 1) {
                            await Game.ns.asleep(0);
                            threads -= 1;
                            pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                        }
                        while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.asleep(0); }
                    }
                }
                while ((await Do(Game.ns, "ns.getServerMoneyAvailable", stockMapping[i])) < (await Do(Game.ns, "ns.getServerMaxMoney", stockMapping[i]))) {
                    let threads = Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["growstock.js"]);
                    let pid = threads > 0 ? Game.ns.run((await (Game['StockMarket'].forecast(i))) > .5 ? "/temp/growstock.js" : "/temp/grow.js", threads, stockMapping[i]) : 0;
                    while (pid == 0 && threads > 0) {
                        await Game.ns.asleep(0);
                        threads -= 1;
                        pid = Game.ns.run((await (Game['StockMarket'].forecast(i))) > .5 ? "/temp/growstock.js" : "/temp/grow.js", threads, stockMapping[i]);
                    }
                    while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.asleep(0); }
                    while ((await Do(Game.ns, "ns.getServerMinSecurityLevel", stockMapping[i])) < (await Do(Game.ns, "ns.getServerSecurityLevel", stockMapping[i]))) {
                        let threads = Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["weaken.js"]);
                        let pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                        while (pid == 0 && threads > 1) {
                            await Game.ns.asleep(0);
                            threads -= 1;
                            pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                        }
                        while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.asleep(0); }
                    }
                }
                while ((await Do(Game.ns, "ns.getServerMinSecurityLevel", stockMapping[i])) < (await Do(Game.ns, "ns.getServerSecurityLevel", stockMapping[i]))) {
                    let threads = Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["weaken.js"]);
                    let pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                    while (pid == 0 && threads > 1) {
                        await Game.ns.asleep(0);
                        threads -= 1;
                        pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                    }
                    while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.asleep(0); }
                }
                await Game.ns.asleep(0);
            }
        }
    }
}