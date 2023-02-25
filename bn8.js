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
    while ((!await Do(Game.ns, "ns.stock.has4SDataTIXAPI", ""))) {
        if ((await (Game.StockMarket.portfolioValue)) + (await Do(Game.ns, "ns.getPlayer")).money > 25000000000 * ((await Do(Game.ns, "ns.getBitNodeMultipliers"))).FourSigmaMarketDataApiCost) {
            Game.ns.write('/temp/4s.js', "export async function main(ns) { for (let stock of ns.stock.getSymbols()) { ns.stock.getPosition(stock)[0] ? ns.stock.sellStock(stock, ns.stock.getPosition(stock)[0]) : 0; ns.stock.getPosition(stock)[2] ? ns.stock.sellShort(stock, ns.stock.getPosition(stock)[2]) : 0; } ns.stock.purchase4SMarketDataTixApi(); }",'w')
            await Game.ns.asleep(0);
            Game.ns.run('/temp/4s.js');
        };
        await Game.ns.asleep([2000-(Date.now()-starttime), 0].reduce((a, b) => a > b ? a : b));
        starttime = Date.now();
        while (tickPrice == await Do(Game.ns, "ns.stock.getPurchaseCost", 'ECP', 1, "Long")) {
            await Game.ns.asleep(1000);
        }
        tickPrice = await Do(Game.ns, "ns.stock.getPurchaseCost", 'ECP', 1, "Long");
        prices.push({});
        if (prices.length > 75) {
            prices.shift();
        }
        let guess = (new Array(76)).fill(0);
        for (let stock of symbols) {
            prices[prices.length - 1][stock] = [await Do(Game.ns, "ns.stock.getPurchaseCost", stock, 1, "Long"), await Do(Game.ns, "ns.stock.getPurchaseCost", stock, 1, "Short")];
            let dir = "";
            let up = 0;
            let count = 0;
            for (let i = 0; i + 1 < prices.length; i++) {
                if (Math.sign(prices[prices.length - 1 - i][stock][0] - prices[prices.length - 2 - i][stock][0]) > 0) {
                    if (i < 20)
                        up += 1;
                    if (i + 20 >= prices.length) {
                        up -= .5;
                    }
                    dir = "+".concat(dir);
                } else {
                    dir = "-".concat(dir);
                }
                if (i < 20)
                    count += 1;
                if (i + 20 >= prices.length)
                    count += 1;
            }
            while (prices.length > 2 && prices[prices.length - 1][stock][0] == 0) {
                prices.pop();
            }
            for (let i = 0; i < prices.length; i++) {
                let j = Math.min(i, 10);
                for (let k = 0; k < j && i + k < prices.length; k++) {
                    if ((prices[i - k][stock][0] < prices[i][stock][0] && prices[i][stock][0] > prices[i + k][stock][0])) {
                        guess[i] += 1;
                    }
                    if ((prices[i - k][stock][0] > prices[i][stock][0] && prices[i][stock][0] < prices[i + k][stock][0])) {
                        guess[i] += 1;
                    }
                }
            }
            scores[stock] = up / count;
            report[stock] = dir.concat(" ").concat(Math.floor(up * 100 / count).toString());
            if (Math.floor(up * 100 / count) > 60)
                Game.ns.run("/temp/hack.js", 1)
        }
        let ordered = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
        let z = 0;
        let totalfunds = 0;
        let startmoney = await Do(Game.ns, "ns.getServerMoneyAvailable", 'home');
        let sorted = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
        try {
            sorted = sorted.sort((a, b) => { return prices[prices.length - 1][b][0] / prices[prices.length - 11][b][0] - prices[prices.length - 1][a][0] / prices[prices.length - 11][a][0] })
        } catch { }
        for (let program of [
            ["BruteSSH.exe", "ns.brutessh"],
            ["FTPCrack.exe", "ns.ftpcrack"],
            ["relaySMTP.exe", "ns.relaysmtp"],
            ["HTTPWorm.exe", "ns.httpworm"],
            ["SQLInject.exe", "ns.sqlinject"]]) {
            if (await Do(Game.ns, "ns.singularity.purchaseTor", "")) {
                let cost = await Do(Game.ns, "ns.singularity.getDarkwebProgramCost", program[0]);
                if ((0 < cost) && (cost * 2 < ((await Do(Game.ns, "ns.getPlayer", "")).money))) {
                    await Do(Game.ns, "ns.singularity.purchaseProgram", program[0]);
                }
            }
        }
        for (let stock of sorted) {
            if (Object.keys(stockMapping).includes(stock) && !await Do(Game.ns, "ns.hasRootAccess", stockMapping[stock])) {
                let files = await Do(Game.ns, "ns.ls", "home");
                let z = 0;
                if (files.includes("BruteSSH.exe")) {
                    await Do(Game.ns, "ns.brutessh", stockMapping[stock]);
                    z += 1;
                }
                if (files.includes("SQLInject.exe")) {
                    await Do(Game.ns, "ns.sqlinject", stockMapping[stock]);
                    z += 1;
                }
                if (files.includes("HTTPWorm.exe")) {
                    await Do(Game.ns, "ns.httpworm", stockMapping[stock]);
                    z += 1;
                }
                if (files.includes("FTPCrack.exe")) {
                    await Do(Game.ns, "ns.ftpcrack", stockMapping[stock]);
                    z += 1;
                }
                if (files.includes("relaySMTP.exe")) {
                    await Do(Game.ns, "ns.relaysmtp", stockMapping[stock]);
                    z += 1;
                }
                if (z >= neededports[stockMapping[stock]]) {
                    await Do(Game.ns, "ns.nuke", stockMapping[stock]);
                }
            }
            if (!(stall[stock] > 0)) {
                stall[stock] = 0;
            }
            if (Object.keys(stockMapping).includes(stock) && await Do(Game.ns, "ns.hasRootAccess", stockMapping[stock]) && ((await (Game.Player.hacking)) >= reqhackinglevel[stockMapping[stock]])) {
                if (z == 0) {
                    Game.ns.run("/temp/growstock.js", Math.max(1, Math.floor(.5 * (maxram["home"] - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - 10) / filesize["growstock.js"])), stockMapping[stock]);
                } else {
                    if (z == sorted.length - 1) {
                        Game.ns.run("/temp/hackstock.js", Math.max(1, Math.floor(.5 * (maxram["home"] - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - 10) / filesize["hackstock.js"])), stockMapping[stock]);
                    } else {
                        Game.ns.run("/temp/weaken.js", Math.max(1, Math.floor(.5 * (maxram["home"] - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - 10) / filesize["weaken.js"])), stockMapping[stock]);
                    }
                }
            }
            stall[stock] -= z / 10;
            let data = await Game.StockMarket.position(stock);
            if ((scores[stock] > .5 || z < 20) && data[2] > 0) {
                await Do(Game.ns, "ns.stock.sellShort", stock, data[2]);
                if (data[2] > 0) Game.StockMarket.log("Unshorted " + data[2].toString() + " of " + stock);
                data[2] = 0;
            }
            if (prices.length > 20 && !Game.StockMarket.liquidate) {
                if (z < 5) {
                    let shares = Math.floor((-100000 + await Do(Game.ns, "ns.getServerMoneyAvailable", 'home')) / (await Do(Game.ns, "ns.stock.getAskPrice", stock)) / [2, 1, 1, 1, 1][z] / (shorts ? 2 : 1));
                    if (shares * (prices[prices.length - 1][stock][0] - prices[prices.length - 11][stock][0]) / 10 * 75 > 200000) {
                        while ((shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(Game.ns, "ns.stock.buyStock", stock, shares))) {
                            shares = Math.floor(shares * .9);
                        }
                        if (shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) {
                            if (shares > 0) Game.StockMarket.log("Bought " + shares.toString() + " of " + stock);
                            if (shares > 10) {
                                stall[stock] = 21;
                            }
                        }
                    }
                } else {
                    if (data[0] > 0 && stall[stock] <= 0) {
                        Do(Game.ns, "ns.stock.sellStock", stock, data[0]);
                        if (data[0] > 0) Game.StockMarket.log("Sold " + data[0].toString() + " of " + stock);
                    }
                }
            }
            z += 1;
            data = await Do(Game.ns, "ns.stock.getPosition", stock);
            totalfunds += data[0] * await Do(Game.ns, "ns.stock.getBidPrice", stock);
            if (prices.length > 20 && !Game.StockMarket.liquidate) {
                if (shorts && (z + 1 == Object.keys(scores).length)) {
                    let shares = Math.floor((-100000 + await Do(Game.ns, "ns.getServerMoneyAvailable", 'home')) / (await Do(Game.ns, "ns.stock.getAskPrice", stock)));
                    while ((shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(Game.ns, "ns.stock.buyShort", stock, shares))) {
                        shares *= .99;
                    }
                    if (shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) {
                        if (shares > 0) Game.StockMarket.log("Shorted " + shares.toString() + " of " + stock);
                    }
                }
            }
            totalfunds += data[2] * (2 * data[3] - (await Do(Game.ns, "ns.stock.getAskPrice", stock)));

        }
        if (!await Do(Game.ns, "ns.stock.has4SData")) {
            try {
                await Do(Game.ns, "ns.stock.purchase4SMarketData", "");
            } catch { }
        }
        if (!await Do(Game.ns, "ns.stock.has4SDataTIXAPI")) {
            try {
                await Do(Game.ns, "ns.stock.purchase4SMarketDataTixApi", "");
            } catch { }
        }
        await Game.ns.asleep(0);
    }
    Game.bn8hackloop();
    let z = 0;
    while (true) {
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
        }
        let files = await Do(Game.ns, "ns.ls", "home");
        let zz = 0;
        if (files.includes("BruteSSH.exe")) {
            zz += 1;
        }
        if (files.includes("SQLInject.exe")) {
            zz += 1;
        }
        if (files.includes("HTTPWorm.exe")) {
            zz += 1;
        }
        if (files.includes("FTPCrack.exe")) {
            zz += 1;
        }
        if (files.includes("relaySMTP.exe")) {
            zz += 1;
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
            chances[stock] = (-.5 + await Do(Game.ns, "ns.stock.getForecast", stock)) * (await Do(Game.ns, "ns.stock.getVolatility", stock)) * (await Do(Game.ns, "ns.stock.getPrice", stock));
        }
        symbols = symbols.sort((a, b) => { return chances[b] - chances[a] });
        z = 1 - z;
        for (let stock of symbols) {
            if (z == 1 && !Game.StockMarket.liquidate) {
                let data = await Do(Game.ns, "ns.stock.getPosition", stock);
                if (chances[stock] > 0) {
                    let shares = Math.floor((-100000 + await Do(Game.ns, "ns.getServerMoneyAvailable", 'home')) / (await Do(Game.ns, "ns.stock.getAskPrice", stock)));
                    shares = Math.min(((await Do(Game.ns, "ns.stock.getMaxShares", stock))) - data[0] - data[2], shares);
                    //						if (shares > 100 && (200000 < await Do(Game.ns, "ns.getServerMoneyAvailable", "home"))) {
                    //							ns.toast("Trying to buy " + shares.toString() + " of " + stock);
                    //						}
                    while ((shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(Game.ns, "ns.stock.buyStock", stock, shares))) {
                        shares = Math.floor(shares * .99);
                    }
                    if (shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) {
                        if (shares > 0) Game.StockMarket.log("Bought " + shares.toString() + " of " + stock);
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
                    //						if (shares > 100 && (200000 < await Do(Game.ns, "ns.getServerMoneyAvailable", "home"))) {
                    //							ns.toast("Trying to short " + shares.toString() + " of " + stock);
                    //						}
                    while ((shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(Game.ns, "ns.stock.buyShort", stock, shares))) {
                        shares *= .99;
                    }
                    if (shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) {
                        if (shares > 0) Game.StockMarket.log("Shorted " + shares.toString() + " of " + stock);
                    }
                } else {
                    if (data[2] > 0) {
                        //							ns.toast("Unshorting " + stock);
                        Do(Game.ns, "ns.stock.sellShort", stock, data[2]);
                        if (data[2] > 0) Game.StockMarket.log("Unshorted " + data[2].toString() + " of " + stock);
                    }
                }
            }
            let data = await Do(Game.ns, "ns.stock.getPosition", stock);
            portvalue += (data[2] * (2 * data[3] - await Do(Game.ns, "ns.stock.getAskPrice", stock)));
        }
        //			ns.tprint(z ? "Long " : "Short", " ", ns.nFormat((await Do(ns, "ns.getServerMoneyAvailable", "home")) + portvalue, "$0.000a"));
        //			ns.toast(ns.nFormat((await Do(ns, "ns.getServerMoneyAvailable", "home")) + portvalue, "$0.000a"));
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
    let volatility = await DoAll(Game.ns, "ns.stock.getVolatility", Object.keys(stockMapping));
    let player = await Do(Game.ns, "ns.getPlayer");
    let serverdata = await DoAll(Game.ns, "ns.getServer", Object.values(stockMapping));
    let weakentime = {};
    for (let server of Object.values(stockMapping)) {
        weakentime[server] = await Do(Game.ns, "ns.formulas.hacking.weakenTime", await Do(Game.ns, "ns.getServer", server), player);
    }
    for (let i of Object.keys(stockMapping).sort((a, b) => { return weakentime[stockMapping[a]] - weakentime[stockMapping[b]] })) {
        //    for (let i of Object.keys(mapping).sort((a, b) => { return minsec[a] - minsec[b] })) {
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
            while ((await Do(Game.ns, "ns.stock.getForecast", i)) > .1 && (await Do(Game.ns, "ns.stock.getForecast", i)) < .9) {
                while (minsec[i] < await Do(Game.ns, "ns.getServerSecurityLevel", stockMapping[i])) {
                    //                   ns.tprint("Weaken " + i + " " + mapping[i], " ", ns.stock.getForecast(i));
                    let threads = Math.max(1, Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["weaken.js"]));
                    let pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                    while (pid == 0 && threads > 1) {
                        await Game.ns.asleep(0);
                        threads -= 1;
                        pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                    }
                    while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.asleep(0); }
                }
                //Game.ns.tprint(((await Do(Game.ns, "ns.stock.getForecast", i)) > .5 ? "Grow " : "Hack ") + i + " " + stockMapping[i], " ", (await Do(Game.ns, "ns.stock.getForecast", i)));
                while ((await Do(Game.ns, "ns.getServerMoneyAvailable", stockMapping[i])) * 4 / 3 > (await Do(Game.ns, "ns.getServerMaxMoney", stockMapping[i]))) {
                    let threads = Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["hackstock.js"]);
                    if (threads > 0) {
                        let pid = Game.ns.run((await Do(Game.ns, "ns.stock.getForecast", i)) > .5 ? "/temp/hack.js" : "/temp/hackstock.js", threads, stockMapping[i]);
                        while (pid == 0 && threads > 0) {
                            await Game.ns.asleep(0);
                            threads -= 1;
                            pid = Game.ns.run((await Do(Game.ns, "ns.stock.getForecast", i)) > .5 ? "/temp/hack.js" : "/temp/hackstock.js", threads, stockMapping[i]);
                        }
                        while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.asleep(0); }
                    } else {
                        Game.ns.asleep(0);
                    }
                    while ((await Do(Game.ns, "ns.getServerMinSecurityLevel", stockMapping[i])) < (await Do(Game.ns, "ns.getServerSecurityLevel", stockMapping[i]))) {
                        //            ns.tprint("Weaken " + i + " " + mapping[i], " ", ns.stock.getForecast(i));
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
                    let pid = threads > 0 ? Game.ns.run((await Do(Game.ns, "ns.stock.getForecast", i)) > .5 ? "/temp/growstock.js" : "/temp/grow.js", threads, stockMapping[i]) : 0;
                    while (pid == 0 && threads > 0) {
                        await Game.ns.asleep(0);
                        threads -= 1;
                        pid = Game.ns.run((await Do(Game.ns, "ns.stock.getForecast", i)) > .5 ? "/temp/growstock.js" : "/temp/grow.js", threads, stockMapping[i]);
                    }
                    while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.asleep(0); }
                    while ((await Do(Game.ns, "ns.getServerMinSecurityLevel", stockMapping[i])) < (await Do(Game.ns, "ns.getServerSecurityLevel", stockMapping[i]))) {
                        //                     ns.tprint("Weaken " + i + " " + mapping[i], " ", ns.stock.getForecast(i));
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