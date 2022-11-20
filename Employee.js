class Employee {
	constructor(ns, division, city, name) {
		this.ns = ns;
		this.division = division;
		this.city = city;
		this.name = name;
	}
	get int() {
		let c = eval("this.ns.corporation");
		return c.getEmployee(this.division, this.city, this.name).int * (1 + .1 * c.getUpgradeLevel("Neural Accelerators")) * (c.hasResearched(this.division, "Overclock") ? 1.25 : 1) * (c.hasResearched(this.division, "CPH4 Injections") ? 1.1 : 1);
	}
	get eff() {
		let c = eval("this.ns.corporation");
		return c.getEmployee(this.division, this.city, this.name).eff * (1 + .1 * c.getUpgradeLevel("FocusWires")) * (c.hasResearched(this.division, "Overclock") ? 1.25 : 1) * (c.hasResearched(this.division, "CPH4 Injections") ? 1.1 : 1);
	}
	get cre() {
		let c = eval("this.ns.corporation");
		return c.getEmployee(this.division, this.city, this.name).cre * (1 + .1 * c.getUpgradeLevel("Nuoptimal Nootropic Injector Implants")) * (c.hasResearched(this.division, "CPH4 Injections") ? 1.1 : 1);
	}
	get cha() {
		let c = eval("this.ns.corporation");
		return c.getEmployee(this.division, this.city, this.name).cha * (1 + .1 * c.getUpgradeLevel("Speech Processor Implants")) * (c.hasResearched(this.division, "CPH4 Injections") ? 1.1 : 1);
	}
	get exp() {
		let c = eval("this.ns.corporation");
		return c.getEmployee(this.division, this.city, this.name).exp;
	}
	get operations() {
		return this.int * .6 + this.cha * .1 + this.exp + this.cre * .5 + this.eff;
	}
	get engineer() {
		return this.int + this.cha * .1 + this.exp * 1.5 + this.eff;
	}
	get business() {
		return this.int * .4 + this.cha + this.exp * .5;
	}
	get management() {
		return this.cha * 2 + this.exp + this.cre * .2 + this.eff * .7;
	}
	get researchanddevelopment() {
		return this.int * 1.5 + this.exp * .8 + this.cre + this.eff * .5;
	}
	get training() {
		return 0;
	}
	get unassigned() {
		return 0;
	}
	get jobs() {
		return {
			"Operations": this.operations,
			"Business": this.business,
			"Engineer": this.engineer,
			"Management": this.management,
			"Research & Development": this.researchanddevelopment,
			"Unassigned": this.unassigned,
			"Training": this.training
		}
	}
}
