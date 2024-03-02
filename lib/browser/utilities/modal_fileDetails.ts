
/* lib/browser/utilities/modal_fileDetails - Modal content configuration for details modal type. */

import browser from "./browser.js";
import file_select_addresses from "./file_select_addresses.js";
import modal from "./modal.js";
import util from "./util.js";

const modal_fileDetails = function browser_utilities_modalFileDetails(event:Event, config?:config_modal):modal {
    if (config === null || config === undefined) {
        const name:string = browser.contextElement.lowName(),
            mouseEvent:MouseEvent = event as MouseEvent,
            element:HTMLElement = (name === "li" || name === "ul")
                ? browser.contextElement
                : browser.contextElement.getAncestor("li", "tag"),
            div:HTMLElement = util.delay(),
            box:modal = element.getAncestor("box", "class"),
            agency:agentId = util.getAgent(box),
            addresses:[string, fileType, string][] = file_select_addresses(element, "details"),
            plural:string = (addresses.length === 1)
                ? ""
                : "s",
            payloadModal:config_modal = {
                agent: agency[0],
                agentIdentity: true,
                agentType: agency[2],
                content: div,
                height: 600,
                inputs: ["close"],
                left: mouseEvent.clientX,
                read_only: agency[1],
                single: true,
                text_value: "",
                title_supplement: `${addresses.length} item${plural}`,
                top: (mouseEvent.clientY - 60 < 0)
                    ? 60
                    : mouseEvent.clientY - 60,
                type: "details",
                width: 500
            },
            modalInstance:modal = modal.content(payloadModal),
            id:string = modalInstance.getAttribute("id"),
            nameContext:string = browser.contextElement.lowName(),
            menu:HTMLElement = document.getElementById("contextMenu"),
            addressField:HTMLInputElement = box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0],
            agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null),
            payloadNetwork:service_fileSystem = {
                action: "fs-details",
                agentRequest: agents[0],
                agentSource: agents[1],
                agentWrite: null,
                depth: 0,
                location: (function browser_utilities_modalFileDetails_addressList():string[] {
                    const output:string[] = [],
                        length:number = addresses.length;
                    let a:number = 0;
                    if (nameContext === "ul") {
                        return [addressField.value];
                    }
                    do {
                        output.push(addresses[a][0]);
                        a = a + 1;
                    } while (a < length);
                    return output;
                }()),
                name: id
            };
        if (browser.loading === true) {
            return;
        }
        browser.ui.modals[id].text_value = JSON.stringify(payloadNetwork.location);
        browser.send(payloadNetwork, "file-system");
        browser.configuration();
        browser.contextElement = null;
        if (menu !== null) {
            menu.parentNode.removeChild(menu);
        }
        return modalInstance;
    }
    let modalInstance:modal = null;
    const agents:[fileAgent, fileAgent, fileAgent] = (function browser_utilities_modalFileDetails_agents():[fileAgent, fileAgent, fileAgent] {
            config.content = util.delay();
            modalInstance = modal.content(config);
            return util.fileAgent(modalInstance, null, config.text_value);
        }()),
        payloadNetwork:service_fileSystem = {
            action: "fs-details",
            agentRequest: agents[0],
            agentSource: agents[1],
            agentWrite: null,
            depth: 0,
            location: JSON.parse(config.text_value) as string[],
            name: config.id
        };
    browser.send(payloadNetwork, "file-system");
    return modalInstance;
};

export default modal_fileDetails;