export class BuildProcess {
	constructor(ns, settings = {}) {
        this.ns = ns;
        this.settings = settings;
        this.settings.repo = this.settings.repo ?? "https://raw.githubusercontent.com/jeek/jeek.js/dev/";
    }
    get repo() {
        return this.settings.repo;
    }
    async clone() {
        await this.ns.wget(this.repo + "main.js", "/temp/main.js");
        let imports = ["main.js"];
        let output = "";
        for (let i = 0; i < imports.length; i++) {
            let file = imports[i];
            let content = this.ns.read("/temp/" + file).split("\n");
            for (let line of content) {
                if (line.slice(0, 6) == "import") {
                    let newImport = line.split('"')[1];
                    if (!imports.includes(newImport)) {
                        this.ns.tprint(newImport);
                        imports.push(newImport);
                        await this.ns.wget(this.repo + newImport, "/temp/" + newImport);
                    }
                }
            }
        }
    }
    async build() {
        let imports = ["main.js"];
        let output = "";
        let final = "";
        for (let i = 0 ; i < imports.length ; i++) {
            this.ns.tprint(imports[i])
            let file = imports[i];
            let content = this.ns.read("/temp/" + file).split("\n");
            for (let line of content) {
                if (line.slice(0, 6) == "import") {
                    let newImport = line.split('"')[1];
                    if (!imports.includes(newImport)) {
                        this.ns.tprint("   ", newImport);
                        imports.push(newImport);
                    }
                } else {
                    final = final + "\n" + line;
                }
            }
        }
        await this.ns.write("jeek.js", final.slice(1), "w");
    }
    async doItAll() {
        await this.clone();
        await this.build();
    }
}