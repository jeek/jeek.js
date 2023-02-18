import { Do, DoAll } from "Do.js";
import { makeNewWindow } from "Windows.js";
import { WholeGame } from "WholeGame.js";

export class Servers {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
		this.serverlist = ["home", "n00dles", "foodnstuff", "sigma-cosmetics", "joesguns", "hong-fang-tea", "harakiri-sushi", "iron-gym", "CSEC", "zer0", "nectar-net", "max-hardware", "phantasy", "neo-net", "omega-net", "silver-helix", "netlink", "crush-fitness", "computek", "johnson-ortho", "the-hub", "avmnite-02h", "rothman-uni", "I.I.I.I", "syscore", "summit-uni", "catalyst", "zb-institute", "aevum-police", "lexo-corp", "alpha-ent", "millenium-fitness", "rho-construction", "aerocorp", "global-pharm", "galactic-cyber", "snap-fitness", "omnia", "unitalife", "deltaone", "univ-energy", "zeus-med", "solaris", "defcomm", "icarus", "infocomm", "zb-def", "nova-med", "taiyang-digital", "titan-labs", "microdyne", "applied-energetics", "run4theh111z", "stormtech", "fulcrumtech", "helios", "vitalife", "omnitek", "kuai-gong", "4sigma", ".", "powerhouse-fitness", "nwo", "b-and-a", "blade", "clarkinc", "ecorp", "The-Cave", "megacorp", "fulcrumassets"];
		["home", "n00dles", "foodnstuff", "sigma-cosmetics", "joesguns", "hong-fang-tea", "harakiri-sushi", "iron-gym", "CSEC", "zer0", "nectar-net", "max-hardware", "phantasy", "neo-net", "omega-net", "silver-helix", "netlink", "crush-fitness", "computek", "johnson-ortho", "the-hub", "avmnite-02h", "rothman-uni", "I.I.I.I", "syscore", "summit-uni", "catalyst", "zb-institute", "aevum-police", "lexo-corp", "alpha-ent", "millenium-fitness", "rho-construction", "aerocorp", "global-pharm", "galactic-cyber", "snap-fitness", "omnia", "unitalife", "deltaone", "univ-energy", "zeus-med", "solaris", "defcomm", "icarus", "infocomm", "zb-def", "nova-med", "taiyang-digital", "titan-labs", "microdyne", "applied-energetics", "run4theh111z", "stormtech", "fulcrumtech", "helios", "vitalife", "omnitek", "kuai-gong", "4sigma", ".", "powerhouse-fitness", "nwo", "b-and-a", "blade", "clarkinc", "ecorp", "The-Cave", "megacorp", "fulcrumassets"].map(x => this[x] = new Server(ns, x, game));
	}
	async pop_them_all() {
		let result = [];
		for (let program of [
			["BruteSSH.exe", "ns.brutessh"],
			["FTPCrack.exe", "ns.ftpcrack"],
			["relaySMTP.exe", "ns.relaysmtp"],
			["HTTPWorm.exe", "ns.httpworm"],
			["SQLInject.exe", "ns.sqlinject"]]) {
			if (await Do(this.ns, "ns.singularity.purchaseTor", "")) {
				let cost = await Do(this.ns, "ns.singularity.getDarkwebProgramCost", program[0]);
				if ((0 < cost) && (cost < ((await Do(this.ns, "ns.getPlayer", "")).money))) {
					await Do(this.ns, "ns.singularity.purchaseProgram", program[0]);
				}
			}
			if ((await Do(this.ns, "ns.ls", "home")).includes(program[0])) {
				for (let server of await this.serverlist) { //FFIGNORE
					await Do(this.ns, program[1], server); //FFIGNORE
				}
			}
		}
		for (let server of await (this.serverlist)) {
			if ((await Do(this.ns, "ns.getServer", server)).openPortCount >= (await Do(this.ns, "ns.getServerNumPortsRequired", server))) {
				await Do(this.ns, "ns.nuke", server);
			}
			if (await Do(this.ns, "ns.hasRootAccess", server)) {
				result.push(server);
			}
		}
		return result;
	}
	async buyDubs() {
		let servers = await Do(this.ns, "ns.getPurchasedServers", "");
		let maxRam = await Do(this.ns, "ns.getPurchasedServerMaxRam", "");
		if (servers.length == await Do(this.ns, "ns.getPurchasedServerLimit", "")) {
		    if (maxRam > await Do(this.ns, "ns.getServerMaxRam", servers[0])) {
				if ((await (this.game.Player.money)) > (await Do(this.ns, "ns.getPurchasedServerCost", maxRam))) {
					await Do(this.ns, "ns.killall", servers[0]);
					await Do(this.ns, "ns.deleteServer", servers[0]);
					return await this.buyDubs();
				}
			}
		}
		if (servers.length < await Do(this.ns, "ns.getPurchasedServerLimit", "")) {
			let rams = Object.values(await DoAll(this.ns, "ns.getServerMaxRam", servers)).reduce((a, b) => a > b ? a : b, 4);
		    return await Do(this.ns, "ns.purchaseServer", "pserv-" + servers.length.toString(), rams * 2 < maxRam ? rams * 2 : maxRam);
		}
		return false;
	}
	async display() {
		this['window'] = this['window'] || await makeNewWindow("Servers", this.ns.ui.getTheme());
		let text = "<TABLE CELLPADDING=0 CELLSPACING = 0 BORDER=1><TR><TH>Name</TD><TH>Popped</TD></TR>";
		for (let server of this.serverlist) {
			text += "<TR><TD>" + server + "</TD><TD ALIGN=CENTER>" + ((await Do(this.ns, "ns.hasRootAccess", server)) ? "✅" : "❌") + "</TD></TR>";
		}
		text += "</TABLE>"
		this['window'].update(text);
	}
}
