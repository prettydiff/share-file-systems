
/* lib/terminal/utilities/error - A utility for processing and logging errors from the terminal application. */

import { arch, cpus, EOL, freemem, platform, release, totalmem } from "os";

import common from "../../common/common.js";
import humanTime from "./humanTime.js";
import sender from "../server/transmission/sender.js";
import vars from "./vars.js";

// uniform error formatting
const error = function terminal_utilities_error(errText:string[], noStack?:boolean):void {
    // eslint-disable-next-line
    const logger:(input:string|object) => void = console.log,
        bell = function terminal_utilities_error_bell():void {
            humanTime(true);
            if (vars.environment.command === "build" || vars.test.type !== "") {
                logger("\u0007"); // bell sound
            } else {
                logger("");
            }
        },
        errorOut = function terminal_utilities_error_errorOut():void {
            const stack:string|undefined = new Error().stack,
                stackTrace:string[] = (stack === undefined)
                    ? null
                    : stack.replace(/^Error/, "").replace(/\s+at\s/g, "splitMe").replace(/error\.js:\d+:\d+\)\r?\n/, "splitMe").split("splitMe").slice(3);
            if (vars.environment.command === "service") {
                const server:NodeJS.ErrnoException = {
                        message: errText.join("\n"),
                        name: "Terminal Error",
                        stack: stackTrace.join("")
                    },
                    agent:fileAgent = {
                        device: vars.settings.hashDevice,
                        modalAddress: "",
                        share: "",
                        user: vars.settings.hashUser
                    };
                sender.broadcast({
                    data: Object.assign({
                        agentRequest: agent,
                        agentSource: agent
                    }, server),
                    service: "error"
                }, "browser");
            }
            if (noStack !== true && stackTrace !== null) {
                const stackMessage:string = `${vars.text.cyan}Stack trace${vars.text.none + EOL}-----------${EOL}`;
                vars.test.flags.error = true;
                logger(stackMessage);
                logger(stackTrace);
            }
            logger("");
            logger(`${vars.text.angry}Error Message${vars.text.none}`);
            logger("-------------");
            if (errText[0] === "" && errText.length < 2) {
                logger(`${vars.text.yellow}No error message supplied${vars.text.none}`);
            } else {
                errText.forEach(function terminal_utilities_error_errorOut_each(value:string):void {
                    logger(value);
                });
            }
            bell();
        },
        debug = function terminal_utilities_error_debug():void {
            const stack:string|undefined = new Error().stack,
                total:number = totalmem(),
                free:number = freemem();
            vars.test.flags.error = true;
            logger("");
            logger("---");
            logger("");
            logger("");
            logger(`# ${vars.environment.name} - Debug Report`);
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
            if (stack !== undefined) {
                logger("");
                logger(`${vars.text.green}## Stack Trace${vars.text.none}`);
                logger("```");
                logger(stack.replace(/\s*Error\s+/, "    "));
                logger("```");
            }
            logger("");
            logger(`${vars.text.green}## Environment${vars.text.none}`);
            logger(`* OS - **${platform()} ${release()}**`);
            logger(`* Mem - ${common.commas(total)} - ${common.commas(free)} = **${common.commas(total - free)}**`);
            logger(`* CPU - ${arch()} ${cpus().length} cores`);
            logger("");
            logger(`${vars.text.green}## Command Line Instruction${vars.text.none}`);
            logger("```");
            logger(vars.terminal.arguments);
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