
export class Augmentations {
	constructor(ns, game) {
		this.ns = ns
		this.game = game ? game : new WholeGame(ns);
	}
	async createDisplay() {
		this.augWindow = await makeNewWindow("Augmentations", this.ns.ui.getTheme());
		this.augs = {};
		let graftableaugs = await Do(this.ns, "ns.grafting.getGraftableAugmentations");
		for (let faction of Object.keys(FACTIONS)) {
			for (let aug of await Do(this.ns, "ns.singularity.getAugmentationsFromFaction", faction)) {
				if (!Object.keys(this.augs).includes(aug)) {
					this.augs[aug] = {
						'base_price': await Do(this.ns, "ns.singularity.getAugmentationBasePrice", aug),
						'price': await Do(this.ns, "ns.singularity.getAugmentationPrice", aug),
						'prereqs': await Do(this.ns, "ns.singularity.getAugmentationPrereq", aug),
						'rep_req': await Do(this.ns, "ns.singularity.getAugmentationRepReq", aug),
						'stats': await Do(this.ns, "ns.singularity.getAugmentationStats", aug),
						'factions': [faction]
					};
					if (graftableaugs.includes(aug)) {
						this.augs[aug]['graftprice'] = await Do(this.ns, "ns.grafting.getAugmentationGraftPrice", aug);
						this.augs[aug]['grafttime'] = await Do(this.ns, "ns.grafting.getAugmentationGraftTime", aug);
					}
				} else {
					this.augs[aug]['factions'].push(faction);
				}
			}
		}
	}
	async updateDisplay() {
		let ownedaugs = await Do(this.ns, "ns.singularity.getOwnedAugmentations");
		//		let factfavor = await DoAll(this.ns, "ns.singularity.getFactionFavor", Object.keys(FACTIONS));
		//		let factfavorgain = await DoAll(this.ns, "ns.singularity.getFactionFavorGain", Object.keys(FACTIONS));
		let factrep = await DoAll(this.ns, "ns.singularity.getFactionRep", Object.keys(FACTIONS));
		let update = "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0>"
		let owned = "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0>"
		for (let aug of Object.keys(this.augs).sort((a, b) => this.augs[a]['rep_req'] - this.augs[b]['rep_req'])) {
			let skip = false;
			if (this.augs[aug].factions.includes("Church of the Machine God") && ownedaugs.length > 0 && !ownedaugs.includes("Stanek's Gift - Genesis")) {
				skip = true;
			}
			if (this.augs[aug].factions.includes("Bladeburners") && !((await Do(this.ns, "ns.getPlayer")).factions.includes("Bladeburners"))) {
				skip = true;
			}
			if (this.augs[aug].factions.includes("Shadows of Anarchy") && !((await Do(this.ns, "ns.getPlayer")).factions.includes("Shadows of Anarchy"))) {
				skip = true;
			}
			if (!skip) {
				let myupdate = "<TR VALIGN=TOP>"
				myupdate += td(aug) + td(jFormat(this.augs[aug]['price'], "$"), "RIGHT");
				myupdate += "<TD ALIGN=RIGHT>" + jFormat(this.augs[aug]['rep_req']) + "<BR><TABLE BORDER=0 CELLPADDING=0 CELLSPACING=0>";
				let nothing = [];
				for (let faction of this.augs[aug]['factions'].sort((a, b) => factrep[b] - factrep[a])) {
					if (factrep[faction] > 0) {
						myupdate += tr(td(FACTIONS[faction]['abbrev'] + "&nbsp;", "RIGHT") + td(jFormat(factrep[faction]), "RIGHT"));
					} else {
						nothing.push(FACTIONS[faction]['abbrev']);
					}
				}
				myupdate += "</TABLE>"
				if (nothing.length > 0) {
					myupdate += "<SMALL>" + nothing.join(" ");
				}
				myupdate += "</TD>";
				try {
					myupdate += td(jFormat(this.augs[aug]['graftprice'], "$"), "RIGHT");
				} catch { myupdate += td("&nbsp;"); }
				try {
					myupdate += td(timeFormat(Math.floor(this.augs[aug]['grafttime'] / 1000 + .5)), "RIGHT");
				} catch { myupdate += td("&nbsp;"); }
				myupdate += "</TR>";
				if (ownedaugs.includes(aug)) {
					owned += myupdate;
				} else {
					update += myupdate;
				}
			}
		}
		update += "</TABLE>";
		owned += "</TABLE>";
		this.augWindow.update(update + "<BR>" + owned);
	}
}

let bbTypes = {
	"Tracking": "Contract",
	"Bounty Hunter": "Contract",
	"Retirement": "Contract",
	"Investigation": "Operation",
	"Undercover Operation": "Operation",
	"Sting Operation": "Operation",
	"Raid": "Operation",
	"Stealth Retirement Operation": "Operation",
	"Assassination": "Operation",
	"Operation Typhoon": "Black Op",
	"Operation X": "Black Op",
	"Operation Titan": "Black Op",
	"Operation Ares": "Black Op",
	"Operation Archangel": "Black Op",
	"Operation Juggernaut": "Black Op",
	"Operation Red Dragon": "Black Op",
	"Operation K": "Black Op",
	"Operation Deckard": "Black Op",
	"Operation Tyrell": "Black Op",
	"Operation Wallace": "Black Op",
	"Operation Hyron": "Black Op",
	"Operation Ion Storm": "Black Op",
	"Operation Annihilus": "Black Op",
	"Operation Ultron": "Black Op",
	"Operation Centurion": "Black Op",
	"Operation Vindictus": "Black Op",
	"Operation Daedalus": "Black Op",
	"Operation Zero": "Black Op",
	"Operation Shoulder of Orion": "Black Op",
	"Operation Morpheus": "Black Op"
}

