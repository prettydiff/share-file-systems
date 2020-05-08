
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
    if (vars.verbose === true && end === true) {
        const version:string = `${vars.version.name} version ${vars.text.angry + vars.version.number + vars.text.none}`,
            length:number = version.replace(/\u001b\[\d+m/g, "").length,
            line:string[] = [];
        let a:number = 0;
        do {
            line.push("_");
            a = a + 1;
        } while (a < length);
        logger("");
        logger(line.join(""));
        logger(`${vars.version.name} version ${vars.text.angry + vars.version.number + vars.text.none}`);
        logger(`Dated ${vars.text.cyan + vars.version.date + vars.text.none}`);
        humanTime(true);
    }
};

log.title = function terminal_log_title(message:string) {
    log(["", `${vars.text.cyan + vars.text.bold + vars.text.underline + message + vars.text.none}`, "", ""]);
};

export default log;