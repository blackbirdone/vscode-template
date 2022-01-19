import { NS } from '@ns'

let hackTarget = null;

export async function main(ns: NS): Promise<void> {
    const fileName = "hack.js";
    const redeploy = false;

    let target = ns.args[0];
    hackTarget = ns.args[1];
    const list = ["home"];

    if (target == null) {
        target = ns.getHostname();
        list.push(target);
    }

    await processServer(ns, target, list, redeploy, fileName);

    //const preList = [
    //    "the-hub", "johnson-ortho", "summit-uni", "comptek", "millenium-fitness", "netlink", "alpha-ent", "rho-construction", "lexo-corp", "aevum-police",
     //   "galactic-cyber", "applied-energetics", "defcomm", "taiyang-digital", "infocomm", "zb-institute", "omnia",
     //   "icarus", "aerocorp", "unitalife", "zb-def", "stormtech", "univ-energy", "nova-med", "deltaone", "zeus-med", "4sigma", "nwo", "clarkinc", "kuai-gong", "b-and-a", "blade", "megacorp", "ecorp"];
        const preList = ["joesguns", "phantasy", "silver-helix", "crush-fitness", "omega-net", "rothman-uni",
        "the-hub", "johnson-ortho", "summit-uni", "comptek", "millenium-fitness", "netlink", "alpha-ent", "rho-construction", "lexo-corp", "aevum-police",
        "galactic-cyber", "applied-energetics", "defcomm", "taiyang-digital", "infocomm", "zb-institute", "omnia",
        "icarus", "aerocorp", "unitalife", "zb-def", "stormtech", "univ-energy", "nova-med", "deltaone", "zeus-med", "4sigma", "nwo", "clarkinc", "kuai-gong", "b-and-a", "blade", "megacorp", "ecorp"];




    let targetList = [];
    for (const index in preList) {
        const targetTmp = preList[index];

        if (parseInt(ns.getHackingLevel()) > parseInt(ns.getServerRequiredHackingLevel(targetTmp))) {
            targetList.push(targetTmp);
        }
    }

    let servers = ns.getPurchasedServers();
    if (servers.length === 25) {
        targetList = targetList.reverse();
        servers = servers.reverse();
    }



    for (const serverIndex in servers) {
        const targetTmp = targetList.shift();
        const server = servers[serverIndex];

        if (targetTmp == null) {
            continue;
        }

        if (parseInt(ns.getHackingLevel()) < parseInt(ns.getServerRequiredHackingLevel(targetTmp))) {
            continue;
        }

        if (!ns.hasRootAccess(targetTmp)) {
            continue;
        }




        const processes = ns.ps(server);
        let scriptRunning = false;
        for (const process of processes) {
            if (process.filename === "hack.js") {
                scriptRunning = true;
            }
        }

        if (ns.args[2] != null) {
            scriptRunning = false;
        }


        if (scriptRunning) {
            continue;
        }

        await ns.scp("hack.js", "home", server);
        await ns.sleep(200);



        // wieoft können wir das script ausführen?
        // MEMSIZE vom server vs fileMEsize
        const serverRam = ns.getServerMaxRam(server);

        // wie groß ist der memory speicher des files
        const scriptRam = ns.getScriptRam("hack.js"); // returns: 2.75


        const threads = Math.floor(parseFloat(serverRam) / parseFloat(scriptRam));



        if (threads <= 0) {
            continue;
        }


        ns.tprint("hack server from farm : " + targetTmp);

        ns.tprint("HOST:[" + server + "] " + "ScriptRam : " + scriptRam + " ServerRam " + serverRam + " THREADS: " + threads);

        ns.killall(server);
        // run hack.js -t 6
        if (targetTmp != null) {
            ns.exec("hack.js", server, 1, targetTmp, "ad");
        } else {
            ns.exec("hack.js", server, 1);
        }
    }
}

/** @param {NS} ns **/
export async function processServer(ns, target, serverDone, redeploy, fileName) {



    const scanList = ns.scan(target);

    for (const index in scanList) {
        const hostName = scanList[index];

        if (serverDone.includes(hostName)) {
            continue;
        }

        await hackServer(ns, hostName, redeploy, fileName);

        serverDone.push(hostName);
        await processServer(ns, hostName, serverDone, redeploy, fileName);
    }
}

