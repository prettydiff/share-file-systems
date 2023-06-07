
/* lib/terminal/commands/library/firewall - A utility to open firewall settings for this application. */

import error from "../../utilities/error.js";
import node from "../../utilities/node.js";
import vars from "../../utilities/vars.js";

// cspell: words advfirewall netsh runas

const firewall = function terminal_commands_library_firewall(callback:commandCallback):void {
    const errorOut = function terminal_commands_library_fireWall_errorOut(message:string, errorObject:node_childProcess_ExecException|NodeJS.ErrnoException):void {
        error([message], errorObject);
        process.exit(1);
    };
    if (process.platform === "win32") {
        node.child_process.exec("nvm root", function terminal_commands_library_firewall_nvm(nvmError:node_childProcess_ExecException, stdout:string):void {
            let nvmPath:string = "",
                nvm:boolean = (nvmError === null && stdout !== "");
            const instructions = function terminal_commands_library_firewall_nvm_instructions():void {
                const commands:string[] = [
                        "netsh advfirewall firewall delete rule name=\"node.exe\"",
                        "netsh advfirewall firewall delete rule name=\"node nvm\"",
                        "netsh advfirewall firewall delete rule name=\"Node.js\"",
                        "netsh advfirewall firewall add rule name=\"node.exe\" program=\"C:\\Program Files\\nodejs\\node.exe\" action=\"allow\" protocol=TCP profile=\"any\" dir=in",
                        "netsh advfirewall firewall add rule name=\"node.exe\" program=\"C:\\Program Files\\nodejs\\node.exe\" action=\"allow\" protocol=TCP profile=\"any\" dir=out"
                    ],
                    writeLocation:string = [
                        `${vars.path.project}lib`,
                        "terminal",
                        "test",
                        "storageTest",
                        "temp",
                        "firewall.ps1"
                    ].join(vars.path.sep);
                if (nvm === true) {
                    commands.push(`netsh advfirewall firewall add rule name="node nvm" program="${nvmPath}" action="allow" protocol=TCP profile="any" dir=in`);
                    commands.push(`netsh advfirewall firewall add rule name="node nvm" program="${nvmPath}" action="allow" protocol=TCP profile="any" dir=out`);
                }
                commands.push("exit");
                node.fs.writeFile(writeLocation, commands.join(`;${node.os.EOL}`), function terminal_commands_library_firewall_nvm_instructions_write(writeError:NodeJS.ErrnoException):void {
                    if (writeError === null) {
                        node.child_process.exec(`Start-Process powershell -verb runas -WindowStyle "hidden" -ArgumentList "-file ${writeLocation}"`, {
                            shell: "powershell"
                        }, function terminal_commands_library_firewall_nvm_instructions_write_execute(execError:node_childProcess_ExecException):void {
                            if (execError === null) {
                                callback("Firewall", ["Windows Defender Firewall updated."], false);
                            } else {
                                errorOut("Error executing Windows Defender Firewall instructions.", execError);
                            }
                        });
                    } else {
                        errorOut("Error writing Windows Defender Firewall instructions.", writeError);
                    }
                });
            };
            if (nvm === true) {
                nvmPath = stdout.replace(/^\s*Current Root:\s*/, "").replace(/\s+$/, "");
                node.child_process.exec("nvm list", function terminal_commands_library_firewall_nvm_list(listError:node_childProcess_ExecException, listOut:string):void {
                    if (listError === null) {
                        const star:number = listOut.indexOf("*");
                        if (star < 0) {
                            nvm = false;
                            instructions();
                        } else {
                            listOut = listOut.slice(star + 1).replace(/^\s*/, "");
                            listOut = listOut.slice(0, listOut.indexOf(" "));
                            nvmPath = `${nvmPath + vars.path.sep}v${listOut + vars.path.sep}node.exe`;
                            instructions();
                        }
                    } else {
                        errorOut("Error executing \"nvm list\"", listError);
                    }
                });
            } else {
                instructions();
            }
        });
    }
};

export default firewall;