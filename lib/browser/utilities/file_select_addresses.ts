
/* lib/browser/utilities/file_select_addresses - Gathers all items from a file list in a selected state. */

import browser from "./browser.js";
import util from "./util.js";

const file_select_addresses = function browser_utilities_fileSelectAddresses(element:HTMLElement, type:string):[string, fileType, string][] {
    const output:[string, fileType, string][] = [],
        agent:string = util.getAgent(element)[0],
        parent:HTMLElement = element.parentNode,
        drag:boolean = (parent.getAttribute("id") === "file-list-drag"),
        box:modal = element.getAncestor("box", "class"),
        dataModal:config_modal = browser.ui.modals[box.getAttribute("id")],
        attribute = function browser_utilities_util_attribute(item:HTMLElement):void {
            const p:HTMLElement = item.getElementsByTagName("p")[0],
                classy:string = p.getAttribute("class"),
                path:string = item.dataset.path;
            output.push([path, item.getAttribute("class").replace(" lastType", "") as fileType, agent]);
            if (type === "cut") {
                if (classy !== null && classy.indexOf("selected") > -1) {
                    p.setAttribute("class", "selected cut");
                } else {
                    p.setAttribute("class", "cut");
                }
                dataModal.selection[path] = p.getAttribute("class");
            }
        },
        itemList:HTMLCollectionOf<HTMLElement> = (drag === true)
            ? parent.getElementsByTagName("li")
            : box.getElementsByClassName("fileList")[0].getElementsByTagName("li"),
        len:number = itemList.length;
    let a:number = 0,
        p:HTMLElement = null;
    if (element.lowName() !== "li") {
        element = element.parentNode;
    }
    if (dataModal.selection === undefined) {
        dataModal.selection = {};
    }
    do {
        p = itemList[a].getElementsByTagName("p")[0];
        if (itemList[a].getElementsByTagName("input")[0].checked === true) {
            attribute(itemList[a]);
        } else {
            p.removeAttribute("class");
            if (dataModal.selection[itemList[a].dataset.path] !== undefined) {
                delete dataModal.selection[itemList[a].dataset.path];
            }
        }
        a = a + 1;
    } while (a < len);
    if (output.length > 0) {
        return output;
    }
    // if nothing is selected, act on the one record interacted
    attribute(element);
    return output;
};

export default file_select_addresses;