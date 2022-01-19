import { NS } from '@ns'

export async function main(ns : NS) {
    const hackScript = "hack.js";
    const weakScript = "weak.js";
    const growScript = "grow.js";
    const serverInfos = new ServerInfos();
    let serverList = serverInfos.getServerList(ns);

    const targetList = [];
    const hackInProgress = [];
    const buyTime = (10 * 1000);
    const buyStart = 1;

    let oneStart = true;
    const  maxServer = 6;
    while (true) {

        serverList = serverInfos.getServerList(ns);
        serverList = serverList.sort((a,b) => a.hackingLevel < b.hackingLevel);


        ns.exec("deploy.js", "home", 1, "home", "self");
        await ns.sleep(5 * 1000);

        const newServer = [];
        for (const index in serverList) {
            const server = serverList[index].name;
            if (targetList.includes(server)) {
                continue;
            }
            if (parseInt(ns.getHackingLevel()) > parseInt(ns.getServerRequiredHackingLevel(server))) {
                if (ns.hasRootAccess(server) && ns.getServerMaxMoney(server) > 0) {
                    if(newServer.length < maxServer){
                        newServer.push(server);
                    }
                   
                }
            }
        }      

        for (const index in newServer) {
            const server = newServer[index];
            if(targetList.length > maxServer){
                continue;
            }
            targetList.push(server);
            const freeRam = ns.getServerMaxRam("home") - ns.getServerUsedRam("home");
            const scriptRam = ns.getScriptRam("hack.js");

            // 1000 per server
            const threads = 1;

            if (freeRam > (scriptRam * threads)) {
                ns.exec("hack.js", "home", threads, server);
            }
        }

        const ram = 1048576;
        if (ns.getPurchasedServers().length < 25 && ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram) * 1.2) {
            const destination = ns.purchaseServer("farm-" + ram + "-GB", ram);

            ns.tprint("Server gekauft " + destination + " for " + ns.getPurchasedServerCost(ram));
        }

        let sleepTimer = 10
        if(ns.getPurchasedServers().length  == 25){
            sleepTimer = 55;
            if(oneStart){
                oneStart = false;
                ns.exec("deploy.js", "home", 1, "home", "self", "forceRestart");
            }
        }

        await ns.sleep(sleepTimer * 1000);
    }
}
class ServerInfos {
    constructor() {
    }
    /** @param {NS} ns **/
    getServerList(ns) {
        const workList = ["home"];
        const serverList = [];
        this._buildBotNetMap(ns, "home", workList, serverList);
        return serverList;
    }
    /** @param {NS} ns **/
    getOwnServerList(ns) {
        return this._buildOwnServerList(ns);
    }
    /** @param {NS} ns **/
    _buildOwnServerList(ns) {
        const serverInfoList = [];
        const scanList = ns.getPurchasedServers();

        for (const index in scanList) {
            const hostName = scanList[index];
            const serverInfo = new ServerInfo();
            serverInfo.name = hostName;
            serverInfo.hackTime = Math.floor(ns.getHackTime(hostName));
            serverInfo.weakenTime = Math.floor(ns.getWeakenTime(hostName));
            serverInfo.growTime = Math.floor(ns.getGrowTime(hostName));
            serverInfo.maxMoney = Math.floor(ns.getServerMaxMoney(hostName));
            serverInfo.currentMoney = Math.floor(ns.getServerMoneyAvailable(hostName));
            serverInfo.securityLevel = Math.floor(ns.getServerSecurityLevel(hostName));
            serverInfo.minSecurityLevel = Math.floor(ns.getServerMinSecurityLevel(hostName));
            serverInfo.hackingLevel = Math.floor(ns.getServerRequiredHackingLevel(hostName));
            serverInfo.ram = ns.getServerMaxRam(hostName);
            serverInfoList.push(serverInfo);
        }
        return serverInfoList;
    }
    _buildBotNetMap(ns, target, serverDone, serverInfoList) {
        const scanList = ns.scan(target);
        for (const index in scanList) {
            const hostName = scanList[index];
            if (serverDone.includes(hostName)) {
                continue;
            }
            if (parseInt(ns.getHackingLevel()) <= parseInt(ns.getServerRequiredHackingLevel(hostName))) {
                continue;
            }
            serverDone.push(hostName);
            // hackTime;		weakenTime;	growTime;	maxMoney;	currentMoney;	securityLevel;	minSecurityLevel;
            const serverInfo = new ServerInfo();
            serverInfo.name = hostName;
            serverInfo.hackTime = Math.floor(ns.getHackTime(hostName));
            serverInfo.weakenTime = Math.floor(ns.getWeakenTime(hostName));
            serverInfo.growTime = Math.floor(ns.getGrowTime(hostName));
            serverInfo.maxMoney = Math.floor(ns.getServerMaxMoney(hostName));
            serverInfo.currentMoney = Math.floor(ns.getServerMoneyAvailable(hostName));
            serverInfo.securityLevel = Math.floor(ns.getServerSecurityLevel(hostName));
            serverInfo.minSecurityLevel = Math.floor(ns.getServerMinSecurityLevel(hostName));
            serverInfo.ram = ns.getServerMaxRam(hostName);
            serverInfoList.push(serverInfo);
            this._buildBotNetMap(ns, hostName, serverDone, serverInfoList);
        }
    }
}
class ServerInfo {
    name;
    hackTime;
    weakenTime;
    growTime;
    maxMoney;
    currentMoney;
    securityLevel;
    minSecurityLevel;
    ram;
    hackingLevel;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTmV3R2FtZS5qcyIsInNvdXJjZVJvb3QiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAvc291cmNlcy8iLCJzb3VyY2VzIjpbIk5ld0dhbWUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxDQUFDLEtBQUssVUFBVSxJQUFJLENBQUMsRUFBTTtJQUU3QixJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUM7SUFDM0IsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBQzNCLElBQUksVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUUzQixJQUFJLFdBQVcsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO0lBQ3BDLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7SUFHL0MsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUV4QixPQUFPLElBQUksRUFBRTtRQUNULFVBQVUsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRTNDLElBQUksU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNuQixLQUFLLElBQUksS0FBSyxJQUFJLFVBQVUsRUFBRTtZQUMxQixJQUFJLE1BQU0sR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFL0IsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUM3QixTQUFTO2FBQ1o7WUFFRCxJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsRUFBRSxDQUFDLDZCQUE2QixDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7Z0JBQ3JGLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDMUI7U0FDSjtRQUVELEtBQUssSUFBSSxLQUFLLElBQUksU0FBUyxFQUFFO1lBQ3pCLElBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUVqQyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztTQVExRTtLQUNKO0FBR0wsQ0FBQztBQUdELE1BQU0sV0FBVztJQUViO0lBRUEsQ0FBQztJQUVELHNCQUFzQjtJQUN0QixhQUFhLENBQUMsRUFBRTtRQUVaLElBQUksUUFBUSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDeEIsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBRXBCLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFdkQsT0FBTyxVQUFVLENBQUM7SUFDdEIsQ0FBQztJQUVELHNCQUFzQjtJQUN0QixnQkFBZ0IsQ0FBQyxFQUFFO1FBRWYsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFeEMsQ0FBQztJQUVELHNCQUFzQjtJQUN0QixtQkFBbUIsQ0FBQyxFQUFFO1FBRWxCLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUV4QyxJQUFJLEVBQUUsRUFBQyxXQUFXLENBQUE7UUFBQSxDQUFDLENBQUMsQ0FBQTtRQUVwQixLQUFLLElBQUksS0FBSyxJQUFJLFFBQVEsRUFBRTtZQUN4QixJQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFL0IsSUFBSSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUNsQyxVQUFVLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztZQUMzQixVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzNELFVBQVUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDL0QsVUFBVSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMzRCxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDakUsVUFBVSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzNFLFVBQVUsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMzRSxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNqRixVQUFVLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFOUMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUVuQztRQUVELE9BQU8sY0FBYyxDQUFDO0lBQzFCLENBQUM7SUFFRCxlQUFlLENBQUMsRUFBRSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYztRQUVsRCxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRS9CLEtBQUssSUFBSSxLQUFLLElBQUksUUFBUSxFQUFFO1lBQ3hCLElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUUvQixJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQy9CLFNBQVM7YUFDWjtZQUVELElBQUksUUFBUSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsNkJBQTZCLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtnQkFDeEYsU0FBUzthQUNaO1lBQ0QsVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUUxQiw0RkFBNEY7WUFFNUYsSUFBSSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUNsQyxVQUFVLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztZQUMzQixVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzNELFVBQVUsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDL0QsVUFBVSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMzRCxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7WUFDakUsVUFBVSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzNFLFVBQVUsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMzRSxVQUFVLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUNqRixVQUFVLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7WUFHOUMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUVoQyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLGNBQWMsQ0FBQyxDQUFDO1NBQ2xFO0lBQ0wsQ0FBQztDQUVKO0FBRUQsTUFBTSxVQUFVO0lBQ1osSUFBSSxDQUFDO0lBQ0wsUUFBUSxDQUFDO0lBQ1QsVUFBVSxDQUFDO0lBQ1gsUUFBUSxDQUFDO0lBQ1QsUUFBUSxDQUFDO0lBQ1QsWUFBWSxDQUFDO0lBQ2IsYUFBYSxDQUFDO0lBQ2QsZ0JBQWdCLENBQUM7SUFDakIsR0FBRyxDQUFDO0NBQ1AifQ==