export class Bladeburner {
	constructor(ns, game, raid=true, sting=true, maxChaos=30, minStamina=.6, maxStamina=.9) {
		this.ns = ns;
		this.raid = raid;
		this.sting = sting;
		this.maxChaos = maxChaos;
		this.minStamina = minStamina;
		this.maxStamina = maxStamina;
		this.game = game ? game : new WholeGame(ns);
		this.log = ns.tprint.bind(ns);
		if (ns.flags(cmdlineflags)['logbox']) {
			this.log = this.game.sidebar.querySelector(".bladebox") || this.game.createSidebarItem("Bladeburner", "", "B", "bladebox");
			this.log = this.log.log;
		}
	}
	get chaosHere() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.bladeburner.getCityChaos", await (this.city));
			} catch (e) {
				return [];
			}
		})();
	}
	get stamina() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.bladeburner.getStamina");
			} catch (e) {
				return [];
			}
		})();
	}
	get currentAction() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.bladeburner.getCurrentAction");
			} catch (e) {
				return [];
			}
		})();
	}
	async getChance(name) {
		return await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", bbTypes[name], name);
	}
	async maxLevel(name) {
		return await Do(this.ns, "ns.bladeburner.getActionMaxLevel", bbTypes[name], name);
	}
	async setLevel(name, level) {
		return await Do(this.ns, "ns.bladeburner.setActionLevel", bbTypes[name], name, level);
	}
	async fieldAnal() {
		return await Do(this.ns, "ns.bladeburner.startAction", "General", "Field Analysis");
	}
	async start() {
		return await Do(this.ns, "ns.bladeburner.joinBladeburnerDivision");
	}
	async successChance(op) {
		if (op != 0 && op != "")
    		return await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", bbTypes[op], op);
		return 0;
	}
	async teamSize(op, size) {
		if (op != 0 && op != "")
		    return await Do(this.ns, "ns.bladeburner.setTeamSize", bbTypes[op], op, size);
		return false;
	}
	async setAutoLevel(op, level) {
		return await Do(this.ns, "ns.bladeburner.setActionAutolevel", bbTypes[op], op, level);
	}
	async actionStart(op) {
		return await Do(this.ns, "ns.bladeburner.startAction", bbTypes[op], op);
	}
	isKillOp(nextOp) {
		if (["Operation Typhoon", "Operation X", "Operation Titan", "Operation Ares", "Operation Archangel", "Operation Juggernaut", "Operation Red Dragon", "Operation K", "Operation Deckard", "Operation Tyrell", "Operation Wallace", "Operation Hyron", "Operation Ion Storm", "Operation Annihilus", "Operation Ultron"].includes(nextOp)) {
			return true;
		}
		return false;
	}
	isStealthOp(nextOp) {
		if (["Operation Zero", "Operation Shoulder of Orion", "Operation Morpheus"].includes(nextOp)) {
			return true;
		}
		return false;
	}
	async UpgradeSkills(count=1) {
		while (await Do(this.ns, "ns.bladeburner.upgradeSkill", "Overclock", count)) {
			this.log("Upgraded Overclock" + " " + count.toString());
			return true;
		}
		let skillmods = { };
		if ((1 > (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Operation", "Assassination"))[1]) || (1 > (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", "Operation Daedalus"))[0])) {
			skillmods["Blade's Intuition"] = 3;
			skillmods["Digital Observer"] = 4;
		} else {
			if (Math.max((await Do(this.ns, "ns.bladeburner.getActionTime", "Operation", "Assassination")),(await Do(this.ns, "ns.bladeburner.getActionTime", "Operation", "Investigation")),(await Do(this.ns, "ns.bladeburner.getActionTime", "Operation", "Undercover Operation")),(await Do(this.ns, "ns.bladeburner.getActionTime", "Operation", "Stealth Retirement Operation"))) > 1000) {
			    skillmods["Reaper"] = 2;
			    skillmods["Evasive System"] = 4;
			}
		}
		let nextOp = await (this.nextBlackOp);
		if ((1 > (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Operation", "Assassination"))[1]) || (1 > (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", "Operation Ultron"))[0])) {
			skillmods["Short-Circuit"] = 5.5;
		}
		if ((1 > (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Operation", "Assassination"))[1]) || ((await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", "Operation Ultron"))[0] > (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", "Operation Morpheus"))[0])) {
			skillmods["Cloak"] = 5.5;
		}
		let currentrank = await DoAll(this.ns, "ns.bladeburner.getSkillLevel", Object.keys(skillmods));
		let cost = await DoAll(this.ns, "ns.bladeburner.getSkillUpgradeCost", Object.keys(skillmods));
		let current = 1;
		for (let skill of Object.keys(skillmods)) {
			current *= skillmods[skill] * (1 + currentrank[skill] / 100);
		}
		let upgrade = {};
		if (Object.keys(skillmods).length > 0) {
	    	for (let skill of Object.keys(skillmods)) {
		    	currentrank[skill] += 1;
			    upgrade[skill] = 1;
			    for (let skill2 of Object.keys(skillmods)) {
				    upgrade[skill] *= skillmods[skill2] * (1 + currentrank[skill2] / 100);
    			}
	    		upgrade[skill] = (upgrade[skill] - current) / cost[skill];
		    	currentrank[skill] -= 1;
    		}
	    	upgrade = Object.entries(upgrade).sort((a, b) => -a[1] + b[1])[0][0];
		    while (await Do(this.ns, "ns.bladeburner.upgradeSkill", upgrade, count)) {
		    	this.log("Upgraded " + upgrade + " " + count.toString());
			    return true;
    		}
		}
		upgrade = "Hyperdrive";
		while (await Do(this.ns, "ns.bladeburner.upgradeSkill", upgrade, count)) {
			this.log("Upgraded " + upgrade + " " + count.toString());
			await (this.UpgradeSkills(count * 2));
			return true;
		}
		return false;
	}
	get hasSimulacrum() {
		return (async () => {
			try {
				return await (this.game.Player.hasAug("The Blade's Simulacrum"));
			} catch (e) {
				return [];
			}
		})();
	}
	async hardStop() {
		if (!await (this.hasSimulacrum))
    		await Do(this.ns, "ns.singularity.stopAction");
		await (this.bbStop());
	}
	async bbStop() {
		await Do(this.ns, "ns.bladeburner.stopBladeburnerAction");
	}
	async bbCity(city) {
		await Do(this.ns, "ns.bladeburner.switchCity", city);
	}
	async bbOpCount(operation) {
		return await Do(this.ns, "ns.bladeburner.getActionCountRemaining", "Operation", operation);
	}
	async repGain(action, level) {
		return await Do(this.ns, "ns.bladeburner.getActionRepGain", bbTypes[action], action, level);
	}
	async bbActionTime(action) {
		return await Do(this.ns, "ns.bladeburner.getActionTime", bbTypes[action], action);
	}
	async bbActionCount(action) {
		return await Do(this.ns, "ns.bladeburner.getActionCountRemaining", bbTypes[action], action);
	}
	async inciteViolence() {
		let city = Object.entries(await DoAll(this.ns, "ns.bladeburner.getCityEstimatedPopulation", CITIES)).sort((a, b) => b[1] - a[1])[0][0]
		this.log("Inciting Violence in " + city);
		await Do(this.ns, "ns.bladeburner.switchCity", city);
		await this.game.Sleeves.bbEverybody("Infiltrate synthoids");
		while (500 > await (this.operationCount)) {
		    await Do(this.ns, "ns.bladeburner.startAction", "General", "Incite Violence");
        	await this.ns.asleep(await Do(this.ns, "ns.bladeburner.getActionTime", "General", "Incite Violence"));
	    }
	}
	async recoverIfNecessary(lower = -1, upper = -1) {
		lower = lower == -1 ? this.minStamina : lower;
		upper = upper == -1 ? this.maxStamina : upper;
		if (lower > (await Do(this.ns, "ns.bladeburner.getStamina")).reduce((a, b) => a / b)) {
			this.log("Recovering Stamina...");
			await this.hardStop();
			await Do(this.ns, "ns.bladeburner.startAction", "General", "Hyperbolic Regeneration Chamber");
			await this.game.Sleeves.bbEverybody("Hyperbolic Regeneration Chamber")
			while (upper > (await Do(this.ns, "ns.bladeburner.getStamina")).reduce((a, b) => a / b)) {
				await this.ns.asleep(1000);
			}
			await this.hardStop();
			this.log("...done");
			return true;
		}
		return false;
	}
	async deescalate(goal = -1) {
		goal = goal == -1 ? this.maxChaos : goal;
		if (goal < (await Do(this.ns, "ns.bladeburner.getCityChaos", await Do(this.ns, "ns.bladeburner.getCity")))) {
			this.log("Deescalating " + await Do(this.ns, "ns.bladeburner.getCity"));
			await this.hardStop();
			await Do(this.ns, "ns.bladeburner.startAction", "General", "Diplomacy");
			await this.game.Sleeves.bbEverybody("Diplomacy");
			while (goal < (await Do(this.ns, "ns.bladeburner.getCityChaos", await Do(this.ns, "ns.bladeburner.getCity")))) {
				await this.ns.asleep(1000);
			}
			return true;
		}
		return false;
	}
	get contractCount() {
		return (async () => {
			try {
				return ((await Do(this.ns, "ns.bladeburner.getActionCountRemaining", "Contract", "Tracking"))) + ((await Do(this.ns, "ns.bladeburner.getActionCountRemaining", "Contract", "Bounty Hunter"))) + ((await Do(this.ns, "ns.bladeburner.getActionCountRemaining", "Contract", "Retirement")));
			} catch (e) {
				return 0;
			}
		})();
	}
	async actionCount(op) {
		return await Do(this.ns, "ns.bladeburner.getActionCountRemaining", bbTypes[op], op);
	}
	get operationCount() {
		return (async () => {
			try {
				return (await(this.bbOpCount("Investigation")))+(await(this.bbOpCount("Undercover Operation")))+(await(this.bbOpCount("Stealth Retirement Operation")))+(await(this.bbOpCount("Assassination")));
			} catch (e) {
				return 0;
			}
		})();
	}
	get opNames() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.bladeburner.getOperationNames")).filter(x => this.raid ? true : x != "Raid").filter(x => this.sting ? true : x != "Sting Operation");
			} catch (e) {
				return [];
			}
		})();
	}
	get city() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.bladeburner.getCity");
			} catch (e) {
				return [];
			}
		})();
	}
	get skillPoints() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.bladeburner.getSkillPoints");
			} catch (e) {
				return [];
			}
		})();
	}
	get contractNames() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.bladeburner.getContractNames");
			} catch (e) {
				return [];
			}
		})();
	}
	get rank() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.bladeburner.getRank");
			} catch (e) {
				return [];
			}
		})();
	}
	async blackOpRank(op) {
		return await Do(this.ns, "ns.bladeburner.getBlackOpRank", op);
	}
	get nextBlackOp() {
		return (async () => {
			try {
				return Object.entries(await DoAllComplex(this.ns, "ns.bladeburner.getActionCountRemaining", ((await Do(this.ns, "ns.bladeburner.getBlackOpNames")).map(x => ["Black Op", x])))).map(x => [x[0].split(",")[1], x[1]]).filter(x => x[1] > 0)[0][0];
			} catch (e) {
				return 0;
			}
		})();
	}
	async actionMaxLevel(op) {
		return await Do(this.ns, "ns.bladeburner.getActionMaxLevel", bbTypes[op], op);
	}
	async createDisplay() {
		this.bbWindow = await makeNewWindow("Bladeburner", this.ns.ui.getTheme());

		eval('window').listenUp = (message) => { globalThis.bbQueue.push(message); };
		if (typeof globalThis.bbQueue === 'undefined') {
			globalThis.bbQueue = [];
		}
	}
	get killicon() {
		return '<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="-22 0 511 511.99561" class="" style="fill: rgb(173, 255, 47);"><path d="m.496094 466.242188 39.902344-39.902344 45.753906 45.753906-39.898438 39.902344zm0 0"></path><path d="m468.421875 89.832031-1.675781-89.832031-300.265625 300.265625 45.753906 45.753906zm0 0"></path><path d="m95.210938 316.785156 16.84375 16.847656h.003906l83.65625 83.65625 22.753906-22.753906-100.503906-100.503906zm0 0"></path><path d="m101.445312 365.300781-39.902343 39.902344 45.753906 45.753906 39.902344-39.902343-39.90625-39.902344zm0 0"></path></svg>';
	}
	get stealthicon() {
		return '<svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 166 132" class="" style="fill: rgb(173, 255, 47);"><g><path d="M132.658-0.18l-24.321,24.321c-7.915-2.71-16.342-4.392-25.087-4.392c-45.84,0-83,46-83,46   s14.1,17.44,35.635,30.844L12.32,120.158l12.021,12.021L144.68,11.841L132.658-0.18z M52.033,80.445   c-2.104-4.458-3.283-9.438-3.283-14.695c0-19.054,15.446-34.5,34.5-34.5c5.258,0,10.237,1.179,14.695,3.284L52.033,80.445z"></path><path d="M134.865,37.656l-18.482,18.482c0.884,3.052,1.367,6.275,1.367,9.612c0,19.055-15.446,34.5-34.5,34.5   c-3.337,0-6.56-0.483-9.611-1.367l-10.124,10.124c6.326,1.725,12.934,2.743,19.735,2.743c45.84,0,83-46,83-46   S153.987,50.575,134.865,37.656z"></path></g></svg>';
	}
	async updateDisplay() {
		if (!await Do(this.ns, "ns.bladeburner.joinBladeburnerDivision")) {
			this.bbWindow.update("<H1>Not in Bladeburner yet</H1>");
			return;
		}
		let myrank = await Do(this.ns, "ns.bladeburner.getRank");
		let mycity = await Do(this.ns, "ns.bladeburner.getCity");
		let answer = "<TABLE WIDTH=100%><TR VALIGN=TOP><TD WIDTH=50%>";
		answer += "<H1>Rank: " + Math.floor(.5 + myrank).toString() + "<BR>";
		answer += "City: " + mycity + "<BR>";
		let chaos = await (Do(this.ns, "ns.bladeburner.getCityChaos", mycity));
		answer += "Chaos: " + "<FONT COLOR=" + this.ns.ui.getTheme()[chaos < 40 ? 'success' : (chaos < 50 ? 'warning' : 'error')] + ">" + jFormat(chaos) + "</FONT><BR>";
		answer += "Communities: " + (await Do(this.ns, "ns.bladeburner.getCityCommunities", mycity)).toString() + "<BR>";
		answer += "Estimated Population: " + jFormat(await Do(this.ns, "ns.bladeburner.getCityEstimatedPopulation", mycity)) + "</H1></TD><TD><H1>";

		if (0 < await (this.game.Sleeves.numSleeves)) {
			answer += "Sleeves:<BR>";
					let wildcard = true;
					for (let i = 0; i < await (this.game.Sleeves.numSleeves); i++) {
						try {
							if (((await Do(this.ns, "ns.sleeve.getTask", i)).actionName) != ((await Do(this.ns, "ns.sleeve.getTask", 0))).actionName)
								wildcard = false;
						} catch { }
					}
					if (wildcard) {
						for (let i = 0; i < 1; i++) {
								if (null != (await Do(this.ns, "ns.sleeve.getTask", i))) {
									let z = (await Do(this.ns, "ns.sleeve.getTask", i));
									if (z.type == "INFILTRATE") {
										answer += "*" + ": Infiltrate" + "<BR>";
									} else {
										if (z.type == "SUPPORT") {
											answer += "*" + ": Support main sleeve" + "<BR>";
										} else {
											answer += "*" + ": " + z.actionName + "<BR>"
										}
									}
								} else {
									answer += i.toString() + "<BR>";
								}
						}
					} else {
						for (let i = 0; i < await (this.game.Sleeves.numSleeves); i++) {
								if (null != (await Do(this.ns, "ns.sleeve.getTask", i))) {
									let z = (await Do(this.ns, "ns.sleeve.getTask", i));
									if (z.type == "INFILTRATE") {
										answer += i.toString() + ": Infiltrate" + "<BR>";
									} else {
										if (z.type == "SUPPORT") {
											answer += i.toString() + ": Support main sleeve" + "<BR>";
										} else {
											answer += i.toString() + ": " + z.actionName + "<BR>"
										}
									}
								} else {
									answer += "*" + "<BR>";
								}
						}
					}
				}

		answer += "</H1></TD></TR></TABLE>";
		answer += "<TABLE WIDTH=100% BORDER=1>";
		answer += "<TR><TH>&nbsp;</TH><TH WIDTH=16%>" + CITIES.sort().filter(x => x != mycity).join("</TH><TH WIDTH=16%>") + "</TH></TR>";
		answer += "<TR><TD VALIGN=TOP>Chaos</TD>";
		for (let city of CITIES.sort()) {
			if (city != mycity) {
				chaos = await Do(this.ns, "ns.bladeburner.getCityChaos", city);
				answer += td("<FONT COLOR=" + this.ns.ui.getTheme()[chaos < 40 ? 'success' : (chaos < 50 ? 'warning' : 'error')] + ">" + jFormat(chaos) + "</FONT>", "RIGHT");
			}
		}
		answer += "</TR>";

		answer += "<TR><TD VALIGN=TOP>Communities</TD>";
		for (let city of CITIES.sort()) {
			if (city != mycity)
				answer += td(await Do(this.ns, "ns.bladeburner.getCityCommunities", city), "RIGHT");
		}
		answer += "</TR>";

		answer += "<TR><TD VALIGN=TOP>Est. Pop</TD>";
		for (let city of CITIES.sort()) {
			if (city != mycity)
				answer += td(jFormat(await Do(this.ns, "ns.bladeburner.getCityEstimatedPopulation", city)), "RIGHT");
		}
		answer += "</TR>";
		
		answer += "</TABLE>";
		let currentAction = await Do(this.ns, "ns.bladeburner.getCurrentAction");
		if (currentAction.type != "Idle") {
			answer += "<CENTER><H1>" + currentAction.type.replace("BlackOp", "Black Op") + ": " + currentAction.name + " " + timeFormat(((await Do(this.ns, "ns.bladeburner.getActionTime", currentAction.type, currentAction.name)) - (await Do(this.ns, "ns.bladeburner.getActionCurrentTime"))) / 1000) + "</H1></CENTER><BR>";
			answer += "<TABLE WIDTH=100% BORDER=0><TR>";
			let percentage = 100 * (await Do(this.ns, "ns.bladeburner.getActionCurrentTime")) / (await Do(this.ns, "ns.bladeburner.getActionTime", currentAction.type, currentAction.name));
			answer += "<TD WIDTH=" + Math.floor(percentage).toString() + "% style='background-color:" + this.ns.ui.getTheme()['success'] + "'>&nbsp;</TD><TD style='background-color:" + this.ns.ui.getTheme()['info'] + "'>&nbsp;</TD>";
			//			this.ns.tprint("<TD WIDTH=" + Math.floor(percentage).toString() + "% BGCOLOR=" + this.ns.ui.getTheme()['success'] + ">&nbsp;</TD><TD BGCOLOR=" + this.ns.ui.getTheme()['info'] + ">&nbsp;</TD>");
			answer += "</TR></TABLE>";
		}
		answer += "<TABLE WIDTH=100% BORDER=1><TR><TH>Jobs</TH><TH>Skills " + (await Do(this.ns, "ns.bladeburner.getSkillPoints")).toString() + "</TH></TR>";
		answer += "<TR VALIGN=TOP>";
		//		answer += td((await Do(this.ns, "ns.bladeburner.getGeneralActionNames")).join("<BR>"));
		answer += "<TD WIDTH=50%>";
		for (let contract of await (this.contractNames)) {
			let remainingActions = await Do(this.ns, "ns.bladeburner.getActionCountRemaining", "Contract", contract);
			if (remainingActions <= 0) {
				answer += "<FONT COLOR=" + this.ns.ui.getTheme()['disabled'] + ">" + contract + ": " + Math.floor((await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Contract", contract))[0] * 100).toString() + "% (" + remainingActions.toString() + ")</FONT><BR>";
			} else {
				answer += contract + ": " + Math.floor((await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Contract", contract))[0] * 100).toString() + "% (" + remainingActions.toString() + ")<BR>";
			}
		}
		for (let operation of await (this.opNames)) {
			let remainingActions = await Do(this.ns, "ns.bladeburner.getActionCountRemaining", "Operation", operation);
			if (remainingActions <= 0) {
				answer += "<FONT COLOR=" + this.ns.ui.getTheme()['disabled'] + ">" + operation.replace(" Operation", "") + ": " + Math.floor((await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Operation", operation))[0] * 100).toString() + "% (" + remainingActions.toString() + ")</FONT><BR>";
			} else {
				answer += operation.replace(" Operation", "") + ": " + Math.floor((await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Operation", operation))[0] * 100).toString() + "% (" + remainingActions.toString() + ")<BR>";
			}
		}
		for (let op of await Do(this.ns, "ns.bladeburner.getBlackOpNames")) {
			if (0 == (await Do(this.ns, 'ns.bladeburner.getActionCountRemaining', "Black Op", op))) {
				//answer += "<FONT COLOR=" + this.ns.ui.getTheme()['disabled'] + ">" + op + ": " + (await Do(this.ns, "ns.bladeburner.getBlackOpRank", op)) + " (" + (Math.floor(100 * (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", op))[0])).toString() + "%)</FONT> " + (this.isKillOp(op) ? this.killicon : "") + (this.isStealthOp(op) ? this.stealthicon : "") + "<BR>";
			} else {
				answer += op.replace("Operation ", "") + ": ";
				let oprank = (await Do(this.ns, "ns.bladeburner.getBlackOpRank", op));
				answer += "<FONT COLOR=" + this.ns.ui.getTheme()[myrank < oprank ? 'warning' : 'success'] + ">" + oprank.toString() + "</FONT>";
				answer += " (" + (Math.floor(100 * (await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", op))[0])).toString() + "%) " + (this.isKillOp(op) ? this.killicon : "") + (this.isStealthOp(op) ? this.stealthicon : "") + "<BR>";
			}
		}
		answer += "</TD>"
		answer += "<TD WIDTH=50%>";
		for (let skill of await Do(this.ns, "ns.bladeburner.getSkillNames")) {
			if ((await Do(this.ns, "ns.bladeburner.getSkillLevel", skill)) > 0) {
			    answer += skill + ": " + (await Do(this.ns, "ns.bladeburner.getSkillLevel", skill)).toString() + " (" + (await Do(this.ns, "ns.bladeburner.getSkillUpgradeCost", skill)) + ")<BR>";
			}
		}
		for (let skill of await Do(this.ns, "ns.bladeburner.getSkillNames")) {
			if ((await Do(this.ns, "ns.bladeburner.getSkillLevel", skill)) == 0) {
			    answer += skill + ": " + (await Do(this.ns, "ns.bladeburner.getSkillLevel", skill)).toString() + " (" + (await Do(this.ns, "ns.bladeburner.getSkillUpgradeCost", skill)) + ")<BR>";
			}
		}
		answer += "</TD>"
		answer += "</TR></TABLE>";
		this.bbWindow.update(answer);
	}
}
export async function bn7(Game) {
    Game.Bladeburner.raid = false;
    Game.Bladeburner.sting = false;
    let numberOfSleeves = await (Game.Sleeves.numSleeves);
    await Game.Sleeves.bbCombatAugs();
    await Game.Player.trainCombatStatsUpTo(100, true); // The true indicates to drag sleeves along
    if (!await Game.Bladeburner.start())
        return false;
    Game.Bladeburner.log("Start.")
    while (true) {
        let zc = 1;
    while (await Game.Bladeburner.UpgradeSkills(zc))
        zc += 1;
            await Game.Sleeves.bbEverybody("Field analysis");
    await Game.Bladeburner.hardStop();
    while (((await (Game.Bladeburner.contractCount))+((await (Game.Bladeburner.operationCount)))) > 0) {
        if (await Game.Player.hospitalizeIfNeeded())
            Game.Bladeburner.log("Hospitalized.."); // HP
        if (await Game.Player.joinFactionIfInvited("Bladeburners"))
            Game.Bladeburner.log("Joined Bladeburner Faction..");
        await Game.Bladeburner.recoverIfNecessary(); // Stamina
        while (await Game.Bladeburner.UpgradeSkills());
        let best = [];
        for (let city of CITIES) {
            await Game.Bladeburner.bbCity(city);
            await Game.Bladeburner.deescalate(30); // Reduces Chaos to 30 if higher
            for (let action of (await (Game.Bladeburner.opNames)).concat(await (Game.Bladeburner.contractNames))) {
                if ((await (Game.Bladeburner.bbActionCount(action))) > 0) {
                    let maxlevel = await (Game.Bladeburner.maxLevel(action));
                    for (let level = maxlevel; level >= 1 ; level -= Math.ceil(maxlevel/10)) {
                        let chance = await (Game.Bladeburner.getChance(action));
                        if (chance[0] + .01 < chance[1]) {
                            await (Game.Bladeburner.hardStop());
                            await (Game.Bladeburner.fieldAnal());
                            await (Game.Sleeves.bbEverybody("Field Analysis"));
                            while (chance[0] + .01 < chance[1]) {
                                await Game.ns.asleep(1000);
                                chance = await (Game.Bladeburner.getChance(action));
                            }
                        }
                        await (Game.Bladeburner.setLevel(action, level));
                        if (bbTypes[action] == "Contract" || (await (Game.Bladeburner.getChance(action)))[0] > .95)
                            best.push([level, bbTypes[action], action, city, (await (Game.Bladeburner.bbActionCount(action)))*((await (Game.Bladeburner.getChance(action))).reduce((a, b) => (a + b) / 2) * (await (Game.Bladeburner.repGain(action, level))) / (await (Game.Bladeburner.bbActionTime(action))))]);
                    }
                    await (Game.Bladeburner.setLevel(action, maxlevel))
                }
            }
        }
        best = best.sort((a, b) => a[4] - b[4]);
        best = best.sort((a, b) => { if (a[2] == "Assassination" && b[2] != "Assassination") return 1; if (a[2] != "Assassination" && b[2] == "Assassination") return -1; if (a[1] == "Operation" && b[1] != "Operation") return 1; if (a[1] != "Operation" && b[1] == "Operation") return -1; return 0; });
        await Game.Sleeves.bbEverybody("Support main sleeve");
        let nextBlackOp = await (Game.Bladeburner.nextBlackOp);
        await Game.Bladeburner.teamSize(nextBlackOp, 1000);
		if (nextBlackOp != "0" && nextBlackOp != 0) {
			if ((await (Game.Bladeburner.rank)) >= (await Game.Bladeburner.blackOpRank(nextBlackOp))) {
				if ((await Game.Bladeburner.successChance("Operation Ultron"))[0] > .99) {
					if ((await Game.Bladeburner.successChance(nextBlackOp))[0] > (["Operation Centurion", "Operation Vindictus", "Operation Daedalus"].includes(nextBlackOp) ? .2 : .99)) {
						best.push([0, "Black Op", nextBlackOp, "Sector-12"]);
					}
				}
			}
		}
        if (best[best.length - 1][1] != "Black Op") {
            await Game.Bladeburner.setAutoLevel(best[best.length - 1][2], 1e6 < (await (Game.Bladeburner.rank)));
            if (best[best.length - 1][3] != await (Game.Bladeburner.city)) {
                await Game.Bladeburner.bbCity(best[best.length - 1][3]);
            }
        }
        await Game.Bladeburner.deescalate();
        if (best[best.length - 1][1] != "Black Op") {
            await Game.Bladeburner.setLevel(best[best.length - 1][2], best[best.length - 1][0]);
        }
        await (Game.Bladeburner.hardStop());
        if (best[best.length - 1][1] == "Black Op") {
            await Game.Sleeves.bbEverybody("Support main sleeve");
        }
        await Game.Bladeburner.log(best[best.length - 1].slice(0, 4).join(" "));
        await Game.Bladeburner.actionStart(best[best.length - 1][2]);
        if (best[best.length - 1][1] != "Black Op") {
            await (Game.Sleeves.bbEverybody("Field Analysis"));
            let shox = await Game.Sleeves.bbCombatSort();
            let cur = 0;
            if ((await Game.Bladeburner.actionCount("Retirement")) >= 30) {
                await Game.Sleeves.bbDo(shox[cur], "Take on contracts", best.filter(x => x[2] == "Retirement").reverse()[0][2]);
                cur += 1;
            }
            if ((await  Game.Bladeburner.actionCount("Bounty Hunter")) >= 30) {
                await Game.Sleeves.bbDo(shox[cur], "Take on contracts", best.filter(x => x[2] == "Bounty Hunter").reverse()[0][2]);
                cur += 1;
            }
            if ((await  Game.Bladeburner.actionCount("Tracking")) >= 100) {
                await Game.Sleeves.bbDo(shox[cur], "Take on contracts", best.filter(x => x[2] == "Tracking").reverse()[0][2]);
                cur += 1;
            }
            if (shox.length > cur) {
                let cityChaos = await (Game.Bladeburner.chaosHere);
                await Game.Sleeves.bbDo(shox[cur], "Infiltrate synthoids");
                let ii = 0;
                for (let i = cur + 1; i < shox.length; i++) {
                    await Game.Sleeves.bbDo(shox[i], cityChaos < 20 ? "Field analysis" : "Diplomacy");
                    ii += 1;
                }
            }
        }
        while ((await (Game.Bladeburner.currentAction)).type != "Idle" && (Game.Bladeburner.minStamina < (await (Game.Bladeburner.stamina)).reduce((a, b) => a / b)) && ((await Game.Bladeburner.actionCount(best[best.length - 1][2])) > 0)) {
            if (best[best.length - 1][0] == "Black Op" && .2 > ((await Game.Bladeburner.successChance(nextBlackOp))[0]))
                break;
            await Game.Sleeves.bbCombatAugs();
            await Game.Player.hospitalizeIfNeeded();
            while (await Game.Bladeburner.UpgradeSkills());
            await Game.Contracts.solve();
            if (await (Game.Bladeburner.hasSimulacrum))
                await Game.Grafting.checkIn("Combat", true);
                if (await (Game.Bladeburner.hasSimulacrum))
                await Game.Grafting.checkIn("Charisma", true);
            await Game.Hacknet.loop(1000 > (await (Game.Bladeburner.skillPoints)) ? "Exchange for Bladeburner SP" : "Generate Coding Contract");
            if (.999 < await Game.Bladeburner.successChance(nextBlackOp))
                break;
            if (best[best.length - 1][0] < await Game.Bladeburner.actionMaxLevel(best[best.length - 1][2])) {
                if (1 == (await Game.Bladeburner.successChance(best[best.length - 1][2]))[0]) {
                    best[best.length - 1][0] += 1;
                    await Game.Bladeburner.setLevel(best[best.length - 1][2], best[best.length - 1][0]);
                }
            }
            if (best[best.length - 1][1] == "Operation") {
                if (.94 > (((await Game.Bladeburner.successChance(best[best.length - 1][2])))[0])) {
                    break;
                }
            }
            if (10 + (await (Game.Bladeburner.cityChaos)) <= await (Game.Bladeburner.chaosHere))
                break;
            await Game.ns.asleep(1000);
        }
        await (Game.Bladeburner.hardStop());
    }
    await Game.Bladeburner.inciteViolence();
}
}
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
    while ((!await Do(Game.ns, "ns.stock.has4SData", "")) || (!await Do(Game.ns, "ns.stock.has4SDataTIXAPI", ""))) {
        while (tickPrice == await Do(Game.ns, "ns.stock.getPurchaseCost", 'ECP', 1, "Long")) {
            await Game.ns.asleep(0);
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
                        await Do(Game.ns, "ns.stock.sellStock", stock, data[0]);
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
                        await Do(Game.ns, "ns.stock.sellStock", stock, data[0]);
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
                        await Do(Game.ns, "ns.stock.sellShort", stock, data[2]);
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
                    }
                    while ((await Do(Game.ns, "ns.getServerMinSecurityLevel", stockMapping[i])) < (await Do(Game.ns, "ns.getServerSecurityLevel", stockMapping[i]))) {
                        //            ns.tprint("Weaken " + i + " " + mapping[i], " ", ns.stock.getForecast(i));
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

export class CacheServer {
	constructor(ns, name = "home", game) {
		this.ns = ns;
		this.name = name;
		this.game = game ? game : new WholeGame(ns);
		this.server = new Server(ns, this.name, game);
	}
	async init() {
		this.backdoorInstalled = await this.server.backdoorInstalled;
		this.baseDifficulty = await this.server.baseDifficulty;
		this.cpuCores = await this.server.cpuCores;
		this.ftpPortOpen = await this.server.ftpPortOpen;
		this.hackDifficulty = await this.server.hackDifficulty;
		this.hasAdminRights = await this.server.hasAdminRights;
		this.hostname = await this.server.hostname;
		this.httpPortOpen = await this.server.httpPortOpen;
		this.ip = await this.server.ip;
		this.isConnectedTo = await this.server.isConnectedTo;
		this.maxRam = await this.server.maxRam;
		this.minDifficulty = await this.server.minDifficulty;
		this.moneyAvailable = await this.server.moneyAvailable;
		this.moneyMax = await this.server.moneyMax;
		this.numOpenPortsRequired = await this.server.numOpenPortsRequired;
		this.openPortCount = await this.server.openPortCount;
		this.organizationName = await this.server.organizationName;
		this.purchasedByPlayer = await this.server.purchasedByPlayer;
		this.ramUsed = await this.server.ramUsed;
		this.requiredHackingSkill = await this.server.requiredHackingSkill;
		this.serverGrowth = await this.server.serverGrowth;
		this.smtpPortOpen = await this.server.smtpPortOpen;
		this.sqlPortOpen = await this.server.sqlPortOpen;
		this.sshPortOpen = await this.server.sshPortOpen;
	}
	async update() {
		this.backdoorInstalled = await this.server.backdoorInstalled;
		this.cpuCores = await this.server.cpuCores;
		this.ftpPortOpen = await this.server.ftpPortOpen;
		this.hackDifficulty = await this.server.hackDifficulty;
		this.hasAdminRights = await this.server.hasAdminRights;
		this.httpPortOpen = await this.server.httpPortOpen;
		this.isConnectedTo = await this.server.isConnectedTo;
		this.moneyAvailable = await this.server.moneyAvailable;
		this.openPortCount = await this.server.openPortCount;
		this.ramUsed = await this.server.ramUsed;
		this.serverGrowth = await this.server.serverGrowth;
		this.smtpPortOpen = await this.server.smtpPortOpen;
		this.sqlPortOpen = await this.server.sqlPortOpen;
		this.sshPortOpen = await this.server.sshPortOpen;
	}
}

export async function roulettestart(Game) {
	if ((await Do(Game.ns, "ns.getPlayer")).bitNodeN == 8) {
		if ((await Do(Game.ns, "ns.singularity.getOwnedSourceFiles")).filter(x => x.n == 10).length > 0) {
			for (let i = 0; i < await Do(Game.ns, "ns.sleeve.getNumSleeves"); i++) {
				await Do(Game.ns, "ns.sleeve.setToCommitCrime", i, "Mug");
			}
		}
	}
	await Do(Game.ns, "ns.nuke", "n00dles");
	Game.ns.run("/temp/weaken.js", Math.floor((await (Game.Servers['home'].maxRam)) / 2), "n00dles");
	await Game.Casino.roulette();
	let restart = false;
	for (let city of ["Chongqing", "New Tokyo", "Volhaven", "Ishima"]) {
		if (((["Chongqing", "New Tokyo", "Ishima"].includes(city)) && !((await Do(Game.ns, "ns.getPlayer"))).factions.includes("Sector-12") && !((await Do(Game.ns, "ns.getPlayer"))).factions.includes("Aevum") && !((await Do(Game.ns, "ns.getPlayer"))).factions.includes("Volhaven")) || ((["Sector-12", "Aevum"].includes(city)) && !((await Do(Game.ns, "ns.getPlayer"))).factions.includes("Chongqing") && !((await Do(Game.ns, "ns.getPlayer"))).factions.includes("Ishima") && !((await Do(Game.ns, "ns.getPlayer"))).factions.includes("New Tokyo") && !((await Do(Game.ns, "ns.getPlayer"))).factions.includes("Volhaven")) || ((["Volhaven"].includes(city)) && !((await Do(Game.ns, "ns.getPlayer"))).factions.includes("Chongqing") && !((await Do(Game.ns, "ns.getPlayer"))).factions.includes("Ishima") && !((await Do(Game.ns, "ns.getPlayer"))).factions.includes("New Tokyo") && !((await Do(Game.ns, "ns.getPlayer"))).factions.includes("Sector-12") && !((await Do(Game.ns, "ns.getPlayer"))).factions.includes("Aevum"))) {
			if (!(await Do(Game.ns, "ns.getPlayer")).factions.includes(city)) {
				await Do(Game.ns, "ns.singularity.travelToCity", city);
				while (!(await Do(Game.ns, "ns.singularity.checkFactionInvitations")).includes(city))
					await Game.ns.asleep(0);
			}
			if (city == "Chongqing")
				while ((await (Game.Player.hacking)) >= 50 && !(await Do(Game.ns, "ns.singularity.checkFactionInvitations")).includes("Tian Di Hui")) {
					await Game.ns.asleep(0);
				}
		}
	}
	if ((await Do(Game.ns, "ns.getPlayer")).bitNodeN == 8) {
		if (!await Do(Game.ns, "ns.stock.has4SData")) {
			await Do(Game.ns, "ns.stock.purchase4SMarketData");
			restart = true;
		}
	}
	while (await Do(Game.ns, "ns.singularity.upgradeHomeRam")) {
		restart = true;
	}
	while (await Do(Game.ns, "ns.singularity.upgradeHomeCores")) {
		restart = true;
	}
	if ((await Do(Game.ns, "ns.getPlayer")).bitNodeN == 8) {
		for (let faction of (await Do(Game.ns, "ns.singularity.checkFactionInvitations")).map(value => ({ value, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ value }) => value)) {
			if ((await Do(Game.ns, "ns.singularity.checkFactionInvitations")).includes(faction)) {
				await Do(Game.ns, "ns.singularity.joinFaction", faction);
			}
		}
		for (let faction of (await Do(Game.ns, "ns.getPlayer")).factions) {
			let factfavor = await Do(Game.ns, "ns.singularity.getFactionFavor", faction);
			for (let aug of (await Do(Game.ns, "ns.singularity.getAugmentationsFromFaction", faction)).reverse()) {
				if (aug == "NeuroFlux Governor" || !(await Do(Game.ns, "ns.singularity.getOwnedAugmentations", true)).includes(aug)) {
					let neededrep = Math.max(0, (await Do(Game.ns, "ns.singularity.getAugmentationRepReq", aug)) - (await Do(Game.ns, "ns.singularity.getFactionRep", faction)) / 1e6 * (1 + factfavor / 100));
					if ((await Do(Game.ns, "ns.singularity.getAugmentationPrice", aug)) + neededrep * 1e6 / (1 + factfavor / 100) <= await (Game.Player.money)) {
						await Do(Game.ns, "ns.singularity.donateToFaction", faction, Math.ceil(neededrep * 1e6 / (1 + factfavor / 100)));
						await Do(Game.ns, "ns.singularity.purchaseAugmentation", faction, aug);
						Game.ns.toast("Installing " + aug + " from " + faction);
						restart = true;
					}
				}
			}
		}
		let cash = await (Game.Player.money);
		if (cash < 10000000000) {
			for (let faction of (await Do(Game.ns, "ns.getPlayer")).factions) {
				await Do(Game.ns, "ns.singularity.donateToFaction", faction, cash / ((await Do(Game.ns, "ns.getPlayer")).factions.length));
			}
		}
	}
	if (restart) {
		await Game.SoftReset();
	}
}

export class Casino {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
	}
	async roulette() {
		while (!((await Do(this.ns, "ns.getPlayer")).city == "Aevum" || (await Do(this.ns, "ns.singularity.travelToCity", 'Aevum')))) {
			if ((!await Do(this.ns, "ns.singularity.isBusy")) && (await Do(this.ns, "ns.getPlayer")).cash < 200000)
				await Do(this.ns, "ns.singularity.commitCrime", "Mug");
			await this.ns.asleep(0);
		}

		let initseed = Date.now();
		if (await Do(this.ns, "ns.singularity.goToLocation", 'Iker Molina Casino')) {
			let doc = eval('document');
			let buttons = doc.evaluate("//button[contains(text(),'roulette')]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			//				ns.tprint(buttons);
			buttons[Object.keys(buttons)[1]].onClick({ isTrusted: true });
			let z = 0
		}
		let z = 0;
		let doc = eval('document');
		while (!doc.body.innerText.includes("1 to 12")) {
			await this.ns.asleep(1); // Sleep until you find a libertarian's ideal dating partner
		}
		let buttons = Array.from(doc.evaluate("//button[text()='Stop playing']", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.children[6].getElementsByTagName('button')).map(x => [parseInt(x.innerText), x]).filter(x => x[0].toString() == x[1].innerText).sort((a, b) => { return a[0] - b[0] });
		let wheels = [];
		for (let i = initseed; i < initseed + 15000; i++) {
			wheels.push([[(i / 1000) % 30000, (i / 1000) % 30000, (i / 1000) % 30000]]);
			while (wheels[wheels.length - 1].length < 75) {
				let curseed = wheels[wheels.length - 1].pop();
				let s1 = curseed[0]; let s2 = curseed[1]; let s3 = curseed[2];
				s1 = (171 * s1) % 30269; s2 = (172 * s2) % 30307; s3 = (170 * s3) % 30323;
				wheels[wheels.length - 1].push(Math.floor(37 * ((s1 / 30269.0 + s2 / 30307.0 + s3 / 30323.0) % 1.0)));
				wheels[wheels.length - 1].push([s1, s2, s3]);

			}
		}
		let seen = [];
		while (!doc.body.innerText.includes("You're not allowed here anymore.")) {
			if (z > 10) {
				let wagerField = doc.evaluate("//button[text()='Stop playing']", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.children[4].firstChild.firstChild;
				Object.getOwnPropertyDescriptor(eval('window').HTMLInputElement.prototype, "value").set.call(wagerField, '10000000')
				wagerField.dispatchEvent(new Event('input', { bubbles: true }));
				await this.ns.asleep(0);
				//				return;
			}
			let wheels2 = wheels.filter(x => levenshteinDistance(x.slice(0, seen.length - 1), seen.slice(0, seen.length - 1)) < Math.max(5, seen.length / 2));
			if (wheels2.length > 10) {
				wheels = wheels2;
			}
			if (seen.length > 0) {
				wheels.sort((a, b) => levenshteinDistance(seen, a) - levenshteinDistance(seen, b));
			}
			let nextguess = [...wheels[0]];
			for (let i = 0; i < seen.length; i++) {
				nextguess.splice(0, 1 + nextguess.indexOf(seen[i]));
			}
			if (nextguess.length < 1) {
				nextguess = [0];
			}
			//			this.ns.print("Guessing... " + nextguess[0].toString());
			try {
				buttons[nextguess[0]][1][Object.keys(buttons[nextguess[0]][1])[1]].onClick({ isTrusted: true });
			} catch {
				await Do(this.ns, "ns.singularity.commitCrime", "Mug");
				await this.roulette();
				return;
			};
			z = z + 1;
			await this.ns.asleep(5000);
			seen.push(parseInt(doc.evaluate("//button[text()='Stop playing']", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.children[3].innerText));
		}
		let endgame = doc.evaluate("//button[contains(text(),'Stop playing')]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		endgame[Object.keys(endgame)[1]].onClick({ isTrusted: true });
		await this.ns.asleep(0);
		endgame = doc.evaluate("//button[contains(text(),'Return to World')]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		endgame[Object.keys(endgame)[1]].onClick({ isTrusted: true });
		killModal();
	}
}

export function minpathsum(data) {
	while (data.length > 1) {
		for (let i = 0; i < (data[data.length - 2]).length; i++) {
			data[data.length - 2][i] += Math.min(data[data.length - 1][i], Math.min(data[data.length - 1][i + 1]));
		}
		data.pop();
	}
	return data[0][0];
}

export function uniquepathsI(data) {
	let numbers = []
	for (let i = 0; i < data[0]; i++) {
		numbers.push([]);
		for (let j = 0; j < data[1]; j++) {
			numbers[numbers.length - 1].push(1);
			if (i > 0 && j != 0) {
				numbers[i][j] = numbers[i - 1][j] + numbers[i][j - 1];
			}
		}
	}
	return numbers[data[0] - 1][data[1] - 1];
}

export function uniquepathsII(data) {
	let answer = [];
	for (let i = 0; i < data.length; i++) {
		answer.push(new Array(data[0].length).fill(0));
	}
	for (let i = data.length - 1; i >= 0; i--) {
		for (let j = data[0].length - 1; j >= 0; j--) {
			if (data[i][j] == 0) {
				answer[i][j] = (i + 1 < data.length ? answer[i + 1][j] : 0) + (j + 1 < data[0].length ? answer[i][j + 1] : 0);
				answer[data.length - 1][data[0].length - 1] = 1;
			}
		}
	}
	return answer[0][0];
}

export function largestprimefactor(data) {
	let i = 2;
	while (data > 1) {
		while (data % i == 0) {
			data /= i;
		}
		i += 1;
	}
	return i - 1;
}

export function mergeoverlappingintervals(data) {
	let intervals = (new Array(data.map(x => x[1]).reduce((a, b) => { return Math.max(a, b) }))).fill(0);
	for (let interval of data) {
		for (let i = interval[0]; i < interval[1]; i++) {
			intervals[i] = 1;
		}
	}
	if (intervals.indexOf(1) == -1) {
		return [];
	}
	let answer = [[intervals.indexOf(1), intervals.indexOf(0, intervals.indexOf(1))]];
	while ((answer[answer.length - 1][0] != -1) && (answer[answer.length - 1][1] != -1)) {
		let a = intervals.indexOf(1, 1 + answer[answer.length - 1][1]);
		answer.push([a, intervals.indexOf(0, a)]);
	}
	if (answer[answer.length - 1][1] == -1) {
		answer[answer.length - 1][1] = intervals.length;
	}
	if (answer[answer.length - 1][0] == -1) {
		answer.pop();
	}
	return answer;
}

export function caesarcipher(data) {
	return data[0].split("").map(x => { return x === " " ? " " : "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[(("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(x) + 26 - data[1]) % 26)] }).join("");
	// return data[0].split("").map(x => x.charCodeAt(0)).map(x => x == 32 ? 32 : (x + 65 - data[1])%26 + 65).map(x => String.fromCharCode(x)).join("");
}

export function vigenere(data) {
	return data[0].split("").map((x, i) => { return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[(("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(x) + 13 + data[1].charCodeAt(i % data[1].length))) % 26] }).join("");
}

export function totalwaystosum(data) {
	let answer = [1].concat((new Array(data + 1)).fill(0));
	for (let i = 1; i < data; i++) {
		for (let j = i; j <= data; j++) {
			answer[j] += answer[j - i];
		}
	}
	return answer[data];
}

export function totalwaystosumII(data) {
	let answer = [1].concat((new Array(data[0])).fill(0));
	for (let i of data[1]) {
		for (let j = i; j <= data[0]; j++) {
			answer[j] += answer[j - i];
		}
	}
	return answer[data[0]];
}

export function spiralizematrix(data) {
	let answer = [];
	while (data.length > 0 && data[0].length > 0) {
		answer = answer.concat(data.shift());
		if (data.length > 0 && data[0].length > 0) {
			answer = answer.concat(data.map(x => x.pop()));
			if (data.length > 0 && data[0].length > 0) {
				answer = answer.concat(data.pop().reverse());
				if (data.length > 0 && data[0].length > 0) {
					answer = answer.concat(data.map(x => x.shift()).reverse());
				}
			}
		}
	}
	return answer;
}

export function subarraywithmaximumsum(data) {
	let answer = -1e308;
	for (let i = 0; i < data.length; i++) {
		for (let j = i; j < data.length; j++) {
			answer = Math.max(answer, data.slice(i, j + 1).reduce((a, b) => { return a + b }));
		}
	}
	return answer;
}

export function twocolor(data) {
	for (let i = 0; i < 2 ** data[0]; i++) {
		let answer = [];
		for (let j = 0; j < data[0]; j++) {
			answer[j] = (2 ** j & i) > 0 ? 1 : 0;
		}
		if (data[1].map(x => answer[x[0]] != answer[x[1]]).reduce((a, b) => { return a + b }) == data[1].length) {
			return answer;
		}
	}
	return [];
}

export function rlecompression(data) {
	let answer = "";
	data = data.split("");
	while (data.length > 0) {
		let z = data.splice(0, 1);
		let i = 1;
		while (i < 9 && data[0] == z & data.length > 0) {
			i += 1;
			data.splice(0, 1);
		}
		answer = answer.concat(i.toString()).concat(z);
	}
	return answer;
}

export function lzdecompression(data) {
	if (data.length == 0) {
		return "";
	}
	data = data.split("");
	let answer = "";
	while (data.length > 0) {
		let chunklength = parseInt(data.shift());
		if (chunklength > 0) {
			answer = answer.concat(data.splice(0, chunklength).join(""));
		}
		if (data.length > 0) {
			chunklength = parseInt(data.shift());
			if (chunklength != 0) {
				let rewind = parseInt(data.shift());
				for (let i = 0; i < chunklength; i++) {
					answer = answer.concat(answer[answer.length - rewind]);
				}
			}
		}
	}
	return answer;
}

export function lzcompression(data, ns) {
	let z = 0;
	let queue = [[], [], []];
	while (queue[1].length <= data.length) {
		queue[1].push([]);
	}
	while (queue[2].length <= data.length) {
		queue[2].push([]);
	}
	for (let i = 0; i <= 9 && i < data.length; i++) {
		queue[1][i].push(i.toString() + data.substring(0, i));
		queue[2][i].push(i.toString() + data.substring(0, i));
	}
	ns.tprint(queue);
	while (queue[1][data.length].length == 0 && queue[2][data.length].length == 0) {
		let i = (new Array(data.length)).fill(0).map((_, i) => i).map(i => [i, queue[1][i].length + queue[2][i].length]).filter(x => x[1] > 0).reduce((a, b) => b)[0];
		//		ns.tprint(i);
		//		ns.exit();
		if (queue[2][i].length > 0) queue[2][i].map(x => queue[1][i].push(x + "0"));
		if (queue[1][i].length > 0) queue[1][i].map(x => queue[2][i].push(x + "0"));
		queue[1][i] = Array.from(...new Set([queue[1][i].filter(x => (lzdecompression(x).length == i) && (lzdecompression(x) === data.substring(0, i))).sort((a, b) => { return a.length - b.length; })]));
		queue[2][i] = Array.from(...new Set([queue[2][i].filter(x => (lzdecompression(x).length == i) && (lzdecompression(x) === data.substring(0, i))).sort((a, b) => { return a.length - b.length; })]));
		queue[1][i] = queue[1][i].sort((a, b) => { return a.length - b.length; });
		queue[2][i] = queue[2][i].sort((a, b) => { return a.length - b.length; });
		ns.tprint(i, " ", queue[1][i], " ", queue[2][i]);
		if (queue[1][i].length > 0) {
			for (let current of queue[1][i].splice(0, 10)) {
				for (let l = 0; l <= 10; l++) {
					for (let j = 0; j <= 10; j++) {
						let temp = lzdecompression(current.concat(l.toString()).concat(j.toString()));
						if (temp === data.substring(0, temp.length)) {
							queue[2][temp.length].push(current.concat(l.toString()).concat(j.toString()));
						}
					}
				}
			}
			//			queue[1][i] = [];
		}
		if (queue[2][i].length > 0) {
			for (let current of queue[2][i].splice(0, 10)) {
				for (let j = 0; j <= 10; j++) {
					let temp = lzdecompression(current.concat(j.toString()).concat(data.substring(current.length, current.length + j)));
					if (temp === data.substring(0, temp.length)) {
						queue[1][temp.length].push(current.concat(j.toString()).concat(data.substring(current.length, current.length + j)));
					}
				}
			}
			//			queue[2][i] = [];
		}
	}
	queue[1][data.length] = queue[1][data.length].sort((a, b) => { return a.length - b.length; });
	queue[2][data.length] = queue[2][data.length].sort((a, b) => { return a.length - b.length; });
	ns.tprint(queue[1][data.length], " ", queue[2][data.length]);
	ns.exit();
}

export function stonks1(data) {
	let best = 0;
	for (let i = 0; i < data.length; i++) {
		for (let j = i + 1; j < data.length; j++) {
			best = Math.max(best, data[j] - data[i]);
		}
	}
	return best;
}

export function stonks2(data) {
	let best = 0;
	let queue = {};
	queue[JSON.stringify(data)] = 0;
	while (Object.keys(queue).length > 0) {
		let current = Object.keys(queue)[0];
		let value = queue[current];
		delete queue[current];
		let stonks = JSON.parse(current);
		for (let i = 0; i < stonks.length; i++) {
			for (let j = i + 1; j < stonks.length; j++) {
				best = Math.max(best, value + stonks[j] - stonks[i]);
				let remaining = stonks.slice(j + 1);
				if (remaining.length > 0) {
					if (!Object.keys(queue).includes(JSON.stringify(remaining))) {
						queue[JSON.stringify(remaining)] = -1e308;
					}
					queue[JSON.stringify(remaining)] = Math.max(queue[JSON.stringify(remaining)], value + stonks[j] - stonks[i]);
				}
			}
		}
	}
	return best;
}

export function stonks3(data) {
	let best = 0;
	for (let i = 0; i < data.length; i++) {
		for (let j = i + 1; j < data.length; j++) {
			best = Math.max(best, data[j] - data[i]);
			for (let k = j + 1; k < data.length; k++) {
				for (let l = k + 1; l < data.length; l++) {
					best = Math.max(best, data[j] - data[i] + data[l] - data[k]);
				}
			}
		}
	}
	return best;
}

export function stonks4(data) {
	let best = 0;
	let queue = {};
	queue[0] = {};
	queue[0][JSON.stringify(data[1])] = 0;
	for (let ii = 0; ii < data[0]; ii++) {
		queue[ii + 1] = {};
		while (Object.keys(queue[ii]).length > 0) {
			let current = Object.keys(queue[ii])[0];
			let value = queue[ii][current];
			delete queue[ii][current];
			let stonks = JSON.parse(current);
			for (let i = 0; i < stonks.length; i++) {
				for (let j = i + 1; j < stonks.length; j++) {
					best = Math.max(best, value + stonks[j] - stonks[i]);
					let remaining = stonks.slice(j + 1);
					if (remaining.length > 0) {
						if (!Object.keys(queue[ii + 1]).includes(JSON.stringify(remaining))) {
							queue[ii + 1][JSON.stringify(remaining)] = -1e308;
						}
						queue[ii + 1][JSON.stringify(remaining)] = Math.max(queue[ii + 1][JSON.stringify(remaining)], value + stonks[j] - stonks[i]);
					}
				}
			}
		}
	}
	return best;
}


export function generateips(data) {
	let answer = [];
	for (let i = 1; i + 1 < data.length; i++) {
		for (let j = i + 1; j + 1 < data.length; j++) {
			for (let k = j + 1; k < data.length; k++) {
				answer.push([data.substring(0, i), data.substring(i, j), data.substring(j, k), data.substring(k)]);
			}
		}
	}
	for (let i = 0; i < 4; i++) {
		answer = answer.filter(x => 0 <= parseInt(x[i]) && parseInt(x[i]) <= 255 && (x[i] == "0" || x[i].substring(0, 1) != "0"));
	}
	return answer.map(x => x.join("."));
}

export function arrayjumpinggame(data) {
	let queue = new Set();
	if (data[0] == 0) {
		return 0;
	}
	queue.add("[" + data.toString() + "]");
	while (queue.size > 0) {
		let current = Array.from(queue)[0];
		queue.delete(current);
		current = JSON.parse(current);
		if (current[0] != 0) {
			if (current[0] + 1 > current.length) {
				return 1;
			}
			for (let i = 1; i <= current[0] && i < current.length; i++) {
				queue.add(("[".concat(current.slice(i)).toString()).concat("]"));
			}
		}
	}
	return 0;
}

export function arrayjumpinggameII(data) {
	let queue = {};
	let best = 1e308;
	queue[data.toString()] = 0;
	while (Object.keys(queue).length > 0) {
		let current = Object.keys(queue)[0];
		let value = queue[current];
		delete queue[current];
		current = current.split(",").map(i => parseInt(i));
		if (current[0] + 1 >= current.length) {
			best = Math.min(best, value + 1);
		} else {
			for (let i = 1; i <= current[0]; i++) {
				let newIndex = current.slice(i).toString();
				if (!Object.keys(queue).includes(newIndex)) queue[newIndex] = 1e308;
				queue[newIndex] = Math.min(queue[newIndex], value + 1);
			}
		}
	}
	return best == 1e308 ? 0 : best;
}

export function hammingencode(data) {
	let answer = [];

	// Convert the data to a bit array. Can't use & due to data possibly being larger than a 32-bit int.
	let encoded = [];
	let remaining = data;
	while (remaining > 0) {
		encoded = [remaining % 2].concat(encoded);
		remaining = Math.floor((remaining - remaining % 2) / 2 + .4);
	}

	// Set up the answer array, skipping over the entries with an index that is a power of 2, as they'll be the parity bits
	let powersoftwo = (new Array(Math.ceil(Math.log2(data)))).fill(0).map((_, i) => 2 ** i);
	let a_i = 0; let e_i = 0;
	for (let e_i = 0; e_i < encoded.length; e_i++) {
		a_i += 1;
		while (powersoftwo.includes(a_i)) {
			a_i += 1;
		}
		answer[a_i] = encoded[e_i];
	}

	// Calculate the parity bits
	for (let i of powersoftwo.filter(x => x < answer.length)) {
		// Generate a list of indexes from 0 to answer.length-1
		answer[i] = (new Array(answer.length)).fill(0).map((_, i) => i);
		// Keep only the indexes that share a bit with i, which is a power of 2
		answer[i] = answer[i].filter(x => x > i && (i & x));
		// Map the indexes onto the values the represent
		answer[i] = answer[i].map(x => answer[x]);
		// Bitwise XOR reduction to a single value
		answer[i] = answer[i].reduce((a, b) => a ^ b, 0);
	}

	// Calculate the final parity bit and send it home
	answer[0] = answer.slice(1).reduce((a, b) => a ^ b);
	return answer.map(x => x.toString()).join("");
}

export function hammingdecode(data) {
	let powersoftwo = (new Array(Math.ceil(Math.log2(data)))).fill(0).map((_, i) => 2 ** i);
	let badbits = [];
	for (let i of powersoftwo.filter(x => x < data.length)) {
		let checksum = (new Array(data.length)).fill(0).map((_, i) => i).filter(x => x > i && (i & x)).map(x => parseInt(data.substring(x, x + 1))).reduce((a, b) => a ^ b);
		if (parseInt(data.substring(i, i + 1)) != checksum) {
			badbits.push(i);
		}
	}
	if (badbits.length == 0) { // No error in the data
		let checksum = data.substring(1).split("").map(x => parseInt(x)).reduce((a, b) => a ^ b);
		if (checksum == parseInt(data.substring(0, 1))) {
			let number = data.split("").map(x => parseInt(x));
			for (let i of powersoftwo.filter(x => x < data.length).reverse()) {
				number.splice(i, 1);
			}
			number.splice(0, 1);
			return number.reduce((a, b) => a * 2 + b);
		}
	}
	let badindex = badbits.reduce((a, b) => a | b, 0);
	return hammingdecode(data.substring(0, badindex).concat(data.substring(badindex, badindex + 1) == "0" ? "1" : "0").concat(data.substring(badindex + 1)));
}

export function findallvalidmathexpressions(data, ns) {
	let queue = new Set();
	queue.add(data[0]);
	for (let current of queue) {
		let splitted = current.split("");
		for (let i = 1; i < splitted.length; i++) {
			if (!("+-*".includes(splitted[i - 1])) && !("+-*".includes(splitted[i]))) {
				queue.add((splitted.slice(0, i).concat("+").concat(splitted.slice(i))).join(""));
				queue.add((splitted.slice(0, i).concat("-").concat(splitted.slice(i))).join(""));
				queue.add((splitted.slice(0, i).concat("*").concat(splitted.slice(i))).join(""));
				//				queue.add((splitted.slice(0, i).concat("*-").concat(splitted.slice(i))).join(""));
			}
		}
	}
	let zeroes = Array.from(queue) //.concat(Array.from(queue).map(x => "-".concat(x)));
	for (let i = 0; i < 10; i++) {
		zeroes = zeroes.filter(x => !x.includes("+0".concat(i.toString())));
		zeroes = zeroes.filter(x => !x.includes("-0".concat(i.toString())));
		zeroes = zeroes.filter(x => !x.includes("*0".concat(i.toString())));
		zeroes = zeroes.filter(x => x.substring(0, 1) != "0" || "+-*".includes(x.substring(1, 2)));
	}
	return zeroes.filter(x => eval(x) == data[1]);
}

export function sanitizeparentheses(data) {
	let queue = new Set();
	queue.add(data);
	while (Array.from(queue).length > 0 && (Array.from(queue)[0].split("").includes("(") || Array.from(queue)[0].split("").includes(")"))) {
		let answer = [];
		let nextqueue = new Set();
		for (let current of Array.from(queue)) {
			let good = true;
			let goodsofar = 0;
			for (let i = 0; i < current.length; i++) {
				if (current.substring(i, i + 1) == "(") {
					goodsofar += 1;
				}
				if (current.substring(i, i + 1) == ")") {
					goodsofar -= 1;
				}
				if (goodsofar < 0) {
					good = false;
				}
			}
			if (goodsofar != 0) {
				good = false;
			}
			if (good) {
				answer.push(current);
			}
			for (let i = 0; i < current.length; i++) {
				if ("()".includes(current.substring(i, i + 1))) {
					nextqueue.add(current.substring(0, i).concat(current.substring(i + 1)));
				}
			}
		}
		if (answer.length > 0) {
			return answer;
		}
		queue = JSON.parse(JSON.stringify(Array.from(nextqueue)));
	}
	return [Array.from(queue)[0]];
}

export function shortestpathinagrid(data) {
	let solutions = { "0,0": "" };
	let queue = new Set();
	queue.add("0,0");
	for (let current of queue) {
		let x = parseInt(current.split(",")[0]);
		let y = parseInt(current.split(",")[1]);
		if (x > 0) {
			if (data[x - 1][y] == 0) {
				let key = (x - 1).toString().concat(",").concat(y.toString());
				if (!Array.from(queue).includes(key)) {
					solutions[key] = solutions[current] + "U";
					queue.add(key);
				}
			}
		}
		if (x + 1 < data.length) {
			if (data[x + 1][y] == 0) {
				let key = (x + 1).toString().concat(",").concat(y.toString());
				if (!Array.from(queue).includes(key)) {
					solutions[key] = solutions[current] + "D";
					queue.add(key);
				}
			}
		}
		if (y > 0) {
			if (data[x][y - 1] == 0) {
				let key = x.toString().concat(",").concat((y - 1).toString());
				if (!Array.from(queue).includes(key)) {
					solutions[key] = solutions[current] + "L";
					queue.add(key);
				}
			}
		}
		if (y + 1 < data[0].length) {
			if (data[x][y + 1] == 0) {
				let key = x.toString().concat(",").concat((y + 1).toString());
				if (!Array.from(queue).includes(key)) {
					solutions[key] = solutions[current] + "R";
					queue.add(key);
				}
			}
		}
	}
	let finalkey = (data.length - 1).toString().concat(",").concat((data[0].length - 1).toString());
	if (Object.keys(solutions).includes(finalkey)) {
		return solutions[finalkey];
	}
	return "";
}

export class Contracts {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
		this.contracts = {};
		this.times = {};
		this.log = ns.tprint.bind(ns);
		if (ns.flags(cmdlineflags)['logbox']) {
			this.log = this.game.sidebar.querySelector(".contractbox") || this.game.createSidebarItem("Contracts", "", "C", "contractbox");
			this.log = this.log.log;
		}
	}
	async list() {
		//		this['window'] = this['window'] || await makeNewWindow("Contracts", this.ns.ui.getTheme())
		let files = [];
		for (let server of this.game['Servers'].serverlist) {
			files = files.concat((await Do(this.ns, "ns.ls", server)).filter(x => x.includes(".cct")).map(filename => [server, filename]));
		}
		// this.ns.tprint(files);
		for (let i = 0; i < files.length; i++) {
			this.contracts[files[i][1]] = {};
			this.contracts[files[i][1]].server = files[i][0];
			this.contracts[files[i][1]].type = await Do(this.ns, "ns.codingcontract.getContractType", files[i][1], files[i][0]);
			this.contracts[files[i][1]].data = await Do(this.ns, "ns.codingcontract.getData", files[i][1], files[i][0]);
			this.contracts[files[i][1]].description = await Do(this.ns, "ns.codingcontract.getDescription", files[i][1], files[i][0]);
			while (this.contracts[files[i][1]].description.indexOf("\n") > -1) {
				this.contracts[files[i][1]].description = this.contracts[files[i][1]].description.replace("\n", "<BR>");
			}
		}
		//		let output = "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0>";
		//		for (let i of Object.keys(this.contracts)) {
		//			output += "<TR><TD>" + this.contracts[i].description.replace("\n", "<BR>") + "</TD><TD>" + this.contracts[i].server + "</TD><TD>" + this.contracts[i].type + "</TD><TD>" + JSON.stringify(this.contracts[i].data) + "</TD></TR>";
		//		}
		//		output += "</TABLE>";
		//		this['window'].update(output);
		return this.contracts;
	}
	async solve() {
		await this.list();
		for (let contract of Object.keys(this.contracts)) {
			let done = false;
			//this.ns.tprint(contract);
			for (let types of [
				["Minimum Path Sum in a Triangle", minpathsum],
				["Unique Paths in a Grid I", uniquepathsI],
				["Unique Paths in a Grid II", uniquepathsII],
				["Find Largest Prime Factor", largestprimefactor],
				["Merge Overlapping Intervals", mergeoverlappingintervals],
				["Encryption I: Caesar Cipher", caesarcipher],
				["Total Ways to Sum", totalwaystosum],
				["Total Ways to Sum II", totalwaystosumII],
				["Spiralize Matrix", spiralizematrix],
				["Subarray with Maximum Sum", subarraywithmaximumsum],
				["Proper 2-Coloring of a Graph", twocolor],
				["Compression I: RLE Compression", rlecompression],
				["Compression II: LZ Decompression", lzdecompression],
				//["Compression III: LZ Compression", lzcompression],
				["Algorithmic Stock Trader I", stonks1],
				["Algorithmic Stock Trader II", stonks2],
				["Algorithmic Stock Trader III", stonks3],
				["Algorithmic Stock Trader IV", stonks4],
				["Encryption II: Vigenère Cipher", vigenere],
				["Generate IP Addresses", generateips],
				["Array Jumping Game", arrayjumpinggame],
				["Array Jumping Game II", arrayjumpinggameII],
				["HammingCodes: Integer to Encoded Binary", hammingencode],
				["HammingCodes: Encoded Binary to Integer", hammingdecode],
				["Find All Valid Math Expressions", findallvalidmathexpressions],
				["Sanitize Parentheses in Expression", sanitizeparentheses],
				["Shortest Path in a Grid", shortestpathinagrid]
			]) {
				if (!Object.keys(this.times).includes(types[0])) {
					this.times[types[0]] = [];
				}
				if (!done) {
					if (this.contracts[contract].type === types[0]) {
						this.log("Starting " + types[0] + " on " + this.contracts[contract].server);
						await this.ns.asleep(0);
						let starttime = Date.now();
						let success = await Do(this.ns, "ns.codingcontract.attempt", types[1](this.contracts[contract].data, this.ns), contract, this.contracts[contract].server);
						if (success.length > 0) {
							delete this.contracts[contract];
							this.log("Succeeded at " + types[0] + ": " + success);
							done = true;
						} else {
							this.log("Failed at " + types[0]);
							this.log("Failed at " + types[0], " ", types[1](this.contracts[contract].data, this.ns));
							//this.ns.exit();
						}
						this.times[types[0]].push(Date.now() - starttime);
						this.log(types[0] + " average time: " + (this.times[types[0]].reduce((a, b) => a + b) / this.times[types[0]].length).toString());
					}
				}
			}
		}
		await this.list();
	}
}

export class Corp {
	// Janaszar - https://discord.com/channels/415207508303544321/923445881389338634/965914553479200808
	EMPLOYEERATIOS = {
		"Food": 28,
		"Tobacco": 9,
		"Pharmaceutical": 31,
		"Computer": 37,
		"Robotics": 30,
		"Software": 37,
		"Healthcare": 27,
		"RealEstate": 0
	};

	HQ = ["Sector-12"];

	CITIES = ["Sector-12", "Aevum", "Chongqing", "New Tokyo", "Ishima", "Volhaven"];

	SIMPLEINDUSTRIES = ["Agriculture", "Energy", "Utilities", "Fishing", "Mining", "Chemical", "Pharmaceutical", "Computer", "Robotics", "Software", "RealEstate"];

	PRODUCTINDUSTRIES = ["Food", "Tobacco", "Pharmaceutical", "Computer", "Robotics", "Software", "Healthcare", "RealEstate"];

	OFFERS = [210e9, 5e12, 800e12, 128e15];

	WAREHOUSEMULTS = {
		"Energy": {
			"Real Estate": .65,
			"Hardware": 0,
			"Robots": .05,
			"AI Cores": .3
		},
		"Utilities": {
			"Real Estate": .5,
			"Hardware": 0,
			"Robots": .4,
			"AI Cores": .4
		},
		"Agriculture": {
			"Real Estate": .72,
			"Hardware": .2,
			"Robots": .3,
			"AI Cores": .3
		},
		"Fishing": {
			"Real Estate": .15,
			"Hardware": .35,
			"Robots": .5,
			"AI Cores": .2
		},
		"Mining": {
			"Real Estate": .3,
			"Hardware": 0,
			"Robots": .45,
			"AI Cores": .45
		},
		"Food": {
			"Real Estate": .05,
			"Hardware": .15,
			"Robots": .3,
			"AI Cores": .25
		},
		"Tobacco": {
			"Real Estate": .15,
			"Hardware": .15,
			"Robots": .2,
			"AI Cores": .15
		},
		"Chemical": {
			"Real Estate": .25,
			"Hardware": .2,
			"Robots": .25,
			"AI Cores": .2
		},
		"Pharmaceutical": {
			"Real Estate": .05,
			"Hardware": .15,
			"Robots": .25,
			"AI Cores": .2
		},
		"Computer": {
			"Real Estate": .2,
			"Hardware": 0,
			"Robots": .36,
			"AI Cores": .19
		},
		"Robotics": {
			"Real Estate": .32,
			"Hardware": .19,
			"Robots": 0,
			"AI Cores": .36
		},
		"Software": {
			"Real Estate": .15,
			"Hardware": 0,
			"Robots": .05,
			"AI Cores": 0
		},
		"Healthcare": {
			"Real Estate": .1,
			"Hardware": .1,
			"Robots": .1,
			"AI Cores": .1
		},
		"RealEstate": {
			"Real Estate": 0,
			"Hardware": 0,
			"Robots": .6,
			"AI Cores": .6
		}
	};

	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
		this.mults = [
			[.30, .20, .72, .30], //  0 - Agriculture
			[.20, .20, .25, .25], //  1 - Chemical
			[.19, .00, .20, .36], //  2 - Computer
			[.30, .00, .65, .05], //  3 - Energy
			[.20, .35, .50, .15], //  4 - Fishing
			[.25, .15, .05, .30], //  5 - Food
			[.10, .10, .10, .10], //  6 - Healthcare
			[.45, .40, .30, .45], //  7 - Mining
			[.20, .15, .05, .25], //  8 - Pharmaceutical
			[.60, .06, .00, .60], //  9 - Real Estate
			[.36, .19, .32, .00], // 10 - Robotics
			[.18, .25, .15, .05], // 11 - Software
			[.15, .15, .15, .20], // 12 - Tobacco
			[.50, .00, .50, .40]  // 13 - Utilities
		]
		this.nname = "Name";
		this.ddivisions = {}
	}
	async removelog() {
		for (let i of await Do(this.ns, "ns.ls", 'home')) {
			if (i.includes("log") && i.includes("txt")) {
				await Do(this.ns, "ns.rm", i, 'home');
			}
			if (i.includes("/temp/")) {
				await Do(this.ns, "ns.rm", i, 'home');
			}
		}
	}
	async startit(name) {
		let c = eval("this.#ns.corporation");
		try {
			c.getCorporation().funds;
		} catch (error) {
			if (error === "cannot be called without a corporation") {
				try {
					c.createCorporation(name, false);
				} catch (error) {
					if (error === "cannot use seed funds outside of BitNode 3") {
						c.createCorporation(name, true);
					} else {
						throw new Error(error);
					}
				}
			} else {
				throw new Error(error);
			}
		}
	}
	get round() {
		let c = eval("this.#ns.corporation");
		try {
			if (c.getCorporation().public) {
				return 5;
			}
		} catch {
			return 0;
		}
		return c.getInvestmentOffer().round;
	}
	get peeps() {
		let c = eval("this.#ns.corporation");
		let answer = [];
		for (let division of c.getCorporation().divisions) {
			for (let city of division.cities) {
				for (let emp of c.getOffice(division.name, city).employees) {
					answer = answer.concat([[division.name, city, new Employee(this.ns, division.name, city, emp).name]]);
				}
			}
		}
		return answer;
	}
	get divisions() {
		let c = eval("this.#ns.corporation");
		let answer = {};
		for (let division of c.getCorporation().divisions) {
			answer[division.type] = this.getDiv(division.type);
		}
		return answer;
	}
	get funds() {
		let c = eval("this.#ns.corporation");
		return c.getCorporation().funds;
	}
	getDiv(divisiontype) {
		let c = eval("this.#ns.corporation");
		if (c.getCorporation().divisions.filter(x => x.type == divisiontype).length == 0) {
			if (Object.keys(this.divisions).includes(divisiontype)) {
				this.divisions.delete(divisiontype);
			}
			return null;
		}
		if (!Object.keys(this.divisions).includes(divisiontype)) {
			this.divisions[divisiontype] = new Division(this.ns, divisiontype);
		}
		return this.divisions[divisiontype];
	}
	get Agriculture() {
		return this.getDiv("Agriculture");
	}
	get Chemical() {
		return this.getDiv("Chemical");
	}
	get Computer() {
		return this.getDiv("Computer");
	}
	get Energy() {
		return this.getDiv("Energy");
	}
	get Fishing() {
		return this.getDiv("Fishing");
	}
	get Food() {
		return this.getDiv("Food");
	}
	get Healthcare() {
		return this.getDiv("Healthcare");
	}
	get Mining() {
		return this.getDiv("Mining");
	}
	get Pharmaceutical() {
		return this.getDiv("Pharmaceutical");
	}
	get ['Real Estate']() {
		return this.getDiv("Real Estate");
	}
	get Robotics() {
		return this.getDiv("Robotics");
	}
	get Software() {
		return this.getDiv("Software");
	}
	get Tobacco() {
		return this.getDiv("Tobacco");
	}
	get Utilities() {
		return this.getDiv("Utilities");
	}
	startDivision(industry, full = false) {
		if (c.getCorporation().divisions.filter(x => x.type == industry).length == 0) {
			if (!full) {
				if (c.getExpandIndustryCost(type) < this.funds) {
					c.expandIndustry(type, name === "COPYTYPE" ? type : name);
				}
			} else {
				if (5 * c.getExpandCityCost() + 5 * c.getPurchaseWarehouseCost() + c.getExpandIndustryCost(type) < this.funds) {
					c.expandIndustry(type, name === "COPYTYPE" ? type : name);
					for (let city of CITIES) {
						c.expandCity(this.name, city);
						c.purchaseWarehouse(this.name, city);
					}
				}
			}
		}
	}
	async truxican() {
		if (ns.args.length == 2) {
			await (new Office(ns, ns.args[0], ns.args[1]).truxican());
		} else {
			let c = ns['corporation'];
			for (let division of c.getCorporation().divisions.map(x => x.name)) {
				for (let city of ["Sector-12", "Aevum", "Chongqing", "Ishima", "New Tokyo", "Volhaven"]) {
					while (ns.run("truxican.js", 1, division, city) == 0) {
						await ns.sleep(0);
					}
				}
			}
		}
	}
	async scam() {
		/** @param {NS} ns */
		let tailWin = {};
		tailWin["MacroHard"] = await makeNewTailWindow("Software");
		tailWin["Land Ho"] = await makeNewTailWindow("Real Estate");
		let i = 0;
		//  while(tailWin && !tailWin.closed){
		//    ++i%10===0 ? tailWin.log(`Log entry with no timestamp (${i})`, false) : tailWin.log(`Test log entry (${i})`);
		//  await slp(500);
		//}


		let c = eval("ns.corporation");
		try { c.createCorporation(CORPNAME, false); } catch { }
		try { c.createCorporation(CORPNAME, true); } catch { }
		for (let j of [0, 1]) {
			INDUSTRY = ["Software", "RealEstate"][j];
			DIVISIONNAME = ["MacroHard", "Land Ho"][j];
			PRODUCT = ["AI Cores", "Real Estate"][j];
			try { c.expandIndustry(INDUSTRY, DIVISIONNAME); } catch { }
			if (INDUSTRY == "RealEstate") {
				for (let SUBIND of ["Food", "Tobacco", "Software", "Agriculture"]) {
					try { c.expandIndustry(SUBIND, DIVISIONS[SUBIND]); } catch { };
				}
			} else {
				for (let i = 0; i < 7; i++) {
					c.levelUpgrade("Smart Storage");
				}
			}
			//	try { c.expandIndustry("Food", "Food"); } catch { }
			for (let DIVISION of c.getCorporation().divisions.map(x => x.name).sort((a, b) => { if (a == DIVISIONNAME) return -1; return 1; })) {
				for (let city of CITIES) {
					try { c.expandCity(DIVISION, city); } catch { }
					try { c.purchaseWarehouse(DIVISION, city); } catch { }
					try {
						c.assignJob(DIVISION, city, c.hireEmployee(DIVISION, city).name, "Research & Development");
						c.assignJob(DIVISION, city, c.hireEmployee(DIVISION, city).name, "Research & Development");
						c.assignJob(DIVISION, city, c.hireEmployee(DIVISION, city).name, "Research & Development");
					} catch { }
					if (INDUSTRY == "RealEstate") {
						c.upgradeOfficeSize(DIVISION, city, 6);
						try { c.assignJob(DIVISION, city, c.hireEmployee(DIVISION, city).name, "Research & Development"); } catch { }
						try { c.assignJob(DIVISION, city, c.hireEmployee(DIVISION, city).name, "Research & Development"); } catch { }
						try { c.assignJob(DIVISION, city, c.hireEmployee(DIVISION, city).name, "Research & Development"); } catch { }
						try { c.assignJob(DIVISION, city, c.hireEmployee(DIVISION, city).name, "Research & Development"); } catch { }
						try { c.assignJob(DIVISION, city, c.hireEmployee(DIVISION, city).name, "Research & Development"); } catch { }
						try { c.assignJob(DIVISION, city, c.hireEmployee(DIVISION, city).name, "Research & Development"); } catch { }
					}
				}
				for (let city of CITIES) {
					if (DIVISION != DIVISIONNAME) {
						c.exportMaterial(DIVISIONNAME, "Aevum", DIVISION, city, "Real Estate", 1);
					}
					for (let i = 0; i < 6; i++) {
						c.upgradeWarehouse(DIVISION, city);
					}
				}
			}
			await ns.sleep(20000);
			let employees = CITIES.map(x => c.getOffice(DIVISIONNAME, x).employees.map(y => [x, y])).flat();
			let i = 0;
			while (i < employees.length) {
				//		c.assignJob(DIVISIONNAME, employees[i][0], employees[i][1], ["Business", "Engineer", "Operations"][i%3]);
				c.assignJob(DIVISIONNAME, employees[i][0], employees[i][1], "Engineer");
				i += 1;
			}
			try { c.hireAdVert(DIVISIONNAME); } catch { }
			try { c.hireAdVert(DIVISIONNAME); } catch { }
			try { c.hireAdVert(DIVISIONNAME); } catch { }
			await ns.sleep(10000);
			//c.getCorporation().divisions.map(z => CITIES.map(x => ns.run("truxican.js", 1, z.name, x)));
			//c.hireAdVert(DIVISIONNAME);

			for (let city of CITIES) {
				c.buyMaterial(DIVISIONNAME, city, "Energy", .01 * (INDUSTRY == "Software" ? 1 : 5));
				c.buyMaterial(DIVISIONNAME, city, "Hardware", .01 * (INDUSTRY == "Software" ? 1 : 4));
				if (INDUSTRY == "RealEstate") {
					c.buyMaterial(DIVISIONNAME, city, "Water", 5 * .01);
					c.buyMaterial(DIVISIONNAME, city, "Metal", 2 * .01);
				}
			}
			for (let city of CITIES) {
				for (let DIVISION of c.getCorporation().divisions.map(x => x.name)) {
					c.sellMaterial(DIVISION, city, PRODUCT, "0", "MP*1");
				}
			}
			employees = c.getCorporation().divisions.map(z => CITIES.map(x => c.getOffice(z.name, x).employees.map(y => [z.name, x, y]))).flat().flat();
			i = 0;
			while (i < employees.length) {
				c.assignJob(employees[i][0], employees[i][1], employees[i][2], "Research & Development");
				i += 1;
			}
			if (INDUSTRY == "RealEstate") {
				while (c.getUpgradeLevel("Speech Processor Implants") < 15 && c.getUpgradeLevelCost("Speech Processor Implants") < c.getCorporation().funds - 3e9) {
					c.levelUpgrade("Speech Processor Implants");
				}
				while (c.getUpgradeLevel("Neural Accelerators") < 10 && c.getUpgradeLevelCost("Neural Accelerators") < c.getCorporation().funds - 3e9) {
					c.levelUpgrade("Neural Accelerators");
				}
				while (c.getUpgradeLevel("FocusWires") < 10 && c.getUpgradeLevelCost("FocusWires") < c.getCorporation().funds - 3e9) {
					c.levelUpgrade("FocusWires");
				}
				while (c.getUpgradeLevel("ABC SalesBots") < 15 && c.getUpgradeLevelCost("ABC SalesBots") < c.getCorporation().funds - 3e9) {
					c.levelUpgrade("ABC SalesBots");
				}
				while (c.getUpgradeLevel("Wilson Analytics") < 5 && c.getUpgradeLevelCost("Wilson Analytics") < c.getCorporation().funds - 3e9) {
					c.levelUpgrade("Wilson Analytics");
				}
				while (c.getUpgradeLevel("Project Insight") < 10 && c.getUpgradeLevelCost("Project Insight") < c.getCorporation().funds - 3e9) {
					c.levelUpgrade("Project Insight");
				}
				while (c.getUpgradeLevel("Nuoptimal Nootropic Injector Implants") < 10 && c.getUpgradeLevelCost("Nuoptimal Nootropic Injector Implants") < c.getCorporation().funds - 3e9) {
					c.levelUpgrade("Nuoptimal Nootropic Injector Implants");
				}
			}
			await gethappy(ns);
			while (c.getUpgradeLevelCost("Smart Storage") < c.getCorporation().funds) {
				c.levelUpgrade("Smart Storage");
			}
			for (let city of CITIES) {
				c.buyMaterial(DIVISIONNAME, city, "Energy", .01 * (INDUSTRY == "Software" ? 1 : 5));
				c.buyMaterial(DIVISIONNAME, city, "Hardware", .01 * (INDUSTRY == "Software" ? 1 : 4));
				if (INDUSTRY == "RealEstate") {
					c.buyMaterial(DIVISIONNAME, city, "Water", 5 * .01);
					c.buyMaterial(DIVISIONNAME, city, "Metal", 2 * .01);
				}
				for (let DIVISION of c.getCorporation().divisions.map(x => x.name)) {
					c.sellMaterial(DIVISION, city, PRODUCT, "0", "MP*1");
					c.buyMaterial(DIVISION, city, PRODUCT, c.getWarehouse(DIVISIONNAME, city).size * .99 / 2 * (INDUSTRY == "Software" ? 1 : 20));
				}
			}
			let done = false;
			while (!done) {
				done = true;
				while (c.getHireAdVertCost(DIVISIONNAME) < c.getCorporation().funds) {
					for (let DIVISION of c.getCorporation().divisions.map(x => x.name)) {
						c.hireAdVert(DIVISION);
						done = false;
					}
				}
			}
			employees = c.getCorporation().divisions.map(z => CITIES.map(x => c.getOffice(z.name, x).employees.map(y => [z.name, x, y]))).flat().flat();
			i = 0;
			tailWin[DIVISIONNAME].log("Start Engineers: Quality is " + c.getMaterial(DIVISIONNAME, "Aevum", PRODUCT).qlt.toString());
			while (i < employees.length) {
				c.assignJob(employees[i][0], employees[i][1], employees[i][2], "Engineer");
				//		    if (c.getInvestmentOffer().round == 1) {
				//			    c.assignJob(employees[i][0], employees[i][1], employees[i][2], ["Business", "Engineer", "Operations"][i%3]);
				//		    } else {
				//			    c.assignJob(employees[i][0], employees[i][1], employees[i][2], ["Business", "Engineer", "Operations","Business", "Engineer", "Operations","Management","Operations","Engineer"][i%9]);
				//		    }
				i += 1;
			}
			await ns.sleep(20000);
			for (let DIVISION of c.getCorporation().divisions.map(x => x.name)) {
				for (let city of CITIES) {
					c.buyMaterial(DIVISION, city, PRODUCT, 0);
				}
			}
			employees = c.getCorporation().divisions.map(z => CITIES.map(x => c.getOffice(z.name, x).employees.map(y => [z.name, x, y]))).flat().flat();
			i = 0;
			tailWin[DIVISIONNAME].log("Start Business: Quality is " + c.getMaterial(DIVISIONNAME, "Aevum", PRODUCT).qlt.toString());
			while (i < employees.length) {
				c.assignJob(employees[i][0], employees[i][1], employees[i][2], "Business");
				i += 1;
			}
			await ns.sleep(10000);
			for (let DIVISION of c.getCorporation().divisions.map(x => x.name)) {
				for (let city of CITIES) {
					c.sellMaterial(DIVISION, city, PRODUCT, "MAX", "MP*1");
				}
			}
			let lastoffer = 0;
			while (c.getInvestmentOffer().funds < 2.9e12 || c.getInvestmentOffer().round > 1) {
				if (c.getInvestmentOffer().funds != lastoffer) {
					lastoffer = c.getInvestmentOffer().funds;
					tailWin[DIVISIONNAME].log(lastoffer.toString());
				}
				await ns.sleep(0);
				if (lastoffer >= 530e15) {
					c.acceptInvestmentOffer();
					c.getCorporation().divisions.map(z => CITIES.map(x => c.getOffice(z.name, x).employees.map(y => c.assignJob(z.name, x, y, "Unassigned"))));
					//ns.run("lazy.js");
					//await ns.sleep(0);
					//ns.exit();
				}
			}
			lastoffer = c.getInvestmentOffer().funds;
			tailWin[DIVISIONNAME].log(lastoffer.toString());
			c.acceptInvestmentOffer();
			for (let city of CITIES) {
				for (let MATERIAL of ["Hardware", "Energy", "AI Cores"]) {
					c.sellMaterial(DIVISIONNAME, city, MATERIAL, "MAX", "0");
					c.buyMaterial(DIVISIONNAME, city, MATERIAL, 0);
				}
			}
		}
		/*	const division_goals = [1, 5,]
		const employee_goals = [3, 6]
		const storage_goals = [8, 23]
		const speech_goals = [0, 15]
		const smart_goals = [7, 36]
		const stat_goals = [0, 10,]
		const project_goals = [0, 10]
		const abc_goals = [0, 15]
		const adv_goals = [3, 21]
		const wilson_goals = [0, 5] */
	}
	async hire() {
		let c = eval("ns.corporation");
		while (c.getCorporation().state != "START") {
			await ns.sleep(0);
		}
		let PRODDYIND = ["Robotics"]; let productindustry = "Robotics";
		let done = false;
		while (!done) {
			await ns.sleep(10000);
			done = true;
			let todo = [];
			for (let hireind of PRODDYIND) {
				//ns.tprint(hireind, PRODDYIND);
				for (let city of CITIES) {
					if (city == HQ || (c.getOffice(DIVISIONS[hireind], city).size + 60 < c.getOffice(DIVISIONS[hireind], HQ).size)) {
						if ((c.getOffice(DIVISIONS[hireind], city).size < 3000)) {
							if (hireind == productindustry) {
								todo.push([c.getOfficeSizeUpgradeCost(DIVISIONS[hireind], city, 15), "ns.corporation.upgradeOfficeSize(\"" + DIVISIONS[hireind] + "\", \"" + city + "\", 15)"]);
							}
						}
					}
					if ((c.getOffice(DIVISIONS[hireind], HQ).size >= 3000) && (c.getOffice(DIVISIONS[hireind], city).size < 3000)) {
						if (hireind == productindustry) {
							todo.push([c.getOfficeSizeUpgradeCost(DIVISIONS[hireind], city, 15), "ns.corporation.upgradeOfficeSize(\"" + DIVISIONS[hireind] + "\", \"" + city + "\", 15)"]);
						}
					}
				}
				todo.push([2 * c.getUpgradeLevelCost("Project Insight"), "ns.corporation.levelUpgrade(\"Project Insight\")"]);
				todo.push([10 * c.getUpgradeLevelCost("Wilson Analytics"), "ns.corporation.levelUpgrade(\"Wilson Analytics\")"]);
				if (c.getCorporation().funds > 1000000000000) {
					todo.push([c.getHireAdVertCost(DIVISIONS[hireind]), "ns.corporation.hireAdVert(DIVISIONS[\"" + hireind + "\"])"]);
				}
			}
			todo = todo.sort((a, b) => { return a[0] - b[0]; });
			//ns.tprint(todo);
			if (todo.length > 0 && (todo[0][0] <= c.getCorporation().funds)) {
				ns.print(todo[0]);
				eval(todo[0][1]);
				done = false;
				await ns.sleep(0);
			}
			//ns.tprint(todo);
			for (let city of CITIES) {
				while (c.getOffice(DIVISIONS[productindustry], city).employees.length < c.getOffice(DIVISIONS[productindustry], city).size) {
					c.hireEmployee(DIVISIONS[productindustry], city);
					await ns.sleep(0);
				}
			}
		}
	}
	calc(ai = 0, hw = 0, re = 0, rob = 0, industry = 0) {
		return (((.002 * ai + 1) ** mults[industry][0]) * ((.002 * hw + 1) ** mults[industry][1]) * ((.002 * re + 1) ** mults[industry][2]) * ((.002 * rob + 1) ** mults[industry][3])) ** .73
	}
	optimizerr(industry, size) {
		if (size == 0) {
			return [0, 0, 0];
		}
		let searchmin = 0;
		let searchmax = size;
		let divs = (searchmax - searchmin) * .0001;
		let scores = [[calc(0, 0, 0, size / .5, industry), 0, size]];
		while (divs > .00000005 && searchmin < searchmax) {
			let i = searchmin;
			while (i <= searchmax + divs) {
				if (i <= size && i >= 0) {
					scores = scores.concat([[calc(0, 0, i / .005, (size - i) / .5, industry), i, size - i]]);
				}
				i += divs;
			}
			scores = scores.sort((a, b) => { return a[0] - b[0]; });
			searchmin = scores[scores.length - 1][0] - divs;
			searchmax = scores[scores.length - 1][0] + divs;
			divs *= .25;
		}
		return [scores[scores.length - 1][0], scores[scores.length - 1][1], size - scores[scores.length - 1][1]];
	}
	optimizeah(industry, size) {
		if (size == 0) {
			return [0, 0, 0];
		}
		let searchmin = 0;
		let searchmax = size;
		let divs = (searchmax - searchmin) * .0001;
		let scores = [[calc(0, size / .06, 0, 0, industry), 0, size]];
		while (divs > .0000000005 && searchmin < searchmax) {
			let i = searchmin;
			while (i <= searchmax + divs) {
				if (i <= size && i >= 0) {
					scores = scores.concat([[calc(i / .1, (size - i) / .06, 0, 0, industry), i, size - i]]);
				}
				i += divs;
			}
			scores = scores.sort((a, b) => { return a[0] - b[0]; });
			searchmin = scores[scores.length - 1][0] - divs;
			searchmax = scores[scores.length - 1][0] + divs;
			divs *= .25;
		}
		return [scores[scores.length - 1][0], scores[scores.length - 1][1], size - scores[scores.length - 1][1]];
	}
	optimize(industry, size) {
		if (size == 0) {
			return [0, 0, 0, 0, 0];
		}
		let searchmin = 0;
		let searchmax = size;
		let divs = (searchmax - searchmin) * .1;
		let scores = [[0, 0, 0, 0, 0, 0, 0, 0]];
		while (divs > .0000000005 && searchmin < searchmax) {
			let i = searchmin;
			while (divs > .0000000005 && i <= searchmax + divs) {
				if (i <= size && i >= 0) {
					let rr = optimizerr(industry, i);
					let ah = optimizeah(industry, size - i);
					scores = scores.concat([[ah[0] * rr[0], i, size - i, ah[1] / .1, ah[2] / .06, rr[1] / .005, rr[2] / .5]]);
				}
				i += divs;
			}
			scores.sort((a, b) => { return a[0] - b[0]; });
			searchmin = scores[scores.length - 1][1] - divs;
			searchmax = scores[scores.length - 1][1] + divs;
			divs *= .25;
		}
		let finalcheck = [[Math.floor(scores[scores.length - 1][3]), Math.floor(scores[scores.length - 1][4]), Math.floor(scores[scores.length - 1][5]), Math.floor(scores[scores.length - 1][6])]];
		for (let ai = finalcheck[0][0]; ai <= finalcheck[0][0] + 20; ai++) {
			for (let hw = finalcheck[0][1]; hw <= finalcheck[0][1] + 32; hw++) {
				for (let re = finalcheck[0][2]; re <= finalcheck[0][2] + 100; re++) {
					for (let rob = finalcheck[0][3]; rob <= finalcheck[0][3] + 4; rob++) {
						if (ai * .1 + hw * .06 + re * .005 + rob * .5 <= size) {
							finalcheck.push([ai, hw, re, rob]);
						}
					}
				}
			}
		}
		finalcheck = finalcheck.filter(x => x[0] * .1 + x[1] * .06 + x[2] * .005 + x[3] * .5 <= size);
		finalcheck = finalcheck.sort((a, b) => calc(a[0], a[1], a[2], a[3], industry) - calc(b[0], b[1], b[2], b[3], industry));
		finalcheck[finalcheck.length - 1].push(6 * calc(finalcheck[finalcheck.length - 1][0], finalcheck[finalcheck.length - 1][1], finalcheck[finalcheck.length - 1][2], finalcheck[finalcheck.length - 1][3], industry));
		return finalcheck[finalcheck.length - 1];
	}
	async updateDisplay() {
		//ns.tprint(globalThis.panopticonQueue);
		windows["Main"].update("<TABLE BORDER=0 WIDTH=100%><TR><TD><TABLE BORDER=0 WIDTH=100%><TR>" +
			"<TD>State:</TD><TD ALIGN=RIGHT>" + c.getCorporation().state + "</TD>" + "<TD WIDTH=50></TD>" +
			"<TD>Funding Round:</TD><TD ALIGN=RIGHT>" + c.getInvestmentOffer().round.toString() + "</TR><TR>" +
			"<TD>Funds:</TD><TD ALIGN=RIGHT>" + jFormat(c.getCorporation().funds, "$0.000a") + "</TD></TD>" + "<TD WIDTH=50></TD>" +
			"<TD>Investment Offer:</TD><TD ALIGN=RIGHT><a href=\"#\" onClick='window.opener.listenUp(\"c.acceptInvestmentOffer()\")'>" + jFormat(c.getInvestmentOffer().funds, "$0.000a") + "</A>" +
			"</TD></TR><TR><TD>Revenue:</TD><TD ALIGN=RIGHT>" + jFormat(c.getCorporation().revenue, "$0.000a") + "/s</TD>" + "<TD WIDTH=50></TD>" +
			"<TD>Publicly Traded:</TD><TD ALIGN=RIGHT>" + (c.getCorporation().public ? "Yes" : "No") + "</TD></TR><TR>" +
			"<TD>Expenses:</TD><TD ALIGN=RIGHT>" + jFormat(c.getCorporation().expenses, "$0.000a") + "/s</TD>" + "<TD WIDTH=50></TD>" +
			"<TD>Owned Stock Shares:</TD><TD ALIGN=RIGHT>" + jFormat(c.getCorporation().numShares, "0.000a") + "</TD></TR><TR>" +
			"<TD>Profit:</TD><TD ALIGN=RIGHT>" + jFormat(c.getCorporation().revenue - c.getCorporation().expenses, "$0.000a") + "/s</TD>" + "<TD WIDTH=50></TD>" +
			"<TD>Stock Price:</TD><TD ALIGN=RIGHT>" + (c.getCorporation().public ? jFormat(c.getCorporation().sharePrice, "$0.000a") : "N/A") + "</TD></TR><TR>" +
			"<TD></TD><TD ALIGN=RIGHT></TD>" + "<TD WIDTH=50></TD>" +
			"<TD>Total Stock Shares:</TD><TD ALIGN=RIGHT>" + jFormat(c.getCorporation().totalShares, "0.000a") + "</TD></TR></TABLE></TD></TR>" +
			"<TR><TD><TABLE WIDTH=100%><TR>" +
			"<TD>Smart Factories:</TD><TD ALIGN=RIGHT>" + c.getUpgradeLevel("Smart Factories") + "<BR><a href=\"#\" onClick='window.opener.listenUp(\"c.levelUpgrade(`Smart Factories`)\")'>" + jFormat(c.getUpgradeLevelCost("Smart Factories"), "$0.000a") + "</A></TD>" + "<TD WIDTH=50></TD>" +
			"<TD>Smart Storage:</TD><TD ALIGN=RIGHT>" + c.getUpgradeLevel("Smart Storage") + "<BR><a href=\"#\" onClick='window.opener.listenUp(\"c.levelUpgrade(`Smart Storage`)\")'>" + jFormat(c.getUpgradeLevelCost("Smart Storage"), "$0.000a") + "</A></TD>" + "<TD WIDTH=50></TD>" +
			"<TD>DreamSense:</TD><TD ALIGN=RIGHT>" + c.getUpgradeLevel("DreamSense") + "<BR><a href=\"#\" onClick='window.opener.listenUp(\"c.levelUpgrade(`DreamSense`)\")'>" + jFormat(c.getUpgradeLevelCost("DreamSense"), "$0.000a") + "</A></TD></TR><TR>" +
			"<TD>Wilson Analytics:</TD><TD ALIGN=RIGHT>" + c.getUpgradeLevel("Wilson Analytics") + "<BR><a href=\"#\" onClick='window.opener.listenUp(\"c.levelUpgrade(`Wilson Analytics`)\")'>" + jFormat(c.getUpgradeLevelCost("Wilson Analytics"), "$0.000a") + "</A></TD>" + "<TD WIDTH=50></TD>" +
			"<TD>Nuoptimal Nootropic Injector Implants:</TD><TD ALIGN=RIGHT>" + c.getUpgradeLevel("Nuoptimal Nootropic Injector Implants") + "<BR><a href=\"#\" onClick='window.opener.listenUp(\"c.levelUpgrade(`Nuoptimal Nootropic Injector Implants`)\")'>" + jFormat(c.getUpgradeLevelCost("Nuoptimal Nootropic Injector Implants"), "$0.000a") + "</A></TD>" + "<TD WIDTH=50></TD>" +
			"<TD>Speech Processor Implants:</TD><TD ALIGN=RIGHT>" + c.getUpgradeLevel("Speech Processor Implants") + "<BR><a href=\"#\" onClick='window.opener.listenUp(\"c.levelUpgrade(`Speech Processor Implants`)\")'>" + jFormat(c.getUpgradeLevelCost("Speech Processor Implants"), "$0.000a") + "</A></TD></TR><TR>" +
			"<TD>Neural Accelerators:</TD><TD ALIGN=RIGHT>" + c.getUpgradeLevel("Neural Accelerators") + "<BR><a href=\"#\" onClick='window.opener.listenUp(\"c.levelUpgrade(`Neural Accelerators`)\")'>" + jFormat(c.getUpgradeLevelCost("Neural Accelerators"), "$0.000a") + "</A></TD>" + "<TD WIDTH=50></TD>" +
			"<TD>FocusWires:</TD><TD ALIGN=RIGHT>" + c.getUpgradeLevel("FocusWires") + "<BR><a href=\"#\" onClick='window.opener.listenUp(\"c.levelUpgrade(`FocusWires`)\")'>" + jFormat(c.getUpgradeLevelCost("FocusWires"), "$0.000a") + "</A></TD>" + "<TD WIDTH=50></TD>" +
			"<TD>ABC SalesBots:</TD><TD ALIGN=RIGHT>" + c.getUpgradeLevel("ABC SalesBots") + "<BR><a href=\"#\" onClick='window.opener.listenUp(\"c.levelUpgrade(`ABC SalesBots`)\")'>" + jFormat(c.getUpgradeLevelCost("ABC SalesBots"), "$0.000a") + "</A></TD></TR>" +
			"<TD>Project Insight:</TD><TD ALIGN=RIGHT>" + c.getUpgradeLevel("Project Insight") + "<BR><a href=\"#\" onClick='window.opener.listenUp(\"c.levelUpgrade(`Project Insight`)\")'>" + jFormat(c.getUpgradeLevelCost("Project Insight"), "$0.000a") + "</A></TD>" + "<TD WIDTH=50></TD>" +
			"<TD></TD><TD ALIGN=RIGHT></TD>" + "<TD WIDTH=50></TD>" +
			"<TD></TD><TD ALIGN=RIGHT></TD></TR>" +
			"</TABLE></TD></TR></TABLE>");
		for (let division of c.getCorporation().divisions) {
			if (!(division.name in windows)) {
				ns.tprint(division.name);
				windows[division.name] = await makeNewTailWindow(division.name + " - " + division.type, ns.ui.getTheme());
			}
			windows[division.name].update("<TABLE BORDER=0 WIDTH=100%><TR><TD><TABLE WIDTH=100% BORDER=0><TR>" +
				"<TD>Awareness:</TD><TD ALIGN=RIGHT>" + (division.awareness > division.popularity ? "<FONT COLOR='" + ns.ui.getTheme()['error'] + "'>" : "") + jFormat(division.awareness, "0.000a") + "</TD>" + "<TD WIDTH=50></TD>" +
				"<TD>This Cycle Revenue:</TD><TD ALIGN=RIGHT>" + jFormat(division.thisCycleRevenue, "$0.000a") + "</TD>" + "<TD WIDTH=50></TD>" +
				"<TD>Last Cycle Revenue:</TD><TD ALIGN=RIGHT>" + jFormat(division.lastCycleRevenue, "$0.000a") + "</TD></TR><TR>" +
				"<TD>Popularity:</TD><TD ALIGN=RIGHT>" + (division.awareness > division.popularity ? "<FONT COLOR='" + ns.ui.getTheme()['error'] + "'>" : "") + jFormat(division.popularity, "0.000a") + "</TD>" + "<TD WIDTH=50></TD>" +
				"<TD>This Cycle Expenses:</TD><TD ALIGN=RIGHT>" + jFormat(division.thisCycleExpenses, "$0.000a") + "</TD>" + "<TD WIDTH=50></TD>" +
				"<TD>Last Cycle Expenses:</TD><TD ALIGN=RIGHT>" + jFormat(division.lastCycleExpenses, "$0.000a") + "</TD></TR><TR>" +
				"<TD>Production Multiplier:</TD><TD ALIGN=RIGHT>" + jFormat(division.prodMult, "0.000a") + "</TD>" + "<TD WIDTH=50></TD>" +
				"<TD>This Cycle Profit:</TD><TD ALIGN=RIGHT>" + jFormat(division.thisCycleRevenue - division.thisCycleExpenses, "$0.000a") + "</TD>" + "<TD WIDTH=50></TD>" +
				"<TD>Last Cycle Profit:</TD><TD ALIGN=RIGHT>" + jFormat(division.lastCycleRevenue - division.lastCycleExpenses, "$0.000a") + "</TD></TR><TR>" +
				"<TD>Research:</TD><TD ALIGN=RIGHT>" + jFormat(division.research, "0.000a") + "</TD>" + "<TD WIDTH=50></TD></TR>" +
				"</TABLE><BR><TABLE BORDER=1 WIDTH=100%><TR>" +
				division.cities.sort().map(city => "<TD ALIGN=CENTER><TABLE><TR><TD ALIGN=CENTER COLSPAN=2>" + city + "</TD></TR>" + (c.hasWarehouse(division.name, city) ? ("<TR>" +
					"<TD>WH:</TD><TD ALIGN=RIGHT>" + (c.getWarehouse(division.name, city).sizeUsed > .99 * c.getWarehouse(division.name, city).size ? "<FONT COLOR='" + ns.ui.getTheme()['error'] + "'>" : "") + jFormat(c.getWarehouse(division.name, city).sizeUsed, "0") + " / " + jFormat(c.getWarehouse(division.name, city).size, "0") + "<BR><a href=\"#\" onClick='window.opener.listenUp(\"c.upgradeWarehouse(`" + division.name + "`, `" + city + "`)\")'>" + jFormat(c.getUpgradeWarehouseCost(division.name, city), "$0.000a") + "</A></TD></TR>") : "<TR><TD COLSPAN=2 ALIGN=CENTER><a href=\"#\" onClick='window.opener.listenUp(\"c.getWarehouse(`" + division.name + "`, `" + city + "`)\")'>Get Warehouse</A></TD></TR>") + "<TR>" +
					"<TD>Emp:</TD><TD ALIGN=RIGHT>" + c.getOffice(division.name, city).employees.length + (c.getOffice(division.name, city).employees.length < c.getOffice(division.name, city).size ? " / " + c.getOffice(division.name, city).size : "") + "</TD></TR>" +
					[["Operations", "Op"], ["Engineer", "Eng"], ["Business", "Bus"], ["Management", "Man"], ["Research & Development", "R&D"]].map(pos => "<TR><TD>" + pos[1] + ":</TD><TD ALIGN=RIGHT>" + c.getOffice(division.name, city).employeeJobs[pos[0]] + " (" + jFormat(c.getOffice(division.name, city).employeeProd[pos[0]], 0) + ")</TD></TR>").join("") +
					"</TABLE></TD>").join("") +
				"</TR></TD></TABLE>")
		}
	}
}
export let CITIES = ["Sector-12", "Aevum", "Chongqing", "Ishima", "New Tokyo", "Volhaven"];

export let FACTIONS = {
	"CyberSec": { "abbrev": "CS", "early": true, "backdoor": "CSEC" },
	"Tian Di Hui": { "abbrev": "TD", "early": true, "city": ["Chongqing", "New Tokyo", "Ishima"], "money": 1e6 },
	"NiteSec": { "abbrev": "NS", "early": true, "backdoor": "avmnite-02h", "hacking": 50 },
	"The Black Hand": { "abbrev": "BH", "early": true, "gang": true, "backdoor": "I.I.I.I" },
	"BitRunners": { "abbrev": "BR", "early": true, "backdoor": "run4theh111z" },
	"Netburners": { "abbrev": "NB", "early": true },
	"Slum Snakes": { "abbrev": "SS", "crime": true, "gang": true, "karma": -9, "combat": 30, "money": 1e6 },
	"Tetrads": { "abbrev": "Te", "crime": true, "gang": true, "karma": -18, "city": ["Chongqing", "New Tokyo", "Ishima"], "combat": 75 },
	"Speakers for the Dead": { "abbrev": "Sp", "crime": true, "gang": true, "hatesnsa": true, "combat": 300, "peoplekilled": 30, "karma": -45, "hacking": 100 },
	"Silhouette": { "abbrev": "Si", "crime": true, "gang": true, "money": 15e6, "ceo": true, "karma": -22 },
	"The Dark Army": { "abbrev": "DA", "hatesnsa": true, "combat": 300, "city": ["Chongqing"], "peoplekilled": 5, "karma": -45, "gang": true, "hacking": 300 },
	"The Syndicate": { "abbrev": "Sy", "crime": true, "gang": true, "city": ["Sector-12", "Aevum"], "karma": -90, "money": 10e6, "hatesnsa": true, "hacking": 200 },
	"Sector-12": { "abbrev": "12", "early": true, "citygroup": 1, "city": ["Sector-12"], "money": 15e6 },
	"Aevum": { "abbrev": "Ae", "early": true, "citygroup": 1, "city": ["Aevum"], "money": 40e6 },
	"Chongqing": { "abbrev": "CQ", "early": true, "citygroup": 2, "city": ["Chongqing"], "money": 20e6 },
	"New Tokyo": { "abbrev": "NT", "early": true, "citygroup": 2, "city": ["New Tokyo"], "money": 20e6 },
	"Ishima": { "abbrev": "Is", "early": true, "citygroup": 2, "city": ["Ishima"], "money": 30e6 },
	"Volhaven": { "abbrev": "Vo", "early": true, "citygroup": 3, "city": ["Volhaven"], "money": 50e6 },
	"ECorp": { "abbrev": "EC", "company": "ECorp" },
	"MegaCorp": { "abbrev": "MC", "company": "MegaCorp" },
	"KuaiGong International": { "abbrev": "KG", "company": "KuaiGong International" },
	"Four Sigma": { "abbrev": "4S", "company": "Four Sigma" },
	"NWO": { "abbrev": "NW", "company": "NWO" },
	"Blade Industries": { "abbrev": "Bl", "company": "Blade Industries" },
	"OmniTek Incorporated": { "abbrev": "OT", "company": "OmniTek Incorporated" },
	"Bachman & Associates": { "abbrev": "BA", "company": "Bachman & Associates" },
	"Clarke Incorporated": { "abbrev": "Cl", "company": "Clarke Incorporated" },
	"Fulcrum Secret Technologies": { "abbrev": "Fu", "company": "Fulcrum Technologies" },
	"The Covenant": { "abbrev": "Co", "augmentations": 20, "money": 75e9, "combat": 850, "hacking": 850 },
	"Daedalus": { "abbrev": "Da", "augmentations": 30, "money": 100e9, "combat": 1500, "or": true, "hacking": 2500 },
	"Illuminati": { "abbrev": "Il", "augmentations": 30, "combat": 1200, "money": 150e9, "hacking": 1500 },
	"Church of the Machine God": { "abbrev": "Ch", "bitnode": [13] },
	"Bladeburners": {
		"abbrev": "BB", "bitnode": [6, 7]
	},
	"Shadows of Anarchy": { "abbrev": "SoA" }
}

export let stockSymbolToCompany = {
	"ECP": "ECorp",
	"MGCP": "MegaCorp",
	"BLD": "Blade Industries",
	"CLRK": "Clarke Incorporated",
	"OMTK": "Omnitek Incorporated",
	"FSIG": "Four Sigma",
	"KGI": "KuaiGong International",
	"FLCM": "Fulcrum Technologies",
	"STM": "Storm Technologies",
	"DCOMM": "DefComm",
	"HLS": "Helios Labs",
	"VITA": "VitaLife",
	"ICRS": "Icarus Microsystems",
	"UNV": "Universal Energy",
	"AERO": "AeroCorp",
	"OMN": "Omnia Cybersystems",
	"SLRS": "Solaris Space Systems",
	"GPH": "Global Pharmaceuticals",
	"NVMD": "Nova Medical",
	"WDS": "Watchdog Security",
	"LXO": "LexoCorp",
	"RHOC": "Rho Construction",
	"APHE": "Alpha Enterprises",
	"SYSC": "SysCore Securities",
	"CTK": "CompuTek",
	"NTLK": "NetLink Technologies",
	"OMGA": "Omega Software",
	"FNS": "FoodNStuff",
	"SGC": "Sigma Cosmetics",
	"JGN": "Joe's Guns",
	"CTYS": "Catalyst Ventures",
	"MDYN": "Microdyne Technologies",
	"TITN": "Titan Laboratories"
};

export let LOCATIONS = {
	"AeroCorp": {
		"city": "Aevum"
	},
	"Bachman & Associates": {
		"city": "Aevum"
	},
	"Clarke Incorporated": {
		"city": "Aevum"
	},
	"Crush Fitness Gym": {
		"city": "Aevum"
	},
	"ECorp": {
		"city": "Aevum"
	},
	"Fulcrum Technologies": {
		"city": "Aevum"
	},
	"Galactic Cybersystems": {
		"city": "Aevum"
	},
	"NetLink Technologies": {
		"city": "Aevum"
	},
	"Aevum Police Headquarters": {
		"city": "Aevum"
	},
	"Rho Construction": {
		"city": "Aevum"
	},
	"Snap Fitness Gym": {
		"city": "Aevum"
	},
	"Summit University": {
		"city": "Aevum"
	},
	"Watchdog Security": {
		"city": "Aevum"
	},
	"Iker Molina Casino": {
		"city": "Aevum"
	},
	"KuaiGong International": {
		"city": "Chongqing"
	},
	"Solaris Space Systems": {
		"city": "Chongqing"
	},
	"Church of the Machine God": {
		"city": "Chongqing"
	},
	"Alpha Enterprises": {
		"city": "Sector-12"
	},
	"Blade Industries": {
		"city": "Sector-12"
	},
	"Central Intelligence Agency": {
		"city": "Sector-12"
	},
	"Carmichael Security": {
		"city": "Sector-12"
	},
	"Sector-12 City Hall": {
		"city": "Sector-12"
	},
	"DeltaOne": {
		"city": "Sector-12"
	},
	"FoodNStuff": {
		"city": "Sector-12"
	},
	"Four Sigma": {
		"city": "Sector-12"
	},
	"Icarus Microsystems": {
		"city": "Sector-12"
	},
	"Iron Gym": {
		"city": "Sector-12"
	},
	"Joe's Guns": {
		"city": "Sector-12"
	},
	"MegaCorp": {
		"city": "Sector-12"
	},
	"National Security Agency": {
		"city": "Sector-12"
	},
	"Powerhouse Gym": {
		"city": "Sector-12"
	},
	"Rothman University": {
		"city": "Sector-12"
	},
	"Universal Energy": {
		"city": "Sector-12"
	},
	"DefComm": {
		"city": "New Tokyo"
	},
	"Global Pharmaceuticals": {
		"city": "New Tokyo"
	},
	"Noodle Bar": {
		"city": "New Tokyo"
	},
	"VitaLife": {
		"city": "New Tokyo"
	},
	"Arcade": {
		"city": "New Tokyo"
	},
	"Nova Medical": {
		"city": "Ishima"
	},
	"Omega Software": {
		"city": "Ishima"
	},
	"Storm Technologies": {
		"city": "Ishima"
	},
	"Glitch": {
		"city": "Ishima"
	},
	"CompuTek": {
		"city": "Volhaven"
	},
	"Helios Labs": {
		"city": "Volhaven"
	},
	"LexoCorp": {
		"city": "Volhaven"
	},
	"Millenium Fitness Gym": {
		"city": "Volhaven"
	},
	"NWO": {
		"city": "Volhaven"
	},
	"OmniTek Incorporated": {
		"city": "Volhaven"
	},
	"Omnia Cybersystems": {
		"city": "Volhaven"
	},
	"SysCore Securities": {
		"city": "Volhaven"
	},
	"ZB Institute of Technology": {
		"city": "Volhaven"
	}
}

export class DebugStuff {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
		/*
		const objects = [];
		const payload_id = "payload" + String(Math.trunc(performance.now()));
		globalThis.webpackJsonp.push([payload_id, {
			[payload_id]: function (_e, _t, require) {
				for (const module of (Object.values(require.c))) {
					for (const object of Object.values(module?.exports ?? {})) {
						objects.push(object);
					}
				}
			}
		}, [[payload_id]]]);
		for (const obj of objects) {
			if (!this.player && typeof obj.whoAmI === "function" && obj.whoAmI() === "Player") {
				this.player = obj;
				break;
			}
		}
		*/
	}
/*	startCorp(corpName) {
		this.player.startCorporation(corpName);
	}
	async endlessAss() {
		while (true) {
			for (let op of await(this.game.Bladeburner.opNames)) {
				this.player.bladeburner.operations[op].count = this.player.bladeburner.operations[op].count < 10 ? 10 : this.player.bladeburner.operations[op].count;
			}
			for (let contract of await(this.game.Bladeburner.contractNames)) {
				this.player.bladeburner.contracts[contract].count = this.player.bladeburner.contracts[contract].count < 10 ? 10 : this.player.bladeburner.contracts[contract].count;
			}
		}
	}
*/
}

export class Division {
	#cities;
	#ns;
	constructor(ns, industry) {
		this.#ns = ns;
		let c = eval("this.#ns.corporation");
		this.industry = industry;
		if (c.getCorporation().divisions.filter(x => x.type == this.industry).length > 0) {
			this.#cities = {};
			for (let city of c.getDivision(this.name).cities) {
				this.#cities[city] = new Office(this.#ns, this.industry, city);
			}
		}
	}
	get name() {
		let c = eval("this.#ns.corporation")
		return c.getCorporation().divisions.filter(x => x.type == this.industry)[0].name;
	}
	get peeps() {
		let c = eval("this.#ns.corporation");
		let answer = [];
		for (let city of c.getCorporation().divisions.filter(x => x.type == this.industry)[0].cities) {
			answer = answer.concat(c.getOffice(this.name, city).employees.map(x => [city, x]));
		}
		return answer;
	}
	get cities() {
		let c = eval("this.#ns.corporation");
		let answer = {};
		for (let city of c.getDivision(this.name).cities) {
			if (!Object.keys(this.#cities).includes(city)) {
				this.#cities[city] = new Office(this.#ns, this.industry, city);
			}
			answer[city] = this.#cities[city];
		}
		return answer;
	}
	getCCity(city) {
		let c = eval("this.#ns.corporation");
		if (!c.getDivision(this.name).cities.includes(city)) {
			return null;
		}
		if (!Object.keys(this.#cities).includes(city)) {
			this.#cities[city] = new Office(this.industry, city);
		}
		return this.#cities[city];
	}
	get ["Sector-12"]() {
		return this.getCCity("Sector-12");
	}
	get Aevum() {
		return this.getCCity("Aevum");
	}
	get Chongqing() {
		return this.getCCity("Chongqing");
	}
	get Ishima() {
		return this.getCCity("Ishima");
	}
	get ["New Tokyo"]() {
		return this.getCCity("New Tokyo");
	}
	get Volhaven() {
		return this.getCCity("Volhaven");
	}
}
// Hash function by @Insight from the Bitburner Discord
export function hashCode(s) {
	return s.split("").reduce(
		function (a, b) {
			a = ((a << 5) - a) + b.charCodeAt(0);
			return a & a;
		}, 0
	);
}

// Write the content to the file if it's different than what is already there
export function writeIfNotSame(ns, filename, content) {
	if (ns.read(filename) != content) {
		ns.write(filename, content, 'w');
	}
}

// Generates a very-very-likely to be unique ID.
function uniqueID(s, random = false) {
	let answer = "";
	let remainder = "";
	if (random) {
		remainder = Math.floor(1e30 * Math.random());
	} else {
		remainder = hashCode(s);
	}
	if (remainder < 0) {
		remainder = -remainder;
	}
	while (remainder > 0) {
		answer = answer + "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"[remainder % 64];
		remainder = Math.floor(remainder / 64);
	}
	return answer;
}

// Writes a command to a file, runs it, and then returns the result
export async function Do(ns, command, ...args) {
	if (["ns.bladeburner.stopBladeburnerAction", "ns.bladeburner.setActionLevel", "ns.bladeburner.setActionAutolevel", "ns.singularity.hospitalize"].includes(command)) {
		return await DoVoid(ns, command, ...args);
	}
	writeIfNotSame(ns, '/temp/rm.js', `export async function main(ns) {ns.rm(ns.args[0], 'home');}`);
	let progname = "/temp/proc-" + uniqueID(command);
	let procid = progname + uniqueID(JSON.stringify(...args), true) + ".txt";
	writeIfNotSame(ns, progname + ".js", `export async function main(ns) { ns.write(ns.args.shift(), JSON.stringify(` + command + `(...JSON.parse(ns.args[0]))), 'w'); }`);
	while (0 == ns.run(progname + ".js", 1, procid, JSON.stringify(args))) {
		await ns.asleep(0);
	}
	let answer = ns.read(procid);
	let good = false;
	while (!good) {
		await ns.asleep(0);
		try {
			answer = JSON.parse(ns.read(procid));
			good = true;
		} catch { }
	}
	while (0 == ns.run('/temp/rm.js', 1, procid)) { await ns.asleep(0) };
	return answer;
}

export async function DoVoid(ns, command, ...args) {
	writeIfNotSame(ns, '/temp/rm.js', `export async function main(ns) {ns.rm(ns.args[0], 'home');}`);
	let progname = "/temp/proc-V" + uniqueID(command);
	writeIfNotSame(ns, progname + ".js", `export async function main(ns) { ` + command + `(...JSON.parse(ns.args[0])); }`);
	let pid = ns.run(progname + ".js", 1, JSON.stringify(args));
	while (0 == pid) {
		pid = ns.run(progname + ".js", 1, JSON.stringify(args));
		await ns.asleep(0);
	}
	while (await Do(ns, "ns.isRunning", pid))
		await ns.asleep(0);
	return null;
}

// Writes a command to a file, runs against every argument, and then returns the result as an object
export async function DoAll(ns, command, args) {
	writeIfNotSame(ns, '/temp/rm.js', `export async function main(ns) {ns.rm(ns.args[0], 'home');}`);
	let progname = "/temp/procA-" + uniqueID(command);
	let procid = progname + uniqueID(JSON.stringify(args), true) + ".txt";
	writeIfNotSame(ns, progname + ".js", `export async function main(ns) { let parsed = JSON.parse(ns.args[1]); let answer = {}; for (let i = 0; i < parsed.length ; i++) {answer[parsed[i]] = await ` + command + `(parsed[i]);}; ns.write(ns.args.shift(), JSON.stringify(answer), 'w'); }`);
	while (0 == ns.run(progname + ".js", 1, procid, JSON.stringify(args))) {
		await ns.asleep(0);
	}
	let answer = ns.read(procid);
	let good = false;
	while (!good) {
		await ns.asleep(0);
		try {
			answer = JSON.parse(ns.read(procid));
			good = true;
		} catch { }
	}
	while (0 == ns.run('/temp/rm.js', 1, procid)) { await ns.asleep(0) };
	return answer;
}

// Writes a command to a file, runs against every argument, and then returns the result as an object
export async function DoAllComplex(ns, command, args) {
	writeIfNotSame(ns, '/temp/rm.js', `export async function main(ns) {ns.rm(ns.args[0], 'home');}`);
	let progname = "/temp/procC-" + uniqueID(command);
	let procid = progname + uniqueID(JSON.stringify(args), true) + ".txt";
	writeIfNotSame(ns, progname + ".js", `export async function main(ns) { let parsed = JSON.parse(ns.args[1]); let answer = {}; for (let i = 0; i < parsed.length ; i++) {answer[parsed[i]] = await ` + command + `(...parsed[i]);}; ns.write(ns.args.shift(), JSON.stringify(answer), 'w'); }`);
	while (0 == ns.run(progname + ".js", 1, procid, JSON.stringify(args))) {
		await ns.asleep(0);
	}
	let answer = ns.read(procid);
	let good = false;
	while (!good) {
		await ns.asleep(0);
		try {
			answer = JSON.parse(ns.read(procid));
			good = true;
		} catch { }
	}
	while (0 == ns.run('/temp/rm.js', 1, procid)) { await ns.asleep(0) };
	return answer;
}
class Employee {
	constructor(ns, division, city, name) {
		this.ns = ns;
		this.division = division;
		this.city = city;
		this.name = name;
	}
	get int() {
		let c = eval("this.ns.corporation");
		return c.getEmployee(this.division, this.city, this.name).int * (1 + .1 * c.getUpgradeLevel("Neural Accelerators")) * (c.hasResearched(this.division, "Overclock") ? 1.25 : 1) * (c.hasResearched(this.division, "CPH4 Injections") ? 1.1 : 1);
	}
	get eff() {
		let c = eval("this.ns.corporation");
		return c.getEmployee(this.division, this.city, this.name).eff * (1 + .1 * c.getUpgradeLevel("FocusWires")) * (c.hasResearched(this.division, "Overclock") ? 1.25 : 1) * (c.hasResearched(this.division, "CPH4 Injections") ? 1.1 : 1);
	}
	get cre() {
		let c = eval("this.ns.corporation");
		return c.getEmployee(this.division, this.city, this.name).cre * (1 + .1 * c.getUpgradeLevel("Nuoptimal Nootropic Injector Implants")) * (c.hasResearched(this.division, "CPH4 Injections") ? 1.1 : 1);
	}
	get cha() {
		let c = eval("this.ns.corporation");
		return c.getEmployee(this.division, this.city, this.name).cha * (1 + .1 * c.getUpgradeLevel("Speech Processor Implants")) * (c.hasResearched(this.division, "CPH4 Injections") ? 1.1 : 1);
	}
	get exp() {
		let c = eval("this.ns.corporation");
		return c.getEmployee(this.division, this.city, this.name).exp;
	}
	get operations() {
		return this.int * .6 + this.cha * .1 + this.exp + this.cre * .5 + this.eff;
	}
	get engineer() {
		return this.int + this.cha * .1 + this.exp * 1.5 + this.eff;
	}
	get business() {
		return this.int * .4 + this.cha + this.exp * .5;
	}
	get management() {
		return this.cha * 2 + this.exp + this.cre * .2 + this.eff * .7;
	}
	get researchanddevelopment() {
		return this.int * 1.5 + this.exp * .8 + this.cre + this.eff * .5;
	}
	get training() {
		return 0;
	}
	get unassigned() {
		return 0;
	}
	get jobs() {
		return {
			"Operations": this.operations,
			"Business": this.business,
			"Engineer": this.engineer,
			"Management": this.management,
			"Research & Development": this.researchanddevelopment,
			"Unassigned": this.unassigned,
			"Training": this.training
		}
	}
}
let GANG = "Slum Snakes";
let WANTED_THRESHOLD = 10; // If your wanted level is higher than this and your penalty is greater than (1-WANTED_PENALTY_THRESHOLD)....
let WANTED_PENALTY_THRESHOLD = .9; // ... then do vigilante stuff.
let TRAFFICK_CHANCE = .8; // Odds of arms trafficking vs terrorism when there is no Formulas.exe
let REP_CHECK = 1.1; // Don't ascend anyone with over 1.1x the average rep of the group.
let MINIMUM_RESPECT = 0; // Don't start ascension until the average respect is at least this.
let CLASH_TARGET = .5; // Don't go to war until you have this much of a chance against all remaining gangs.
let ASC = 1.06;

/** @param {NS} ns **/

export class Gang {
    constructor(ns, game) {
        this.ns = ns;
        this.game = game ? game : new WholeGame(ns);
        this.log = ns.tprint.bind(ns);
        if (ns.flags(cmdlineflags)['logbox']) {
            this.log = this.game.sidebar.querySelector(".gangbox") || this.game.createSidebarItem("Gang", "", "G", "gangbox");
            this.log = this.log.log;
        }
    }
    async loop() {
        let MINIMUM_DEFENSE = 0;
        if (!ns.gang.inGang()) {
            ns.gang.createGang(GANG); // Slum Snakes rule!
        }
        if (ns.gang.inGang()) {
            let starttime = Date.now();
            while (true) {
                // Recruit as many Steves as possible.
                while (ns.gang.recruitMember("Steve-" + Math.floor(Math.random() * 100).toString()))
                    globalThis.gangBox.log("New member recruited."); // There may be some Steve collision. Oh well.
                let members = ns.gang.getMemberNames();

                // Set the Steves to their tasks.
                members.map(x => ns.gang.setMemberTask(x, (ns.gang.getGangInformation().wantedLevel >= WANTED_THRESHOLD && ns.gang.getGangInformation().wantedPenalty <= WANTED_PENALTY_THRESHOLD) ? "Vigilante Justice" : (ns.gang.getMemberInformation(x).def < MINIMUM_DEFENSE ? "Train Combat" : (Math.random() <= TRAFFICK_CHANCE ? "Traffick Illegal Arms" : "Terrorism"))));
                members.sort((a, b) => { return ns.gang.getMemberInformation(a).earnedRespect - ns.gang.getMemberInformation(b).earnedRespect; })
                members.map(x => ns.gang.setMemberTask(x, "Traffick Illegal Arms"));
                ns.gang.setMemberTask(members[0], "Terrorism");
                if (members.length > 6) {
                    ns.gang.setMemberTask(members[1], "Terrorism");
                }
                if (ns.gang.getGangInformation().wantedLevel >= WANTED_THRESHOLD && ns.gang.getGangInformation().wantedPenalty <= WANTED_PENALTY_THRESHOLD) {
                    members.map(x => ns.gang.setMemberTask(x, "Vigilante Justice"));
                } else {
                    if (ns.fileExists('Formulas.exe')) {
                        let tasks = ["Mug People", "Deal Drugs", "Strongarm Civilians", "Run a Con", "Armed Robbery", "Traffick Illegal Arms", "Threaten & Blackmail", "Human Trafficking", "Terrorism", "Vigilante Justice", "Train Combat", "Train Hacking", "Train Charisma", "Territory Warfare"];
                        MINIMUM_DEFENSE = 500 * members.length;
                        let remaining = members.filter(x => ns.gang.getMemberInformation(x).def_exp >= MINIMUM_DEFENSE && ns.gang.getMemberInformation(x).str_exp >= MINIMUM_DEFENSE && ns.gang.getMemberInformation(x).dex_exp >= MINIMUM_DEFENSE && ns.gang.getMemberInformation(x).agi_exp >= MINIMUM_DEFENSE && ns.gang.getMemberInformation(x).hack_exp >= MINIMUM_DEFENSE && ns.gang.getMemberInformation(x).cha_exp >= MINIMUM_DEFENSE);
                        members.filter(x => !remaining.includes(x)).filter(x => ns.gang.getMemberInformation(x).cha_exp < MINIMUM_DEFENSE).map(x => ns.gang.setMemberTask(x, "Train Charisma"));
                        members.filter(x => !remaining.includes(x)).filter(x => ns.gang.getMemberInformation(x).hack_exp < MINIMUM_DEFENSE).map(x => ns.gang.setMemberTask(x, "Train Hacking"));
                        members.filter(x => !remaining.includes(x)).filter(x => ns.gang.getMemberInformation(x).dex_exp < MINIMUM_DEFENSE).map(x => ns.gang.setMemberTask(x, "Train Combat"));
                        members.filter(x => !remaining.includes(x)).filter(x => ns.gang.getMemberInformation(x).str_exp < MINIMUM_DEFENSE).map(x => ns.gang.setMemberTask(x, "Train Combat"));
                        members.filter(x => !remaining.includes(x)).filter(x => ns.gang.getMemberInformation(x).agi_exp < MINIMUM_DEFENSE).map(x => ns.gang.setMemberTask(x, "Train Combat"));
                        members.filter(x => !remaining.includes(x)).filter(x => ns.gang.getMemberInformation(x).def_exp < MINIMUM_DEFENSE).map(x => ns.gang.setMemberTask(x, "Train Combat"));
                        for (let i = 0; i < members.length; i++) {
                            let total = ns.gang.getMemberInformation(members[i]).str + ns.gang.getMemberInformation(members[i]).def + ns.gang.getMemberInformation(members[i]).dex + ns.gang.getMemberInformation(members[i]).cha + ns.gang.getMemberInformation(members[i]).hack;
                            if (total > 700) {
                                remaining.push(members[i]);
                            }
                        }
                        let moneylist = [];
                        for (let i = 0; i < tasks.length; i++) {
                            for (let j = 0; j < remaining.length; j++) {
                                moneylist.push([tasks[i], remaining[j], ns.formulas.gang.moneyGain(ns.gang.getGangInformation(GANG), ns.gang.getMemberInformation(remaining[j]), ns.gang.getTaskStats(tasks[i]))])
                                //							moneylist.push([tasks[i].replace("Traffick Illegal Arms", "Train Charisma"), remaining[j], ns.formulas.gang.moneyGain(ns.gang.getGangInformation(GANG), ns.gang.getMemberInformation(remaining[j]), ns.gang.getTaskStats(tasks[i]))])
                            }
                        }
                        moneylist = moneylist.sort((a, b) => { return a[2] - b[2] }).filter(x => x[2] > 0);
                        let replist = [];
                        for (let i = 0; i < tasks.length; i++) {
                            for (let j = 0; j < remaining.length; j++) {
                                replist.push([tasks[i], remaining[j], ns.formulas.gang.respectGain(ns.gang.getGangInformation(GANG), ns.gang.getMemberInformation(remaining[j]), ns.gang.getTaskStats(tasks[i]))])
                            }
                        }
                        replist = replist.sort((a, b) => { return a[2] - b[2] }).filter(x => x[2] > 0);
                        for (let i = 0; i < members.length; i++) {
                            let total = ns.gang.getMemberInformation(members[i]).str + ns.gang.getMemberInformation(members[i]).def + ns.gang.getMemberInformation(members[i]).dex + ns.gang.getMemberInformation(members[i]).cha + ns.gang.getMemberInformation(members[i]).hack;
                            if (total >= 630 && total <= 700) {
                                replist = replist.filter(x => x[0] != "Terrorism" || x[1] != members[i]);
                                moneylist = moneylist.filter(x => x[0] != "Terrorism" || x[1] != members[i]);
                            }
                        }
                        while (moneylist.length > 0 || replist.length > 0) {
                            if (ns.gang.getGangInformation().territory >= .98 && [...new Set(moneylist.map(x => x[1]))].length == 1) {
                                ns.gang.setMemberTask(moneylist[0][1], "Train Combat");
                                moneylist = [];
                                replist = [];
                            }
                            if (moneylist.length > 0 && members.length == 12) {
                                ns.gang.setMemberTask(moneylist[moneylist.length - 1][1], moneylist[moneylist.length - 1][0]);
                                remaining = remaining.filter(x => x != moneylist[moneylist.length - 1][1]);
                                replist = replist.filter(x => x[1] != moneylist[moneylist.length - 1][1]);
                                moneylist = moneylist.filter(x => x[1] != moneylist[moneylist.length - 1][1]);
                            }
                            if (ns.gang.getGangInformation().territory >= .98 && [...new Set(moneylist.map(x => x[1]))].length == 1) {
                                ns.gang.setMemberTask(moneylist[0][1], "Train Combat");
                                moneylist = [];
                                replist = [];
                            }
                            //if (ns.gang.getGangInformation().territory < .98) {
                            if (replist.length > 0) {
                                ns.gang.setMemberTask(replist[replist.length - 1][1], replist[replist.length - 1][0]);
                                remaining = remaining.filter(x => x != replist[replist.length - 1][1]);
                                moneylist = moneylist.filter(x => x[1] != replist[replist.length - 1][1]);
                                replist = replist.filter(x => x[1] != replist[replist.length - 1][1]);
                            }
                            //}
                            if (ns.gang.getGangInformation().territory >= .98 && [...new Set(moneylist.map(x => x[1]))].length == 1) {
                                ns.gang.setMemberTask(moneylist[0][1], "Train Combat");
                                moneylist = [];
                                replist = [];
                            }
                            if (moneylist.length > 0 && members.length == 12) {
                                ns.gang.setMemberTask(moneylist[moneylist.length - 1][1], moneylist[moneylist.length - 1][0]);
                                remaining = remaining.filter(x => x != moneylist[moneylist.length - 1][1]);
                                replist = replist.filter(x => x[1] != moneylist[moneylist.length - 1][1]);
                                moneylist = moneylist.filter(x => x[1] != moneylist[moneylist.length - 1][1]);
                            }
                            if (ns.gang.getGangInformation().territory >= .98 && [...new Set(moneylist.map(x => x[1]))].length == 1) {
                                ns.gang.setMemberTask(moneylist[0][1], "Train Combat");
                                moneylist = [];
                                replist = [];
                            }
                        }
                        if (remaining.length > 0) {
                            remaining.map(x => ns.gang.setMemberTask(x, "Train Combat"));
                        }
                    }
                }
                //			members.filter(x => ns.gang.getMemberInformation(x).cha < ns.gang.getMemberInformation(x).str).map(x => ns.gang.setMemberTask(x, "Train Charisma"));
                //			members.filter(x => ns.gang.getMemberInformation(x).cha < ns.gang.getMemberInformation(x).def).map(x => ns.gang.setMemberTask(x, "Train Charisma"));
                //			members.filter(x => ns.gang.getMemberInformation(x).cha < ns.gang.getMemberInformation(x).dex).map(x => ns.gang.setMemberTask(x, "Train Charisma"));
                //			members.filter(x => ns.gang.getMemberInformation(x).cha < ns.gang.getMemberInformation(x).agi).map(x => ns.gang.setMemberTask(x, "Train Charisma"));
                //			members.filter(x => ns.gang.getMemberInformation(x).cha < ns.gang.getMemberInformation(x).hack).map(x => ns.gang.setMemberTask(x, "Train Charisma"));
                // Determine if anyone is worthy of ascension
                let avgrespect = members.map(x => ns.gang.getMemberInformation(x).earnedRespect).reduce((a, b) => a + b, 0) / members.length;
                let ascendable = ns.gang.getMemberNames().map(x => [x, ns.gang.getMemberInformation(x).agi_asc_mult]).map(x => [x[0], x[1], 3.7788304033108564 - 5.6740370173619095 * Math.log(x[1]) + 4.8545907700292741 * Math.log(x[1]) ** 2 - 1.9265566442319764 * Math.log(x[1]) ** 3 + .28974300868423875 * Math.log(x[1]) ** 4]).map(x => [x[0], x[1], x[2], ns.gang.getAscensionResult(x[0]) == null ? 1 : ns.gang.getAscensionResult(x[0])['agi']]).filter(x => x[2] < x[3] || x[3] >= 1.6).map(x => x[0]).filter(x => ns.gang.getMemberInformation(x).respectGain < avgrespect);

                //let ascendable = ns.gang.getMemberNames().map(x => [x, ns.gang.getMemberInformation(x).str_asc_mult]).map(x => [x[0], x[1], 3.7788304033108564 - 5.6740370173619095 * Math.log(x[1]) + 4.8545907700292741 * Math.log(x[1]) ** 2 - 1.9265566442319764 * Math.log(x[1]) ** 3 + .28974300868423875 * Math.log(x[1]) ** 4]).filter(x => x[1] > x[2]).map(x => x[0]);
                //let ascendable = members.filter(x => ns.gang.getAscensionResult(x) != null).sort((a, b) => { return (ns.gang.getAscensionResult(a).str + ns.gang.getAscensionResult(a).dex + ns.gang.getAscensionResult(a).def + ns.gang.getAscensionResult(a).agi + ns.gang.getAscensionResult(a).cha + ns.gang.getAscensionResult(a).hack) - (ns.gang.getAscensionResult(b).str + ns.gang.getAscensionResult(b).dex + ns.gang.getAscensionResult(b).def + ns.gang.getAscensionResult(b).cha + ns.gang.getAscensionResult(b).agi + ns.gang.getAscensionResult(b).hack) }).filter(x => ns.gang.getMemberInformation(x).earnedRespect <= REP_CHECK * avgrespect).filter(x => ns.gang.getAscensionResult(x).dex >= ASC && ns.gang.getAscensionResult(x).str >= ASC && ns.gang.getAscensionResult(x).def >= ASC && ns.gang.getAscensionResult(x).agi >= ASC && ns.gang.getAscensionResult(x).cha >= ASC && ns.gang.getAscensionResult(x).hack >= ASC);
                if (avgrespect >= MINIMUM_RESPECT && ascendable.length > 0) {
                    for (let k = 0; k < ascendable.length; k++) {
                        if (ns.gang.ascendMember(ascendable[k])) {
                            //						ns.toast(ascendable[k] + " ascended!", "success", 10000);
                            globalThis.gangBox.log(ascendable[k] + " ascended!");
                            k = 1000;
                        }
                    }
                }

                // Buy equipment, but only if SQLInject.exe exists or the gang has under 12 people
                members.sort((a, b) => { return ns.gang.getMemberInformation(a).str_mult - ns.gang.getMemberInformation(b).str_mult; });
                let funds = ns.getPlayer().money / (members.length < 12 ? 1 : 1) / Math.min(1, (ns.getTimeSinceLastAug() / 3600000) ** 2);
                if (ns.fileExists("SQLInject.exe") || members.length < 12) {
                    let equip = ns.gang.getEquipmentNames().sort((a, b) => { return ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b) });;
                    for (let j = 0; j < equip.length; j++) {
                        for (let i = 0; i < members.length; i++) {
                            let total = ns.gang.getMemberInformation(members[i]).str + ns.gang.getMemberInformation(members[i]).def + ns.gang.getMemberInformation(members[i]).dex + ns.gang.getMemberInformation(members[i]).cha + ns.gang.getMemberInformation(members[i]).hack;
                            // Buy the good stuff only once the terrorism stats are over 700.
                            if (total >= 700) {
                                if (ns.gang.getEquipmentCost(equip[j]) < funds) {
                                    if (ns.gang.purchaseEquipment(members[i], equip[j])) {
                                        globalThis.gangBox.log(members[i] + " now owns " + equip[j]);
                                        //									if (ns.getPlayer().bitNodeN == 8 && ns.getPlayer().money < 130000000) {
                                        //										ns.run('/jeekOS.js', 1, '--ripcord');
                                        //										await ns.sleep(10);
                                        //										ns.installAugmentations('/jeek/start.js');
                                        //									ns.softReset('/jeek/start.js');
                                        //}
                                        funds -= ns.gang.getEquipmentCost(equip[j]);
                                        i = -1;
                                        members.sort((a, b) => { return ns.gang.getMemberInformation(a).str_mult - ns.gang.getMemberInformation(b).str_mult; });
                                    }
                                }
                            } else {
                                if (ns.gang.purchaseEquipment(members[i], "Glock 18C")) {
                                    globalThis.gangBox.log(members[i] + " now owns Glock 18C")
                                    //								if (ns.getPlayer().bitNodeN == 8 && ns.getPlayer().money < 130000000) {
                                    //									ns.run('/jeekOS.js', 1, '--ripcord');
                                    //									await ns.sleep(10);
                                    //									ns.installAugmentations('/jeek/start.js');
                                    //									ns.softReset('/jeek/start.js');
                                    //								}
                                }
                            }
                        }
                    }
                }

                // Chill until clash time
                while (Date.now() <= starttime) {
                    await ns.sleep(0);
                }

                // Clash time
                members.map(x => ns.gang.setMemberTask(x, "Territory Warfare"));
                // No hitting yourself, and gangs with no territory don't matter
                let othergangs = Object.keys(ns.gang.getOtherGangInformation()).filter(x => x != GANG && ns.gang.getOtherGangInformation()[x].territory > 0);
                if (othergangs.length > 0) {
                    // Sporadic progress update.
                    //				othergangs.map(x => ns.toast(x + " " + ns.gang.getChanceToWinClash(x).toString(), "success", 10000));
                    let total = othergangs.map(x => ns.gang.getChanceToWinClash(x) * ns.gang.getOtherGangInformation()[x].territory).reduce((a, b) => a + b, 0);
                    if (total / (1 - ns.gang.getGangInformation().territory) >= .5)
                        ns.gang.setTerritoryWarfare(true);
                    // If there's a high enough chance of victory against every gang, go to war.
                    //				ns.toast(total / (1 - ns.gang.getGangInformation().territory));
                    if (othergangs.every(x => ns.gang.getChanceToWinClash(x) >= CLASH_TARGET))
                        ns.gang.setTerritoryWarfare(true);
                    let oldterritory = Math.floor(100 * ns.gang.getGangInformation().territory);
                    let startpower = ns.gang.getGangInformation().power;
                    // Chill until the clash tick processes.
                    while (ns.gang.getGangInformation().power == startpower) {
                        await ns.sleep(0);
                    }
                    if (oldterritory != Math.floor(100 * ns.gang.getGangInformation().territory)) {
                        globalThis.gangBox.log("Territory now " + Math.floor(100 * ns.gang.getGangInformation().territory).toString());
                    }
                }

                // Set the goal time for the next clash at 19 seconds from now.
                starttime = Date.now() + 19000;
                ns.gang.setTerritoryWarfare(false);
            }
        }
        globalThis.gangBox.log(ns.heart.break());
        ns.spawn("gangs.js");
    }
}import { Do, DoAll, DoAllComplex } from "Do.js";

export class Grafting {
    constructor(ns, game) {
        this.ns = ns;
        this.game = game ? game : new WholeGame(ns);
        this.log = ns.tprint.bind(ns);
        if (ns.flags(cmdlineflags)['logbox']) {
            this.log = this.game.sidebar.querySelector(".graftbox") || this.game.createSidebarItem("Grafting", "", "G", "graftbox");
            this.log = this.log.log;
        }
    }
    async checkIn(type = "Hacking", force=false) {
        let Game = await(this.game);
        if ((!await Do(this.ns, "ns.singularity.isBusy", "")) && (!await Do(this.ns, "ns.singularity.isFocused", ""))) {
            let auglist = await Do(this.ns, "ns.grafting.getGraftableAugmentations", "");
            let augs = await DoAll(this.ns, "ns.singularity.getAugmentationStats", auglist);
            for (let aug of auglist) {
                augs[aug].price = await Do(this.ns, "ns.grafting.getAugmentationGraftPrice", aug);
                augs[aug].time = await Do(this.ns, "ns.grafting.getAugmentationGraftTime", aug);
            }
            let currentmoney = await Do(this.ns, "ns.getServerMoneyAvailable", "home");
            auglist = auglist.filter(x => augs[x].price <= currentmoney / 2);
            switch(type) {
                case "Combat":
                    auglist = auglist.sort((a, b) => augs[b].agility_exp * augs[b].agility * augs[b].defense_exp * augs[b].defense * augs[b].dexterity_exp * augs[b].dexterity * augs[b].strength_exp * augs[b].strength - augs[a].agility_exp * augs[a].agility * augs[a].defense_exp * augs[a].defense * augs[a].dexterity_exp * augs[a].dexterity * augs[a].strength_exp * augs[a].strength);
                    break;
                case "Charisma":
                    auglist = auglist.sort((a, b) => augs[b].charisma_exp * augs[b].charisma - augs[a].charisma_exp * augs[a].charisma);
                    break;
                case "Hacking":
                    auglist = auglist.sort((a, b) => augs[b].hacking_grow * augs[b].hacking_speed * (augs[b].hacking ** 2) * (augs[b].hacking_exp ** 2) * (augs[b].faction_rep ** .1) - augs[a].hacking_grow * (augs[a].hacking ** 2) * (augs[a].hacking_exp ** 2) * augs[a].hacking_speed * (augs[a].faction_rep ** .1));
                    break;
            }
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
            for (let special of ["Neuroreceptor Management Implant", "nickofolas Congruity Implant"]) {
                if ((await Do(this.ns, "ns.grafting.getGraftableAugmentations", "")).includes(special)) {
                    if ((await Do(this.ns, "ns.grafting.getAugmentationGraftPrice", special)) < (await Do(this.ns, "ns.getServerMoneyAvailable", "home"))) {
                        auglist.unshift(special);
                    }
                }
            }
            let playerhack = await (Game.Player.hacking);
            let ownedAugs = await Do(this.ns, "ns.singularity.getOwnedAugmentations");
            if (playerhack > 3000 && ownedAugs.length < 30) {
                auglist = auglist.sort((a, b) => augs[a].time - augs[b].time);
            }
            if (auglist.length > 0) {
                if (!(((await Do(this.ns, "ns.getPlayer", "")).city) == "New Tokyo"))
                    await Do(this.ns, "ns.singularity.travelToCity", "New Tokyo");
                if (playerhack < 4000 || ownedAugs.length < 30 || force)
                    if (await Do(this.ns, "ns.grafting.graftAugmentation", auglist[0], false))
                        this.log(auglist[0]);
            }
        }
    }
}

export class Hacknet {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
		this.log = ns.tprint.bind(ns);
		if (ns.flags(cmdlineflags)['logbox']) {
			this.log = this.game.sidebar.querySelector(".hacknetbox") || this.game.createSidebarItem("Hacknet", "", "H", "hacknetbox");
			this.log = this.log.log;
		}
	}
	async loop(goal = "Sell for Money") {
//		while ((4 <= (await Do(this.ns, 'ns.hacknet.numHashes', ''))) && ((await (this.game.Player.money)) < 1000000 * Math.floor((await Do(this.ns, 'ns.hacknet.numHashes', '')) / 4))) {
//			await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money");
//		}
		if (goal == "Sell for Money") {
			await Do(this.ns, "ns.hacknet.spendHashes", goal, "", Math.floor((await Do(this.ns, 'ns.hacknet.numHashes', '')) / 4));
			this.log("Spent hashes for cash")
		} else {
			while (await Do(this.ns, "ns.hacknet.spendHashes", goal))
			this.log("Spent hashes on " + goal);
		}
		let didSomething = true;
		let mults = (await Do(this.ns, "ns.getPlayer", "")).mults.hacknet_node_money;
		while (didSomething) {
			didSomething = false;
			let shoppingCart = [[(await Do(this.ns, "ns.hacknet.getPurchaseNodeCost")) / (this.ns.formulas.hacknetServers.hashGainRate(1, 0, 1, 1, mults)), await Do(this.ns, "ns.hacknet.getPurchaseNodeCost"), "ns.hacknet.purchaseNode"]]
			for (let i = 0; i < await Do(this.ns, "ns.hacknet.numNodes"); i++) {
				let current = await Do(this.ns, "ns.hacknet.getNodeStats", i);
				shoppingCart.push([this.ns.formulas.hacknetServers.ramUpgradeCost(current.ram, 1, mults.hacknet_node_ram_cost) / ((this.ns.formulas.hacknetServers.hashGainRate(current.level, 0, current.ram * 2, current.cores, mults) - (this.ns.formulas.hacknetServers.hashGainRate(current.level, 0, current.ram, current.cores, mults)))), this.ns.formulas.hacknetServers.ramUpgradeCost(current.ram, 1, mults.hacknet_node_ram_cost), "ns.hacknet.upgradeRam", i]);
				shoppingCart.push([this.ns.formulas.hacknetServers.coreUpgradeCost(current.cores, 1, mults.hacknet_node_core_cost) / ((this.ns.formulas.hacknetServers.hashGainRate(current.level, 0, current.ram, current.cores + 1, mults) - (this.ns.formulas.hacknetServers.hashGainRate(current.level, 0, current.ram, current.cores, mults)))), this.ns.formulas.hacknetServers.coreUpgradeCost(current.cores, 1, mults.hacknet_node_core_cost), "ns.hacknet.upgradeCore", i]);
				shoppingCart.push([this.ns.formulas.hacknetServers.levelUpgradeCost(current.level, 1, mults.hacknet_node_core_cost) / ((this.ns.formulas.hacknetServers.hashGainRate(current.level + 1, 0, current.ram, current.cores, mults) - (this.ns.formulas.hacknetServers.hashGainRate(current.level, 0, current.ram, current.cores, mults)))), this.ns.formulas.hacknetServers.levelUpgradeCost(current.level, 1, mults.hacknet_node_core_cost), "ns.hacknet.upgradeLevel", i]);
			}
			let currentMoney = await Do(this.ns, "ns.getServerMoneyAvailable", "home");
			shoppingCart = shoppingCart.filter(x => x[1] <= currentMoney);
			shoppingCart = shoppingCart.filter(x => x[1] != null);
			shoppingCart = shoppingCart.sort((a, b) => { return a[0] - b[0]; });
			if (shoppingCart.length > 0) {
				this.log(shoppingCart[0].slice(2).join(" "));
				await Do(this.ns, ...(shoppingCart[0].slice(2)));
				didSomething = true;
			}
		}
		let done = false;
		while ((await Do(this.ns, "ns.hacknet.numHashes")) * 2 > (await Do(this.ns, "ns.hacknet.hashCapacity")) && !done) {
			done = true;
			let minimum = 1e308;
			let answer = -1;
			for (let i = 0; i < await Do(this.ns, "ns.hacknet.numNodes"); i++) {
				if (this.ns.formulas.hacknetServers.cacheUpgradeCost((await Do(this.ns, "ns.hacknet.getNodeStats", i)).cache, 1, mults.hacknet_node_cache_cost) < minimum) {
					answer = i;
					minimum = this.ns.formulas.hacknetServers.cacheUpgradeCost((await Do(this.ns, "ns.hacknet.getNodeStats", i)).cache, 1, mults.hacknet_node_cache_cost);
				}
			}
			if (answer >= 0 && await Do(this.ns, "ns.hacknet.upgradeCache", answer)) {
				done = false;
			}
		}
		if ((await Do(this.ns, "ns.hacknet.numHashes")) * 2 > (await Do(this.ns, "ns.hacknet.hashCapacity")) && !done) {
			if (Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money"))
			this.log("Sold four hashes for cash.");
		}
		if (goal == "Sell for Money") {
			await Do(this.ns, "ns.hacknet.spendHashes", goal, "", Math.floor((await Do(this.ns, 'ns.hacknet.numHashes', '')) / 4));
		} else {
			while (await Do(this.ns, "ns.hacknet.spendHashes", goal));
		}
	}
}

function helperScripts(ns) {
	writeIfNotSame(ns, "/temp/hack.js", `export async function main(ns) {await ns.hack(ns.args[0]);}`);
	writeIfNotSame(ns, "/temp/hackstock.js", `export async function main(ns) {await ns.hack(ns.args[0], {"stock": true});}`);
	writeIfNotSame(ns, "/temp/grow.js", `export async function main(ns) {await ns.grow(ns.args[0]);}`);
	writeIfNotSame(ns, "/temp/growstock.js", `export async function main(ns) {await ns.grow(ns.args[0], {"stock": true});}`);
	writeIfNotSame(ns, "/temp/weaken.js", `export async function main(ns) {await ns.weaken(ns.args[0]);}`);
}

export const levenshteinDistance = (str1 = '', str2 = '') => {
	const track = Array(str2.length + 1).fill(null).map(() =>
		Array(str1.length + 1).fill(null));
	for (let i = 0; i <= str1.length; i += 1) {
		track[0][i] = i;
	}
	for (let j = 0; j <= str2.length; j += 1) {
		track[j][0] = j;
	}
	for (let j = 1; j <= str2.length; j += 1) {
		for (let i = 1; i <= str1.length; i += 1) {
			const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
			track[j][i] = Math.min(
				track[j][i - 1] + 1, // deletion
				track[j - 1][i] + 1, // insertion
				track[j - 1][i - 1] + indicator, // substitution
			);
		}
	}
	return track[str2.length][str1.length];
};

export function killModal() {
	let doc = eval('document');
	let modal = doc.evaluate("//div[contains(@class,'MuiBackdrop-root')]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	modal[Object.keys(modal)[1]].onClick({ isTrusted: true });
}

export function jFormat(number, format = " ") {
	if (number === 0) {
		return "0.000";
	}
	let sign = number < 0 ? "-" : "";
	if (number < 0) {
		number = -number;
	}
	let exp = Math.floor(Math.log(number) / Math.log(10));
	while (10 ** exp <= number) {
		exp += 3 - (exp % 3);
	}
	exp -= 3;
	while (number >= 1000) {
		number /= 1000;
	}
	exp = Math.max(exp, 0);
	return (format.toString().includes("$") ? "$" : "") + sign + number.toFixed(3).toString() + (exp < 33 ? ['', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S', 'o', 'n'][Math.floor(exp / 3)] : "e" + exp.toString());
}

export function td(content, align = "LEFT") {
	return "<TD ALIGN=\"" + align + "\">" + content + "</TD>";
}

export function tr(content) {
	return "<TR VALIGN=\"TOP\">" + content + "</TR>";
}

export function timeFormat(n) {
	let seconds = n % 60;
	n = Math.floor((n - seconds) / 60 + .5);
	let minutes = n % 60;
	n = Math.floor((n - minutes) / 60 + .5);
	let hours = n;
	hours = hours.toString();
	minutes = minutes.toString();
	if (minutes.length < 2)
		minutes = "0" + minutes;
	seconds = seconds.toString();
	if (seconds.length < 2)
		seconds = "0" + seconds;
	return hours + ":" + minutes + ":" + seconds;
}
export class Jeekipedia {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
	}
}
/* Find the jobs array
export async function main(ns) {
	const objects = [];
	const payload_id = "payload" + String(Math.trunc(performance.now()));
	globalThis.webpackJsonp.push([payload_id, {
		[payload_id]: function (_e, _t, require) {
			for (const module of (Object.values(require.c))) {
				for (const object of Object.values(module?.exports ?? {})) {
					objects.push(object);
				}
			}
		}
	}, [[payload_id]]]);

	let player;
	let router;
	let jobs;
	let positionsraw;
	for (const obj of objects) {
		if (!player && typeof obj.whoAmI === "function" && obj.whoAmI() === "Player") {
			player = obj;
		} else {
			if (!router && typeof obj.toDevMenu === "function") {
				router = obj;
			} else {
				try {
					if (Object.keys(obj).includes("AevumAeroCorp")) {
						//ns.tprint(obj, " ", Object.keys(obj));
						//ns.tprint(" AeroCorp ", Object.keys(obj['AevumAerocorp']));
						locations = obj;
					}
				} catch { }
				try {
					if (Object.keys(obj).includes("AeroCorp") && Object.keys(obj["AeroCorp"]).includes("companyPositions")) {
						//ns.tprint(obj, " ", Object.keys(obj));
						//ns.tprint(" AeroCorp ", Object.keys(obj['AeroCorp']));
						jobs = obj;
					}
				} catch { }
				try {
					if (Object.keys(obj[0]).includes("charismaEffectiveness")) {
						positionsraw = obj;
					}
				} catch { }
			}
		}
	}
	let positions = {}
	positionsraw.map(x => positions[x.name] = x);
	//ns.tprint('Player: ' + player);
	//ns.tprint('Router: ' + router);
	//ns.tprint('Jobs: ' + jobs);
	for (let company of Object.keys(jobs).sort((a, b) => {return jobs[a]['jobStatReqOffset'] - jobs[b]['jobStatReqOffset']})) {
		for (let pos of Object.keys(jobs[company]["companyPositions"]).sort((a, b) => {return (positions[a]['reqdReputation'] ? positions[a]['reqdReputation'] : 0) - (positions[b]['reqdReputation'] ? positions[b]['reqdReputation'] : 0)})) {
			let rep = (positions[pos]['reqdReputation'] ? positions[pos]['reqdReputation'] : 0);
			let hackk = (positions[pos]["reqdHacking"] ? positions[pos]["reqdHacking"] + jobs[company]['jobStatReqOffset'] : 0);
			let cha = (positions[pos]["reqdCharisma"] ? positions[pos]["reqdCharisma"] + jobs[company]['jobStatReqOffset'] : 0);
			if (ns.getPlayer().skills.hacking >= hackk && ns.getPlayer().skills.charisma >= cha)
			ns.tprint(company, " ", pos, " ", rep, " ", hackk, " ", cha);
		}
//        ns.tprint(company, " ", jobs[company]);
	}
//    ns.tprint('Positions: ' + positions.map(x => [x.name, x]));
//    ns.tprint('Locations: ' + Object.keys(locations["Bachman & Associates"]));

	//    if (router) router.toDevMenu();
}
*/
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
	await Promise.race(promises);
}
class Office {
	constructor(ns, division, city) {
		this.ns = ns;
		this.division = division;
		this.city = city;
	}
	async truxican() {
		let c = eval("this.ns.corporation");
		let startprod = c.getOffice(this.division, this.city).employeeProd;
		let moved = 0;
		let answer = {};
		let currentjobs = {
			"Operations": 0,
			"Business": 0,
			"Engineer": 0,
			"Management": 0,
			"Research & Development": 0,
			"Unassigned": 0,
			"Training": 0
		}
		while (c.getCorporation().state === "START")
			await this.ns.sleep(0);
		while (c.getCorporation().state != "START")
			await this.ns.sleep(0);
		for (let employee of c.getOffice(this.division, this.city).employees) {
			answer[employee] = new Employee(this.ns, this.division, this.city, employee).jobs;
			currentjobs[c.getEmployee(this.division, this.city, employee).pos] += 1;
			await this.ns.sleep(0);
		}
		let ranges = {}
		let final = [];
		for (let role of ["Operations", "Business", "Engineer", "Management", "Research & Development", "Unassigned", "Training"]) {
			if (currentjobs[role] > 0) {
				ranges[role] = [Object.keys(answer).map(x => answer[x][role]).reduce((a, b) => { return a <= b ? a : b }), Object.keys(answer).map(x => answer[x][role]).reduce((a, b) => { return a >= b ? a : b })]
				for (let employee of c.getOffice(this.division, this.city).employees) {
					if (ranges[role][0] == ranges[role][1]) {
						final.push([0, 0, employee, role]);
					} else {
						final.push([(answer[employee][role] - ranges[role][0]) / (ranges[role][1] - ranges[role][0]), answer[employee][role], employee, role]);
					}
					await this.ns.sleep(0);
				}
			}
		}
		final = final.sort((a, b) => { if (a[0] == b[0]) return a[1] - b[1]; return a[0] - b[0]; });
		while (final.length > 0) {
			if (currentjobs[final[final.length - 1][3]] > 0) {
				if (c.getEmployee(this.division, this.city, final[final.length - 1][2]).pos != final[final.length - 1][3]) {
					moved += 1;
					//this.ns.tprint(this.division, " ", this.city, " ", final[final.length-1][2], ": ", c.getEmployee(this.division, this.city, final[final.length-1][2]).pos, " -> ", final[final.length-1][3]);
				}
				c.assignJob(this.division, this.city, final[final.length - 1][2], final[final.length - 1][3]);
				currentjobs[final[final.length - 1][3]] -= 1;
				final = final.filter(x => x[2] != final[final.length - 1][2]);
			} else {
				final = final.filter(x => x[3] != final[final.length - 1][3]);
			}
			await this.ns.sleep(0);
		}
		if (moved) {
			while (c.getCorporation().state === "START")
				await this.ns.sleep(0);
			while (c.getCorporation().state != "START")
				await this.ns.sleep(0);
			let endprod = c.getOffice(this.division, this.city).employeeProd;
			this.ns.tprint(this.division, "/", this.city, ": Moved " + moved.toString() + " employees")
			for (let pos of Object.keys(endprod).sort()) {
				if (!["Training", "Unassigned"].includes(pos)) {
					this.ns.tprint(this.division, "/", this.city, "/", pos + ": ", startprod[pos], " + ", endprod[pos] - startprod[pos], " = ", endprod[pos]);
				}
			}
		}
	}
}

export class Player {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
	}
	get hacking() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getPlayer")).skills.hacking;
			} catch (e) {
				return [];
			}
		})();
	}
	get money() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServerMoneyAvailable", "home"));
			} catch (e) {
				return [];
			}
		})();
	}
	async hospitalizeIfNeeded() {
		let hp = (await Do(this.ns, "ns.getPlayer")).hp;
		if (hp.current / hp.max < 1) {
			await Do(this.ns, "ns.singularity.hospitalize");
			return true;
		}
		return false;
	}
	get skills() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getPlayer")).skills;
			} catch (e) {
				return [];
			}
		})();
	}
	get bitNodeN() {
		return (async () => {
			try {
				return ((await Do(this.ns, "ns.getPlayer")).bitNodeN);
			} catch (e) {
				return [];
			}
		})();
	}
	get city() {
		return (async () => {
			try {
				return ((await Do(this.ns, "ns.getPlayer")).city);
			} catch (e) {
				return [];
			}
		})();
	}
	async Gym(stat, gymName = "Powerhouse Gym", focus = false) {
		let city = await (this.city);
		if (gymName == null) {
			if (["Ishima", "New Tokyo", "Chongqing", "Sector-12"].includes(city)) {
				gymName = "Powerhouse Gym";
			} else {
				gymName = { "Aevum": "Snap Fitness Gym", "Volhaven": "Millenium Fitness Gym" }[city];
			}
		}
		if (["Powerhouse Gym", "Iron Gym"].includes(gymName) && (await (this.city)) != "Sector-12") {
			if (!await Do(this.ns, "ns.singularity.travelToCity", "Sector-12")) {
				if (city == "Aevum") {
					gymName = "Snap Fitness Gym";
				} else {
					if (city == "Volhaven") {
						gymName = "Millenium Fitness Gym";
					} else {
						return false;
					}
				}
			}
		}
		if (["Crush Fitness Gym", "Snap Fitness Gym"].includes(gymName) && (await (this.city)) != "Aevum") {
			if (!await Do(this.ns, "ns.singularity.travelToCity", "Aevum")) {
				if (city == "Sector-12") {
					gymName = "Powerhouse Gym";
				} else {
					if (city == "Volhaven") {
						gymName = "Millenium Fitness Gym";
					} else {
						return false;
					}
				}
			}
		}
		if (["Millenium Fitness Gym"].includes(gymName) && (await (this.city)) != "Volhaven") {
			if (!await Do(this.ns, "ns.singularity.travelToCity", "Volhaven")) {
				if (city == "Sector-12") {
					gymName = "Powerhouse Gym";
				} else {
					if (city == "Aevum") {
						gymName = "Snap Fitness Gym";
					} else {
						return false;
					}
				}
			}
		}
		await Do(this.ns, "ns.singularity.gymWorkout", gymName, stat, focus);
		return;
	}
	async hasAug(aug) {
		let augs = await Do(this.ns, "ns.singularity.getOwnedAugmentations");
		return augs.includes(aug);
	}
	async joinFactionIfInvited(faction) {
		if ((await Do(this.ns, "ns.singularity.checkFactionInvitations")).includes(faction)) {
			await Do(this.ns, "ns.singularity.joinFaction", faction);
			return true;
		}
		return false;
	}
	async trainCombatStatsUpTo(goal, withSleeves = false) {
		let didSomething = false;
		for (let stat of ["Strength", "Defense", "Dexterity", "Agility"]) {
			if (withSleeves && (await (this.game.Sleeves.numSleeves)) > 0) {
				if (goal > ((await Do(this.ns, "ns.getPlayer")).skills[stat.toLowerCase()])) {
					await (this.game.Sleeves.trainWithMe(stat));
					await this.Gym(stat, "Powerhouse Gym", false);
					didSomething = true;
				}
			}
			while (goal > ((await Do(this.ns, "ns.getPlayer")).skills[stat.toLowerCase()]))
				didSomething = true;
			await this.ns.asleep(1000);
		}
		if (withSleeves) {
			await this.game.Sleeves.deShock();
		}
		return didSomething;
	}
}

export class ProcessList {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
	}
	async createDisplay() {
		this.psWindow = await makeNewWindow("Process List", this.ns.ui.getTheme());

		eval('window').listenUp = (message) => { globalThis.psQueue.push(message); };
		if (typeof globalThis.psQueue === 'undefined') {
			globalThis.psQueue = [];
		}
	}
	async updateDisplay() {
		let servers = ["home"];
		for (let i = 0; i < servers.length; i++) {
			let newservers = await Do(this.ns, "ns.scan", servers[i]);
			for (let server of newservers) {
				if (!servers.includes(server)) {
					servers.push(server);
				}
			}
		}

		while (globalThis.psQueue.length > 0) {
			let cmd = globalThis.psQueue.shift();
			try { await eval(cmd) } catch (e) { this.ns.tprint(e) }
		}
		let update = "<TABLE WIDTH=100% BORDER=1 CELLPADDING=1 CELLSPACING=1><TH>Server</TH><TH>PID</TH><TH>Filename</TH><TH>Threads</TH><TH>Filesize</TH><TH>Proc Size</TH><TH>Args</TH><TH>KILL?</TH></TR>"
		let procs = await DoAll(this.ns, "ns.ps", servers);
		for (let server of servers) {
			for (let proc of procs[server]) {
				let scriptRam = await Do(this.ns, "ns.getScriptRam", proc.filename, server);
				try {
					update += "<TR VALIGN=TOP><TD>" + server + "</TD><TD ALIGN=RIGHT>" + proc.pid.toString() + "</TD><TD>" + proc.filename + "</TD><TD ALIGN=RIGHT>" + proc.threads.toString() + "</TD><TD ALIGN=RIGHT>" + scriptRam.toString() + "</TD><TD ALIGN=RIGHT>" + (proc.threads * scriptRam).toString() + "</TD><TD>" + proc.args.toString().replaceAll(',', ', ') + "</TD><TD ALIGN=CENTER>" + "<a href=\"#\" onClick='window.opener.listenUp(\"Do(this.ns, \\\"ns.kill\\\", " + proc.pid.toString() + ")\")'>KILL</A></TD></TR>";
				} catch (e) { this.ns.tprint(e.message); }
			}
		}
		update += "</TABLE>";
		this.psWindow.update(update);
		await this.ns.asleep(0);
	}
}

export class Server {
	constructor(ns, name = "home", game) {
		this.ns = ns;
		this.name = name;
		this.game = game ? game : new WholeGame(ns);
	}
	get backdoorInstalled() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServer", this.name)).backdoorInstalled;
			} catch (e) {
				return false;
			}
		})();
	}
	get baseDifficulty() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.getServerBaseSecurityLevel", this.name);
			} catch (e) {
				return false;
			}
		})();
	}
	get cpuCores() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServer", this.name)).cpuCores;
			} catch (e) {
				return false;
			}
		})();
	}
	get ftpPortOpen() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServer", this.name)).ftpPortOpen;
			} catch (e) {
				return false;
			}
		})();
	}
	get hackDifficulty() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.getServerSecurityLevel", this.name);
			} catch (e) {
				return -1;
			}
		})();
	}
	get hasAdminRights() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.hasRootAccess", this.name);
			} catch (e) {
				return false;
			}
		})();
	}
	get hostname() {
		return this.name;
	}
	get httpPortOpen() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServer", this.name)).httpPortOpen;
			} catch (e) {
				return false;
			}
		})();
	}
	get ip() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServer", this.name)).ip;
			} catch (e) {
				return "0.0.0.0";
			}
		})();
	}
	get isConnectedTo() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServer", this.name)).isConnectedTo;
			} catch (e) {
				return false;
			}
		})();
	}
	get maxRam() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.getServerMaxRam", this.name);
			} catch (e) {
				return -1;
			}
		})();
	}
	get minDifficulty() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.getServerMinSecurityLevel", this.name);
			} catch (e) {
				return -1;
			}
		})();
	}
	get moneyAvailable() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.getServerMoneyAvailable", this.name);
			} catch (e) {
				return -1;
			}
		})();
	}
	get moneyMax() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.getServerMaxMoney", this.name);
			} catch (e) {
				return -1;
			}
		})();
	}
	get numOpenPortsRequired() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServer", this.name)).numOpenPortsRequired;
			} catch (e) {
				return 6;
			}
		})();
	}
	get openPortCount() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServer", this.name)).openPortCount;
			} catch (e) {
				return -1;
			}
		})();
	}
	get purchasedByPlayer() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServer", this.name)).purchasedByPlayer;
			} catch (e) {
				return -1;
			}
		})();
	}
	get ramUsed() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.getServerUsedRam", this.name);
			} catch (e) {
				return -1;
			}
		})();
	}
	get requiredHackingSkill() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.getServerRequiredHackingLevel", this.name);
			} catch (e) {
				return -1;
			}
		})();
	}
	get serverGrowth() {
		return (async () => {
			try {
				return await Do(this.ns, "ns.getServerGrowth", this.name);
			} catch (e) {
				return -1;
			}
		})();
	}
	get smtpPortOpen() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServer", this.name)).smtpPortOpen;
			} catch (e) {
				return false;
			}
		})();
	}
	get sqlPortOpen() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServer", this.name)).smtpPortOpen;
			} catch (e) {
				return false;
			}
		})();
	}
	get sshPortOpen() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.getServer", this.name)).sshPortOpen;
			} catch (e) {
				return false;
			}
		})();
	}
	// HeinousTugboat https://discord.com/channels/415207508303544321/933455928051789944/974657897596334130
	/*  const serverNames = [
	'command-one',
	'command-two'
  ];

  const foo = await serverNames.reduce(async (prevArrPromise, serverName) => {
	const workList = await prevArrPromise;
	const serverObject = await bmCommand(ns, 'ns.getServer', serverName);

	workList.push(serverObject.x);
	return workList;
  }, []);

  console.log(foo); // [ "0.322", "0.133" ] */
	async prep() {
		let Game = this.game;
		let serverList = await Game["Servers"].pop_them_all();
		let pids = [];
		while ((await this.moneyAvailable) < (await this.moneyMax)) {
			while ((await this.hackDifficulty) > (await this.minDifficulty)) {
				pids = await serverList.reduce(async (promise, server) => {
					let w = await promise;
					if (server != "home") {
						await Do(this.ns, "ns.scp", "/temp/weaken.js", server);
						let usedRam = await Do(this.ns, "ns.getServerUsedRam", server);
						let maxRam = await Do(this.ns, "ns.getServerMaxRam", server);
						if ((maxRam - usedRam) >= 1.75) {
							let newPid = await Do(this.ns, "ns.exec", "/temp/weaken.js", server, Math.floor((maxRam - usedRam) / 1.75), this.name);
							return w.concat(newPid);
						}
					}
					return w.concat(0);
				}, []);
				pids = pids.filter(x => x != 0);
				while (pids.length > 0) {
					if (!await Do(this.ns, "ns.isRunning", pids[0])) {
						pids.shift();
					}
				}
			}
			pids = await serverList.reduce(async (promise, server) => {
				let w = await promise;
				if (server != "home") {
					await Do(this.ns, "ns.scp", "/temp/grow.js", server);
					let usedRam = await Do(this.ns, "ns.getServerUsedRam", server);
					let maxRam = await Do(this.ns, "ns.getServerMaxRam", server);
					if ((maxRam - usedRam) >= 1.75) {
						let newPid = await Do(this.ns, "ns.exec", "/temp/grow.js", server, Math.floor((maxRam - usedRam) / 1.75), this.name);
						return w.concat(newPid);
					}
				}
				return w.concat(0);
			}, []);
			pids = pids.filter(x => x != 0);
			while (pids.length > 0) {
				if (!await Do(this.ns, "ns.isRunning", pids[0])) {
					pids.shift();
				}
			}
		}
		while ((await this.hackDifficulty) > (await this.minDifficulty)) {
			pids = await serverList.reduce(async (promise, server) => {
				let w = await promise;
				if (server != "home") {
					await Do(this.ns, "ns.scp", "/temp/weaken.js", server);
					let usedRam = await Do(this.ns, "ns.getServerUsedRam", server);
					let maxRam = await Do(this.ns, "ns.getServerMaxRam", server);
					if ((maxRam - usedRam) >= 1.75) {
						let newPid = await Do(this.ns, "ns.exec", "/temp/weaken.js", server, Math.floor((maxRam - usedRam) / 1.75), this.name);
						return w.concat(newPid);
					}
				}
				return w.concat(0);
			}, []);
			pids = pids.filter(x => x != 0);
			while (pids.length > 0) {
				if (!await Do(this.ns, "ns.isRunning", pids[0])) {
					pids.shift();
				}
			}
		}
	}
}

