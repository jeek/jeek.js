import { Office } from "Office.js";

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
