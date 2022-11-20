export class Hacknet {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
	}
	async loop(goal = "Sell for Money") {
		while ((4 <= (await Do(this.ns, 'ns.hacknet.numHashes', ''))) && ((await (this.game.Player.money)) < 1000000 * Math.floor((await Do(this.ns, 'ns.hacknet.numHashes', '')) / 4))) {
			await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money");
		}
		if (goal == "Sell for Money") {
			await Do(this.ns, "ns.hacknet.spendHashes", goal, "", Math.floor((await Do(this.ns, 'ns.hacknet.numHashes', '')) / 4));
		} else {
			while (await Do(this.ns, "ns.hacknet.spendHashes", goal));
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
				this.ns.tprint(shoppingCart[0]);
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
		if (goal == "Sell for Money") {
			await Do(this.ns, "ns.hacknet.spendHashes", goal, "", Math.floor((await Do(this.ns, 'ns.hacknet.numHashes', '')) / 4));
		} else {
			while (await Do(this.ns, "ns.hacknet.spendHashes", goal));
		}
	}
}
