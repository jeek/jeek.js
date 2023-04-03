import { main as prep } from "/jeek/prep.js";

/** @param {NS} ns **/

function fGetServer(ns, serverName) {
  var data = ns.getServer(serverName);
  if (serverName == "home") {
    data.maxRam = Math.max(0, data.maxRam - 200);
    data.ramUsed = Math.max(0, data.ramUsed);
  }
  return data;
}

export async function main(ns) {
  //	if (!ns.hasRootAccess(ns.args[0])) {
  //		ns.spawn('/jeek/start.js');
  //	}
  ns.write(
    "/jeek/hack.js",
    "export async function main(ns) { await ns.hack(ns.args[0])}",
    "w"
  );
  ns.write(
    "/jeek/grow.js",
    "export async function main(ns) { await ns.grow(ns.args[0])}",
    "w"
  );
  ns.write(
    "/jeek/weaken.js",
    "export async function main(ns) { await ns.weaken(ns.args[0])}",
    "w"
  );
  var startlevel = ns.getPlayer()["hacking"];
  var pickServers = ["home"];
  var trustForm = true;
  for (var i = 0; i < pickServers.length; i++) {
    var procs = ns.ps(pickServers[i]);
    for (var j = 0; j < procs.length; j++) {
      if (
        procs[j].filename == "/jeek/hack.js" ||
        procs[j].filename == "/jeek/weaken.js" ||
        procs[j].filename == "/jeek/grow.js"
      ) {
        //			ns.kill(procs[j].pid);
      }
    }
    var current = ns.scan(pickServers[i]);
    for (var j = 0; j < current.length; j++) {
      if (!pickServers.includes(current[j])) {
        pickServers.push(current[j]);
      }
    }
  }
  ns.disableLog("disableLog");
  ns.disableLog("getServerUsedRam");
  ns.disableLog("getServerMaxRam");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("scp");
  ns.disableLog("sleep");
  ns.disableLog("run");
  await ns.writePort(19, "PREP " + ns.args[0]);
  var resolution = 30;
  var ratio = Math.log(ns.getServerMaxRam("home")) / Math.log(2) / 30;
  var pids = [];
  var debug = false;
  var didone = false;
  //	var pickServers = ns.getPurchasedServers();
  var pickServers = ["home"];
  for (var i = 0; i < pickServers.length; i++) {
    if (pickServers[i] != "home") {
      await ns.scp("/jeek/hack.js", pickServers[i]);
      await ns.scp("/jeek/weaken.js", pickServers[i]);
      await ns.scp("/jeek/grow.js", pickServers[i]);
    }
    var current = ns.scan(pickServers[i]);
    for (var j = 0; j < current.length; j++) {
      if (!pickServers.includes(current[j])) {
        pickServers.push(current[j]);
      }
    }
  }
  pickServers = pickServers
    .filter((x) => ns.hasRootAccess(x))
    .filter((x) => ns.getServerMaxRam(x) > 0);
  //	pickServers = pickServers.filter(x => ns.hasRootAccess(x)).filter(y => y != "home");
  // Prep -> Weaken / Grow
  await prep(ns, ns.args[0]);
  await ns.writePort(10, ratio.toString());
  while (ns.peek(10) != ratio.toString()) {
    ns.readPort(10);
  }
  ratio = Math.min(ratio, 1);
  var hackThreadsNeeded = Math.ceil(ratio / ns.hackAnalyze(ns.args[0]));
  var weaken1ThreadsNeeded = Math.ceil(hackThreadsNeeded / 25.0);
  var growThreadsNeeded = Math.ceil(
    (1 + ratio) * ns.growthAnalyze(ns.args[0], 1 / (1 - ratio * 0.99999))
  );
  var weaken2ThreadsNeeded = Math.ceil(hackThreadsNeeded / 12.5);
  var ramNeeded =
    hackThreadsNeeded * ns.getScriptRam("/jeek/hack.js") +
    (weaken1ThreadsNeeded + weaken2ThreadsNeeded) *
      ns.getScriptRam("/jeek/weaken.script") +
    growThreadsNeeded * ns.getScriptRam("/jeek/grow.script");
  var queue = []; // [timestamp, action, threads]
  await ns.writePort(19, "START " + ns.args[0]);
  // Trust Game Functions?
  var batchNo = 1;
  var minMem = Math.max(
    0.1 * hackThreadsNeeded,
    0.15 * growThreadsNeeded,
    0.15 * weaken1ThreadsNeeded,
    0.15 * weaken2ThreadsNeeded
  );
  if (trustForm) {
    var adjust = Math.max(
      ns.getWeakenTime(ns.args[0]),
      ns.getHackTime(ns.args[0]),
      ns.getGrowTime(ns.args[0])
    );
    var final = [
      ["hack", hackThreadsNeeded, adjust - ns.getHackTime(ns.args[0])],
      [
        "weaken",
        weaken1ThreadsNeeded,
        adjust - ns.getWeakenTime(ns.args[0]) + resolution,
      ],
      [
        "grow",
        growThreadsNeeded,
        adjust - ns.getGrowTime(ns.args[0]) + resolution * 2,
      ],
      [
        "weaken",
        weaken2ThreadsNeeded,
        adjust - ns.getWeakenTime(ns.args[0]) + resolution * 3,
      ],
      ["null", hackThreadsNeeded, adjust],
      ["null", hackThreadsNeeded, adjust + resolution],
      ["null", hackThreadsNeeded, adjust + resolution * 2],
      ["null", hackThreadsNeeded, adjust + resolution * 3],
      ["null", hackThreadsNeeded, adjust + resolution * 4],
    ];
  } else {
    var adjust = Math.max(weaken1Dur, weaken2Dur, hackDur, growDur);
    var final = [
      ["hack", hackThreadsNeeded, adjust - hackDur],
      ["weaken", weaken1ThreadsNeeded, adjust - weaken1Dur + resolution],
      ["grow", growThreadsNeeded, adjust - growDur + resolution * 2],
      ["weaken", weaken2ThreadsNeeded, adjust - weaken2Dur + resolution * 3],
      ["null", hackThreadsNeeded, adjust],
      ["null", hackThreadsNeeded, adjust + resolution],
      ["null", hackThreadsNeeded, adjust + resolution * 2],
      ["null", hackThreadsNeeded, adjust + resolution * 3],
      ["null", hackThreadsNeeded, adjust + resolution * 4],
    ];
  }
  //ns.tprint(ns.getServerMinSecurityLevel(ns.args[0]), " ",  ns.getServerSecurityLevel(ns.args[0]), " ",  ns.getServerMaxMoney(ns.args[0]), " ", ns.getServerMoneyAvailable(ns.args[0]));
  //ns.tprint(ns.getWeakenTime(ns.args[0]), " ", ns.getHackTime(ns.args[0]), " ", ns.getGrowTime(ns.args[0]))
  //ns.tprint(weaken1Dur, " ", hackDur, " ", growDur)
  while (true) {
    //ns.getServerMoneyAvailable(ns.args[0]) > Math.max(5, ns.getServerMaxMoney(ns.args[0]) * (1 - 2 * ratio))) {
    if (
      ns.getServerMoneyAvailable <= 1 ||
      ns.getServerMinSecurityLevel(ns.args[0]) * 5 <
        ns.getServerSecurityLevel(ns.args[0])
    ) {
      let pid = ns.run("/jeek/prep.js", 1, ns.args[0]);
      if (pid > 0) {
        while (ns.isRunning(pid)) {
          await ns.sleep(10);
        }
      } else {
        ns.spawn("/jeek/start.js");
      }
    }
    while (ns.getPlayer()["hacking"] > startlevel) {
      startlevel = ns.getPlayer()["hacking"];
      await ns.writePort(19, "DING " + startlevel.toString());
      // KILL ?
      if (true) {
        for (var i = 0; i < pickServers.length; i++) {
          var procs = ns.ps(pickServers[i]);
          for (var j = 0; j < procs.length; j++) {
            if (procs[j].filename == "/jeek/hack.js") {
              //} ||
              //	procs[j].filename == "/jeek/grow.js") {
              //							ns.kill(procs[j].pid);
            }
          }
        }
        //queue = queue.filter(x => x[1] == 'null' || x[1] == 'weaken' || x[1] == 'grow');
        //				while (ns.getServerSecurityLevel(ns.args[0]) > ns.getServerMinSecurityLevel(ns.args[0])) {
        //					await ns.sleep(1);
        //				}
      } else {
        // or just wait for current queue to flush
        var waitForPids = 1;
        while (waitForPids > 0) {
          waitForPids = 0;
          for (var i = 0; i < pickServers.length; i++) {
            var procs = ns.ps(pickServers[i]);
            for (var j = 0; j < procs.length; j++) {
              if (
                procs[j].filename == "/jeek/hack.js" ||
                procs[j].filename == "/jeek/weaken.js" ||
                procs[j].filename == "/jeek/grow.js"
              ) {
                waitForPids = waitForPids + 1;
              }
            }
          }
          await ns.sleep(1);
        }
        var queue = [];
      }
      //	var pickServers = ns.getPurchasedServers();
      var pickServers = ["home"];
      for (var i = 0; i < pickServers.length; i++) {
        if (pickServers[i] != "home") {
          await ns.scp("/jeek/hack.js", pickServers[i]);
          await ns.scp("/jeek/weaken.js", pickServers[i]);
          await ns.scp("/jeek/grow.js", pickServers[i]);
        }
        var current = ns.scan(pickServers[i]);
        for (var j = 0; j < current.length; j++) {
          if (!pickServers.includes(current[j])) {
            pickServers.push(current[j]);
          }
        }
      }
      pickServers = pickServers.filter((x) => ns.hasRootAccess(x));
      if (false) {
        // Prep -> Weaken / Grow
        while (
          ns.getServerMinSecurityLevel(ns.args[0]) <
            ns.getServerSecurityLevel(ns.args[0]) ||
          ns.getServerMoneyAvailable(ns.args[0]) <
            ns.getServerMaxMoney(ns.args[0])
        ) {
          if (
            ns.getServerMinSecurityLevel(ns.args[0]) <
            ns.getServerSecurityLevel(ns.args[0])
          ) {
            var threadsNeeded = 1;
            while (
              ns.weakenAnalyze(threadsNeeded) <
              ns.getServerSecurityLevel(ns.args[0]) -
                ns.getServerMinSecurityLevel(ns.args[0])
            ) {
              threadsNeeded = threadsNeeded += 1;
            }
            if (debug) {
              ns.tprint(threadsNeeded.toString() + " needed for first weaken");
            }
            threadsNeeded = threadsNeeded + 5;
            while (threadsNeeded > 0) {
              pickServers.sort(function compare1(a, b) {
                return (
                  fGetServer(ns, a).maxRam -
                  fGetServer(ns, a).ramUsed -
                  (fGetServer(ns, b).maxRam - fGetServer(ns, b).ramUsed)
                );
              });
              if (
                fGetServer(ns, pickServers[pickServers.length - 1]).maxRam -
                  fGetServer(ns, pickServers[pickServers.length - 1]).ramUsed >
                ns.getScriptRam("/jeek/weaken.js")
              ) {
                var threadsUsed = Math.min(
                  threadsNeeded,
                  Math.floor(
                    (fGetServer(ns, pickServers[pickServers.length - 1])
                      .maxRam -
                      fGetServer(ns, pickServers[pickServers.length - 1])
                        .ramUsed) /
                      ns.getScriptRam("/jeek/weaken.js")
                  )
                );
                pids.push(
                  ns.exec(
                    "/jeek/weaken.js",
                    pickServers[pickServers.length - 1],
                    threadsUsed,
                    ns.args[0],
                    "PREP",
                    Math.random()
                  )
                );
                if (pids[pids.length - 1] > 0) {
                  threadsNeeded -= threadsUsed;
                  if (debug) {
                    ns.tprint(
                      threadsUsed.toString() +
                        " weaken threads on " +
                        ns.args[0] +
                        " running on " +
                        pickServers[pickServers.length - 1] +
                        ", " +
                        threadsNeeded.toString() +
                        " threads left to assign"
                    );
                  }
                } else {
                  pids.pop(pids.length - 1);
                }
              }
              await ns.sleep(1);
            }
          }
          // Prep -> Grow
          if (
            ns.getServerMoneyAvailable(ns.args[0]) <
            ns.getServerMaxMoney(ns.args[0])
          ) {
            var threadsNeeded =
              5 +
              Math.ceil(
                ns.growthAnalyze(
                  ns.args[0],
                  ns.getServerMaxMoney(ns.args[0]) /
                    ns.getServerMoneyAvailable(ns.args[0])
                )
              );
            if (debug) {
              ns.tprint(threadsNeeded.toString() + " needed for grow");
            }
            while (threadsNeeded > 0) {
              pickServers.sort(function compare2(a, b) {
                return (
                  fGetServer(ns, a).maxRam -
                  fGetServer(ns, a).ramUsed -
                  (fGetServer(ns, b).maxRam - fGetServer(ns, b).ramUsed)
                );
              });
              if (
                fGetServer(ns, pickServers[pickServers.length - 1]).maxRam -
                  fGetServer(ns, pickServers[pickServers.length - 1]).ramUsed >
                ns.getScriptRam("/jeek/grow.js")
              ) {
                var threadsUsed = Math.min(
                  threadsNeeded,
                  Math.floor(
                    (fGetServer(ns, pickServers[pickServers.length - 1])
                      .maxRam -
                      fGetServer(ns, pickServers[pickServers.length - 1])
                        .ramUsed) /
                      ns.getScriptRam("/jeek/grow.js")
                  )
                );
                pids.push(
                  ns.exec(
                    "/jeek/grow.js",
                    pickServers[pickServers.length - 1],
                    threadsUsed,
                    ns.args[0],
                    "PREP",
                    Math.random()
                  )
                );
                if (pids[pids.length - 1] > 0) {
                  threadsNeeded -= threadsUsed;
                  if (debug) {
                    ns.tprint(
                      threadsUsed.toString() +
                        " grow threads on " +
                        ns.args[0] +
                        " running on " +
                        pickServers[pickServers.length - 1] +
                        ", " +
                        threadsNeeded.toString() +
                        " threads left to assign"
                    );
                  }
                } else {
                  pids.pop(pids.length - 1);
                }
              }
              await ns.sleep(15);
            }
            if (debug) {
              ns.tprint(pids);
            }
            while (pids.length > 0) {
              if (ns.isRunning(pids[0])) {
                await ns.sleep(1);
              } else {
                pids.pop(0);
              }
            }
          }
          while (pids.length > 0) {
            if (ns.isRunning(pids[0])) {
              await ns.sleep(1);
            } else {
              pids.pop(0);
            }
          }
          if (debug) {
            ns.tprint("Weakened / Grew " + ns.args[0]);
          }
        }
      }
      await ns.sleep(1);
      if (
        ns.getServerMoneyAvailable(ns.args[0]) ==
          ns.getServerMaxMoney(ns.args[0]) &&
        ns.getServerMinSecurityLevel(ns.args[0]) ==
          ns.getServerSecurityLevel(ns.args[0])
      ) {
        if (trustForm) {
          var hackThreadsNeeded = Math.ceil(ratio / ns.hackAnalyze(ns.args[0]));
          var weaken1ThreadsNeeded = Math.ceil(hackThreadsNeeded / 25.0);
          var growThreadsNeeded = Math.ceil(
            (1 + ratio) *
              ns.growthAnalyze(ns.args[0], 1 / (1 - ratio * 0.99999))
          );
          var weaken2ThreadsNeeded = Math.ceil(hackThreadsNeeded / 12.5);
          var ramNeeded =
            hackThreadsNeeded * ns.getScriptRam("/jeek/hack.js") +
            (weaken1ThreadsNeeded + weaken2ThreadsNeeded) *
              ns.getScriptRam("/jeek/weaken.script") +
            growThreadsNeeded * ns.getScriptRam("/jeek/grow.script");
          var adjust = Math.max(
            ns.getWeakenTime(ns.args[0]),
            ns.getHackTime(ns.args[0]),
            ns.getGrowTime(ns.args[0])
          );
          var final = [
            ["hack", hackThreadsNeeded, adjust - ns.getHackTime(ns.args[0])],
            [
              "weaken",
              weaken1ThreadsNeeded,
              adjust - ns.getWeakenTime(ns.args[0]) + resolution,
            ],
            [
              "grow",
              growThreadsNeeded,
              adjust - ns.getGrowTime(ns.args[0]) + resolution * 2,
            ],
            [
              "weaken",
              weaken2ThreadsNeeded,
              adjust - ns.getWeakenTime(ns.args[0]) + resolution * 3,
            ],
            ["null", hackThreadsNeeded, adjust],
            ["null", hackThreadsNeeded, adjust + resolution],
            ["null", hackThreadsNeeded, adjust + resolution * 2],
            ["null", hackThreadsNeeded, adjust + resolution * 3],
            ["null", hackThreadsNeeded, adjust + resolution * 4],
          ];
        } else {
          var adjust = Math.max(weaken1Dur, weaken2Dur, hackDur, growDur);
          var final = [
            ["hack", hackThreadsNeeded, adjust - hackDur],
            ["weaken", weaken1ThreadsNeeded, adjust - weaken1Dur + resolution],
            ["grow", growThreadsNeeded, adjust - growDur + resolution * 2],
            [
              "weaken",
              weaken2ThreadsNeeded,
              adjust - weaken2Dur + resolution * 3,
            ],
            ["null", hackThreadsNeeded, adjust],
            ["null", hackThreadsNeeded, adjust + resolution],
            ["null", hackThreadsNeeded, adjust + resolution * 2],
            ["null", hackThreadsNeeded, adjust + resolution * 3],
            ["null", hackThreadsNeeded, adjust + resolution * 4],
          ];
        }
      }
    }
    // Stack Them Up
    var freeMem =
      pickServers
        .map((x) => ns.getServerMaxRam(x) - ns.getServerUsedRam(x))
        .filter((w) => w >= 0.15)
        .reduce((a, b) => a + b, 0) -
      queue
        .filter((y) => y[1] != null)
        .map((z) => ns.getScriptRam("/jeek/" + z[1] + ".js") * z[2])
        .reduce((c, d) => c + d, 0);
    if (freeMem / 4 > ramNeeded) {
      ns.run("/jeek/prep.js", 1, ns.args[0]);
      //		if (freeMem / 2 > ramNeeded && queue.length <= 80) {
      didone = true;
      var goodToGo = true;
      for (var i = 0; i < final.length; i++) {
        if (
          queue
            .filter(
              (x) =>
                (Date.now() + final[i][2] - resolution <= x[0]) &
                (Date.now() + final[i][2] + resolution >= x[0])
            )
            .filter((y) => y[1] == "null").length > 0
        ) {
          var goodToGo = false;
        }
      }
      if (goodToGo) {
        for (var i = 0; i < final.length; i++) {
          queue.push([
            Date.now() + final[i][2],
            final[i][0],
            final[i][1],
            batchNo,
          ]);
        }
        batchNo = batchNo + 1;
      } else {
        if (debug) {
          ns.tprint(
            "Collision. " +
              queue
                .filter((y) => y[1] != null)
                .map((z) => ns.getScriptRam("/jeek/" + z[1] + ".js") * z[2])
                .reduce((c, d) => c + d, 0)
                .toString()
          );
        }
      }
    } else {
      if (!didone) {
        ratio = ratio * 0.25;
        startlevel = startlevel - 1;
        var hackThreadsNeeded = Math.ceil(ratio / ns.hackAnalyze(ns.args[0]));
        var weaken1ThreadsNeeded = Math.ceil(hackThreadsNeeded / 25.0);
        var growThreadsNeeded = Math.ceil(
          (1 + ratio) * ns.growthAnalyze(ns.args[0], 1 / (1 - ratio))
        );
        var weaken2ThreadsNeeded = Math.ceil(hackThreadsNeeded / 12.5);
        var ramNeeded =
          hackThreadsNeeded * ns.getScriptRam("/jeek/hack.js") +
          (weaken1ThreadsNeeded + weaken2ThreadsNeeded) *
            ns.getScriptRam("/jeek/weaken.script") +
          growThreadsNeeded * ns.getScriptRam("/jeek/grow.script");
      }
      if (debug) {
        ns.tprint(
          "Not enough free memory: " +
            freeMem.toString() +
            " " +
            ratio.toString()
        );
      }
    }
    if (debug) {
      ns.tprint("Queue: ", queue);
    }
    var doItNow = queue
      .filter((x) => x[0] <= Date.now())
      .filter((y) => y[1] != "null");
    queue = queue.filter((x) => x[0] > Date.now());
    //		if (ns.getServerMinSecurityLevel(ns.args[0]) != ns.getServerSecurityLevel(ns.args[0])) {
    //			doItNow = doItNow.filter(x => x[1] == 'weaken');
    //		}
    if (
      ns.getServerMaxMoney(ns.args[0]) * (1 - ratio) >
      ns.getServerMoneyAvailable(ns.args[0])
    ) {
      doItNow = doItNow.map((x) =>
        x[1] != "hack" ? x : [x[0], "grow", x[2], x[3]]
      );
    }
    for (var i = 0; i < doItNow.length; i++) {
      var threadsNeeded = doItNow[i][2];
      while (threadsNeeded > 0) {
        pickServers.sort(function compare3(a, b) {
          return (
            fGetServer(ns, a).maxRam -
            fGetServer(ns, a).ramUsed -
            (fGetServer(ns, b).maxRam - fGetServer(ns, b).ramUsed)
          );
        });
        if (
          fGetServer(ns, pickServers[pickServers.length - 1]).maxRam -
            fGetServer(ns, pickServers[pickServers.length - 1]).ramUsed >
          ns.getScriptRam("/jeek/" + doItNow[i][1] + ".js")
        ) {
          var threadsUsed = Math.min(
            threadsNeeded,
            Math.floor(
              (fGetServer(ns, pickServers[pickServers.length - 1]).maxRam -
                fGetServer(ns, pickServers[pickServers.length - 1]).ramUsed) /
                ns.getScriptRam("/jeek/" + doItNow[i][1] + ".js")
            )
          );
          if (
            ns.getServerMinSecurityLevel(ns.args[0]) ==
            ns.getServerSecurityLevel(ns.args[0])
          ) {
            pids.push(
              ns.exec(
                "/jeek/" + doItNow[i][1] + ".js",
                pickServers[pickServers.length - 1],
                threadsUsed,
                ns.args[0],
                doItNow[i][3],
                Math.random()
              )
            );
            if (pids[pids.length - 1] > 0) {
              threadsNeeded -= threadsUsed;
              pids.pop(pids.length - 1);
            } else {
              await ns.sleep(1);
            }
          } else {
            await ns.sleep(0);
          }
        } else {
          await ns.sleep(1);
        }
        //				} else {
        //					await ns.sleep(1);
        //				}
      }
    }
    await ns.sleep(1);
  }
}
