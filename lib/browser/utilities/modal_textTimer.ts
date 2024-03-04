
/* lib/browser/utilities/modal_textTimer - A imposes an idle timer on user text areas after which the text is saved as a state artifact. */

import browser from "./browser.js";

const modal_textTimer = function browser_utilities_modalTextTimer(event:KeyboardEvent):void {
    const element:HTMLTextAreaElement = event.target as HTMLTextAreaElement,
        box:modal = element.getAncestor("box", "class"),
        data:config_modal = browser.ui.modals[box.getAttribute("id")];
    if (box.timer !== undefined) {
        window.clearTimeout(box.timer);
    }
    box.timer = window.setTimeout(function browser_utilities_modalTextTimer_delay() {
        window.clearTimeout(box.timer);
        if (data.text_value !== element.value) {
            data.text_value = element.value;
            browser.configuration();
        }
    }, browser.ui.statusTime);
};

export default modal_textTimer;