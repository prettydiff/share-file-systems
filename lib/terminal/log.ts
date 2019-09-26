
/*eslint no-console: 0*/
import humanTime from "./humanTime.js";
import vars from "./vars.js";

// verbose metadata printed to the shell about the application
const log = function node_apps_log(output:string[], end?:boolean):void {
    if (vars.verbose === true && (output.length > 1 || output[0] !== "")) {
        console.log("");
    }
    if (output[output.length - 1] === "") {
        output.pop();
    }
    output.forEach(function node_apps_log_each(value:string) {
        console.log(value);
    });
    if (vars.verbose === true && end === true) {
        console.log("");
        console.log(`${vars.version.name} version ${vars.text.angry + vars.version.number + vars.text.none}`);
        console.log(`Dated ${vars.text.cyan + vars.version.date + vars.text.none}`);
        humanTime(true);
    }
};

export default log;