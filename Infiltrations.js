import { Do } from "Do.js";

export class Infiltrations {
    constructor(ns, Game, settings = {}) {
        this.ns = ns;
        this.Game = Game ? Game : new WholeGame(ns);
        this.settings = settings;
    }
    get ['getPossibleLocations']() {
        return (async () => {
			try {
				return await Do(this.ns, "ns.infiltration.getPossibleLocations");
			} catch (e) {
				return [];
			}
		})();
    }
    async ['getInfiltration'](location) {
        return await Do(this.ns, "this.infiltration.getInfiltration", location);
    }
}