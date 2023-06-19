/* lib/terminal/commands/interface/lint - Shell interface for executing TypeScript lint as configured by this application. */

import error from "../../utilities/error.js";
import lint from "../library/lint.js";
import node from "../../utilities/node.js";
import vars from "../../utilities/vars.js";

const interfaceLint = function terminal_commands_interface_lint(callback:commandCallback):void {
    const lintPath:string = (vars.environment.command === "lint" && process.argv[0] !== undefined)
        ? node.path.resolve(process.argv[0])
        : vars.path.project;
    vars.settings.verbose = true;
    if ((/(\\|\/|\.)js$/).test(lintPath) === true) {
        error(["Lint command not configured to work with JavaScript files."], null);
        return;
    }
    lint(lintPath, callback);
};

export default interfaceLint;