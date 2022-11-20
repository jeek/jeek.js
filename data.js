export let CITIES = ["Sector-12", "Aevum", "Chongqing", "Ishima", "New Tokyo", "Volhaven"];

export let FACTIONS = {
	"CyberSec": { "abbrev": "CS", "early": true, "backdoor": "CSEC" },
	"Tian Di Hui": { "abbrev": "TD", "early": true, "city": ["Chongqing", "New Tokyo", "Ishima"], "money": 1e6 },
	"NiteSec": { "abbrev": "NS", "early": true, "backdoor": "avmnite-02h", "hacking": 50 },
	"The Black Hand": { "abbrev": "BH", "early": true, "gang": true, "backdoor": "I.I.I.I" },
	"BitRunners": { "abbrev": "BR", "early": true, "backdoor": "run4theh111z" },
	"Netburners": { "abbrev": "NB", "early": true },
	"Slum Snakes": { "abbrev": "SS", "crime": true, "gang": true, "karma": -9, "combat": 30, "money": 1e6 },
	"Tetrads": { "abbrev": "Te", "crime": true, "gang": true, "karma": -18, "city": ["Chongqing", "New Tokyo", "Ishima"], "combat": 75 },
	"Speakers for the Dead": { "abbrev": "Sp", "crime": true, "gang": true, "hatesnsa": true, "combat": 300, "peoplekilled": 30, "karma": -45, "hacking": 100 },
	"Silhouette": { "abbrev": "Si", "crime": true, "gang": true, "money": 15e6, "ceo": true, "karma": -22 },
	"The Dark Army": { "abbrev": "DA", "hatesnsa": true, "combat": 300, "city": ["Chongqing"], "peoplekilled": 5, "karma": -45, "gang": true, "hacking": 300 },
	"The Syndicate": { "abbrev": "Sy", "crime": true, "gang": true, "city": ["Sector-12", "Aevum"], "karma": -90, "money": 10e6, "hatesnsa": true, "hacking": 200 },
	"Sector-12": { "abbrev": "12", "early": true, "citygroup": 1, "city": ["Sector-12"], "money": 15e6 },
	"Aevum": { "abbrev": "Ae", "early": true, "citygroup": 1, "city": ["Aevum"], "money": 40e6 },
	"Chongqing": { "abbrev": "CQ", "early": true, "citygroup": 2, "city": ["Chongqing"], "money": 20e6 },
	"New Tokyo": { "abbrev": "NT", "early": true, "citygroup": 2, "city": ["New Tokyo"], "money": 20e6 },
	"Ishima": { "abbrev": "Is", "early": true, "citygroup": 2, "city": ["Ishima"], "money": 30e6 },
	"Volhaven": { "abbrev": "Vo", "early": true, "citygroup": 3, "city": ["Volhaven"], "money": 50e6 },
	"ECorp": { "abbrev": "EC", "company": "ECorp" },
	"MegaCorp": { "abbrev": "MC", "company": "MegaCorp" },
	"KuaiGong International": { "abbrev": "KG", "company": "KuaiGong International" },
	"Four Sigma": { "abbrev": "4S", "company": "Four Sigma" },
	"NWO": { "abbrev": "NW", "company": "NWO" },
	"Blade Industries": { "abbrev": "Bl", "company": "Blade Industries" },
	"OmniTek Incorporated": { "abbrev": "OT", "company": "OmniTek Incorporated" },
	"Bachman & Associates": { "abbrev": "BA", "company": "Bachman & Associates" },
	"Clarke Incorporated": { "abbrev": "Cl", "company": "Clarke Incorporated" },
	"Fulcrum Secret Technologies": { "abbrev": "Fu", "company": "Fulcrum Technologies" },
	"The Covenant": { "abbrev": "Co", "augmentations": 20, "money": 75e9, "combat": 850, "hacking": 850 },
	"Daedalus": { "abbrev": "Da", "augmentations": 30, "money": 100e9, "combat": 1500, "or": true, "hacking": 2500 },
	"Illuminati": { "abbrev": "Il", "augmentations": 30, "combat": 1200, "money": 150e9, "hacking": 1500 },
	"Church of the Machine God": { "abbrev": "Ch", "bitnode": [13] },
	"Bladeburners": {
		"abbrev": "BB", "bitnode": [6, 7]
	},
	"Shadows of Anarchy": { "abbrev": "SoA" }
}