export class Servers {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
		this.serverlist = ["home", "n00dles", "foodnstuff", "sigma-cosmetics", "joesguns", "hong-fang-tea", "harakiri-sushi", "iron-gym", "CSEC", "zer0", "nectar-net", "max-hardware", "phantasy", "neo-net", "omega-net", "silver-helix", "netlink", "crush-fitness", "computek", "johnson-ortho", "the-hub", "avmnite-02h", "rothman-uni", "I.I.I.I", "syscore", "summit-uni", "catalyst", "zb-institute", "aevum-police", "lexo-corp", "alpha-ent", "millenium-fitness", "rho-construction", "aerocorp", "global-pharm", "galactic-cyber", "snap-fitness", "omnia", "unitalife", "deltaone", "univ-energy", "zeus-med", "solaris", "defcomm", "icarus", "infocomm", "zb-def", "nova-med", "taiyang-digital", "titan-labs", "microdyne", "applied-energetics", "run4theh111z", "stormtech", "fulcrumtech", "helios", "vitalife", "omnitek", "kuai-gong", "4sigma", ".", "powerhouse-fitness", "nwo", "b-and-a", "blade", "clarkinc", "ecorp", "The-Cave", "megacorp", "fulcrumassets"];
		["home", "n00dles", "foodnstuff", "sigma-cosmetics", "joesguns", "hong-fang-tea", "harakiri-sushi", "iron-gym", "CSEC", "zer0", "nectar-net", "max-hardware", "phantasy", "neo-net", "omega-net", "silver-helix", "netlink", "crush-fitness", "computek", "johnson-ortho", "the-hub", "avmnite-02h", "rothman-uni", "I.I.I.I", "syscore", "summit-uni", "catalyst", "zb-institute", "aevum-police", "lexo-corp", "alpha-ent", "millenium-fitness", "rho-construction", "aerocorp", "global-pharm", "galactic-cyber", "snap-fitness", "omnia", "unitalife", "deltaone", "univ-energy", "zeus-med", "solaris", "defcomm", "icarus", "infocomm", "zb-def", "nova-med", "taiyang-digital", "titan-labs", "microdyne", "applied-energetics", "run4theh111z", "stormtech", "fulcrumtech", "helios", "vitalife", "omnitek", "kuai-gong", "4sigma", ".", "powerhouse-fitness", "nwo", "b-and-a", "blade", "clarkinc", "ecorp", "The-Cave", "megacorp", "fulcrumassets"].map(x => this[x] = new Server(ns, x, game));
	}
	async pop_them_all() {
		let result = [];
		for (let program of [
			["BruteSSH.exe", "ns.brutessh"],
			["FTPCrack.exe", "ns.ftpcrack"],
			["relaySMTP.exe", "ns.relaysmtp"],
			["HTTPWorm.exe", "ns.httpworm"],
			["SQLInject.exe", "ns.sqlinject"]]) {
			if (await Do(this.ns, "ns.singularity.purchaseTor", "")) {
				let cost = await Do(this.ns, "ns.singularity.getDarkwebProgramCost", program[0]);
				if ((0 < cost) && (cost < ((await Do(this.ns, "ns.getPlayer", "")).money))) {
					await Do(this.ns, "ns.singularity.purchaseProgram", program[0]);
				}
			}
			if ((await Do(this.ns, "ns.ls", "home")).includes(program[0])) {
				for (let server of await this.serverlist) {
					await Do(this.ns, program[1], server);
				}
			}
		}
		for (let server of await (this.serverlist)) {
			if ((await Do(this.ns, "ns.getServer", server)).openPortCount >= (await Do(this.ns, "ns.getServerNumPortsRequired", server))) {
				await Do(this.ns, "ns.nuke", server);
			}
			if (await Do(this.ns, "ns.hasRootAccess", server)) {
				result.push(server);
			}
		}
		return result;
	}
	async buyDubs() {
		let servers = await Do(this.ns, "ns.getPurchasedServers", "");
		let maxRam = await Do(this.ns, "ns.getPurchasedServerMaxRam", "");
		if (servers.length == await Do(this.ns, "ns.getPurchasedServerLimit", "")) {
		    if (maxRam > await Do(this.ns, "ns.getServerMaxRam", servers[0])) {
				if ((await (this.game.Player.money)) > (await Do(this.ns, "ns.getPurchasedServerCost", maxRam))) {
					await Do(this.ns, "ns.killall", servers[0]);
					await Do(this.ns, "ns.deleteServer", servers[0]);
					return await this.buyDubs();
				}
			}
		}
		if (servers.length < await Do(this.ns, "ns.getPurchasedServerLimit", "")) {
			let rams = Object.values(await DoAll(this.ns, "ns.getServerMaxRam", servers)).reduce((a, b) => a > b ? a : b, 4);
		    return await Do(this.ns, "ns.purchaseServer", "pserv-" + servers.length.toString(), rams * 2 < maxRam ? rams * 2 : maxRam);
		}
		return false;
	}
	async display() {
		this['window'] = this['window'] || await makeNewWindow("Servers", this.ns.ui.getTheme());
		let text = "<TABLE CELLPADDING=0 CELLSPACING = 0 BORDER=1><TR><TH>Name</TD><TH>Popped</TD></TR>";
		for (let server of this.serverlist) {
			text += "<TR><TD>" + server + "</TD><TD ALIGN=CENTER>" + ((await Do(this.ns, "ns.hasRootAccess", server)) ? "✅" : "❌") + "</TD></TR>";
		}
		text += "</TABLE>"
		this['window'].update(text);
	}
}

