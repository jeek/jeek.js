export async function bn8(Game) {
    let shorts = false;
    let stall = {};
    let prices = [];
    let symbols = await Game.StockMarket.symbols;
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
    maxram["home"] = await Game.Servers['home'].maxRam;
    for (let server of Object.keys(stockMapping)) {
        neededports[stockMapping[server]] = await Do(Game.ns, "ns.getServerNumPortsRequired", stockMapping[server]);
        reqhackinglevel[stockMapping[server]] = await Do(Game.ns, "ns.getServerRequiredHackingLevel", stockMapping[server]);
    }
    let scores = {};
    let report = {};
    while ((!await Do(Game.ns, "ns.stock.has4SData", "")) || (!await Do(Game.ns, "ns.stock.has4SDataTIXAPI", ""))) {
        while (tickPrice == await Do(Game.ns, "ns.stock.getPurchaseCost", 'ECP', 1, "Long")) {
            await Game.ns.sleep(0);
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
                for (let k = i - j; k <= i + j; k++) {
                    try {
                        if ((prices[i - k][stock][0] < prices[i][stock][0] && prices[i][stock][0] > prices[i + k][stock][0])) {
                            guess[i] += 1;
                        }
                        if ((prices[i - k][stock][0] > prices[i][stock][0] && prices[i][stock][0] < prices[i + k][stock][0])) {
                            guess[i] += 1;
                        }
                    } catch { }
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
                data[2] = 0;
            }
            if (prices.length > 20) {
                if (z < 5) {
                    let shares = Math.floor((-100000 + await Do(Game.ns, "ns.getServerMoneyAvailable", 'home')) / (await Do(Game.ns, "ns.stock.getAskPrice", stock)) / [2, 1, 1, 1, 1][z] / (shorts ? 2 : 1));
                    if (shares * (prices[prices.length - 1][stock][0] - prices[prices.length - 11][stock][0]) / 10 * 75 > 200000) {
                        while ((shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(Game.ns, "ns.stock.buyStock", stock, shares))) {
                            shares = Math.floor(shares * .9);
                        }
                        if (shares > 10) {
                            stall[stock] = 21;
                        }
                    }
                } else {
                    if (data[0] > 0 && stall[stock] <= 0) {
                        await Do(Game.ns, "ns.stock.sellStock", stock, data[0]);
                    }
                }
            }
            z += 1;
            data = await Do(Game.ns, "ns.stock.getPosition", stock);
            totalfunds += data[0] * await Do(Game.ns, "ns.stock.getBidPrice", stock);
            if (prices.length > 20) {
                if (shorts && (z + 1 == Object.keys(scores).length)) {
                    let shares = Math.floor((-100000 + await Do(Game.ns, "ns.getServerMoneyAvailable", 'home')) / (await Do(Game.ns, "ns.stock.getAskPrice", stock)));
                    while ((shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(Game.ns, "ns.stock.buyShort", stock, shares))) {
                        shares *= .99;
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
        await Game.ns.sleep(0);
    }
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
        Game.ns.run("jeek.js", 1, "--bn8b");
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
            await Do(Game.ns, "ns.kill", "jeek.js", "home", "--bn8b");
            await Game.winGame();
        }
        while (tickPrice == await Do(Game.ns, "ns.stock.getPurchaseCost", 'ECP', 1, "Long")) {
            await Game.ns.sleep(0);
        }
        tickPrice = await Do(Game.ns, "ns.stock.getPurchaseCost", 'ECP', 1, "Long");

        if ((!await Do(Game.ns, "ns.singularity.isBusy", "")) && (!await Do(Game.ns, "ns.singularity.isFocused", ""))) {
            let auglist = await Do(Game.ns, "ns.grafting.getGraftableAugmentations", "");
            let augs = {};
            for (let aug of auglist) {
                augs[aug] = await Do(Game.ns, "ns.singularity.getAugmentationStats", aug);
                augs[aug].price = await Do(Game.ns, "ns.grafting.getAugmentationGraftPrice", aug);
                augs[aug].time = await Do(Game.ns, "ns.grafting.getAugmentationGraftTime", aug);
            }
            let currentmoney = await Do(Game.ns, "ns.getServerMoneyAvailable", "home");
            auglist = auglist.filter(x => augs[x].price <= currentmoney / 2);
            auglist = auglist.sort((a, b) => augs[b].hacking_grow * augs[b].hacking_speed * (augs[b].hacking ** 2) * (augs[b].hacking_exp ** 2) * (augs[b].faction_rep ** .1) - augs[a].hacking_grow * (augs[a].hacking ** 2) * (augs[a].hacking_exp ** 2) * augs[a].hacking_speed * (augs[a].faction_rep ** .1));
            let currentaugs = await Do(Game.ns, "ns.singularity.getOwnedAugmentations", true);
            for (let i = 0; i < auglist.length; i++) {
                let good = true;
                let prereqs = await Do(Game.ns, "ns.singularity.getAugmentationPrereq", auglist[i]);
                for (let aug of prereqs) {
                    if (!(currentaugs.includes(aug))) {
                        good = false;
                    }
                }
                if (!good) {
                    auglist.splice(i, 1);
                    i -= 1;
                }
            }
            if ((await Do(Game.ns, "ns.grafting.getGraftableAugmentations", "")).includes("nickofolas Congruity Implant")) {
                if ((await Do(Game.ns, "ns.grafting.getAugmentationGraftPrice", "nickofolas Congruity Implant")) < (await Do(Game.ns, "ns.getServerMoneyAvailable", "home"))) {
                    auglist.unshift("nickofolas Congruity Implant");
                }
            }
            let playerhack = await (Game.Player.hacking);
            let ownedAugs = await Do(Game.ns, "ns.singularity.getOwnedAugmentations");
            if (playerhack > 3000 && ownedAugs.length < 30) {
                auglist = auglist.sort((a, b) => augs[a].time - augs[b].time);
            }
            if (auglist.length > 0) {
                if (!(((await Do(Game.ns, "ns.getPlayer", "")).city) == "New Tokyo"))
                    await Do(Game.ns, "ns.singularity.travelToCity", "New Tokyo");
                if (playerhack < 4000 || ownedAugs.length < 30)
                    await Do(Game.ns, "ns.grafting.graftAugmentation", auglist[0]);
            }
        }
        while ((await Do(Game.ns, "ns.singularity.getUpgradeHomeRamCost")) * 2 < await Do(Game.ns, "ns.getServerMoneyAvailable", "home") && await Do(Game.ns, "ns.singularity.upgradeHomeRam", ""));
        let chances = {};
        let portvalue = 0;
        for (let stock of symbols) {
            chances[stock] = (-.5 + await Do(Game.ns, "ns.stock.getForecast", stock)) * (await Do(Game.ns, "ns.stock.getVolatility", stock)) * (await Do(Game.ns, "ns.stock.getPrice", stock));
        }
        symbols = symbols.sort((a, b) => { return chances[b] - chances[a] });
        z = 1 - z;
        for (let stock of symbols) {
            if (z == 1) {
                let data = await Do(Game.ns, "ns.stock.getPosition", stock);
                if (chances[stock] > 0) {
                    let shares = Math.floor((-100000 + await Do(Game.ns, "ns.getServerMoneyAvailable", 'home')) / (await Do(Game.ns, "ns.stock.getAskPrice", stock)));
                    shares = Math.min(((await Do(Game.ns, "ns.stock.getMaxShares", stock))) - data[0] - data[2], shares);
                    //						if (shares > 100 && (200000 < await Do(Game.ns, "ns.getServerMoneyAvailable", "home"))) {
                    //							ns.toast("Trying to buy " + shares.toString() + " of " + stock);
                    //						}
                    while ((shares * (await Do(Game.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(Game.ns, "ns.stock.buyStock", stock, shares))) {
                        shares *= .99;
                    }
                } else {
                    if (data[0] > 0) {
                        await Do(Game.ns, "ns.stock.sellStock", stock, data[0]);
                    }
                }
            }
            portvalue += (await Do(Game.ns, "ns.stock.getPosition", stock))[0] * (await Do(Game.ns, "ns.stock.getPrice", stock));

        }
        symbols = symbols.reverse();
        for (let stock of symbols) {
            if (0 == z) {
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
                } else {
                    if (data[2] > 0) {
                        //							ns.toast("Unshorting " + stock);
                        await Do(Game.ns, "ns.stock.sellShort", stock, data[2]);
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
        if (playerhack > 3000 && ownedAugs.length >= 30 && !ownedAugs.includes("The Red Pill")) {
            while (((await (Game.Player.money)) > 100e9) && (!((await Do(Game.ns, "ns.singularity.checkFactionInvitations")).includes("Daedalus"))) && (!((await Do(Game.ns, "ns.getPlayer")).factions.includes("Daedalus")))) {
                await Game.ns.sleep(1000);
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
                        await Game.ns.sleep(0);
                        threads -= 1;
                        pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                    }
                    while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.sleep(0); }
                }
                //Game.ns.tprint(((await Do(Game.ns, "ns.stock.getForecast", i)) > .5 ? "Grow " : "Hack ") + i + " " + stockMapping[i], " ", (await Do(Game.ns, "ns.stock.getForecast", i)));
                while ((await Do(Game.ns, "ns.getServerMoneyAvailable", stockMapping[i])) * 4 / 3 > (await Do(Game.ns, "ns.getServerMaxMoney", stockMapping[i]))) {
                    let threads = Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["hackstock.js"]);
                    if (threads > 0) {
                        let pid = Game.ns.run((await Do(Game.ns, "ns.stock.getForecast", i)) > .5 ? "/temp/hack.js" : "/temp/hackstock.js", threads, stockMapping[i]);
                        while (pid == 0 && threads > 0) {
                            await Game.ns.sleep(0);
                            threads -= 1;
                            pid = Game.ns.run((await Do(Game.ns, "ns.stock.getForecast", i)) > .5 ? "/temp/hack.js" : "/temp/hackstock.js", threads, stockMapping[i]);
                        }
                        while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.sleep(0); }
                    }
                    while ((await Do(Game.ns, "ns.getServerMinSecurityLevel", stockMapping[i])) < (await Do(Game.ns, "ns.getServerSecurityLevel", stockMapping[i]))) {
                        //            ns.tprint("Weaken " + i + " " + mapping[i], " ", ns.stock.getForecast(i));
                        let threads = Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["weaken.js"]);
                        let pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                        while (pid == 0 && threads > 1) {
                            await Game.ns.sleep(0);
                            threads -= 1;
                            pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                        }
                        while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.sleep(0); }
                    }
                }
                while ((await Do(Game.ns, "ns.getServerMoneyAvailable", stockMapping[i])) < (await Do(Game.ns, "ns.getServerMaxMoney", stockMapping[i]))) {
                    let threads = Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["growstock.js"]);
                    let pid = threads > 0 ? Game.ns.run((await Do(Game.ns, "ns.stock.getForecast", i)) > .5 ? "/temp/growstock.js" : "/temp/grow.js", threads, stockMapping[i]) : 0;
                    while (pid == 0 && threads > 0) {
                        await Game.ns.sleep(0);
                        threads -= 1;
                        pid = Game.ns.run((await Do(Game.ns, "ns.stock.getForecast", i)) > .5 ? "/temp/growstock.js" : "/temp/grow.js", threads, stockMapping[i]);
                    }
                    while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.sleep(0); }
                    while ((await Do(Game.ns, "ns.getServerMinSecurityLevel", stockMapping[i])) < (await Do(Game.ns, "ns.getServerSecurityLevel", stockMapping[i]))) {
                        //                     ns.tprint("Weaken " + i + " " + mapping[i], " ", ns.stock.getForecast(i));
                        let threads = Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["weaken.js"]);
                        let pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                        while (pid == 0 && threads > 1) {
                            await Game.ns.sleep(0);
                            threads -= 1;
                            pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                        }
                        while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.sleep(0); }
                    }
                }
                while ((await Do(Game.ns, "ns.getServerMinSecurityLevel", stockMapping[i])) < (await Do(Game.ns, "ns.getServerSecurityLevel", stockMapping[i]))) {
                    let threads = Math.floor(((await Do(Game.ns, "ns.getServerMaxRam", "home")) - (await Do(Game.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["weaken.js"]);
                    let pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                    while (pid == 0 && threads > 1) {
                        await Game.ns.sleep(0);
                        threads -= 1;
                        pid = Game.ns.run("/temp/weaken.js", threads, stockMapping[i]);
                    }
                    while (await Do(Game.ns, "ns.isRunning", pid)) { await Game.ns.sleep(0); }
                }
                await Game.ns.sleep(0);
            }
        }
    }
}