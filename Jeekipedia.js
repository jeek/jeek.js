export class Jeekipedia {
	constructor(ns, Game) {
		this.ns = ns;
		this.Game = Game ? Game : new WholeGame(ns);
	}
	async lookup(functionName) {
		this.ns.iKnowWhatImDoing();
		let lookupData = functionName.split(".");
		if (Object.keys(this.Game).includes(lookupData[1])) {
            if (Object.keys(this.Game[lookupData[1]].includes("doc"))) {
				eval('window').tprintRaw(this.render(this.Game[lookupData[1]].doc[lookupData[2]]));
				return;
			}
		}
	}
	async render(text) {
		return React.createElement("span", {}, text);
	}
}
