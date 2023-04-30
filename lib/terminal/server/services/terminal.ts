
/* lib/terminal/server/services/terminal - Processes terminal messaging for remote devices and display to the user in a browser. */

import { ChildProcess, spawn } from "child_process";
import { readdir, stat } from "fs";
import { isAbsolute, resolve } from "path";

import sender from "../transmission/sender.js";
import vars from "../../utilities/vars.js";

/**
 * A library to relay terminal logging between devices for presentation to the user in the browser.
 * ```typescript
 * interface module_terminal {
 *     input: (socketData:socketData) => void;
 *     kill: (id:string) => void;
 *     output: (data:service_terminal) => void;
 *     processes: {
 *         [key:string]: ChildProcess;
 *     };
 * }
 * ``` */
const terminal:module_terminal = {
    input: function terminal_server_services_terminal_input(socketData:socketData):void {
        const data:service_terminal = socketData.data as service_terminal,
            cdTest:RegExp = (/cd(dir)?\s+/),
            autoComplete = function terminal_server_services_terminal_input_autoComplete(data:service_terminal):void {
                let indexStart:number = data.autoComplete,
                    indexEnd:number = data.autoComplete,
                    last:string = "",
                    fragment:string = (function terminal_server_services_terminal_input_autoComplete_fragment():string {
                        let quote:string = "",
                            space:number = -1,
                            address:string = "";
                        const len:number = data.instruction.length,
                            escape:string = (process.platform === "win32")
                                ? "`^"
                                : "\\";
                        if (indexStart > 0) {
                            do {
                                indexStart = indexStart - 1;
                                if (space < 0 && (/\s/).test(data.instruction.charAt(indexStart - 1)) === true && escape.indexOf(data.instruction.charAt(indexStart - 2)) < 0) {
                                    space = indexStart - 1;
                                    if (quote === "") {
                                        break;
                                    }
                                }
                                if (data.instruction.charAt(indexStart - 1) === "\"" || data.instruction.charAt(indexStart - 1) === "'") {
                                    quote = data.instruction.charAt(indexStart - 1);
                                    break;
                                }
                            } while (indexStart > 0);
                        }
                        if (indexEnd < len) {
                            do {
                                if ((quote !== "" && data.instruction.charAt(indexEnd) === quote) || (quote === "" && (/\s/).test(data.instruction.charAt(indexEnd)) === true) && escape.indexOf(data.instruction.charAt(indexEnd - 1)) < 0) {
                                    break;
                                }
                                indexEnd = indexEnd + 1;
                            } while (indexEnd < len);
                        }
                        address = data.instruction.slice(indexStart, indexEnd);
                        return (isAbsolute(address) === true)
                            ? resolve(address)
                            : resolve(data.directory + vars.path.sep + address);
                    }());
                const complete = function terminal_server_services_terminal_input_autoComplete_complete():void {
                        const slashFix = function terminal_server_services_terminal_input_autoComplete_complete_slashFix(str:string):string {
                                return str.replace(/\\+/, "\\");
                            },
                            fragmentStart:string = data.instruction.slice(0, indexStart) + fragment.replace(/^\w:\\+/, slashFix);
                        data.instruction = fragmentStart + data.instruction.slice(indexEnd);
                        data.autoComplete = fragmentStart.length;
                        terminal.output(data);
                    },
                    dirCallback = function terminal_server_services_terminal_input_autoComplete_dirCallback(err:NodeJS.ErrnoException, dirs:string[]):void {
                        if (err === null) {
                            let index:number = 0;
                            const len:number = dirs.length;
                            do {
                                if ((process.platform === "win32" && dirs[index].toLowerCase().indexOf(last) === 0) || ((process.platform !== "win32" && dirs[index].indexOf(last) === 0))) {
                                    fragment = fragment + vars.path.sep + dirs[index];
                                    complete();
                                    return;
                                }
                                index = index + 1;
                            } while (index < len);
                        }
                    },
                    statCallback = function terminal_server_services_terminal_input_autoComplete_statCallback(err:NodeJS.ErrnoException):void {
                        if (err === null) {
                            if (last === "") {
                                complete();
                            } else {
                                readdir(fragment, dirCallback);
                            }
                        } else {
                            const fragments:string[] = fragment.split(vars.path.sep);
                            last = (process.platform === "win32")
                                ? fragments.pop().toLowerCase()
                                : fragments.pop();
                            fragment = fragments.join(vars.path.sep);
                            if (fragment.charAt(fragment.length - 1) === ":") {
                                fragment = fragment + vars.path.sep;
                            }
                            stat(fragment, statCallback);
                        }
                    };
                stat(fragment, statCallback);
            },
            changeDirectory = function terminal_server_services_terminal_input_changeDirectory():void {
                let address:string = data.instruction.replace(cdTest, "");
                if ((address.charAt(0) === "\"" || address.charAt(0) === "'") && address.slice(1).indexOf(address.charAt(0)) > 0) {
                    const quote:string = address.charAt(0);
                    address = address.slice(1);
                    address = address.slice(0, address.indexOf(quote));
                } else if ((/\s/).test(address) === true) {
                    const space:string = (/\s/).exec(address)[0];
                    address = address.slice(0, address.indexOf(space));
                }
                address = (isAbsolute(address) === true)
                    ? resolve(address)
                    : resolve(data.directory + vars.path.sep + address);
                stat(address, function terminal_server_services_terminal_input_stat(err:NodeJS.ErrnoException):void {
                    if (err === null) {
                        data.directory = address;
                    } else {
                        data.logs = [
                            "No such file or directory",
                            address
                        ];
                    }
                    terminal.output(data);
                });
            },
            command = function terminal_server_services_terminal_input_command():void {
                const spawnChild = function terminal_server_services_terminal_input_command_spawnChild():void {
                    const shell:ChildProcess = spawn(data.instruction, [], {
                            cwd: data.directory,
                            shell: true
                        }),
                        dataHandle = function terminal_server_services_terminal_input_dataHandle(output:Buffer):void {
                            data.logs = output.toString().replace(/\r\n/g, "\n").split("\n");
                            terminal.output(data);
                        },
                        errorHandle = function terminal_server_services_terminal_input_errorHandle(errorMessage:NodeJS.ErrnoException):void {
                            data.logs = JSON.stringify(errorMessage).split("\n");
                            terminal.output(data);
                        };
                    terminal.processes[data.id] = shell;
                    shell.on("error", errorHandle);
                    shell.on("close", terminal.kill);
                    shell.on("message", dataHandle);
                    shell.stdout.on("data", dataHandle);
                    shell.stderr.on("data", dataHandle);
                };
                data.instruction = data.instruction.replace(/\u001b/g, "");
                if (terminal.processes[data.id] === undefined) {
                    spawnChild();
                } else if (terminal.processes[data.id].exitCode !== null) {
                    terminal.kill(data.id);
                    spawnChild();
                } else {
                    terminal.processes[data.id].stdin.write(data.instruction);
                }
            },
            sendOutput = function terminal_server_services_terminal_input_sendOutput():void {
                data.logs = vars.environment.log;
                if (data.directory === "") {
                    data.directory = vars.path.project;
                }
                terminal.output(data);
            };
        if (data.target === "agentSource" && data.agentSource.agent === vars.settings.hashDevice && data.agentSource.agentType === "device") {
            data.target = "agentRequest";
            // source - local device
            if (data.instruction === "close-modal") {
                // modal is closed - terminal any associated spawned process
                terminal.kill(data.id);
            } else if (data.instruction === "") {
                // empty instruction - respond with terminal logs
                sendOutput();
            } else if (data.autoComplete > -1) {
                // file system auto completion
                autoComplete(data);
            } else if (cdTest.test(data.instruction) === true) {
                // change directory
                changeDirectory();
            } else {
                // execute a command
                command();
            }
        } else {
            terminal.output(data);
        }
    },
    kill: function terminal_server_services_terminal_kill(id:string):void {
        // eslint-disable-next-line
        const shell:ChildProcess = (terminal.processes[id] === undefined)
            // eslint-disable-next-line
            ? (this.stdout === undefined)
                ? null
                // eslint-disable-next-line
                : this
            : terminal.processes[id];
        if (shell !== null) {
            shell.kill("SIGINT");
        }
        if (id !== undefined) {
            delete terminal.processes[id];
        }
    },
    output: function terminal_server_services_terminalOutput(data:service_terminal):void {
        if (data[data.target].agent === vars.settings.hashDevice && data[data.target].agentType === "device") {
            sender.broadcast({
                data: data,
                service: "terminal"
            }, "browser");
        } else {
            const agents:transmit_agents = (data[data.target].agentType === "device")
                ? {
                    device: data[data.target].agent,
                    user: vars.settings.hashUser
                }
                : {
                    device: null,
                    user: data[data.target].agent
                };
            sender.send({
                data: data,
                service: "terminal"
            }, agents);
        }
    },
    processes: {}
};

export default terminal;