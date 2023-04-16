import { Do, DoAll } from "Do.js";
import { makeNewWindow } from "Windows.js";
import { WholeGame } from "WholeGame.js";

export class Servers {
	constructor(Game) {
		this.ns = Game.ns;
		this.Game = Game;
		this.serverlist = ["home", "n00dles", "foodnstuff", "sigma-cosmetics", "joesguns", "hong-fang-tea", "harakiri-sushi", "iron-gym", "CSEC", "zer0", "nectar-net", "max-hardware", "phantasy", "neo-net", "omega-net", "silver-helix", "netlink", "crush-fitness", "computek", "johnson-ortho", "the-hub", "avmnite-02h", "rothman-uni", "I.I.I.I", "syscore", "summit-uni", "catalyst", "zb-institute", "aevum-police", "lexo-corp", "alpha-ent", "millenium-fitness", "rho-construction", "aerocorp", "global-pharm", "galactic-cyber", "snap-fitness", "omnia", "unitalife", "deltaone", "univ-energy", "zeus-med", "solaris", "defcomm", "icarus", "infocomm", "zb-def", "nova-med", "taiyang-digital", "titan-labs", "microdyne", "applied-energetics", "run4theh111z", "stormtech", "fulcrumtech", "helios", "vitalife", "omnitek", "kuai-gong", "4sigma", ".", "powerhouse-fitness", "nwo", "b-and-a", "blade", "clarkinc", "ecorp", "The-Cave", "megacorp", "fulcrumassets"];
		["home", "n00dles", "foodnstuff", "sigma-cosmetics", "joesguns", "hong-fang-tea", "harakiri-sushi", "iron-gym", "CSEC", "zer0", "nectar-net", "max-hardware", "phantasy", "neo-net", "omega-net", "silver-helix", "netlink", "crush-fitness", "computek", "johnson-ortho", "the-hub", "avmnite-02h", "rothman-uni", "I.I.I.I", "syscore", "summit-uni", "catalyst", "zb-institute", "aevum-police", "lexo-corp", "alpha-ent", "millenium-fitness", "rho-construction", "aerocorp", "global-pharm", "galactic-cyber", "snap-fitness", "omnia", "unitalife", "deltaone", "univ-energy", "zeus-med", "solaris", "defcomm", "icarus", "infocomm", "zb-def", "nova-med", "taiyang-digital", "titan-labs", "microdyne", "applied-energetics", "run4theh111z", "stormtech", "fulcrumtech", "helios", "vitalife", "omnitek", "kuai-gong", "4sigma", ".", "powerhouse-fitness", "nwo", "b-and-a", "blade", "clarkinc", "ecorp", "The-Cave", "megacorp", "fulcrumassets"].map(x => this[x] = new Server(Game, x));
		this.log = this.ns.tprint.bind(Game.ns);
		if (this.ns.flags(cmdlineflags)['logbox']) {
			this.log = this.Game.sidebar.querySelector(".servers") || this.Game.createSidebarItem("Servers", "", "S", "servers");
			this.body = this.log.body;
			this.body.innerHTML = "<canvas width=1000 height=1000 id='serverbox'></canvas>";
			this.log.recalcHeight();
			this.log = this.log.log;
		}
	}
	async serverbox() {
		if (this.ns.flags(cmdlineflags)['logbox']) {
			let layout = [[],['home']];
			let purchasedServers = await Do(this.ns, "ns.getPurchasedServers");
			let scans = {};
			for (let i = 1 ; i < layout.length ; i++) {
				for (let j = 0 ; j < layout[i].length ; j++) {
                    scans[layout[i][j]] = await Do(this.ns, "ns.scan", layout[i][j]);
					let possible = await Do(this.ns, "ns.scan", layout[i][j]);
					for (let server of possible) {
						let addThis = true;
						if (i > 0 && layout[i-1].includes(server)) {
							addThis = false;
						}
						if (layout[i].includes(server)) {
							addThis = false;
						}
						if (i + 1 < layout.length && layout[i + 1].includes(server)) {
							addThis = false;
						}
						if (server.indexOf("hacknet") > -1) {
							addThis = false;
						}
						if (purchasedServers.includes(server)) {
							addThis = false;
						}
						if (addThis) {
							if (i + 1 >= layout.length) {
								layout.push([]);
							}
							if (layout[i][j] == 'home' && (await Do(this.ns, "ns.scan", server)).length==1) {
    							layout[i-1].push(server);
								scans[server] = await Do(this.ns, "ns.scan", server);
							} else {
    							layout[i+1].push(server);
	    					}
		    			}
					}
				}
			}
			let heights = [0];
			while (heights.length < layout.length) {
				heights.push(heights[heights.length-1] + 950/layout.length);
			}
			let c = eval("document").getElementById("serverbox");
			let ctx = c.getContext("2d");
			let minsec = {};
			let sec = {};
			let maxmon = {};
			let mon = {};
			await Promise.all(Object.values(scans));
			while (true) {
				Object.keys(scans).map(x => minsec[x] = Do(this.ns, "ns.getServerMinSecurityLevel", x));
				Object.keys(scans).map(x => sec[x] = Do(this.ns, "ns.getServerSecurityLevel", x));
				Object.keys(scans).map(x => mon[x] = Do(this.ns, "ns.getServerMoneyAvailable", x));
				Object.keys(scans).map(x => maxmon[x] = Do(this.ns, "ns.getServerMaxMoney", x));
				for (let server of Object.keys(scans)) {
					await minsec[server];
					await sec[server];
					await mon[server];
					await maxmon[server]; 
				}

				ctx = c.getContext("2d");
				ctx.beginPath();
				ctx.fillStyle = "#000000";
    			ctx.rect(0,0,1000,1000);
				ctx.fill();
				for (let i = 0 ; i < layout.length ; i++) {
	    			for (let j = 0 ; j < layout[i].length ; j++) {
		    			let server = layout[i][j];
			    		let myX = 375;
				    	if (layout[i].length > 1) {
					    	myX = 750 / (layout[i].length - 1) * layout[i].findIndex(x => x === server);
					    }
					    let myY = heights[i];
				    	if (i + 1 < layout.length) {
    				    	let connectTo = scans[server].filter(x => layout[i+1].includes(x));
	    				    for (let target of connectTo) {
		    				    let theirX = 375;
			    	    		if (layout[i + 1].length > 1) {
				    	    		theirX = 750 / (layout[i+1].length - 1) * layout[i+1].findIndex(x => x === target);
					        	}
						        let theirY = heights[i+1];
								ctx = c.getContext("2d");
								ctx.beginPath();
					    	    ctx.strokeStyle = "#00FFFF";
						        ctx.moveTo(115+myX, 25+myY);
                                ctx.lineTo(115+theirX, 25+theirY);
                                ctx.stroke();
					    	}
				    	}
						ctx = c.getContext("2d");
				        let security = ((await (sec[server]))-(await (minsec[server]))) / (99 - (await minsec[server]));
					    ctx.beginPath();
					    ctx.strokeStyle = "#FF0000";
					    ctx.fillStyle = "#FF0000";
					    ctx.arc(myX+115, myY+25, 15, -Math.PI / 2 + Math.PI * (1 - security), Math.PI / 2);
						ctx.lineTo(myX+115, myY+25);
					    ctx.fill();

						ctx = c.getContext("2d");
				        let money = (await (mon[server])) / (await (maxmon[server]));
					    ctx.beginPath();
					    ctx.strokeStyle = "#00FF00";
					    ctx.fillStyle = "#00FF00";
					    ctx.arc(myX+115, myY+25, 15, Math.PI / 2, Math.PI / 2 + Math.PI * money);
						ctx.lineTo(myX+115, myY+25);
					    ctx.fill();

						if (isNaN(money) || money === Infinity) {
							ctx = c.getContext("2d");
							ctx.beginPath();
							ctx.strokeStyle = "#00FFFF";
							ctx.fillStyle = "#00FFFF";
							ctx.arc(myX+115, myY+25, 15, 0, 2 * Math.PI);
							ctx.lineTo(myX+115, myY+25);
							ctx.fill();	
						}

						ctx = c.getContext("2d");
                        ctx.font = "15px Hack";
						ctx.fillStyle = "#FFFFFF";
						ctx.strokeStyle = "#FFFFFF";
						ctx.textAlign = "center";
						ctx.fillText(server, myX + 115, myY + 25 + 30);
    				}
				}
				await this.ns.asleep(60000);
			}
		}
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
				if ((await (this.Game.Player.money)) > (await Do(this.ns, "ns.getPurchasedServerCost", maxRam))) {
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
	async updateDisplay() {
		this['window'] = this['window'] || await makeNewWindow("Servers", this.ns.ui.getTheme());
		let text = "<TABLE CELLPADDING=0 CELLSPACING = 0 BORDER=1><TR><TH>Name</TD><TH>Popped</TD></TR>";
		for (let server of this.serverlist) {
			text += "<TR><TD>" + server + "</TD><TD ALIGN=CENTER>" + ((await Do(this.ns, "ns.hasRootAccess", server)) ? "✅" : "❌") + "</TD></TR>";
		}
		text += "</TABLE>"
		this['window'].update(text);
	}
}