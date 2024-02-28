
/* lib/browser/utilities/file_directory - Event handler for navigating directories in a file navigate modal. */

import file_address from "./file_address.js";
import util from "./util.js";

const file_directory = function browser_utilities_fileDirectory(event:KeyboardEvent|MouseEvent):void {
    const element:HTMLInputElement = event.target as HTMLInputElement,
        li:HTMLElement = (element.lowName() === "li")
            ? element
            : element.getAncestor("li", "tag"),
        body:HTMLElement = li.getAncestor("body", "class"),
        box:modal = body.parentNode.parentNode,
        path:string = li.dataset.path,
        id:string = box.getAttribute("id"),
        agents:[fileAgent, fileAgent, fileAgent] = util.fileAgent(box, null, path),
        payload:service_fileSystem = {
            action: "fs-directory",
            agentRequest: agents[0],
            agentSource: agents[1],
            agentWrite: null,
            depth: 2,
            location: [path],
            name: ""
        };
    event.preventDefault();
    file_address(event, {
        address: path,
        id: id,
        history: true,
        payload: payload
    });
};

export default file_directory;