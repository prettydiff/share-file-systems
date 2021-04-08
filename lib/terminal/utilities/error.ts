
/* lib/terminal/utilities/error - A utility for processing and logging errors from the terminal application. */

import common from "../../common/common.js";
import humanTime from "./humanTime.js";
import serverVars from "../server/serverVars.js";
import vars from "./vars.js";

// uniform error formatting
const error = function terminal_utilities_error(errText:string[]):void {
    // eslint-disable-next-line
    const logger:(input:string|object) => void = console.log,
        bell = function terminal_utilities_error_bell():void {
            humanTime(true);
            if (vars.command === "build" || serverVars.testType !== "") {
                logger("\u0007"); // bell sound
            } else {
                logger("");
            }
        },
        errorOut = function terminal_utilities_error_errorOut():void {
            if (vars.command === "service") {
                const stackTrace:string[] = new Error().stack.replace(/^Error/, "").replace(/\s+at\s/g, ")splitMe").split("splitMe"),
                    server:error = {
                        stack: stackTrace.slice(1),
                        error: errText.join("\n")
                    };
                serverVars.broadcast("error", JSON.stringify(server));
                logger({
                    stack: stackTrace.slice(1),
                    error: errText
                });
            } else {
                const stack:string = new Error().stack.replace(/error\.js:\d+:\d+\)\r?\n/, "splitMe"),
                    stackMessage:string = `${vars.text.cyan}Stack trace${vars.text.none + vars.node.os.EOL}-----------${vars.node.os.EOL + stack.split("splitMe")[1]}`;
                vars.flags.error = true;
                logger("");
                logger(stackMessage);
                logger("");
                logger(`${vars.text.angry}Error Message${vars.text.none}`);
                logger("------------");
                if (errText[0] === "" && errText.length < 2) {
                    logger(`${vars.text.yellow}No error message supplied${vars.text.none}`);
                } else {
                    errText.forEach(function terminal_utilities_error_errorOut_each(value:string):void {
                        logger(value);
                    });
                }
                logger("");
                bell();
            }
        },
        debug = function terminal_utilities_error_debug():void {
            const stack:string = new Error().stack,
                totalmem:number = vars.node.os.totalmem(),
                freemem:number = vars.node.os.freemem();
            vars.flags.error = true;
            logger("");
            logger("---");
            logger("");
            logger("");
            logger(`# ${vars.name} - Debug Report`);
            logger("");
            logger(`${vars.text.green}## Error Message${vars.text.none}`);
            if (errText[0] === "" && errText.length < 2) {
                logger(`${vars.text.yellow}No error message supplied${vars.text.none}`);
            } else {
                logger("```");
                errText.forEach(function terminal_utilities_error_each(value:string):void {
                    // eslint-disable-next-line
                    logger(value.replace(/\u001b/g, "\\u001b"));
                });
                logger("```");
            }
            logger("");
            logger(`${vars.text.green}## Stack Trace${vars.text.none}`);
            logger("```");
            logger(stack.replace(/\s*Error\s+/, "    "));
            logger("```");
            logger("");
            logger(`${vars.text.green}## Environment${vars.text.none}`);
            logger(`* OS - **${vars.node.os.platform()} ${vars.node.os.release()}**`);
            logger(`* Mem - ${common.commas(totalmem)} - ${common.commas(freemem)} = **${common.commas(totalmem - freemem)}**`);
            logger(`* CPU - ${vars.node.os.arch()} ${vars.node.os.cpus().length} cores`);
            logger("");
            logger(`${vars.text.green}## Command Line Instruction${vars.text.none}`);
            logger("```");
            logger(vars.cli);
            logger("```");
            logger("");
            logger(`${vars.text.green}## Time${vars.text.none}`);
            logger("```");
            logger(humanTime(false));
            logger("```");
            logger("");
            bell();
        };
    if (process.argv.indexOf("spaces_debug") > -1) {
        debug();
    } else {
        errorOut();
    }
};

export default error;