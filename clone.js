/** @param {NS} ns */
export async function main(ns) {
  await ns.wget(
    "https://raw.githubusercontent.com/jeek/jeek.js/dev/main.js",
    "/temp/main.js"
  );
  let imports = ["main.js"];
  let output = "";
  for (let i = 0; i < imports.length; i++) {
    let file = imports[i];
    let content = ns.read("/temp/" + file).split("\n");
    for (let line of content) {
      if (line.slice(0, 6) == "import") {
        let newImport = line.split('"')[1];
        if (!imports.includes(newImport)) {
          ns.tprint(newImport);
          imports.push(newImport);
          await ns.wget(
            "https://raw.githubusercontent.com/jeek/jeek.js/dev/" + newImport,
            "/temp/" + newImport
          );
        }
      }
    }
  }
}
