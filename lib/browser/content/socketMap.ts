
/* lib/browser/content/socketMap - Updates socket map content. */

import browser from "../utilities/browser.js";

const socketMap = function browser_content_socketMap(socketData:socketData):void {
    const list:socketMap = socketData.data as socketMap,
        keys:string[] = Object.keys(list),
        len:number = keys.length,
        body:HTMLElement = document.getElementById("socketMap-modal").getElementsByClassName("body")[0] as HTMLElement,
        p:HTMLElement = document.createElement("p");
    body.removeChild(body.firstChild);
    if (len > 0) {
        const table:HTMLElement = document.createElement("table"),
            cell = function browser_content_socketMap_cell(text:string, tagName:"td"|"th", parent:HTMLElement):void {
                const tag:HTMLElement = document.createElement(tagName);
                if (bodySection === true && tagName === "th") {
                    const span:HTMLElement = document.createElement("span"),
                        name:string = (browser.agents.device[text] === undefined)
                            ? ""
                            : browser.agents.device[text].name;
                    span.appendText(name);
                    tag.appendChild(span);
                    tag.appendText(` - ${text}`);
                    tag.setAttribute("colspan", "7");
                } else {
                    tag.appendText(text);
                }
                parent.appendChild(tag);
            };
        let section:HTMLElement = document.createElement("thead"),
            tr:HTMLElement = document.createElement("tr"),
            indexDevice:number = 0,
            indexSocket:number = 0,
            device:socketMapItem[] = null,
            deviceLen:number = 0,
            bodySection:boolean = false,
            type:agentType = null;
        cell("Type", "th", tr);
        cell("Status", "th", tr);
        cell("Local Address", "th", tr);
        cell("Local Port", "th", tr);
        cell("Remote Address", "th", tr);
        cell("Remote Port", "th", tr);
        cell("Name", "th", tr);
        section.appendChild(tr);
        table.appendChild(section);
        section = document.createElement("tbody");
        bodySection = true;
        do {
            device = list[keys[indexDevice]];
            deviceLen = device.length;
            indexSocket = 0;
            if (deviceLen > 0) {
                tr = document.createElement("tr");
                cell(keys[indexDevice], "th", tr);
                section.appendChild(tr);
                do {
                    // agent deletion can result in a race condition to report the updated socket list containing deleted agent data
                    if (
                        (device[indexSocket].type !== "device" && device[indexSocket].type !== "user") ||
                        ((device[indexSocket].type === "device" || device[indexSocket].type === "user") && browser.agents[type] !== undefined && browser.agents[type][device[indexSocket].name] !== undefined)
                    ) {
                        tr = document.createElement("tr");
                        cell(device[indexSocket].type, "td", tr);
                        cell(device[indexSocket].status, "td", tr);
                        if (device[indexSocket].status === "open") {
                            cell(device[indexSocket].localAddress, "td", tr);
                            cell(device[indexSocket].localPort.toString(), "td", tr);
                            cell(device[indexSocket].remoteAddress, "td", tr);
                            cell(device[indexSocket].remotePort.toString(), "td", tr);
                        } else {
                            cell("", "td", tr);
                            cell("", "td", tr);
                            cell("", "td", tr);
                            cell("", "td", tr);
                        }
                        if (device[indexSocket].type === "device" || device[indexSocket].type === "user") {
                            type = device[indexSocket].type as agentType;
                            cell(`${browser.agents[type][device[indexSocket].name].name} - ${device[indexSocket].name}`, "td", tr);
                        } else {
                            cell(device[indexSocket].name, "td", tr);
                        }
                        if (device[indexSocket].status === "end" || device[indexSocket].status === "closed") {
                            tr.setAttribute("class", "closed");
                        } else if (device[indexSocket].status === "pending") {
                            tr.setAttribute("class", "pending");
                        }
                        section.appendChild(tr);
                    }
                    indexSocket = indexSocket + 1;
                } while (indexSocket < deviceLen);
            }
            indexDevice = indexDevice + 1;
        } while (indexDevice < len);
        table.setAttribute("class", "socket-map");
        table.appendChild(section);
        body.appendChild(table);
        return;
    }
    p.setAttribute("class", "socket-map");
    p.appendText("No open sockets.");
    body.appendChild(p);
};

export default socketMap;