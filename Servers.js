import { Do, DoAll } from "Do.js";
import { makeNewWindow } from "Windows.js";
import { WholeGame } from "WholeGame.js";

export class Servers {
  constructor(Game) {
    this.ns = Game.ns;
    this.Game = Game;
    this.serverlist = ["home", "n00dles", "foodnstuff", "sigma-cosmetics", "joesguns", "hong-fang-tea", "harakiri-sushi", "iron-gym", "CSEC", "zer0", "nectar-net", "max-hardware", "phantasy", "neo-net", "omega-net", "silver-helix", "netlink", "crush-fitness", "computek", "johnson-ortho", "the-hub", "avmnite-02h", "rothman-uni", "I.I.I.I", "syscore", "summit-uni", "catalyst", "zb-institute", "aevum-police", "lexo-corp", "alpha-ent", "millenium-fitness", "rho-construction", "aerocorp", "global-pharm", "galactic-cyber", "snap-fitness", "omnia", "unitalife", "deltaone", "univ-energy", "zeus-med", "solaris", "defcomm", "icarus", "infocomm", "zb-def", "nova-med", "taiyang-digital", "titan-labs", "microdyne", "applied-energetics", "run4theh111z", "stormtech", "fulcrumtech", "helios", "vitalife", "omnitek", "kuai-gong", "4sigma", ".", "powerhouse-fitness", "nwo", "b-and-a", "blade", "clarkinc", "ecorp", "The-Cave", "megacorp", "fulcrumassets"];
    ["home", "n00dles", "foodnstuff", "sigma-cosmetics", "joesguns", "hong-fang-tea", "harakiri-sushi", "iron-gym", "CSEC", "zer0", "nectar-net", "max-hardware", "phantasy", "neo-net", "omega-net", "silver-helix", "netlink", "crush-fitness", "computek", "johnson-ortho", "the-hub", "avmnite-02h", "rothman-uni", "I.I.I.I", "syscore", "summit-uni", "catalyst", "zb-institute", "aevum-police", "lexo-corp", "alpha-ent", "millenium-fitness", "rho-construction", "aerocorp", "global-pharm", "galactic-cyber", "snap-fitness", "omnia", "unitalife", "deltaone", "univ-energy", "zeus-med", "solaris", "defcomm", "icarus", "infocomm", "zb-def", "nova-med", "taiyang-digital", "titan-labs", "microdyne", "applied-energetics", "run4theh111z", "stormtech", "fulcrumtech", "helios", "vitalife", "omnitek", "kuai-gong", "4sigma", ".", "powerhouse-fitness", "nwo", "b-and-a", "blade", "clarkinc", "ecorp", "The-Cave", "megacorp", "fulcrumassets"].map(x => this[x] = new Server(Game, x));
    this.log = this.ns.tprint.bind(Game.ns);
    if (this.ns.flags(cmdlineflags)['logbox']) {
      this.map = this.Game.sidebar.querySelector(".servermap") || this.Game.createSidebarItem("Server Map", "", "S", "servermap");
      this.mapbody = this.map.body;
      this.mapbody.innerHTML = "<canvas width=1000 height=1000 id='servermap'></canvas>";
      this.map.recalcHeight();
      this.map = this.map.log;
      this.log = this.Game.sidebar.querySelector(".serverbox") || this.Game.createSidebarItem("Servers", "", "S", "serverbox");
      this.body = this.log.body;
      this.body.innerHTML = "<canvas width=1000 height=1000 id='servermap'></canvas>";
      this.log.recalcHeight();
      this.log = this.log.log;
      
    }
	this.ratio = -1;
	this.buyHacknet = true;
	this.buyPurchased = true;
	this.purchaser();
  }
  async serverbox() {
    if (this.ns.flags(cmdlineflags)['logbox']) {
      while (true) {
        let servers = new Set();
        let serverdata = {};
        servers.add("home");
        for (let server of servers) {
          for (let addable of await Do(this.ns, "ns.scan", server)) {
            servers.add(addable);
            serverdata[server] = await Do(this.ns, "ns.getServer", server);
          }
        }
        this.body.innerHTML = "<TABLE>";
        Object.keys(serverdata).sort((a, b) => b['maxRam'] - a['maxRam']).map(x =>
          this.box.innerHTML += x['hasAdminRights'] ? ("<TR><TD>" + x + "</TD><TD>" + serverdata['ramUsed'].toString() + "</TD><TD>" + serverdata['maxRam'].toString() + "</TD><TD>" + jFormat(serverdata['moneyAvailable'], "$") + "</TD><TD>" + jFormat(serverdata['moneyMax'],"$") + "</TD></TR>") : "");
        this.body.innerHTML += "</TABLE>";
        
      }
    }
  }
  async servermap() {
    if (this.ns.flags(cmdlineflags)['logbox']) {
      let layout = [[], ['home']];
      let purchasedServers = await Do(this.ns, "ns.getPurchasedServers");
      let scans = {};
      for (let i = 1; i < layout.length; i++) {
        for (let j = 0; j < layout[i].length; j++) {
          scans[layout[i][j]] = await Do(this.ns, "ns.scan", layout[i][j]);
          let possible = await Do(this.ns, "ns.scan", layout[i][j]);
          for (let server of possible) {
            let addThis = true;
            if (i > 0 && layout[i - 1].includes(server)) {
              addThis = false;
            }
            if (layout[i].includes(server)) {
              addThis = false;
            }
            if (i + 1 < layout.length && layout[i + 1].includes(server)) {
              addThis = false;
            }
            if (server.indexOf("hacknet") > -1) {
              addThis = false;
            }
            if (purchasedServers.includes(server)) {
              addThis = false;
            }
            if (addThis) {
              if (i + 1 >= layout.length) {
                layout.push([]);
              }
              if (layout[i][j] == 'home' && (await Do(this.ns, "ns.scan", server)).length == 1) {
                layout[i - 1].push(server);
                scans[server] = await Do(this.ns, "ns.scan", server);
              } else {
                layout[i + 1].push(server);
              }
            }
          }
        }
      }
      let heights = [0];
      while (heights.length < layout.length) {
        heights.push(heights[heights.length - 1] + 950 / layout.length);
      }
      let c = eval("document").getElementById("servermap");
      let ctx = c.getContext("2d");
      let minsec = {};
      let sec = {};
      let maxmon = {};
      let mon = {};
      await Promise.all(Object.values(scans));
      while (true) {
        Object.keys(scans).map(x => minsec[x] = Do(this.ns, "ns.getServerMinSecurityLevel", x));
        Object.keys(scans).map(x => sec[x] = Do(this.ns, "ns.getServerSecurityLevel", x));
        Object.keys(scans).map(x => mon[x] = Do(this.ns, "ns.getServerMoneyAvailable", x));
        Object.keys(scans).map(x => maxmon[x] = Do(this.ns, "ns.getServerMaxMoney", x));
        for (let server of Object.keys(scans)) {
          minsec[server] = await minsec[server];
          sec[server] = await sec[server];
          mon[server] = await mon[server];
          maxmon[server] = await maxmon[server];
        }

        ctx = c.getContext("2d");
        ctx.beginPath();
        ctx.fillStyle = "#000000";
        ctx.rect(0, 0, 1000, 1000);
        ctx.fill();
        for (let i = 0; i < layout.length; i++) {
          for (let j = 0; j < layout[i].length; j++) {
            let server = layout[i][j];
            let myX = 375;
            if (layout[i].length > 1) {
              myX = 750 / (layout[i].length - 1) * layout[i].findIndex(x => x === server);
            }
            let myY = heights[i];
            if (i + 1 < layout.length) {
              let connectTo = scans[server].filter(x => layout[i + 1].includes(x));
              for (let target of connectTo) {
                let theirX = 375;
                if (layout[i + 1].length > 1) {
                  theirX = 750 / (layout[i + 1].length - 1) * layout[i + 1].findIndex(x => x === target);
                }
                let theirY = heights[i + 1];
                ctx = c.getContext("2d");
                ctx.beginPath();
                ctx.strokeStyle = "#00FFFF";
                ctx.moveTo(115 + myX, 25 + myY);
                ctx.lineTo(115 + theirX, 25 + theirY);
                ctx.stroke();
              }
            }
            ctx = c.getContext("2d");
            let security = ((await (sec[server])) - (await (minsec[server]))) / (99 - (await minsec[server]));
            ctx.beginPath();
            ctx.strokeStyle = "#FF0000";
            ctx.fillStyle = "#FF0000";
            ctx.arc(myX + 115, myY + 25, 15, -Math.PI / 2 + Math.PI * (1 - security), Math.PI / 2);
            ctx.lineTo(myX + 115, myY + 25);
            ctx.fill();

            ctx = c.getContext("2d");
            let money = (await (mon[server])) / (await (maxmon[server]));
            ctx.beginPath();
            ctx.strokeStyle = "#00FF00";
            ctx.fillStyle = "#00FF00";
            ctx.arc(myX + 115, myY + 25, 15, Math.PI / 2, Math.PI / 2 + Math.PI * money);
            ctx.lineTo(myX + 115, myY + 25);
            ctx.fill();

            if (isNaN(money) || money === Infinity) {
              ctx = c.getContext("2d");
              ctx.beginPath();
              ctx.strokeStyle = "#00FFFF";
              ctx.fillStyle = "#00FFFF";
              ctx.arc(myX + 115, myY + 25, 15, 0, 2 * Math.PI);
              ctx.lineTo(myX + 115, myY + 25);
              ctx.fill();
            }

            ctx = c.getContext("2d");
            ctx.font = "15px Hack";
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeStyle = "#FFFFFF";
            ctx.textAlign = "center";
            ctx.fillText(server, myX + 115, myY + 25 + 30);
          }
        }
        await this.ns.asleep(60000);
      }
    }
  }
  async pop_them_all() {
    let result = [];
    for (let program of [
      ["BruteSSH.exe", "ns.brutessh"],
      ["FTPCrack.exe", "ns.ftpcrack"],
      ["relaySMTP.exe", "ns.relaysmtp"],
      ["HTTPWorm.exe", "ns.httpworm"],
      ["SQLInject.exe", "ns.sqlinject"]]) {
      if (await Do(this.ns, "ns.singularity.purchaseTor", "")) {
        let cost = await Do(this.ns, "ns.singularity.getDarkwebProgramCost", program[0]);
        if ((0 < cost) && (cost < ((await Do(this.ns, "ns.getPlayer", "")).money))) {
          await Do(this.ns, "ns.singularity.purchaseProgram", program[0]);
        }
      }
      if ((await Do(this.ns, "ns.ls", "home")).includes(program[0])) {
        for (let server of await this.serverlist) { //FFIGNORE
          await Do(this.ns, program[1], server); //FFIGNORE
        }
      }
    }
    for (let server of await (this.serverlist)) {
      if ((await Do(this.ns, "ns.getServer", server)).openPortCount >= (await Do(this.ns, "ns.getServerNumPortsRequired", server))) {
        await Do(this.ns, "ns.nuke", server);
      }
      if (await Do(this.ns, "ns.hasRootAccess", server)) {
        result.push(server);
      }
    }
    return result;
  }
  async createDisplay() {
    this.serversWindow = await makeNewWindow("Servers", this.ns.ui.getTheme());
  }
  async updateDisplay() {
    let text = "<TABLE CELLPADDING=0 CELLSPACING = 0 BORDER=1><TR><TH>Name</TD><TH>Popped</TD></TR>";
    for (let server of this.serverlist) {
      text += "<TR><TD>" + server + "</TD><TD ALIGN=CENTER>" + ((await Do(this.ns, "ns.hasRootAccess", server)) ? "✅" : "❌") + "</TD></TR>";
    }
    text += "</TABLE>";
    this.serversWindow.update(text);
    await this.ns.asleep(1000);
  }
  async purchaser() {
    while (true) {
      let costs = [];
	  if (this.buyPurchased) {
      if ((await Do(this.ns, "ns.getPurchasedServers")).length < (await Do(this.ns, "ns.getPurchasedServerLimit"))) {
        for (let i = 1; (2 ** i) <= (await Do(this.ns, "ns.getPurchasedServerMaxRam")); i++) {
          let upgrade = {
            "name": "Purchase Server - " + (2 ** i).toString() + "GB",
            "serverName": "pserv-" + (await Do(this.ns, "ns.getPurchasedServers")).length.toString(),
            "cost": (await Do(this.ns, "ns.getPurchasedServerCost", 2 ** i)),
            "increase": 2 ** i,
            "command": "ns.purchaseServer",
            "args": ["pserv-" + (await Do(this.ns, "ns.getPurchasedServers")).length.toString(), 2 ** i]
          };
          upgrade["efficiency"] = upgrade["cost"] / upgrade["increase"];
          costs.push(upgrade);
        }
      }
      for (let serverName of (await Do(this.ns, "ns.getPurchasedServers"))) {
        let server = await Do(this.ns, "ns.getServer", serverName);
        for (let i = 1; (2 ** i) <= (await Do(this.ns, "ns.getPurchasedServerMaxRam")); i++) {
          if (2 ** i > server.maxRam) {
            let upgrade = {
              "name": "Upgrade Server - " + serverName + " " + (2 ** i).toString() + "GB",
              "serverName": serverName,
              "cost": (await Do(this.ns, "ns.getPurchasedServerUpgradeCost", serverName, 2 ** i)),
              "increase": 2 ** i - (await Do(this.ns, "ns.getServer", serverName)).maxRam,
              "command": "ns.upgradePurchasedServer",
              "args": [serverName, 2 ** i]
            };
            upgrade["efficiency"] = upgrade["cost"] / upgrade["increase"];
            costs.push(upgrade);
          }
        }
      }
	  }
	  if (this.buyHacknet) {
      if ((await Do(this.ns, "ns.hacknet.numNodes")) < (await Do(this.ns, "ns.hacknet.maxNumNodes"))) {
        for (let i = 0; (2 ** i) <= 8192; i++) {
          let upgrade = {
            "name": "Buy Hacknet Node - " + (2 ** i).toString() + "GB",
            "serverName": (await Do(this.ns, "ns.hacknet.numNodes")).toString(),
            "cost": (await Do(this.ns, "ns.hacknet.getPurchaseNodeCost")) + this.ns.formulas.hacknetServers.ramUpgradeCost(1, i),
            "increase": 2 ** i,
            "command": "ns.hacknet.purchaseNode",
            "args": []
          }
          upgrade["efficiency"] = upgrade["cost"] / upgrade["increase"];
          costs.push(upgrade);
        }
      }
      for (let node = 0; node < (await Do(this.ns, "ns.hacknet.numNodes")); node++) {
        let z = 0;
        for (let i = 0; (2 ** i) <= 8192; i++) {
          if ((2 ** i) > (await Do(this.ns, "ns.hacknet.getNodeStats", node)).ram) {
            z += 1;
            let upgrade = {
              "name": "Upgrade Hacknet Node " + node.toString() + " " + (2 ** i).toString() + "GB",
              "serverName": node.toString(),
              "cost": (await Do(this.ns, "ns.hacknet.getRamUpgradeCost", node, z)),
              "increase": 2 ** i - (await Do(this.ns, "ns.hacknet.getNodeStats", node)).ram,
              "command": "ns.hacknet.upgradeRam",
              "args": [node, z]
            }
            upgrade["efficiency"] = upgrade["cost"] / upgrade["increase"];
            costs.push(upgrade);
          }
          }
	    }
	  }
	  let funds = (await Do(this.ns, "ns.getPlayer")).money / this.ratio;
      costs = costs.filter(x => x.cost <= funds);
      costs = costs.sort((a, b) => (b.efficiency != a.efficiency) ? a.efficiency - b.efficiency : b.increase - a.increase);
      if (costs.length > 0) {
        await Do(this.ns, costs[0].command, ...(costs[0].args));
      } else {
        await this.ns.asleep(10000);
      }
    }
  }
}