/* lib/terminal/utilities/terminal - Execute the application entry point from the terminal. */

import entry from "./entry.js";
import log from "./log.js";

entry(function terminal_utilities_entryCallback(title:string, text:string[]):void {
    if (title === "") {
        log(text);
    } else {
        log.title(title);
        log(text, true);
    }
});