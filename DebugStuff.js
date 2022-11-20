import { WholeGame } from "WholeGame.js";

export class DebugStuff {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
		const objects = [];
		const payload_id = "payload" + String(Math.trunc(performance.now()));
		globalThis.webpackJsonp.push([payload_id, {
			[payload_id]: function (_e, _t, require) {
				for (const module of (Object.values(require.c))) {
					for (const object of Object.values(module?.exports ?? {})) {
						objects.push(object);
					}
				}
			}
		}, [[payload_id]]]);
		for (const obj of objects) {
			if (!this.player && typeof obj.whoAmI === "function" && obj.whoAmI() === "Player") {
				this.player = obj;
				break;
			}
		}
	}
	startCorp(corpName) {
		this.player.startCorporation(corpName);
	}
}
