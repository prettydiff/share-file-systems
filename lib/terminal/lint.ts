
import directory from "./directory.js";
import error from "./error.js";
import humanTime from "./humanTime.js";
import log from "./log.js";
import vars from "./vars.js";

// wrapper for ESLint usage
const library = {
        directory: directory,
        error: error,
        humanTime: humanTime,
        log: log
    },
    lint = function terminal_lint(callback:Function):void {
        vars.node.child(`eslint`, function terminal_lint_eslintCheck(lint_err:Error) {
            const lintPath:string = (vars.command === "lint" && process.argv[0] !== undefined)
                ? vars.node.path.resolve(process.argv[0])
                : vars.js;
            if (lint_err !== null) {
                library.log([
                    "ESLint is not globally installed or is corrupt.",
                    lint_err.toString(),
                    `Install ESLint using the command: ${vars.text.green}npm install eslint -g${vars.text.none}`,
                    ""
                ]);
                if (callback === undefined) {
                    library.log(["Skipping code validation..."]);
                } else {
                    callback("Skipping code validation...");
                }
                return;
            }
            if (vars.command === "lint") {
                vars.verbose = true;
                library.log.title(`Linting ${lintPath}`);
                callback = function terminal_lint_callback():void {
                    library.log([`Lint complete for ${lintPath}`], true);
                };
            }
            vars.node.child(`eslint ${lintPath}`, {
                cwd: vars.projectPath
            }, function terminal_lint_eslint(err:Error, stdout:string, stderr:string) {
                if (stdout === "" || stdout.indexOf("0:0  warning  File ignored because of a matching ignore pattern.") > -1) {
                    if (err !== null) {
                        library.error([err.toString()]);
                        return;
                    }
                    if (stderr !== null && stderr !== "") {
                        library.error([stderr]);
                        return;
                    }
                    library.log([""]);
                    if (callback === undefined) {
                        library.log([`${vars.text.green}Lint complete for ${vars.text.cyan + vars.text.bold + lintPath + vars.text.none}`]);
                    } else {
                        callback(`${vars.text.green}Lint complete for ${vars.text.cyan + vars.text.bold + lintPath + vars.text.none}`);
                    }
                } else {
                    library.error([stdout, "Lint failure."]);
                    return;
                }
            });
        });
    };

export default lint;