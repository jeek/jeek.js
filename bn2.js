import { WholeGame } from "WholeGame.js";

// Set the members to their tasks.
async function bn2setTasks(Game, memberData, taskStats, settings) {
  if (!(await Game["Gang"]["inGang"]())) {
    return {};
  }
  let gangInfo = await Game["Gang"]["getGangInformation"]();
  memberData = await memberData;
  let members = Object.keys(memberData);
  let minimumDefense = members.length * 500;
  let taskNames = Object.keys(taskStats);
  let nextTask = {};
  /*    for (let member of members) {
        if (gangInfo.wantedLevel >= settings.wantedThreshold && gangInfo.wantedPenalty <= settings.wantedPenaltyThreshold) {
            nextTask[member] = "Vigilante Justice";
        } else {
            if (memberData[member].def < minimumDefense) {
                nextTask[member] = "Train Combat";
            } else {
                nextTask[member] = Math.random() <= settings.traffickChance ? "Traffick Illegal Arms" : "Terrorism";
            }
        }
    } */
  for (let member of members) {
    memberData[member] = await memberData[member];
  }
  members.sort((a, b) => {
    return memberData[a].earnedRespect - memberData[b].earnedRespect;
  });
  members.map((x) => (nextTask[x] = "Traffick Illegal Arms"));
  nextTask[members[0]] = "Terrorism";
  if (members.length > 6) {
    nextTask[members[1]] = "Terrorism";
  }
  if (
    gangInfo.wantedLevel >= settings.wantedThreshold &&
    gangInfo.wantedPenalty <= settings.wantedPenaltyThreshold
  ) {
    members.map((x) => (nextTask[x] = "Vigilante Justice"));
  } else {
    if (await Do(Game.ns, "ns.fileExists", "Formulas.exe")) {
      let remaining = members.filter(
        (x) =>
          memberData[x].def_exp >= minimumDefense &&
          memberData[x].str_exp >= minimumDefense &&
          memberData[x].dex_exp >= minimumDefense &&
          memberData[x].agi_exp >= minimumDefense &&
          memberData[x].hack_exp >= minimumDefense &&
          memberData[x].cha_exp >= minimumDefense
      );
      members
        .filter((x) => !remaining.includes(x))
        .filter((x) => memberData[x].cha_exp < minimumDefense)
        .map((x) => (nextTask[x] = "Train Charisma"));
      members
        .filter((x) => !remaining.includes(x))
        .filter((x) => memberData[x].hack_exp < minimumDefense)
        .map((x) => (nextTask[x] = "Train Hacking"));
      members
        .filter((x) => !remaining.includes(x))
        .filter((x) => memberData[x].dex_exp < minimumDefense)
        .map((x) => (nextTask[x] = "Train Combat"));
      members
        .filter((x) => !remaining.includes(x))
        .filter((x) => memberData[x].str_exp < minimumDefense)
        .map((x) => (nextTask[x] = "Train Combat"));
      members
        .filter((x) => !remaining.includes(x))
        .filter((x) => memberData[x].agi_exp < minimumDefense)
        .map((x) => (nextTask[x] = "Train Combat"));
      members
        .filter((x) => !remaining.includes(x))
        .filter((x) => memberData[x].def_exp < minimumDefense)
        .map((x) => (nextTask[x] = "Train Combat"));
      for (let i = 0; i < members.length; i++) {
        let total =
          memberData[members[i]].str +
          memberData[members[i]].def +
          memberData[members[i]].dex +
          memberData[members[i]].cha +
          memberData[members[i]]["hack"];
        if (total > 700) {
          remaining.push(members[i]);
        }
      }
      let moneylist = [];

      for (let i = 0; i < taskNames.length; i++) {
        for (let j = 0; j < remaining.length; j++) {
          moneylist.push([
            taskNames[i],
            remaining[j],
            Game.ns.formulas.gang.moneyGain(
              gangInfo,
              memberData[remaining[j]],
              taskStats[taskNames[i]]
            ),
          ]);
        }
      }
      moneylist = moneylist
        .sort((a, b) => {
          return a[2] - b[2];
        })
        .filter((x) => x[2] > 0);
      let replist = [];
      for (let i = 0; i < taskNames.length; i++) {
        for (let j = 0; j < remaining.length; j++) {
          replist.push([
            taskNames[i],
            remaining[j],
            Game.ns.formulas.gang.respectGain(
              gangInfo,
              memberData[remaining[j]],
              taskStats[taskNames[i]]
            ),
          ]);
        }
      }
      replist = replist
        .sort((a, b) => {
          return a[2] - b[2];
        })
        .filter((x) => x[2] > 0);
      for (let i = 0; i < members.length; i++) {
        let total =
          memberData[members[i]].str +
          memberData[members[i]].def +
          memberData[members[i]].dex +
          memberData[members[i]].cha +
          memberData[members[i]]["hack"];
        if (total >= 630 && total <= 700) {
          replist = replist.filter(
            (x) => x[0] != "Terrorism" || x[1] != members[i]
          );
          moneylist = moneylist.filter(
            (x) => x[0] != "Terrorism" || x[1] != members[i]
          );
        }
      }
      while (moneylist.length > 0 || replist.length > 0) {
        if (
          gangInfo.territory >= 0.98 &&
          [...new Set(moneylist.map((x) => x[1]))].length == 1
        ) {
          nextTask[moneylist[0][1]] = "Train Combat";
          moneylist = [];
          replist = [];
        }
        if (moneylist.length > 0 && members.length == 12) {
          nextTask[moneylist[moneylist.length - 1][1]] =
            moneylist[moneylist.length - 1][0];
          remaining = remaining.filter(
            (x) => x != moneylist[moneylist.length - 1][1]
          );
          replist = replist.filter(
            (x) => x[1] != moneylist[moneylist.length - 1][1]
          );
          moneylist = moneylist.filter(
            (x) => x[1] != moneylist[moneylist.length - 1][1]
          );
        }
        if (
          gangInfo.territory >= 0.98 &&
          [...new Set(moneylist.map((x) => x[1]))].length == 1
        ) {
          nextTask[moneylist[0][1]] = "Train Combat";
          moneylist = [];
          replist = [];
        }
        if (replist.length > 0) {
          nextTask[replist[replist.length - 1][1]] =
            replist[replist.length - 1][0];
          remaining = remaining.filter(
            (x) => x != replist[replist.length - 1][1]
          );
          moneylist = moneylist.filter(
            (x) => x[1] != replist[replist.length - 1][1]
          );
          replist = replist.filter(
            (x) => x[1] != replist[replist.length - 1][1]
          );
        }
        if (
          gangInfo.territory >= 0.98 &&
          [...new Set(moneylist.map((x) => x[1]))].length == 1
        ) {
          nextTask[moneylist[0][1]] = "Train Combat";
          moneylist = [];
          replist = [];
        }
        if (moneylist.length > 0 && members.length == 12) {
          nextTask[moneylist[moneylist.length - 1][1]] =
            moneylist[moneylist.length - 1][0];
          remaining = remaining.filter(
            (x) => x != moneylist[moneylist.length - 1][1]
          );
          replist = replist.filter(
            (x) => x[1] != moneylist[moneylist.length - 1][1]
          );
          moneylist = moneylist.filter(
            (x) => x[1] != moneylist[moneylist.length - 1][1]
          );
        }
        if (
          gangInfo.territory >= 0.98 &&
          [...new Set(moneylist.map((x) => x[1]))].length == 1
        ) {
          nextTask[moneylist[0][1]] = "Train Combat";
          moneylist = [];
          replist = [];
        }
      }
      //if (remaining.length > 0) {
      //    remaining.map(x => nextTask[x] = "Train Combat");
      //}
    }
  }
  return nextTask;
}

