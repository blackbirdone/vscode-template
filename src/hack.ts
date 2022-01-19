/* eslint-disable prefer-const */
import { NS } from '@ns'
import { includes } from 'lodash';
import { hostname } from 'os';

export async function main(ns: NS): Promise<void> {
	let serverName = ns.getHostname();

	ns.hackAnalyze(hostName)
	let standard = true;

	if (ns.args[0] != null) {
		serverName = ns.args[0];
	}

	if (ns.args[1] != null) {
		standard = false;
	}

	while (true) {

		let minSecurityLevel = ns.getServerMinSecurityLevel(serverName);

		ns.print("securityLevel: " + ns.getServerSecurityLevel(serverName) + " minLevel: " + minSecurityLevel);

		while (parseInt(ns.getServerSecurityLevel(serverName)) > parseInt(ns.getServerMinSecurityLevel(serverName) + 1)) {
			ns.print("SLevel: " + parseInt(ns.getServerSecurityLevel(serverName)) + " MinLevel " + parseInt(minSecurityLevel));
			await weak(ns, serverName);
		}

		if (ns.getServerMoneyAvailable(serverName) < ns.getServerMaxMoney(serverName) * 0.85) {
			await grow(ns, serverName);
		} else {
			await hack(ns, serverName);
		}
	}
}

/** @param {NS} ns **/
async function grow(ns: NS, target) {

	let currentMoney = ns.getServerMoneyAvailable(target);
	let maxMoney = ns.getServerMaxMoney(target);

	let multiplyer = (maxMoney / currentMoney + 1);

	let hackScript = "/core/growOnce.js";
	await execScript(ns, hackScript, target, ns.growthAnalyze(target, multiplyer));
}

/** @param {NS} ns **/
async function weak(ns: NS, target) {

	let currentMoney = ns.getServerMoneyAvailable(target);
	let maxMoney = ns.getServerMaxMoney(target);

	let multiplyer = (maxMoney / currentMoney + 1);

	let hackScript = "/core/weakOnce.js";
	// o.o5 per thread
	let level = ns.getServerSecurityLevel(target);
	let minLevel = ns.getServerMinSecurityLevel(target);

	let weakPerThread = 0.05;

	level = level - minLevel;

	let threads = level / weakPerThread;
	await execScript(ns, hackScript, target, threads);	
}

/** @param {NS} ns **/
async function hack(ns: NS, target) {

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

	let hackScript = "/core/hackOnce.js";

	await execScript(ns, hackScript, target, ns.hackAnalyzeThreads(target, moneyToHack));
}

async function waitForScriptEnd(ns: NS, scriptName: string, hostName: string, target: string): void {

	while (ns.isRunning(scriptName, hostName, target)) {
		await ns.sleep(2000);
	}
	await ns.sleep(1000);
}

async function execScript(ns: NS, hackScript: string, target: string, threadsNeededCalculated: number) {

	let host = ns.getHostname();

	let scriptRam = ns.getScriptRam(hackScript);

	const threadsAvailable = Math.floor(parseFloat(ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / parseFloat(scriptRam));

	let threadsNeeded = 0;
	if (threadsAvailable < threadsNeededCalculated) {
		threadsNeeded = threadsAvailable;
	} else {
		threadsNeeded = threadsNeededCalculated;
	}	

	let preRunning = ns.isRunning("core/weakOnce.js", host, target);

	if (threadsNeeded > 0) {
		ns.print("EXEC SCRIPT: " + hackScript + " on " + target + " threads needed" + threadsNeededCalculated + " available " + threadsAvailable + " used " + threadsNeeded);

		ns.exec(hackScript, host, threadsNeeded, target);

		if(ns.getHostname().includes("farm")){
			let weakThreads = Math.floor(parseFloat(ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / parseFloat(scriptRam));
			if(!preRunning){
				if(weakThreads > 0){
					ns.exec("core/weakOnce.js", host, weakThreads * 0.90, target);
				}
			}			
		}
		await waitForScriptEnd(ns, hackScript, host, target);
	} else {
		await ns.sleep(3000);
	}


}	