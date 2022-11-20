import { Augmentations } from "Augmentations.js";
import { Bladeburner }  from "Bladeburner.js";
import { CacheServer } from "CacheServer.js";
import { Casino } from "Casino.js";
import { Contracts } from "Contracts.js";
import { Corp } from "Corp.js";
import { DebugStuff } from "DebugStuff.js";
import { Hacknet } from "Hacknet.js";
import { Jeekipedia } from "Jeekipedia.js";
import { Jobs } from "Jobs.js";
import { Player } from "Player.js";
import { ProcessList } from "ProcessList.js";
import { Servers } from "Servers.js";
import { Sleeves } from "Sleeves.js";
import { StockMarket } from "StockMarket.js";
import "Windows.js";
import "Worker.js";

export class WholeGame {
	constructor(ns) {
		this.ns = ns;
		this.Servers = new Servers(ns, this);
		this.Debug = new DebugStuff(ns, this);
		this.Contracts = new Contracts(ns, this);
		this.Hacknet = new Hacknet(ns, this);
		this.StockMarket = new StockMarket(ns, this);
		this.ProcessList = new ProcessList(ns, this);
		this.Augmentations = new Augmentations(ns, this);
		this.Player = new Player(ns, this);
		this.Corp = new Corp(ns, this);
		this.Jeekipedia = new Jeekipedia(ns, this);
		this.Casino = new Casino(ns, this);
		this.Bladeburner = new Bladeburner(ns, this);
		this.Sleeves = new Sleeves(ns, this);
	}
	get bitNodeN() {
		return (async () => {
			try {
				return (await (this.Player.bitNodeN));
			} catch (e) {
				return 1;
			}
		})();
	}
	async roulettestart() {
		if ((await Do(this.ns, "ns.getPlayer")).bitNodeN == 8) {
			if ((await Do(this.ns, "ns.singularity.getOwnedSourceFiles")).filter(x => x.n == 10).length > 0) {
				for (let i = 0; i < await Do(this.ns, "ns.sleeve.getNumSleeves"); i++) {
					await Do(this.ns, "ns.sleeve.setToCommitCrime", i, "Mug");
				}
			}
		}
		await Do(this.ns, "ns.nuke", "n00dles");
		this.ns.run("/temp/weaken.js", Math.floor((await (this.Servers['home'].maxRam)) / 2), "n00dles");
		await this.Casino.roulette();
		let restart = false;
		for (let city of ["Chongqing", "New Tokyo", "Volhaven", "Ishima"]) {
			if (((["Chongqing", "New Tokyo", "Ishima"].includes(city)) && !((await Do(this.ns, "ns.getPlayer"))).factions.includes("Sector-12") && !((await Do(this.ns, "ns.getPlayer"))).factions.includes("Aevum") && !((await Do(this.ns, "ns.getPlayer"))).factions.includes("Volhaven")) || ((["Sector-12", "Aevum"].includes(city)) && !((await Do(this.ns, "ns.getPlayer"))).factions.includes("Chongqing") && !((await Do(this.ns, "ns.getPlayer"))).factions.includes("Ishima") && !((await Do(this.ns, "ns.getPlayer"))).factions.includes("New Tokyo") && !((await Do(this.ns, "ns.getPlayer"))).factions.includes("Volhaven")) || ((["Volhaven"].includes(city)) && !((await Do(this.ns, "ns.getPlayer"))).factions.includes("Chongqing") && !((await Do(this.ns, "ns.getPlayer"))).factions.includes("Ishima") && !((await Do(this.ns, "ns.getPlayer"))).factions.includes("New Tokyo") && !((await Do(this.ns, "ns.getPlayer"))).factions.includes("Sector-12") && !((await Do(this.ns, "ns.getPlayer"))).factions.includes("Aevum"))) {
				if (!(await Do(this.ns, "ns.getPlayer")).factions.includes(city)) {
					await Do(this.ns, "ns.singularity.travelToCity", city);
					while (!(await Do(this.ns, "ns.singularity.checkFactionInvitations")).includes(city))
						await this.ns.sleep(0);
				}
				if (city == "Chongqing")
					while ((await (this.Player.hacking)) >= 50 && !(await Do(this.ns, "ns.singularity.checkFactionInvitations")).includes("Tian Di Hui")) {
						await this.ns.sleep(0);
					}
			}
		}
		if ((await Do(this.ns, "ns.getPlayer")).bitNodeN == 8) {
			if (!await Do(this.ns, "ns.stock.has4SData")) {
				await Do(this.ns, "ns.stock.purchase4SMarketData");
				restart = true;
			}
		}
		while (await Do(this.ns, "ns.singularity.upgradeHomeRam")) {
			restart = true;
		}
		while (await Do(this.ns, "ns.singularity.upgradeHomeCores")) {
			restart = true;
		}
		if ((await Do(this.ns, "ns.getPlayer")).bitNodeN == 8) {
			for (let faction of (await Do(this.ns, "ns.singularity.checkFactionInvitations")).map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value)) {
				if ((await Do(this.ns, "ns.singularity.checkFactionInvitations")).includes(faction)) {
					await Do(this.ns, "ns.singularity.joinFaction", faction);
				}
			}
			for (let faction of (await Do(this.ns, "ns.getPlayer")).factions) {
				let factfavor = await Do(this.ns, "ns.singularity.getFactionFavor", faction);
				for (let aug of (await Do(this.ns, "ns.singularity.getAugmentationsFromFaction", faction)).reverse()) {
					if (aug == "NeuroFlux Governor" || !(await Do(this.ns, "ns.singularity.getOwnedAugmentations", true)).includes(aug)) {
						let neededrep = Math.max(0, (await Do(this.ns, "ns.singularity.getAugmentationRepReq", aug)) - (await Do(this.ns, "ns.singularity.getFactionRep", faction)) / 1e6 * (1 + factfavor / 100));
						if ((await Do(this.ns, "ns.singularity.getAugmentationPrice", aug)) + neededrep * 1e6 / (1 + factfavor / 100) <= await (this.Player.money)) {
							await Do(this.ns, "ns.singularity.donateToFaction", faction, Math.ceil(neededrep * 1e6 / (1 + factfavor / 100)));
							await Do(this.ns, "ns.singularity.purchaseAugmentation", faction, aug);
							this.ns.toast("Installing " + aug + " from " + faction);
							restart = true;
						}
					}
				}
			}
			let cash = await (this.Player.money);
			if (cash < 10000000000) {
				for (let faction of (await Do(this.ns, "ns.getPlayer")).factions) {
					await Do(this.ns, "ns.singularity.donateToFaction", faction, cash / ((await Do(this.ns, "ns.getPlayer")).factions.length));
				}
			}
		}
		if (restart) {
			await this.SoftReset();
		}
	}
	async win() {
		let parent = {};
		let path = ["The-Cave"];
		while (path[0] != "home") {
			path.unshift((await Do(this.ns, "ns.scan", path[0]))[0]);
			this.ns.tprint(path);
		}
		while (path.length > 0) {
			await Do(this.ns, "ns.singularity.connect", path.shift());
		}
		await Do(this.ns, "ns.singularity.connect", "w0r1d_d43m0n");
		for (let i of ["ns.brutessh", "ns.ftpcrack", "ns.sqlinject", "ns.relaysmtp", "ns.httpworm", "ns.nuke"]) {
			await Do(this.ns, i, "w0r1d_d43m0n");
		}
		await Do(this.ns, "await ns.singularity.installBackdoor");
	}
	async SoftReset() {
		writeIfNotSame(this.ns, "/temp/restart.js", "export async function main(ns) {ns.spawn('jeek.js', 1, \"" + this.ns.args.join('","') + "\");}")
		await Do(this.ns, "ns.singularity.softReset", "/temp/restart.js");
	}
	async bn7() {
		let numberOfSleeves = await (this.Sleeves.numSleeves);
		await this.Sleeves.bbCombatAugs();
		await this.Player.trainCombatStatsUpTo(100, true); // The true indicates to drag sleeves along
		if (!await this.Bladeburner.start())
			return false;
		await this.Bladeburner.UpgradeSkills();
		await this.Sleeves.bbEverybody(null, "Field analysis"); // The null is the city to travel to, not needed in this case
		await this.Bladeburner.hardStop();
		while ((await (this.Bladeburner.contractCount)) > 0) {
			await this.Player.hospitalizeIfNeeded(); // HP
			await this.Player.joinFactionIfInvited("Bladeburners");
			await this.Bladeburner.recoverIfNecessary(); // Stamina
await this.Bladeburner.UpgradeSkills();
			let best = [];
			for (let city of CITIES) {
				await Do(this.ns, "ns.bladeburner.switchCity", city);
				await this.Bladeburner.deescalate(); // Reduces Chaos to 40 if higher
				for (let operation of await Do(this.ns, "ns.bladeburner.getOperationNames")) {
					if ((await Do(this.ns, 'ns.bladeburner.getActionCountRemaining', "Operation", operation)) > 0) {
						for (let level = 1; level <= await Do(this.ns, "ns.bladeburner.getActionMaxLevel", "Operation", operation); level++) {
							let chance = (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Operation", operation));
							if (chance[0] + .01 < chance[1]) {
								await (this.Bladeburner.hardStop());
								await Do(this.ns, "ns.bladeburner.startAction", "General", "Field Analysis");
								for (let i = 0; i < numberOfSleeves; i++) {
									await this.Sleeves.bbGoHereAnd(i, city, "Field analysis");
								}
								while (chance[0] + .01 < chance[1]) {
									await this.ns.sleep(1000);
									chance = await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Operation", operation);
								}
							}
							await Do(this.ns, "ns.bladeburner.setActionLevel", "Operation", operation, level);
							if ((await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Operation", operation))[0] > .95)
								best.push([level, "Operation", operation, city, (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Operation", operation)).reduce((a, b) => (a + b) / 2) * (await Do(this.ns, "ns.bladeburner.getActionRepGain", "Operation", operation, level)) / (await Do(this.ns, "ns.bladeburner.getActionTime", "Operation", operation))]);
						}
					}
				}
				for (let contract of await Do(this.ns, "ns.bladeburner.getContractNames")) {
					if ((await Do(this.ns, 'ns.bladeburner.getActionCountRemaining', "Contract", contract)) > 0) {
						for (let level = 1; level <= await Do(this.ns, "ns.bladeburner.getActionMaxLevel", "Contract", contract); level++) {
							let chance = (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Contract", contract));
							if (chance[0] + .01 < chance[1]) {
								await (this.Bladeburner.hardStop());
								await Do(this.ns, "ns.bladeburner.startAction", "General", "Field Analysis");
								for (let i = 0; i < numberOfSleeves; i++) {
									await this.Sleeves.bbGoHereAnd(i, city, "Field analysis");
								}
								while (chance[0] + .01 < chance[1]) {
									await this.ns.sleep(await Do(this.ns, "ns.bladeburner.getActionTime", "General", "Field Analysis"));
									chance = await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Contract", contract);
								}
							}
							await Do(this.ns, "ns.bladeburner.setActionLevel", "Contract", contract, level);
							best.push([level, "Contract", contract, city, (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Contract", contract)).reduce((a, b) => (a + b) / 2) * (await Do(this.ns, "ns.bladeburner.getActionRepGain", "Contract", contract, level)) / (await Do(this.ns, "ns.bladeburner.getActionTime", "Contract", contract))]);
						}
					}
				}
			}
			best = best.filter(x => !["Sting Operation", "Raid"].includes(x[2]));
			best = best.sort((a, b) => a[4] - b[4]);
			best = best.sort((a, b) => { if (a[2] == "Assassination" && b[2] != "Assassination") return 1; if (a[2] != "Assassination" && b[2] == "Assassination") return -1; if (a[1] == "Operation" && b[1] != "Operation") return 1; if (a[1] != "Operation" && b[1] == "Operation") return -1; return 0; });
			//			best = best.sort((a, b) => { if (a[2] == "Assassination" && b[1] != "Assassination") return 1; if (a[1] != "Assassination" && b[1] == "Assassination") return -1; return 0; });
			await this.Sleeves.bbEverybody(null, "Support main sleeve");
			await Do(this.ns, "ns.bladeburner.setTeamSize", "Black Op", best[best.length - 1][2], numberOfSleeves);
			let nextBlackOp = await (this.Bladeburner.nextBlackOp);
			//this.ns.tprint(nextBlackOp, " ", (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", nextBlackOp)));
			if ((await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", "Operation Ultron"))[0] > .99) {
			if ((await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", nextBlackOp))[0] > (["Operation Centurion", "Operation Vindictus", "Operation Daedalus"].includes(nextBlackOp) ? .2 : .99)) {
				best.push([0, "Black Op", nextBlackOp, "Sector-12"]);
			}
			}
			this.ns.tprint(best[best.length - 1]);
			if (best[best.length - 1][1] != "Black Op") {
				await Do(this.ns, "ns.bladeburner.setActionAutolevel", best[best.length - 1][1], best[best.length - 1][2], false);
				if (best[best.length - 1][3] != await Do(this.ns, "ns.bladeburner.getCity")) {
					await Do(this.ns, "ns.bladeburner.switchCity", best[best.length - 1][3]);
				}
			}
			await this.Bladeburner.deescalate();
			if (best[best.length - 1][1] != "Black Op") {
				await Do(this.ns, "ns.bladeburner.setActionLevel", best[best.length - 1][1], best[best.length - 1][2], best[best.length - 1][0]);
			}
			await (this.Bladeburner.hardStop());
			if (best[best.length - 1][1] == "Black Op") {
				await this.Sleeves.bbEverybody(null, "Support main sleeve");
				await Do(this.ns, "ns.bladeburner.setTeamSize", "Black Op", best[best.length - 1][2], numberOfSleeves);
			}
			await Do(this.ns, "ns.bladeburner.startAction", best[best.length - 1][1], best[best.length - 1][2]);
			if (best[best.length - 1][1] != "Black Op") {
				for (let i = 0; i < numberOfSleeves; i++) {
					await Do(this.ns, "ns.sleeve.setToBladeburnerAction", i, "Field analysis");
				}
				let shox = await this.Sleeves.bbCombatSort();
				let cur = 0;
				if ((await Do(this.ns, "ns.bladeburner.getActionCountRemaining", "Contract", "Retirement")) >= 30) {
					await this.Sleeves.bbGoHereAnd(shox[cur], best.filter(x => x[1] == "Contract").reverse()[0][3], "Take on contracts", best.filter(x => x[2] == "Retirement").reverse()[0][2]);
					cur += 1;
				}
				if ((await Do(this.ns, "ns.bladeburner.getActionCountRemaining", "Contract", "Bounty Hunter")) >= 30) {
					await this.Sleeves.bbGoHereAnd(shox[cur], best.filter(x => x[1] == "Contract").reverse()[0][3], "Take on contracts", best.filter(x => x[2] == "Bounty Hunter").reverse()[0][2]);
					cur += 1;
				}
				if ((await Do(this.ns, "ns.bladeburner.getActionCountRemaining", "Contract", "Tracking")) >= 100) {
					await this.Sleeves.bbGoHereAnd(shox[cur], best.filter(x => x[1] == "Contract").reverse()[0][3], "Take on contracts", best.filter(x => x[2] == "Tracking").reverse()[0][2]);
					cur += 1;
				}
				if (shox.length > cur) {
					let cityChaos = await DoAll(this.ns, "ns.bladeburner.getCityChaos", CITIES);
					await this.Sleeves.bbGoHereAnd(shox[cur], best.filter(x => x[1] == "Contract").reverse()[0][3], "Infiltrate synthoids");
					let ii = 0;
					for (let i = cur + 1; i < shox.length; i++) {
						await this.Sleeves.bbGoHereAnd(shox[i], CITIES.sort((a, b) => -cityChaos[a] + cityChaos[b])[ii % 6], ((await Do(this.ns, "ns.bladeburner.getCityChaos", CITIES.sort((a, b) => -cityChaos[a] + cityChaos[b])[ii % 6]))) < 20 ? "Field analysis" : "Diplomacy");
						ii += 1;
					}
				}
			}
			while ((await Do(this.ns, "ns.bladeburner.getCurrentAction")).type != "Idle" && (.6 < (await Do(this.ns, "ns.bladeburner.getStamina")).reduce((a, b) => a / b)) && ((await Do(this.ns, "ns.bladeburner.getActionCountRemaining", best[best.length - 1][1], best[best.length - 1][2])) > 0)) {
				for (let i = 0; i < numberOfSleeves; i++) {
					if (null == (await Do(this.ns, "ns.sleeve.getTask", i))) {
						await this.Sleeves.bbGoHereAnd(i, null, ((await Do(this.ns, "ns.bladeburner.getCityChaos", ((await Do(this.ns, "ns.sleeve.getInformation", i)).city)))) < 20 ? "Infiltrate synthoids" : "Diplomacy");
					}
				}
				if (best[best.length-1][0] == "Black Op" && .2 > ((await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", nextBlackOp))[0]))
				break;
				await this.Sleeves.bbCombatAugs();
				await this.Player.hospitalizeIfNeeded();
				await this.Bladeburner.UpgradeSkills();
				await this.Contracts.solve();
				await this.Hacknet.loop("Exchange for Bladeburner Rank");
				await this.Hacknet.loop("Exchange for Bladeburner SP");
				await this.Hacknet.loop("Generate Coding Contract");
				if (.999 < await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", nextBlackOp))
					break;
				if (best[best.length - 1][0] < await Do(this.ns, "ns.bladeburner.getActionMaxLevel", best[best.length - 1][1], best[best.length - 1][2])) {
					if (1 == (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", best[best.length - 1][1], best[best.length - 1][2]))[0]) {
						best[best.length - 1][0] += 1;
						await Do(this.ns, "ns.bladeburner.setActionLevel", best[best.length - 1][1], best[best.length - 1][2], best[best.length - 1][0]);
					}
				}
				if (best[best.length - 1][1] == "Operation") {
					if (.94 > (((await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Operation", best[best.length - 1][2])))[0])) {
						break;
						best[best.length - 1][0] -= 1;
						if (best[best.length - 1][0] == 0) break;
						await Do(this.ns, "ns.bladeburner.setActionLevel", best[best.length - 1][1], best[best.length - 1][2], best[best.length - 1][0]);
					}
				}
				if (40 <= await Do(this.ns, "ns.bladeburner.getCityChaos", await Do(this.ns, "ns.bladeburner.getCity")))
					break;
				await this.ns.sleep(1000);
			}
			await (this.Bladeburner.hardStop());
		}
		await this.Bladeburner.inciteViolenceEverywhere();
	}
	async bn8() {
		let shorts = false;
		let stall = {};
		let prices = [];
		let symbols = await this.StockMarket.symbols;
		let tickPrice = 0;
		let filesize = {
			"grow.js": await Do(this.ns, "ns.getScriptRam", "/temp/grow.js"),
			"growstock.js": await Do(this.ns, "ns.getScriptRam", "/temp/growstock.js"),
			"hack.js": await Do(this.ns, "ns.getScriptRam", "/temp/back.js"),
			"hackstock.js": await Do(this.ns, "ns.getScriptRam", "/temp/hackstock.js"),
			"weaken.js": await Do(this.ns, "ns.getScriptRam", "/temp/weaken.js")
		}
		let maxram = {};
		let neededports = {};
		let reqhackinglevel = {};
		maxram["home"] = await this.Servers['home'].maxRam;
		for (let server of Object.keys(stockMapping)) {
			neededports[stockMapping[server]] = await Do(this.ns, "ns.getServerNumPortsRequired", stockMapping[server]);
			reqhackinglevel[stockMapping[server]] = await Do(this.ns, "ns.getServerRequiredHackingLevel", stockMapping[server]);
		}
		let scores = {};
		let report = {};
		while ((!await Do(this.ns, "ns.stock.has4SData", "")) || (!await Do(this.ns, "ns.stock.has4SDataTIXAPI", ""))) {
			while (tickPrice == await Do(this.ns, "ns.stock.getPurchaseCost", 'ECP', 1, "Long")) {
				await this.ns.sleep(0);
			}
			tickPrice = await Do(this.ns, "ns.stock.getPurchaseCost", 'ECP', 1, "Long");
			prices.push({});
			if (prices.length > 75) {
				prices.shift();
			}
			let guess = (new Array(76)).fill(0);
			for (let stock of symbols) {
				prices[prices.length - 1][stock] = [await Do(this.ns, "ns.stock.getPurchaseCost", stock, 1, "Long"), await Do(this.ns, "ns.stock.getPurchaseCost", stock, 1, "Short")];
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
					this.ns.run("/temp/hack.js", 1)
			}
			let ordered = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
			let z = 0;
			let totalfunds = 0;
			let startmoney = await Do(this.ns, "ns.getServerMoneyAvailable", 'home');
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
				if (await Do(this.ns, "ns.singularity.purchaseTor", "")) {
					let cost = await Do(this.ns, "ns.singularity.getDarkwebProgramCost", program[0]);
					if ((0 < cost) && (cost * 2 < ((await Do(this.ns, "ns.getPlayer", "")).money))) {
						await Do(this.ns, "ns.singularity.purchaseProgram", program[0]);
					}
				}
			}
			for (let stock of sorted) {
				if (Object.keys(stockMapping).includes(stock) && !await Do(this.ns, "ns.hasRootAccess", stockMapping[stock])) {
					let files = await Do(this.ns, "ns.ls", "home");
					let z = 0;
					if (files.includes("BruteSSH.exe")) {
						await Do(this.ns, "ns.brutessh", stockMapping[stock]);
						z += 1;
					}
					if (files.includes("SQLInject.exe")) {
						await Do(this.ns, "ns.sqlinject", stockMapping[stock]);
						z += 1;
					}
					if (files.includes("HTTPWorm.exe")) {
						await Do(this.ns, "ns.httpworm", stockMapping[stock]);
						z += 1;
					}
					if (files.includes("FTPCrack.exe")) {
						await Do(this.ns, "ns.ftpcrack", stockMapping[stock]);
						z += 1;
					}
					if (files.includes("relaySMTP.exe")) {
						await Do(this.ns, "ns.relaysmtp", stockMapping[stock]);
						z += 1;
					}
					if (z >= neededports[stockMapping[stock]]) {
						await Do(this.ns, "ns.nuke", stockMapping[stock]);
					}
				}
				if (!(stall[stock] > 0)) {
					stall[stock] = 0;
				}
				if (Object.keys(stockMapping).includes(stock) && await Do(this.ns, "ns.hasRootAccess", stockMapping[stock]) && ((await (this.Player.hacking)) >= reqhackinglevel[stockMapping[stock]])) {
					if (z == 0) {
						this.ns.run("/temp/growstock.js", Math.max(1, Math.floor(.5 * (maxram["home"] - (await Do(this.ns, "ns.getServerUsedRam", "home")) - 10) / filesize["growstock.js"])), stockMapping[stock]);
					} else {
						if (z == sorted.length - 1) {
							this.ns.run("/temp/hackstock.js", Math.max(1, Math.floor(.5 * (maxram["home"] - (await Do(this.ns, "ns.getServerUsedRam", "home")) - 10) / filesize["hackstock.js"])), stockMapping[stock]);
						} else {
							this.ns.run("/temp/weaken.js", Math.max(1, Math.floor(.5 * (maxram["home"] - (await Do(this.ns, "ns.getServerUsedRam", "home")) - 10) / filesize["weaken.js"])), stockMapping[stock]);
						}
					}
				}
				stall[stock] -= z / 10;
				let data = await this.StockMarket.position(stock);
				if ((scores[stock] > .5 || z < 20) && data[2] > 0) {
					await Do(this.ns, "ns.stock.sellShort", stock, data[2]);
					data[2] = 0;
				}
				if (prices.length > 20) {
					if (z < 5) {
						let shares = Math.floor((-100000 + await Do(this.ns, "ns.getServerMoneyAvailable", 'home')) / (await Do(this.ns, "ns.stock.getAskPrice", stock)) / [2, 1, 1, 1, 1][z] / (shorts ? 2 : 1));
						if (shares * (prices[prices.length - 1][stock][0] - prices[prices.length - 11][stock][0]) / 10 * 75 > 200000) {
							while ((shares * (await Do(this.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(this.ns, "ns.stock.buyStock", stock, shares))) {
								shares = Math.floor(shares * .9);
							}
							if (shares > 10) {
								stall[stock] = 21;
							}
						}
					} else {
						if (data[0] > 0 && stall[stock] <= 0) {
							await Do(this.ns, "ns.stock.sellStock", stock, data[0]);
						}
					}
				}
				z += 1;
				data = await Do(this.ns, "ns.stock.getPosition", stock);
				totalfunds += data[0] * await Do(this.ns, "ns.stock.getBidPrice", stock);
				if (prices.length > 20) {
					if (shorts && (z + 1 == Object.keys(scores).length)) {
						let shares = Math.floor((-100000 + await Do(this.ns, "ns.getServerMoneyAvailable", 'home')) / (await Do(this.ns, "ns.stock.getAskPrice", stock)));
						while ((shares * (await Do(this.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(this.ns, "ns.stock.buyShort", stock, shares))) {
							shares *= .99;
						}
					}
				}
				totalfunds += data[2] * (2 * data[3] - (await Do(this.ns, "ns.stock.getAskPrice", stock)));

			}
			if (!await Do(this.ns, "ns.stock.has4SData")) {
				try {
					await Do(this.ns, "ns.stock.purchase4SMarketData", "");
				} catch { }
			}
			if (!await Do(this.ns, "ns.stock.has4SDataTIXAPI")) {
				try {
					await Do(this.ns, "ns.stock.purchase4SMarketDataTixApi", "");
				} catch { }
			}
			await this.ns.sleep(0);
		}
		let z = 0;
		while (true) {
			for (let program of [
				["BruteSSH.exe", "ns.brutessh"],
				["FTPCrack.exe", "ns.ftpcrack"],
				["relaySMTP.exe", "ns.relaysmtp"],
				["HTTPWorm.exe", "ns.httpworm"],
				["SQLInject.exe", "ns.sqlinject"]]) {
				if (await Do(this.ns, "ns.singularity.purchaseTor", "")) {
					let cost = await Do(this.ns, "ns.singularity.getDarkwebProgramCost", program[0]);
					if ((0 < cost) && (cost * 2 < await (this.Player.money))) {
						await Do(this.ns, "ns.singularity.purchaseProgram", program[0]);
					}
				}
			}
			this.ns.run("jeek.js", 1, "--bn8b");
			let files = await Do(this.ns, "ns.ls", "home");
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
			if (zz >= 5 && ((await (this.Player.hacking)) > 3000) && (await Do(this.ns, "ns.singularity.getOwnedAugmentations")).includes("The Red Pill")) {
				await Do(this.ns, "ns.kill", "jeek.js", "home", "--bn8b");
				await this.win();
			}
			while (tickPrice == await Do(this.ns, "ns.stock.getPurchaseCost", 'ECP', 1, "Long")) {
				await this.ns.sleep(0);
			}
			tickPrice = await Do(this.ns, "ns.stock.getPurchaseCost", 'ECP', 1, "Long");

			if ((!await Do(this.ns, "ns.singularity.isBusy", "")) && (!await Do(this.ns, "ns.singularity.isFocused", ""))) {
				let auglist = await Do(this.ns, "ns.grafting.getGraftableAugmentations", "");
				let augs = {};
				for (let aug of auglist) {
					augs[aug] = await Do(this.ns, "ns.singularity.getAugmentationStats", aug);
					augs[aug].price = await Do(this.ns, "ns.grafting.getAugmentationGraftPrice", aug);
					augs[aug].time = await Do(this.ns, "ns.grafting.getAugmentationGraftTime", aug);
				}
				let currentmoney = await Do(this.ns, "ns.getServerMoneyAvailable", "home");
				auglist = auglist.filter(x => augs[x].price <= currentmoney / 2);
				auglist = auglist.sort((a, b) => augs[b].hacking_grow * augs[b].hacking_speed * (augs[b].hacking ** 2) * (augs[b].hacking_exp ** 2) * (augs[b].faction_rep ** .1) - augs[a].hacking_grow * (augs[a].hacking ** 2) * (augs[a].hacking_exp ** 2) * augs[a].hacking_speed * (augs[a].faction_rep ** .1));
				let currentaugs = await Do(this.ns, "ns.singularity.getOwnedAugmentations", true);
				for (let i = 0; i < auglist.length; i++) {
					let good = true;
					let prereqs = await Do(this.ns, "ns.singularity.getAugmentationPrereq", auglist[i]);
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
				if ((await Do(this.ns, "ns.grafting.getGraftableAugmentations", "")).includes("nickofolas Congruity Implant")) {
					if ((await Do(this.ns, "ns.grafting.getAugmentationGraftPrice", "nickofolas Congruity Implant")) < (await Do(this.ns, "ns.getServerMoneyAvailable", "home"))) {
						auglist.unshift("nickofolas Congruity Implant");
					}
				}
				let playerhack = await (this.Player.hacking);
				let ownedAugs = await Do(this.ns, "ns.singularity.getOwnedAugmentations");
				if (playerhack > 3000 && ownedAugs.length < 30) {
					auglist = auglist.sort((a, b) => augs[a].time - augs[b].time);
				}
				if (auglist.length > 0) {
					if (!(((await Do(this.ns, "ns.getPlayer", "")).city) == "New Tokyo"))
						await Do(this.ns, "ns.singularity.travelToCity", "New Tokyo");
					if (playerhack < 4000 || ownedAugs.length < 30)
						await Do(this.ns, "ns.grafting.graftAugmentation", auglist[0]);
				}
			}
			while ((await Do(this.ns, "ns.singularity.getUpgradeHomeRamCost")) * 2 < await Do(this.ns, "ns.getServerMoneyAvailable", "home") && await Do(this.ns, "ns.singularity.upgradeHomeRam", ""));
			let chances = {};
			let portvalue = 0;
			for (let stock of symbols) {
				chances[stock] = (-.5 + await Do(this.ns, "ns.stock.getForecast", stock)) * (await Do(this.ns, "ns.stock.getVolatility", stock)) * (await Do(this.ns, "ns.stock.getPrice", stock));
			}
			symbols = symbols.sort((a, b) => { return chances[b] - chances[a] });
			z = 1 - z;
			for (let stock of symbols) {
				if (z == 1) {
					let data = await Do(this.ns, "ns.stock.getPosition", stock);
					if (chances[stock] > 0) {
						let shares = Math.floor((-100000 + await Do(this.ns, "ns.getServerMoneyAvailable", 'home')) / (await Do(this.ns, "ns.stock.getAskPrice", stock)));
						shares = Math.min(((await Do(this.ns, "ns.stock.getMaxShares", stock))) - data[0] - data[2], shares);
						//						if (shares > 100 && (200000 < await Do(this.ns, "ns.getServerMoneyAvailable", "home"))) {
						//							ns.toast("Trying to buy " + shares.toString() + " of " + stock);
						//						}
						while ((shares * (await Do(this.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(this.ns, "ns.stock.buyStock", stock, shares))) {
							shares *= .99;
						}
					} else {
						if (data[0] > 0) {
							await Do(this.ns, "ns.stock.sellStock", stock, data[0]);
						}
					}
				}
				portvalue += (await Do(this.ns, "ns.stock.getPosition", stock))[0] * (await Do(this.ns, "ns.stock.getPrice", stock));

			}
			symbols = symbols.reverse();
			for (let stock of symbols) {
				if (0 == z) {
					let data = await Do(this.ns, "ns.stock.getPosition", stock);
					if (chances[stock] < 0) {
						let shares = Math.floor((-100000 + await Do(this.ns, "ns.getServerMoneyAvailable", 'home')) / (await Do(this.ns, "ns.stock.getAskPrice", stock)));
						shares = Math.min(((await Do(this.ns, "ns.stock.getMaxShares", stock))) - data[0] - data[2], shares);
						//						if (shares > 100 && (200000 < await Do(this.ns, "ns.getServerMoneyAvailable", "home"))) {
						//							ns.toast("Trying to short " + shares.toString() + " of " + stock);
						//						}
						while ((shares * (await Do(this.ns, "ns.stock.getBidPrice", stock)) > 200000) && (!await Do(this.ns, "ns.stock.buyShort", stock, shares))) {
							shares *= .99;
						}
					} else {
						if (data[2] > 0) {
							//							ns.toast("Unshorting " + stock);
							await Do(this.ns, "ns.stock.sellShort", stock, data[2]);
						}
					}
				}
				let data = await Do(this.ns, "ns.stock.getPosition", stock);
				portvalue += (data[2] * (2 * data[3] - await Do(this.ns, "ns.stock.getAskPrice", stock)));
			}
			//			ns.tprint(z ? "Long " : "Short", " ", ns.nFormat((await Do(ns, "ns.getServerMoneyAvailable", "home")) + portvalue, "$0.000a"));
			//			ns.toast(ns.nFormat((await Do(ns, "ns.getServerMoneyAvailable", "home")) + portvalue, "$0.000a"));
			let ownedAugs = await Do(this.ns, "ns.singularity.getOwnedAugmentations");
			let playerhack = (await Do(this.ns, "ns.getPlayer")).skills.hacking;
			if (playerhack > 3000 && ownedAugs.length >= 30 && !ownedAugs.includes("The Red Pill")) {
				while (((await (this.Player.money)) > 100e9) && (!((await Do(this.ns, "ns.singularity.checkFactionInvitations")).includes("Daedalus"))) && (!((await Do(this.ns, "ns.getPlayer")).factions.includes("Daedalus")))) {
					await this.ns.sleep(1000);
				}
				if ((await Do(this.ns, "ns.singularity.checkFactionInvitations")).includes("Daedalus")) {
					await Do(this.ns, "ns.singularity.joinFaction", "Daedalus");
				}
				if ((await Do(this.ns, "ns.getPlayer")).factions.includes("Daedalus")) {
					if ((await Do(this.ns, "ns.singularity.getFactionRep", "Daedalus")) < ((await Do(this.ns, "ns.singularity.getAugmentationRepReq", "The Red Pill")))) {
						if ((await Do(this.ns, "ns.getPlayer")).money > 1e9) {
							await Do(this.ns, "ns.singularity.donateToFaction", "Daedalus", Math.floor(.1 * ((await Do(this.ns, "ns.getPlayer")).money)));
						}
					}
					if ((await Do(this.ns, "ns.singularity.getFactionRep", "Daedalus")) >= ((await Do(this.ns, "ns.singularity.getAugmentationRepReq", "The Red Pill")))) {
						await Do(this.ns, "ns.singularity.purchaseAugmentation", "Daedalus", "The Red Pill");
					}
				}
			}
			if (playerhack > 3000 && ownedAugs.length >= 30 && !ownedAugs.includes("The Red Pill") && ((await Do(this.ns, "ns.singularity.getOwnedAugmentations", true))).includes("The Red Pill")) {
				await this.SoftReset();
			}
		}
	}
	async bn8hackloop() {
		let filesize = {
			"grow.js": await Do(this.ns, "ns.getScriptRam", "/temp/grow.js"),
			"growstock.js": await Do(this.ns, "ns.getScriptRam", "/temp/growstock.js"),
			"hack.js": await Do(this.ns, "ns.getScriptRam", "/temp/back.js"),
			"hackstock.js": await Do(this.ns, "ns.getScriptRam", "/temp/hackstock.js"),
			"weaken.js": await Do(this.ns, "ns.getScriptRam", "/temp/weaken.js")
		}
		let minsec = await DoAll(this.ns, "ns.getServerMinSecurityLevel", Object.keys(stockMapping).map(x => stockMapping[x]));
		let volatility = await DoAll(this.ns, "ns.stock.getVolatility", Object.keys(stockMapping));
		let player = await Do(this.ns, "ns.getPlayer");
		let serverdata = await DoAll(this.ns, "ns.getServer", Object.values(stockMapping));
		let weakentime = {};
		for (let server of Object.values(stockMapping)) {
			weakentime[server] = await Do(this.ns, "ns.formulas.hacking.weakenTime", await Do(this.ns, "ns.getServer", server), player);
		}
		for (let i of Object.keys(stockMapping).sort((a, b) => { return weakentime[stockMapping[a]] - weakentime[stockMapping[b]] })) {
			//    for (let i of Object.keys(mapping).sort((a, b) => { return minsec[a] - minsec[b] })) {
			let files = await Do(this.ns, "ns.ls", "home");
			let z = 0;
			if (files.includes("BruteSSH.exe")) {
				await Do(this.ns, "ns.brutessh", stockMapping[i]);
				z += 1;
			}
			if (files.includes("SQLInject.exe")) {
				await Do(this.ns, "ns.sqlinject", stockMapping[i]);
				z += 1;
			}
			if (files.includes("HTTPWorm.exe")) {
				await Do(this.ns, "ns.httpworm", stockMapping[i]);
				z += 1;
			}
			if (files.includes("FTPCrack.exe")) {
				await Do(this.ns, "ns.ftpcrack", stockMapping[i]);
				z += 1;
			}
			if (files.includes("relaySMTP.exe")) {
				await Do(this.ns, "ns.relaysmtp", stockMapping[i]);
				z += 1;
			}
			let buffer = 10;
			if (1e6 < await Do(this.ns, "ns.getServerMaxRam", "home")) {
				buffer = 100;
			}
			if ((z >= await Do(this.ns, "ns.getServerNumPortsRequired", stockMapping[i])) && ((await Do(this.ns, "ns.getPlayer")).skills.hacking) >= ((await Do(this.ns, "ns.getServerRequiredHackingLevel", stockMapping[i])))) {
				await Do(this.ns, "ns.nuke", stockMapping[i]);
				await (this.Servers[stockMapping[i]].prep());
				while ((await Do(this.ns, "ns.stock.getForecast", i)) > .1 && (await Do(this.ns, "ns.stock.getForecast", i)) < .9) {
					while (minsec[i] < await Do(this.ns, "ns.getServerSecurityLevel", stockMapping[i])) {
						//                   ns.tprint("Weaken " + i + " " + mapping[i], " ", ns.stock.getForecast(i));
						let threads = Math.max(1, Math.floor(((await Do(this.ns, "ns.getServerMaxRam", "home")) - (await Do(this.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["weaken.js"]));
						let pid = this.ns.run("/temp/weaken.js", threads, stockMapping[i]);
						while (pid == 0 && threads > 1) {
							await this.ns.sleep(0);
							threads -= 1;
							pid = this.ns.run("/temp/weaken.js", threads, stockMapping[i]);
						}
						while (await Do(this.ns, "ns.isRunning", pid)) { await this.ns.sleep(0); }
					}
					//this.ns.tprint(((await Do(this.ns, "ns.stock.getForecast", i)) > .5 ? "Grow " : "Hack ") + i + " " + stockMapping[i], " ", (await Do(this.ns, "ns.stock.getForecast", i)));
					while ((await Do(this.ns, "ns.getServerMoneyAvailable", stockMapping[i])) * 4 / 3 > (await Do(this.ns, "ns.getServerMaxMoney", stockMapping[i]))) {
						let threads = Math.floor(((await Do(this.ns, "ns.getServerMaxRam", "home")) - (await Do(this.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["hackstock.js"]);
						if (threads > 0) {
							let pid = this.ns.run((await Do(this.ns, "ns.stock.getForecast", i)) > .5 ? "/temp/hack.js" : "/temp/hackstock.js", threads, stockMapping[i]);
							while (pid == 0 && threads > 0) {
								await this.ns.sleep(0);
								threads -= 1;
								pid = this.ns.run((await Do(this.ns, "ns.stock.getForecast", i)) > .5 ? "/temp/hack.js" : "/temp/hackstock.js", threads, stockMapping[i]);
							}
							while (await Do(this.ns, "ns.isRunning", pid)) { await this.ns.sleep(0); }
						}
						while ((await Do(this.ns, "ns.getServerMinSecurityLevel", stockMapping[i])) < (await Do(this.ns, "ns.getServerSecurityLevel", stockMapping[i]))) {
							//            ns.tprint("Weaken " + i + " " + mapping[i], " ", ns.stock.getForecast(i));
							let threads = Math.floor(((await Do(this.ns, "ns.getServerMaxRam", "home")) - (await Do(this.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["weaken.js"]);
							let pid = this.ns.run("/temp/weaken.js", threads, stockMapping[i]);
							while (pid == 0 && threads > 1) {
								await this.ns.sleep(0);
								threads -= 1;
								pid = this.ns.run("/temp/weaken.js", threads, stockMapping[i]);
							}
							while (await Do(this.ns, "ns.isRunning", pid)) { await this.ns.sleep(0); }
						}
					}
					while ((await Do(this.ns, "ns.getServerMoneyAvailable", stockMapping[i])) < (await Do(this.ns, "ns.getServerMaxMoney", stockMapping[i]))) {
						let threads = Math.floor(((await Do(this.ns, "ns.getServerMaxRam", "home")) - (await Do(this.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["growstock.js"]);
						let pid = threads > 0 ? this.ns.run((await Do(this.ns, "ns.stock.getForecast", i)) > .5 ? "/temp/growstock.js" : "/temp/grow.js", threads, stockMapping[i]) : 0;
						while (pid == 0 && threads > 0) {
							await this.ns.sleep(0);
							threads -= 1;
							pid = this.ns.run((await Do(this.ns, "ns.stock.getForecast", i)) > .5 ? "/temp/growstock.js" : "/temp/grow.js", threads, stockMapping[i]);
						}
						while (await Do(this.ns, "ns.isRunning", pid)) { await this.ns.sleep(0); }
						while ((await Do(this.ns, "ns.getServerMinSecurityLevel", stockMapping[i])) < (await Do(this.ns, "ns.getServerSecurityLevel", stockMapping[i]))) {
							//                     ns.tprint("Weaken " + i + " " + mapping[i], " ", ns.stock.getForecast(i));
							let threads = Math.floor(((await Do(this.ns, "ns.getServerMaxRam", "home")) - (await Do(this.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["weaken.js"]);
							let pid = this.ns.run("/temp/weaken.js", threads, stockMapping[i]);
							while (pid == 0 && threads > 1) {
								await this.ns.sleep(0);
								threads -= 1;
								pid = this.ns.run("/temp/weaken.js", threads, stockMapping[i]);
							}
							while (await Do(this.ns, "ns.isRunning", pid)) { await this.ns.sleep(0); }
						}
					}
					while ((await Do(this.ns, "ns.getServerMinSecurityLevel", stockMapping[i])) < (await Do(this.ns, "ns.getServerSecurityLevel", stockMapping[i]))) {
						let threads = Math.floor(((await Do(this.ns, "ns.getServerMaxRam", "home")) - (await Do(this.ns, "ns.getServerUsedRam", "home")) - buffer) / filesize["weaken.js"]);
						let pid = this.ns.run("/temp/weaken.js", threads, stockMapping[i]);
						while (pid == 0 && threads > 1) {
							await this.ns.sleep(0);
							threads -= 1;
							pid = this.ns.run("/temp/weaken.js", threads, stockMapping[i]);
						}
						while (await Do(this.ns, "ns.isRunning", pid)) { await this.ns.sleep(0); }
					}
					await this.ns.sleep(0);
				}
			}
		}
	}
}
