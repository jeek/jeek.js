import { Do } from "Do.js";
import { jFormat } from "helpers.js";
import { WholeGame } from "WholeGame.js";

export class Hacknet {
	constructor(Game, goal = "") {
		this.ns = Game.ns;
		this.Game = Game;
		this.log = this.ns.tprint.bind(Game.ns);
		this.goal = goal;
		this.start = Date.now();
		if (this.ns.flags(cmdlineflags)['logbox']) {
			this.log = this.Game.sidebar.querySelector(".hacknetbox") || this.Game.createSidebarItem("Hacknet", "", "H", "hacknetbox");
			this.display = this.Game.sidebar.querySelector(".hacknetbox").querySelector(".display");
			this.log = this.log.log;
			this.displayUpdate();
		}
	}
	async displayUpdate() {
		while (this.ns.flags(cmdlineflags)['logbox']) {
			let result = "";
			let totalProd = 0;
			if ((await Do(this.ns, "ns.hacknet.numNodes")) > 0) {
				result += "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0 WIDTH=100%>";
				result += "<TH>id</TH><TH>level</TH><TH>ram</TH><TH>cores</TH><TH>cache</TH><TH>prod/s</TH></TR>";
				let rowData = {};
				for (let i = 0 ; i < await Do(this.ns, "ns.hacknet.numNodes") ; i++) {
					let mydata = await Do(this.ns, "ns.hacknet.getNodeStats", i);
                    let thisrow = "<TD ALIGN=CENTER>" + [mydata.level, mydata.ram, mydata.cores, mydata.cache, jFormat(mydata.production)].join("</TD><TD ALIGN=CENTER>") + "</TD>";
					totalProd += mydata.production;
					rowData[thisrow] = (rowData[thisrow] ?? []).concat([i]);
				}
				let rowSort = Object.keys(rowData).sort((a, b) => rowData[a][0] - rowData[b][0]);
				for (let row of rowSort) {
					result += "<TR><TD ALIGN=CENTER>" + rowData[row].join(" ") + "</TD>" + row + "</TR>";
				}
				result += "</TABLE>";
			}
			this.display.removeAttribute("hidden");
			let header = "<center><h2>hashes: " + jFormat(await Do(this.ns, "ns.hacknet.numHashes")) + "/" + jFormat(await Do(this.ns, "ns.hacknet.hashCapacity")) + "</h2>prod: " + jFormat(totalProd) + "/s</center><br>";
			let nextNodeCost = await Do(this.ns, "ns.hacknet.getPurchaseNodeCost");
			this.display.innerHTML = header + result + (nextNodeCost ? "next node: " + jFormat( nextNodeCost , "$") : "");
			this.Game.sidebar.querySelector(".hacknetbox").recalcHeight();
			await this.ns.asleep(10000);
		}
	}
	async loop() {
		while (this.goal == "" && (Date.now() - 60000 < this.start))
		    await this.ns.asleep(1000);
		if (this.goal == "") {
			this.goal = "Sell for Money";
		}
		while (true) {
			await this.ns.asleep(0);
			let hashes = Math.floor((await Do(this.ns, "ns.hacknet.numHashes", "")) / 4);
			if ((await(this.Game.Player.money)) < 0) {
				await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money", "", hashes);
			}
			if (await Do(this.ns, "ns.bladeburner.inBladeburner")) {
				if (await Do(this.ns, "ns.hacknet.spendHashes", "Exchange for Bladeburner Rank")) {
                    this.log("Spent hashes on Bladeburner Rank");
				}
				if (await Do(this.ns, "ns.hacknet.spendHashes", "Exchange for Bladeburner SP")) {
                    this.log("Spent hashes on Bladeburner SP");
				}
			}
			if (await Do(this.ns, "ns.corporation.hasCorporation")) {
				if (await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Corporation Funds")) {
                    this.log("Spent hashes on Corp Funds");
				}
				if (await Do(this.ns, "ns.hacknet.spendHashes", "Exchange for Corporation Research")) {
                    this.log("Spent hashes on Corp Research");
				}
			}

		    if (this.Game.Sleeves.startingAGang) {
				if (await Do(this.ns, "ns.hacknet.spendHashes", "Improve Gym Training")) {
                    this.log("Spent hashes on Improve Gym Training");
				}
			}
			let currentWork = await Do(this.ns, "ns.singularity.getCurrentWork");
			if (Object.keys(currentWork).includes("companyName")) {
				if (await Do(this.ns, "ns.hacknet.spendHashes", "Company Favor", currentWork["companyName"])) {
					this.log("5 Favor for " + currentWork["companyName"]);
				}
			}
			if (await Do(this.ns, "ns.hacknet.spendHashes", "Generate Coding Contract")) {
				this.log("Generated a Contract");
			}
			//    		// Pay for yourself, Hacknet
//    		if (!this.Game.Sleeves.startingAGang) {
//	    		if ((await Do(this.ns, "ns.getMoneySources")).sinceInstall.hacknet_expenses < -1e9) {
//		    		if (0 > ((await Do(this.ns, "ns.getMoneySources")).sinceInstall['hacknet']) + ((await Do(this.ns, "ns.getMoneySources")).sinceInstall.hacknet_expenses)) {
//			    		if (4 <= (await Do(this.ns, "ns.hacknet.numHashes", ""))) {
//				    		let poof = Math.floor((await Do(this.ns, "ns.hacknet.numHashes", "")) / 4);
//					    	await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money", "", poof);
//					    }
//					}
//				}
//			}
			//if (((await Do(this.ns, "ns.getMoneySources")).sinceInstall.hacknet_expenses >= -1e9) || (0 <= ((await Do(this.ns, "ns.getMoneySources")).sinceInstall['hacknet']) + ((await Do(this.ns, "ns.getMoneySources")).sinceInstall.hacknet_expenses))) {
				let didSomething = true;
				let mults = (await Do(this.ns, "ns.getPlayer", "")).mults.hacknet_node_money;
				while (didSomething) {
					didSomething = false;
					let shoppingCart = [[(await Do(this.ns, "ns.hacknet.getPurchaseNodeCost")) / (this.ns.formulas.hacknetServers.hashGainRate(1, 0, 1, 1, mults)), await Do(this.ns, "ns.hacknet.getPurchaseNodeCost"), "ns.hacknet.purchaseNode"]];
					if ((await Do(this.ns, "ns.hacknet.getPurchaseNodeCost")) == null) {
						shoppingCart.shift();
					}
					for (let i = 0; i < await Do(this.ns, "ns.hacknet.numNodes"); i++) {
						let current = await Do(this.ns, "ns.hacknet.getNodeStats", i);
						shoppingCart.push([this.ns.formulas.hacknetServers.ramUpgradeCost(current.ram, 1, mults.hacknet_node_ram_cost) / ((this.ns.formulas.hacknetServers.hashGainRate(current.level, 0, current.ram * 2, current.cores, mults) - (this.ns.formulas.hacknetServers.hashGainRate(current.level, 0, current.ram, current.cores, mults)))), this.ns.formulas.hacknetServers.ramUpgradeCost(current.ram, 1, mults.hacknet_node_ram_cost), "ns.hacknet.upgradeRam", i]);
						shoppingCart.push([this.ns.formulas.hacknetServers.coreUpgradeCost(current.cores, 1, mults.hacknet_node_core_cost) / ((this.ns.formulas.hacknetServers.hashGainRate(current.level, 0, current.ram, current.cores + 1, mults) - (this.ns.formulas.hacknetServers.hashGainRate(current.level, 0, current.ram, current.cores, mults)))), this.ns.formulas.hacknetServers.coreUpgradeCost(current.cores, 1, mults.hacknet_node_core_cost), "ns.hacknet.upgradeCore", i]);
						shoppingCart.push([this.ns.formulas.hacknetServers.levelUpgradeCost(current.level, 1, mults.hacknet_node_core_cost) / ((this.ns.formulas.hacknetServers.hashGainRate(current.level + 1, 0, current.ram, current.cores, mults) - (this.ns.formulas.hacknetServers.hashGainRate(current.level, 0, current.ram, current.cores, mults)))), this.ns.formulas.hacknetServers.levelUpgradeCost(current.level, 1, mults.hacknet_node_core_cost), "ns.hacknet.upgradeLevel", i]);
					}
					let nodes = (await Do(this.ns, "ns.hacknet.numNodes")) ** 2;
					if (nodes < 1) {
						nodes = 1;
					}
					let currentMoney = await Do(this.ns, "ns.getServerMoneyAvailable", "home") / nodes;
					shoppingCart = shoppingCart.filter(x => x[1] <= currentMoney);
					shoppingCart = shoppingCart.filter(x => x[1] != null);
					shoppingCart = shoppingCart.sort((a, b) => { return a[0] - b[0]; });
					if (shoppingCart.length > 0) {
						this.log(shoppingCart[0].slice(2).join(" "));
						await Do(this.ns, ...(shoppingCart[0].slice(2))); //FFIGNORE
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
				while ((await Do(this.ns, "ns.hacknet.numHashes")) * 2 > (await Do(this.ns, "ns.hacknet.hashCapacity"))) {
					if (await Do(this.ns, "ns.hacknet.spendHashes", "Sell for Money"))
						this.log("Sold four hashes for cash.");
				}
		//	}
		}
	}
}
