
/* lib/terminal/utilities/lists - A utility for visually presenting lists of data to the terminal's console. */
import error from "./error.js";
import log from "./log.js";
import vars from "./vars.js";
import wrapIt from "./wrapIt.js";

// CLI string output formatting for lists of items
const lists = function terminal_utilities_lists(lists:nodeLists):void {
        // * lists.empty_line - boolean - if each key should be separated by an empty line
        // * lists.heading    - string  - a text heading to precede the list
        // * lists.obj        - object  - an object to traverse
        // * lists.property   - string  - The child property to read from or "each"
        // * lists.total      - number  - To display a count
        // access a directly assigned primitive
        const keys:string[] = Object.keys(lists.obj).sort(),
            output:string[] = [],
            displayKeys = function terminal_utilities_lists_displayKeys(keyList:string[]):void {
                const len:number = keyList.length;
                let a:number = 0,
                    b:number = 0,
                    c:number = 0,
                    lens:number = 0,
                    comm:string = "";
                if (len < 1) {
                    error([`Please run the build: ${vars.text.cyan + vars.command_instruction}build${vars.text.none}`]);
                    return;
                }
                do {
                    if (keyList[a].length > lens) {
                        lens = keyList[a].length;
                    }
                    a = a + 1;
                } while (a < len);
                do {
                    comm = keyList[b];
                    c    = comm.length;
                    if (c < lens) {
                        do {
                            comm = comm + " ";
                            c    = c + 1;
                        } while (c < lens);
                    }
                    // list all items
                    if (lists.property === "each") {
                        // all items keys and their primitive value
                        wrapIt(output, `${vars.text.angry}* ${vars.text.none + vars.text.cyan + comm + vars.text.none}: ${lists.obj[keyList[b]]}`);
                    } else {
                        // a list by key and specified property
                        wrapIt(output, `${vars.text.angry}* ${vars.text.none + vars.text.cyan + comm + vars.text.none}: ${lists.obj[keyList[b]][lists.property]}`);
                    }
                    if (lists.empty_line === true) {
                        output.push("");
                    }
                    b = b + 1;
                } while (b < len);
            };
        output.push("");
        output.push(`${vars.text.underline + vars.text.bold + vars.name} - ${lists.heading + vars.text.none}`);
        output.push("");
        displayKeys(keys);
        if (vars.command === "commands") {
            output.push("");
            output.push("For examples and usage instructions specify a command name, for example:");
            output.push(`${vars.text.green + vars.command_instruction}commands hash${vars.text.none}`);
            output.push("");
            output.push(`To every command example use the '${vars.text.cyan}all${vars.text.none}' argument:`);
            output.push(`${vars.text.green + vars.command_instruction}commands all${vars.text.none}`);
            output.push("");
            output.push(`Commands are tested using the ${vars.text.green}test_simulation${vars.text.none} command.`);
        }
        log(output);
    };

export default lists;