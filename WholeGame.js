import { Augmentations } from "Augmentations.js";
import { Bladeburner } from "Bladeburner.js";
import { CacheServer } from "CacheServer.js";
import { Casino, roulettestart } from "Casino.js";
import { Contracts } from "Contracts.js";
// import { Corp } from "Corp.js";
import { DebugStuff } from "DebugStuff.js";
import { Gang } from "Gang.js";
import { Grafting } from "Grafting.js";
import { Hacknet } from "Hacknet.js";
import { Infiltrations } from "Infiltrations.js";
import { Jeekipedia } from "Jeekipedia.js";
import { Jobs } from "Jobs.js";
import { Player } from "Player.js";
import { ProcessList } from "ProcessList.js";
import { Servers } from "Servers.js";
import { Sleeves } from "Sleeves.js";
import { StockMarket } from "StockMarket.js";
import "Windows.js";
import "Worker.js";
import { bn7 } from "bn7.js";
import { bn8, bn8hackloop } from "bn8.js";

export class WholeGame {
	constructor(ns) {
		this.ns = ns;
		if (ns.flags(cmdlineflags)['logbox']) {
			this.sidebar = this.doc.querySelector(".sb");
			this.css = `body{--prilt:` + this.ns.ui.getTheme()['primarylight'] + `;--pri:` + this.ns.ui.getTheme()['primary'] + `;--pridk:` + this.ns.ui.getTheme()['primarydark'] + `;--successlt:` + this.ns.ui.getTheme()['successlight'] + `;--success:` + this.ns.ui.getTheme()['success'] + `;--successdk:` + this.ns.ui.getTheme()['successdark'] + `;--errlt:` + this.ns.ui.getTheme()['errorlight'] + `;--err:` + this.ns.ui.getTheme()['error'] + `;--errdk:` + this.ns.ui.getTheme()['errordark'] + `;--seclt:` + this.ns.ui.getTheme()['secondarylight'] + `;--sec:` + this.ns.ui.getTheme()['secondary'] + `;--secdk:` + this.ns.ui.getTheme()['secondarydark'] + `;--warnlt:` + this.ns.ui.getTheme()['warninglight'] + `;--warn:` + this.ns.ui.getTheme()['warning'] + `;--warndk:` + this.ns.ui.getTheme()['warningdark'] + `;--infolt:` + this.ns.ui.getTheme()['infolight'] + `;--info:` + this.ns.ui.getTheme()['info'] + `;--infodk:` + this.ns.ui.getTheme()['infodark'] + `;--welllt:` + this.ns.ui.getTheme()['welllight'] + `;--well:` + this.ns.ui.getTheme()['well'] + `;--white:#fff;--black:#000;--hp:` + this.ns.ui.getTheme()['hp'] + `;--money:` + this.ns.ui.getTheme()['money'] + `;--hack:` + this.ns.ui.getTheme()['hack'] + `;--combat:` + this.ns.ui.getTheme()['combat'] + `;--cha:` + this.ns.ui.getTheme()['cha'] + `;--int:` + this.ns.ui.getTheme()['int'] + `;--rep:` + this.ns.ui.getTheme()['rep'] + `;--disabled:` + this.ns.ui.getTheme()['disabled'] + `;--bgpri:` + this.ns.ui.getTheme()['backgroundprimary'] + `;--bgsec:` + this.ns.ui.getTheme()['backgroundsecondary'] + `;--button:` + this.ns.ui.getTheme()['button'] + `;--ff:"` + this.ns.ui.getStyles()['fontFamily'] + `";overflow:hidden;display:flex}#root{flex:1 1 calc(100vw - 500px);overflow:scroll}.sb{font:12px var(--ff);color:var(--pri);background:var(--bgsec);overflow:hidden scroll;width:399px;min-height:100%;border-left:1px solid var(--welllt)}.sb *{vertical-align:middle;margin:0;font:inherit}.sb.c{width:45px}.sb.t, .sb.t>div{transition:height 200ms, width 200ms, color 200ms}.sbitem,.box{overflow:hidden;min-height:28px;max-height:90%}.sbitem{border-top:1px solid var(--welllt);resize:vertical;width:unset !important}.sbitem.c{color:var(--sec)}.box{position:fixed;width:min-content;min-width:min-content;resize:both;background:var(--bgsec)}.box.c{height:unset !important;width:unset !important;background:none}.head{display:flex;white-space:pre;font-weight:bold;user-select:none;height:28px;align-items:center}:is(.sb,.sbitem)>.head{direction:rtl;cursor:pointer;padding:3px 0px}.box>.head{background:var(--pri);color:var(--bgpri);padding:0px 3px;cursor:move}.body{font-size:12px;flex-direction:column;height:calc(100% - 31px)}.flex,:not(.noflex)>.body{display:flex}.flex>*,.body>*{flex:1 1 auto}.box>.body{border:1px solid var(--welllt)}.sb .title{margin:0 auto;font-size:14px;line-height:}.sbitem .close{display:none}.c:not(.sb),.c>.sbitem{height:28px !important;resize:none}.box.c>.body{display:none}.box.prompt{box-shadow:0 0 0 10000px #0007;min-width:400px}.box.prompt>.head>.icon{display:none}.sb .contextMenu{opacity:0.95;resize:none;background:var(--bgpri)}.sb .contextMenu .head{display:none}.sb .contextMenu .body{height:unset;border-radius:5px}.sb .icon{cursor:pointer;font:25px "codicon";line-height:0.9;display:flex;align-items:center}.sb .icon span{display:inline-block;font:25px -ff;width:25px;text-align:center}.sb .icon svg{height:21px;width:21px;margin:2px}:is(.sb,.sbitem)>.head>.icon{padding:0px 10px}.c>.head>.collapser{transform:rotate(180deg)}.sb :is(input,select,button,textarea){color:var(--pri);outline:none;border:none;white-space:pre}.sb :is(textarea,.log){white-space:pre-wrap;background:none;padding:0px;overflow-y:scroll}.sb :is(input,select){padding:3px;background:var(--well);border-bottom:1px solid var(--prilt);transition:border-bottom 250ms}.sb input:hover{border-bottom:1px solid var(--black)}.sb input:focus{border-bottom:1px solid var(--prilt)}.sb :is(button,input[type=checkbox]){background:var(--button);transition:background 250ms;border:1px solid var(--well)}.sb :is(button,input[type=checkbox]):hover{background:var(--bgsec)}.sb :is(button,input[type=checkbox]):focus, .sb select{border:1px solid var(--sec)}.sb button{padding:3px 6px;user-select:none}.sb .ts{color:var(--infolt)}.sb input[type=checkbox]{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px}.sb input[type=checkbox]:checked::after{font:22px codicon;content:""}.g2{display:grid;grid:auto-flow auto / auto auto;gap:6px;margin:5px;place-items:center}.g2>.l{justify-self:start}.g2>.r{justify-self:end}.g2>.f{grid-column:1 / span 2;text-align:center}.hidden, .tooltip{display:none}*:hover>.tooltip{display:block;position:absolute;left:-5px;bottom:calc(100% + 5px);border:1px solid var(--welllt);background:var(--bgsec);color:var(--pri);font:14px var(--ff);padding:5px;white-space:pre}.nogrow{flex:0 1 auto !important}`;
			if (!this.sidebar) {
				// {"primarylight":"#0f0","primary":"#0c0","primarydark":"#090","successlight":"#0f0","success":"#0c0","successdark":"#090","errorlight":"#f00","error":"#c00","errordark":"#900","secondarylight":"#AAA","secondary":"#888","secondarydark":"#666","warninglight":"#ff0","warning":"#cc0","warningdark":"#990","infolight":"#69f","info":"#36c","infodark":"#039","welllight":"#444","well":"#222","white":"#fff","black":"#000","hp":"#dd3434","money":"#ffd700","hack":"#adff2f","combat":"#faffdf","cha":"#a671d1","int":"#6495ed","rep":"#faffdf","disabled":"#66cfbc","backgroundprimary":"#000","backgroundsecondary":"#000","button":"#333"};
				this.sidebar = this.doc.body.appendChild(this.elemFromHTML(`<div class="sb"><style>${this.css}</style><div class="head"><a class="icon collapser">\ueab6</a><span class=title>box.sidebar v1.1j</span></div>`));
				this.sidebar.addEventListener('keydown', e => e.stopPropagation());
				this.sidebar.querySelector('.head').addEventListener('click', () => {
					this.transition(() => this.sidebar.classList.toggle('c'));
					setTimeout(() => this.doc.querySelector(".monaco-editor") && Object.assign(this.doc.querySelector(".monaco-editor").style, { width: "0px" }), 255);
				});
				this.win._boxEdgeDetect = () => this.doc.querySelectorAll('.sb .box').forEach(box => Object.assign(box.style, { left: Math.max(Math.min(this.win.innerWidth - box.offsetWidth, box.offsetLeft), 0) + "px", top: Math.max(Math.min(this.win.innerHeight - box.offsetHeight, box.offsetTop), 0) + "px" }));
				this.win.addEventListener("resize", this.win._boxEdgeDetect);
			}
		}
		this.slp = ms => new Promise(r => setTimeout(r, ms));
		this.Servers = new Servers(ns, this);
		this.Debug = new DebugStuff(ns, this);
		this.Contracts = new Contracts(ns, this);
		this.Hacknet = new Hacknet(ns, this);
		this.StockMarket = new StockMarket(ns, this);
		this.ProcessList = new ProcessList(ns, this);
		this.Augmentations = new Augmentations(ns, this);
		this.Player = new Player(ns, this);
		this.Grafting = new Grafting(ns, this);
		this.Infiltrations = new Infiltrations(ns, this);
		// this.Corp = new Corp(ns, this);
		this.Jeekipedia = new Jeekipedia(ns, this);
		this.Casino = new Casino(ns, this);
		this.Bladeburner = new Bladeburner(ns, this, {"raid": false, "sting": false});
		this.Sleeves = new Sleeves(ns, this);
		this.Gang = new Gang(ns, this);
	}
	css = `body{--prilt:#fd0;--pri:#fd0;--pridk:#fd0;--successlt:#ce5;--success:#ce5;--successdk:#ce5;--errlt:#c04;--err:#c04;--errdk:#c04;--seclt:#28c;--sec:#28c;--secdk:#28c;--warnlt:#f70;--warn:#f70;--warndk:#f70;--infolt:#3ef;--info:#3ef;--infodk:#3ef;--welllt:#146;--well:#222;--white:#fff;--black:#000;--hp:#c04;--money:#fc7;--hack:#ce5;--combat:#f70;--cha:#b8f;--int:#3ef;--rep:#b8f;--disabled:#888;--bgpri:#000;--bgsec:#111;--button:#146;--ff:"Lucida Console";overflow:hidden;display:flex}#root{flex:1 1 calc(100vw - 400px);overflow:scroll}.sb{font:12px var(--ff);color:var(--pri);background:var(--bgsec);overflow:hidden scroll;width:399px;min-height:100%;border-left:1px solid var(--welllt)}.sb *{vertical-align:middle;margin:0;font:inherit}.sb.c{width:45px}.sb.t, .sb.t>div{transition:height 200ms, width 200ms, color 200ms}.sbitem,.box{overflow:hidden;min-height:28px;max-height:90%}.sbitem{border-top:1px solid var(--welllt);resize:vertical;width:unset !important}.sbitem.c{color:var(--sec)}.box{position:fixed;width:min-content;min-width:min-content;resize:both;background:var(--bgsec)}.box.c{height:unset !important;width:unset !important;background:none}.head{display:flex;white-space:pre;font-weight:bold;user-select:none;height:28px;align-items:center}:is(.sb,.sbitem)>.head{direction:rtl;cursor:pointer;padding:3px 0px}.box>.head{background:var(--pri);color:var(--bgpri);padding:0px 3px;cursor:move}.body{font-size:12px;flex-direction:column;height:calc(100% - 31px)}.flex,:not(.noflex)>.body{display:flex}.flex>*,.body>*{flex:1 1 auto}.box>.body{border:1px solid var(--welllt)}.sb .title{margin:0 auto;font-size:14px;line-height:}.sbitem .close{display:none}.c:not(.sb),.c>.sbitem{height:28px !important;resize:none}.box.c>.body{display:none}.box.prompt{box-shadow:0 0 0 10000px #0007;min-width:400px}.box.prompt>.head>.icon{display:none}.sb .contextMenu{opacity:0.95;resize:none;background:var(--bgpri)}.sb .contextMenu .head{display:none}.sb .contextMenu .body{height:unset;border-radius:5px}.sb .icon{cursor:pointer;font:25px "codicon";line-height:0.9;display:flex;align-items:center}.sb .icon span{display:inline-block;font:25px -ff;width:25px;text-align:center}.sb .icon svg{height:21px;width:21px;margin:2px}:is(.sb,.sbitem)>.head>.icon{padding:0px 10px}.c>.head>.collapser{transform:rotate(180deg)}.sb :is(input,select,button,textarea){color:var(--pri);outline:none;border:none;white-space:pre}.sb :is(textarea,.log){white-space:pre-wrap;background:none;padding:0px;overflow-y:scroll}.sb :is(input,select){padding:3px;background:var(--well);border-bottom:1px solid var(--prilt);transition:border-bottom 250ms}.sb input:hover{border-bottom:1px solid var(--black)}.sb input:focus{border-bottom:1px solid var(--prilt)}.sb :is(button,input[type=checkbox]){background:var(--button);transition:background 250ms;border:1px solid var(--well)}.sb :is(button,input[type=checkbox]):hover{background:var(--bgsec)}.sb :is(button,input[type=checkbox]):focus, .sb select{border:1px solid var(--sec)}.sb button{padding:3px 6px;user-select:none}.sb .ts{color:var(--infolt)}.sb input[type=checkbox]{appearance:none;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px}.sb input[type=checkbox]:checked::after{font:22px codicon;content:""}.g2{display:grid;grid:auto-flow auto / auto auto;gap:6px;margin:5px;place-items:center}.g2>.l{justify-self:start}.g2>.r{justify-self:end}.g2>.f{grid-column:1 / span 2;text-align:center}.hidden, .tooltip{display:none}*:hover>.tooltip{display:block;position:absolute;left:-5px;bottom:calc(100% + 5px);border:1px solid var(--welllt);background:var(--bgsec);color:var(--pri);font:14px var(--ff);padding:5px;white-space:pre}.nogrow{flex:0 1 auto !important}`;
	win = globalThis;
	doc = this.win["document"];
	ts = () => `[<span class=ts>${new Date().toLocaleTimeString("en-gb")}</span>]`;
	elemFromHTML = html => new Range().createContextualFragment(html).firstElementChild;
	createItem = (title, content, icon, ...classes) => {
		let sidebar = this.doc.querySelector(".sb");
		let item = sidebar.appendChild(this.elemFromHTML(`<div class="${classes.join(" ")}"><div class="head"><a class="icon">${icon}</a><span class=title>${title}</span><a class="icon collapser">\ueab7</a><a class="icon close">\ueab8</a></div><div class="body">${content}</div></div>`));
		Object.assign(item, {
			head: item.querySelector(".head"),
			body: item.querySelector(".body"),
			toggleType: () => ["box", "sbitem"].forEach(cl => item.classList.toggle(cl)),
			logTarget: item.querySelector(".log"),
			log: (html, timestamp = true) => {
				if (!item.logTarget || !this.doc.contains(item.logTarget)) item.logTarget = item.body.appendChild(this.elemFromHTML("<div class=log></div>"));
				let logEntry = item.logTarget.appendChild(this.elemFromHTML(`<p>${timestamp ? this.ts() : ""} ${html}</p>`));
				try {
					while ((item.logTarget.innerHTML.match(/\<p\>/g) || []).length>item.sizeM) {
					    item.logTarget.innerHTML = item.logTarget.innerHTML.slice(item.logTarget.innerHTML.indexOf("<p>", 3));
					}
				} catch { }
				item.logTarget.scrollTop = item.logTarget.scrollHeight;
				item.recalcHeight();
				return logEntry;
			},
			sizeM: 10,
			recalcHeight: () => { item.style.height = ""; item.style.height = item.offsetHeight + "px" },
			contextItems: {},
			addContextItem: (name, fn, cFn = () => 1) => item.contextItems[name] = { fn: fn, cFn: cFn },
		});

		[["Remove Item", () => item["remove"]()],
		["Cancel", () => 0],
		["Float to Top", () => this.sidebar.querySelector(".head").insertAdjacentElement("afterEnd", item), () => item.classList.contains("sbitem")],
		["Sink to Bottom", () => this.sidebar.appendChild(item), () => item.classList.contains("sbitem")],
		["Toggle Type", () => item.toggleType()],
		["Recalculate Height", item.recalcHeight]].forEach(zargs => item.addContextItem(...zargs));

		item.addEventListener('mousedown', e => item.classList.contains("box") && Object.assign(item.style, { zIndex: this.zIndex() }));
		item.head.addEventListener('mousedown', e => {
			if (item.classList.contains("sbitem")) return e.button || this.transition(() => item.classList.toggle("c"));
			if (e.target.tagName === "A") return;
			let x = e.clientX, y = e.clientY, l = item.offsetLeft, t = item.offsetTop;
			let boxDrag = e => Object.assign(item.style, { left: Math.max(Math.min(this.win.innerWidth - item.offsetWidth, l + e.clientX - x), 0) + "px", top: Math.max(Math.min(this.win.innerHeight - item.offsetHeight, t + e.clientY - y), 0) + "px" });
			let boxDragEnd = e => this.doc.removeEventListener('mouseup', boxDragEnd) || this.doc.removeEventListener('mousemove', boxDrag);
			this.doc.addEventListener('mouseup', boxDragEnd) || this.doc.addEventListener('mousemove', boxDrag);
		});
		item.head.querySelector(".close").addEventListener('click', e => item["remove"]());
		item.head.querySelector(".collapser").addEventListener('click', e => item.classList.contains("box") && this.transition(() => item.classList.toggle("c") || this.win._boxEdgeDetect()));
		item.head.addEventListener("contextmenu", e => e.preventDefault() || this.contextMenu(item, e.clientX, e.clientY));
		Object.assign(item.style, { left: Math.floor(this.win.innerWidth / 2 - item.offsetWidth / 2) + "px", top: Math.floor(this.win.innerHeight / 2 - item.offsetHeight / 2) + "px", height: (item.offsetHeight || 200) + "px", width: (item.offsetWidth || 200) + "px", zIndex: this.zIndex() });
		return item;
	}
	createBox = (title, content, icon = "\uea74", ...classes) => this.createItem(title, content, icon, ...classes, "box");
	createSidebarItem = (title, content, icon = "\uea74", ...classes) => this.createItem(title, content, icon, ...classes, "sbitem");
	confirm = text => {
		let box = this.createBox("Confirmation Prompt", `<div class=g2><div class=f>${text}</div><button class=r><u>Y</u>es</button><button class=l><u>N</u>o</button></div>`, "", "prompt");
		box.querySelector("button").focus();
		box.addEventListener('keyup', e => (e.key.toLowerCase() === "y" && box.querySelector("button").click()) || (e.key.toLowerCase() === "n" && box.querySelectorAll("button")[1].click()));
		return new Promise(r => box.querySelectorAll("button").forEach((button, i) => button.addEventListener('click', () => box["remove"](r(i == 0)))));
	};
	prompt = text => {
		let box = this.createBox("Input Prompt", `<div class=g2><div class=f>${text}</div><input class=r /><button class=l>Submit</button></div>`, "", "prompt");
		box.querySelector("input").focus();
		box.querySelector("input").addEventListener('keyup', e => e.key == 'Enter' && box.querySelector("button").click());
		return new Promise(r => box.querySelector("button").addEventListener('click', () => box["remove"](r(box.querySelector("input").value))));
	};
	select = (text, options) => {
		let box = this.createBox("Selection Prompt", `<div class=g2><div class=f>${text}</div><select class=r>${options.map(option => `<option value="${option}">${option}</option>`).join("")}</select><button class=l>Submit</button></div>`, "", "prompt");
		box.querySelector("select").focus();
		return new Promise(r => box.querySelector("button").addEventListener('click', () => box["remove"](r(box.querySelector("select").value))));
	};
	alert = text => {
		let box = this.createBox("Alert Message", `<div class=g2><div class=f>${text}</div><button class=f>Ok</button></div>`, "", "prompt");
		box.querySelector("button").focus();
		return new Promise(r => box.querySelector("button").addEventListener('click', () => r(box["remove"]())));
	};
	contextMenu = (item, x, y) => {
		if (item.classList.contains("prompt")) return;
		let options = Object.entries(item.contextItems).filter(([name, entry]) => entry.cFn());
		let box = this.createBox("", `<div class=g2><div class=f>${item.querySelector(".title").innerText}.context</div>${options.map(([name, entry]) => `<button class=n>${name}</button>`).join("")}</div>`, "", "contextMenu");
		box.querySelector("button").focus();
		Object.assign(box.style, { left: Math.max(Math.min(this.win.innerWidth - box.offsetWidth / 2, x), box.offsetWidth / 2) + "px", top: Math.max(Math.min(this.win.innerHeight - box.offsetHeight / 2, y), box.offsetHeight / 2) + "px", transform: "translate(-50%, -50%)" });
		box.querySelectorAll("button").forEach(button => button.addEventListener("click", () => box["remove"](item.contextItems[button.innerText].fn())));
		box.addEventListener("mousedown", e => e.stopPropagation());
		let docFunction = () => box["remove"](this.doc.removeEventListener("mousedown", docFunction));
		setTimeout(() => this.doc.addEventListener("mousedown", docFunction), 10);
	};
	transition = fn => {
		let sidebar = this.doc.querySelector(".sb");
		sidebar.classList.add("t");
		fn();
		setTimeout(() => this.sidebar.classList["remove"]("t"), 200);
	}
	zIndex = () => Math.max(9000, ...[...this.doc.querySelectorAll(".sb .box")].map(box => box.style.zIndex)) + 1;

