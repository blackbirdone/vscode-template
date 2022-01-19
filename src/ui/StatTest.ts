import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
    ns.hackanalyze()

    const doc = eval('doc' + 'um' + 'ent');
    const hook0 = doc.getElementById('overview-extra-hook-0');
    const hook1 = doc.getElementById('overview-extra-hook-1');
    while (true) {
        try {

            const headers = []
            const values = [];
            // Add script income per second
            headers.push("Inc ");
            values.push(ns.nFormat(ns.getScriptIncome()[0], '$0.000a') + '/s');

            headers.push("Inc ");
            values.push(ns.nFormat(ns.getScriptIncome()[0] * 60 * 60, '$0.000a') + '/h');

            headers.push("------");
            values.push("------");

            // Add script exp gain rate per second
            headers.push("Exp ");
            values.push(ns.nFormat(ns.getScriptExpGain(), '0.000a') + '/s');

          
             // Add script exp gain rate per second
             headers.push("Exp ");
             values.push(ns.nFormat(ns.getScriptExpGain() * 60 * 60, '0.000a') + '/h');
            // TODO: Add more neat stuff

            // Now drop it into the placeholder elements
            hook0.innerText = headers.join(" \n");
            hook1.innerText = values.join("\n");
        } catch (err) { // This might come in handy later
            ns.print("ERROR: Update Skipped: " + String(err));
        }
        await ns.sleep(1000);
    }
}

