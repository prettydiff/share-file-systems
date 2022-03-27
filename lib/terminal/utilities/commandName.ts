
/* lib/terminal/utilities/commandName - A library for visually presenting command documentation to the terminal. */

import { resolve } from "path";

import vars from "./vars.js";

// determines if the terminal command is a supported feature
const commandName = function terminal_utilities_command(globalName:string):string {

    // no color option
    {
        let index:number = process.argv.length;
        do {
            index = index - 1;
            if ((/((-+)|\$)?no(-|_)?color/).test(process.argv[index].toLowerCase()) === true) {
                const keys:string[] = Object.keys(vars.text);
                let keyLen:number = keys.length;
                do {
                    keyLen = keyLen - 1;
                    vars.text[keys[keyLen]] = "";
                } while (keyLen > 0);
                process.argv.splice(index, 1);
            } else if ((/-*verbose/).test(process.argv[index]) === true) {
                vars.settings.verbose = true;
                process.argv.splice(index, 1);
            }
        } while (index > 0);
    }

    let comKeys:string[] = Object.keys(vars.terminal.commands),
        filtered:string[] = [],
        a:number = 0,
        b:number = 0;
    const arg:string = (process.argv[0] === globalName)
            ? process.argv[1]
            : process.argv[2],
        boldArg:string = vars.text.angry + arg + vars.text.none,
        len:number = (arg === undefined)
            ? 0
            : arg.length + 1,
        commandFilter = function terminal_utilities_command_commandFilter(item:string):boolean {
            if (item.indexOf(arg.slice(0, a)) === 0) {
                return true;
            }
            return false;
        },
        testArg:number = process.argv.indexOf("application_test_log_argument"),
        // eslint-disable-next-line
        logger:(input:string) => void = console.log;
    vars.path.node = process.argv[0];
    if (globalName === "") {
        vars.path.js = resolve(process.argv[1].replace(/application$/, "")) + vars.path.sep;
        vars.path.project = vars.path.js.replace(/js(\\|\/)/, "");
    }
    if (testArg > -1) {
        process.argv.splice(testArg, 1);
    }
    process.argv = (process.argv[0] === globalName)
        ? process.argv.slice(2)
        : process.argv.slice(3);
    if (arg === "insecure") {
        vars.settings.secure = false;
        return "service";
    }
    if (arg === undefined) {
        return "service";
    }
    if (arg === "help") {
        return "commands";
    }

    // trim empty values
    b = process.argv.length;
    if (b > 0) {
        do {
            process.argv[a] = process.argv[a].replace(/^-+/, "");
            if (process.argv[a] === "") {
                process.argv.splice(a, 1);
                b = b - 1;
                a = a - 1;
            }
            a = a + 1;
        } while (a < b);
    }

    // filter available commands against incomplete input
    a = 1;
    do {
        filtered = comKeys.filter(commandFilter);
        a = a + 1;
    } while (filtered.length > 1 && a < len);

    if (filtered.length < 1 || (filtered[0] === "debug" && filtered.length < 2)) {
        logger(`Command ${boldArg} is not a supported command.`);
        logger("");
        logger("Please try:");
        logger(`${vars.text.cyan + vars.terminal.command_instruction}commands${vars.text.none}`);
        logger("");
        process.exit(1);
        return "";
    }
    if (filtered.length > 1 && comKeys.indexOf(arg) < 0) {
        logger(`Command '${boldArg}' is ambiguous as it could refer to any of: [${vars.text.cyan + filtered.join(", ") + vars.text.none}]`);
        process.exit(1);
        return "";
    }
    if (arg !== filtered[0]) {
        logger("");
        logger(`${boldArg} is not a supported command. ${vars.environment.name} is assuming command ${vars.text.bold + vars.text.cyan + filtered[0] + vars.text.none}.`);
        logger("");
    }
    if (filtered[0].indexOf("test") === 0) {
        const index:number = process.argv.indexOf("log");
        if (index > -1) {
            process.argv.splice(index, 1);
        }
    }
    return filtered[0];
};

export default commandName;