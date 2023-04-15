import { Do } from "Do.js";

export class Infiltrations {
    doc = {
        'getPossibleLocations': 'stuff',
        'getInfiltration': `
# Infiltration.getInfiltration() method
---
Get all infiltrations with difficulty, location and rewards.

Signature:

\`getInfiltration(location: string): InfiltrationLocation;\`

Parameters

Parameter	Type	Description
location	string	

Returns:        
InfiltrationLocation
        
Infiltration data for given location.
        
Remarks
RAM cost: 15 GB`
    };
    constructor(Game, settings = {}) {
        this.ns = Game.ns;
        this.Game = Game;
        this.settings = settings;
    }
    get ['getPossibleLocations']() {
        return (async () => {
			try {
				return await Do(this.ns, "ns.infiltration.getPossibleLocations");
			} catch (e) {
				return [];
			}
		})();
    }
    async ['getInfiltration'](location) {
        return (async () => {
			try {
                return await Do(this.ns, "ns.infiltration.getInfiltration", location);
            } catch (e) {
                return [];
            }
        })();
    }
}