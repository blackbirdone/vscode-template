import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {

    let target = null;
    if(ns.args[0] != null){
        target = ns.args[0];
    }
    await ns.hack(target);
}

// 1.7 GB