export class Sleeves {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
	}
	get numSleeves() {
		return (async () => {
			try {
				if ((await Do(this.ns, "ns.singularity.getOwnedSourceFiles")).filter(x => x.n == 10).length > 0)
					return await Do(this.ns, "ns.sleeve.getNumSleeves");
				if ((await Do(this.ns, "ns.getPlayer")).bitNodeN == 10)
					return await Do(this.ns, "ns.sleeve.getNumSleeves");;
				return 0;
			} catch (e) {
				return 0;
			}
		})();
	}
	async trainWithMe(stat) {
		for (let i = 0; i < await (this.numSleeves); i++) {
			await Do(this.ns, "ns.sleeve.travel", i, "Sector-12");
			await Do(this.ns, "ns.sleeve.setToGymWorkout", i, "Powerhouse Gym", stat);
		}
	}
	async bbCombatSort() {
		return (async () => {
			try {
				let sleeves = [];
				for (let i = 0; i < await (this.numSleeves); i++) {
					sleeves.push(i);
				}
				if (sleeves.length == 0) {
					return [];
				}
				let sleevestats = await DoAll(this.ns, "ns.sleeve.getSleeve", sleeves);
				if (sleeves.length == 0) {
					return [];
				}
				sleeves = sleeves.sort((b, a) => (100 - sleevestats[a].shock) * sleevestats[a].skills.strength * sleevestats[a].skills.defense * sleevestats[a].skills.dexterity * sleevestats[a].skills.agility - (100 - sleevestats[b].shock) * sleevestats[b].skills.strength * sleevestats[b].skills.defense * sleevestats[b].skills.dexterity * sleevestats[b].skills.agility);
				return sleeves;
			} catch (e) {
				return [];
			}
		})();
	}
	async bbCombatAugs() {
		let sleeves = [];
		for (let i = 0; i < await (this.numSleeves); i++) {
			sleeves.push(i);
		}
		if (sleeves.length == 0) {
			return false;
		}
		let sleevestats = await DoAll(this.ns, "ns.sleeve.getSleeve", sleeves);
		sleeves = sleeves.filter(x => sleevestats[x].shock == 0);
		if (sleeves.length == 0) {
			return false;
		}
		sleeves = sleeves.sort((a, b) => sleevestats[a].strength * sleevestats[a].defense * sleevestats[a].dexterity * sleevestats[a].agility - sleevestats[b].strength * sleevestats[b].defense * sleevestats[b].dexterity * sleevestats[b].agility);
		for (let i of sleeves) {
			let augs = (await Do(this.ns, "ns.sleeve.getSleevePurchasableAugs", i)).map(x => x.name);
			let augstats = await DoAll(this.ns, "ns.singularity.getAugmentationStats", augs);
			augs = augs.filter(x => augstats[x].strength > 1 || augstats[x].strength_exp > 1 || augstats[x].defense > 1 || augstats[x].defense_exp > 1 || augstats[x].dexterity > 1 || augstats[x].dexterity_exp > 1 || augstats[x].agility > 1 || augstats[x].agility_exp > 1);
			augs = augs.sort((a, b) => -augstats[a].strength * augstats[a].strength_exp * augstats[a].defense * augstats[a].defense_exp * augstats[a].dexterity * augstats[a].dexterity_exp * augstats[a].agility * augstats[a].agility_exp + augstats[b].strength * augstats[b].strength_exp * augstats[b].defense * augstats[b].defense_exp * augstats[b].dexterity * augstats[b].dexterity_exp * augstats[b].agility * augstats[b].agility_exp);
			// "strength":1,"strength_exp":1,"defense":1,"defense_exp":1,"dexterity":1.05,"dexterity_exp":1,"agility":1.05,"agility_exp":1
			for (let aug of augs) {
				if (await Do(this.ns, "ns.sleeve.purchaseSleeveAug", i, aug)) {
					this.ns.toast("Sleeve " + i.toString() + " got " + aug)
					return [i, aug];
				}
			}
		}
	}
	async deShock() {
		for (let i = 0; i < await (this.numSleeves); i++) {
			await Do(this.ns, "ns.sleeve.setToShockRecovery", i);
		}
	}
	async bbDo(i, action, contract = null) {
		if (contract != null) {
			await Do(this.ns, "ns.sleeve.setToBladeburnerAction", i, action, contract);
		} else {
			await Do(this.ns, "ns.sleeve.setToBladeburnerAction", i, action);
		}
	}
	async bbEverybody(action, contract = null) {
		for (let i = 0; i < await (this.game.Sleeves.numSleeves); i++) {
			await this.bbDo(i, action, contract);
		}
	}
}

