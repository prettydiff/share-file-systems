
/* lib/browser/utilities/context_share - File system share function from the context menu. */

import browser from "./browser.js";
import file_select_addresses from "./file_select_addresses.js";
import file_select_none from "./file_select_none";

const context_share = function browser_content_context_share():void {
    const element:HTMLElement = browser.contextElement,
        addresses:[string, fileType, string][] = file_select_addresses(element, "share"),
        deviceData:agentShares = browser.agents.device[addresses[0][2]].shares,
        shares:string[] = Object.keys(deviceData),
        shareLength:number = shares.length,
        addressesLength:number = addresses.length,
        menu:HTMLElement = document.getElementById("contextMenu");
    let a:number = 0,
        b:number = 0;
    browser.contextElement = null;
    // check to see if this share already exists
    if (shareLength > 0) {
        do {
            b = 0;
            do {
                if (addresses[a][0] === deviceData[shares[b]].name && addresses[a][1] === deviceData[shares[b]].type) {
                    break;
                }
                b = b + 1;
            } while (b < shareLength);
            if (b === shareLength) {
                browser.send({
                    device: addresses[a][2],
                    hash: "",
                    share: addresses[a][0],
                    type: addresses[a][1]
                }, "hash-share");
            }
            a = a + 1;
        } while (a < addressesLength);
    } else {
        do {
            browser.send({
                device: addresses[a][2],
                hash: "",
                share: addresses[a][0],
                type: addresses[a][1]
            }, "hash-share");
            a = a + 1;
        } while (a < addressesLength);
    }
    file_select_none(element);
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

export default context_share;