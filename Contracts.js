import { Do } from "Do.js";
import { makeNewWindow } from "Windows.js";
import { WholeGame } from "WholeGame.js";

let workerCode = `
function minpathsum(data) {
	while (data.length > 1) {
		for (let i = 0; i < (data[data.length - 2]).length; i++) {
			data[data.length - 2][i] += Math.min(data[data.length - 1][i], Math.min(data[data.length - 1][i + 1]));
		}
		data.pop();
	}
	return data[0][0];
}

function uniquepathsI(data) {
	let numbers = []
	for (let i = 0; i < data[0]; i++) {
		numbers.push([]);
		for (let j = 0; j < data[1]; j++) {
			numbers[numbers.length - 1].push(1);
			if (i > 0 && j != 0) {
				numbers[i][j] = numbers[i - 1][j] + numbers[i][j - 1];
			}
		}
	}
	return numbers[data[0] - 1][data[1] - 1];
}

function uniquepathsII(data) {
	let answer = [];
	for (let i = 0; i < data.length; i++) {
		answer.push(new Array(data[0].length).fill(0));
	}
	for (let i = data.length - 1; i >= 0; i--) {
		for (let j = data[0].length - 1; j >= 0; j--) {
			if (data[i][j] == 0) {
				answer[i][j] = (i + 1 < data.length ? answer[i + 1][j] : 0) + (j + 1 < data[0].length ? answer[i][j + 1] : 0);
				answer[data.length - 1][data[0].length - 1] = 1;
			}
		}
	}
	return answer[0][0];
}

function largestprimefactor(data) {
	let i = 2;
	while (data > 1) {
		while (data % i == 0) {
			data /= i;
		}
		i += 1;
	}
	return i - 1;
}

function mergeoverlappingintervals(data) {
	let intervals = (new Array(data.map(x => x[1]).reduce((a, b) => { return Math.max(a, b) }))).fill(0);
	for (let interval of data) {
		for (let i = interval[0]; i < interval[1]; i++) {
			intervals[i] = 1;
		}
	}
	if (intervals.indexOf(1) == -1) {
		return [];
	}
	let answer = [[intervals.indexOf(1), intervals.indexOf(0, intervals.indexOf(1))]];
	while ((answer[answer.length - 1][0] != -1) && (answer[answer.length - 1][1] != -1)) {
		let a = intervals.indexOf(1, 1 + answer[answer.length - 1][1]);
		answer.push([a, intervals.indexOf(0, a)]);
	}
	if (answer[answer.length - 1][1] == -1) {
		answer[answer.length - 1][1] = intervals.length;
	}
	if (answer[answer.length - 1][0] == -1) {
		answer.pop();
	}
	return answer;
}

function caesarcipher(data) {
	return data[0].split("").map(x => { return x === " " ? " " : "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[(("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(x) + 26 - data[1]) % 26)] }).join("");
	// return data[0].split("").map(x => x.charCodeAt(0)).map(x => x == 32 ? 32 : (x + 65 - data[1])%26 + 65).map(x => String.fromCharCode(x)).join("");
}

function vigenere(data) {
	return data[0].split("").map((x, i) => { return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[(("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(x) + 13 + data[1].charCodeAt(i % data[1].length))) % 26] }).join("");
}

function totalwaystosum(data) {
	let answer = [1].concat((new Array(data + 1)).fill(0));
	for (let i = 1; i < data; i++) {
		for (let j = i; j <= data; j++) {
			answer[j] += answer[j - i];
		}
	}
	return answer[data];
}

function totalwaystosumII(data) {
	let answer = [1].concat((new Array(data[0])).fill(0));
	for (let i of data[1]) {
		for (let j = i; j <= data[0]; j++) {
			answer[j] += answer[j - i];
		}
	}
	return answer[data[0]];
}

function spiralizematrix(data) {
	let answer = [];
	while (data.length > 0 && data[0].length > 0) {
		answer = answer.concat(data.shift());
		if (data.length > 0 && data[0].length > 0) {
			answer = answer.concat(data.map(x => x.pop()));
			if (data.length > 0 && data[0].length > 0) {
				answer = answer.concat(data.pop().reverse());
				if (data.length > 0 && data[0].length > 0) {
					answer = answer.concat(data.map(x => x.shift()).reverse());
				}
			}
		}
	}
	return answer;
}

function subarraywithmaximumsum(data) {
	let answer = -1e308;
	for (let i = 0; i < data.length; i++) {
		for (let j = i; j < data.length; j++) {
			answer = Math.max(answer, data.slice(i, j + 1).reduce((a, b) => { return a + b }));
		}
	}
	return answer;
}

function twocolor(data) {
	for (let i = 0; i < 2 ** data[0]; i++) {
		let answer = [];
		for (let j = 0; j < data[0]; j++) {
			answer[j] = (2 ** j & i) > 0 ? 1 : 0;
		}
		if (data[1].map(x => answer[x[0]] != answer[x[1]]).reduce((a, b) => { return a + b }) == data[1].length) {
			return answer;
		}
	}
	return [];
}

function rlecompression(data) {
	let answer = "";
	data = data.split("");
	while (data.length > 0) {
		let z = data.splice(0, 1);
		let i = 1;
		while (i < 9 && data[0] == z & data.length > 0) {
			i += 1;
			data.splice(0, 1);
		}
		answer = answer.concat(i.toString()).concat(z);
	}
	return answer;
}

function lzdecompression(data) {
	if (data.length == 0) {
		return "";
	}
	data = data.split("");
	let answer = "";
	while (data.length > 0) {
		let chunklength = parseInt(data.shift());
		if (chunklength > 0) {
			answer = answer.concat(data.splice(0, chunklength).join(""));
		}
		if (data.length > 0) {
			chunklength = parseInt(data.shift());
			if (chunklength != 0) {
				let rewind = parseInt(data.shift());
				for (let i = 0; i < chunklength; i++) {
					answer = answer.concat(answer[answer.length - rewind]);
				}
			}
		}
	}
	return answer;
}

function lzcompression(data) {
	let z = 0;
	let queue = [[], [], []];
	while (queue[1].length <= data.length) {
		queue[1].push([]);
	}
	while (queue[2].length <= data.length) {
		queue[2].push([]);
	}
	for (let i = 0; i <= 9 && i < data.length; i++) {
		queue[1][i].push(i.toString() + data.substring(0, i));
		queue[2][i].push(i.toString() + data.substring(0, i));
	}
	while (queue[1][data.length].length == 0 && queue[2][data.length].length == 0) {
		let i = (new Array(data.length)).fill(0).map((_, i) => i).map(i => [i, queue[1][i].length + queue[2][i].length]).filter(x => x[1] > 0).reduce((a, b) => b)[0];
		if (queue[2][i].length > 0) queue[2][i].map(x => queue[1][i].push(x + "0"));
		if (queue[1][i].length > 0) queue[1][i].map(x => queue[2][i].push(x + "0"));
		queue[1][i] = Array.from(...new Set([queue[1][i].filter(x => (lzdecompression(x).length == i) && (lzdecompression(x) === data.substring(0, i))).sort((a, b) => { return a.length - b.length; })]));
		queue[2][i] = Array.from(...new Set([queue[2][i].filter(x => (lzdecompression(x).length == i) && (lzdecompression(x) === data.substring(0, i))).sort((a, b) => { return a.length - b.length; })]));
		queue[1][i] = queue[1][i].sort((a, b) => { return a.length - b.length; });
		queue[2][i] = queue[2][i].sort((a, b) => { return a.length - b.length; });
		ns.tprint(i, " ", queue[1][i], " ", queue[2][i]);
		if (queue[1][i].length > 0) {
			for (let current of queue[1][i].splice(0, 10)) {
				for (let l = 0; l <= 10; l++) {
					for (let j = 0; j <= 10; j++) {
						let temp = lzdecompression(current.concat(l.toString()).concat(j.toString()));
						if (temp === data.substring(0, temp.length)) {
							queue[2][temp.length].push(current.concat(l.toString()).concat(j.toString()));
						}
					}
				}
			}
			//			queue[1][i] = [];
		}
		if (queue[2][i].length > 0) {
			for (let current of queue[2][i].splice(0, 10)) {
				for (let j = 0; j <= 10; j++) {
					let temp = lzdecompression(current.concat(j.toString()).concat(data.substring(current.length, current.length + j)));
					if (temp === data.substring(0, temp.length)) {
						queue[1][temp.length].push(current.concat(j.toString()).concat(data.substring(current.length, current.length + j)));
					}
				}
			}
			//			queue[2][i] = [];
		}
	}
	queue[1][data.length] = queue[1][data.length].sort((a, b) => { return a.length - b.length; });
	queue[2][data.length] = queue[2][data.length].sort((a, b) => { return a.length - b.length; });
}

function stonks1(data) {
	let best = 0;
	for (let i = 0; i < data.length; i++) {
		for (let j = i + 1; j < data.length; j++) {
			best = Math.max(best, data[j] - data[i]);
		}
	}
	return best;
}

function stonks2(data) {
	let best = 0;
	let queue = {};
	queue[JSON.stringify(data)] = 0;
	while (Object.keys(queue).length > 0) {
		let current = Object.keys(queue)[0];
		let value = queue[current];
		delete queue[current];
		let stonks = JSON.parse(current);
		for (let i = 0; i < stonks.length; i++) {
			for (let j = i + 1; j < stonks.length; j++) {
				best = Math.max(best, value + stonks[j] - stonks[i]);
				let remaining = stonks.slice(j + 1);
				if (remaining.length > 0) {
					if (!Object.keys(queue).includes(JSON.stringify(remaining))) {
						queue[JSON.stringify(remaining)] = -1e308;
					}
					queue[JSON.stringify(remaining)] = Math.max(queue[JSON.stringify(remaining)], value + stonks[j] - stonks[i]);
				}
			}
		}
	}
	return best;
}

function stonks3(data) {
	let best = 0;
	for (let i = 0; i < data.length; i++) {
		for (let j = i + 1; j < data.length; j++) {
			best = Math.max(best, data[j] - data[i]);
			for (let k = j + 1; k < data.length; k++) {
				for (let l = k + 1; l < data.length; l++) {
					best = Math.max(best, data[j] - data[i] + data[l] - data[k]);
				}
			}
		}
	}
	return best;
}

function stonks4(data) {
	let best = 0;
	let queue = {};
	queue[0] = {};
	queue[0][JSON.stringify(data[1])] = 0;
	for (let ii = 0; ii < data[0]; ii++) {
		queue[ii + 1] = {};
		while (Object.keys(queue[ii]).length > 0) {
			let current = Object.keys(queue[ii])[0];
			let value = queue[ii][current];
			delete queue[ii][current];
			let stonks = JSON.parse(current);
			for (let i = 0; i < stonks.length; i++) {
				for (let j = i + 1; j < stonks.length; j++) {
					best = Math.max(best, value + stonks[j] - stonks[i]);
					let remaining = stonks.slice(j + 1);
					if (remaining.length > 0) {
						if (!Object.keys(queue[ii + 1]).includes(JSON.stringify(remaining))) {
							queue[ii + 1][JSON.stringify(remaining)] = -1e308;
						}
						queue[ii + 1][JSON.stringify(remaining)] = Math.max(queue[ii + 1][JSON.stringify(remaining)], value + stonks[j] - stonks[i]);
					}
				}
			}
		}
	}
	return best;
}

function generateips(data) {
	let answer = [];
	for (let i = 1; i + 1 < data.length; i++) {
		for (let j = i + 1; j + 1 < data.length; j++) {
			for (let k = j + 1; k < data.length; k++) {
				answer.push([data.substring(0, i), data.substring(i, j), data.substring(j, k), data.substring(k)]);
			}
		}
	}
	for (let i = 0; i < 4; i++) {
		answer = answer.filter(x => 0 <= parseInt(x[i]) && parseInt(x[i]) <= 255 && (x[i] == "0" || x[i].substring(0, 1) != "0"));
	}
	return answer.map(x => x.join("."));
}

function arrayjumpinggame(data) {
	let queue = new Set();
	if (data[0] == 0) {
		return 0;
	}
	queue.add("[" + data.toString() + "]");
	while (queue.size > 0) {
		let current = Array.from(queue)[0];
		queue.delete(current);
		current = JSON.parse(current);
		if (current[0] != 0) {
			if (current[0] + 1 > current.length) {
				return 1;
			}
			for (let i = 1; i <= current[0] && i < current.length; i++) {
				queue.add(("[".concat(current.slice(i)).toString()).concat("]"));
			}
		}
	}
	return 0;
}

function arrayjumpinggameII(data) {
	let queue = {};
	let best = 1e308;
	queue[data.toString()] = 0;
	while (Object.keys(queue).length > 0) {
		let current = Object.keys(queue)[0];
		let value = queue[current];
		delete queue[current];
		current = current.split(",").map(i => parseInt(i));
		if (current[0] + 1 >= current.length) {
			best = Math.min(best, value + 1);
		} else {
			for (let i = 1; i <= current[0]; i++) {
				let newIndex = current.slice(i).toString();
				if (!Object.keys(queue).includes(newIndex)) queue[newIndex] = 1e308;
				queue[newIndex] = Math.min(queue[newIndex], value + 1);
			}
		}
	}
	return best == 1e308 ? 0 : best;
}

function hammingencode(data) {
	let answer = [];

	// Convert the data to a bit array. Can't use & due to data possibly being larger than a 32-bit int.
	let encoded = [];
	let remaining = data;
	while (remaining > 0) {
		encoded = [remaining % 2].concat(encoded);
		remaining = Math.floor((remaining - remaining % 2) / 2 + .4);
	}

	// Set up the answer array, skipping over the entries with an index that is a power of 2, as they'll be the parity bits
	let powersoftwo = (new Array(Math.ceil(Math.log2(data)))).fill(0).map((_, i) => 2 ** i);
	let a_i = 0; let e_i = 0;
	for (let e_i = 0; e_i < encoded.length; e_i++) {
		a_i += 1;
		while (powersoftwo.includes(a_i)) {
			a_i += 1;
		}
		answer[a_i] = encoded[e_i];
	}

	// Calculate the parity bits
	for (let i of powersoftwo.filter(x => x < answer.length)) {
		// Generate a list of indexes from 0 to answer.length-1
		answer[i] = (new Array(answer.length)).fill(0).map((_, i) => i);
		// Keep only the indexes that share a bit with i, which is a power of 2
		answer[i] = answer[i].filter(x => x > i && (i & x));
		// Map the indexes onto the values the represent
		answer[i] = answer[i].map(x => answer[x]);
		// Bitwise XOR reduction to a single value
		answer[i] = answer[i].reduce((a, b) => a ^ b, 0);
	}

	// Calculate the final parity bit and send it home
	answer[0] = answer.slice(1).reduce((a, b) => a ^ b);
	return answer.map(x => x.toString()).join("");
}

function hammingdecode(data) {
	let powersoftwo = (new Array(Math.ceil(Math.log2(data)))).fill(0).map((_, i) => 2 ** i);
	let badbits = [];
	for (let i of powersoftwo.filter(x => x < data.length)) {
		let checksum = (new Array(data.length)).fill(0).map((_, i) => i).filter(x => x > i && (i & x)).map(x => parseInt(data.substring(x, x + 1))).reduce((a, b) => a ^ b);
		if (parseInt(data.substring(i, i + 1)) != checksum) {
			badbits.push(i);
		}
	}
	if (badbits.length == 0) { // No error in the data
		let checksum = data.substring(1).split("").map(x => parseInt(x)).reduce((a, b) => a ^ b);
		if (checksum == parseInt(data.substring(0, 1))) {
			let number = data.split("").map(x => parseInt(x));
			for (let i of powersoftwo.filter(x => x < data.length).reverse()) {
				number.splice(i, 1);
			}
			number.splice(0, 1);
			return number.reduce((a, b) => a * 2 + b);
		}
	}
	let badindex = badbits.reduce((a, b) => a | b, 0);
	return hammingdecode(data.substring(0, badindex).concat(data.substring(badindex, badindex + 1) == "0" ? "1" : "0").concat(data.substring(badindex + 1)));
}

function findallvalidmathexpressions(data) {
	let queue = new Set();
	queue.add(data[0]);
	for (let current of queue) {
		let splitted = current.split("");
		for (let i = 1; i < splitted.length; i++) {
			if (!("+-*".includes(splitted[i - 1])) && !("+-*".includes(splitted[i]))) {
				queue.add((splitted.slice(0, i).concat("+").concat(splitted.slice(i))).join(""));
				queue.add((splitted.slice(0, i).concat("-").concat(splitted.slice(i))).join(""));
				queue.add((splitted.slice(0, i).concat("*").concat(splitted.slice(i))).join(""));
				//				queue.add((splitted.slice(0, i).concat("*-").concat(splitted.slice(i))).join(""));
			}
		}
	}
	let zeroes = Array.from(queue) //.concat(Array.from(queue).map(x => "-".concat(x)));
	for (let i = 0; i < 10; i++) {
		zeroes = zeroes.filter(x => !x.includes("+0".concat(i.toString())));
		zeroes = zeroes.filter(x => !x.includes("-0".concat(i.toString())));
		zeroes = zeroes.filter(x => !x.includes("*0".concat(i.toString())));
		zeroes = zeroes.filter(x => x.substring(0, 1) != "0" || "+-*".includes(x.substring(1, 2)));
	}
	return zeroes.filter(x => eval(x) == data[1]);
}

function sanitizeparentheses(data) {
	let queue = new Set();
	queue.add(data);
	while (Array.from(queue).length > 0 && (Array.from(queue)[0].split("").includes("(") || Array.from(queue)[0].split("").includes(")"))) {
		let answer = [];
		let nextqueue = new Set();
		for (let current of Array.from(queue)) {
			let good = true;
			let goodsofar = 0;
			for (let i = 0; i < current.length; i++) {
				if (current.substring(i, i + 1) == "(") {
					goodsofar += 1;
				}
				if (current.substring(i, i + 1) == ")") {
					goodsofar -= 1;
				}
				if (goodsofar < 0) {
					good = false;
				}
			}
			if (goodsofar != 0) {
				good = false;
			}
			if (good) {
				answer.push(current);
			}
			for (let i = 0; i < current.length; i++) {
				if ("()".includes(current.substring(i, i + 1))) {
					nextqueue.add(current.substring(0, i).concat(current.substring(i + 1)));
				}
			}
		}
		if (answer.length > 0) {
			return answer;
		}
		queue = JSON.parse(JSON.stringify(Array.from(nextqueue)));
	}
	return [Array.from(queue)[0]];
}

function shortestpathinagrid(data) {
	let solutions = { "0,0": "" };
	let queue = new Set();
	queue.add("0,0");
	for (let current of queue) {
		let x = parseInt(current.split(",")[0]);
		let y = parseInt(current.split(",")[1]);
		if (x > 0) {
			if (data[x - 1][y] == 0) {
				let key = (x - 1).toString().concat(",").concat(y.toString());
				if (!Array.from(queue).includes(key)) {
					solutions[key] = solutions[current] + "U";
					queue.add(key);
				}
			}
		}
		if (x + 1 < data.length) {
			if (data[x + 1][y] == 0) {
				let key = (x + 1).toString().concat(",").concat(y.toString());
				if (!Array.from(queue).includes(key)) {
					solutions[key] = solutions[current] + "D";
					queue.add(key);
				}
			}
		}
		if (y > 0) {
			if (data[x][y - 1] == 0) {
				let key = x.toString().concat(",").concat((y - 1).toString());
				if (!Array.from(queue).includes(key)) {
					solutions[key] = solutions[current] + "L";
					queue.add(key);
				}
			}
		}
		if (y + 1 < data[0].length) {
			if (data[x][y + 1] == 0) {
				let key = x.toString().concat(",").concat((y + 1).toString());
				if (!Array.from(queue).includes(key)) {
					solutions[key] = solutions[current] + "R";
					queue.add(key);
				}
			}
		}
	}
	let finalkey = (data.length - 1).toString().concat(",").concat((data[0].length - 1).toString());
	if (Object.keys(solutions).includes(finalkey)) {
		return solutions[finalkey];
	}
	return "";
}

onmessage = (event) => {postMessage([eval(event.data[0])(event.data[1]), event.data[2], event.data[3], event.data[0]]);}
`;

