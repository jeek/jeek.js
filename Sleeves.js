import { Do, DoAll } from "Do.js";
import { WholeGame } from "WholeGame.js";

export class Sleeves {
	constructor(ns, Game) {
		this.ns = ns;
		this.Game = Game ? Game : new WholeGame(ns);
		this.startingAGang = false;
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
	async startAGangFirst() {
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
        while (!done) {
			done = true;
			for (let i = 0 ; i < await (this.numSleeves) ; i++) {
				if ((await Do(this.ns, "ns.sleeve.getSleeve", i)).shock > 97.5) {
					for (let j = 0 ; j < await (this.numSleeves) ; j++) {
						done = false;
						await Do(this.ns, "ns.sleeve.setToShockRecovery", j);
					}
				}
			    while ((await Do(this.ns, "ns.sleeve.getSleeve", i)).shock > 97.5) {
					await this.ns.asleep(1000);
					try {
						await Do(this.ns, "ns.hacknet.spendHashes", "Improve Gym Training");
					} catch { };
				}
			}
		}
		done = false;
        while (!done) {
			done = true;
			for (let i = 0 ; i < await (this.numSleeves) ; i++) {
				if (.75 > await Do(this.ns, "ns.formulas.work.crimeSuccessChance", await Do(this.ns, "ns.sleeve.getSleeve", i), "Homicide")) {
					this.ns.tprint(i, " ", await Do(this.ns, "ns.formulas.work.crimeSuccessChance", await Do(this.ns, "ns.sleeve.getSleeve", i), "Homicide"));
					done = false;
					thresh += 10;
					await this.trainCombatStatsUpTo(thresh, true, true);
				}
			}
		}
		for (let i = 0 ; i < await (this.numSleeves) ; i++) {
		    await Do(this.ns, "ns.sleeve.setToCommitCrime", i, "Homicide");
		}
		while (-54000 > await Do(this.ns, "ns.heart.break")) {
            await this.ns.asleep(10000);
			this.ns.tprint("Karma: ", await Do(this.ns, "ns.heart.break"));
		}
		this.startingAGang = false;
		this.Game.Hacknet.goal = "Sell for Money";
		for (let i = 0 ; i < await (this.numSleeves) ; i++) {
			await Do(this.ns, "ns.sleeve.setToShockRecovery", i);
		}
	}
	async trainCombatStatsUpTo(goal, withSleeves = false, halfdexagi=false) {
		let didSomething = false;
		for (let stat of ["Strength", "Defense", "Dexterity", "Agility"]) {
			for (let i = 0 ; i < await (this.numSleeves) ; i++) {
				if ((halfdexagi && ["Dexterity", "Agility"].includes(stat) ? goal / 4 : goal) > ((await Do(this.ns, "ns.sleeve.getSleeve", i)).skills[stat.toLowerCase()])) {
					await (this.Game.Sleeves.trainWithMe(stat));
					await this.Game.Player.Gym(stat, "Powerhouse Gym", false);
					didSomething = true;
				}
				while ((halfdexagi && ["Dexterity", "Agility"].includes(stat) ? goal / 4 : goal) > ((await Do(this.ns, "ns.sleeve.getSleeve", i)).skills[stat.toLowerCase()])) {
	    			await this.ns.asleep(0);
					try {
						await Do(this.ns, "ns.hacknet.spendHashes", "Improve Gym Training");
					} catch { };
		    		didSomething = true;
			    }
			}
			await this.ns.asleep(1000);
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