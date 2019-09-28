
/*eslint no-console: 0*/
import commas from "./commas.js";
import humanTime from "./humanTime.js";
import vars from "./vars.js";

// uniform error formatting
const library = {
        commas: commas,
        humanTime: humanTime
    },
    error = function terminal_error(errText:string[]):void {
        const bell = function terminal_error_bell():void {
                library.humanTime(true);
                if (vars.command === "build" || vars.command === "simulation" || vars.command === "validation") {
                    console.log("\u0007"); // bell sound
                } else {
                    console.log("");
                }
                if (vars.command !== "debug") {
                    process.exit(1);
                }
            },
            errorOut = function terminal_error_errorOut():void {
                if (vars.command === "server") {
                    const stackTrace:string[] = new Error().stack.replace(/^Error/, "").replace(/\s+at\s/g, ")splitMe").split("splitMe"),
                        server:serverError = {
                            stack: stackTrace.slice(1),
                            error: errText.join(" ")
                        };
                    vars.ws.broadcast(`error:${JSON.stringify(server)}`);
                } else {
                    const stack:string = new Error().stack.replace("Error", `${vars.text.cyan}Stack trace${vars.text.none + vars.node.os.EOL}-----------`);
                    vars.flags.error = true;
                    console.log("");
                    console.log(stack);
                    console.log("");
                    console.log(`${vars.text.angry}Error Message${vars.text.none}`);
                    console.log("------------");
                    if (errText[0] === "" && errText.length < 2) {
                        console.log(`${vars.text.yellow}No error message supplied${vars.text.none}`);
                    } else {
                        errText.forEach(function terminal_error_errorOut_each(value:string):void {
                            console.log(value);
                        });
                    }
                    console.log("");
                    bell();
                }
            },
            debug = function terminal_error_debug():void {
                const stack:string = new Error().stack,
                    totalmem:number = vars.node.os.totalmem(),
                    freemem:number = vars.node.os.freemem();
                vars.flags.error = true;
                console.log("");
                console.log("---");
                console.log("");
                console.log("");
                console.log(`# ${vars.version.name} - Debug Report`);
                console.log("");
                console.log(`${vars.text.green}## Error Message${vars.text.none}`);
                if (errText[0] === "" && errText.length < 2) {
                    console.log(`${vars.text.yellow}No error message supplied${vars.text.none}`);
                } else {
                    console.log("```");
                    errText.forEach(function terminal_error_each(value:string):void {
                        // eslint-disable-next-line
                        console.log(value.replace(/\u001b/g, "\\u001b"));
                    });
                    console.log("```");
                }
                console.log("");
                console.log(`${vars.text.green}## Stack Trace${vars.text.none}`);
                console.log("```");
                console.log(stack.replace(/\s*Error\s+/, "    "));
                console.log("```");
                console.log("");
                console.log(`${vars.text.green}## Environment${vars.text.none}`);
                console.log(`* OS - **${vars.node.os.platform()} ${vars.node.os.release()}**`);
                console.log(`* Mem - ${library.commas(totalmem)} - ${library.commas(freemem)} = **${library.commas(totalmem - freemem)}**`);
                console.log(`* CPU - ${vars.node.os.arch()} ${vars.node.os.cpus().length} cores`);
                console.log("");
                console.log(`${vars.text.green}## Command Line Instruction${vars.text.none}`);
                console.log("```");
                console.log(vars.cli);
                console.log("```");
                console.log("");
                console.log(`${vars.text.green}## Time${vars.text.none}`);
                console.log("```");
                console.log(library.humanTime(false));
                console.log("```");
                console.log("");
                bell();
            };
        if (process.argv.indexOf("spaces_debug") > -1) {
            debug();
        } else {
            errorOut();
        }
    };

export default error;