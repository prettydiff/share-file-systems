
/* lib/terminal/utilities/log - A log utility for displaying multiple lines of text to the terminal. */
import humanTime from "./humanTime.js";
import vars from "./vars.js";

// verbose metadata printed to the shell about the application
const log = function terminal_log(output:string[], end?:boolean):void {
    // eslint-disable-next-line
    const logger:(input:string) => void = console.log;
    if (vars.verbose === true && (output.length > 1 || output[0] !== "")) {
        logger("");
    }
    if (output[output.length - 1] === "") {
        output.pop();
    }
    output.forEach(function terminal_log_each(value:string) {
        logger(value);
    });
    if (end === true) {
        if (vars.verbose === true || vars.command === "server" || vars.command === "version") {
            logger("");
            logger("________________________________________________");
            logger(`Version ${vars.text.angry + vars.version.number + vars.text.none}`);
            logger(`Updated ${vars.version.date}`);
            logger(`Archive ${vars.text.cyan + vars.version.hash + vars.text.none}`);
        }
        if (vars.verbose === true) {
            humanTime(true);
        } else if (vars.command === "server" || vars.command === "version") {
            logger("________________________________________________");
            logger("");
        }
    }
};

log.title = function terminal_log_title(message:string) {
    log(["", `${vars.text.cyan + vars.text.bold + vars.text.underline + vars.version.name} - ${message + vars.text.none}`, "", ""]);
};

export default log;