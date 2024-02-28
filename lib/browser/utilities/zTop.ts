
/* lib/browser/utilities/zTop - Stacks modals visually to account for overlap. */

import browser from "./browser.js";

const zTop = function browser_utilities_zTop(event:KeyboardEvent|MouseEvent, elementInput?:HTMLElement):void {
    const element:HTMLElement = (event !== null && elementInput === undefined)
            ? event.target
            : elementInput,
        parent:HTMLElement = element.parentNode,
        grandParent:HTMLElement = parent.parentNode,
        box:modal = element.getAncestor("box", "class");
    if ((parent.getAttribute("class") === "fileList" || grandParent.getAttribute("class") === "fileList") && event.shiftKey === true) {
        event.preventDefault();
    }
    browser.ui.zIndex = browser.ui.zIndex + 1;
    browser.ui.modals[box.getAttribute("id")].zIndex = browser.ui.zIndex;
    box.style.zIndex = browser.ui.zIndex.toString();
};

export default zTop;