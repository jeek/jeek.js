import { levenshteinDistance } from "helpers.js";

export class Jeekipedia {
	constructor(ns, Game) {
		this.ns = ns;
		this.Game = Game ? Game : new WholeGame(ns);
	}
	async lookup(functionName) {
		this.ns.iKnowWhatImDoing();
		let lookupData = functionName.split(".");
		lookupData[1] = (Object.keys(this.Game).map(x => [levenshteinDistance(x, lookupData[1]), x]).sort((a, b) => a[0] - b[0]))[0][1]
		if (Object.keys(this.Game).includes(lookupData[1])) {
            if (Object.keys(this.Game[lookupData[1]]).includes("doc")) {
				lookupData[2] = (Object.keys(this.Game[lookupData[1]].doc).map(x => [levenshteinDistance(x, lookupData[2]), x]).sort((a, b) => a[0] - b[0]))[0][1]
				eval('window').tprintRaw(await this.render(this.Game[lookupData[1]]['doc'][lookupData[2]]));
				this.ns.exit();
				return;
			}
		}
		this.ns.exit();
	}
	async render(text) {
		let result = [];
		for (let line of text.split("\n")) {
			let didSomething = false;
			if (line.slice(0, 2) === "# ") {
				result.push(React.createElement("h1", {}, line.slice(2)))
				didSomething = true;
			}
			if (line.slice(0, 3) === "## ") {
				result.push(React.createElement("h2", {}, line.slice(3)))
				didSomething = true;
			}
			if (line.slice(0, 4) === "### ") {
				result.push(React.createElement("h3", {}, line.slice(4)))
				didSomething = true;
			}
			if (line === "---") {
				result.push(React.createElement("hr", {}, ""));
				didSomething = true;
			}
			if (line.slice(0, 2) === "> ") {
				result.push(React.createElement("blockquote", {}, line.slice(2)))
				didSomething = true;
			}
			if (line.slice(0, 1) === "`" && line.slice(line.length-2, 1) === "`") {
				result.push(React.createElement("table", {border: 1}, React.createElement("tr", {}, React.createElement("td", {}, line.slice(1, line.length-2)))));
				didSomething = true;
			}
			if (!didSomething) {
				result.push(React.createElement("span", {}, line));
			}
		}
		return React.createElement("span", {}, result);
	}
}
