
/* lib/terminal/commands/library/update - A command to update the application from git and then run the build. */

import { ChildProcess, exec, spawn } from "child_process";

import error from "../../utilities/error.js";
import humanTime from "../../utilities/humanTime.js";
import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

// run the test suite using the build application
const update = function terminal_commands_library_update():void {
    const childError = function terminal_commands_library_update_childError(err:Error, task:string):boolean {
            if (err !== null) {
                const error:string = err.toString(),
                    output:string[] = [
                        error,
                        "",
                        (task === "build")
                            ? `${vars.text.angry}Build failed.${vars.text.none}`
                            : `${vars.text.angry}git failed.${vars.text.none}`
                    ];
                if (error.indexOf("Please make sure you have the correct access rights") > -1) {
                    output.push("Try checking your internet connection.");
                }
                log(output, true);
                return true;
            }
            return false;
        },
        branch = function terminal_commands_library_update_branch(err:Error, stderr:string):void {
            if (childError(err, "branch") === false) {
                let branch:string;
                if (process.argv[0] === undefined) {
                    branch = stderr.slice(stderr.indexOf("* ") + 2);
                    branch = branch.slice(0, branch.indexOf("\n"));
                    log([`${humanTime(false)}Determining current git branch as ${vars.text.green + branch + vars.text.none}.`]);
                } else {
                    log([`${humanTime(false)}Specified git branch is ${vars.text.green + process.argv[0] + vars.text.none}.`]);
                    branch = process.argv[0];
                }
                exec(`git pull origin ${branch}`, {
                    cwd: vars.path.project
                }, git);
            }
        },
        command = function terminal_commands_library_update_command():void {
            const command:string = (process.argv.length < 1)
                    ? "service"
                    : process.argv.join(" "),
                spawnItem:ChildProcess = spawn(vars.terminal.command_instruction + command, {
                    cwd: vars.path.project,
                    shell: true
                });
            log([`Executing command: ${vars.text.green + command + vars.text.none}`]);
            spawnItem.stdout.on("data", function terminal_commands_library_update_command_stdout(output:Buffer):void {
                log([output.toString()]);
            });
            spawnItem.stderr.on("data", function terminal_commands_library_update_command_stderr(output:Buffer):void {
                error([output.toString()]);
            });
        },
        build = function terminal_commands_library_update_build(err:Error):void {
            vars.settings.verbose = true;
            if (childError(err, "build") === false) {
                log([
                    `${humanTime(false)}Build complete.\u0007`
                ]);
                command();
            }
        },
        git = function terminal_commands_library_update_git(err:Error, stderr:string):void {
            if (childError(err, "git") === false) {
                const status:string = (stderr.indexOf("Already up to date.") > -1)
                        ? `${humanTime(false)}Code already up to date.`
                        : ((/Fast-forward\s/).test(stderr) === true && stderr.indexOf("Updating ") > -1)
                            ? `${humanTime(false)}Code ${vars.text.green + vars.text.bold}updated${vars.text.none} from git.`
                            : "unknown";
                if (status === "unknown") {
                    log([
                        "git pull resulted in a status other than successfully pulled or already up to date.",
                        `${vars.text.angry}Skipping application build.${vars.text.none}`
                    ]);
                    command();
                } else {
                    log([
                        status,
                        `${humanTime(false)}Rebuilding code...`
                    ]);
                    vars.settings.verbose = false;
                    exec(`${vars.terminal.command_instruction}build`, {
                        cwd: vars.path.project
                    }, build);
                }
            }
        };
    // Function execution order
    // 1. branch  - Determines the current git branch
    // 2. git     - Callback to a `git pull`
    // 3. build   - Rebuilds the application
    // 4. command - Executes a child command as instructions from process.argv
    log.title("Update the application");
    vars.settings.verbose = true;
    exec("git branch", {
        cwd: vars.path.project
    }, branch);
};

export default update;