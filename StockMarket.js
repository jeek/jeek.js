import { Do, DoAll, DoAllComplex } from "Do.js";
import { makeNewWindow } from "Windows.js";
import { WholeGame } from "WholeGame.js";
import { jFormat } from "helpers.js";

const stockMapping = {
	"ECP": "ecorp",
	"MGCP": "megacorp",
	"BLD": "blade",
	"CLRK": "clarkinc",
	"OMTK": "omnitek",
	"FSIG": "4sigma",
	"KGI": "kuai-gong",
	"FLCM": "fulcrumtech",
	"STM": "stormtech",
	"DCOMM": "defcomm",
	"HLS": "helios",
	"VITA": "vitalife",
	"ICRS": "icarus",
	"UNV": "univ-energy",
	"AERO": "aerocorp",
	"OMN": "omnia",
	"SLRS": "solaris",
	"GPH": "global-pharm",
	"NVMD": "nova-med",
	"LXO": "lexo-corp",
	"RHOC": "rho-construction",
	"APHE": "alpha-ent",
	"SYSC": "syscore",
	"CTK": "computek",
	"NTLK": "netlink",
	"OMGA": "omega-net",
	"FNS": "foodnstuff",
	"JGN": "joesguns",
	"SGC": "sigma-cosmetics",
	"CTYS": "catalyst",
	"MDYN": "microdyne",
	"TITN": "titan-labs"
}