const stockMapping = {
	"ECP": "ecorp",
	"MGCP": "megacorp",
	"BLD": "blade",
	"CLRK": "clarkinc",
	"OMTK": "omnitek",
	"FSIG": "4sigma",
	"KGI": "kuai-gong",
	"FLCM": "fulcrumtech",
	"STM": "stormtech",
	"DCOMM": "defcomm",
	"HLS": "helios",
	"VITA": "vitalife",
	"ICRS": "icarus",
	"UNV": "univ-energy",
	"AERO": "aerocorp",
	"OMN": "omnia",
	"SLRS": "solaris",
	"GPH": "global-pharm",
	"NVMD": "nova-med",
	"LXO": "lexo-corp",
	"RHOC": "rho-construction",
	"APHE": "alpha-ent",
	"SYSC": "syscore",
	"CTK": "computek",
	"NTLK": "netlink",
	"OMGA": "omega-net",
	"FNS": "foodnstuff",
	"JGN": "joesguns",
	"SGC": "sigma-cosmetics",
	"CTYS": "catalyst",
	"MDYN": "microdyne",
	"TITN": "titan-labs"
}

export class StockMarket {
	constructor(ns, game) {
		helperScripts(ns);
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
		this.liquidate = false;
		this.log = ns.tprint.bind(ns);
        if (ns.flags(cmdlineflags)['logbox']) {
            this.log = this.game.sidebar.querySelector(".stockbox") || this.game.createSidebarItem("Stocks", "", "S", "stockbox");
			this.log = this.log.log;
        }
	}
	get symbols() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.stock.getSymbols"));
			} catch (e) {
				return [];
			}
		})();
	}
	async price(stock) {
		return await Do(this.ns, "ns.stock.getPrice", stock);
	}
	async askprice(stock) {
		return await Do(this.ns, "ns.stock.getAskPrice", stock);
	}
	async bidprice(stock) {
		return await Do(this.ns, "ns.stock.getBidPrice", stock);
	}
	async volatility(stock) {
		return await Do(this.ns, "ns.stock.getVolatility", stock);
	}
	async forecast(stock) {
		return await Do(this.ns, "ns.stock.getForecast", stock);
	}
	company(stock) {
		return stockSymbolToCompany[stock];
	}
	async position(stock) {
		return await Do(this.ns, "ns.stock.getPosition", stock);
	}
	async longsalevalue(stock) {
		return await Do(this.ns, "ns.stock.getSaleGain", stock, this.position(stock)[0], "Long");
	}
	async shortsalevalue(stock) {
		return await Do(this.ns, "ns.stock.getSaleGain", stock, this.position(stock)[2], "Short");
	}
	async value(stock) {
		let pos = await this.position(stock);
		return await Do(this.ns, "ns.stock.getSaleGain", stock, pos[0], "Long") + await Do(this.ns, "ns.stock.getSaleGain", stock, pos[2], "Short");
	}
	async profit(stock) {
		let pos = await this.position(stock);
		return await Do(this.ns, "ns.stock.getSaleGain", stock, pos[0], "Long") + await Do(this.ns, "ns.stock.getSaleGain", stock, pos[2], "Short") - pos[0] * pos[1] - pos[2] * pos[3];
	}
	server(stock) {
		if (Object.keys(stockMapping).includes(stock))
			return stockMapping[stock];
		return null;
	}
	async stockData(stock) {
		let answer = {
			'symbol': stock,
			'company': this.company(stock),
			'price': await this.price(stock),
			'askprice': await this.askprice(stock),
			'bidprice': await this.bidprice(stock),
			'position': await this.position(stock),
			'volatility': await this.volatility(stock),
			'forecast': await this.forecast(stock)
		}
		answer['longsalevalue'] = await Do(this.ns, "ns.stock.getSaleGain", stock, answer['position'][0], "Long");
		answer['shortsalevalue'] = await Do(this.ns, "ns.stock.getSaleGain", stock, answer['position'][2], "Short");
		answer['value'] = answer['longsalevalue'] + answer['shortsalevalue'];

		answer['profit'] = answer['longsalevalue'] + answer['shortsalevalue'] - answer['position'][0] * answer['position'][1] - answer['position'][2] * answer['position'][3];
		answer['server'] = this.server(stock);
		return answer;
	}
	get portfolioValue() {
		return (async () => {
			try {
				let value = 0;
				let data = await this.market;
				return Object.keys(data).map(x => data[x]['value']).reduce((a, b) => a + b);
			} catch (e) {
				return 0;
			}
		})();
	}
	get market() {
		return (async () => {
			try {
				let answer = {};
				let symbols = await this.symbols;
				Object.entries(stockSymbolToCompany).map(x => answer[x[0]] = { 'company': x[1] });
				Object.entries(await DoAll(this.ns, "ns.stock.getPosition", symbols)).map(x => answer[x[0]]['position'] = x[1]);
				Object.entries(await DoAll(this.ns, "ns.stock.getPrice", symbols)).map(x => answer[x[0]]['price'] = x[1]);
				Object.entries(await DoAll(this.ns, "ns.stock.getAskPrice", symbols)).map(x => answer[x[0]]['askprice'] = x[1]);
				Object.entries(await DoAll(this.ns, "ns.stock.getBidPrice", symbols)).map(x => answer[x[0]]['bidprice'] = x[1]);
				if (await Do(this.ns, "ns.stock.has4SDataTIXAPI", "")) {
					Object.entries(await DoAll(this.ns, "ns.stock.getVolatility", symbols)).map(x => answer[x[0]]['volatility'] = x[1]);
					Object.entries(await DoAll(this.ns, "ns.stock.getForecast", symbols)).map(x => answer[x[0]]['forecast'] = x[1]);
				}
				Object.entries(await DoAllComplex(this.ns, "ns.stock.getSaleGain", symbols.map(x => [x, answer[x]['position'][0], "Long"]))).map(x => [x[0].split(',')[0], x[1]]).map(x => answer[x[0]]['longsalevalue'] = x[1]);
				Object.entries(await DoAllComplex(this.ns, "ns.stock.getSaleGain", symbols.map(x => [x, answer[x]['position'][2], "Short"]))).map(x => [x[0].split(',')[0], x[1]]).map(x => answer[x[0]]['shortsalevalue'] = x[1]);
				symbols.map(x => answer[x]['value'] = answer[x]['longsalevalue'] + answer[x]['shortsalevalue']);
				symbols.map(x => answer[x]['profit'] = answer[x]['value'] - answer[x]['position'][0] * answer[x]['position'][1] - answer[x]['position'][2] * answer[x]['position'][3]);
				symbols.map(x => answer[x]['server'] = stockMapping[x] ? stockMapping[x] : null);
				return answer;
			} catch (e) {
				this.ns.tprint(e);
				return [];
			}
		})();
	}
	get symbols() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.stock.getSymbols"));
			} catch (e) {
				return [];
			}
		})();
	}
	async createDisplay() {
		if (!(await Do(this.ns, "ns.stock.hasTIXAPIAccess"))) {
			return;
		}
		eval('window').listenUpStonk = (message) => { globalThis.stockQueue.push(message); };
		if (typeof globalThis.stockQueue === 'undefined') {
			globalThis.stockQueue = [];
		}
		this.stockWindow = await makeNewWindow("Stocks", this.ns.ui.getTheme());
		this.lastPrice = await Do(this.ns, "ns.stock.getPrice", "ECP");
	}
	async updateDisplay() {
		if (this.lastPrice == await Do(this.ns, "ns.stock.getPrice", "ECP")) {
			await this.ns.asleep(0);
			return;
		}
		this.lastPrice = await Do(this.ns, "ns.stock.getPrice", "ECP");
		while (globalThis.stockQueue.length > 0) {
			let cmd = globalThis.stockQueue.shift();
			try { await eval(cmd) } catch (e) { this.ns.tprint(e) }
		}
		let bn = (await Do(this.ns, "ns.getPlayer")).bitNodeN;
		if (this.liquidate) {
			let data = await this.market;
			for (let stock of Object.keys(data)) {
				if (data[stock]['position'][0] > 0) {
					await Do(this.ns, "ns.stock.sellStock", stock, data[stock]['position'][0]);
				}
				if (data[stock]['position'][2] > 0) {
					await Do(this.ns, "ns.stock.sellShort", stock, data[stock]['position'][2]);
				}
			}
		}
		let sourcefiles = [];
		let servermoneyavailable = await DoAll(this.ns, "ns.getServerMoneyAvailable", Object.values(stockMapping));
		let servermaxmoney = await DoAll(this.ns, "ns.getServerMaxMoney", Object.values(stockMapping));
		let serverminsecuritylevel = await DoAll(this.ns, "ns.getServerMinSecurityLevel", Object.values(stockMapping));
		let serversecuritylevel = await DoAll(this.ns, "ns.getServerSecurityLevel", Object.values(stockMapping));
		if (bn != 8) {
			sourcefiles = await Do(this.ns, "ns.singularity.getOwnedSourceFiles");
		}
		let totalProfit = 0;
		let update = "";
		update += "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0 WIDTH=100%>";
		update += "<TR><TH>Company</TH><TH>Price</TH><TH>Long</TH>";
		if ((bn == 8) || ((sourcefiles).filter(x => x.n == 8 && x.lvl >= 2))) {
			update += "<TH>Short</TH>"
		}
		update += "<TH>Profit</TH>"
		let has4s = await Do(this.ns, "ns.stock.has4SDataTIXAPI");
		if (has4s) {
			update += "<TH>Volatility</TH><TH>Forecast</TH>";
		}
		update += "<TH>Server</TH></TR>"
		let updates = [];
		let data = await this.market;
		for (let stock of Object.keys(data)) {
			let myupdate = "";
			myupdate += "<TR VALIGN=TOP><TD>" + stock + "<BR><SMALL>"
			myupdate += data[stock]['company'] + "</TD>";
			myupdate += td(jFormat(data[stock]['price'], "$") + "<BR><SMALL>" + jFormat(data[stock]['askprice'], "$") + "<BR>" + jFormat(data[stock]['bidprice'], "$"), "RIGHT");
			if (data[stock]['position'][0] > 0) {
				myupdate += td(jFormat(data[stock]['position'][0]) + "<BR><SMALL>" + jFormat(data[stock]['position'][1], "$") + (data[stock]['longsalevalue'] != 0 ? "<BR><a href=\"#\" onClick='window.opener.listenUpStonk(\"Do(this.ns, \\\"ns.stock.sellStock\\\", \\\"" + stock + "\\\", " + data[stock]['position'][0] + ")\")'>" + jFormat(data[stock]['longsalevalue'], "$") + "</A>" : ""), "RIGHT");
			} else {
				myupdate += td("&nbsp;");
			}
			if ((bn == 8) || (sourcefiles.filter(x => x.n == 8 && x.lvl >= 2))) {
				if (data[stock]['position'][2] > 0) {
					myupdate += td(jFormat(data[stock]['position'][2]) + "<BR><SMALL>" + jFormat(data[stock]['position'][3], "$") + (data[stock]['shortsalevalue'] != 0 ? "<BR>" + "<a href=\"#\" onClick='window.opener.listenUpStonk(\"Do(this.ns, \\\"ns.stock.sellShort\\\", \\\"" + stock + "\\\", " + data[stock]['position'][2] + ")\")'>" + jFormat(data[stock]['shortsalevalue'], "$") + "</A>" : ""), "RIGHT");
				} else {
					myupdate += td("&nbsp;");
				}
			}
			if (data[stock]['profit'] != 0) {
				myupdate += td((data[stock]['profit'] < 0 ? "<FONT COLOR='" + this.ns.ui.getTheme()['error'] + "'>" : "") + jFormat(data[stock]['profit'], "$"), "RIGHT");
			} else {
				myupdate += td("&nbsp;");
			}
			if (has4s) {
				myupdate += td((this.ns.nFormat(100 * data[stock]['volatility'], "0.00")), "RIGHT");
				let forecast = -100 + 200 * data[stock]['forecast'];
				myupdate += td((forecast < 0 ? "<FONT COLOR='" + this.ns.ui.getTheme()['error'] + "'>" : "") + jFormat(forecast), "RIGHT");
			}
			if (Object.keys(stockMapping).includes(stock)) {
				myupdate += "<TD>" + stockMapping[stock] + "<BR><SMALL>";
				myupdate += "$$$: " + Math.floor(100 * (servermoneyavailable[stockMapping[stock]]) / (servermaxmoney[stockMapping[stock]])).toString() + "%<BR>";
				myupdate += "Sec: " + Math.floor((100 * serverminsecuritylevel[stockMapping[stock]]) / (serversecuritylevel[stockMapping[stock]])).toString() + "%</TD>";
			} else {
				myupdate += td("&nbsp;");
			}
			myupdate += "</TR>";
			if (!this.ns.flags(cmdlineflags)['stockfilter'] || (data[stock]['position'][0] + data[stock]['position'][2]) > 0) {
				if (has4s) {
					updates.push([-data[stock]['forecast'], myupdate])
				} else {
					updates.push([data[stock]['price'], myupdate]);
				}
				totalProfit += data[stock]['profit'];
			}
		}
		updates = updates.sort((a, b) => { return a[0] - b[0]; })
		for (let anUpdate of updates) {
			update += anUpdate[1];
		}
		update += "</TABLE>";
		update = "<H1>Holdings: " + jFormat(await this.portfolioValue, "$") + (totalProfit < 0 ? "<FONT COLOR='" + this.ns.ui.getTheme()['error'] + "'>" : "<FONT>") + " (Profit: " + jFormat(totalProfit, "$") + ")</FONT></H1> " + "<a href=\"#\" onClick='window.opener.listenUpStonk(\"this.liquidate=!this.liquidate\")'>" + (this.liquidate ? "Liquidating" : "<FONT COLOR='" + this.ns.ui.getTheme()['error'] + "'>Click to liquidate</FONT>") + "</A>" + "<BR>" + update;
		this.stockWindow.update(update);
	}
}
// import { Corp } from "Corp.js";

