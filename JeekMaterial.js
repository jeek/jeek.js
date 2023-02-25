import { MaterialIndustry } from "MaterialIndustry.js";
import { City } from "City.js";

class JeekMaterial extends MaterialIndustry {
    constructor(ns, Corp, industry, settings = {}) {
        super(ns, Corp, industry, settings);
    }
    async GiveUp() {
        let start = Date.now();
        while (Date.now() - start < 600000 && this.round <= 2)
            await this.WaitOneLoop();
        if (this.round == 2) {
            this.cities.map(city => promises.push(city.o.Hire({ "Operations": 2, "Engineer": 2, "Business": 2, "Management": 2, "Research & Development": 1 })));
            start = Date.now();
            while (Date.now() - start < 600000 && this.round <= 2)
                await this.WaitOneLoop();
            if (this.round == 2) {
                this.cities.map(city => promises.push(city.o.Hire({ "Operations": 3, "Engineer": 2, "Business": 2, "Management": 2, "Research & Development": 3 })));
            }
        }
        return;
    }
    async Start() {
        while (this.c.getCorporation().divisions.map(div => [div, this.c.getDivision(div).type]).filter(x => x[1] == this.industry).length == 0) {
            if (this.c.getIndustryData(this.industry).startingCost <= this.funds) {
                this.c.expandIndustry(this.industry, Object.keys(this.settings).includes("name") ? this.settings["name"] : this.industry);
            } else {
                await this.WaitOneLoop();
            }
        }
        this.Corp.pause += 1;
        let city = "Sector-12";
        this.citiesObj[city] = new City(this.ns, this.Corp, this, city, this.settings);
        await this.citiesObj[city].Start();
        this.industryData.producedMaterials.map(material => this.citiesObj[city].w.sellMaterial(material));
        for (let city of this.Cities) {
            if (city != "Sector-12") {
                this.citiesObj[city] = new City(this.ns, this.Corp, this, city, this.settings);
                await this.citiesObj[city].Start();
                this.industryData.producedMaterials.map(material => this.citiesObj[city].w.sellMaterial(material));
            }
        }
        var cmdlineargs = this.ns.flags(this.settings.cmdlineflags);
        while (!(this.c.getCorporation().divisions.map(x => this.c.getDivision(x)).map(x => x.type).includes(this.industry))) {
            await this.WaitOneLoop();
        }
        this.Research(["Hi-Tech R&D Laboratory"]).then(this.Research(["Market-TA.I", "Market-TA.II"]));
        this.Pricing();
        await this.enableSmartSupply();
        let promises = [];
        // Get Employees
        this.cities.map(city => promises.push(city.o.Hire({ "Operations": 1, "Engineer": 1, "Business": 1 })));
        // Buy 1 advert
        promises.push(this.Advert(cmdlineargs['jakobag'] ? 2 : 1));
        if (cmdlineargs['jakobag']) {
            promises.push(this.Corp.GetUpgrade("Smart Storage", 3));
            for (let i = 1 ; i <= 5 ; i += 1) {
                this.cities.map(city => promises.push(city.w.upgradeLevel(i)));
            }
        } else {
            for (let i = 1 ; i <= 3 ; i += 1) {
                this.cities.map(city => promises.push(city.w.upgradeLevel(i)));
            }
            for (let upgrade of ["FocusWires", "Neural Accelerators", "Speech Processor Implants", "Nuoptimal Nootropic Injector Implants", "Smart Factories"]) {
                promises.push(this.Corp.GetUpgrade(upgrade, 2));
            }
        }
        this.Corp.pause -= 1;
        if (this.round <= 1) {
            await this.getHappy();
        }
        await Promise.all(promises); promises = [];
        if (this.round <= 1) {
            await this.getHappy();
        }
        // Adjust Warehouses
        if (this.round == 1 || this.round == 3 || this.c.getMaterial(this.name, this.HQ, "AI Cores").qty==0 || this.c.getMaterial(this.name, this.HQ, "Hardware").qty==0 || this.c.getMaterial(this.name, this.HQ, "Real Estate").qty==0 || this.c.getMaterial(this.name, this.HQ, "Robots").qty==0)
            await Promise.all(this.cities.map(city => city.w.FF()));
        if (this.round <= 1) {
            while (this.round <= 1) {
                await this.WaitOneLoop();
            }
            await this.WaitOneLoop();
            await this.WaitOneLoop();
            await this.WaitOneLoop();
        }
        // Get Employees
        let redo = false;
        if (this.getDivision.research < 2 || this.cities.map(city => city.o.size).reduce((a, b) => a > b ? b : a) < 9) {
            redo = true;
            this.cities.map(city => promises.push(city.o.Hire({ "Operations": 1, "Engineer": 1, "Business": 1, "Management": 1, "Research & Development": 5 })));
        } else {
            this.cities.map(city => promises.push(city.o.Hire({ "Operations": 3, "Engineer": 2, "Business": 2, "Management": 2, "Research & Development": 0 })));
        }
        if (redo) {
            while (this.getDivision.research < 2) {
                await this.WaitOneLoop();
            }
        }
        await Promise.all(promises); promises = [];
        if (this.round >= 2) {
            this.cities.map(city => promises.push(city.o.Hire({ "Operations": 3, "Engineer": 2, "Business": 2, "Management": 2, "Research & Development": 0 })))
            for (let i = 1 ; i <= 10 ; i++) {
                promises.push(this.Corp.GetUpgrade("Smart Factories", i));
                promises.push(this.Corp.GetUpgrade("Smart Storage", i));
                this.cities.map(city => promises.push(city.w.upgradeLevel(i)));
            }
        }
        if (this.round <= 2) {
            await this.getHappy();
            await Promise.any([Promise.all(promises), this.GiveUp()]);
            await this.getHappy();
        }
        // Adjust Warehouses
        if (this.round == 2)
            await Promise.all(this.cities.map(city => city.w.FF()));
        for (let i = 0 ; i < 6 ; i++) {
            if (this.round == 2) {
                await this.WaitOneLoop();
            }
        }
        if (this.round == 2) {
            this.c.acceptInvestmentOffer();
        }
        while (this.round <= 2) {
            await this.WaitOneLoop();
        }
        // Upgrade Each City's Storage to 3800
        for (let i = 1 ; i < 19 ; i++) {
            this.cities.map(city => promises.push(city.w.upgradeLevel(i)));
        }
        this.cities.map(city => promises.push(city.w.upgradeLevel(19), true));
        await Promise.all(promises); promises = [];
        this.cities.map(city => city.w.FF(3800));
        this.cities.map(city => promises.push(city.o.Hire({ "Operations": 3, "Engineer": 2, "Business": 2, "Management": 2, "Research & Development": 3 })))
        return true;
    }
}