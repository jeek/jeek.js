import { Division } from "Division.js";

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