async function bn2ascendMembers(Game, memberData, settings) {
  let members = Object.keys(memberData);
  if (members.length < 12 && members.length <= (await Game.hours)) {
    return;
  }
  let gangInfo = await Game["Gang"]["getGangInformation"]();
  let avgrespect =
    members.map((x) => memberData[x].earnedRespect).reduce((a, b) => a + b, 0) /
    members.length;
  if (avgrespect >= settings.minimumRespect) {
    let ascendable = [...members];
    ascendable = ascendable.filter((x) =>
      ["hack_exp", "str_exp", "def_exp", "dex_exp", "agi_exp", "cha_exp"]
        .map((y) => memberData[x][y] > 1000)
        .reduce((a, b) => a || b)
    );
    let ascResult = {};
    for (let member of ascendable) {
      ascResult[member] = await Game["Gang"]["getAscensionResult"](member);
    }
    let check = {};
    if (gangInfo.territory > 0.98) {
      ascendable.forEach(
        (x) =>
          (check[x] =
            1.66 - 0.62 / Math.exp((2 / memberData[x].cha_asc_mult) ** 2.24))
      );
      ascendable = ascendable.filter((x) => check[x] < ascResult[x]["cha"]);
    } else {
      ascendable.forEach(
        (x) =>
          (check[x] =
            1.66 - 0.62 / Math.exp((2 / memberData[x].str_asc_mult) ** 2.24))
      );
      ascendable = ascendable.filter((x) => check[x] < ascResult[x]["str"]);
    }
    ascendable = ascendable.filter(
      (x) => memberData[x].earnedRespect < avgrespect
    );
    ascendable.sort((a, b) => check[b] - check[a]);
    if (ascendable.length > 0) {
      for (let k = 0; k < ascendable.length; k++) {
        if (await Game["Gang"]["ascendMember"](ascendable[k])) {
          Game["Gang"].log(ascendable[k] + " ascended!");
          k = 1000;
        }
      }
    }
  }
}

