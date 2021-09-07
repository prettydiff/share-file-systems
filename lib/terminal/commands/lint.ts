
/* lib/terminal/commands/lint - A command driven wrapper for executing external application ESLint. */

import { exec } from "child_process";
import { resolve } from "path";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

// wrapper for ESLint usage
const lint = function terminal_commands_lint(callback:(complete:string, failCount:number) => void):void {
    const lintPath:string = (vars.command === "lint" && process.argv[0] !== undefined)
            ? resolve(process.argv[0])
            : vars.projectPath,
        complete:string = `${vars.text.green}Lint complete${vars.text.none} for ${vars.text.cyan + vars.text.bold + lintPath + vars.text.none}`;
    let errorFlag:boolean = false;
    if (vars.command === "lint") {
        vars.verbose = true;
        callback = function terminal_commands_lint_callback():void {
            if (errorFlag === true) {
                log([], true);
            } else {
                log([complete], true);
            }
        };
    }
    exec(`eslint ${lintPath} --ext ts`, {
        cwd: vars.projectPath
    }, function terminal_commands_lint_eslint(err:Error, stdout:string, stderr:string) {
        if (stdout.indexOf("error") > 0) {
            error([stdout, "Lint failure."]);
            return;
        }
        if (err !== null) {
            errorFlag = true;
            log([
                `${vars.text.angry}ESLint is not globally installed or is corrupt.${vars.text.none}`,
                err.toString(),
                `Install ESLint for TypeScript using the command: ${vars.text.green}npm install --save-dev${vars.text.none}`,
                "Try checking the configuration in the .eslintrc.json file.",
                ""
            ]);
            if (callback === undefined) {
                log(["Skipping code validation..."]);
            } else {
                callback("Skipping code validation...", 0);
            }
            return;
        }
        if (stdout === "" || stdout.indexOf("0:0  warning  File ignored because of a matching ignore pattern.") > -1) {
            if (stderr !== null && stderr !== "") {
                error([stderr]);
                return;
            }
            log([""]);
            if (callback === undefined) {
                log([complete]);
            } else {
                callback(complete, 0);
            }
        }
    });
};

export default lint;