	get bitNodeN() {
		return (async () => {
			try {
				return (await (this.Player.bitNodeN));
			} catch (e) {
				return 1;
			}
		})();
	}
	async winGame() {
		let parent = {};
		let path = ["The-Cave"];
		while (path[0] != "home") {
			path.unshift((await Do(this.ns, "ns.scan", path[0]))[0]);
			this.ns.tprint(path);
		}
		while (path.length > 0) {
			await Do(this.ns, "ns.singularity.connect", path.shift());
		}
		await Do(this.ns, "ns.singularity.connect", "w0r1d_d43m0n");
		for (let i of ["ns.brutessh", "ns.ftpcrack", "ns.sqlinject", "ns.relaysmtp", "ns.httpworm", "ns.nuke"]) {
			await Do(this.ns, i, "w0r1d_d43m0n"); // FFIGNORE
		}
		await Do(this.ns, "await ns.singularity.installBackdoor");
	}
	async SoftReset() {
		writeIfNotSame(this.ns, "/temp/restart.js", "export async function main(ns) {ns.spawn('jeek.js', 1, \"" + this.ns.args.join('","') + "\");}")
		await Do(this.ns, "ns.singularity.softReset", "/temp/restart.js");
	}
	async roulettestart() {
		return await roulettestart(this);
	}
	async bn7() {
		return await bn7(this);
	}
	async bn8() {
		return await bn8(this);
	}
	async bn8hackloop() {
		return await bn8hackloop(this);
	}
}
