
/* lib/terminal/utilities/log - A log utility for displaying multiple lines of text to the terminal. */
import humanTime from "./humanTime.js";
import vars from "./vars.js";
import serverVars from "../server/serverVars.js";

// verbose metadata printed to the shell about the application
const log = function terminal_utilities_log(output:string[], end?:boolean):void {
    // eslint-disable-next-line
    const logger:(input:string) => void = console.log;
    if (vars.verbose === true && (output.length > 1 || output[0] !== "")) {
        logger("");
    }
    if (output[output.length - 1] === "") {
        output.pop();
    }
    output.forEach(function terminal_utilities_log_each(value:string) {
        logger(value);
    });
    if (end === true) {
        if (vars.verbose === true || vars.command === "service" || vars.command === "version") {
            logger("");
            logger("________________________________________________");
            logger(`Version ${vars.text.angry + vars.version.number + vars.text.none}`);
            logger(`Updated ${vars.version.date}`);
            logger(`git Log ${vars.text.cyan + vars.text.bold + vars.version.hash + vars.text.none}`);
            logger("\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e\u203e");
        }
        if (vars.verbose === true && vars.command !== "service" && vars.command !== "version") {
            humanTime(true);
        }
    }
};

log.title = function terminal_utilities_log_title(message:string, certificate?:boolean):void {
    const formatted:string = `${vars.text.cyan + vars.text.bold + vars.text.underline + vars.version.name} - ${message + vars.text.none}`;
    if (certificate === true && serverVars.secure === true) {
        log([
            "",
            formatted,
            "These tests require a trusted localhost certificate.",
            `If a certificate is not locally trusted run the ${vars.text.green}certificate${vars.text.none} command for more guidance:`,
            `${vars.text.cyan + vars.version.command} certificate${vars.text.none}`,
            "",
            ""
        ]);
        return;
    }
    log(["", formatted, "", ""]);
};

export default log;
