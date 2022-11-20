class Office {
	constructor(ns, division, city) {
		this.ns = ns;
		this.division = division;
		this.city = city;
	}
	async truxican() {
		let c = eval("this.ns.corporation");
		let startprod = c.getOffice(this.division, this.city).employeeProd;
		let moved = 0;
		let answer = {};
		let currentjobs = {
			"Operations": 0,
			"Business": 0,
			"Engineer": 0,
			"Management": 0,
			"Research & Development": 0,
			"Unassigned": 0,
			"Training": 0
		}
		while (c.getCorporation().state === "START")
			await this.ns.sleep(0);
		while (c.getCorporation().state != "START")
			await this.ns.sleep(0);
		for (let employee of c.getOffice(this.division, this.city).employees) {
			answer[employee] = new Employee(this.ns, this.division, this.city, employee).jobs;
			currentjobs[c.getEmployee(this.division, this.city, employee).pos] += 1;
			await this.ns.sleep(0);
		}
		let ranges = {}
		let final = [];
		for (let role of ["Operations", "Business", "Engineer", "Management", "Research & Development", "Unassigned", "Training"]) {
			if (currentjobs[role] > 0) {
				ranges[role] = [Object.keys(answer).map(x => answer[x][role]).reduce((a, b) => { return a <= b ? a : b }), Object.keys(answer).map(x => answer[x][role]).reduce((a, b) => { return a >= b ? a : b })]
				for (let employee of c.getOffice(this.division, this.city).employees) {
					if (ranges[role][0] == ranges[role][1]) {
						final.push([0, 0, employee, role]);
					} else {
						final.push([(answer[employee][role] - ranges[role][0]) / (ranges[role][1] - ranges[role][0]), answer[employee][role], employee, role]);
					}
					await this.ns.sleep(0);
				}
			}
		}
		final = final.sort((a, b) => { if (a[0] == b[0]) return a[1] - b[1]; return a[0] - b[0]; });
		while (final.length > 0) {
			if (currentjobs[final[final.length - 1][3]] > 0) {
				if (c.getEmployee(this.division, this.city, final[final.length - 1][2]).pos != final[final.length - 1][3]) {
					moved += 1;
					//this.ns.tprint(this.division, " ", this.city, " ", final[final.length-1][2], ": ", c.getEmployee(this.division, this.city, final[final.length-1][2]).pos, " -> ", final[final.length-1][3]);
				}
				c.assignJob(this.division, this.city, final[final.length - 1][2], final[final.length - 1][3]);
				currentjobs[final[final.length - 1][3]] -= 1;
				final = final.filter(x => x[2] != final[final.length - 1][2]);
			} else {
				final = final.filter(x => x[3] != final[final.length - 1][3]);
			}
			await this.ns.sleep(0);
		}
		if (moved) {
			while (c.getCorporation().state === "START")
				await this.ns.sleep(0);
			while (c.getCorporation().state != "START")
				await this.ns.sleep(0);
			let endprod = c.getOffice(this.division, this.city).employeeProd;
			this.ns.tprint(this.division, "/", this.city, ": Moved " + moved.toString() + " employees")
			for (let pos of Object.keys(endprod).sort()) {
				if (!["Training", "Unassigned"].includes(pos)) {
					this.ns.tprint(this.division, "/", this.city, "/", pos + ": ", startprod[pos], " + ", endprod[pos] - startprod[pos], " = ", endprod[pos]);
				}
			}
		}
	}
}
