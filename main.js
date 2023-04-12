/** @param {NS} ns */

const cmdlineflags = [
	["logbox", false], //box.js
	["roulettestart", false], // Play roulette and buy ram and reset until you can't buy RAM
	["roulette", false], // Play roulette
	["contracts", false], // Solve contracts
	["bn7", false],  // Bladeburner Loop
	["bn8", false],  // Main Stocks Loop
	["bn8b", false], // Stockhack Loop
	["bbdisplay", false], //Bladeburner Display
	["stockdisplay", false], // Display Stock Info
	["stockfilter", false], // Only show owned stocks
	["ps", false],  // Process List
	["augs", false], // Augmentations
	["popemall", false], // Get access to all possible servers
	["endlessass", false], // Endless Assassinations (CHEAT)
	["help", "none"],
	["cloneandbuild", false], // Clone and build
	["build", false],
    ["scam", false],
    ["guide", false], // Use code based on Mughur's Guide
    ["jeek", false], // Jeek's Strategy
    ["jakobag", false], // Use Jakob's round 1 agriculture method
    ["update", false]
];

import { WholeGame } from "WholeGame.js"

async function displayloop(display) {
	while (true) {
        await (display.updateDisplay());
	}
}

/** @param {NS} ns */
export async function main(ns) {
	let Game = new WholeGame(ns);
	var cmdlineargs = ns.flags(cmdlineflags);
	let promises = [];
	if (cmdlineargs['help'] != "none") {
		Game.Jeekipedia.lookup(cmdlineargs['help']);
	}
	if (cmdlineargs['cloneandbuild']) {
		await (Game.BuildProcess.doitall());
		ns.exit();
	}
	if (cmdlineargs['build']) {
		await (Game.BuildProcess.build());
		await (Game.BuildProcess.transpile());
		ns.exit();
	} /*
    if (cmdlineargs['scam']) {
        settings['scam'] = true;
        settings['Software'] = {'name': 'Software', 'plan': 'Scam'};
        settings['Real Estate'] = {'name': 'Real Estate', 'plan': 'Scam'};
        settings['Food'] = {'name': 'Food', 'plan': 'Guide'};
        Game['Corporation'].settings = settings;
        Game['Corporation'].Start();
        await ns.asleep(1000);
        while (Game['Corporation'].started == false) {
            ns.toast("Corporation not started yet.");
            await ns.asleep(60000);
        }
        if (Game['Corporation'].round == 1)
            await Game['Corporation'].StartDivision("Software");
        if (Game['Corporation'].round == 2)
            await Game['Corporation'].StartDivision(Game['Corporation'].funds < 680e9 ? "Software" : "Real Estate");
        if (Game['Corporation'].round == 3)
            await Game['Corporation'].StartDivision("Real Estate");
		Game['Corporation'].StartDivision("Food");
        while (true) {
            await ns.asleep(10000);
        }
    } */
    if (cmdlineargs['guide']) {
        settings.baseOffers = [210e9, 5e12, 800e12, 500e15];
        settings['Agriculture'] = {'name': 'Agriculture', 'plan': 'Guide'};
        settings['Tobacco'] = {'name': 'Tobacco', 'plan': 'Guide'};
        Game['Corporation'].settings = settings;
        Game['Corporation'].Start();
        await ns.asleep(1000);
        while (Game['Corporation'].started == false) {
            ns.toast("Corporation not started yet.");
            await ns.asleep(60000);
        }
        Game['Corporation'].StartDivision("Agriculture");
        while (Game['Corporation'].round < 3) {
            await ns.asleep(10000);
        }
        Game['Corporation'].StartDivision("Tobacco");
        while (true) {
            await ns.asleep(10000);
        }
    }
/*    if (cmdlineargs['jeek'] || (cmdlineargs['jeek'] + cmdlineargs['guide'] + cmdlineargs['scam'] == 0)) {
        settings.baseOffers = [270e9, 900e9, 5e12, 1e15];
        settings['Agriculture'] = {'name': 'Agriculture', 'plan': 'Jeek'};
        settings['Food'] = {'name': 'Food', 'plan': 'Jeek'};
        Game['Corporation'].settings = settings;
        Game['Corporation'].Start();
        await ns.asleep(1000);
        while (Game['Corporation'].started == false) {
            ns.toast("Corporation not started yet.");
            await ns.asleep(60000);
        }
        Game['Corporation'].StartDivision("Agriculture");
        while (Game['Corporation'].round < 2) {
            await ns.asleep(10000);
        }
        while (!Game['Corporation'].c.hasUnlockUpgrade("Export")) {
            await ns.asleep(100);
            if (Game['Corporation'].c.getUnlockUpgradeCost("Export") <= Corp.funds && !Corp.c.hasUnlockUpgrade("Export")) {
                Game['Corporation'].c.unlockUpgrade("Export");
            }
        }
        Game['Corporation'].StartDivision("Water Utilities");
        while (Game['Corporation'].round < 3) {
            await ns.asleep(10000);
        }
        Game['Corporation'].StartDivision("Mining");
        await Game['Corporation'].WaitOneLoop();
        Game['Corporation'].StartDivision("Computer Hardware");
        while (Game['Corporation'].round < 4) {
            await ns.asleep(10000);
        }
        Game['Corporation'].StartDivision("Food");
        Game['Corporation'].StartDivision("Robotics");
        while (true) {
            await ns.asleep(10000);
        }
    } */
	if (cmdlineargs['endlessass']) {
		promises.push(Game.Debug.endlessAss());
	}
	if (cmdlineargs['roulettestart']) {
		await Game.roulettestart();
	}
	if (cmdlineargs['popemall']) {
		promises.push(Game.Servers.pop_them_all());
	}
	if (cmdlineargs['roulette']) {
		promises.push(Game.Casino.roulette());
	}
	if (cmdlineargs['contracts']) {
		promises.push(Game.Contracts.solve());
	}
	if (cmdlineargs['bn7']) {
		promises.push(Game.bn2());
		promises.push(Game.bn7());
		promises.push(Game.Hacknet.loop());
	}
	if (cmdlineargs['bn8']) {
		promises.push(Game.bn8());
	}
	if (cmdlineargs['bn7'] || cmdlineargs['bn8']) {
    	promises.push(Game.Contracts.loop());
    	promises.push(Game.Servers.serverbox());
	}
	let displays = [];
	if (cmdlineargs['stockdisplay']) {
		displays.push(Game.StockMarket);
		await (displays[displays.length - 1].createDisplay());
		promises.push(displayloop(displays[displays.length-1]));
	}
	if (cmdlineargs['bbdisplay']) {
		displays.push(Game.Bladeburner);
		await (displays[displays.length - 1].createDisplay());
		promises.push(displayloop(displays[displays.length-1]));
	}
	if (cmdlineargs['ps']) {
		displays.push(Game.ProcessList);
		await (displays[displays.length - 1].createDisplay());
		promises.push(displayloop(displays[displays.length-1]));
	}
	if (cmdlineargs['augs']) {
		displays.push(Game.Augmentations);
		await (displays[displays.length - 1].createDisplay());
		promises.push(displayloop(displays[displays.length-1]));
	}
	ns.tprint(await Promise.race(promises));
}
