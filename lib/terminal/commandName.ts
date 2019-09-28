
/*eslint no-console: 0*/
import vars from "./vars.js";

// determines if the terminal command is a supported feature
const commandName = function terminal_command():string {
    let comKeys:string[] = Object.keys(vars.commands),
        filtered:string[] = [],
        a:number = 0,
        b:number = 0;
    if (process.argv[2] === undefined) {
        console.log("");
        console.log("Shared spaces requires a command. Try:");
        console.log(`${vars.text.cyan + vars.version.command} help${vars.text.none}`);
        console.log("");
        console.log("To see a list of commands try:");
        console.log(`${vars.text.cyan + vars.version.command} commands${vars.text.none}`);
        console.log("");
        process.exit(1);
        return;
    }
    const arg:string = process.argv[2],
        boldArg:string = vars.text.angry + arg + vars.text.none,
        len:number = arg.length + 1,
        commandFilter = function terminal_command_commandFilter(item:string):boolean {
            if (item.indexOf(arg.slice(0, a)) === 0) {
                return true;
            }
            return false;
        };
    
    if (process.argv[2] === "debug") {
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
        console.log(`Command ${boldArg} is not a supported command.`);
        console.log("");
        console.log("Please try:");
        console.log(`${vars.text.cyan + vars.version.command} commands${vars.text.none}`);
        console.log("");
        process.exit(1);
        return "";
    }
    if (filtered.length > 1 && comKeys.indexOf(arg) < 0) {
        console.log(`Command '${boldArg}' is ambiguous as it could refer to any of: [${vars.text.cyan + filtered.join(", ") + vars.text.none}]`);
        process.exit(1);
        return "";
    }
    if (arg !== filtered[0]) {
        console.log("");
        console.log(`${boldArg} is not a supported command. ${vars.version.name} is assuming command ${vars.text.bold + vars.text.cyan + filtered[0] + vars.text.none}.`);
        console.log("");
    }
    return filtered[0];
};

export default commandName;