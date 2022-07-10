/* lib/terminal/commands/interface/lint - Shell interface for executing TypeScript lint as configured by this application. */

import { resolve } from "path";

import error from "../../utilities/error.js";
import lint from "../library/lint.js";
import vars from "../../utilities/vars.js";

const interfaceLint = function terminal_commands_interface_lint(callback:commandCallback):void {
    const lintPath:string = (vars.environment.command === "lint" && process.argv[0] !== undefined)
        ? resolve(process.argv[0])
        : vars.path.project;
    vars.settings.verbose = true;
    if ((/(\\|\/|\.)js$/).test(lintPath) === true) {
        error(["Lint command not configured to work with JavaScript files."]);
        return;
    }
    lint(lintPath, callback);
};

export default interfaceLint;