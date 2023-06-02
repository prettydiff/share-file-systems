
/* lib/terminal/commands/interface/typescript - Interface to execute TypeScript type evaluation. */

import { resolve } from "path";

import typescriptLibrary from "../library/typescript.js";
import vars from "../../utilities/vars.js";

const typescript = function terminal_commands_interface_type(callback:commandCallback):void {
    const typePath:string = (vars.environment.command === "typescript" && process.argv[0] !== undefined)
        ? resolve(process.argv[0])
        : vars.path.project;
    vars.settings.verbose = true;
    typescriptLibrary(typePath, callback);
};

export default typescript;