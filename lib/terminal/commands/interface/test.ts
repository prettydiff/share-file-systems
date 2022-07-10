
/* lib/terminal/commands/interface/test - Shell interface wrapping all test automation utilities. */
import build from "../library/build.js";
import vars from "../../utilities/vars.js";

// run the test suite using the build application
const test = function terminal_commands_interface_test(callback:commandCallback):void {
    const title:string = "Run All Test and Validation Scenarios",
        config:config_command_build = {
            force_certificate: false,
            force_port: false,
            incremental: false,
            no_compile: false,
            test: true
        };
    build(config, function terminal_commands_interface_test_callback():void {
        vars.settings.verbose = true;
        callback(title, [`All ${vars.text.green + vars.text.bold}test${vars.text.none} tasks complete... Exiting clean!\u0007`], false);
        process.exit(0);
        return;
    });
};

export default test;