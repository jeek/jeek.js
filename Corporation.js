import { CorpBaseClass } from "CorpBaseClass.js";
import { GuideMaterial } from "GuideMaterial.js";
import { GuideProduct } from "GuideProduct.js";

export class Corporation extends CorpBaseClass {
    constructor(Game, settings = {}) {
        super(Game, settings);
        if (!Object.keys(this.settings).includes("HQ")) {
            this.settings['HQ'] = "Sector-12";
        }
        this.started = false;
        this.divisionsObj = {};
        this.pause = 0;
    }
    get name() {
        return (async () => {
            try {
              return (await (this.c)).name;
            } catch (e) {
              return 0;
            }
          })();
    }
    get Agriculture() {
        return this.divisionsObj['Agriculture'];
    }
    get Chemical() {
        return this.divisionsObj['Chemical'];
    }
    get ['Computer Hardware']() {
        return this.divisionsObj['Computer Hardware'];
    }
    get Energy() {
        return this.divisionsObj['Energy'];
    }
    get Fishing() {
        return this.divisionsObj['Fishing'];
    }
    get Food() {
        return this.divisionsObj['Food'];
    }
    get Healthcare() {
        return this.divisionsObj['Healthcare'];
    }
    get Mining() {
        return this.divisionsObj['Mining'];
    }
    get Pharmaceutical() {
        return this.divisionsObj['Pharmaceutical'];
    }
    get ['Real Estate']() {
        return this.divisionsObj['Real Estate'];
    }
    get Robotics() {
        return this.divisionsObj['Robotics'];
    }
    get Software() {
        return this.divisionsObj['Software'];
    }
    get Tobacco() {
        return this.divisionsObj['Tobacco'];
    }
    get ['Water Utilities']() {
        return this.divisionsObj['Water Utilities'];
    }
    get isHappy() {
        return this.divisionsObj.map(division => division.isHappy).reduce((a, b) => a && b);
    }
    async Start() {
        while ([undefined, false].includes(await Do(this.ns, "ns.corporation.hasCorporation"))) {
            try {
                await Do(this.ns, "ns.corporation.createCorporation", this.settings.includes("name") ? this.settings.name : "Corporation", (await Do(this.ns, "ns.getPlayer")).bitNodeN == 3 ? false : true);
                await this.ns.asleep(0);
            } catch {
                await this.ns.asleep(60000);
            }
        }
        await this.ns.asleep(1);
        if (Object.keys(this.settings).includes("name")) {
            delete this.settings["name"];
        }
        this.divisionsObj = {};
        for (let divname of await (this.divisions)) {
            let type = (await Do(this.ns, "ns.corporation.getDivision", divname)).type;
            if (!Object.keys(settings).includes(type)) {
                settings[type] = {};
            }
            this.StartDivision(type, this.settings[type]);
        }
        this.started = true;
        this.ns.toast("Corporation started.");
        this.Continue();
    }
    get divisions() {
        return (async () => {
            try {
              return (await (this.c)).divisions;
            } catch (e) {
              return 0;
            }
          })();
    }
    async Continue() {
        if (!Object.keys(this.settings).includes("scam") || this.settings.scam == false) {
            await this.WaitOneLoop();
            for (let i = 1; i <= 4; i++) {
                while (this.round == i && (await Do(this.ns, "ns.corporation.getInvestmentOffer")).funds + (await (this.funds) > 0 ? (await this.funds) : 0) < (Object.keys(this.settings).includes("baseOffers") ? this.settings['baseOffers'][i - 1] : [210e9, 5e12, 800e12, 500e15]) * (await Do(this.ns, "ns.getBitNodeMultipliers")).CorporationValuation) {
                    await this.WaitOneLoop();
                }
                if (this.round == i) {
                    await Do(this.ns, "ns.corporation.acceptInvestmentOffer");
                    await this.WaitOneLoop();
                }
            }
            if (!(await (this.c)).public)
                await Do(this.ns, "ns.corporation.goPublic", 0);
        }
        while (this.round < 5)
            await this.WaitOneLoop();
        await Do(this.ns, "ns.corporation.issueDividends", 1);
        while (this.funds < 1e21)
            await this.WaitOneLoop();
        (await Do(this.ns, "ns.corporation.getConstants")).unlockNames.map(unlock => Do(this.ns, "ns.corporation.unlockUpgrade", unlock));
    }
    async StartDivision(type, settings = {}) {
        if (Object.keys(this.divisionsObj).includes(type)) {
            return;
        }
        let plan = "Guide";
        if (Object.keys(this.settings).includes(type) && Object.keys(this.settings[type]).includes("plan")) {
            plan = this.settings[type].plan;
        }
        let makesProducts = Object.keys((await Do(this.ns, "ns.corporation.getIndustryData", type))).includes("product");
        let makesMaterials = Object.keys((await Do(this.ns, "ns.corporation.getIndustryData", type))).includes("producedMaterials");
        switch (plan) {
//            case "Scam":
//                this.divisionsObj[type]=new Scam(this.ns, this, type, this.settings);
//                break;
//            case "Shell":
//                this.divisionsObj[type]=new Shell(this.ns, this, type, this.settings);
//                break;
            case "Guide":
                default:
                    if (makesMaterials) {
                    this.divisionsObj[type]=new GuideMaterial(this.ns, this, type, this.settings);
                }
                if (makesProducts) {
                    this.divisionsObj[type]=new GuideProduct(this.ns, this, type, this.settings);
                }
                break;
//            case "Jeek":
//                if (makesMaterials) {
//                    this.divisionsObj[type]=new JeekMaterial(this.ns, this, type, this.settings);
//                }
//                if (makesProducts) {
//                    this.divisionsObj[type]=new JeekProduct(this.ns, this, type, this.settings);
//                }
        }
        this.divisionsObj[type].Start();
    }
    async GetUpgrade(upgrade, level = 1) {
        while ((await Do(this.ns, "ns.corporation.getUpgradeLevel", upgrade)) < level) {
            while ((await Do(this.ns, "ns.corporation.getUpgradeLevel", upgrade)) < level && (await Do(this.ns, "ns.corporation.getUpgradeLevelCost", upgrade)) <= await (this.funds)) {
                await Do(this.ns, "ns.corporation.levelUpgrade", upgrade);
            }
            if ((await Do(this.ns, "ns.corporation.getUpgradeLevel", upgrade)) < level) {
                await this.WaitOneLoop();
            }
        }
    }
}
