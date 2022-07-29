/* lib/terminal/commands/interface/build - Shell interface to the build tool. */

import build from "../library/build.js";

const interfaceBuild = function terminal_commands_interface_build(callback:commandCallback):void {
    const config:config_command_build = {
        force_certificate: (process.argv.indexOf("force_certificate") > -1),
        force_port: (process.argv.indexOf("force_port") > -1),
        no_compile: (process.argv.indexOf("no_compile") > -1),
        test: false,
        type_validate: (process.argv.indexOf("type") > -1 || process.argv.indexOf("typescript") > -1 || process.argv.indexOf("type_validate") > -1 || process.argv.indexOf("type_validation") > -1)
    };
    build(config, callback);
};

export default interfaceBuild;