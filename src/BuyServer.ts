import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    ns.tprint("Buy Server");
	let money = 100* 1 / 100;
	if (ns.args[0] != null) {
		money = parseInt(ns.args[0]) * 1 / 100;
	}
	let ram = -99;

	for (let i = 1; i < 25; i++) {
		ram = Math.pow(2, i);
		if (ns.getServerMoneyAvailable("home") * money < ns.getPurchasedServerCost(ram)) {
			ram = Math.pow(2, i - 1);
			break;            
		}
		
	}

	let tmpRam = -99;
	for (let i = 1; i < 25; i++) {
		tmpRam = Math.pow(2, i);		
		ns.tprint("ram " + tmpRam + " pow " + i + " " + ns.nFormat(ns.getPurchasedServerCost(tmpRam), '0.000a') + " " + ns.getPurchasedServerCost(tmpRam));
	}


	if(ns.args[0] == null){
		ns.tprint("The max GB Server you can buy with 100% Money is " + ram + " GB  the next server costs " + ns.nFormat(ns.getPurchasedServerCost(ram*2),	'0,0[.]00 $'));
		return;
	}
	const destination = ns.purchaseServer("farm-" + ram + "-GB", ram);
	ns.tprint("Server gekauft " + destination);
}