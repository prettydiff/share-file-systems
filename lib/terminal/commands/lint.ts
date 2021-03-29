
/* lib/terminal/commands/lint - A command driven wrapper for executing external application ESLint. */
import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

// wrapper for ESLint usage
const lint = function terminal_commands_lint(callback:Function):void {
    const lintPath:string = (vars.command === "lint" && process.argv[0] !== undefined)
            ? vars.node.path.resolve(process.argv[0])
            : vars.projectPath,
        complete:string = `${vars.text.green}Lint complete${vars.text.none} for ${vars.text.cyan + vars.text.bold + lintPath + vars.text.none}`;
    if (vars.command === "lint") {
        vars.verbose = true;
        callback = function terminal_commands_lint_callback():void {
            log([complete], true);
        };
    }
    vars.node.child(`eslint ${lintPath} --ext ts`, {
        cwd: vars.projectPath
    }, function terminal_commands_lint_eslint(err:Error, stdout:string, stderr:string) {
        if (stdout.indexOf("error") > 0) {
            error([stdout, "Lint failure."]);
            return;
        }
        if (err !== null) {
            log([
                "ESLint is not globally installed or is corrupt.",
                err.toString(),
                `Install ESLint using the command: ${vars.text.green}npm install eslint -g${vars.text.none}`,
                ""
            ]);
            if (callback === undefined) {
                log(["Skipping code validation..."]);
            } else {
                callback("Skipping code validation...");
            }
            return;
        }
        if (stdout === "" || stdout.indexOf("0:0  warning  File ignored because of a matching ignore pattern.") > -1) {
            if (err !== null) {
                error([err.toString()]);
                return;
            }
            if (stderr !== null && stderr !== "") {
                error([stderr]);
                return;
            }
            log([""]);
            if (callback === undefined) {
                log([complete]);
            } else {
                callback(complete);
            }
        }
    });
};

export default lint;