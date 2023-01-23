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
];

import { WholeGame } from "WholeGame.js"

async function displayloop(displays) {
	while (true) {
		for (let i = 0 ; i < displays.length ; i++) {
			await (displays[i].updateDisplay());
		}
	}
}

/** @param {NS} ns */
export async function main(ns) {
	let Game = new WholeGame(ns);
	var cmdlineargs = ns.flags(cmdlineflags);
	let promises = [];
	if (cmdlineargs['endlessass']) {
		promises.push(Game.Debug.endlessAss());
	}
	if (cmdlineargs['roulettestart']) {
		promises.push(Game.roulettestart());
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
		promises.push(Game.bn7());
	}
	if (cmdlineargs['bn8']) {
		promises.push(Game.bn8());
		promises.push(Game.bn8hackloop());
	}
	let displays = [];
	if (cmdlineargs['stockdisplay']) {
		displays.push(Game.StockMarket);
		await (displays[displays.length - 1].createDisplay());
	}
	if (cmdlineargs['bbdisplay']) {
		displays.push(Game.Bladeburner);
		await (displays[displays.length - 1].createDisplay());
	}
	if (cmdlineargs['ps']) {
		displays.push(Game.ProcessList);
		await (displays[displays.length - 1].createDisplay());
	}
	if (cmdlineargs['augs']) {
		displays.push(Game.Augmentations);
		await (displays[displays.length - 1].createDisplay());
	}
	if (displays.length > 0) {
		promises.push(displayloop(displays));
	}
	await Promise.race(promises);
}
