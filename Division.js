import { CorpBaseClass } from "CorpBaseClass.js";
import { City } from "City.js";
import { WarehouseOptimizer } from "WarehouseOptimizer.js";

class Division extends CorpBaseClass {
    constructor(Game, Corp, industry, settings = {}) {
        super(Game, settings);
        this.Corp = Corp;
        this.industry = industry;
        this.citiesObj = {};
        this.lastProduct = 2e9 / 1.1;
        if (Object.keys(this.settings).includes(industry)) {
            for (let objKey of Object.keys(this.settings[industry])) {
                this.settings[objKey] = this.settings[industry][objKey];
            }
        }
        // Stored here so all six warehouses can share a cache
        this.Optimizer = new WarehouseOptimizer(...(["aiCoreFactor", "hardwareFactor", "realEstateFactor", "robotFactor"].map(factor => Object.keys(this.c.getIndustryData(this.industry)).includes(factor) ? this.c.getIndustryData(this.industry)[factor] : 0)), this.ns);
    }
    get name() {
        return (async () => {
            try {
                let names = {};
                for (let div of (await (this.c)).divisions) {
                    if ((await Do(this.ns, "ns.corporation.getDivision", div)).type == this.industry)
                        return div;
                }
            } catch (e) {
              return "ERROR";
            }
        })();
    }
    get cities() {
        return Object.values(this.citiesObj);
    }
    get industryData() {
        return (async () => {
            return await Do(this.ns, "ns.corporation.getIndustryData", this.industry);
        })();
    }
    get Aevum() {
        return this.citiesObj['Aevum'];
    }
    get Chongqing() {
        return this.citiesObj['Chongqing'];
    }
    get Ishima() {
        return this.citiesObj['Ishima'];
    }
    get ['New Tokyo']() {
        return this.citiesObj['New Tokyo'];
    }
    get ['Sector-12']() {
        return this.citiesObj['Sector-12'];
    }
    get Volhaven() {
        return this.citiesObj['Volhaven'];
    }
    get getDivision() {
        return (async () => {
            return await Do(this.ns, "ns.corporation.getDivision", await (this.name))
        })();
    }
    async Advert(toLevel = 1) {
        while ((await Do(this.ns, "ns.corporation.getHireAdVertCount", await (this.name))) < toLevel) {
            if ((await (this.getDivision)).awareness + (await (this.getDivision)).popularity > 1e300)
                return;
            if (await (this.funds) >= (await Do(this.ns, "this.corporation.getHireAdVertCost", await (this.name)))) {
                await Do(this.ns, "ns.corporation.hireAdVert", (await (this.name)));
            } else {
                await this.WaitOneLoop();
            }
        }
    }
    async getHappy() {
        let done = false;
        while (!done) {
            let industries = {};
            for (let div of (await (this.Corp.divisions))) {
                if (this.industry == (await Do(this.ns, "ns.corporation.getDivision", div)).type) {
                    done = true;
                }
            }
            if (!done) {
                await this.WaitOneLoop();
            }
        }
        await Promise.all(this.cities.map(city => city.o.getHappy()));
    }
    get isHappy() {
        return this.cities.map(city => city.isHappy).reduce((a, b) => a && b);
    }
    async Pricing() {
        this.cities.map(city => city.w.Pricing());
    }
    async enableSmartSupply() {
        await Promise.all(this.cities.map(city => city.w.enableSmartSupply()));
    }
    async WaitOneLoop() {
        await this.Corp.WaitOneLoop();
    }
    async Research(queue) {
        for (let item of queue) {
            if (!await Do(this.ns, "ns.corporation.hasResearched", await (this.name), x)) {
                while ((await (this.getdivision)).research <= cost) {
                    await this.WaitOneLoop();
                }
                await Do(this.ns, "ns.corporation.research", await (this.name), item); 
            }
        }
    }

    async MaintainWarehouse() {
        this.cities.map(city => city.w.MaintainWarehouse);
    }
}