export class StockMarket {
	constructor(ns, Game) {
		helperScripts(ns);
		this.ns = ns;
		this.Game = Game ?? new WholeGame(ns);
		this.liquidate = false;
		this.log = ns.tprint.bind(ns);
        if (ns.flags(cmdlineflags)['logbox']) {
            this.log = this.Game.sidebar.querySelector(".stockbox") || this.Game.createSidebarItem("Stocks", "", "S", "stockbox");
			this.display = this.Game.sidebar.querySelector(".stockbox").querySelector(".display");
			this.log = this.log.log;
			this.displayBoxUpdate();
        }
	}
	async displayBoxUpdate() {
		while (this.ns.flags(cmdlineflags)['logbox']) {
			let result = "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0 WIDTH=100%>";
			result += "<TR><TH>sym</TH><TH>position</TH><TH>profit</TH><TH>value</TH></TR>";
			let market = await (this.market);
			let keys = Object.keys(market).sort((a, b) => market[b].profit - market[a].profit);
            for (let stock of keys) {
                if (market[stock]['position'][0] > 0 || market[stock]['position'][2] > 0) {
                    result += "<TR><TD>" + stock + "</TD>";
					let pos = [];
					if (market[stock]['position'][0] > 0) {
						pos.push("<RIGHT>" + market[stock]['position'][0].toString() + " L</RIGHT>");
					}
					if (market[stock]['position'][2] > 0) {
						pos.push("<RIGHT>" + market[stock]['position'][2].toString() + " S</RIGHT>");
					}
					result += "<TD ALIGN=RIGHT>" + pos.join("<BR>") + "</TD>";
					result += "<TD ALIGN=RIGHT>" + jFormat(market[stock]['profit'], "$") + "</TD>";
					result += "<TD ALIGN=RIGHT>" + jFormat(market[stock]['value'], "$") + "</TD></TR>";
				}
			}
			result += "</TABLE>";
			result = "<CENTER>Holdings: " + jFormat(Object.keys(market).map(x => market[x]['value']).reduce((a, b) => a + b, 0), "$") + " / Profit: " + jFormat(Object.keys(market).map(x => market[x]['profit']).reduce((a, b) => a + b, 0), "$") + result;
			this.display.removeAttribute("hidden");
			this.display.innerHTML = result;
            await this.ns.asleep(10000);
		}
	}
	get symbols() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.stock.getSymbols"));
			} catch (e) {
				return [];
			}
		})();
	}
	async price(stock) {
		return await Do(this.ns, "ns.stock.getPrice", stock);
	}
	async askprice(stock) {
		return await Do(this.ns, "ns.stock.getAskPrice", stock);
	}
	async bidprice(stock) {
		return await Do(this.ns, "ns.stock.getBidPrice", stock);
	}
	async volatility(stock) {
		return await Do(this.ns, "ns.stock.getVolatility", stock);
	}
	async forecast(stock) {
		return await Do(this.ns, "ns.stock.getForecast", stock);
	}
	company(stock) {
		return stockSymbolToCompany[stock];
	}
	async position(stock) {
		return await Do(this.ns, "ns.stock.getPosition", stock);
	}
	async longsalevalue(stock) {
		return await Do(this.ns, "ns.stock.getSaleGain", stock, this.position(stock)[0], "Long");
	}
	async shortsalevalue(stock) {
		return await Do(this.ns, "ns.stock.getSaleGain", stock, this.position(stock)[2], "Short");
	}
	async value(stock) {
		let pos = await this.position(stock);
		return await Do(this.ns, "ns.stock.getSaleGain", stock, pos[0], "Long") + await Do(this.ns, "ns.stock.getSaleGain", stock, pos[2], "Short");
	}
	async profit(stock) {
		let pos = await this.position(stock);
		return await Do(this.ns, "ns.stock.getSaleGain", stock, pos[0], "Long") + await Do(this.ns, "ns.stock.getSaleGain", stock, pos[2], "Short") - pos[0] * pos[1] - pos[2] * pos[3];
	}
	server(stock) {
		if (Object.keys(stockMapping).includes(stock))
			return stockMapping[stock];
		return null;
	}
	async stockData(stock) {
		let answer = {
			'symbol': stock,
			'company': this.company(stock),
			'price': await this.price(stock),
			'askprice': await this.askprice(stock),
			'bidprice': await this.bidprice(stock),
			'position': await this.position(stock),
			'volatility': await this.volatility(stock),
			'forecast': await this.forecast(stock)
		}
		answer['longsalevalue'] = await Do(this.ns, "ns.stock.getSaleGain", stock, answer['position'][0], "Long");
		answer['shortsalevalue'] = await Do(this.ns, "ns.stock.getSaleGain", stock, answer['position'][2], "Short");
		answer['value'] = answer['longsalevalue'] + answer['shortsalevalue'];

		answer['profit'] = answer['longsalevalue'] + answer['shortsalevalue'] - answer['position'][0] * answer['position'][1] - answer['position'][2] * answer['position'][3];
		answer['server'] = this.server(stock);
		return answer;
	}
	get portfolioValue() {
		return (async () => {
			try {
				let value = 0;
				let data = await this.market;
				return Object.keys(data).map(x => data[x]['value']).reduce((a, b) => a + b);
			} catch (e) {
				return 0;
			}
		})();
	}
	get market() {
		return (async () => {
			try {
				let answer = {};
				let symbols = await this.symbols;
				Object.entries(stockSymbolToCompany).map(x => answer[x[0]] = { 'company': x[1] });
				Object.entries(await DoAll(this.ns, "ns.stock.getPosition", symbols)).map(x => answer[x[0]]['position'] = x[1]);
				Object.entries(await DoAll(this.ns, "ns.stock.getPrice", symbols)).map(x => answer[x[0]]['price'] = x[1]);
				Object.entries(await DoAll(this.ns, "ns.stock.getAskPrice", symbols)).map(x => answer[x[0]]['askprice'] = x[1]);
				Object.entries(await DoAll(this.ns, "ns.stock.getBidPrice", symbols)).map(x => answer[x[0]]['bidprice'] = x[1]);
				if (await Do(this.ns, "ns.stock.has4SDataTIXAPI", "")) {
					Object.entries(await DoAll(this.ns, "ns.stock.getVolatility", symbols)).map(x => answer[x[0]]['volatility'] = x[1]);
					Object.entries(await DoAll(this.ns, "ns.stock.getForecast", symbols)).map(x => answer[x[0]]['forecast'] = x[1]);
				}
				Object.entries(await DoAllComplex(this.ns, "ns.stock.getSaleGain", symbols.map(x => [x, answer[x]['position'][0], "Long"]))).map(x => [x[0].split(',')[0], x[1]]).map(x => answer[x[0]]['longsalevalue'] = x[1]);
				Object.entries(await DoAllComplex(this.ns, "ns.stock.getSaleGain", symbols.map(x => [x, answer[x]['position'][2], "Short"]))).map(x => [x[0].split(',')[0], x[1]]).map(x => answer[x[0]]['shortsalevalue'] = x[1]);
				symbols.map(x => answer[x]['value'] = answer[x]['longsalevalue'] + answer[x]['shortsalevalue']);
				symbols.map(x => answer[x]['profit'] = answer[x]['value'] - answer[x]['position'][0] * answer[x]['position'][1] - answer[x]['position'][2] * answer[x]['position'][3]);
				symbols.map(x => answer[x]['server'] = stockMapping[x] ? stockMapping[x] : null);
				return answer;
			} catch (e) {
				this.ns.tprint(e);
				return [];
			}
		})();
	}
	get symbols() {
		return (async () => {
			try {
				return (await Do(this.ns, "ns.stock.getSymbols"));
			} catch (e) {
				return [];
			}
		})();
	}
	async createDisplay() {
		if (!(await Do(this.ns, "ns.stock.hasTIXAPIAccess"))) {
			return;
		}
		eval('window').listenUpStonk = (message) => { globalThis.stockQueue.push(message); };
		if (typeof globalThis.stockQueue === 'undefined') {
			globalThis.stockQueue = [];
		}
		this.stockWindow = await makeNewWindow("Stocks", this.ns.ui.getTheme());
		this.lastPrice = await Do(this.ns, "ns.stock.getPrice", "ECP");
	}
	async updateDisplay() {
		if (this.lastPrice == await Do(this.ns, "ns.stock.getPrice", "ECP")) {
			await this.ns.asleep(0);
			return;
		}
		this.lastPrice = await Do(this.ns, "ns.stock.getPrice", "ECP");
		while (globalThis.stockQueue.length > 0) {
			let cmd = globalThis.stockQueue.shift();
			try { await eval(cmd) } catch (e) { this.ns.tprint(e) }
		}
		let bn = (await Do(this.ns, "ns.getPlayer")).bitNodeN;
		if (this.liquidate) {
			let data = await this.market;
			for (let stock of Object.keys(data)) {
				if (data[stock]['position'][0] > 0) {
					await Do(this.ns, "ns.stock.sellStock", stock, data[stock]['position'][0]);
				}
				if (data[stock]['position'][2] > 0) {
					await Do(this.ns, "ns.stock.sellShort", stock, data[stock]['position'][2]);
				}
			}
		}
		let sourcefiles = [];
		let servermoneyavailable = await DoAll(this.ns, "ns.getServerMoneyAvailable", Object.values(stockMapping));
		let servermaxmoney = await DoAll(this.ns, "ns.getServerMaxMoney", Object.values(stockMapping));
		let serverminsecuritylevel = await DoAll(this.ns, "ns.getServerMinSecurityLevel", Object.values(stockMapping));
		let serversecuritylevel = await DoAll(this.ns, "ns.getServerSecurityLevel", Object.values(stockMapping));
		if (bn != 8) {
			sourcefiles = await Do(this.ns, "ns.singularity.getOwnedSourceFiles");
		}
		let totalProfit = 0;
		let update = "";
		update += "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0 WIDTH=100%>";
		update += "<TR><TH>Company</TH><TH>Price</TH><TH>Long</TH>";
		if ((bn == 8) || ((sourcefiles).filter(x => x.n == 8 && x.lvl >= 2))) {
			update += "<TH>Short</TH>"
		}
		update += "<TH>Profit</TH>"
		let has4s = await Do(this.ns, "ns.stock.has4SDataTIXAPI");
		if (has4s) {
			update += "<TH>Volatility</TH><TH>Forecast</TH>";
		}
		update += "<TH>Server</TH></TR>"
		let updates = [];
		let data = await this.market;
		for (let stock of Object.keys(data)) {
			let myupdate = "";
			myupdate += "<TR VALIGN=TOP><TD>" + stock + "<BR><SMALL>"
			myupdate += data[stock]['company'] + "</TD>";
			myupdate += td(jFormat(data[stock]['price'], "$") + "<BR><SMALL>" + jFormat(data[stock]['askprice'], "$") + "<BR>" + jFormat(data[stock]['bidprice'], "$"), "RIGHT");
			if (data[stock]['position'][0] > 0) {
				myupdate += td(jFormat(data[stock]['position'][0]) + "<BR><SMALL>" + jFormat(data[stock]['position'][1], "$") + (data[stock]['longsalevalue'] != 0 ? "<BR><a href=\"#\" onClick='window.opener.listenUpStonk(\"Do(this.ns, \\\"ns.stock.sellStock\\\", \\\"" + stock + "\\\", " + data[stock]['position'][0] + ")\")'>" + jFormat(data[stock]['longsalevalue'], "$") + "</A>" : ""), "RIGHT");
			} else {
				myupdate += td("&nbsp;");
			}
			if ((bn == 8) || (sourcefiles.filter(x => x.n == 8 && x.lvl >= 2))) {
				if (data[stock]['position'][2] > 0) {
					myupdate += td(jFormat(data[stock]['position'][2]) + "<BR><SMALL>" + jFormat(data[stock]['position'][3], "$") + (data[stock]['shortsalevalue'] != 0 ? "<BR>" + "<a href=\"#\" onClick='window.opener.listenUpStonk(\"Do(this.ns, \\\"ns.stock.sellShort\\\", \\\"" + stock + "\\\", " + data[stock]['position'][2] + ")\")'>" + jFormat(data[stock]['shortsalevalue'], "$") + "</A>" : ""), "RIGHT");
				} else {
					myupdate += td("&nbsp;");
				}
			}
			if (data[stock]['profit'] != 0) {
				myupdate += td((data[stock]['profit'] < 0 ? "<FONT COLOR='" + this.ns.ui.getTheme()['error'] + "'>" : "") + jFormat(data[stock]['profit'], "$"), "RIGHT");
			} else {
				myupdate += td("&nbsp;");
			}
			if (has4s) {
				myupdate += td((this.ns.nFormat(100 * data[stock]['volatility'], "0.00")), "RIGHT");
				let forecast = -100 + 200 * data[stock]['forecast'];
				myupdate += td((forecast < 0 ? "<FONT COLOR='" + this.ns.ui.getTheme()['error'] + "'>" : "") + jFormat(forecast), "RIGHT");
			}
			if (Object.keys(stockMapping).includes(stock)) {
				myupdate += "<TD>" + stockMapping[stock] + "<BR><SMALL>";
				myupdate += "$$$: " + Math.floor(100 * (servermoneyavailable[stockMapping[stock]]) / (servermaxmoney[stockMapping[stock]])).toString() + "%<BR>";
				myupdate += "Sec: " + Math.floor((100 * serverminsecuritylevel[stockMapping[stock]]) / (serversecuritylevel[stockMapping[stock]])).toString() + "%</TD>";
			} else {
				myupdate += td("&nbsp;");
			}
			myupdate += "</TR>";
			if (!this.ns.flags(cmdlineflags)['stockfilter'] || (data[stock]['position'][0] + data[stock]['position'][2]) > 0) {
				if (has4s) {
					updates.push([-data[stock]['forecast'], myupdate])
				} else {
					updates.push([data[stock]['price'], myupdate]);
				}
				totalProfit += data[stock]['profit'];
			}
		}
		updates = updates.sort((a, b) => { return a[0] - b[0]; })
		for (let anUpdate of updates) {
			update += anUpdate[1];
		}
		update += "</TABLE>";
		update = "<H1>Holdings: " + jFormat(await this.portfolioValue, "$") + (totalProfit < 0 ? "<FONT COLOR='" + this.ns.ui.getTheme()['error'] + "'>" : "<FONT>") + " (Profit: " + jFormat(totalProfit, "$") + ")</FONT></H1> " + "<a href=\"#\" onClick='window.opener.listenUpStonk(\"this.liquidate=!this.liquidate\")'>" + (this.liquidate ? "Liquidating" : "<FONT COLOR='" + this.ns.ui.getTheme()['error'] + "'>Click to liquidate</FONT>") + "</A>" + "<BR>" + update;
		this.stockWindow.update(update);
		await this.ns.asleep(1000);
	}
}
