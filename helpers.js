import { writeIfNotSame } from "Do.js";

function helperScripts(ns) {
	writeIfNotSame(ns, "/temp/hack.js", `export async function main(ns) {await ns.hack(ns.args[0]);}`);
	writeIfNotSame(ns, "/temp/hackstock.js", `export async function main(ns) {await ns.hack(ns.args[0], {"stock": true});}`);
	writeIfNotSame(ns, "/temp/grow.js", `export async function main(ns) {await ns.grow(ns.args[0]);}`);
	writeIfNotSame(ns, "/temp/growstock.js", `export async function main(ns) {await ns.grow(ns.args[0], {"stock": true});}`);
	writeIfNotSame(ns, "/temp/weaken.js", `export async function main(ns) {await ns.weaken(ns.args[0]);}`);
}

export const levenshteinDistance = (str1 = '', str2 = '') => {
	const track = Array(str2.length + 1).fill(null).map(() =>
		Array(str1.length + 1).fill(null));
	for (let i = 0; i <= str1.length; i += 1) {
		track[0][i] = i;
	}
	for (let j = 0; j <= str2.length; j += 1) {
		track[j][0] = j;
	}
	for (let j = 1; j <= str2.length; j += 1) {
		for (let i = 1; i <= str1.length; i += 1) {
			const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
			track[j][i] = Math.min(
				track[j][i - 1] + 1, // deletion
				track[j - 1][i] + 1, // insertion
				track[j - 1][i - 1] + indicator, // substitution
			);
		}
	}
	return track[str2.length][str1.length];
};

export function killModal() {
	let doc = eval('document');
	let modal = doc.evaluate("//div[contains(@class,'MuiBackdrop-root')]", doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	modal[Object.keys(modal)[1]].onClick({ isTrusted: true });
}

export function jFormat(number, format = " ") {
	if (number === 0) {
		return "0.000";
	}
	let sign = number < 0 ? "-" : "";
	if (number < 0) {
		number = -number;
	}
	let exp = Math.floor(Math.log(number) / Math.log(10));
	while (10 ** exp <= number) {
		exp += 3 - (exp % 3);
	}
	exp -= 3;
	while (number >= 1000) {
		number /= 1000;
	}
	exp = Math.max(exp, 0);
	return (format.toString().includes("$") ? "$" : "") + sign + number.toFixed(3).toString() + (exp < 33 ? ['', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S', 'o', 'n'][Math.floor(exp / 3)] : "e" + exp.toString());
}

export function td(content, align = "LEFT") {
	return "<TD ALIGN=\"" + align + "\">" + content + "</TD>";
}

export function tr(content) {
	return "<TR VALIGN=\"TOP\">" + content + "</TR>";
}

export function timeFormat(n) {
	let seconds = n % 60;
	n = Math.floor((n - seconds) / 60 + .5);
	let minutes = n % 60;
	n = Math.floor((n - minutes) / 60 + .5);
	let hours = n;
	hours = hours.toString();
	minutes = minutes.toString();
	if (minutes.length < 2)
		minutes = "0" + minutes;
	seconds = seconds.toString();
	if (seconds.length < 2)
		seconds = "0" + seconds;
	return hours + ":" + minutes + ":" + seconds;
}

function finalform(ns) {
    let lines = ns.read("jeek.js").split("\n");
    let i = 0;
    while (i < lines.length) {
        if (i > 220 && i < 240) {
            ns.tprint(" ");
            ns.tprint(i, " ", lines[i]);
        }
        if (lines[i].includes("await Do") && !lines[i].includes("FFIGNORE") && !lines[i].includes("DoAll")) {
            let j = lines[i].search("await Do"); //FFIGNORE
            let array = [...(lines[i])];
            array.splice(j, 9);
            let nsIndex = lines[i].indexOf("ns", j);
            let nsIndex2 = lines[i].indexOf("ns", nsIndex + 3);
            if (nsIndex2 > -1) {
                array.splice(nsIndex - 9, nsIndex2 - nsIndex);
                let comma = array.indexOf('"', j) + 1;
                array.splice(array.indexOf('"', j), 1, '(');
                if (array[comma] == ",") {
                    array.splice(comma, 1);
                }
            }
            lines[i] = array.join("");
        }
        i += 1;
    }
    ns.write("finalform.js", lines.join("\n"), 'w');
}