async function bn2getGear(Game, memberData, settings) {
  let members = Object.keys(memberData);
  // Buy equipment, but only if SQLInject.exe exists or the gang has under 12 people
  members.sort((a, b) => {
    return memberData[a].str_mult - memberData[b].str_mult;
  });
  let funds =
    (await Game["Player"]["money"]) /
    (members.length < 12 ? 1 : 1) /
    Math.max(
      1,
      Math.min(12, (await Do(Game.ns, "ns.getTimeSinceLastAug")) / 3600000) ** 2
    );
  //Game.ns.toast(funds);
  if (
    (await Do(Game.ns, "ns.fileExists", "SQLInject.exe")) ||
    members.length < 12
  ) {
    let equip = await Game["Gang"]["getEquipmentNames"]();
    let equipCost = {};
    equip.map((x) => (equipCost[x] = Game["Gang"]["getEquipmentCost"](x)));
    for (let x of Object.keys(equipCost)) {
      equipCost[x] = await equipCost[x];
    }
    equip.sort((a, b) => equipCost[b] - equipCost[a]);
    for (let j = 0; j < equip.length; j++) {
      for (let i of members) {
        let total =
          memberData[i].str +
          memberData[i].dex +
          memberData[i].def +
          memberData[i].cha +
          memberData[i]["hack"];
        // Buy the good stuff only once the terrorism stats are over 700.
        if (total >= 700) {
          if ((await equipCost[equip[j]]) < funds) {
            if (await Game["Gang"]["purchaseEquipment"](i, equip[j])) {
              Game["Gang"].log(i + " now owns " + equip[j]);
              funds -= equipCost[equip[j]];
              memberData[i] = await Game["Gang"]["getMemberInformation"](i);
            }
          }
        } else {
          if (await Game["Gang"]["purchaseEquipment"](i, "Glock 18C")) {
            Game["Gang"].log(i + " now owns Glock 18C");
          }
        }
      }
    }
  }
}

