
/* lib/terminal/commands/library/lint - Executes a TypeScript configured form of ESLint from the application's dev dependencies. */

import error from "../../utilities/error.js";
import node from "../../utilities/node.js";
import vars from "../../utilities/vars.js";

// wrapper for ESLint usage
const lint = function terminal_commands_library_lint(lintPath:string, callback:commandCallback):void {
    let fail:boolean;
    const bell:string = (vars.environment.command === "lint")
            ? "\u0007"
            : "",
        complete:string = `${vars.text.green}Lint complete${vars.text.none} for ${vars.text.cyan + vars.text.bold + lintPath + vars.text.none + bell}`,
        title:string = "Lint",
        text:string[] = [];
    node.child_process.exec(`npx eslint ${lintPath} --ext ts`, {
        cwd: vars.path.project
    }, function terminal_commands_lint_eslint(err:Error, stdout:string, stderr:string) {
        if (stdout.indexOf("error") > 0) {
            error([stdout, `Lint failure.${bell}`], null, true);
            return;
        }
        if (err !== null) {
            text.push(`${vars.text.angry}ESLint is corrupt or the request target does not exist.${vars.text.none + bell}`);
            text.push(err.toString());
            text.push(`Install ESLint for TypeScript using the command: ${vars.text.green}npm install${vars.text.none}`);
            text.push("Try checking the configuration in the .eslintrc.json file.");
            text.push("");
            text.push("Skipping code validation...");
            fail = true;
        } else if (stdout === "" || stdout.indexOf("0:0  warning  File ignored because of a matching ignore pattern.") > -1) {
            if (stderr !== null && stderr !== "") {
                error([stderr], null);
                return;
            }
            text.push(complete);
            fail = false;
        }
        callback(title, text, fail);
    });
};

export default lint;