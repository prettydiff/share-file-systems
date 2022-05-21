import { exec } from "child_process";
import { sep } from "path";

(function install() {
    let step = 0;
    // eslint-disable-next-line
    const logger = console.log,
        start = process.hrtime.bigint,
        steps = [
            "npm install -g typescript",
            "npm install",
            "tsc",
            "node js/application.js build no_compile",
            "share build no_compile"
        ],
        len = steps.length,
        text = {
            angry    : "\u001b[1m\u001b[31m",
            bold     : "\u001b[1m",
            cyan     : "\u001b[36m",
            green    : "\u001b[32m",
            none     : "\u001b[0m"
        },
        dir = process.argv[1].replace(/(\\|\/)install(\.js)?$/, "");
    (function install_execute() {
        logger(`Executing step ${step + 1} of ${len}: ${text.cyan + steps[step] + text.none}`);
        exec(steps[step], {
            cwd: dir
        }, function install_execute_callback(err) {
            if (err === null) {
                step = step + 1;
                if (step === len) {
                    logger("\u0007");
                    logger("Installation complete!");
                    logger(`Execute the application with command: ${text.bold + text.green}share${text.none}`);
                } else {
                    install_execute();
                }
            } else {
                logger("");
                logger(`${text.angry}Error installing application on step ${step + 1}:${text.none} ${steps[step]}`);
                logger(JSON.stringify(err));
                process.exit(1);
            }
        });
    }());
}());