export async function bn7(Game) {
    Game.Bladeburner.raid = false;
    Game.Bladeburner.sting = false;
    let numberOfSleeves = await (Game.Sleeves.numSleeves);
    await Game.Sleeves.bbCombatAugs();
    await Game.Player.trainCombatStatsUpTo(100, true); // The true indicates to drag sleeves along
    if (!await Game.Bladeburner.start())
        return false;
    Game.Bladeburner.log("Start.")
    while (true) {
        let zc = 1;
    while (await Game.Bladeburner.UpgradeSkills(zc))
        zc += 1;
            await Game.Sleeves.bbEverybody("Field analysis");
    await Game.Bladeburner.hardStop();
    while (((await (Game.Bladeburner.contractCount))+((await (Game.Bladeburner.operationCount)))) > 0) {
        Game.Hacknet.goal = (1000 > (await (Game.Bladeburner.skillPoints)) ? "Exchange for Bladeburner SP" : "Generate Coding Contract");
        if (await Game.Player.hospitalizeIfNeeded())
            Game.Bladeburner.log("Hospitalized.."); // HP
        if (await Game.Player.joinFactionIfInvited("Bladeburners"))
            Game.Bladeburner.log("Joined Bladeburner Faction..");
        if (((await (Game.Bladeburner.rank)) >= 25) && !((await (Game.Player.factions))).includes("Bladeburners")) {
            await Game.Bladeburner.joinFaction();
        await Game.Bladeburner.recoverIfNecessary(); // Stamina
        while (await Game.Bladeburner.UpgradeSkills());
        let best = [];
        for (let city of CITIES) {
            await Game.Bladeburner.bbCity(city);
            await Game.Bladeburner.deescalate(30); // Reduces Chaos to 30 if higher
            for (let action of (await (Game.Bladeburner.opNames)).concat(await (Game.Bladeburner.contractNames))) {
                if ((await (Game.Bladeburner.bbActionCount(action))) > 0) {
                    let maxlevel = await (Game.Bladeburner.maxLevel(action));
                    for (let level = maxlevel; level >= 1 ; level -= Math.ceil(maxlevel/10)) {
                        let chance = await (Game.Bladeburner.getChance(action));
                        if (chance[0] + .01 < chance[1]) {
                            await (Game.Bladeburner.hardStop());
                            await (Game.Bladeburner.fieldAnal());
                            await (Game.Sleeves.bbEverybody("Field Analysis"));
                            while (chance[0] + .01 < chance[1]) {
                                await Game.ns.asleep(1000);
                                chance = await (Game.Bladeburner.getChance(action));
                            }
                        }
                        await (Game.Bladeburner.setLevel(action, level));
                        if (bbTypes[action] == "Contract" || (await (Game.Bladeburner.getChance(action)))[0] > .95)
                            best.push([level, bbTypes[action], action, city, (await (Game.Bladeburner.bbActionCount(action)))*((await (Game.Bladeburner.getChance(action))).reduce((a, b) => (a + b) / 2) * (await (Game.Bladeburner.repGain(action, level))) / (await (Game.Bladeburner.bbActionTime(action))))]);
                    }
                    await (Game.Bladeburner.setLevel(action, maxlevel))
                }
            }
        }
        best = best.sort((a, b) => a[4] - b[4]);
        best = best.sort((a, b) => { if (a[2] == "Assassination" && b[2] != "Assassination") return 1; if (a[2] != "Assassination" && b[2] == "Assassination") return -1; if (a[1] == "Operation" && b[1] != "Operation") return 1; if (a[1] != "Operation" && b[1] == "Operation") return -1; return 0; });
        await Game.Sleeves.bbEverybody("Support main sleeve");
        let nextBlackOp = await (Game.Bladeburner.nextBlackOp);
        await Game.Bladeburner.teamSize(nextBlackOp, 1000);
		if (nextBlackOp != "0" && nextBlackOp != 0) {
			if ((await (Game.Bladeburner.rank)) >= (await Game.Bladeburner.blackOpRank(nextBlackOp))) {
				if ((await Game.Bladeburner.successChance("Operation Ultron"))[0] > .99) {
					if ((await Game.Bladeburner.successChance(nextBlackOp))[0] > (["Operation Centurion", "Operation Vindictus", "Operation Daedalus"].includes(nextBlackOp) ? .2 : .99)) {
						best.push([0, "Black Op", nextBlackOp, "Sector-12"]);
					}
				}
			}
		} else {
            Game.ns.write("/temp/bootstrap.js", "export async function main(ns){killModal(); ns.run('jeek.js', 1, '--roulettestart', '--bn7', '--bn8', '--logbox');}", 'w');
            await Do(Game.ns, "ns.singularity.destroyW0r1dD43m0n", 12, "/temp/bootstrap.js");
        }
        if (best[best.length - 1][1] != "Black Op") {
            await Game.Bladeburner.setAutoLevel(best[best.length - 1][2], 1e6 < (await (Game.Bladeburner.rank)));
            if (best[best.length - 1][3] != await (Game.Bladeburner.city)) {
                await Game.Bladeburner.bbCity(best[best.length - 1][3]);
            }
        }
        await Game.Bladeburner.deescalate();
        if (best[best.length - 1][1] != "Black Op") {
            await Game.Bladeburner.setLevel(best[best.length - 1][2], best[best.length - 1][0]);
        }
        await (Game.Bladeburner.hardStop());
        if (best[best.length - 1][1] == "Black Op") {
            await Game.Sleeves.bbEverybody("Support main sleeve");
        }
        await Game.Bladeburner.log(best[best.length - 1].slice(0, 4).join(" "));
        await Game.Bladeburner.actionStart(best[best.length - 1][2]);
        if (best[best.length - 1][1] != "Black Op") {
            await (Game.Sleeves.bbEverybody("Field Analysis"));
            let shox = await Game.Sleeves.bbCombatSort();
            let cur = 0;
            if ((await Game.Bladeburner.actionCount("Retirement")) >= 30) {
                await Game.Sleeves.bbDo(shox[cur], "Take on contracts", best.filter(x => x[2] == "Retirement").reverse()[0][2]);
                cur += 1;
            }
            if ((await  Game.Bladeburner.actionCount("Bounty Hunter")) >= 30) {
                await Game.Sleeves.bbDo(shox[cur], "Take on contracts", best.filter(x => x[2] == "Bounty Hunter").reverse()[0][2]);
                cur += 1;
            }
            if ((await  Game.Bladeburner.actionCount("Tracking")) >= 100) {
                await Game.Sleeves.bbDo(shox[cur], "Take on contracts", best.filter(x => x[2] == "Tracking").reverse()[0][2]);
                cur += 1;
            }
            if (shox.length > cur) {
                let cityChaos = await (Game.Bladeburner.chaosHere);
                await Game.Sleeves.bbDo(shox[cur], "Infiltrate synthoids");
                let ii = 0;
                for (let i = cur + 1; i < shox.length; i++) {
                    await Game.Sleeves.bbDo(shox[i], cityChaos < 20 ? "Field analysis" : "Diplomacy");
                    ii += 1;
                }
            }
        }
        while ((await (Game.Bladeburner.currentAction)).type != "Idle" && (Game.Bladeburner.minStamina < (await (Game.Bladeburner.stamina)).reduce((a, b) => a / b)) && ((await Game.Bladeburner.actionCount(best[best.length - 1][2])) > 0)) {
            if (best[best.length - 1][0] == "Black Op" && .2 > ((await Game.Bladeburner.successChance(nextBlackOp))[0]))
                break;
            await Game.Sleeves.bbCombatAugs();
            await Game.Player.hospitalizeIfNeeded();
            while (await Game.Bladeburner.UpgradeSkills());
            if (await (Game.Bladeburner.hasSimulacrum))
                await Game.Grafting.checkIn("Combat", true);
                if (await (Game.Bladeburner.hasSimulacrum))
                await Game.Grafting.checkIn("Charisma", true);
            Game.Hacknet.goal = (1000 > (await (Game.Bladeburner.skillPoints)) ? "Exchange for Bladeburner SP" : "Generate Coding Contract");
            if (.999 < await Game.Bladeburner.successChance(nextBlackOp))
                break;
            if (best[best.length - 1][0] < await Game.Bladeburner.actionMaxLevel(best[best.length - 1][2])) {
                if (1 == (await Game.Bladeburner.successChance(best[best.length - 1][2]))[0]) {
                    best[best.length - 1][0] += 1;
                    await Game.Bladeburner.setLevel(best[best.length - 1][2], best[best.length - 1][0]);
                }
            }
            if (best[best.length - 1][1] == "Operation") {
                if (.94 > (((await Game.Bladeburner.successChance(best[best.length - 1][2])))[0])) {
                    break;
                }
            }
            if (10 + (await (Game.Bladeburner.cityChaos)) <= await (Game.Bladeburner.chaosHere))
                break;
            await Game.ns.asleep(1000);
        }
        await (Game.Bladeburner.hardStop());
    }
    await Game.Bladeburner.inciteViolence();
}
}
