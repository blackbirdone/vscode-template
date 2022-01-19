/* eslint-disable prefer-const */
import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    let serverName = ns.getHostname();

	let standard = true;

	if (ns.args[0] != null) {
		serverName = ns.args[0];
	}

	if (ns.args[1] != null) {
		standard = false;
	}

	while (true) {
		if (ns.getHostname().includes("farm")) {

			const processes = ns.ps(serverName);
			let scriptRunning = true;
			while (scriptRunning) {
				scriptRunning = false;
				for (const process of processes) {
					if (process.filename === "weakOnce.js") {
						scriptRunning = true;
					}
				}
				await ns.sleep(1000);
			}			

			await grow(ns, serverName);
			await hack(ns, serverName);
			continue
		}

		let minSecurityLevel = ns.getServerMinSecurityLevel(serverName);

		ns.print("securityLevel: " + ns.getServerSecurityLevel(serverName) + " minLevel: " + minSecurityLevel);

		while (parseInt(ns.getServerSecurityLevel(serverName)) > parseInt(ns.getServerMinSecurityLevel(serverName) + 1)) {
			ns.print("SLevel: " + parseInt(ns.getServerSecurityLevel(serverName)) + " MinLevel " + parseInt(minSecurityLevel));
			await ns.weaken(serverName);
		}

		if (ns.getServerMoneyAvailable(serverName) < ns.getServerMaxMoney(serverName) * 0.85) {
			await grow(ns, serverName);
		} else {
			await hack(ns, serverName);
		}
	}
}

/** @param {NS} ns **/
async function grow(ns, target) {

	let currentMoney = ns.getServerMoneyAvailable(target);
	let maxMoney = ns.getServerMaxMoney(target);

	let multiplyer = (maxMoney / currentMoney + 1);

	let threadsNeededCalculated = ns.growthAnalyze(target, multiplyer);

	let script = ns.getRunningScript(ns.getScriptName(), ns.getHostname(), ns.args[0])
	if (ns.args[1] != null) {
		script = ns.getRunningScript(ns.getScriptName(), ns.getHostname(), ns.args[0], ns.args[1])
	}


	let threadsNeeded = 0;
	if (script.threads < threadsNeededCalculated) {
		threadsNeeded = script.threads;
	} else {
		threadsNeeded = threadsNeededCalculated;
	}



	if (ns.fileExists("weakOnce.js")) {
		let threadWeak = script.threads - threadsNeededCalculated
		if (threadWeak > 0) {
			let growTime = ns.getGrowTime(target);
			let weakTime = ns.getWeakenTime(target);
			let time = 0;
			if (growTime > weakTime) {
				time = growTime - weakenTime + 10;
			}
			ns.exec("weakOnce.js", ns.getHostname(), threadWeak, target, time);
		}
	}

	ns.print("GROW ThreadsNeeded " + threadsNeededCalculated + " to grow x" + multiplyer + "" + " available " + script.threads);

	await ns.grow(target, { threads: threadsNeeded });

}

/** @param {NS} ns **/
async function hack(ns, target) {

	let halfAmmount = ns.getServerMaxMoney(target) * 0.5;

	// eslint-disable-next-line no-var
	var currentMoney = ns.getServerMoneyAvailable(target);

	if (currentMoney < ns.getServerMaxMoney(target) * 0.85) {
		await ns.sleep(1000);
		return;
	}

	let moneyToHack = currentMoney - halfAmmount;

	if (moneyToHack <= 0) {
		await ns.sleep(1000);
		return;
	}

	let threadsNeededCalculated = ns.hackAnalyzeThreads(target, moneyToHack);

	let script = ns.getRunningScript(ns.getScriptName(), ns.getHostname())
	if (ns.args[0] != null) {
		script = ns.getRunningScript(ns.getScriptName(), ns.getHostname(), ns.args[0]);
	}
	if (ns.args[1] != null) {
		script = ns.getRunningScript(ns.getScriptName(), ns.getHostname(), ns.args[0], ns.args[1])
	}

	let threadsNeeded = 0;
	if (script.threads < threadsNeededCalculated) {
		threadsNeeded = script.threads;
	} else {
		threadsNeeded = threadsNeededCalculated;
	}

	ns.print("Hack ThreadsNeeded " + threadsNeeded + " to hack " + moneyToHack + " $" + " available " + script.threads);

	await ns.hack(target, { threads: threadsNeeded });S
}