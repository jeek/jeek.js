export async function bn7(Game) {
    let numberOfSleeves = await (Game.Sleeves.numSleeves);
    await Game.Sleeves.bbCombatAugs();
    await Game.Player.trainCombatStatsUpTo(100, true); // The true indicates to drag sleeves along
    if (!await Game.Bladeburner.start())
        return false;
    Game.Bladeburner.log("Start.")
    let zc = 1;
    while (await Game.Bladeburner.UpgradeSkills(zc))
        zc += 1;
    await Game.Sleeves.bbEverybody("Field analysis");
    await Game.Bladeburner.hardStop();
    while (((await (Game.Bladeburner.contractCount))+((await (Game.Bladeburner.operationCount)))) > 0) {
        if (await Game.Player.hospitalizeIfNeeded())
            Game.Bladeburner.log("Hospitalized.."); // HP
        if (await Game.Player.joinFactionIfInvited("Bladeburners"))
            Game.Bladeburner.log("Joined Bladeburner Faction..");
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
                                await Game.ns.sleep(1000);
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
        best = best.filter(x => !["Sting Operation", "Raid"].includes(x[2]));
        best = best.sort((a, b) => a[4] - b[4]);
        best = best.sort((a, b) => { if (a[2] == "Assassination" && b[2] != "Assassination") return 1; if (a[2] != "Assassination" && b[2] == "Assassination") return -1; if (a[1] == "Operation" && b[1] != "Operation") return 1; if (a[1] != "Operation" && b[1] == "Operation") return -1; return 0; });
        await Game.Sleeves.bbEverybody("Support main sleeve");
        let nextBlackOp = await (Game.Bladeburner.nextBlackOp);
        await Do(Game.ns, "ns.bladeburner.setTeamSize", "Black Op", nextBlackOp, numberOfSleeves);
		if (nextBlackOp != "0" && nextBlackOp != 0) {
			if ((await Do(Game.ns, "ns.bladeburner.getRank", "")) >= (await Do(Game.ns, "ns.bladeburner.getBlackOpRank", nextBlackOp))) {
				if ((await Do(Game.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", "Operation Ultron"))[0] > .99) {
					if ((await Do(Game.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", nextBlackOp))[0] > (["Operation Centurion", "Operation Vindictus", "Operation Daedalus"].includes(nextBlackOp) ? .2 : .99)) {
						best.push([0, "Black Op", nextBlackOp, "Sector-12"]);
					}
				}
			}
		}
        if (best[best.length - 1][1] != "Black Op") {
            await Do(Game.ns, "ns.bladeburner.setActionAutolevel", best[best.length - 1][1], best[best.length - 1][2], 1e6 < (await Do(Game.ns, "ns.bladeburner.getRank", "")));
            if (best[best.length - 1][3] != await Do(Game.ns, "ns.bladeburner.getCity")) {
                await Game.Bladeburner.bbCity(best[best.length - 1][3]);
            }
        }
        await Game.Bladeburner.deescalate();
        if (best[best.length - 1][1] != "Black Op") {
            await Do(Game.ns, "ns.bladeburner.setActionLevel", best[best.length - 1][1], best[best.length - 1][2], best[best.length - 1][0]);
        }
        await (Game.Bladeburner.hardStop());
        if (best[best.length - 1][1] == "Black Op") {
            await Game.Sleeves.bbEverybody("Support main sleeve");
            await Do(Game.ns, "ns.bladeburner.setTeamSize", "Black Op", best[best.length - 1][2], 1000);
        }
        await Game.Bladeburner.log(best[best.length - 1].slice(0, 4).join(" "));
        await Do(Game.ns, "ns.bladeburner.startAction", best[best.length - 1][1], best[best.length - 1][2]);
        if (best[best.length - 1][1] != "Black Op") {
            await (Game.Bladeburner.bbEverybody("Field Analysis"));
            let shox = await Game.Sleeves.bbCombatSort();
            let cur = 0;
            if ((await Do(Game.ns, "ns.bladeburner.getActionCountRemaining", "Contract", "Retirement")) >= 30) {
                await Game.Sleeves.bbDo(shox[cur], "Take on contracts", best.filter(x => x[2] == "Retirement").reverse()[0][2]);
                cur += 1;
            }
            if ((await Do(Game.ns, "ns.bladeburner.getActionCountRemaining", "Contract", "Bounty Hunter")) >= 30) {
                await Game.Sleeves.bbDo(shox[cur], "Take on contracts", best.filter(x => x[2] == "Bounty Hunter").reverse()[0][2]);
                cur += 1;
            }
            if ((await Do(Game.ns, "ns.bladeburner.getActionCountRemaining", "Contract", "Tracking")) >= 100) {
                await Game.Sleeves.bbDo(shox[cur], "Take on contracts", best.filter(x => x[2] == "Tracking").reverse()[0][2]);
                cur += 1;
            }
            if (shox.length > cur) {
                let cityChaos = await DoAll(Game.ns, "ns.bladeburner.getCityChaos", CITIES)[await (Game.Bladeburner.getCity)];
                await Game.Sleeves.bbDo(shox[cur], "Infiltrate synthoids");
                let ii = 0;
                for (let i = cur + 1; i < shox.length; i++) {
                    await Game.Sleeves.bbDo(shox[i], cityChaos < 20 ? "Field analysis" : "Diplomacy");
                    ii += 1;
                }
            }
        }
        while ((await Do(Game.ns, "ns.bladeburner.getCurrentAction")).type != "Idle" && (.6 < (await Do(Game.ns, "ns.bladeburner.getStamina")).reduce((a, b) => a / b)) && ((await Do(Game.ns, "ns.bladeburner.getActionCountRemaining", best[best.length - 1][1], best[best.length - 1][2])) > 0)) {
            for (let i = 0; i < numberOfSleeves; i++) {
                if (null == (await Do(Game.ns, "ns.sleeve.getTask", i))) {
                    await Game.Sleeves.bbDo(i, ((await Do(Game.ns, "ns.bladeburner.getCityChaos", await (Game.Bladeburner.getCity)))) < 20 ? "Infiltrate synthoids" : "Diplomacy");
                }
            }
            if (best[best.length - 1][0] == "Black Op" && .2 > ((await Do(Game.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", nextBlackOp))[0]))
                break;
            await Game.Sleeves.bbCombatAugs();
            await Game.Player.hospitalizeIfNeeded();
            while (await Game.Bladeburner.UpgradeSkills());
            await Game.Contracts.solve();
            if (await (Game.Bladeburner.hasSimulacrum))
                await Game.Grafting.checkIn("Combat");
            await Game.Hacknet.loop(1000 > (await Do(Game.ns, "ns.bladeburner.getSkillPoints")) ? "Exchange for Bladeburner SP" : "Generate Coding Contract");
            if (.999 < await Do(Game.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Black Op", nextBlackOp))
                break;
            if (best[best.length - 1][0] < await Do(Game.ns, "ns.bladeburner.getActionMaxLevel", best[best.length - 1][1], best[best.length - 1][2])) {
                if (1 == (await Do(Game.ns, "ns.bladeburner.getActionEstimatedSuccessChance", best[best.length - 1][1], best[best.length - 1][2]))[0]) {
                    best[best.length - 1][0] += 1;
                    await Do(Game.ns, "ns.bladeburner.setActionLevel", best[best.length - 1][1], best[best.length - 1][2], best[best.length - 1][0]);
                }
            }
            if (best[best.length - 1][1] == "Operation") {
                if (.94 > (((await Do(Game.ns, "ns.bladeburner.getActionEstimatedSuccessChance", "Operation", best[best.length - 1][2])))[0])) {
                    break;
                    best[best.length - 1][0] -= 1;
                    if (best[best.length - 1][0] == 0) break;
                    await Do(Game.ns, "ns.bladeburner.setActionLevel", best[best.length - 1][1], best[best.length - 1][2], best[best.length - 1][0]);
                }
            }
            if (40 <= await Do(Game.ns, "ns.bladeburner.getCityChaos", await Do(Game.ns, "ns.bladeburner.getCity")))
                break;
            await Game.ns.sleep(1000);
        }
        await (Game.Bladeburner.hardStop());
    }
    await Game.Bladeburner.inciteViolenceEverywhere();
}
