import { Do, DoAll } from "Do.js";
import { WholeGame } from "WholeGame.js";

export class Sleeves {
	constructor(ns, Game) {
		this.ns = ns;
		this.Game = Game ? Game : new WholeGame(ns);
		this.startingAGang = false;
		if (this.ns.flags(cmdlineflags)['logbox']) {
			this.log = this.Game.sidebar.querySelector(".sleevelog") || this.Game.createSidebarItem("Sleeves", "", "S", "sleevelog");
			this.display = this.Game.sidebar.querySelector(".sleevelog").querySelector(".display");
			this.log = this.log.log;
		}
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
	async SleeveInfoLog() {
		while (true) {
			let result = "<TABLE BORDER=1 CELLSPACING=0 WIDTH=100% CELLPADDING=0><TR><th>id</th><th>hack</th><th>str</th><th>def</th><th>dex</th><th>agi</th><th>int</th><th>shk</th></tr>";
			if (this.ns.flags(cmdlineflags)['logbox']) {
				let rowData = {};
				for (let i = 0; i < await (this.numSleeves); i++) {
					let me = await Do(this.ns, "ns.sleeve.getSleeve", i);
					let task = "";
					try { task = Object.values(await Do(this.ns, "ns.sleeve.getTask", i)).join(" / ") } catch { };
					let thisRow = "<TD ALIGN=CENTER>" + [me.skills.hacking.toString(), me.skills.strength.toString(), me.skills.defense.toString(), me.skills.dexterity.toString(), me.skills.agility.toString(), me.skills.intelligence.toString(), Math.ceil(me.shock).toString()].join("</TD><TD ALIGN=CENTER>") + "</TD></TR><TR><TD COLSPAN=7>" + task + "</TD></TR>";
					rowData[thisRow] = (rowData[thisRow] ?? []).concat([i]);
				}
				let rowSort = Object.keys(rowData).sort((a, b) => rowData[a][0] - rowData[b][0]);
				for (let row of rowSort) {
					result += "<TR><TD ALIGN=CENTER ROWSPAN=2>" + rowData[row].join(" ") + "</TD>" + row + "</TR>";
				}
				this.display.removeAttribute("hidden");
				this.display.innerHTML = result + "</TABLE>"
				this.Game.sidebar.querySelector(".sleevelog").recalcHeight();
				await this.ns.asleep(10000);
			} else {
				await this.ns.asleep(123456789);
			}
		}
	}
	async trainWithMe(stat) {
		for (let i = 0; i < await (this.numSleeves); i++) {
			await Do(this.ns, "ns.sleeve.travel", i, "Sector-12");
			await Do(this.ns, "ns.sleeve.setToGymWorkout", i, "Powerhouse Gym", stat);
		}
	}
	async startAGangFirst() {
		this.log("Starting a Gang")
		this.startingAGang = true;
		this.Game.Hacknet.goal = "Improve Gym Training";
		let thresh = 0;
		if (this.Game.bitNodeN == 2) {
			return;
		}
		if (0 == await (this.numSleeves)) {
			return;
		}
		let done = false;
		this.log("Shock Recovery...")
		while (!done) {
			done = true;
			for (let i = 0; i < await (this.numSleeves); i++) {
				if ((await Do(this.ns, "ns.sleeve.getSleeve", i)).shock > 90) {
					for (let j = 0; j < await (this.numSleeves); j++) {
						done = false;
						Do(this.ns, "ns.sleeve.setToShockRecovery", j);
					}
				}
				while ((await Do(this.ns, "ns.sleeve.getSleeve", i)).shock > 90) {
					done = false;
					await this.ns.asleep(1000);
				}
			}
		}
		done = false;
		while (!done) {
			done = true;
			for (let i = 0; i < await (this.numSleeves); i++) {
				if (.75 > await Do(this.ns, "ns.formulas.work.crimeSuccessChance", await Do(this.ns, "ns.sleeve.getSleeve", i), "Homicide")) {
					this.log(i.toString() + " Success Rate: " + (await Do(this.ns, "ns.formulas.work.crimeSuccessChance", await Do(this.ns, "ns.sleeve.getSleeve", i), "Homicide")).toString() + " ");
					done = false;
					thresh += 10;
					this.log("Raising threshold to: " + thresh.toString());
					await this.trainCombatStatsUpTo(thresh, true, true);
				}
			}
		}
		this.startingAGang = false;
		for (let i = 0; i < await (this.numSleeves); i++) {
			await Do(this.ns, "ns.sleeve.setToCommitCrime", i, "Homicide");
		}
		while (-54000 < await Do(this.ns, "ns.heart.break")) {
			await this.ns.asleep(10000);
			this.log("Homiciding, Karma: " + (await Do(this.ns, "ns.heart.break")).toString());
		}
		this.Game.Hacknet.goal = "Sell for Money";
		this.log("You have -54000 Karma. Start a Gang.");
		for (let i = 0; i < await (this.numSleeves); i++) {
			await Do(this.ns, "ns.sleeve.setToShockRecovery", i);
		}
	}
	async trainCombatStatsUpTo(goal, withSleeves = false, halfdexagi = false) {
		this.log("Training Player stats up to " + goal.toString());
		let didSomething = false;
		for (let stat of ["Strength", "Defense", "Dexterity", "Agility"]) {
			for (let i = 0; i < await (this.numSleeves); i++) {
				if ((halfdexagi && ["Dexterity", "Agility"].includes(stat) ? goal / 4 : goal) > ((await Do(this.ns, "ns.sleeve.getSleeve", i)).skills[stat.toLowerCase()])) {
					(this.Game.Sleeves.trainWithMe(stat));
					this.Game.Player.Gym(stat, "Powerhouse Gym", false);
					didSomething = true;
				}
				while ((halfdexagi && ["Dexterity", "Agility"].includes(stat) ? goal / 4 : goal) > ((await Do(this.ns, "ns.sleeve.getSleeve", i)).skills[stat.toLowerCase()])) {
					await this.ns.asleep(0);
					didSomething = true;
				}
			}
		}
		if (withSleeves) {
			await this.Game.Sleeves.deShock();
		}
		return didSomething;
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
					this.log("Sleeve " + i.toString() + " got " + aug)
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
		for (let i = 0; i < await (this.Game.Sleeves.numSleeves); i++) {
			await this.bbDo(i, action, contract);
		}
	}
}