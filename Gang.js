let GANG = "Slum Snakes";
let WANTED_THRESHOLD = 10; // If your wanted level is higher than this and your penalty is greater than (1-WANTED_PENALTY_THRESHOLD)....
let WANTED_PENALTY_THRESHOLD = .9; // ... then do vigilante stuff.
let TRAFFICK_CHANCE = .8; // Odds of arms trafficking vs terrorism when there is no Formulas.exe
let REP_CHECK = 1.1; // Don't ascend anyone with over 1.1x the average rep of the group.
let MINIMUM_RESPECT = 0; // Don't start ascension until the average respect is at least this.
let CLASH_TARGET = .5; // Don't go to war until you have this much of a chance against all remaining gangs.
let ASC = 1.06;

/** @param {NS} ns **/
import { Do, DoAll } from "Do.js";
import { WholeGame } from "WholeGame.js";

export class Gang {
    constructor(ns, game) {
        this.ns = ns;
        this.game = game ? game : new WholeGame(ns);
        this.log = ns.tprint.bind(ns);
        if (ns.flags(cmdlineflags)['logbox']) {
            this.log = this.game.sidebar.querySelector(".gangbox").log || this.game.createSidebarItem("Gang", "", "G", "gangbox").log;
        }
    }
    async loop() {
        let MINIMUM_DEFENSE = 0;
        if (!ns.gang.inGang()) {
            ns.gang.createGang(GANG); // Slum Snakes rule!
        }
        if (ns.gang.inGang()) {
            let starttime = Date.now();
            while (true) {
                // Recruit as many Steves as possible.
                while (ns.gang.recruitMember("Steve-" + Math.floor(Math.random() * 100).toString()))
                    globalThis.gangBox.log("New member recruited."); // There may be some Steve collision. Oh well.
                let members = ns.gang.getMemberNames();

                // Set the Steves to their tasks.
                members.map(x => ns.gang.setMemberTask(x, (ns.gang.getGangInformation().wantedLevel >= WANTED_THRESHOLD && ns.gang.getGangInformation().wantedPenalty <= WANTED_PENALTY_THRESHOLD) ? "Vigilante Justice" : (ns.gang.getMemberInformation(x).def < MINIMUM_DEFENSE ? "Train Combat" : (Math.random() <= TRAFFICK_CHANCE ? "Traffick Illegal Arms" : "Terrorism"))));
                members.sort((a, b) => { return ns.gang.getMemberInformation(a).earnedRespect - ns.gang.getMemberInformation(b).earnedRespect; })
                members.map(x => ns.gang.setMemberTask(x, "Traffick Illegal Arms"));
                ns.gang.setMemberTask(members[0], "Terrorism");
                if (members.length > 6) {
                    ns.gang.setMemberTask(members[1], "Terrorism");
                }
                if (ns.gang.getGangInformation().wantedLevel >= WANTED_THRESHOLD && ns.gang.getGangInformation().wantedPenalty <= WANTED_PENALTY_THRESHOLD) {
                    members.map(x => ns.gang.setMemberTask(x, "Vigilante Justice"));
                } else {
                    if (ns.fileExists('Formulas.exe')) {
                        let tasks = ["Mug People", "Deal Drugs", "Strongarm Civilians", "Run a Con", "Armed Robbery", "Traffick Illegal Arms", "Threaten & Blackmail", "Human Trafficking", "Terrorism", "Vigilante Justice", "Train Combat", "Train Hacking", "Train Charisma", "Territory Warfare"];
                        MINIMUM_DEFENSE = 500 * members.length;
                        let remaining = members.filter(x => ns.gang.getMemberInformation(x).def_exp >= MINIMUM_DEFENSE && ns.gang.getMemberInformation(x).str_exp >= MINIMUM_DEFENSE && ns.gang.getMemberInformation(x).dex_exp >= MINIMUM_DEFENSE && ns.gang.getMemberInformation(x).agi_exp >= MINIMUM_DEFENSE && ns.gang.getMemberInformation(x).hack_exp >= MINIMUM_DEFENSE && ns.gang.getMemberInformation(x).cha_exp >= MINIMUM_DEFENSE);
                        members.filter(x => !remaining.includes(x)).filter(x => ns.gang.getMemberInformation(x).cha_exp < MINIMUM_DEFENSE).map(x => ns.gang.setMemberTask(x, "Train Charisma"));
                        members.filter(x => !remaining.includes(x)).filter(x => ns.gang.getMemberInformation(x).hack_exp < MINIMUM_DEFENSE).map(x => ns.gang.setMemberTask(x, "Train Hacking"));
                        members.filter(x => !remaining.includes(x)).filter(x => ns.gang.getMemberInformation(x).dex_exp < MINIMUM_DEFENSE).map(x => ns.gang.setMemberTask(x, "Train Combat"));
                        members.filter(x => !remaining.includes(x)).filter(x => ns.gang.getMemberInformation(x).str_exp < MINIMUM_DEFENSE).map(x => ns.gang.setMemberTask(x, "Train Combat"));
                        members.filter(x => !remaining.includes(x)).filter(x => ns.gang.getMemberInformation(x).agi_exp < MINIMUM_DEFENSE).map(x => ns.gang.setMemberTask(x, "Train Combat"));
                        members.filter(x => !remaining.includes(x)).filter(x => ns.gang.getMemberInformation(x).def_exp < MINIMUM_DEFENSE).map(x => ns.gang.setMemberTask(x, "Train Combat"));
                        for (let i = 0; i < members.length; i++) {
                            let total = ns.gang.getMemberInformation(members[i]).str + ns.gang.getMemberInformation(members[i]).def + ns.gang.getMemberInformation(members[i]).dex + ns.gang.getMemberInformation(members[i]).cha + ns.gang.getMemberInformation(members[i]).hack;
                            if (total > 700) {
                                remaining.push(members[i]);
                            }
                        }
                        let moneylist = [];
                        for (let i = 0; i < tasks.length; i++) {
                            for (let j = 0; j < remaining.length; j++) {
                                moneylist.push([tasks[i], remaining[j], ns.formulas.gang.moneyGain(ns.gang.getGangInformation(GANG), ns.gang.getMemberInformation(remaining[j]), ns.gang.getTaskStats(tasks[i]))])
                                //							moneylist.push([tasks[i].replace("Traffick Illegal Arms", "Train Charisma"), remaining[j], ns.formulas.gang.moneyGain(ns.gang.getGangInformation(GANG), ns.gang.getMemberInformation(remaining[j]), ns.gang.getTaskStats(tasks[i]))])
                            }
                        }
                        moneylist = moneylist.sort((a, b) => { return a[2] - b[2] }).filter(x => x[2] > 0);
                        let replist = [];
                        for (let i = 0; i < tasks.length; i++) {
                            for (let j = 0; j < remaining.length; j++) {
                                replist.push([tasks[i], remaining[j], ns.formulas.gang.respectGain(ns.gang.getGangInformation(GANG), ns.gang.getMemberInformation(remaining[j]), ns.gang.getTaskStats(tasks[i]))])
                            }
                        }
                        replist = replist.sort((a, b) => { return a[2] - b[2] }).filter(x => x[2] > 0);
                        for (let i = 0; i < members.length; i++) {
                            let total = ns.gang.getMemberInformation(members[i]).str + ns.gang.getMemberInformation(members[i]).def + ns.gang.getMemberInformation(members[i]).dex + ns.gang.getMemberInformation(members[i]).cha + ns.gang.getMemberInformation(members[i]).hack;
                            if (total >= 630 && total <= 700) {
                                replist = replist.filter(x => x[0] != "Terrorism" || x[1] != members[i]);
                                moneylist = moneylist.filter(x => x[0] != "Terrorism" || x[1] != members[i]);
                            }
                        }
                        while (moneylist.length > 0 || replist.length > 0) {
                            if (ns.gang.getGangInformation().territory >= .98 && [...new Set(moneylist.map(x => x[1]))].length == 1) {
                                ns.gang.setMemberTask(moneylist[0][1], "Train Combat");
                                moneylist = [];
                                replist = [];
                            }
                            if (moneylist.length > 0 && members.length == 12) {
                                ns.gang.setMemberTask(moneylist[moneylist.length - 1][1], moneylist[moneylist.length - 1][0]);
                                remaining = remaining.filter(x => x != moneylist[moneylist.length - 1][1]);
                                replist = replist.filter(x => x[1] != moneylist[moneylist.length - 1][1]);
                                moneylist = moneylist.filter(x => x[1] != moneylist[moneylist.length - 1][1]);
                            }
                            if (ns.gang.getGangInformation().territory >= .98 && [...new Set(moneylist.map(x => x[1]))].length == 1) {
                                ns.gang.setMemberTask(moneylist[0][1], "Train Combat");
                                moneylist = [];
                                replist = [];
                            }
                            //if (ns.gang.getGangInformation().territory < .98) {
                            if (replist.length > 0) {
                                ns.gang.setMemberTask(replist[replist.length - 1][1], replist[replist.length - 1][0]);
                                remaining = remaining.filter(x => x != replist[replist.length - 1][1]);
                                moneylist = moneylist.filter(x => x[1] != replist[replist.length - 1][1]);
                                replist = replist.filter(x => x[1] != replist[replist.length - 1][1]);
                            }
                            //}
                            if (ns.gang.getGangInformation().territory >= .98 && [...new Set(moneylist.map(x => x[1]))].length == 1) {
                                ns.gang.setMemberTask(moneylist[0][1], "Train Combat");
                                moneylist = [];
                                replist = [];
                            }
                            if (moneylist.length > 0 && members.length == 12) {
                                ns.gang.setMemberTask(moneylist[moneylist.length - 1][1], moneylist[moneylist.length - 1][0]);
                                remaining = remaining.filter(x => x != moneylist[moneylist.length - 1][1]);
                                replist = replist.filter(x => x[1] != moneylist[moneylist.length - 1][1]);
                                moneylist = moneylist.filter(x => x[1] != moneylist[moneylist.length - 1][1]);
                            }
                            if (ns.gang.getGangInformation().territory >= .98 && [...new Set(moneylist.map(x => x[1]))].length == 1) {
                                ns.gang.setMemberTask(moneylist[0][1], "Train Combat");
                                moneylist = [];
                                replist = [];
                            }
                        }
                        if (remaining.length > 0) {
                            remaining.map(x => ns.gang.setMemberTask(x, "Train Combat"));
                        }
                    }
                }
                //			members.filter(x => ns.gang.getMemberInformation(x).cha < ns.gang.getMemberInformation(x).str).map(x => ns.gang.setMemberTask(x, "Train Charisma"));
                //			members.filter(x => ns.gang.getMemberInformation(x).cha < ns.gang.getMemberInformation(x).def).map(x => ns.gang.setMemberTask(x, "Train Charisma"));
                //			members.filter(x => ns.gang.getMemberInformation(x).cha < ns.gang.getMemberInformation(x).dex).map(x => ns.gang.setMemberTask(x, "Train Charisma"));
                //			members.filter(x => ns.gang.getMemberInformation(x).cha < ns.gang.getMemberInformation(x).agi).map(x => ns.gang.setMemberTask(x, "Train Charisma"));
                //			members.filter(x => ns.gang.getMemberInformation(x).cha < ns.gang.getMemberInformation(x).hack).map(x => ns.gang.setMemberTask(x, "Train Charisma"));
                // Determine if anyone is worthy of ascension
                let avgrespect = members.map(x => ns.gang.getMemberInformation(x).earnedRespect).reduce((a, b) => a + b, 0) / members.length;
                let ascendable = ns.gang.getMemberNames().map(x => [x, ns.gang.getMemberInformation(x).agi_asc_mult]).map(x => [x[0], x[1], 3.7788304033108564 - 5.6740370173619095 * Math.log(x[1]) + 4.8545907700292741 * Math.log(x[1]) ** 2 - 1.9265566442319764 * Math.log(x[1]) ** 3 + .28974300868423875 * Math.log(x[1]) ** 4]).map(x => [x[0], x[1], x[2], ns.gang.getAscensionResult(x[0]) == null ? 1 : ns.gang.getAscensionResult(x[0])['agi']]).filter(x => x[2] < x[3] || x[3] >= 1.6).map(x => x[0]).filter(x => ns.gang.getMemberInformation(x).respectGain < avgrespect);

                //let ascendable = ns.gang.getMemberNames().map(x => [x, ns.gang.getMemberInformation(x).str_asc_mult]).map(x => [x[0], x[1], 3.7788304033108564 - 5.6740370173619095 * Math.log(x[1]) + 4.8545907700292741 * Math.log(x[1]) ** 2 - 1.9265566442319764 * Math.log(x[1]) ** 3 + .28974300868423875 * Math.log(x[1]) ** 4]).filter(x => x[1] > x[2]).map(x => x[0]);
                //let ascendable = members.filter(x => ns.gang.getAscensionResult(x) != null).sort((a, b) => { return (ns.gang.getAscensionResult(a).str + ns.gang.getAscensionResult(a).dex + ns.gang.getAscensionResult(a).def + ns.gang.getAscensionResult(a).agi + ns.gang.getAscensionResult(a).cha + ns.gang.getAscensionResult(a).hack) - (ns.gang.getAscensionResult(b).str + ns.gang.getAscensionResult(b).dex + ns.gang.getAscensionResult(b).def + ns.gang.getAscensionResult(b).cha + ns.gang.getAscensionResult(b).agi + ns.gang.getAscensionResult(b).hack) }).filter(x => ns.gang.getMemberInformation(x).earnedRespect <= REP_CHECK * avgrespect).filter(x => ns.gang.getAscensionResult(x).dex >= ASC && ns.gang.getAscensionResult(x).str >= ASC && ns.gang.getAscensionResult(x).def >= ASC && ns.gang.getAscensionResult(x).agi >= ASC && ns.gang.getAscensionResult(x).cha >= ASC && ns.gang.getAscensionResult(x).hack >= ASC);
                if (avgrespect >= MINIMUM_RESPECT && ascendable.length > 0) {
                    for (let k = 0; k < ascendable.length; k++) {
                        if (ns.gang.ascendMember(ascendable[k])) {
                            //						ns.toast(ascendable[k] + " ascended!", "success", 10000);
                            globalThis.gangBox.log(ascendable[k] + " ascended!");
                            k = 1000;
                        }
                    }
                }

                // Buy equipment, but only if SQLInject.exe exists or the gang has under 12 people
                members.sort((a, b) => { return ns.gang.getMemberInformation(a).str_mult - ns.gang.getMemberInformation(b).str_mult; });
                let funds = ns.getPlayer().money / (members.length < 12 ? 1 : 1) / Math.min(1, (ns.getTimeSinceLastAug() / 3600000) ** 2);
                if (ns.fileExists("SQLInject.exe") || members.length < 12) {
                    let equip = ns.gang.getEquipmentNames().sort((a, b) => { return ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b) });;
                    for (let j = 0; j < equip.length; j++) {
                        for (let i = 0; i < members.length; i++) {
                            let total = ns.gang.getMemberInformation(members[i]).str + ns.gang.getMemberInformation(members[i]).def + ns.gang.getMemberInformation(members[i]).dex + ns.gang.getMemberInformation(members[i]).cha + ns.gang.getMemberInformation(members[i]).hack;
                            // Buy the good stuff only once the terrorism stats are over 700.
                            if (total >= 700) {
                                if (ns.gang.getEquipmentCost(equip[j]) < funds) {
                                    if (ns.gang.purchaseEquipment(members[i], equip[j])) {
                                        globalThis.gangBox.log(members[i] + " now owns " + equip[j]);
                                        //									if (ns.getPlayer().bitNodeN == 8 && ns.getPlayer().money < 130000000) {
                                        //										ns.run('/jeekOS.js', 1, '--ripcord');
                                        //										await ns.sleep(10);
                                        //										ns.installAugmentations('/jeek/start.js');
                                        //									ns.softReset('/jeek/start.js');
                                        //}
                                        funds -= ns.gang.getEquipmentCost(equip[j]);
                                        i = -1;
                                        members.sort((a, b) => { return ns.gang.getMemberInformation(a).str_mult - ns.gang.getMemberInformation(b).str_mult; });
                                    }
                                }
                            } else {
                                if (ns.gang.purchaseEquipment(members[i], "Glock 18C")) {
                                    globalThis.gangBox.log(members[i] + " now owns Glock 18C")
                                    //								if (ns.getPlayer().bitNodeN == 8 && ns.getPlayer().money < 130000000) {
                                    //									ns.run('/jeekOS.js', 1, '--ripcord');
                                    //									await ns.sleep(10);
                                    //									ns.installAugmentations('/jeek/start.js');
                                    //									ns.softReset('/jeek/start.js');
                                    //								}
                                }
                            }
                        }
                    }
                }

                // Chill until clash time
                while (Date.now() <= starttime) {
                    await ns.sleep(0);
                }

                // Clash time
                members.map(x => ns.gang.setMemberTask(x, "Territory Warfare"));
                // No hitting yourself, and gangs with no territory don't matter
                let othergangs = Object.keys(ns.gang.getOtherGangInformation()).filter(x => x != GANG && ns.gang.getOtherGangInformation()[x].territory > 0);
                if (othergangs.length > 0) {
                    // Sporadic progress update.
                    //				othergangs.map(x => ns.toast(x + " " + ns.gang.getChanceToWinClash(x).toString(), "success", 10000));
                    let total = othergangs.map(x => ns.gang.getChanceToWinClash(x) * ns.gang.getOtherGangInformation()[x].territory).reduce((a, b) => a + b, 0);
                    if (total / (1 - ns.gang.getGangInformation().territory) >= .5)
                        ns.gang.setTerritoryWarfare(true);
                    // If there's a high enough chance of victory against every gang, go to war.
                    //				ns.toast(total / (1 - ns.gang.getGangInformation().territory));
                    if (othergangs.every(x => ns.gang.getChanceToWinClash(x) >= CLASH_TARGET))
                        ns.gang.setTerritoryWarfare(true);
                    let oldterritory = Math.floor(100 * ns.gang.getGangInformation().territory);
                    let startpower = ns.gang.getGangInformation().power;
                    // Chill until the clash tick processes.
                    while (ns.gang.getGangInformation().power == startpower) {
                        await ns.sleep(0);
                    }
                    if (oldterritory != Math.floor(100 * ns.gang.getGangInformation().territory)) {
                        globalThis.gangBox.log("Territory now " + Math.floor(100 * ns.gang.getGangInformation().territory).toString());
                    }
                }

                // Set the goal time for the next clash at 19 seconds from now.
                starttime = Date.now() + 19000;
                ns.gang.setTerritoryWarfare(false);
            }
        }
        globalThis.gangBox.log(ns.heart.break());
        ns.spawn("gangs.js");
    }
}