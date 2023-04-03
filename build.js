/** @param {NS} ns */
export async function main(ns) {
    let imports = ["main.js"];
    let output = "";
    let final = "";
    for (let i = 0 ; i < imports.length ; i++) {
        let file = imports[i];
        let content = ns.read("/temp/" + file).split("\n");
        for (let line of content) {
            if (line.slice(0, 6) == "import") {
                let newImport = line.split('"')[1];
                if (!imports.includes(newImport)) {
                    ns.tprint(newImport);
                    imports.push(newImport);
                }
            } else {
                final = final + "\n" + line;
            }
        }
    }
    await ns.write("jeek.js", final.slice(1), "w");
}