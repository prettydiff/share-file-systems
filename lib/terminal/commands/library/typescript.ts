
/* lib/terminal/commands/library/typescript - Executes TypeScript type checks. */

import { exec, ExecException, ExecOptions } from "child_process";
import { stat, Stats } from "fs";
import { EOL } from "os";

import error from "../../utilities/error.js";
import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

const typescript = function terminal_commands_library_typescript(typepath:string, callback:commandCallback):void {
    const errorOut = function terminal_commands_library_typescript_stat_errorOut(message:string, errorObject:ExecException|NodeJS.ErrnoException):void {
        const err:string[] = (errorObject === null)
            ? [vars.text.angry + message + vars.text.none]
            : [
                vars.text.angry + message + vars.text.none,
                JSON.stringify(errorObject)
            ];
        error(err);
        process.exit(1);
    };
    if (typeof typepath !== "string" || typepath.length < 1) {
        typepath = vars.path.project;
    }
    stat(typepath, function terminal_commands_library_typescript_stat(statError:NodeJS.ErrnoException, stat:Stats):void {
        if (statError === null) {
            const dir:boolean = stat.isDirectory();
            if (dir === true) {
                const command:string = `npx tsc --pretty --noEmit --project ${vars.path.project}tsconfig.json`,
                    args:ExecOptions = {
                        cwd: typepath
                    };
                exec(command, args, function terminal_commands_library_typescript_stat_exec(err:Error, stdout:string):void {
                    const control:string = "\u001b[91m";
                    if (stdout !== "") {
                        let compileErrors = stdout.slice(stdout.indexOf("Found"));
                        if (stdout.indexOf(` ${control}error${vars.text.none} `) > -1) {
                            errorOut([
                                "TypeScript reported warnings.",
                                stdout
                            ].join(EOL), null);
                            return;
                        }
                        compileErrors = compileErrors.slice(0, compileErrors.indexOf("error") - 1).replace(/\D+/g, "");
                        if (vars.environment.command === "build") {
                            log([stdout]);
                            callback("TypeScript", [compileErrors], false);
                        } else {
                            callback("TypeScript", [stdout], true);
                        }
                    } else {
                        callback("TypeScript", [`${vars.text.green + vars.text.bold}TypeScript type validation completed without warnings.${vars.text.none}`], false);
                    }
                });
            } else {
                errorOut("The TypeScript command is only supporting directory type file system paths.", null);
            }
        } else {
            errorOut(`Error accessing path: ${typepath}`, statError);
        }
    });
};

export default typescript;