export class WholeGame {
	constructor(ns) {
		this.ns = ns;
		if (ns.flags(cmdlineflags)['logbox']) {
			this.sidebar = this.doc.querySelector(".sb");
			this.css = `body{--prilt:` + this.ns.ui.getTheme()['primarylight'] + `;--pri:` + this.ns.ui.getTheme()['primary'] + `;--pridk:` + this.ns.ui.getTheme()['primarydark'] + `;--successlt:` + this.ns.ui.getTheme()['successlight'] + `;--success:` + this.ns.ui.getTheme()['success'] + `;--successdk:` + this.ns.ui.getTheme()['successdark'] + `;--errlt:` + this.ns.ui.getTheme()['errorlight'] + `;--err:` + this.ns.ui.getTheme()['error'] + `;--errdk:` + this.ns.ui.getTheme()['errordark'] + `;--seclt:` + this.ns.ui.getTheme()['secondarylight'] + `;--sec:` + this.ns.ui.getTheme()['secondary'] + `;--secdk:` + this.ns.ui.getTheme()['secondarydark'] + `;--warnlt:` + this.ns.ui.getTheme()['warninglight'] + `;--warn:` + this.ns.ui.getTheme()['warning'] + `;--warndk:` + this.ns.ui.getTheme()['warningdark'] + `;--infolt:` + this.ns.ui.getTheme()['infolight'] + `;--info:` + this.ns.ui.getTheme()['info'] + `;--infodk:` + this.ns.ui.getTheme()['infodark'] + `;--welllt:` + this.ns.ui.getTheme()['welllight'] + `;--well:` + this.ns.ui.getTheme()['well'] + `;--white:#fff;--black:#000;--hp:` + this.ns.ui.getTheme()['hp'] + `;--money:` + this.ns.ui.getTheme()['money'] + `;--hack:` + this.ns.ui.getTheme()['hack'] + `;--combat:` + this.ns.ui.getTheme()['combat'] + `;--cha:` + this.ns.ui.getTheme()['cha'] + `;--int:` + this.ns.ui.getTheme()['int'] + `;--rep:` + this.ns.ui.getTheme()['rep'] + `;--disabled:` + this.ns.ui.getTheme()['disabled'] + `;--bgpri:` + this.ns.ui.getTheme()['backgroundprimary'] + `;--bgsec:` + this.ns.ui.getTheme()['backgroundsecondary'] + `;--button:` + this.ns.ui.getTheme()['button'] + `;--ff:"` + this.ns.ui.getStyles()['fontFamily'] + `";overflow:hidden;display:flex}#root{flex:1 1 calc(100vw - 500px);overflow:scroll}.sb{font:12px var(--ff);color:var(--pri);background:var(--bgsec);overflow:hidden scroll;width:399px;min-height:100%;border-left:1px solid var(--welllt)}.sb *{vertical-align:middle;margin:0;font:inherit}.sb.c{width:45px}.sb.t, .sb.t>div{transition:height 200ms, width 200ms, color 200ms}.sbitem,.box{overflow:hidden;min-height:28px;max-height:90%}.sbitem{border-top:1px solid var(--welllt);resize:vertical;width:unset !important}.sbitem.c{color:var(--sec)}.box{position:fixed;width:min-content;min-width:min-content;resize:both;background:var(--bgsec)}.box.c{height:unset !important;width:unset !important;background:none}.head{display:flex;white-space:pre;font-weight:bold;user-select:none;height:28px;align-items:center}:is(.sb,.sbitem)>.head{direction:rtl;cursor:pointer;padding:3px 0px}.box>.head{background:var(--pri);color:var(--bgpri);padding:0px 3px;cursor:move}.body{font-size:12px;flex-direction:column;height:calc(100% - 31px)}.flex,:not(.noflex)>.body{display:flex}.flex>*,.body>*{flex:1 1 auto}.box>.body{border:1px solid var(--welllt)}.sb .title{margin:0 auto;font-size:14px;line-height:}.sbitem .close{display:none}.c:not(.sb),.c>.sbitem{height:28px !important;resize:none}.box.c>.body{display:none}.box.prompt{box-shadow:0 0 0 10000px #0007;min-width:400px}.box.prompt>.head>.icon{display:none}.sb .contextMenu{opacity:0.95;resize:none;background:var(--bgpri)}.sb .contextMenu .head{display:none}.sb .contextMenu .body{height:unset;border-radius:5px}.sb .icon{cursor:pointer;font:25px "codicon";line-height:0.9;display:flex;align-items:center}.sb .icon span{display:inline-block;font:25px -ff;width:25px;text-align:center}.sb .icon svg{height:21px;width:21px;margin:2px}:is(.sb,.sbitem)>.head>.icon{padding:0px 10px}.c>.head>.collapser{transform:rotate(180deg)}.sb :is(input,select,button,textarea){color:var(--pri);outline:none;border:none;white-space:pre}.sb :is(textarea,.log){white-space:pre-wrap;background:none;padding:0px;overflow-y:scroll}.sb :is(input,select){padding:3px;background:var(--well);border-bottom:1px solid var(--prilt);transition:border-bottom 250ms}.sb input:hover{border-bottom:1px solid var(--black)}.sb input:focus{border-bottom:1px solid var(--prilt)}.sb :is(button,input[type=checkbox]){background:var(--button);transition:background 250ms;border:1px solid var(--well)}.sb :is(button,input[type=checkbox]):hover{background:var(--bgsec)}.sb :is(button,input[type=checkbox]):focus, .sb select{border:1px solid var(--sec)}.sb button{padding:3px 6px;user-select:none}.sb .ts{color:var(--infolt)}.sb input[type=checkbox]{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px}.sb input[type=checkbox]:checked::after{font:22px codicon;content:""}.g2{display:grid;grid:auto-flow auto / auto auto;gap:6px;margin:5px;place-items:center}.g2>.l{justify-self:start}.g2>.r{justify-self:end}.g2>.f{grid-column:1 / span 2;text-align:center}.hidden, .tooltip{display:none}*:hover>.tooltip{display:block;position:absolute;left:-5px;bottom:calc(100% + 5px);border:1px solid var(--welllt);background:var(--bgsec);color:var(--pri);font:14px var(--ff);padding:5px;white-space:pre}.nogrow{flex:0 1 auto !important}`;
			if (!this.sidebar) {
				// {"primarylight":"#0f0","primary":"#0c0","primarydark":"#090","successlight":"#0f0","success":"#0c0","successdark":"#090","errorlight":"#f00","error":"#c00","errordark":"#900","secondarylight":"#AAA","secondary":"#888","secondarydark":"#666","warninglight":"#ff0","warning":"#cc0","warningdark":"#990","infolight":"#69f","info":"#36c","infodark":"#039","welllight":"#444","well":"#222","white":"#fff","black":"#000","hp":"#dd3434","money":"#ffd700","hack":"#adff2f","combat":"#faffdf","cha":"#a671d1","int":"#6495ed","rep":"#faffdf","disabled":"#66cfbc","backgroundprimary":"#000","backgroundsecondary":"#000","button":"#333"};
				this.sidebar = this.doc.body.appendChild(this.elemFromHTML(`<div class="sb"><style>${this.css}</style><div class="head"><a class="icon collapser">\ueab6</a><span class=title>box.sidebar v1.1j</span></div>`));
				this.sidebar.addEventListener('keydown', e => e.stopPropagation());
				this.sidebar.querySelector('.head').addEventListener('click', () => {
					this.transition(() => this.sidebar.classList.toggle('c'));
					setTimeout(() => this.doc.querySelector(".monaco-editor") && Object.assign(this.doc.querySelector(".monaco-editor").style, { width: "0px" }), 255);
				});
				this.win._boxEdgeDetect = () => this.doc.querySelectorAll('.sb .box').forEach(box => Object.assign(box.style, { left: Math.max(Math.min(this.win.innerWidth - box.offsetWidth, box.offsetLeft), 0) + "px", top: Math.max(Math.min(this.win.innerHeight - box.offsetHeight, box.offsetTop), 0) + "px" }));
				this.win.addEventListener("resize", this.win._boxEdgeDetect);
			}
		}
		this.slp = ms => new Promise(r => setTimeout(r, ms));
		this.Servers = new Servers(ns, this);
		this.Debug = new DebugStuff(ns, this);
		this.Contracts = new Contracts(ns, this);
		this.Hacknet = new Hacknet(ns, this);
		this.StockMarket = new StockMarket(ns, this);
		this.ProcessList = new ProcessList(ns, this);
		this.Augmentations = new Augmentations(ns, this);
		this.Player = new Player(ns, this);
		this.Grafting = new Grafting(ns, this);
		// this.Corp = new Corp(ns, this);
		this.Jeekipedia = new Jeekipedia(ns, this);
		this.Casino = new Casino(ns, this);
		this.Bladeburner = new Bladeburner(ns, this); this.Bladeburner.raid=false; this.Bladeburner.sting=false;
		this.Sleeves = new Sleeves(ns, this);
	}
	css = `body{--prilt:#fd0;--pri:#fd0;--pridk:#fd0;--successlt:#ce5;--success:#ce5;--successdk:#ce5;--errlt:#c04;--err:#c04;--errdk:#c04;--seclt:#28c;--sec:#28c;--secdk:#28c;--warnlt:#f70;--warn:#f70;--warndk:#f70;--infolt:#3ef;--info:#3ef;--infodk:#3ef;--welllt:#146;--well:#222;--white:#fff;--black:#000;--hp:#c04;--money:#fc7;--hack:#ce5;--combat:#f70;--cha:#b8f;--int:#3ef;--rep:#b8f;--disabled:#888;--bgpri:#000;--bgsec:#111;--button:#146;--ff:"Lucida Console";overflow:hidden;display:flex}#root{flex:1 1 calc(100vw - 400px);overflow:scroll}.sb{font:12px var(--ff);color:var(--pri);background:var(--bgsec);overflow:hidden scroll;width:399px;min-height:100%;border-left:1px solid var(--welllt)}.sb *{vertical-align:middle;margin:0;font:inherit}.sb.c{width:45px}.sb.t, .sb.t>div{transition:height 200ms, width 200ms, color 200ms}.sbitem,.box{overflow:hidden;min-height:28px;max-height:90%}.sbitem{border-top:1px solid var(--welllt);resize:vertical;width:unset !important}.sbitem.c{color:var(--sec)}.box{position:fixed;width:min-content;min-width:min-content;resize:both;background:var(--bgsec)}.box.c{height:unset !important;width:unset !important;background:none}.head{display:flex;white-space:pre;font-weight:bold;user-select:none;height:28px;align-items:center}:is(.sb,.sbitem)>.head{direction:rtl;cursor:pointer;padding:3px 0px}.box>.head{background:var(--pri);color:var(--bgpri);padding:0px 3px;cursor:move}.body{font-size:12px;flex-direction:column;height:calc(100% - 31px)}.flex,:not(.noflex)>.body{display:flex}.flex>*,.body>*{flex:1 1 auto}.box>.body{border:1px solid var(--welllt)}.sb .title{margin:0 auto;font-size:14px;line-height:}.sbitem .close{display:none}.c:not(.sb),.c>.sbitem{height:28px !important;resize:none}.box.c>.body{display:none}.box.prompt{box-shadow:0 0 0 10000px #0007;min-width:400px}.box.prompt>.head>.icon{display:none}.sb .contextMenu{opacity:0.95;resize:none;background:var(--bgpri)}.sb .contextMenu .head{display:none}.sb .contextMenu .body{height:unset;border-radius:5px}.sb .icon{cursor:pointer;font:25px "codicon";line-height:0.9;display:flex;align-items:center}.sb .icon span{display:inline-block;font:25px -ff;width:25px;text-align:center}.sb .icon svg{height:21px;width:21px;margin:2px}:is(.sb,.sbitem)>.head>.icon{padding:0px 10px}.c>.head>.collapser{transform:rotate(180deg)}.sb :is(input,select,button,textarea){color:var(--pri);outline:none;border:none;white-space:pre}.sb :is(textarea,.log){white-space:pre-wrap;background:none;padding:0px;overflow-y:scroll}.sb :is(input,select){padding:3px;background:var(--well);border-bottom:1px solid var(--prilt);transition:border-bottom 250ms}.sb input:hover{border-bottom:1px solid var(--black)}.sb input:focus{border-bottom:1px solid var(--prilt)}.sb :is(button,input[type=checkbox]){background:var(--button);transition:background 250ms;border:1px solid var(--well)}.sb :is(button,input[type=checkbox]):hover{background:var(--bgsec)}.sb :is(button,input[type=checkbox]):focus, .sb select{border:1px solid var(--sec)}.sb button{padding:3px 6px;user-select:none}.sb .ts{color:var(--infolt)}.sb input[type=checkbox]{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px}.sb input[type=checkbox]:checked::after{font:22px codicon;content:""}.g2{display:grid;grid:auto-flow auto / auto auto;gap:6px;margin:5px;place-items:center}.g2>.l{justify-self:start}.g2>.r{justify-self:end}.g2>.f{grid-column:1 / span 2;text-align:center}.hidden, .tooltip{display:none}*:hover>.tooltip{display:block;position:absolute;left:-5px;bottom:calc(100% + 5px);border:1px solid var(--welllt);background:var(--bgsec);color:var(--pri);font:14px var(--ff);padding:5px;white-space:pre}.nogrow{flex:0 1 auto !important}`;
	win = globalThis;
	doc = this.win["document"];
	ts = () => `[<span class=ts>${new Date().toLocaleTimeString("en-gb")}</span>]`;
	elemFromHTML = html => new Range().createContextualFragment(html).firstElementChild;
	createItem = (title, content, icon, ...classes) => {
		let sidebar = this.doc.querySelector(".sb");
		let item = sidebar.appendChild(this.elemFromHTML(`<div class="${classes.join(" ")}"><div class="head"><a class="icon">${icon}</a><span class=title>${title}</span><a class="icon collapser">\ueab7</a><a class="icon close">\ueab8</a></div><div class="body">${content}</div></div>`));
		Object.assign(item, {
			head: item.querySelector(".head"),
			body: item.querySelector(".body"),
			toggleType: () => ["box", "sbitem"].forEach(cl => item.classList.toggle(cl)),
			logTarget: item.querySelector(".log"),
			log: (html, timestamp = true) => {
				if (!item.logTarget || !this.doc.contains(item.logTarget)) item.logTarget = item.body.appendChild(this.elemFromHTML("<div class=log></div>"));
				let logEntry = item.logTarget.appendChild(this.elemFromHTML(`<p>${timestamp ? this.ts() : ""} ${html}</p>`));
				item.logTarget.scrollTop = item.logTarget.scrollHeight;
				return logEntry;
			},
			recalcHeight: () => { item.style.height = ""; item.style.height = item.offsetHeight + "px" },
			contextItems: {},
			addContextItem: (name, fn, cFn = () => 1) => item.contextItems[name] = { fn: fn, cFn: cFn },
		});

		[["Remove Item", () => item["remove"]()],
		["Cancel", () => 0],
		["Float to Top", () => this.sidebar.querySelector(".head").insertAdjacentElement("afterEnd", item), () => item.classList.contains("sbitem")],
		["Sink to Bottom", () => this.sidebar.appendChild(item), () => item.classList.contains("sbitem")],
		["Toggle Type", () => item.toggleType()],
		["Recalculate Height", item.recalcHeight]].forEach(zargs => item.addContextItem(...zargs));

		item.addEventListener('mousedown', e => item.classList.contains("box") && Object.assign(item.style, { zIndex: this.zIndex() }));
		item.head.addEventListener('mousedown', e => {
			if (item.classList.contains("sbitem")) return e.button || this.transition(() => item.classList.toggle("c"));
			if (e.target.tagName === "A") return;
			let x = e.clientX, y = e.clientY, l = item.offsetLeft, t = item.offsetTop;
			let boxDrag = e => Object.assign(item.style, { left: Math.max(Math.min(this.win.innerWidth - item.offsetWidth, l + e.clientX - x), 0) + "px", top: Math.max(Math.min(this.win.innerHeight - item.offsetHeight, t + e.clientY - y), 0) + "px" });
			let boxDragEnd = e => this.doc.removeEventListener('mouseup', boxDragEnd) || this.doc.removeEventListener('mousemove', boxDrag);
			this.doc.addEventListener('mouseup', boxDragEnd) || this.doc.addEventListener('mousemove', boxDrag);
		});
		item.head.querySelector(".close").addEventListener('click', e => item["remove"]());
		item.head.querySelector(".collapser").addEventListener('click', e => item.classList.contains("box") && this.transition(() => item.classList.toggle("c") || this.win._boxEdgeDetect()));
		item.head.addEventListener("contextmenu", e => e.preventDefault() || this.contextMenu(item, e.clientX, e.clientY));
		Object.assign(item.style, { left: Math.floor(this.win.innerWidth / 2 - item.offsetWidth / 2) + "px", top: Math.floor(this.win.innerHeight / 2 - item.offsetHeight / 2) + "px", height: (item.offsetHeight || 200) + "px", width: (item.offsetWidth || 200) + "px", zIndex: this.zIndex() });
		return item;
	}
	createBox = (title, content, icon = "\uea74", ...classes) => this.createItem(title, content, icon, ...classes, "box");
	createSidebarItem = (title, content, icon = "\uea74", ...classes) => this.createItem(title, content, icon, ...classes, "sbitem");
	confirm = text => {
		let box = this.createBox("Confirmation Prompt", `<div class=g2><div class=f>${text}</div><button class=r><u>Y</u>es</button><button class=l><u>N</u>o</button></div>`, "", "prompt");
		box.querySelector("button").focus();
		box.addEventListener('keyup', e => (e.key.toLowerCase() === "y" && box.querySelector("button").click()) || (e.key.toLowerCase() === "n" && box.querySelectorAll("button")[1].click()));
		return new Promise(r => box.querySelectorAll("button").forEach((button, i) => button.addEventListener('click', () => box["remove"](r(i == 0)))));
	};
	prompt = text => {
		let box = this.createBox("Input Prompt", `<div class=g2><div class=f>${text}</div><input class=r /><button class=l>Submit</button></div>`, "", "prompt");
		box.querySelector("input").focus();
		box.querySelector("input").addEventListener('keyup', e => e.key == 'Enter' && box.querySelector("button").click());
		return new Promise(r => box.querySelector("button").addEventListener('click', () => box["remove"](r(box.querySelector("input").value))));
	};
	select = (text, options) => {
		let box = this.createBox("Selection Prompt", `<div class=g2><div class=f>${text}</div><select class=r>${options.map(option => `<option value="${option}">${option}</option>`).join("")}</select><button class=l>Submit</button></div>`, "", "prompt");
		box.querySelector("select").focus();
		return new Promise(r => box.querySelector("button").addEventListener('click', () => box["remove"](r(box.querySelector("select").value))));
	};
	alert = text => {
		let box = this.createBox("Alert Message", `<div class=g2><div class=f>${text}</div><button class=f>Ok</button></div>`, "", "prompt");
		box.querySelector("button").focus();
		return new Promise(r => box.querySelector("button").addEventListener('click', () => r(box["remove"]())));
	};
	contextMenu = (item, x, y) => {
		if (item.classList.contains("prompt")) return;
		let options = Object.entries(item.contextItems).filter(([name, entry]) => entry.cFn());
		let box = this.createBox("", `<div class=g2><div class=f>${item.querySelector(".title").innerText}.context</div>${options.map(([name, entry]) => `<button class=n>${name}</button>`).join("")}</div>`, "", "contextMenu");
		box.querySelector("button").focus();
		Object.assign(box.style, { left: Math.max(Math.min(this.win.innerWidth - box.offsetWidth / 2, x), box.offsetWidth / 2) + "px", top: Math.max(Math.min(this.win.innerHeight - box.offsetHeight / 2, y), box.offsetHeight / 2) + "px", transform: "translate(-50%, -50%)" });
		box.querySelectorAll("button").forEach(button => button.addEventListener("click", () => box["remove"](item.contextItems[button.innerText].fn())));
		box.addEventListener("mousedown", e => e.stopPropagation());
		let docFunction = () => box["remove"](this.doc.removeEventListener("mousedown", docFunction));
		setTimeout(() => this.doc.addEventListener("mousedown", docFunction), 10);
	};
	transition = fn => {
		let sidebar = this.doc.querySelector(".sb");
		sidebar.classList.add("t");
		fn();
		setTimeout(() => this.sidebar.classList["remove"]("t"), 200);
	}
	zIndex = () => Math.max(9000, ...[...this.doc.querySelectorAll(".sb .box")].map(box => box.style.zIndex)) + 1;

