
import log from "./log.js";
import vars from "./vars.js";

// help text
const help = function node_apps_help():void {
    vars.verbose = true;
    log([
        "",
        `Welcome to ${vars.version.name}.`,
        "",
        "To see all the supported features try:",
        `${vars.text.cyan + vars.version.command} commands${vars.text.none}`,
        "",
        "To see more detailed documentation for specific command supply the command name:",
        `${vars.text.cyan + vars.version.command} commands build${vars.text.none}`,
        "",
        "* Read the documentation             - cat readme.md",
    ]);
};

export default help;