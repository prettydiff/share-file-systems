
/* lib/browser/utilities/modal_textSave - Saves changes of user authored text as a state artifact. */

import browser from "./browser.js";

const modal_textSave = function browser_utilities_modalTextSave(event:Event):void {
    const element:HTMLTextAreaElement = event.target as HTMLTextAreaElement,
        box:modal = element.getAncestor("box", "class"),
        data:config_modal = browser.ui.modals[box.getAttribute("id")];
    if (box.timer !== undefined) {
        window.clearTimeout(box.timer);
    }
    data.text_value = element.value;
    browser.configuration();
};

export default modal_textSave;