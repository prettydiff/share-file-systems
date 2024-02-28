
/* lib/browser/utilities/file_address - Ensures all functionality is enforced with the address change of a file navigate modal. */

import browser from "./browser.js";

const file_address = function browser_utilities_fileAddress(event:FocusEvent|KeyboardEvent|MouseEvent, config:config_modal_history):void {
    const modalData:config_modal = browser.ui.modals[config.id],
        modalItem:HTMLElement = document.getElementById(config.id),
        lastHistory:string = (modalData.history.length > 1)
            ? modalData.history[modalData.history.length - 1]
            : "",
        windows:boolean = ((/^\w:/).test(config.address.replace(/\s+/, "")) || config.address === "\\");

    // if at root use the proper directory slash
    if (config.address === "**root**") {
        const fileList:HTMLElement = modalItem.getElementsByClassName("fileList")[0] as HTMLElement,
            listItem:HTMLElement = (fileList === undefined)
                ? undefined
                : fileList.getElementsByTagName("li")[0];
        if (listItem === undefined || listItem.getAttribute("class") === "empty-list") {
            config.address = modalData.text_value;
        } else {
            const file:string = listItem.getElementsByTagName("p")[0].getElementsByTagName("label")[0].innerHTML;
            if (file.charAt(0) === "/") {
                config.address = "/";
            } else {
                config.address = "\\";
            }
        }
        if (config.payload !== null) {
            config.payload.agentSource.modalAddress = config.address;
            if (config.payload.action === "fs-directory" && config.payload.name !== "expand" && config.payload.location[0] === "**root**") {
                config.payload.location[0] = config.address;
            }
        }
    }

    // change the value in the modal settings
    modalData.text_value = config.address;
    if (event === null || event.target.getAttribute("class") !== "reloadDirectory") {
        modalData.search[0] = "";
    }

    // change the value in modal history
    if (config.history === true && ((config.address !== lastHistory && windows === false) || (config.address.toLowerCase() !== lastHistory.toLowerCase() && windows === true))) {
        modalData.history.push(config.address);
    }

    // request new file system data for the new address
    if (config.payload !== null) {
        browser.send(config.payload, "file-system");

        // save state
        browser.configuration();
    }

    // change the value in the html
    modalItem.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value = config.address;
};

export default file_address;