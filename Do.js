// Hash function by @Insight from the Bitburner Discord
export function hashCode(s) {
	return s.split("").reduce(
		function (a, b) {
			a = ((a << 5) - a) + b.charCodeAt(0);
			return a & a;
		}, 0
	);
}

// Write the content to the file if it's different than what is already there
function writeIfNotSame(ns, filename, content) {
	if (ns.read(filename) != content) {
		ns.write(filename, content, 'w');
	}
}

// Generates a very-very-likely to be unique ID.
function uniqueID(s, random = false) {
	let answer = "";
	let remainder = "";
	if (random) {
		remainder = Math.floor(1e30 * Math.random());
	} else {
		remainder = hashCode(s);
	}
	if (remainder < 0) {
		remainder = -remainder;
	}
	while (remainder > 0) {
		answer = answer + "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"[remainder % 64];
		remainder = Math.floor(remainder / 64);
	}
	return answer;
}

// Writes a command to a file, runs it, and then returns the result
export async function Do(ns, command, ...args) {
	if (["ns.bladeburner.stopBladeburnerAction", "ns.bladeburner.setActionLevel", "ns.bladeburner.setActionAutolevel", "ns.singularity.hospitalize"].includes(command)) {
		return await DoVoid(ns, command, ...args);
	}
	writeIfNotSame(ns, '/temp/rm.js', `export async function main(ns) {ns.rm(ns.args[0], 'home');}`);
	let progname = "/temp/proc-" + uniqueID(command);
	let procid = progname + uniqueID(JSON.stringify(...args), true) + ".txt";
	writeIfNotSame(ns, progname + ".js", `export async function main(ns) { ns.write(ns.args.shift(), JSON.stringify(` + command + `(...JSON.parse(ns.args[0]))), 'w'); }`);
	while (0 == ns.run(progname + ".js", 1, procid, JSON.stringify(args))) {
		await ns.sleep(0);
	}
	let answer = ns.read(procid);
	let good = false;
	while (!good) {
		await ns.sleep(0);
		try {
			answer = JSON.parse(ns.read(procid));
			good = true;
		} catch { }
	}
	while (0 == ns.run('/temp/rm.js', 1, procid)) { await ns.sleep(0) };
	return answer;
}

export async function DoVoid(ns, command, ...args) {
	writeIfNotSame(ns, '/temp/rm.js', `export async function main(ns) {ns.rm(ns.args[0], 'home');}`);
	let progname = "/temp/proc-V" + uniqueID(command);
	writeIfNotSame(ns, progname + ".js", `export async function main(ns) { ` + command + `(...JSON.parse(ns.args[0])); }`);
	let pid = ns.run(progname + ".js", 1, JSON.stringify(args));
	while (0 == pid) {
		pid = ns.run(progname + ".js", 1, JSON.stringify(args));
		await ns.sleep(0);
	}
	while (await Do(ns, "ns.isRunning", pid))
		await ns.sleep(0);
	return null;
}

// Writes a command to a file, runs against every argument, and then returns the result as an object
export async function DoAll(ns, command, args) {
	writeIfNotSame(ns, '/temp/rm.js', `export async function main(ns) {ns.rm(ns.args[0], 'home');}`);
	let progname = "/temp/procA-" + uniqueID(command);
	let procid = progname + uniqueID(JSON.stringify(args), true) + ".txt";
	writeIfNotSame(ns, progname + ".js", `export async function main(ns) { let parsed = JSON.parse(ns.args[1]); let answer = {}; for (let i = 0; i < parsed.length ; i++) {answer[parsed[i]] = await ` + command + `(parsed[i]);}; ns.write(ns.args.shift(), JSON.stringify(answer), 'w'); }`);
	while (0 == ns.run(progname + ".js", 1, procid, JSON.stringify(args))) {
		await ns.sleep(0);
	}
	let answer = ns.read(procid);
	let good = false;
	while (!good) {
		await ns.sleep(0);
		try {
			answer = JSON.parse(ns.read(procid));
			good = true;
		} catch { }
	}
	while (0 == ns.run('/temp/rm.js', 1, procid)) { await ns.sleep(0) };
	return answer;
}

// Writes a command to a file, runs against every argument, and then returns the result as an object
export async function DoAllComplex(ns, command, args) {
	writeIfNotSame(ns, '/temp/rm.js', `export async function main(ns) {ns.rm(ns.args[0], 'home');}`);
	let progname = "/temp/procC-" + uniqueID(command);
	let procid = progname + uniqueID(JSON.stringify(args), true) + ".txt";
	writeIfNotSame(ns, progname + ".js", `export async function main(ns) { let parsed = JSON.parse(ns.args[1]); let answer = {}; for (let i = 0; i < parsed.length ; i++) {answer[parsed[i]] = await ` + command + `(...parsed[i]);}; ns.write(ns.args.shift(), JSON.stringify(answer), 'w'); }`);
	while (0 == ns.run(progname + ".js", 1, procid, JSON.stringify(args))) {
		await ns.sleep(0);
	}
	let answer = ns.read(procid);
	let good = false;
	while (!good) {
		await ns.sleep(0);
		try {
			answer = JSON.parse(ns.read(procid));
			good = true;
		} catch { }
	}
	while (0 == ns.run('/temp/rm.js', 1, procid)) { await ns.sleep(0) };
	return answer;
}
