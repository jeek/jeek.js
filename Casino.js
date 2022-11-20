import { Do } from "Do.js;
import "killModal.js";

export class Casino {
	constructor(ns, game) {
		this.ns = ns;
		this.game = game ? game : new WholeGame(ns);
	}
	async roulette() {
		while (!((await Do(this.ns, "ns.getPlayer")).city == "Aevum" || (await Do(this.ns, "ns.singularity.travelToCity", 'Aevum')))) {
			if ((!await Do(this.ns, "ns.singularity.isBusy")) && (await Do(this.ns, "ns.getPlayer")).cash < 200000)
				await Do(this.ns, "ns.singularity.commitCrime", "Mug");
			await this.ns.sleep(0);
		}

		let initseed = Date.now();
		if (await Do(this.ns, "ns.singularity.goToLocation", 'Iker Molina Casino')) {
			let doc = eval('document');
			let buttons = doc.evaluate("//button[contains(text(),'roulette')]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			//				ns.tprint(buttons);
			buttons[Object.keys(buttons)[1]].onClick({ isTrusted: true });
			let z = 0
		}
		let z = 0;
		let doc = eval('document');
		while (!doc.body.innerText.includes("1 to 12")) {
			await this.ns.sleep(1); // Sleep until you find a libertarian's ideal dating partner
		}
		let buttons = Array.from(doc.evaluate("//button[text()='Stop playing']", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.children[6].getElementsByTagName('button')).map(x => [parseInt(x.innerText), x]).filter(x => x[0].toString() == x[1].innerText).sort((a, b) => { return a[0] - b[0] });
		let wheels = [];
		for (let i = initseed; i < initseed + 15000; i++) {
			wheels.push([[(i / 1000) % 30000, (i / 1000) % 30000, (i / 1000) % 30000]]);
			while (wheels[wheels.length - 1].length < 75) {
				let curseed = wheels[wheels.length - 1].pop();
				let s1 = curseed[0]; let s2 = curseed[1]; let s3 = curseed[2];
				s1 = (171 * s1) % 30269; s2 = (172 * s2) % 30307; s3 = (170 * s3) % 30323;
				wheels[wheels.length - 1].push(Math.floor(37 * ((s1 / 30269.0 + s2 / 30307.0 + s3 / 30323.0) % 1.0)));
				wheels[wheels.length - 1].push([s1, s2, s3]);

			}
		}
		let seen = [];
		while (!doc.body.innerText.includes("You're not allowed here anymore.")) {
			if (z > 10) {
				let wagerField = doc.evaluate("//button[text()='Stop playing']", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.children[4].firstChild.firstChild;
				Object.getOwnPropertyDescriptor(eval('window').HTMLInputElement.prototype, "value").set.call(wagerField, '10000000')
				wagerField.dispatchEvent(new Event('input', { bubbles: true }));
				await this.ns.sleep(0);
				//				return;
			}
			let wheels2 = wheels.filter(x => levenshteinDistance(x.slice(0, seen.length - 1), seen.slice(0, seen.length - 1)) < Math.max(5, seen.length / 2));
			if (wheels2.length > 10) {
				wheels = wheels2;
			}
			if (seen.length > 0) {
				wheels.sort((a, b) => levenshteinDistance(seen, a) - levenshteinDistance(seen, b));
			}
			let nextguess = [...wheels[0]];
			for (let i = 0; i < seen.length; i++) {
				nextguess.splice(0, 1 + nextguess.indexOf(seen[i]));
			}
			if (nextguess.length < 1) {
				nextguess = [0];
			}
			//			this.ns.print("Guessing... " + nextguess[0].toString());
			try {
				buttons[nextguess[0]][1][Object.keys(buttons[nextguess[0]][1])[1]].onClick({ isTrusted: true });
			} catch {
				await Do(this.ns, "ns.singularity.commitCrime", "Mug");
				await this.roulette();
				return;
			};
			z = z + 1;
			await this.ns.sleep(5000);
			seen.push(parseInt(doc.evaluate("//button[text()='Stop playing']", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.parentElement.children[3].innerText));
		}
		let endgame = doc.evaluate("//button[contains(text(),'Stop playing')]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		endgame[Object.keys(endgame)[1]].onClick({ isTrusted: true });
		await this.ns.sleep(0);
		endgame = doc.evaluate("//button[contains(text(),'Return to World')]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		endgame[Object.keys(endgame)[1]].onClick({ isTrusted: true });
		killModal();
	}
}
