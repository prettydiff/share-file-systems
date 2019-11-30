
import build from "./build.js";
import log from "./log.js";
import server from "./server.js";
import vars from "./vars.js";

// rebuild the application and start the server
const restart = function terminal_restart():void {
    build(false, function terminal_restart_callback():void {
        vars.verbose = true;
        log([`All ${vars.text.green + vars.text.bold} test ${vars.text.none} tasks complete...`, ""], true);
        server();
    });
};

export default restart;