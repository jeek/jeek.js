import { FACTIONS } from "data.js";
import { makeNewWindow } from "Windows.js";
import { WholeGame } from "WholeGame.js";
import { jFormat } from "helpers.js";

export class Factions {
	constructor(ns, Game, settings = {}) {
		this.ns = ns;
		this.settings = settings;
		this.Game = Game ? Game : new WholeGame(ns);
		this.log = ns.tprint.bind(ns);
        if (this.ns.flags(cmdlineflags)['logbox']) {
            this.log = this.Game.sidebar.querySelector(".factionbox") || this.Game.createSidebarItem("Factions", "", "F", "factionbox");
			this.display = this.Game.sidebar.querySelector(".factionbox").querySelector(".display");
			this.log = this.log.log;
			this.displayBoxUpdate();
        }
	}
    async displayBoxUpdate() {
        if (this.ns.flags(cmdlineflags)['logbox']) {
            while (!await Do(this.ns, "ns.gang.inGang")) {
                await this.ns.asleep(1000);
            }
        }
        while (this.ns.flags(cmdlineflags)['logbox']) {
            let result = "";
            let facaugs = {};
            let augs = {};
            let rep = {};
            let favor = {};
            let favorgain = {};
            let ownedaugs = await Do(this.ns, "ns.singularity.getOwnedAugmentations", true);
            let hacking = {};
            let combat = {};
            let social = {};
            let rows = [];
            for (let faction of Object.keys(FACTIONS)) {
                rep[faction] = Math.floor(await Do(this.ns, "ns.singularity.getFactionRep", faction));
                favor[faction] = Math.floor(await Do(this.ns, "ns.singularity.getFactionFavor", faction));
                favorgain[faction] = Math.floor(await Do(this.ns, "ns.singularity.getFactionFavorGain", faction));
                facaugs[faction] = await Do(this.ns, "ns.singularity.getAugmentationsFromFaction", faction);
                hacking[faction] = 1;
                combat[faction] = 1;
                social[faction] = 1;
//                this.ns.tprint(faction, " ", facaugs[faction]);
                for (let aug of facaugs[faction]) {
                    augs[aug] = await Do(this.ns, "ns.singularity.getAugmentationStats", aug);
                    if (!ownedaugs.includes(aug) && aug != "NeuroFlux Governor") {
                        for (let stat of ["hacking_chance", "hacking_exp", "hacking_grow", "hacking_money", "hacking_speed", "hacking"]) {
                            hacking[faction] *= augs[aug][stat];
                        }
                        for (let stat of ["strength", "strength_exp", "defense", "defense_exp", "dexterity", "dexterity_exp", "agility", "agility_exp"]) {
                            combat[faction] *= augs[aug][stat];
                        }
                        for (let stat of ["charisma", "charisma_exp", "company_rep", "faction_rep"]) {
                            social[faction] *= augs[aug][stat];
                        }
                    }
                }
                let score = combat[faction];
                hacking[faction] = jFormat(hacking[faction]);
                combat[faction] = jFormat(combat[faction]);
                social[faction] = jFormat(social[faction]);
                rep[faction] = jFormat(rep[faction]);
                rows.push([score, "<TR><TD>" + faction + "</TD><TD>" + rep[faction].toString() + "<BR>" + favor[faction].toString() + " (" + favorgain[faction].toString() + ")</TD><TD>" + hacking[faction].toString() + "</TD><TD>" + combat[faction].toString() + "</TD><TD>" + social[faction].toString() + "</TD></TR>"]);
            }
            rows = rows.sort((a, b) => b[0] - a[0]);
            result = "<TABLE BORDER=1 CELLSPACING=0 CELLPADDING=0 WIDTH=100%>";
            for (let row of rows) {
                result += row[1];
            }
            result += "</TABLE>";
			this.display.removeAttribute("hidden");
			this.display.innerHTML = result;
			this.Game.sidebar.querySelector(".factionbox").recalcHeight(); 
            await this.ns.asleep(10000);
       }
    }
}