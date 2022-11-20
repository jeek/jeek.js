/* Find the jobs array
export async function main(ns) {
	const objects = [];
	const payload_id = "payload" + String(Math.trunc(performance.now()));
	globalThis.webpackJsonp.push([payload_id, {
		[payload_id]: function (_e, _t, require) {
			for (const module of (Object.values(require.c))) {
				for (const object of Object.values(module?.exports ?? {})) {
					objects.push(object);
				}
			}
		}
	}, [[payload_id]]]);

	let player;
	let router;
	let jobs;
	let positionsraw;
	for (const obj of objects) {
		if (!player && typeof obj.whoAmI === "function" && obj.whoAmI() === "Player") {
			player = obj;
		} else {
			if (!router && typeof obj.toDevMenu === "function") {
				router = obj;
			} else {
				try {
					if (Object.keys(obj).includes("AevumAeroCorp")) {
						//ns.tprint(obj, " ", Object.keys(obj));
						//ns.tprint(" AeroCorp ", Object.keys(obj['AevumAerocorp']));
						locations = obj;
					}
				} catch { }
				try {
					if (Object.keys(obj).includes("AeroCorp") && Object.keys(obj["AeroCorp"]).includes("companyPositions")) {
						//ns.tprint(obj, " ", Object.keys(obj));
						//ns.tprint(" AeroCorp ", Object.keys(obj['AeroCorp']));
						jobs = obj;
					}
				} catch { }
				try {
					if (Object.keys(obj[0]).includes("charismaEffectiveness")) {
						positionsraw = obj;
					}
				} catch { }
			}
		}
	}
	let positions = {}
	positionsraw.map(x => positions[x.name] = x);
	//ns.tprint('Player: ' + player);
	//ns.tprint('Router: ' + router);
	//ns.tprint('Jobs: ' + jobs);
	for (let company of Object.keys(jobs).sort((a, b) => {return jobs[a]['jobStatReqOffset'] - jobs[b]['jobStatReqOffset']})) {
		for (let pos of Object.keys(jobs[company]["companyPositions"]).sort((a, b) => {return (positions[a]['reqdReputation'] ? positions[a]['reqdReputation'] : 0) - (positions[b]['reqdReputation'] ? positions[b]['reqdReputation'] : 0)})) {
			let rep = (positions[pos]['reqdReputation'] ? positions[pos]['reqdReputation'] : 0);
			let hackk = (positions[pos]["reqdHacking"] ? positions[pos]["reqdHacking"] + jobs[company]['jobStatReqOffset'] : 0);
			let cha = (positions[pos]["reqdCharisma"] ? positions[pos]["reqdCharisma"] + jobs[company]['jobStatReqOffset'] : 0);
			if (ns.getPlayer().skills.hacking >= hackk && ns.getPlayer().skills.charisma >= cha)
			ns.tprint(company, " ", pos, " ", rep, " ", hackk, " ", cha);
		}
//        ns.tprint(company, " ", jobs[company]);
	}
//    ns.tprint('Positions: ' + positions.map(x => [x.name, x]));
//    ns.tprint('Locations: ' + Object.keys(locations["Bachman & Associates"]));

	//    if (router) router.toDevMenu();
}
*/
