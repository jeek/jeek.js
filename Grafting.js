import { Do, DoAll, DoAllComplex } from "Do.js";
import { makeNewWindow } from "Windows.js";
import { WholeGame } from "WholeGame.js";

export class Grafting {
    constructor(Game) {
        this.ns = Game.ns;
        this.game = Game;
        this.log = ns.tprint.bind(Game.ns);
        if (ns.flags(cmdlineflags)['logbox']) {
            this.log = this.game.sidebar.querySelector(".graftbox") || this.game.createSidebarItem("Grafting", "", "G", "graftbox");
            this.log = this.log.log;
        }
    }
    async checkIn(type = "Hacking", force=false) {
        let Game = await(this.game);
        if ((!await Do(this.ns, "ns.singularity.isBusy", "")) && (!await Do(this.ns, "ns.singularity.isFocused", ""))) {
            let auglist = await Do(this.ns, "ns.grafting.getGraftableAugmentations", "");
            let augs = await DoAll(this.ns, "ns.singularity.getAugmentationStats", auglist);
            for (let aug of auglist) {
                augs[aug].price = await Do(this.ns, "ns.grafting.getAugmentationGraftPrice", aug);
                augs[aug].time = await Do(this.ns, "ns.grafting.getAugmentationGraftTime", aug);
            }
            let currentmoney = await Do(this.ns, "ns.getServerMoneyAvailable", "home");
            auglist = auglist.filter(x => augs[x].price <= currentmoney / 2);
            switch(type) {
                case "Combat":
                    auglist = auglist.sort((a, b) => augs[b].agility_exp * augs[b].agility * augs[b].defense_exp * augs[b].defense * augs[b].dexterity_exp * augs[b].dexterity * augs[b].strength_exp * augs[b].strength - augs[a].agility_exp * augs[a].agility * augs[a].defense_exp * augs[a].defense * augs[a].dexterity_exp * augs[a].dexterity * augs[a].strength_exp * augs[a].strength);
                    break;
                case "Charisma":
                    auglist = auglist.sort((a, b) => augs[b].charisma_exp * augs[b].charisma - augs[a].charisma_exp * augs[a].charisma);
                    break;
                case "Hacking":
                    auglist = auglist.sort((a, b) => augs[b].hacking_grow * augs[b].hacking_speed * (augs[b].hacking ** 2) * (augs[b].hacking_exp ** 2) * (augs[b].faction_rep ** .1) - augs[a].hacking_grow * (augs[a].hacking ** 2) * (augs[a].hacking_exp ** 2) * augs[a].hacking_speed * (augs[a].faction_rep ** .1));
                    break;
            }
            let currentaugs = await Do(this.ns, "ns.singularity.getOwnedAugmentations", true);
            for (let i = 0; i < auglist.length; i++) {
                let good = true;
                let prereqs = await Do(this.ns, "ns.singularity.getAugmentationPrereq", auglist[i]);
                for (let aug of prereqs) {
                    if (!(currentaugs.includes(aug))) {
                        good = false;
                    }
                }
                if (!good) {
                    auglist.splice(i, 1);
                    i -= 1;
                }
            }
            for (let special of ["Neuroreceptor Management Implant", "nickofolas Congruity Implant"]) {
                if ((await Do(this.ns, "ns.grafting.getGraftableAugmentations", "")).includes(special)) {
                    if ((await Do(this.ns, "ns.grafting.getAugmentationGraftPrice", special)) < (await Do(this.ns, "ns.getServerMoneyAvailable", "home"))) {
                        auglist.unshift(special);
                    }
                }
            }
            let playerhack = await (Game.Player.hacking);
            let ownedAugs = await Do(this.ns, "ns.singularity.getOwnedAugmentations");
            if (playerhack > 3000 && ownedAugs.length < 30) {
                auglist = auglist.sort((a, b) => augs[a].time - augs[b].time);
            }
            if (auglist.length > 0) {
                if (!(((await Do(this.ns, "ns.getPlayer", "")).city) == "New Tokyo"))
                    await Do(this.ns, "ns.singularity.travelToCity", "New Tokyo");
                if (playerhack < 4000 || ownedAugs.length < 30 || force)
                    if (await Do(this.ns, "ns.grafting.graftAugmentation", auglist[0], false))
                        this.log(auglist[0]);
            }
        }
    }
}
