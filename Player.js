import { Do } from "Do.js";

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
			while (hp.current / hp.max < 1) {
				await Do(this.ns, "ns.singularity.hospitalize");
				hp = (await Do(this.ns, "ns.getPlayer")).hp;
			}
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
				return (await Do(this.ns, "ns.getPlayer").bitNodeN);
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
			await this.ns.sleep(1000);
		}
		if (withSleeves) {
			await this.game.Sleeves.deShock();
		}
		return didSomething;
	}
}
