
/* lib/terminal/commands/interface/version - Shell interface for expressing the application's version. */

// runs apps.log
const version = function terminal_commands_interface_version(callback:commandCallback):void {
    callback("Version", [""], false);
};

export default version;