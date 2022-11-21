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
	["augs", false] // Augmentations
];

import { WholeGame } from "WholeGame.js"

/** @param {NS} ns */
export async function main(ns) {
	let Game = new WholeGame(ns);
	var cmdlineargs = ns.flags(cmdlineflags);
	if (cmdlineargs['roulettestart']) {
		await Game.roulettestart();
	}
	if (cmdlineargs['roulette']) {
		await Game.Casino.roulette();
	}
	if (cmdlineargs['contracts']) {
		await Game.Contracts.solve();
	}
	if (cmdlineargs['bn7']) {
		while (true)
			await Game.bn7();
	}
	if (cmdlineargs['bn8']) {
		await Game.bn8();
	}
	if (cmdlineargs['bn8b']) {
		await Game.bn8hackloop();
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
		while (true) {
			for (let i = 0; i < displays.length; i++) {
				await (displays[i].updateDisplay());
			}
		}
	}
}
