import { Do, DoAll, DoAllComplex } from "Do.js";
import { makeNewWindow } from "Windows.js";
import { WholeGame } from "WholeGame.js";
import { CITIES } from "data.js";

export class Bladeburner {
	constructor(Game, settings = {}) {
		this.ns = Game.ns;
		this.settings = settings;
		this.raid = Object.keys(this.settings).includes("raid") ? this.settings.raid : true;
		this.sting = Object.keys(this.settings).includes("sting") ? this.settings.string : true;
		this.maxChaos = Object.keys(this.settings).includes("maxChaos") ? this.settings.maxChaos : 30;
		this.minStamina = Object.keys(this.settings).includes("minStamina") ? this.settings.minStamina : .6;
		this.maxStamina = Object.keys(this.settings).includes("maxStamina") ? this.settings.maxStamina : .9;
		this.Game = Game;
		this.log = this.ns.tprint.bind(this.ns);
		if (this.ns.flags(cmdlineflags)['logbox']) {
			this.log = this.Game.sidebar.querySelector(".bladebox") || this.Game.createSidebarItem("Bladeburner", "", "B", "bladebox");
			this.log = this.log.log;
		}
		this.bbTypes = {};
		(async () => {
			while (!await Do(this.ns, "ns.bladeburner.joinBladeburnerDivision")) {
				await this.ns.asleep(100);
			}
			(await Do(this.ns, "ns.bladeburner.getBlackOpNames")).forEach(x => this.bbTypes[x] = "Black Op");
		})();
		(async () => {
			while (!await Do(this.ns, "ns.bladeburner.joinBladeburnerDivision")) {
				await this.ns.asleep(100);
			}
			(await Do(this.ns, "ns.bladeburner.getOperationNames")).forEach(x => this.bbTypes[x] = "Operation");
		})();
		(async () => {
			while (!await Do(this.ns, "ns.bladeburner.joinBladeburnerDivision")) {
				await this.ns.asleep(100);
			}
			(await Do(this.ns, "ns.bladeburner.getContractNames")).forEach(x => this.bbTypes[x] = "Contract");
		})();
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
    async ['getActionAutolevel'](name) {
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		return await Do(this.ns, "ns.bladeburner.getActionAutoLevel", this.bbTypes[name], name);
	}
    async ['getActionCountRemaining'](name) {
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		return await Do(this.ns, "ns.bladeburner.getActionCountRemaining", this.bbTypes[name], name);
	}
	async getChance(name) {
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		return await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", this.bbTypes[name], name);
	}
	async maxLevel(name) {
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		return await Do(this.ns, "ns.bladeburner.getActionMaxLevel", this.bbTypes[name], name);
	}
	async setLevel(name, level) {
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		return await Do(this.ns, "ns.bladeburner.setActionLevel", this.bbTypes[name], name, level);
	}
	async fieldAnal() {
		return await Do(this.ns, "ns.bladeburner.startAction", "General", "Field Analysis");
	}
	async start() {
		return await Do(this.ns, "ns.bladeburner.joinBladeburnerDivision");
	}
	async successChance(op) {
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		if (op != 0 && op != "")
    		return await Do(this.ns, "ns.bladeburner.getActionEstimatedSuccessChance", this.bbTypes[op], op);
		return 0;
	}
	async teamSize(op, size) {
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		if (op != 0 && op != "")
		    return await Do(this.ns, "ns.bladeburner.setTeamSize", this.bbTypes[op], op, size);
		return false;
	}
	async setAutoLevel(op, level) {
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		return await Do(this.ns, "ns.bladeburner.setActionAutolevel", this.bbTypes[op], op, level);
	}
	async actionStart(op) {
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		return await Do(this.ns, "ns.bladeburner.startAction", this.bbTypes[op], op);
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
				return await (this.Game.Player.hasAug("The Blade's Simulacrum"));
			} catch (e) {
				return false;
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
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		return await Do(this.ns, "ns.bladeburner.getActionRepGain", this.bbTypes[action], action, level);
	}
	async bbActionTime(action) {
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		return await Do(this.ns, "ns.bladeburner.getActionTime", this.bbTypes[action], action);
	}
	async bbActionCount(action) {
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		return await Do(this.ns, "ns.bladeburner.getActionCountRemaining", this.bbTypes[action], action);
	}
	async inciteViolence() {
		let city = Object.entries(await DoAll(this.ns, "ns.bladeburner.getCityEstimatedPopulation", CITIES)).sort((a, b) => b[1] - a[1])[0][0]
		this.log("Inciting Violence in " + city);
		await Do(this.ns, "ns.bladeburner.switchCity", city);
		await this.Game.Sleeves.bbEverybody("Infiltrate synthoids");
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
			await this.Game.Sleeves.bbEverybody("Hyperbolic Regeneration Chamber")
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
			await this.Game.Sleeves.bbEverybody("Diplomacy");
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
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		return await Do(this.ns, "ns.bladeburner.getActionCountRemaining", this.bbTypes[op], op);
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
	async joinTheFaction() {
		return await Do(this.ns, "ns.bladeburner.joinBladeburnerFaction");
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
        while (Object.keys(this.bbTypes).length == 0)
		    await this.ns.asleep(0);
		return await Do(this.ns, "ns.bladeburner.getActionMaxLevel", this.bbTypes[op], op);
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
			await this.ns.asleep(1000);
			return;
		}
		let myrank = await Do(this.ns, "ns.bladeburner.getRank");
		let mycity = await Do(this.ns, "ns.bladeburner.getCity");
		let answer = "<TABLE WIDTH=100%><TR VALIGN=TOP><TD WIDTH=50%>";
		answer += "<H1>Rank: " + Math.floor(.5 + myrank).toString() + "<BR>";
		answer += "City: " + mycity + "<BR>";
		let chaos = await Do(this.ns, "ns.bladeburner.getCityChaos", mycity);
		answer += "Chaos: " + "<FONT COLOR=" + this.ns.ui.getTheme()[chaos < 40 ? 'success' : (chaos < 50 ? 'warning' : 'error')] + ">" + jFormat(chaos) + "</FONT><BR>";
		answer += "Communities: " + (await Do(this.ns, "ns.bladeburner.getCityCommunities", mycity)).toString() + "<BR>";
		answer += "Estimated Population: " + jFormat(await Do(this.ns, "ns.bladeburner.getCityEstimatedPopulation", mycity)) + "</H1></TD><TD><H1>";

		if (0 < await (this.Game.Sleeves.numSleeves)) {
			answer += "Sleeves:<BR>";
					let wildcard = true;
					for (let i = 0; i < await (this.Game.Sleeves.numSleeves); i++) {
						try {
							if (((await Do(this.ns, "ns.sleeve.getTask", i)).actionName) != ((await Do(this.ns, "ns.sleeve.getTask", 0))).actionName)
								wildcard = false;
						} catch { }
					}
					if (wildcard) {
						for (let i = 0; i < 1; i++) {
								let z = (await Do(this.ns, "ns.sleeve.getTask", i));
								if (null != z) {
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
						for (let i = 0; i < await (this.Game.Sleeves.numSleeves); i++) {
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
			if (0 == (await Do(this.ns, "ns.bladeburner.getActionCountRemaining", "Black Op", op))) {
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
		await this.ns.asleep(1000);
	}
}
