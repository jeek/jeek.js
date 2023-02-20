let REP_CHECK = 1.1; // Don't ascend anyone with over 1.1x the average rep of the group.
let CLASH_TARGET = .5; // Don't go to war until you have this much of a chance against all remaining gangs.
let ASC = 1.06;

/** @param {NS} ns **/
import { Do, DoAll } from "Do.js";
import { WholeGame } from "WholeGame.js";

export class Gang {
    constructor(ns, Game, settings = {}) {
        this.ns = ns;
        this.Game = Game ? Game : new WholeGame(ns);
        this.log = ns.tprint.bind(ns);
        this.settings = settings;
        if (!Object.keys(this.settings).includes("name")) {
            this.settings['name'] = "Slum Snakes";
        }
        if (!Object.keys(this.settings).includes("membernames")) {
            this.settings['membernames'] = [];
        }
        while (this.settings.membernames.length < 12) {
            this.settings['membernames'].push([
                'Rat',
                'Ox',
                'Tiger',
                'Rabbit',
                'Dragon',
                'Snake',
                'Horse',
                'Goat',
                'Monkey',
                'Rooster',
                'Dog',
                'Pig'].filter(x => !this.settings.membernames.includes(x))[0]);
        }
        if (!Object.keys(this.settings).includes("wantedThreshhold")) {
            this.settings['wantedThreshold'] = 10;
        }
        if (!Object.keys(this.settings).includes("clashTarget")) {
            this.settings['clashTarget'] = .5;
        }
        if (!Object.keys(this.settings).includes("minimumRespect")) {
            this.settings['minimumRespect'] = 0;
        }
        if (!Object.keys(this.settings).includes("traffickChance")) {
            this.settings['traffickChance'] = .8;
        }
        if (!Object.keys(this.settings).includes("wantedPenaltyThreshhold")) {
            this.settings['wantedPenaltyThreshold'] = .9;
        }
        this.memberData = {};
        this.nextTask = {};
        if (ns.flags(cmdlineflags)['logbox']) {
            this.log = this.Game.sidebar.querySelector(".gangbox") || this.Game.createSidebarItem("Gang", "", "G", "gangbox");
            this.log = this.log.log;
        }
        this.tasks = ["Mug People", "Deal Drugs", "Strongarm Civilians", "Run a Con", "Armed Robbery", "Traffick Illegal Arms", "Threaten & Blackmail", "Human Trafficking", "Terrorism", "Vigilante Justice", "Train Combat", "Train Hacking", "Train Charisma", "Territory Warfare"];
    }
    get minimumDefense() {
        return Object.keys(this.memberData).length * 500;
    }
    async updateMemberData() {
        if (!await Do(this.ns, "ns.gang.inGang")) {
            return;
        }
        this.memberData = {};
        let memberNames = await Do(this.ns, "ns.gang.getMemberNames");
        let promises = memberNames.map(x => Do(this.ns, "ns.gang.getMemberInformation", x));
        await Promise.all(promises);
        memberNames.map(x => memberData[x] = promises[memberNames.indexOf(x)]);
    }
    async recruitMembers() {
        if (!await Do(this.ns, "ns.gang.inGang")) {
            return;
        }
        // Recruit as many members as possible.
        let usedNames = await Do(this.ns, "ns.gang.getMembernames");
        while (await Do(this.ns, "ns.gang.recruitMember", this.settings.membernames.filter(x => !usedNames.includes(x))[0])) {
            globalThis.gangBox.log("New member " + this.settings.membernames.filter(x => !usedNames.includes(x))[0] + " recruited.");
            usedNames.push(this.settings.membernames.filter(x => !usedNames.includes(x))[0]);
        }
    }
    // Set the members to their tasks.
    async setTasks() {
        if (!await Do(this.ns, "ns.gang.inGang")) {
            return;
        }
        let hasFormulas = await Do(this.ns, "ns.fileExists", 'Formulas.exe');
        await Promise.all(Object.values(this.taskStats));
        for (let member of this.members) {
            if (gangInfo.wantedLevel >= this.settings.wantedThreshold && gangInfo.wantedPenalty <= this.settings.wantedPenaltyThreshold) {
                this.nextTask[member] = "Vigilante Justice";
            } else {
                if (this.memberData[member].def < this.minimumDefense) {
                    this.nextTask[member] = "Train Combat";
                } else {
                    this.nextTask[member] = Math.random() <= this.settings.traffickChance ? "Traffick Illegal Arms" : "Terrorism";
                }
            }
        }
        this.members.sort((a, b) => { return this.memberData[a].earnedRespect - this.memberData[b].earnedRespect; });
        this.members.map(x => this.nextTask[x] = "Traffick Illegal Arms");
        this.nextTask[members[0]] = "Terrorism";
        if (this.members.length > 6) {
            this.nextTask[this.members[1]] = "Terrorism";
        }
        if (gangInfo.wantedLevel >= this.settings.wantedLevel && gangInfo.wantedPenalty <= this.settings.wantedPenaltyThreshold) {
            this.members.map(x => this.nextTask[x] = "Vigilante Justice");
        } else {
            if (hasFormulas) {
                let remaining = this.members.filter(x => this.memberData[x].def_exp >= this.minimumDefense && this.memberData[x].str_exp >= this.minimumDefense && this.memberData[x].dex_exp >= this.minimumDefense && this.memberData[x].agi_exp >= this.minimumDefense && this.memberData[x].hack_exp >= this.minimumDefense && this.memberData[x].cha_exp >= this.minimumDefense);
                this.members.filter(x => !remaining.includes(x)).filter(x => this.memberData[x].cha_exp < this.minimumDefense).map(x => this.nextTask[x] = "Train Charisma");
                this.members.filter(x => !remaining.includes(x)).filter(x => this.memberData[x].hack_exp < this.minimumDefense).map(x => this.nextTask[x] = "Train Hacking");
                this.members.filter(x => !remaining.includes(x)).filter(x => this.memberData[x].dex_exp < this.minimumDefense).map(x => this.nextTask[x] = "Train Combat");
                this.members.filter(x => !remaining.includes(x)).filter(x => this.memberData[x].str_exp < this.minimumDefense).map(x => this.nextTask[x] = "Train Combat");
                this.members.filter(x => !remaining.includes(x)).filter(x => this.memberData[x].agi_exp < this.minimumDefense).map(x => this.nextTask[x] = "Train Combat");
                this.members.filter(x => !remaining.includes(x)).filter(x => this.memberData[x].def_exp < this.minimumDefense).map(x => this.nextTask[x] = "Train Combat");
                for (let i = 0; i < this.members.length; i++) {
                    let total = this.memberData[this.members[i]].str + this.memberData[this.members[i]].def + this.memberData[this.members[i]].dex + this.memberData[this.members[i]].cha + this.memberData[this.members[i]]['hack'];
                    if (total > 700) {
                        remaining.push(this.members[i]);
                    }
                }
                let moneylist = [];
                for (let i = 0; i < tasks.length; i++) {
                    for (let j = 0; j < remaining.length; j++) {
                        moneylist.push([tasks[i], remaining[j], ns.formulas.gang.moneyGain(gangInfo, this.memberData[remaining[j]], this.taskData[tasks[i]])])
                    }
                }
                moneylist = moneylist.sort((a, b) => { return a[2] - b[2] }).filter(x => x[2] > 0);
                let replist = [];
                for (let i = 0; i < tasks.length; i++) {
                    for (let j = 0; j < remaining.length; j++) {
                        replist.push([tasks[i], remaining[j], ns.formulas.gang.respectGain(gangInfo, this.memberData[remaining[j]], this.taskData[tasks[i]])]);
                    }
                }
                replist = replist.sort((a, b) => { return a[2] - b[2] }).filter(x => x[2] > 0);
                for (let i = 0; i < this.members.length; i++) {
                    let total = this.memberData[this.members[i]].str + this.memberData[this.members[i]].def + this.memberData[this.members[i]].dex + this.memberData[this.members[i]].cha + this.memberData[this.members[i]]['hack'];
                    if (total >= 630 && total <= 700) {
                        replist = replist.filter(x => x[0] != "Terrorism" || x[1] != this.members[i]);
                        moneylist = moneylist.filter(x => x[0] != "Terrorism" || x[1] != this.members[i]);
                    }
                }
                while (moneylist.length > 0 || replist.length > 0) {
                    if (gangInfo.territory >= .98 && [...new Set(moneylist.map(x => x[1]))].length == 1) {
                        this.nextTask[moneylist[0][1]] = "Train Combat";
                        moneylist = [];
                        replist = [];
                    }
                    if (moneylist.length > 0 && this.members.length == 12) {
                        this.nextTask[moneylist[moneylist.length - 1][1]] = moneylist[moneylist.length - 1][0];
                        remaining = remaining.filter(x => x != moneylist[moneylist.length - 1][1]);
                        replist = replist.filter(x => x[1] != moneylist[moneylist.length - 1][1]);
                        moneylist = moneylist.filter(x => x[1] != moneylist[moneylist.length - 1][1]);
                    }
                    if ((await Do(this.ns, "ns.gang.getGangInformation")).territory >= .98 && [...new Set(moneylist.map(x => x[1]))].length == 1) {
                        this.nextTask[moneylist[0][1]] = "Train Combat";
                        moneylist = [];
                        replist = [];
                    }
                    if (replist.length > 0) {
                        this.nextTask[replist[replist.length - 1][1]] = replist[replist.length - 1][0];
                        remaining = remaining.filter(x => x != replist[replist.length - 1][1]);
                        moneylist = moneylist.filter(x => x[1] != replist[replist.length - 1][1]);
                        replist = replist.filter(x => x[1] != replist[replist.length - 1][1]);
                    }
                    if (gangInfo.territory >= .98 && [...new Set(moneylist.map(x => x[1]))].length == 1) {
                        this.nextTask[moneylist[0][1]] = "Train Combat";
                        moneylist = [];
                        replist = [];
                    }
                    if (moneylist.length > 0 && this.members.length == 12) {
                        this.nextTask[moneylist[moneylist.length - 1][1]] = moneylist[moneylist.length - 1][0];
                        remaining = remaining.filter(x => x != moneylist[moneylist.length - 1][1]);
                        replist = replist.filter(x => x[1] != moneylist[moneylist.length - 1][1]);
                        moneylist = moneylist.filter(x => x[1] != moneylist[moneylist.length - 1][1]);
                    }
                    if (gangInfo.territory >= .98 && [...new Set(moneylist.map(x => x[1]))].length == 1) {
                        this.nextTask[moneylist[0][1]] = "Train Combat";
                        moneylist = [];
                        replist = [];
                    }
                }
                if (remaining.length > 0) {
                    remaining.map(x => this.nextTask[x] = "Train Combat");
                }
            }
        }
    }
    async ascendMembers() {
        let ascResult = {};
        this.members.map(x => ascResult[x] = Do(this.ns, "ns.gang.getAscensionResult", x));
        await Promise.all(Object.values(ascResult));
        let avgrespect = this.members.map(x => this.memberData[x].earnedRespect).reduce((a, b) => a + b, 0) / this.members.length;
        let ascendable = [...this.members];
        let check = {};
        members.forEach(x => check[x] = 1.66-.62/Math.exp(((2/this.memberData[x].agi_asc_mult)**2.24)));
        ascendable = ascendable.filter(x => check[x] < ascResult[x]['agi']);
        ascendable = ascendable.filter(x => this.memberData[x].respectGain < avgrespect);
        ascendable.sort((a, b) => check[b] - check[a]);
        if (avgrespect >= this.settings.minimumRespect && ascendable.length > 0) {
            for (let k = 0; k < ascendable.length; k++) {
                if (await Do(this.ns, "ns.gang.ascendMember", ascendable[k])) {
                    globalThis.gangBox.log(ascendable[k] + " ascended!");
                    k = 1000;
                }
            }
        }
    }
    async getGear() {
        // Buy equipment, but only if SQLInject.exe exists or the gang has under 12 people
        this.members.sort((a, b) => { return this.memberData[a].str_mult - this.memberData[b].str_mult; });
        let funds = (await Do(this.ns, "ns.getPlayer")).money / (members.length < 12 ? 1 : 1) / Math.min(1, ((await Do(this.ns, "ns.getTimeSinceLastAug")) / 3600000) ** 2);
        if ((await Do(this.ns, "ns.fileExists", "SQLInject.exe")) || this.members.length < 12) {
        for (let j = 0; j < this.equip.length; j++) {
                for (let i = 0; i < this.members.length; i++) {
                    let total = this.memberData[this.members[i]].str + this.memberData[this.members[i]].def + this.memberData[this.members[i]].dex + this.memberData[this.members[i]].cha + this.memberData[this.members[i]]['hack'];
                    // Buy the good stuff only once the terrorism stats are over 700.
                    if (total >= 700) {
                        if (this.equipCost[equip[j]] < funds) {
                            if (await Do(this.ns, "ns.gang.purchaseEquipment", this.members[i], this.equip[j])) {
                                globalThis.gangBox.log(this.members[i] + " now owns " + this.equip[j]);
                                funds -= this.equipCost[equip[j]];
                                i = -1;
                                await this.updateMemberData();
                                this.members.sort((a, b) => { return this.memberData[a].str_mult - this.memberData[b].str_mult; });
                            }
                        }
                    } else {
                        if (await Do(this.ns, "ns.gang.purchaseEquipment", this.members[i], "Glock 18C")) {
                            globalThis.gangBox.log(this.members[i] + " now owns Glock 18C")
                        }
                    }
                }
            }
        }
    }
    get ['getOtherGangInformation']() {
        return (async () => {
            try {
                return await Do(this.ns, "ns.gang.getOtherGangInformation");
            } catch (e) {
                return [];
            }
        })();
    }
    get ['getGangInformation']() {
        return (async () => {
            try {
                return await Do(this.ns, "ns.gang.getGangInformation");
            } catch (e) {
                return [];
            }
        })();
    }
    async Start() {
        this.taskStats = {};
        this.tasks.map(x => this.taskStats[x] = Do(this.ns, "ns.gang.getTaskStats", x));
        this.starttime = Date.now();
        this.equip = await Do(this.ns, "ns.gang.getEquipmentNames");
        this.equipCost = {};
        this.equip.sort((a, b) => { return this.equipCost[a] - this.equipCost[b] });
        while (true) {
            this.members = await Do(this.ns, "ns.gang.getMemberNames");
            await this.updateMemberData();
            this.equip.map(x => this.equipCost[x] = Do(this.ns, "ns.gang.getEquipmentCost", x));
            await Promise.all(Object.values(this.equipCost));
    
            // Chill until clash time
            while (Date.now() <= starttime) {
                await ns.asleep(0);
            }

            // Clash time
            this.members.map(x => Do(this.ns, "ns.gang.setMemberTask", x, this.nextTask[x]));
            // No hitting yourself, and gangs with no territory don't matter
            let othergangs = await Do(this.ns, "ns.gang.getOtherGangInformation");
            if (Object.keys(othergangs).filter(x => othergangs[x].territory > 0).length > 0) {
                let total = 0;
                for (let gang of Object.keys(othergangs)) {
                    total += (await Do(this.ns, "ns.gang.getChanceToWinClash", x)) * (await (this['getOtherGangInformation']))[gang].territory;
                }
                if (total / (1 - (await (this.getGangInformation)).territory) >= .5)
                    Do(this.ns, "ns.gang.setTerritoryWarfare", true);
                // If there's a high enough chance of victory against every gang, go to war.
                if ((await Promise.all(Object.keys(othergangs).map(x => Do(this.ns, "ns.gang.getChanceToWinClash", x)))).every(x => clashChance[x] >= CLASH_TARGET))
                    Do(this.ns, "ns.gang.setTerritoryWarfare", true);
                let oldterritory = Math.floor(100 * (await (this['getOtherGangInformation'])).territory);
                let startpower = (await (this['getGangInformation'])).power;

                // Chill until the clash tick processes.
                while ((await (this['getGangInformation'])).power == startpower) {
                    await ns.asleep(0);
                }
                if (oldterritory != Math.floor(100 * (await (this['getOtherGangInformation'])).territory)) {
                    globalThis.gangBox.log("Territory now " + Math.floor(100 * (await (this['getGangInformation'])).territory).toString());
                }
            }

            // Set the goal time for the next clash at 19 seconds from now.
            starttime = Date.now() + 19000;
            Do(this.ns, "ns.gang.setTerritoryWarfare", false);
        }
    }
}