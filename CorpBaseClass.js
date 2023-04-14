class CorpBaseClass { // Functions shared between Corporation, Division, and City
    constructor(Game, settings) {
        this.ns = Game.ns;
        this.settings = JSON.parse(JSON.stringify(settings ?? {}));
    }
    get c() {
        return (async () => {
            try {
              return (await Do(this.ns, "ns.corporation.getCorporation"));
            } catch (e) {
              return 0;
            }
          })();
    }
    get funds() {
        return (async () => {
            try {
              return (await (this.c)).funds;
            } catch (e) {
              return 0;
            }
          })();
    }
    get round() {
        return (async () => {
            try {
              return (await (this.c)).public ? 5 : (await Do(this.ns, "ns.corporation.getInvestmentOffer")).round;
            } catch (e) {
              return 0;
            }
          })();
    }
    get Cities() {
        return Object.values(this.ns.enums.CityName);
    }
    get HQ() {
        return this.settings["HQ"];
    }
    async WaitOneLoop() {
        let state = (await (this.c)).state;
        while ((await (this.c)).state == state) {
            await this.ns.asleep((await Do(this.ns, "ns.corporation.getBonusTime")) > 0 ? 100 : 200);
        }
        while ((await (this.c)).state != state) {
            await this.ns.asleep((await Do(this.ns, "ns.corporation.getBonusTime")) > 0 ? 200 : 2000);
        }
    }
}