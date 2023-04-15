/** @param {NS} ns **/
import { Do } from "Do.js";
import { WholeGame } from "WholeGame.js";
import { jFormat } from "helpers.js";

export class Gang {
    constructor(Game, settings = {}) {
        this.ns = Game.ns;
        this.Game = Game;
        this.log = ns.tprint.bind(Game.ns);
        this.settings = settings;
        this.memberData = {};
        this.nextTask = {};
        this.settings = settings;
        this.settings.faction = this.settings.faction ?? "Slum Snakes";
        if (this.ns.flags(cmdlineflags)['logbox']) {
            this.log = this.Game.sidebar.querySelector(".gangbox") || this.Game.createSidebarItem("Gang", "", "G", "gangbox");
			this.display = this.Game.sidebar.querySelector(".gangbox").querySelector(".display");
			this.log = this.log.log;
			this.displayBoxUpdate();
        }
        // Caching of functions that do not change
        this.taskstats = {};
        this.equipstats = {};
        this.minasc = 0;
    }
    async displayBoxUpdate() {
        if (this.ns.flags(cmdlineflags)['logbox']) {
            while (!await Do(this.ns, "ns.gang.inGang")) {
                await this.ns.asleep(1000);
            }
        }
        while (this.ns.flags(cmdlineflags)['logbox']) {
            let result = "";
            let memberData = {};
            for (let member of await Do(this.ns, "ns.gang.getMemberNames")) {
                memberData[member] = await Do(this.ns, "ns.gang.getMemberInformation", member);
            }
            let memberNames = Object.keys(memberData).sort((a, b) => memberData[b].earnedRespect - memberData[a].earnedRespect);
            result = "<TABLE BORDER=1 CELLSPACING=0 CELLPADDING=0 WIDTH=100%>";
            for (let member of memberNames) {
                result += "<TR><TD>" + member + "</TD><TD>" + jFormat(memberData[member].earnedRespect) + "</TD><TD>" + memberData[member]['hack'] + "</TD><TD>" + memberData[member].str  + "</TD><TD>" + memberData[member].def  + "</TD><TD>" + memberData[member].dex  + "</TD><TD>" + memberData[member].agi + "</TD><TD>" + memberData[member].cha + "</TD><TD>" + memberData[member].task + "</TD></TR>"; 
            }
            result += "</TABLE>";
			this.display.removeAttribute("hidden");
			this.display.innerHTML = result;
			this.Game.sidebar.querySelector(".gangbox").recalcHeight(); 
            await this.ns.asleep(10000);
       }
    }
    // Game API Functions
    async ['ascendMember'](memberName) {
        if (!await (this.canAscend(memberName))) {
            return null;
        }
        if (this.minasc > (await Do(this.ns, "ns.gang.getGangInformation")).respect) {
            return false;
        }
        this.minasc = (await Do(this.ns, "ns.gang.getGangInformation")).respect;
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
        this.equipnames = this.equipnames ?? await Do(this.ns, "ns.gang.getEquipmentNames");
        return this.equipnames;
    }
    async ['getEquipmentStats'](equipName) {
        this.equipstats[equipName] = this.equipstats[equipName] ?? await Do(this.ns, "ns.gang.getEquipmentStats", equipName);
        return this.equipstats[equipName];
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
        this.tasknames = this.tasknames ?? await Do(this.ns, "ns.gang.getTaskNames");
        return this.tasknames;
    }
    async ['getTaskStats'](name) {
        this.taskstats[name] = this.taskstats[name] ?? await Do(this.ns, "ns.gang.getTaskStats", name);
        return this.taskstats[name];
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
        return await Do(this.ns, "ns.gang.setTerritoryWarfare", engage);
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
        let usedNames = await (this['getMemberNames']());
        if (usedNames.length == 12)
            return;
        while (await Do(this.ns, "ns.gang.recruitMember", names.filter(x => !usedNames.includes(x))[0])) {
            this.log("New member " + names.filter(x => !usedNames.includes(x))[0] + " recruited.");
            usedNames.push(names.filter(x => !usedNames.includes(x))[0]);
            if (usedNames.length == 12)
                return;
        }
    }
    async Start(faction = this.settings.faction) {
        if (!(await Do(this.ns, "ns.getPlayer")).factions.includes(faction)) {
//            this.Game.Sleeves.startAGangFirst();
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