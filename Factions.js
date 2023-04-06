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
            this.log = {
                "city": this.Game.sidebar.querySelector(".factioncitybox") || this.Game.createSidebarItem("Factions - City", "", "F", "factioncitybox"),
                "gang": this.Game.sidebar.querySelector(".factiongangbox") || this.Game.createSidebarItem("Factions - Gang", "", "F", "factiongangbox"),
                "corp": this.Game.sidebar.querySelector(".factioncorpbox") || this.Game.createSidebarItem("Factions - Corp", "", "F", "factioncorpbox"),
                "hack": this.Game.sidebar.querySelector(".factionhackbox") || this.Game.createSidebarItem("Factions - Hack", "", "F", "factionhackbox"),
                "end": this.Game.sidebar.querySelector(".factionendbox") || this.Game.createSidebarItem("Factions - Endgame", "", "F", "factionendbox"),
                "other": this.Game.sidebar.querySelector(".factionotherbox") || this.Game.createSidebarItem("Factions - Other", "", "F", "factionotherbox")
            };
			this.display = {
                "city": this.Game.sidebar.querySelector(".factioncitybox").querySelector(".display"),
                "gang": this.Game.sidebar.querySelector(".factiongangbox").querySelector(".display"),
                "corp": this.Game.sidebar.querySelector(".factioncorpbox").querySelector(".display"),
                "hack": this.Game.sidebar.querySelector(".factionhackbox").querySelector(".display"),
                "end": this.Game.sidebar.querySelector(".factionendbox").querySelector(".display"),
                "other": this.Game.sidebar.querySelector(".factionotherbox").querySelector(".display")
            }
            for (let logname of Object.keys(this.log)) {
                this.log[logname] = this.log[logname].log;
            }
			this.displayBoxUpdate();
        }
	}
    async displayBoxUpdate() {
        while (this.ns.flags(cmdlineflags)['logbox']) {
            let facaugs = {};
            let augs = {};
            let rep = {};
            let favor = {};
            let favorgain = {};
            let ownedaugs = await Do(this.ns, "ns.singularity.getOwnedAugmentations", true);
            let hacking = {};
            let combat = {};
            let social = {};
            let rows = {
                "corp": [],
                "hack": [],
                "city": [],
                "gang": [],
                "other": [],
                "end": []
            };
            let result = {
                "corp": "<TABLE BORDER=1 CELLSPACING=0 CELLPADDING=0 WIDTH=100%>",
                "hack": "<TABLE BORDER=1 CELLSPACING=0 CELLPADDING=0 WIDTH=100%>",
                "end": "<TABLE BORDER=1 CELLSPACING=0 CELLPADDING=0 WIDTH=100%>",
                "gang": "<TABLE BORDER=1 CELLSPACING=0 CELLPADDING=0 WIDTH=100%>",
                "city": "<TABLE BORDER=1 CELLSPACING=0 CELLPADDING=0 WIDTH=100%>",
                "other": "<TABLE BORDER=1 CELLSPACING=0 CELLPADDING=0 WIDTH=100%>"
            }
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
                if (["CyberSec", "NiteSec", "The Black Hand", "BitRunners"].includes(faction)) {
                    rows["hack"].push([score, "<TR><TD>" + faction + "</TD><TD>" + rep[faction].toString() + "<BR>" + favor[faction].toString() + " (" + favorgain[faction].toString() + ")</TD><TD>" + hacking[faction].toString() + "</TD><TD>" + combat[faction].toString() + "</TD><TD>" + social[faction].toString() + "</TD></TR>"]);
                }
                if (["Slum Snakes", "Speakers for the Dead", "The Black Hand", "NiteSec", "Tetrads", "The Syndicate", "The Dark Army"].includes(faction)) {
                    rows["gang"].push([score, "<TR><TD>" + faction + "</TD><TD>" + rep[faction].toString() + "<BR>" + favor[faction].toString() + " (" + favorgain[faction].toString() + ")</TD><TD>" + hacking[faction].toString() + "</TD><TD>" + combat[faction].toString() + "</TD><TD>" + social[faction].toString() + "</TD></TR>"]);
                }
                if (["Sector-12", "Aevum", "Volhaven", "Chongqing", "Ishima", "New Tokyo"].includes(faction)) {
                    rows["city"].push([score, "<TR><TD>" + faction + "</TD><TD>" + rep[faction].toString() + "<BR>" + favor[faction].toString() + " (" + favorgain[faction].toString() + ")</TD><TD>" + hacking[faction].toString() + "</TD><TD>" + combat[faction].toString() + "</TD><TD>" + social[faction].toString() + "</TD></TR>"]);
                }
                if (["ECorp", "MegaCorp", "KuaiGong International", "Four Sigma", "NWO", "Blade Industries", "OmniTek Incorporated", "Bachman & Associates", "Clarke Incorporated", "Fulcrum Secret Technologies"].includes(faction)) {
                    rows["corp"].push([score, "<TR><TD>" + faction + "</TD><TD>" + rep[faction].toString() + "<BR>" + favor[faction].toString() + " (" + favorgain[faction].toString() + ")</TD><TD>" + hacking[faction].toString() + "</TD><TD>" + combat[faction].toString() + "</TD><TD>" + social[faction].toString() + "</TD></TR>"]);
                }
                if (["Daedalus", "Illuminati", "The Covenant"].includes(faction)) {
                    rows["end"].push([score, "<TR><TD>" + faction + "</TD><TD>" + rep[faction].toString() + "<BR>" + favor[faction].toString() + " (" + favorgain[faction].toString() + ")</TD><TD>" + hacking[faction].toString() + "</TD><TD>" + combat[faction].toString() + "</TD><TD>" + social[faction].toString() + "</TD></TR>"]);
                }
                if (["Silhouette", "Church of the Machine God", "Bladeburners", "Tian Di Hui", "Shadows of Anarchy", "Netburners"].includes(faction)) {
                    rows["other"].push([score, "<TR><TD>" + faction + "</TD><TD>" + rep[faction].toString() + "<BR>" + favor[faction].toString() + " (" + favorgain[faction].toString() + ")</TD><TD>" + hacking[faction].toString() + "</TD><TD>" + combat[faction].toString() + "</TD><TD>" + social[faction].toString() + "</TD></TR>"]);
                }
            }
            for (let box of ["hack", "gang", "city", "corp", "end", "other"]) {
                rows[box] = rows[box].sort((a, b) => b[0] - a[0]);
                for (let row of rows[box]) {
                    result[box] += row[1];
                }
                result[box] += "</TABLE>";
			    this.display[box].removeAttribute("hidden");
			    this.display[box].innerHTML = result[box];
			    this.Game.sidebar.querySelector(".faction" + box + "box").recalcHeight();
            }
            await this.ns.asleep(10000);
       }
    }
}