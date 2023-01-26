import { Do } from "Do.js";
import { WholeGame } from "WholeGame.js";

export class Hacknet {
	constructor(ns, game, goal = "") {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
		this.log = ns.tprint.bind(ns);
		this.goal = goal;
		this.start = Date.now();
		if (ns.flags(cmdlineflags)['logbox']) {
			this.log = this.game.sidebar.querySelector(".hacknetbox") || this.game.createSidebarItem("Hacknet", "", "H", "hacknetbox");
			this.log = this.log.log;
		}
	}
	async loop() {
		while (this.goal == "" && (Date.now() - 60000 < this.start))
		    await this.ns.asleep(1000);
		if (this.goal == "") {
			this.goal = "Sell for Money";
		}
		while (true) {
			if (this.goal == "Sell for Money") {
				await Do(this.ns, "ns.hacknet.spendHashes", this.goal, "", Math.floor((await Do(this.ns, 'ns.hacknet.numHashes', '')) / 4));
				this.log("Spent hashes for cash")
			} else {
				while (await Do(this.ns, "ns.hacknet.spendHashes", this.goal))
					this.log("Spent hashes on " + this.goal);
			}
		// Pay for yourself, Hacknet
			if ((await Do(this.ns, "ns.getMoneySources")).sinceInstall.hacknet_expenses < -1e9) {
				if (0 > ((await Do(this.ns, "ns.getMoneySources")).sinceInstall.hacknet) + ((await Do(this.ns, "ns.getMoneySources")).sinceInstall.hacknet_expenses)) {
					if (4 <= (await Do(this.ns, 'ns.hacknet.numHashes', ''))) {
						let poof = Math.floor((await Do(this.ns, 'ns.hacknet.numHashes', '')) / 4);
						await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money", "", poof);
					}
				}
			}
			if (((await Do(this.ns, "ns.getMoneySources")).sinceInstall.hacknet_expenses >= -1e9) || (0 <= ((await Do(this.ns, "ns.getMoneySources")).sinceInstall.hacknet) + ((await Do(this.ns, "ns.getMoneySources")).sinceInstall.hacknet_expenses))) {
				//		while ((4 <= (await Do(this.ns, 'ns.hacknet.numHashes', ''))) && ((await (this.game.Player.money)) < 1000000 * Math.floor((await Do(this.ns, 'ns.hacknet.numHashes', '')) / 4))) {
				//			await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money");
				//		}
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
				if (this.goal == "Sell for Money") {
					let poof = Math.floor((await Do(this.ns, 'ns.hacknet.numHashes', '')) / 4);
					await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money", "", poof);
				} else {
					while (await Do(this.ns, "ns.hacknet.spendHashes", this.goal))
						this.log("Spent hashes on " + this.goal);
				}
			}
		}
	}
}
