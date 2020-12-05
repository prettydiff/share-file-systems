
/* lib/terminal/commands/lint - A command driven wrapper for executing external application ESLint. */
import directory from "./directory.js";
import error from "../utilities/error.js";
import humanTime from "../utilities/humanTime.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

// wrapper for ESLint usage
const lint = function terminal_commands_lint(callback:Function):void {
    const lintPath:string = (vars.command === "lint" && process.argv[0] !== undefined)
            ? vars.node.path.resolve(process.argv[0])
            : vars.js,
        complete:string = `${vars.text.green}Lint complete${vars.text.none} for ${vars.text.cyan + vars.text.bold + lintPath + vars.text.none}`;
    if (vars.command === "lint") {
        vars.verbose = true;
        if (vars.testLogFlag === "") {
            log.title(`Linting ${lintPath}`);
        }
        callback = function terminal_commands_lint_callback():void {
            log([complete], true);
        };
    }
    vars.node.child(`eslint ${lintPath}`, {
        cwd: vars.projectPath
    }, function terminal_commands_lint_eslint(err:Error, stdout:string, stderr:string) {
        vars.testLogger("lint", "child", "run ESLint as a child process");
        if (stdout.indexOf("error") > 0) {
            vars.testLogger("lint", "lint fail", "violated an ESLint rule");
            error([stdout, "Lint failure."]);
            return;
        }
        if (err !== null) {
            vars.testLogger("lint", "child error", err.toString());
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
            vars.testLogger("lint", "lint complete", "all tests passed and output will be formatted for terminal or callback");
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