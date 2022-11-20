import { Do, DoAll } from "Do.js;
import { makeNewWindow } from "Windows.js";
import { WholeGame } from "WholeGame.js";

export class Augmentations {
	constructor(ns, game) {
		this.ns = ns
		this.game = game ? game : new WholeGame(ns);
	}
	async createDisplay() {
		this.augWindow = await makeNewWindow("Augmentations", this.ns.ui.getTheme());
		this.augs = {};
		let graftableaugs = await Do(this.ns, "ns.grafting.getGraftableAugmentations");
		for (let faction of Object.keys(FACTIONS)) {
			for (let aug of await Do(this.ns, "ns.singularity.getAugmentationsFromFaction", faction)) {
				if (!Object.keys(this.augs).includes(aug)) {
					this.augs[aug] = {
						'base_price': await Do(this.ns, "ns.singularity.getAugmentationBasePrice", aug),
						'price': await Do(this.ns, "ns.singularity.getAugmentationPrice", aug),
						'prereqs': await Do(this.ns, "ns.singularity.getAugmentationPrereq", aug),
						'rep_req': await Do(this.ns, "ns.singularity.getAugmentationRepReq", aug),
						'stats': await Do(this.ns, "ns.singularity.getAugmentationStats", aug),
						'factions': [faction]
					};
					if (graftableaugs.includes(aug)) {
						this.augs[aug]['graftprice'] = await Do(this.ns, "ns.grafting.getAugmentationGraftPrice", aug);
						this.augs[aug]['grafttime'] = await Do(this.ns, "ns.grafting.getAugmentationGraftTime", aug);
					}
				} else {
					this.augs[aug]['factions'].push(faction);
				}
			}
		}
	}
	async updateDisplay() {
		let ownedaugs = await Do(this.ns, "ns.singularity.getOwnedAugmentations");
		//		let factfavor = await DoAll(this.ns, "ns.singularity.getFactionFavor", Object.keys(FACTIONS));
		//		let factfavorgain = await DoAll(this.ns, "ns.singularity.getFactionFavorGain", Object.keys(FACTIONS));
		let factrep = await DoAll(this.ns, "ns.singularity.getFactionRep", Object.keys(FACTIONS));
		let update = "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0>"
		let owned = "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0>"
		for (let aug of Object.keys(this.augs).sort((a, b) => this.augs[a]['rep_req'] - this.augs[b]['rep_req'])) {
			let skip = false;
			if (this.augs[aug].factions.includes("Church of the Machine God") && ownedaugs.length > 0 && !ownedaugs.includes("Stanek's Gift - Genesis")) {
				skip = true;
			}
			if (this.augs[aug].factions.includes("Bladeburners") && !((await Do(this.ns, "ns.getPlayer")).factions.includes("Bladeburners"))) {
				skip = true;
			}
			if (this.augs[aug].factions.includes("Shadows of Anarchy") && !((await Do(this.ns, "ns.getPlayer")).factions.includes("Shadows of Anarchy"))) {
				skip = true;
			}
			if (!skip) {
				let myupdate = "<TR VALIGN=TOP>"
				myupdate += td(aug) + td(jFormat(this.augs[aug]['price'], "$"), "RIGHT");
				myupdate += "<TD ALIGN=RIGHT>" + jFormat(this.augs[aug]['rep_req']) + "<BR><TABLE BORDER=0 CELLPADDING=0 CELLSPACING=0>";
				let nothing = [];
				for (let faction of this.augs[aug]['factions'].sort((a, b) => factrep[b] - factrep[a])) {
					if (factrep[faction] > 0) {
						myupdate += tr(td(FACTIONS[faction]['abbrev'] + "&nbsp;", "RIGHT") + td(jFormat(factrep[faction]), "RIGHT"));
					} else {
						nothing.push(FACTIONS[faction]['abbrev']);
					}
				}
				myupdate += "</TABLE>"
				if (nothing.length > 0) {
					myupdate += "<SMALL>" + nothing.join(" ");
				}
				myupdate += "</TD>";
				try {
					myupdate += td(jFormat(this.augs[aug]['graftprice'], "$"), "RIGHT");
				} catch { myupdate += td("&nbsp;"); }
				try {
					myupdate += td(timeFormat(Math.floor(this.augs[aug]['grafttime'] / 1000 + .5)), "RIGHT");
				} catch { myupdate += td("&nbsp;"); }
				myupdate += "</TR>";
				if (ownedaugs.includes(aug)) {
					owned += myupdate;
				} else {
					update += myupdate;
				}
			}
		}
		update += "</TABLE>";
		owned += "</TABLE>";
		this.augWindow.update(update + "<BR>" + owned);
	}
}
