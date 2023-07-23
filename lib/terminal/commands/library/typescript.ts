
/* lib/terminal/commands/library/typescript - Executes TypeScript type checks. */

import error from "../../utilities/error.js";
import log from "../../utilities/log.js";
import node from "../../utilities/node.js";
import vars from "../../utilities/vars.js";

const typescript = function terminal_commands_library_typescript(typePath:string, callback:commandCallback):void {
    const errorOut = function terminal_commands_library_typescript_stat_errorOut(message:string, errorObject:node_childProcess_ExecException|node_error):void {
        error([message], errorObject);
        process.exit(1);
    };
    if (typeof typePath !== "string" || typePath.length < 1) {
        typePath = vars.path.project;
    }
    node.fs.stat(typePath, function terminal_commands_library_typescript_stat(statError:node_error, stat:node_fs_Stats):void {
        if (statError === null) {
            const dir:boolean = stat.isDirectory();
            if (dir === true) {
                const command:string = `npx tsc --pretty --noEmit --project ${vars.path.project}tsconfig.json`,
                    args:node_childProcess_ExecOptions = {
                        cwd: typePath
                    };
                node.child_process.exec(command, args, function terminal_commands_library_typescript_stat_exec(err:node_childProcess_ExecException, stdout:string):void {
                    const control:string = "\u001b[91m";
                    if (stdout !== "") {
                        let compileErrors:string = stdout.slice(stdout.indexOf("Found"));
                        if (stdout.indexOf(` ${control}error${vars.text.none} `) > -1) {
                            errorOut([
                                "TypeScript reported warnings.",
                                stdout
                            ].join(node.os.EOL), null);
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
            errorOut(`Error accessing path: ${typePath}`, statError);
        }
    });
};

export default typescript;