	get bitNodeN() {
		return (async () => {
			try {
				return (await (this.Player.bitNodeN));
			} catch (e) {
				return 1;
			}
		})();
	}
	async winGame() {
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
	async roulettestart() {
		return await roulettestart(this);
	}
	async bn7() {
		return await bn7(this);
	}
	async bn8() {
		return await bn8(this);
	}
	async bn8hackloop() {
		return await bn8hackloop(this);
	}
}
// Thanks to omuretsu
let slp = ms => new Promise(r => setTimeout(r, ms));
export let makeNewWindow = async (title = "Default Window Title", theme) => {
  let win = open("main.bundle.js", title.replaceAll(" ", "_"), "popup=yes,height=200,width=500,left=100,top=100,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no");
  let good = false;
  let doc = 0;
  while (!good) {
    await slp(1000);
    try {
      doc = win["document"];
      doc.head.innerHTML = "No.";
      good = true;
    } catch {
      good = false;
    }
  }
  doc.head.innerHTML = `
  <title>${title}</title>
  <style>
    *{
      margin:0;
    }
    body{
      background:` + theme['backgroundprimary'] + `;
      color:` + theme['primary'] + `;
      overflow:hidden;
      height:100vh;
      width:100vw;
      font-family: "Hack Regular Nerd Font Complete", "Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman";
      display:flex;
      flex-direction:column;
    }
    td{
      background:` + theme['backgroundsecondary'] + `;
      color:` + theme['primary'] + `;
      font-family: "Hack Regular Nerd Font Complete", "Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman";
    }
    a{
      color:` + theme['primary'] + `;
      font-family: "Hack Regular Nerd Font Complete", "Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman";
    }
    warning{
      color:` + theme['error'] + `;
      font-family: "Hack Regular Nerd Font Complete", "Lucida Console", "Lucida Sans Unicode", "Fira Mono", Consolas, "Courier New", Courier, monospace, "Times New Roman";
    }
    .title{
      font-size:20px;
      text-align:center;
      flex: 0 0;
      display:flex;
      align-items:center;
      border-bottom:1px solid white;
    }
    .scrollQuery{
      font-size:12px;
      margin-left:auto;
    }
    .logs{
      width:100%;
      flex: 1;
      overflow-y:scroll;
      font-size:14px;
    }
    .logs::-webkit-scrollbar,::-webkit-scrollbar-corner{
      background:` + theme['button'] + `;
      width:10px;
      height:10px;
    }
    .logs::-webkit-scrollbar-button{
      width:0px;
      height:0px;
    }
    .logs::-webkit-scrollbar-thumb{
      background:` + theme['primary'] + `;
    }
  </style>`;
  doc.body.innerHTML = `<div class=title>${title}</div><div class=logs><p></p></div>`;
  let logs = doc.body.querySelector(".logs");
  win.update = (content) => {
    logs.innerHTML = content;
  }
  win.reopen = () => open("main.bundle.js", title.replaceAll(" ", "_"), "popup=yes,height=200,width=500,left=100,top=100,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,directories=no,status=no");
  return win;
}
/* Worker Test Code
let workerCode = "postMessage(`I'm working before postMessage('ali').`); console.log('BOOTED'); onmessage = (event) => { postMessage(`Hi, ${event.data}`);};";

export async function main(ns) {
  var win=eval("window");
  var blob = new Blob([workerCode], {type: "application/javascript"});
  const myWorker = new Worker(URL.createObjectURL(blob));
  let data = [];
  myWorker.postMessage('ali');
  myWorker.onmessage = (event) => {
	data.push(`Worker said : ${event.data}`);
  };
  while (data.length == 0) {
	await ns.sleep(0);
  }
  ns.tprint(data.pop());
  while (data.length == 0) {
	await ns.sleep(0);
  }
  ns.tprint(data.pop());
} */

// https://discord.com/channels/415207508303544321/944647347625930762/1046962547582058496
// (()=>{let times=[],fn=(off)=>{if (times.length >= 100) {if (times.length == 100) {console.log(times.join("\n"))}; return}; let n=Date.now(); let m=n%4==off?4:8-(n-off)%4; times.push(off+","+m+","+n); setTimeout(fn, m, off)};[0,1,2,3].forEach(fn)})()
