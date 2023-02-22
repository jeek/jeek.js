/** @param {NS} ns **/
import { Do } from "Do.js";
import { WholeGame } from "WholeGame.js";

export class Gang {
    constructor(ns, Game, settings = {}) {
        this.ns = ns;
        this.Game = Game ? Game : new WholeGame(ns);
        this.log = ns.tprint.bind(ns);
        this.settings = settings;
        this.memberData = {};
        this.nextTask = {};
        this.settings = settings;
        this.settings.faction = this.settings.faction ?? "Slum Snakes";
        if (this.ns.flags(cmdlineflags)['logbox']) {
            this.log = this.Game.sidebar.querySelector(".gangbox") || this.Game.createSidebarItem("Gang", "", "G", "gangbox");
            this.log = this.log.log;
        }
        // Caching of functions that do not change
        this.tasknames = Do(this.ns, "ns.gang.getTaskNames");
        this.taskstats = (async (this) => {
			try {
                await (this.tasknames);
                let taskstats = {};
                for (let task of this.tasknames) {
                    taskstats[task] = Do(this.ns, "ns.gang.getTaskStats", task);
                }
                return taskstats;
			} catch (e) {
				return null;
			}
		})(this);
        this.equipnames = Do(this.ns, "ns.gang.getEquipNames");
        this.equipstats = (async (this) => {
			try {
                await (this.equipnames);
                let equipstats = {};
                for (let task of this.equipnames) {
                    equipstats[task] = Do(this.ns, "ns.gang.getEquipStats", task);
                }
                return equipstats;
			} catch (e) {
				return null;
			}
		})(this);
    }
    // Game API Functions
    async ['ascendMember'](memberName) {
        if (!await (this.canAscend(memberName))) {
            return null;
        }
        return await Do(this.ns, "ns.gang.ascendMember", memberName);
    }
    async ['canRecruitMember']() {
        return await Do(this.ns, "ns.gang.canRecruitMember", memberName);
    }
    async ['createGang'](faction) {
        return await Do(this.ns, "ns.gang.createGang", faction);
    }
    async ['getAscensionResult'](memberName) {
        if (!await (this.canAscend(memberName))) {
            return null;
        }
        return await Do(this.ns, "ns.gang.getAscensionResult", memberName);
    }
    async ['getBonusTime']() {
        return await Do(this.ns, "ns.gang.getBonusTime");
    }
    async ['getChanceToWinClash'](gangName) {
        return await Do(this.ns, "ns.gang.getChanceToWinClash", gangName);
    }
    async ['getEquipmentCost'](equipName) {
        return await Do(this.ns, "ns.gang.getEquipmentCost", equipName);
    }
    async ['getEquipmentNames']() {
        return await this.equipnames;
    }
    async ['getEquipmentStats'](equipName) {
        await this.equipstats;
        return await (this.equipstats[equipName]);
    }
    async ['getEquipmentType'](equipName) {
        return await Do(this.ns, "ns.gang.getEquipmentType", equipName);
    }
    async ['getGangInformation']() {
        return await Do(this.ns, "ns.gang.getGangInformation");
    }
    async ['getMemberInformation'](name) {
        return await Do(this.ns, "ns.gang.getMemberInformation", name);
    }
    async ['getMemberNames']() {
        return await Do(this.ns, "ns.gang.getMemberNames");
    }
    async ['getOtherGangInformation']() {
        return await Do(this.ns, "ns.gang.getOtherGangInformation");
    }
    async ['getTaskNames']() {
        return await (this.tasknames);
    }
    async ['getTaskStats'](name) {
        await this.taskstats;
        return await (this.taskstats[name]);
    }
    async ['inGang']() {
        return await Do(this.ns, "ns.gang.inGang");
    }
    async ['purchaseEquipment'](memberName, equipName) {
        return await Do(this.ns, "ns.gang.purchaseEquipment", memberName, equipName);
    }
    async ['recruitMember'](name) {
        return await Do(this.ns, "ns.gang.recruitMember", name);
    }
    async ['setMemberTask'](memberName, taskName) {
        return await Do(this.ns, "ns.gang.setMemberTask", memberName, taskName);
    }
    async ['setTerritoryWarfare'](engage) {
        return await Do(this.ns, "ns.gang.setTerritoryWarfare");
    }
    // jeek.js additions
    async canAscend(memberName) {
        let member = await (this['getMemberInformation'](memberName));
        return 1000 <= ["hack_exp", "str_exp", "def_exp", "dex_exp", "agi_exp", "cha_exp"].map(x => member[x]).reduce((a, b) => a > b ? a : b);
    }
    async recruitMembers(names) {
        if (!await Do(this.ns, "ns.gang.inGang")) {
            return;
        }
        // Recruit as many members as possible.
        let usedNames = await (this['getMemberNames']);
        while (await Do(this.ns, "ns.gang.recruitMember", names.filter(x => !usedNames.includes(x))[0])) {
            this.log("New member " + names.filter(x => !usedNames.includes(x))[0] + " recruited.");
            usedNames.push(names.filter(x => !usedNames.includes(x))[0]);
        }
    }
    async Start(faction = this.settings.faction) {
        if (!(await Do(this.ns, "ns.getPlayer")).factions.includes(faction)) {
            this.Game.Sleeves.startAGangFirst();
            while (!(await Do(this.ns, "ns.getPlayer")).factions.includes(faction)) {
                await this.ns.asleep(60000);
                try {
                    await Do(this.ns, "ns.singularity.joinFaction", faction);
                } catch { }
            }
        }
        while (!(await (this['inGang']()))) {
            await this.ns.asleep(60000);
            try {
                await (this['createGang'](faction));
            } catch { }
        }
    }
}