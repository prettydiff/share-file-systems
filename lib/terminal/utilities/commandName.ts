
/* lib/terminal/utilities/commandName - A library for visually presenting command documentation to the terminal. */
import help from "../commands/help.js";
import vars from "./vars.js";

// determines if the terminal command is a supported feature
const commandName = function terminal_utilities_command():string {
    let comKeys:string[] = Object.keys(vars.commands),
        filtered:string[] = [],
        a:number = 0,
        b:number = 0;
    const arg:string = process.argv[2],
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
    if (testArg > -1) {
        process.argv.splice(testArg, 1);
    }
    if (arg === undefined) {
        help();
        process.exit(1);
        return;
    }
    
    if (arg === "debug") {
        process.argv = process.argv.slice(3);
        return "debug";
    }
    process.argv = process.argv.slice(3);

    // trim empty values
    b = process.argv.length;
    if (b > 0) {
        do {
            process.argv[a] = process.argv[a].replace(/^-+/, "");
            if (process.argv[a] === "verbose") {
                vars.verbose = true;
                process.argv.splice(a, 1);
                b = b - 1;
                a = a - 1;
            } else if (process.argv[a] === "") {
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
        logger(`${vars.text.cyan + vars.command_instruction}commands${vars.text.none}`);
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
        logger(`${boldArg} is not a supported command. ${vars.name} is assuming command ${vars.text.bold + vars.text.cyan + filtered[0] + vars.text.none}.`);
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