export class Contracts {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
		this.contracts = {};
		this.times = {};
		this.log = ns.tprint.bind(ns);
		if (ns.flags(cmdlineflags)['logbox']) {
			this.log = this.game.sidebar.querySelector(".contractbox") || this.game.createSidebarItem("Contracts", "", "C", "contractbox");
			this.log = this.log.log;
		}
	}
	async list() {
		//		this['window'] = this['window'] || await makeNewWindow("Contracts", this.ns.ui.getTheme())
		let files = [];
		for (let server of this.game['Servers'].serverlist) {
			files = files.concat((await Do(this.ns, "ns.ls", server)).filter(x => x.includes(".cct")).map(filename => [server, filename]));
		}
		// this.ns.tprint(files);
		for (let i = 0; i < files.length; i++) {
			this.contracts[files[i][1]] = {};
			this.contracts[files[i][1]].server = files[i][0];
			this.contracts[files[i][1]].type = await Do(this.ns, "ns.codingcontract.getContractType", files[i][1], files[i][0]);
			this.contracts[files[i][1]].data = await Do(this.ns, "ns.codingcontract.getData", files[i][1], files[i][0]);
			this.contracts[files[i][1]].description = await Do(this.ns, "ns.codingcontract.getDescription", files[i][1], files[i][0]);
			while (this.contracts[files[i][1]].description.indexOf("\n") > -1) {
				this.contracts[files[i][1]].description = this.contracts[files[i][1]].description.replace("\n", "<BR>");
			}
		}
		//		let output = "<TABLE BORDER=1 CELLPADDING=0 CELLSPACING=0>";
		//		for (let i of Object.keys(this.contracts)) {
		//			output += "<TR><TD>" + this.contracts[i].description.replace("\n", "<BR>") + "</TD><TD>" + this.contracts[i].server + "</TD><TD>" + this.contracts[i].type + "</TD><TD>" + JSON.stringify(this.contracts[i].data) + "</TD></TR>";
		//		}
		//		output += "</TABLE>";
		//		this['window'].update(output);
		return this.contracts;
	}
	async loop() {
		while (true) {
    		await this.solve();
    		await this.ns.asleep(60000);
		}
	}
	async solve() {
		await this.list();
		let procs = [];
		let y = 0;
		let z = 0;
		let solutions = [];
		let blob = new Blob([workerCode], { type: "application/javascript" });
		for (let i = 0; i < 16; i++) {
			procs.push(new Worker(URL.createObjectURL(blob)));
			procs[procs.length - 1].onmessage = (event) => {
				solutions.push(event);
				z -= 1;
			};
		}
		for (let contract of Object.keys(this.contracts)) {
			let done = false;
			//this.ns.tprint(contract);
			for (let types of [
				["Minimum Path Sum in a Triangle", "minpathsum"],
				["Unique Paths in a Grid I", "uniquepathsI"],
				["Unique Paths in a Grid II", "uniquepathsII"],
				["Find Largest Prime Factor", "largestprimefactor"],
				["Merge Overlapping Intervals", "mergeoverlappingintervals"],
				["Encryption I: Caesar Cipher", "caesarcipher"],
				["Total Ways to Sum", "totalwaystosum"],
				["Total Ways to Sum II", "totalwaystosumII"],
				["Spiralize Matrix", "spiralizematrix"],
				["Subarray with Maximum Sum", "subarraywithmaximumsum"],
				["Proper 2-Coloring of a Graph", "twocolor"],
				["Compression I: RLE Compression", "rlecompression"],
				["Compression II: LZ Decompression", "lzdecompression"],
				//["Compression III: LZ Compression", "lzcompression"],
				["Algorithmic Stock Trader I", "stonks1"],
				["Algorithmic Stock Trader II", "stonks2"],
				["Algorithmic Stock Trader III", "stonks3"],
				["Algorithmic Stock Trader IV", "stonks4"],
				["Encryption II: Vigenère Cipher", "vigenere"],
				["Generate IP Addresses", "generateips"],
				["Array Jumping Game", "arrayjumpinggame"],
				["Array Jumping Game II", "arrayjumpinggameII"],
				["HammingCodes: Integer to Encoded Binary", "hammingencode"],
				["HammingCodes: Encoded Binary to Integer", "hammingdecode"],
				["Find All Valid Math Expressions", "findallvalidmathexpressions"],
				["Sanitize Parentheses in Expression", "sanitizeparentheses"],
				["Shortest Path in a Grid", "shortestpathinagrid"]
			]) {
				if (!Object.keys(this.times).includes(types[0])) {
					this.times[types[0]] = [];
				}
				if (!done) {
					if (this.contracts[contract].type === types[0]) {
						this.log("Starting " + types[0] + " on " + this.contracts[contract].server);
						procs[y % 16].postMessage([types[1], this.contracts[contract].data, contract, this.contracts[contract].server]);
						z += 1;
						y += 1;
						await this.ns.asleep(0);
						//						let starttime = Date.now();
						//						this.times[types[0]].push(Date.now() - starttime);
						//						this.log(types[0] + " average time: " + (this.times[types[0]].reduce((a, b) => a + b) / this.times[types[0]].length).toString());
					}
				}
			}
		}
		while (z > 0 || solutions.length > 0) {
			await this.ns.asleep(1000);
			if (solutions.length > 0) {
				let success = await Do(this.ns, "ns.codingcontract.attempt", solutions[0].data[0], solutions[0].data[1], solutions[0].data[2]);
			    if (success.length > 0) {
					delete this.contracts[solutions[0].data[1]];
					this.log("Succeeded at " + solutions[0].data[3] + ": " + success);
				} else {
					this.log("Failed at " + solutions[0].data[3]);
					this.log("Failed at " + solutions[0].data[3], " ", types[1](this.contracts[solutions[0].data[1]].data, this.ns));
					//this.ns.exit();
				}
				solutions.shift();
			}
		}
        procs.map(x => x.terminate());
		await this.list();
	}
}
