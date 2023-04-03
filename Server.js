import { Do } from "Do.js";
import { WholeGame } from "WholeGame.js";

export class Server {
  constructor(ns, name = "home", game) {
    this.ns = ns;
    this.name = name;
    this.game = game ? game : new WholeGame(ns);
  }
  get backdoorInstalled() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.getServer", this.name)).backdoorInstalled;
      } catch (e) {
        return false;
      }
    })();
  }
  get baseDifficulty() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerBaseSecurityLevel", this.name);
      } catch (e) {
        return false;
      }
    })();
  }
  get cpuCores() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.getServer", this.name)).cpuCores;
      } catch (e) {
        return false;
      }
    })();
  }
  get ftpPortOpen() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.getServer", this.name)).ftpPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  get hackDifficulty() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerSecurityLevel", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get hasAdminRights() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.hasRootAccess", this.name);
      } catch (e) {
        return false;
      }
    })();
  }
  get hostname() {
    return this.name;
  }
  get httpPortOpen() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.getServer", this.name)).httpPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  get ip() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.getServer", this.name)).ip;
      } catch (e) {
        return "0.0.0.0";
      }
    })();
  }
  get isConnectedTo() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.getServer", this.name)).isConnectedTo;
      } catch (e) {
        return false;
      }
    })();
  }
  get maxRam() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerMaxRam", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get minDifficulty() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerMinSecurityLevel", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get moneyAvailable() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerMoneyAvailable", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get moneyMax() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerMaxMoney", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get numOpenPortsRequired() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.getServer", this.name))
          .numOpenPortsRequired;
      } catch (e) {
        return 6;
      }
    })();
  }
  get openPortCount() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.getServer", this.name)).openPortCount;
      } catch (e) {
        return -1;
      }
    })();
  }
  get purchasedByPlayer() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.getServer", this.name)).purchasedByPlayer;
      } catch (e) {
        return -1;
      }
    })();
  }
  get ramUsed() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerUsedRam", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get requiredHackingSkill() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerRequiredHackingLevel", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get serverGrowth() {
    return (async () => {
      try {
        return await Do(this.ns, "ns.getServerGrowth", this.name);
      } catch (e) {
        return -1;
      }
    })();
  }
  get smtpPortOpen() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.getServer", this.name)).smtpPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  get sqlPortOpen() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.getServer", this.name)).smtpPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  get sshPortOpen() {
    return (async () => {
      try {
        return (await Do(this.ns, "ns.getServer", this.name)).sshPortOpen;
      } catch (e) {
        return false;
      }
    })();
  }
  // HeinousTugboat https://discord.com/channels/415207508303544321/933455928051789944/974657897596334130
  /*  const serverNames = [
	'command-one',
	'command-two'
  ];

  const foo = await serverNames.reduce(async (prevArrPromise, serverName) => {
	const workList = await prevArrPromise;
	const serverObject = await bmCommand(ns, 'ns.getServer', serverName);

	workList.push(serverObject.x);
	return workList;
  }, []);

  console.log(foo); // [ "0.322", "0.133" ] */
  async prep() {
    let Game = this.game;
    let serverList = await Game["Servers"].pop_them_all();
    let pids = [];
    while ((await this.moneyAvailable) < (await this.moneyMax)) {
      while ((await this.hackDifficulty) > (await this.minDifficulty)) {
        pids = await serverList.reduce(async (promise, server) => {
          let w = await promise;
          if (server != "home") {
            await Do(this.ns, "ns.scp", "/temp/weaken.js", server);
            let usedRam = await Do(this.ns, "ns.getServerUsedRam", server);
            let maxRam = await Do(this.ns, "ns.getServerMaxRam", server);
            if (maxRam - usedRam >= 1.75) {
              let newPid = await Do(
                this.ns,
                "ns.exec",
                "/temp/weaken.js",
                server,
                Math.floor((maxRam - usedRam) / 1.75),
                this.name
              );
              return w.concat(newPid);
            }
          }
          return w.concat(0);
        }, []);
        pids = pids.filter((x) => x != 0);
        while (pids.length > 0) {
          await this.ns.asleep(0);
          if (!(await Do(this.ns, "ns.isRunning", pids[0]))) {
            pids.shift();
          }
        }
        if ((await this.hackDifficulty) > (await this.minDifficulty)) {
          await this.ns.asleep(0);
        }
      }
      pids = await serverList.reduce(async (promise, server) => {
        let w = await promise;
        if (server != "home") {
          await Do(this.ns, "ns.scp", "/temp/grow.js", server);
          let usedRam = await Do(this.ns, "ns.getServerUsedRam", server);
          let maxRam = await Do(this.ns, "ns.getServerMaxRam", server);
          if (maxRam - usedRam >= 1.75) {
            let newPid = await Do(
              this.ns,
              "ns.exec",
              "/temp/grow.js",
              server,
              Math.floor((maxRam - usedRam) / 1.75),
              this.name
            );
            return w.concat(newPid);
          }
        }
        return w.concat(0);
      }, []);
      pids = pids.filter((x) => x != 0);
      while (pids.length > 0) {
        await this.ns.asleep(0);
        if (!(await Do(this.ns, "ns.isRunning", pids[0]))) {
          pids.shift();
        }
      }
      if ((await this.moneyAvailable) < (await this.moneyMax)) {
        await this.ns.asleep(0);
      }
    }
    while ((await this.hackDifficulty) > (await this.minDifficulty)) {
      pids = await serverList.reduce(async (promise, server) => {
        let w = await promise;
        if (server != "home") {
          await Do(this.ns, "ns.scp", "/temp/weaken.js", server);
          let usedRam = await Do(this.ns, "ns.getServerUsedRam", server);
          let maxRam = await Do(this.ns, "ns.getServerMaxRam", server);
          if (maxRam - usedRam >= 1.75) {
            let newPid = await Do(
              this.ns,
              "ns.exec",
              "/temp/weaken.js",
              server,
              Math.floor((maxRam - usedRam) / 1.75),
              this.name
            );
            return w.concat(newPid);
          }
        }
        return w.concat(0);
      }, []);
      pids = pids.filter((x) => x != 0);
      while (pids.length > 0) {
        await this.ns.asleep(0);
        if (!(await Do(this.ns, "ns.isRunning", pids[0]))) {
          pids.shift();
        }
      }
      if ((await this.hackDifficulty) > (await this.minDifficulty)) {
        await this.ns.asleep(0);
      }
    }
  }
}
