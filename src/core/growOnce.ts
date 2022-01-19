import { NS } from '@ns'

export async function main(ns : NS) : Promise<void> {

    let target = null;
    if(ns.args[0] != null){
        target = ns.args[0];
    }
    await ns.grow(target);
}

// 1.75 GB