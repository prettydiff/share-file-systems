
/* lib/terminal/server/osNotification - This library sends user messaging notifications to the operating system. */

import { spawn } from "child_process";

import error from "../utilities/error.js";
import serverVars from "./serverVars.js";
import vars from "../utilities/vars.js";

const osNotification = function terminal_server_osNotification():void {
    if (process.platform === "win32") {
        // 1. Resolves a process ID from an open web socket client port
        // 2. Checks if a Powershell process object associated with that ID has a mainWindowHandle value greater than 0
        // 3. If so then executes the flash on the window associated with that handle
        // 4. If not then resolves the parent process ID for the given process ID and then repeats steps 2 and 3

        // eslint-disable-next-line
        serverVars.ws.clients.forEach(function terminal_server_osNotification_wsClients(client:any):void {
            const flash = function terminal_server_osNotification_wsClients_flash(handle:string):void {
                    const powershell = spawn("powershell.exe", [], {
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
                    powershell.stdin.end();
                },
                getParent = function terminal_server_osNotification_wsClients_getParent(pid:string):void {
                    const powershell = spawn("powershell.exe", [], {
                            shell: true
                        }),
                        segments:string[] = [];
                    powershell.stdout.on("data", function terminal_server_osNotification_wsClients_getParent_data(data:Buffer):void {
                        segments.push(data.toString());
                    });
                    powershell.on("close", function terminal_server_osNotification_wsClients_getParent_close():void {
                        let output:string = segments.join("").split("ParentProcessId")[1],
                            index:number = output.indexOf("\r");
                        powershell.kill(0);
                        if (index > 0) {
                            output = output.slice(0, index);
                        }
                        getHandle(output);
                    });
                    // cspell:disable
                    powershell.stdin.write(`(gwmi win32_process | ? {$_.processid -eq '${pid}'}).ParentProcessId`);
                    // cspell:enable
                    powershell.stdin.end();
                },
                getHandle = function terminal_server_osNotification_wsClients_getHandle(pid:string):void {
                    const powershell = spawn("powershell.exe", [], {
                            shell: true
                        }),
                        segments:string[] = [];
                    powershell.stdout.on("data", function terminal_server_osNotification_wsClients_getHandle_data(data:Buffer):void {
                        segments.push(data.toString());
                    });
                    powershell.on("close", function terminal_server_osNotification_wsClients_getHandle_close():void {
                        let output:string = segments.join("").split("mainWindowHandle")[1],
                            index:number = output.indexOf("\r");
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
                    powershell.stdin.end();
                },
                netStat = function terminal_server_osNotification_wsClients_netStat(statError:Error, statOut:string):void {
                    if (statError === null) {
                        const args:string[] = statOut.replace(/\s+$/, "").split(" "),
                            pid:string = args[args.length - 1];
                        getHandle(pid);
                    } else {
                        // cspell:disable
                        error(["Error running Windows netstat command in osNotifications", statError.toString()]);
                        // cspell:enable
                    }
                };
            // cspell:disable
            vars.node.child(`netstat -aon | findstr "${client._socket.remotePort}"`, netStat);
            // cspell:enable
        });
    }
};

export default osNotification;