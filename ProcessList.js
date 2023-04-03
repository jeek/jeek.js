import { Do, DoAll } from "Do.js";
import { makeNewWindow } from "Windows.js";
import { WholeGame } from "WholeGame.js";

export class ProcessList {
  constructor(ns, game) {
    this.ns = ns;
    this.game = game ? game : new WholeGame(ns);
  }
  async createDisplay() {
    this.psWindow = await makeNewWindow("Process List", this.ns.ui.getTheme());

    eval("window").listenUp = (message) => {
      globalThis.psQueue.push(message);
    };
    if (typeof globalThis.psQueue === "undefined") {
      globalThis.psQueue = [];
    }
  }
  async updateDisplay() {
    let servers = ["home"];
    for (let i = 0; i < servers.length; i++) {
      let newservers = await Do(this.ns, "ns.scan", servers[i]);
      for (let server of newservers) {
        if (!servers.includes(server)) {
          servers.push(server);
        }
      }
    }

    while (globalThis.psQueue.length > 0) {
      let cmd = globalThis.psQueue.shift();
      try {
        await eval(cmd);
      } catch (e) {
        this.ns.tprint(e);
      }
    }
    let update =
      "<TABLE WIDTH=100% BORDER=1 CELLPADDING=1 CELLSPACING=1><TH>Server</TH><TH>PID</TH><TH>Filename</TH><TH>Threads</TH><TH>Filesize</TH><TH>Proc Size</TH><TH>Args</TH><TH>KILL?</TH></TR>";
    let procs = await DoAll(this.ns, "ns.ps", servers);
    for (let server of servers) {
      for (let proc of procs[server]) {
        let scriptRam = await Do(
          this.ns,
          "ns.getScriptRam",
          proc.filename,
          server
        );
        try {
          update +=
            "<TR VALIGN=TOP><TD>" +
            server +
            "</TD><TD ALIGN=RIGHT>" +
            proc.pid.toString() +
            "</TD><TD>" +
            proc.filename +
            "</TD><TD ALIGN=RIGHT>" +
            proc.threads.toString() +
            "</TD><TD ALIGN=RIGHT>" +
            scriptRam.toString() +
            "</TD><TD ALIGN=RIGHT>" +
            (proc.threads * scriptRam).toString() +
            "</TD><TD>" +
            proc.args.toString().replaceAll(",", ", ") +
            "</TD><TD ALIGN=CENTER>" +
            '<a href="#" onClick=\'window.opener.listenUp("Do(this.ns, \\"ns.kill\\", ' +
            proc.pid.toString() +
            ")\")'>KILL</A></TD></TR>";
        } catch (e) {
          this.ns.tprint(e.message);
        }
      }
    }
    update += "</TABLE>";
    this.psWindow.update(update);
    await this.ns.asleep(1000);
  }
}
