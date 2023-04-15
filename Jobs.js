/** @param {NS} ns **/
import { Do } from "Do.js";
import { WholeGame } from "WholeGame.js";
import { jFormat } from "helpers.js";

export class Jobs {
    constructor(Game, settings = {}) {
        this.ns = Game.ns;
        this.Game = Game;
        this.log = ns.tprint.bind(Game.ns);
        this.settings = settings;
        if (this.ns.flags(cmdlineflags)['logbox']) {
            this.log = this.Game.sidebar.querySelector(".jobsbox") || this.Game.createSidebarItem("Jobs", "", "J", "jobsbox");
			this.display = this.Game.sidebar.querySelector(".jobsbox").querySelector(".display");
			this.log = this.log.log;
			this.displayBoxUpdate();
        }
    }
	async displayBoxUpdate() {
		let locations = ["AeroCorp","Bachman & Associates","Clarke Incorporated","ECorp","Fulcrum Technologies","Galactic Cybersystems","NetLink Technologies","Aevum Police Headquarters","Rho Construction","Watchdog Security","KuaiGong International","Solaris Space Systems","Alpha Enterprises","Blade Industries","Central Intelligence Agency","Carmichael Security","DeltaOne","FoodNStuff","Four Sigma","Icarus Microsystems","Joe's Guns","MegaCorp","National Security Agency","Universal Energy","DefComm","Global Pharmaceuticals","Noodle Bar","VitaLife","Nova Medical","Omega Software","Storm Technologies","CompuTek","Helios Labs","LexoCorp","NWO","OmniTek Incorporated","Omnia Cybersystems","SysCore Securities"];
		let positions = {};
		for (let i = 0 ; i < locations.length ; i++) {
			positions[locations[i]] = await Do(this.ns, "ns.singularity.getCompanyPositions", locations[i]);
		}
		if (locations.length == 0) { // New jobs functions not in yet
 			this.log("No Jobs API. Update your game.");
	    return;
    }
    this.display.style['overflow-y'] = 'auto';
    let oldresult = "";
		while (true) {
			let rep = {};
			let favor = {};
        let rows = [];
			let result = "<TABLE WIDTH=100% BORDER=1 CELLPADDING=0 CELLSPACING=0>";
			for (let location of locations) {
				rep[location] = await Do(this.ns, "ns.singularity.getCompanyRep", location);
                favor[location] = await Do(this.ns, "ns.singularity.getCompanyFavor", location);
                for (let position of positions[location]) {
					let posdata = (await Do(this.ns, "ns.singularity.getCompanyPositionInfo", location, position));
					let skills = [posdata.requiredSkills.hacking, posdata.requiredSkills.strength, posdata.requiredSkills.charisma];
				    posdata.salary *= (1 + favor[location]) * (await Do(this.ns, "ns.getBitNodeMultipliers")).CompanyWorkMoney;
					rows.push([posdata.salary, location, posdata.requiredReputation, posdata.requiredSkills, position, "<TR><TD>" + position + "</TD><TD align=right>" + jFormat(Math.ceil(posdata.salary), "$") + "</TD><TD align=right>" + jFormat(posdata.requiredReputation) + "</TD><TD>" + skills.map(x => x.toString()).join("</TD><TD>") + "</TD></TR>"]);
				}
			}
            rows = rows.filter(x => rep[x[1]] >= x[2]);
			let player = await Do(this.ns, "ns.getPlayer");
			for (let stat of ["hacking", "strength", "dexterity", "defense", "agility", "charisma"]) {
			    rows = rows.filter(x => player.skills[stat] >= x[3][stat]);	
			}
            rows = rows.sort((a, b) => b[0]-a[0]);
			while (rows.length > 0) {
				let current = rows[0];
				if (!Object.keys(player.jobs).includes(current[1]) || player.jobs[current[1]] != current[4]) {
					await Do(this.ns, "ns.singularity.applyToCompany", current[1], current[4]);
				}
				result += "<TR><TD COLSPAN=6 ALIGN=CENTER>" + current[1] + " " + jFormat(rep[current[1]]) + "</TD></TR>";
				result += rows.filter(x => x[1] == current[1]).map(x => x[5]).join("");
				rows = rows.filter(x => x[1] != current[1]);
			}
      result += "</TABLE>";
      this.display.removeAttribute("hidden");
			if (result != oldresult) {
        this.display.innerHTML = result;
        this.Game.sidebar.querySelector(".jobsbox").recalcHeight();
      }
	  oldresult = result;
      await this.ns.asleep(10000);
		}
	}
}
/* Find the jobs array
export async function main(ns) {
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

	let player;
	let router;
	let jobs;
	let positionsraw;
	for (const obj of objects) {
		if (!player && typeof obj.whoAmI === "function" && obj.whoAmI() === "Player") {
			player = obj;
		} else {
			if (!router && typeof obj.toDevMenu === "function") {
				router = obj;
			} else {
				try {
					if (Object.keys(obj).includes("AevumAeroCorp")) {
						//ns.tprint(obj, " ", Object.keys(obj));
						//ns.tprint(" AeroCorp ", Object.keys(obj['AevumAerocorp']));
						locations = obj;
					}
				} catch { }
				try {
					if (Object.keys(obj).includes("AeroCorp") && Object.keys(obj["AeroCorp"]).includes("companyPositions")) {
						//ns.tprint(obj, " ", Object.keys(obj));
						//ns.tprint(" AeroCorp ", Object.keys(obj['AeroCorp']));
						jobs = obj;
					}
				} catch { }
				try {
					if (Object.keys(obj[0]).includes("charismaEffectiveness")) {
						positionsraw = obj;
					}
				} catch { }
			}
		}
	}
	let positions = {}
	positionsraw.map(x => positions[x.name] = x);
	//ns.tprint('Player: ' + player);
	//ns.tprint('Router: ' + router);
	//ns.tprint('Jobs: ' + jobs);
	for (let company of Object.keys(jobs).sort((a, b) => {return jobs[a]['jobStatReqOffset'] - jobs[b]['jobStatReqOffset']})) {
		for (let pos of Object.keys(jobs[company]["companyPositions"]).sort((a, b) => {return (positions[a]['reqdReputation'] ? positions[a]['reqdReputation'] : 0) - (positions[b]['reqdReputation'] ? positions[b]['reqdReputation'] : 0)})) {
			let rep = (positions[pos]['reqdReputation'] ? positions[pos]['reqdReputation'] : 0);
			let hackk = (positions[pos]["reqdHacking"] ? positions[pos]["reqdHacking"] + jobs[company]['jobStatReqOffset'] : 0);
			let cha = (positions[pos]["reqdCharisma"] ? positions[pos]["reqdCharisma"] + jobs[company]['jobStatReqOffset'] : 0);
			if (ns.getPlayer().skills.hacking >= hackk && ns.getPlayer().skills.charisma >= cha)
			ns.tprint(company, " ", pos, " ", rep, " ", hackk, " ", cha);
		}
//        ns.tprint(company, " ", jobs[company]);
	}
//    ns.tprint('Positions: ' + positions.map(x => [x.name, x]));
//    ns.tprint('Locations: ' + Object.keys(locations["Bachman & Associates"]));

	//    if (router) router.toDevMenu();
}
*/