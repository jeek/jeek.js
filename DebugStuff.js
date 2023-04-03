import { WholeGame } from "WholeGame.js";

export class DebugStuff {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
		/*
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
		*/
	}
/*	startCorp(corpName) {
		this.player.startCorporation(corpName);
	}
	async endlessAss() {
		while (true) {
			for (let op of await(this.game.Bladeburner.opNames)) {
				this.player.bladeburner.operations[op].count = this.player.bladeburner.operations[op].count < 10 ? 10 : this.player.bladeburner.operations[op].count;
			}
			for (let contract of await(this.game.Bladeburner.contractNames)) {
				this.player.bladeburner.contracts[contract].count = this.player.bladeburner.contracts[contract].count < 10 ? 10 : this.player.bladeburner.contracts[contract].count;
			}
		}
	}


	// Dev menu
	/** @param {NS} ns *
export async function main(ns) {
    const orig = React.createElement;
    const origState = React.useState;
    let stateCalls = 0;
    let resolve;
    const wrapState = function (...args) {
        stateCalls++;
        const state = origState.call(this, ...args);
        // The 2nd useState returns the page
        if (stateCalls === 2) {
            resolve(state);
            React.useState = origState;
        }
        return state;
    }
    React.createElement = function (...args) {
        const fn = args[0];
        if (typeof fn === "function" &&
            String(fn).includes("Trying to go to a page without the proper setup")) {
            React.createElement = orig;
            // Perform next-level hooking
            const wrapped = function (...args_) {
                React.useState = wrapState;
                return fn.call(this, ...args_);
            }
            return orig.call(this, wrapped, ...args.slice(1));
        }
        return orig.call(this, ...args);
    }
    const resultP = Promise.race([
        new Promise((res) => resolve = res),
        ns.asleep(5000)])
        .finally(() => {
            React.createElement = orig;
            React.useState = origState;
        });
    // Force a rerender
    ns.ui.setTheme(ns.ui.getTheme());
    const [state, setState] = await resultP;
    setState(typeof state === "string" ? "Dev" : 8);
}
*/
}
