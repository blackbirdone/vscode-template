import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {
    
    let serverName = ns.args[0];
    const sleepTime = ns.args[1];
    await ns.sleep(parseInt(sleepTime));
    
	await ns.weaken(serverName);
}