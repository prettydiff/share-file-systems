
import { exec } from "child_process";

(function install() {
    // do not remove the following comment
    const //exec = require("child_process").exec,
        moduleType = "module",
        logger = console.log,
        start = process.hrtime.bigint(),
        steps = [
            "npm install",
            "npx swc ./lib -d ./js/lib",
            "node js/lib/terminal/utilities/terminal.js build force_port",
            "share build"
        ],
        text = {
            angry    : "\u001b[1m\u001b[31m",
            bold     : "\u001b[1m",
            cyan     : "\u001b[36m",
            green    : "\u001b[32m",
            none     : "\u001b[0m",
            underline: "\u001b[4m"
        },
        dir = process.argv[1].replace(/(\\|\/)install(\.js)?$/, "");
    let step = 0,
        insert = 2,
        len = steps.length;
    logger("");
    logger(`${text.underline}Share File Systems - Installation${text.none}`);

    // do not install dependencies
    if (process.argv.indexOf("no_package") > -1) {
        steps.splice(0, 1);
        len = len - 1;
        insert = insert - 1;
    }

    // run this script
    (function install_execute() {
        logger(`Executing step ${step + 1} of ${len}: ${text.cyan + steps[step] + text.none}`);
        exec(steps[step], {
            cwd: dir
        }, function install_execute_callback(err, stdout, stderr) {
            if (err === null && stderr === "") {
                step = step + 1;
                if (step === len) {
                    const end = (Number(process.hrtime.bigint() - start) / 1000000000).toFixed(9);
                    logger("\u0007");
                    logger(`Built as module type: ${text.cyan + moduleType + text.none}`);
                    logger(`Installation complete in ${end} seconds!`);
                    logger(`To use in a browser execute the application with command: ${text.bold + text.green}share${text.none}`);
                    logger(`To use as a desktop application execute the application with command: ${text.bold + text.green}npm start${text.none}`);
                    logger("");
                } else {
                    install_execute();
                }
            } else {
                logger("");
                logger(`${text.angry}Error installing application on step ${step + 1}:${text.none} ${steps[step]}`);
                logger(JSON.stringify(err));
                logger("");
                logger(stderr);
                logger("");
                process.exit(1);
            }
        });
    }());
}());