/** @param {NS} ns **/
export async function hackServer(ns, target, redeploy, fileName) {

    // haben wir schon root access?

    if (ns.hasRootAccess(target)) {
        await deployScript(ns, target, fileName, redeploy);
        return;
    }

    if (parseInt(ns.getHackingLevel()) < parseInt(ns.getServerRequiredHackingLevel(target))) {
        return;
    }

    ns.tprint("ProcessServer: [" + target + "]" + "[ hacking ...]");

    let openPorts = 0;
    //SSH port: Closed			await bruteSSLServer(ns, target);

    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.tprint("ProcessServer: [" + target + "]" + "[ hacking ... BruteSSH]");
        ns.brutessh(target);

        openPorts++;
    }

    //FTP port: Closed
    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.tprint("ProcessServer: [" + target + "]" + "[ hacking ... FTPCrack]");
        ns.ftpcrack(target);

        openPorts++;
    }

    //FTP port: Closed
    if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.tprint("ProcessServer: [" + target + "]" + "[ hacking ... HTTPWorm]");
        ns.httpworm(target);

        openPorts++;
    }


    //FTP port: Closed
    if (ns.fileExists("RelaySMTP.exe", "home")) {
        ns.tprint("ProcessServer: [" + target + "]" + "[ hacking ... RelaySMTP]");
        ns.relaysmtp(target);

        openPorts++;
    }

    //FTP port: Closed
    if (ns.fileExists("SQLInject.exe", "home")) {
        ns.tprint("ProcessServer: [" + target + "]" + "[ hacking ... SQLInject]");
        ns.sqlinject(target);

        openPorts++;
    }



    //SMTP port: Closed

    //HTTP port: Closed

    //SQL port: Closed	

    await nukeServer(ns, target, openPorts);


    //backdoor gets later 
    //await ns.installBackdoor();
    await deployScript(ns, target, fileName, redeploy);
}

/** @param {NS} ns **/
export async function deployScript(ns, target, fileName, redeploy) {

    await uploadScript(ns, target, fileName);
}

/** @param {NS} ns **/
export async function uploadScript(ns : NS, target, fileName, redeploy) {

    const scpFinished = await ns.scp(fileName, "home", target);
    await ns.scp("/core/hackOnce.js", "home", target);
    await ns.scp("/core/weakOnce.js", "home", target);
    await ns.scp("/core/growOnce.js", "home", target);

    if (scpFinished) {

        // wieoft können wir das script ausführen?
        // MEMSIZE vom server vs fileMEsize
        const serverRam = ns.getServerMaxRam(target);

        // wie groß ist der memory speicher des files
        const scriptRam = ns.getScriptRam(fileName); // returns: 2.75


        const threads = Math.floor(parseFloat(serverRam) / parseFloat(scriptRam));



        if (threads <= 0) {
            return;
        }

        if (ns.args[1] === "self") {
            hackTarget = target;
        }

        const processes = ns.ps(target);
        let scriptRunning = false;
        for (const process of processes) {
            if (process.filename == fileName) {
                scriptRunning = true;
            }
        }
        if (!scriptRunning || scriptRunning && redeploy) {
            ns.tprint("HOST:[" + target + "] " + "ScriptRam : " + scriptRam + " ServerRam " + serverRam + " THREADS: " + threads);
            // kille ein bestehnedes script mit dme namen
            if (target !== "home") {
                ns.killall(target);
            }
            if (target.includes("farm")) {
                return;
            }
            // run hack.js -t 6
            if (hackTarget != null) {
                ns.exec(fileName, target, 1, hackTarget, "ad");
            } else {
                ns.exec(fileName, target, 1);
            }
        }
    }
}

/** @param {NS} ns **/
export async function nukeServer(ns, target, openPorts) {

    if (openPorts >= ns.getServerNumPortsRequired(target)) {
        ns.tprint("ProcessServer: [" + target + "]" + "[ hacking ... NUKE]");
        ns.nuke(target);
    } else {
        ns.tprint("ProcessServer: [" + target + "]" + "[ hacking ... server nuke not possible]");
    }
}