import { CorpBaseClass } from "CorpBaseClass.js";

class Office extends CorpBaseClass {
    constructor(Game, City) {
        super(Game, City.settings);
        this.Corp = City.Corp;
        this.Division = City.Division;
        this.City = City;
        this.name = this.City.name;
    }
    get size() {
        return (async () => {
            try {
                return (await Do(this.ns, "ns.corporation.getOffice", this.Division.name, this.name)).size;
            } catch {
                return 0;
            }
        })();
    }
    get employees() {
        return (async () => {
            try {
                return (await Do(this.ns, "ns.corporation.getOffice", this.Division.name, this.name)).employees;
            } catch {
                return 0;
            }
        })();
    }
    get industryData() {
        return (async () => {
            try {
                return await (this.Division.industryData);
            } catch {
                return 0;
            }
        })();
    }
    get getOffice() {
        return (async () => {
            try {
                return (await Do(this.ns, "ns.corporation.getOffice", this.Division.name, this.name));
            } catch {
                return 0;
            }
        })();
    }
    async Start() {
        await this.getAPI();
        if ((await (this.size)) == 3 && (await (this.getOffice)).employeeJobs["Unassigned"] == 3)
            await this.Hire({ "Operations": 1, "Engineer": 1, "Business": 1 })
        this.coffeeparty();
    }
    async getAPI() {
        while (!await Do(this.ns, "ns.corporation.hasUnlockUpgrade", "Office API")) {
            if ((await Do(this.ns, "ns.corporation.getUnlockUpgradeCost", "Office API")) <= this.funds) {
                await Do(this.ns, "ns.corporation.unlockUpgrade", "Office API");
            } else {
                await this.WaitOneLoop();
            }
        }
    }
    async Hire(roles) {
        for (let job of ["Operations", "Engineer", "Management", "Business", "Research & Development"]) {
            if (!Object.keys(roles).includes(job)) {
                roles[job] = 0;
            }
        }
        let total = Object.values(roles).reduce((a, b) => a + b, 0);
        await this.getAPI();
        while (this.size < total) {
            if ((await Do(this.ns, "ns.corporation.getOfficeSizeUpgradeCost", this.Division.name, this.name, 3)) <= this.funds) {
                await Do(this.ns, "ns.corporation.upgradeOfficeSize", this.Division.name, this.name, 3);
            } else {
                await this.WaitOneLoop();
            }
            let officeData = await(this.getOffice);
            for (let job of ["Operations", "Engineer", "Management", "Business", "Research & Development"].sort((a, b) => officeData.employeeJobs[a] - roles[a] - officeData.employeeJobs[b] + roles[b])
            ) {
                while (await(this.employees) < (await(this.size)) && (await (this.getOffice).employeeJobs[job] < roles[job])) {
                    await Do(this.ns, "ns.corporation.hireEmployee", this.Division.name, this.name, job);
                }
            }
        }
        while (await(this.employees) < await(this.size)) {
            await Do(this.ns, "ns.corporation.hireEmployee", this.Division.name, this.name, "Unassigned");
        }
        let good = true;
        let officeData = await(this.getOffice);
        for (let job of Object.keys(roles).sort((a, b) => officeData.employeeJobs[a] - roles[a] - officeData.employeeJobs[b] + roles[b])
        ) {
            if ((await(this.getOffice)).employeeJobs[job] < roles[job]) {
                try {
                    if (await Do(this.ns, "ns.corporation.setAutoJobAssignment", this.Division.name, this.name, job, roles[job])) {
                    } else {
                        good = false;
                    }
                } catch {
                    good = false;
                }
            }
        }
        if (!good) {
            await this.WaitOneLoop();
            for (let job of ["Operations", "Engineer", "Management", "Business", "Research & Development"]) {
                await Do(this.ns, "ns.corporation.setAutoJobAssignment", this.Division.name, this.name, job, 0);
            }
            await this.WaitOneLoop();
            for (let job of Object.keys(roles)) {
                if ((await (this.getOffice)).employeeJobs[job] < roles[job]) {
                    try {
                        if (await Do(this.ns, "ns.corporation.setAutoJobAssignment", this.Division.name, this.name, job, roles[job])) {
                        } else {
                            good = false;
                        }
                    } catch {
                        good = false;
                    }
                }
            }
        }
    }
    async getHappy() {
        await this.getAPI();
        while (true) {
            let happy = true;
            if ((await (this.getOffice)).avgEne < this.settings.minEnergy) {
                happy = false;
            }
            if ((await (this.getOffice)).avgHap < this.settings.minHappy) {
                happy = false;
            }
            if ((await (this.getOffice)).avgMor < this.settings.minMorale) {
                happy = false;
            }
            if (happy) {
                return;
            }
            await this.WaitOneLoop();
        }
    }
    get isHappy() {
        return (async () => {
            try {
                let happy = true;
                if ((await (this.getOffice)).avgEne < this.settings.minEnergy) {
                    happy = false;
                }
                if ((await (this.getOffice)).avgHap < this.settings.minHappy) {
                    happy = false;
                }
                if ((await (this.getOffice)).avgMor < this.settings.minMorale) {
                    happy = false;
                }
                return happy;
            } catch {
                return false
            }
        })();
    }
    async coffeeparty() {
        await this.getAPI();
        while (true) {
            while ((await Do(this.ns, "ns.corporation.getCorporation")).state != "SALE") {
                await this.ns.asleep(400);
            }
            if ((await (this.getOffice)).employees > 0) {
                if ((await (this.getOffice)).avgEne < this.settings.minEnergy && (await (this.getOffice)).employees * (await Do(this.ns, "ns.corporation.getConstants")).coffeeCostPerEmployee < await (this.funds)) {
                    await Do(this.ns, "ns.corporation.buyCoffee", this.Division.name, this.name);
                }
                if (((await (this.getOffice)).avgHap < this.settings.minHappy || (await (this.getOffice)).avgMor < this.settings.minMorale) && (await (this.getOffice)).employees * (await Do(this.ns, "ns.corporation.getConstants")).coffeeCostPerEmployee < await(this.funds)) {
                    await Do(this.ns, "ns.corporation.throwParty", this.Division.name, this.name, (await Do(this.ns, "ns.corporation.getConstants")).coffeeCostPerEmployee);
                }
            }
            while ((await Do(this.ns, "ns.corporation.getCorporation")).state === "SALE") {
                await this.ns.asleep(400);
            }
        }
    }
}