let stockSymbolToCompany = {
	"ECP": "ECorp",
	"MGCP": "MegaCorp",
	"BLD": "Blade Industries",
	"CLRK": "Clarke Incorporated",
	"OMTK": "Omnitek Incorporated",
	"FSIG": "Four Sigma",
	"KGI": "KuaiGong International",
	"FLCM": "Fulcrum Technologies",
	"STM": "Storm Technologies",
	"DCOMM": "DefComm",
	"HLS": "Helios Labs",
	"VITA": "VitaLife",
	"ICRS": "Icarus Microsystems",
	"UNV": "Universal Energy",
	"AERO": "AeroCorp",
	"OMN": "Omnia Cybersystems",
	"SLRS": "Solaris Space Systems",
	"GPH": "Global Pharmaceuticals",
	"NVMD": "Nova Medical",
	"WDS": "Watchdog Security",
	"LXO": "LexoCorp",
	"RHOC": "Rho Construction",
	"APHE": "Alpha Enterprises",
	"SYSC": "SysCore Securities",
	"CTK": "CompuTek",
	"NTLK": "NetLink Technologies",
	"OMGA": "Omega Software",
	"FNS": "FoodNStuff",
	"SGC": "Sigma Cosmetics",
	"JGN": "Joe's Guns",
	"CTYS": "Catalyst Ventures",
	"MDYN": "Microdyne Technologies",
	"TITN": "Titan Laboratories"
};

let LOCATIONS = {
	"AeroCorp": {
		"city": "Aevum"
	},
	"Bachman & Associates": {
		"city": "Aevum"
	},
	"Clarke Incorporated": {
		"city": "Aevum"
	},
	"Crush Fitness Gym": {
		"city": "Aevum"
	},
	"ECorp": {
		"city": "Aevum"
	},
	"Fulcrum Technologies": {
		"city": "Aevum"
	},
	"Galactic Cybersystems": {
		"city": "Aevum"
	},
	"NetLink Technologies": {
		"city": "Aevum"
	},
	"Aevum Police Headquarters": {
		"city": "Aevum"
	},
	"Rho Construction": {
		"city": "Aevum"
	},
	"Snap Fitness Gym": {
		"city": "Aevum"
	},
	"Summit University": {
		"city": "Aevum"
	},
	"Watchdog Security": {
		"city": "Aevum"
	},
	"Iker Molina Casino": {
		"city": "Aevum"
	},
	"KuaiGong International": {
		"city": "Chongqing"
	},
	"Solaris Space Systems": {
		"city": "Chongqing"
	},
	"Church of the Machine God": {
		"city": "Chongqing"
	},
	"Alpha Enterprises": {
		"city": "Sector-12"
	},
	"Blade Industries": {
		"city": "Sector-12"
	},
	"Central Intelligence Agency": {
		"city": "Sector-12"
	},
	"Carmichael Security": {
		"city": "Sector-12"
	},
	"Sector-12 City Hall": {
		"city": "Sector-12"
	},
	"DeltaOne": {
		"city": "Sector-12"
	},
	"FoodNStuff": {
		"city": "Sector-12"
	},
	"Four Sigma": {
		"city": "Sector-12"
	},
	"Icarus Microsystems": {
		"city": "Sector-12"
	},
	"Iron Gym": {
		"city": "Sector-12"
	},
	"Joe's Guns": {
		"city": "Sector-12"
	},
	"MegaCorp": {
		"city": "Sector-12"
	},
	"National Security Agency": {
		"city": "Sector-12"
	},
	"Powerhouse Gym": {
		"city": "Sector-12"
	},
	"Rothman University": {
		"city": "Sector-12"
	},
	"Universal Energy": {
		"city": "Sector-12"
	},
	"DefComm": {
		"city": "New Tokyo"
	},
	"Global Pharmaceuticals": {
		"city": "New Tokyo"
	},
	"Noodle Bar": {
		"city": "New Tokyo"
	},
	"VitaLife": {
		"city": "New Tokyo"
	},
	"Arcade": {
		"city": "New Tokyo"
	},
	"Nova Medical": {
		"city": "Ishima"
	},
	"Omega Software": {
		"city": "Ishima"
	},
	"Storm Technologies": {
		"city": "Ishima"
	},
	"Glitch": {
		"city": "Ishima"
	},
	"CompuTek": {
		"city": "Volhaven"
	},
	"Helios Labs": {
		"city": "Volhaven"
	},
	"LexoCorp": {
		"city": "Volhaven"
	},
	"Millenium Fitness Gym": {
		"city": "Volhaven"
	},
	"NWO": {
		"city": "Volhaven"
	},
	"OmniTek Incorporated": {
		"city": "Volhaven"
	},
	"Omnia Cybersystems": {
		"city": "Volhaven"
	},
	"SysCore Securities": {
		"city": "Volhaven"
	},
	"ZB Institute of Technology": {
		"city": "Volhaven"
	}
}
