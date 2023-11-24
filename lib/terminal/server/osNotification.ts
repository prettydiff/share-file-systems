
/* lib/terminal/server/osNotification - This library sends user messaging notifications to the operating system. */

import error from "../utilities/error.js";
import node from "../utilities/node.js";
import transmit_ws from "./transmission/transmit_ws.js";

// cspell:words findstr, gwmi, netstat, processid

const osNotification = function terminal_server_osNotification():void {
    const keys:string[] = transmit_ws.getSocketKeys("browser") as string[];
    if (process.platform === "win32") {
        // 1. Resolves a process ID from an open web socket client port
        // 2. Checks if a Powershell process object associated with that ID has a mainWindowHandle value greater than 0
        // 3. If so then executes the flash on the window associated with that handle
        // 4. If not then resolves the parent process ID for the given process ID and then repeats steps 2 and 3

        keys.forEach(function terminal_server_osNotification_wsClients(agent:string):void {
            // this flash function stores the powershell instruction to flash a window in the task bar
            // * please note that this is a C# instruction passed through powershell as a template and powershell template instructions cannot be preceded by white space
            const flash = function terminal_server_osNotification_wsClients_flash(handle:string):void {
                    const powershell:node_childProcess_ChildProcess = node.child_process.spawn("powershell.exe", [], {
                        shell: true
                    });
                    powershell.on("close", function terminal_server_osNotification_wsClients_flash_close():void {
                        powershell.kill(0);
                    });
                    // cspell:disable
                    powershell.stdin.write(`Add-Type -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.InteropServices;
public class Window {
    [StructLayout(LayoutKind.Sequential)]
    public struct FLASHWINFO {
        public UInt32 cbSize;
        public IntPtr hwnd;
        public UInt32 dwFlags;
        public UInt32 uCount;
        public UInt32 dwTimeout;
    }
    const UInt32 FLASHW_ALL = 3;
    const UInt32 FLASHW_TIMERNOFG = 12; 
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    static extern bool FlashWindowEx(ref FLASHWINFO pwfi);
    public static bool FlashWindow(IntPtr handle, UInt32 timeout, UInt32 count) {
        IntPtr hWnd = handle;
        FLASHWINFO fInfo = new FLASHWINFO();
        fInfo.cbSize = Convert.ToUInt32(Marshal.SizeOf(fInfo));
        fInfo.hwnd = hWnd;
        fInfo.dwFlags = FLASHW_ALL | FLASHW_TIMERNOFG;
        fInfo.uCount = count;
        fInfo.dwTimeout = timeout;
        return FlashWindowEx(ref fInfo);
    }
}
"@;[window]::FlashWindow(${handle},250,1)\n
`);
                    // cspell:enable
                    powershell.stdin.write("exit");
                    powershell.stdin.end();
                },
                // in the case where a process id does not have a mainWindowHandle it is necessary to gather the parent process id until finding a process that does have a mainWindowHandle property
                getParent = function terminal_server_osNotification_wsClients_getParent(pid:string):void {
                    const powershell:node_childProcess_ChildProcess = node.child_process.spawn("powershell.exe", [], {
                            shell: true
                        }),
                        segments:string[] = [];
                    powershell.stdout.on("data", function terminal_server_osNotification_wsClients_getParent_data(data:Buffer):void {
                        segments.push(data.toString());
                    });
                    powershell.on("close", function terminal_server_osNotification_wsClients_getParent_close():void {
                        let output:string = segments.join("").split("ParentProcessId")[1];
                        const index:number = output.indexOf("\r");
                        powershell.kill(0);
                        if (index > 0) {
                            output = output.slice(0, index);
                        }
                        getHandle(output);
                    });
                    powershell.stdin.write(`(gwmi win32_process | ? {$_.processid -eq '${pid}'}).ParentProcessId`);
                    powershell.stdin.write("exit");
                    powershell.stdin.end();
                },
                // * the powershell get-process command returns a table of process related information by application name
                // * mainWindowHandle is the window id on a process that represents an application window, only a few processes will have a mainWindowHandle property
                getHandle = function terminal_server_osNotification_wsClients_getHandle(pid:string):void {
                    const powershell:node_childProcess_ChildProcess = node.child_process.spawn("powershell.exe", [], {
                            shell: true
                        }),
                        segments:string[] = [];
                    powershell.stdout.on("data", function terminal_server_osNotification_wsClients_getHandle_data(data:Buffer):void {
                        segments.push(data.toString());
                    });
                    powershell.on("close", function terminal_server_osNotification_wsClients_getHandle_close():void {
                        let output:string = segments.join("").split("mainWindowHandle")[1];
                        const index:number = output.indexOf("\r");
                        powershell.kill(0);
                        if (index > 0) {
                            output = output.slice(0, index);
                        }
                        if (output === "0") {
                            getParent(pid);
                        } else {
                            flash(output);
                        }
                    });
                    powershell.stdin.write(`(get-process | where-object id -eq "${pid}").mainWindowHandle`);
                    powershell.stdin.write("exit");
                    powershell.stdin.end();
                },
                // * netStat is an application that performs port mapping.  I am using it to map a client port to a process ID.
                netStat = function terminal_server_osNotification_wsClients_netStat(statError:node_childProcess_ExecException, statOut:string):void {
                    if (statError === null) {
                        const args:string[] = statOut.replace(/\s+$/, "").split(" "),
                            pid:string = args[args.length - 1];
                        getHandle(pid);
                    } else {
                        error(["Error running Windows netstat command in osNotifications"], statError);
                    }
                };
            node.child_process.exec(`netstat -aon | findstr "${transmit_ws.socketList.browser[agent].remotePort}"`, netStat);
        });
    }
};

export default osNotification;