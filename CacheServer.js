import { WholeGame } from "WholeGame.js";
import { Server } from "Server.js";

export class CacheServer {
  constructor(ns, name = "home", game) {
    this.ns = ns;
    this.name = name;
    this.game = game ? game : new WholeGame(ns);
    this.server = new Server(ns, this.name, game);
  }
  async init() {
    this.backdoorInstalled = await this.server.backdoorInstalled;
    this.baseDifficulty = await this.server.baseDifficulty;
    this.cpuCores = await this.server.cpuCores;
    this.ftpPortOpen = await this.server.ftpPortOpen;
    this.hackDifficulty = await this.server.hackDifficulty;
    this.hasAdminRights = await this.server.hasAdminRights;
    this.hostname = await this.server.hostname;
    this.httpPortOpen = await this.server.httpPortOpen;
    this.ip = await this.server.ip;
    this.isConnectedTo = await this.server.isConnectedTo;
    this.maxRam = await this.server.maxRam;
    this.minDifficulty = await this.server.minDifficulty;
    this.moneyAvailable = await this.server.moneyAvailable;
    this.moneyMax = await this.server.moneyMax;
    this.numOpenPortsRequired = await this.server.numOpenPortsRequired;
    this.openPortCount = await this.server.openPortCount;
    this.organizationName = await this.server.organizationName;
    this.purchasedByPlayer = await this.server.purchasedByPlayer;
    this.ramUsed = await this.server.ramUsed;
    this.requiredHackingSkill = await this.server.requiredHackingSkill;
    this.serverGrowth = await this.server.serverGrowth;
    this.smtpPortOpen = await this.server.smtpPortOpen;
    this.sqlPortOpen = await this.server.sqlPortOpen;
    this.sshPortOpen = await this.server.sshPortOpen;
  }
  async update() {
    this.backdoorInstalled = await this.server.backdoorInstalled;
    this.cpuCores = await this.server.cpuCores;
    this.ftpPortOpen = await this.server.ftpPortOpen;
    this.hackDifficulty = await this.server.hackDifficulty;
    this.hasAdminRights = await this.server.hasAdminRights;
    this.httpPortOpen = await this.server.httpPortOpen;
    this.isConnectedTo = await this.server.isConnectedTo;
    this.moneyAvailable = await this.server.moneyAvailable;
    this.openPortCount = await this.server.openPortCount;
    this.ramUsed = await this.server.ramUsed;
    this.serverGrowth = await this.server.serverGrowth;
    this.smtpPortOpen = await this.server.smtpPortOpen;
    this.sqlPortOpen = await this.server.sqlPortOpen;
    this.sshPortOpen = await this.server.sshPortOpen;
  }
}