export async function bn2(Game, settings = {}) {
  settings["faction"] = settings["faction"] ?? "Slum Snakes";
  settings["membernames"] = settings["membernames"] ?? [];
  while (settings.membernames.length < 13) {
    settings["membernames"].push(
      [
        "Rat",
        "Ox",
        "Tiger",
        "Rabbit",
        "Dragon",
        "Snake",
        "Horse",
        "Goat",
        "Monkey",
        "Rooster",
        "Dog",
        "Pig",
        "Emu",
      ].filter((x) => !settings.membernames.includes(x))[0]
    );
  }
  await Game["Gang"]["Start"](settings["faction"]);
  settings["wantedThreshold"] = settings["wantedThreshold"] ?? 10;
  settings["clashTarget"] = settings["clashTarget"] ?? 0.5;
  settings["minimumRespect"] = settings["minimumRespect"] ?? 0;
  settings["traffickChance"] = settings["traffickChance"] ?? 0.8;
  settings["wantedPenaltyThreshold"] =
    settings["wantedPenaltyThreshold"] ?? 0.9;
  let equip = await Game["Gang"]["getEquipmentNames"]();
  let equipCost = {};
  equip.map((x) => (equipCost[x] = Game["Gang"]["getEquipmentCost"](x)));
  await Promise.all(Object.values(equipCost));
  equip.sort((a, b) => {
    return equipCost[a] - equipCost[b];
  });
  let taskNames = await Game["Gang"]["getTaskNames"]();
  let taskStats = {};
  taskNames.map((x) => (taskStats[x] = Game["Gang"]["getTaskStats"](x)));
  for (let task of taskNames) {
    taskStats[task] = await taskStats[task];
  }
  let clashTime = Date.now(); // Placeholder, set for real during first loop

  await Game["Gang"]["recruitMembers"](settings.membernames);
  while (true) {
    let members = Game["Gang"]["getMemberNames"]();
    equip.map((x) => (equipCost[x] = Game["Gang"]["getEquipmentCost"](x)));
    let memberData = {};
    await Promise.all(Object.values(equipCost));
    for (let member of await members) {
      memberData[member] = await Game["Gang"]["getMemberInformation"](member);
    }
    let nextTask = bn2setTasks(Game, memberData, taskStats, settings);
    bn2ascendMembers(Game, memberData, settings);
    bn2getGear(Game, memberData, equipCost, settings);
    Game["Gang"]["recruitMembers"](settings.membernames);

    // Wait until clash time
    while (Date.now() <= clashTime) {
      await Game.ns.asleep(Math.floor((clashTime - Date.now()) / 2));
    }

    members = Game["Gang"]["getMemberNames"]();
    // Clash time
    (await members).map((x) =>
      Game["Gang"]["setMemberTask"](x, "Territory Warfare")
    );

    let othergangs = await Game["Gang"]["getOtherGangInformation"]();
    let oldterritory = Math.floor(
      100 * (await Game["Gang"]["getGangInformation"]()).territory
    );
    let startpower = (await Game["Gang"]["getGangInformation"]()).power;
    if (
      Object.keys(othergangs).filter((x) => othergangs[x].territory > 0)
        .length > 0
    ) {
      let chances = {};
      Object.keys(othergangs)
        .filter((x) => othergangs[x].territory > 0)
        .map((x) => (chances[x] = Game["Gang"]["getChanceToWinClash"](x)));
      for (let other of Object.keys(chances)) {
        chances[other] = await chances[other];
      }
      let total = Object.keys(othergangs)
        .map((x) => chances[x] * othergangs[x].territory)
        .reduce((a, b) => a + b);
      if (
        total / (1 - (await Game["Gang"]["getGangInformation"]()).territory) >=
          settings["clashTarget"] ||
        Object.keys(chances).every((x) => chances[x] >= settings["clashTarget"])
      )
        Game["Gang"]["setTerritoryWarfare"](true);
    }

    // Wait until the clash tick processes.
    while ((await Game["Gang"]["getGangInformation"]()).power === startpower) {
      await Game.ns.asleep(0);
    }
    // Set the goal time for the next clash at 19 seconds from now.
    clashTime = Date.now() + 19000;

    Game["Gang"]["setTerritoryWarfare"](false);
    nextTask = await nextTask;
    members = Game["Gang"]["getMemberNames"]();
    (await members).map((x) =>
      Game["Gang"]["setMemberTask"](x, nextTask[x] ?? "Train Combat")
    );
    if (
      oldterritory !=
      Math.floor(100 * (await Game["Gang"]["getGangInformation"]()).territory)
    ) {
      Game["Gang"].log(
        "Territory now " +
          100 *
            (await Game["Gang"]["getGangInformation"]()).territory.toString()
      );
    }
  }
}
