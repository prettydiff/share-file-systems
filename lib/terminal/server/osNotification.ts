
/* lib/terminal/server/osNotification - This library sends user messaging notifications to the operating system. */

import { spawn } from "child_process";

import error from "../utilities/error.js";
import serverVars from "./serverVars.js";
import vars from "../utilities/vars.js";

const osNotification = function terminal_server_osNotification():void {
    if (process.platform === "win32") {
        serverVars.ws.clients.forEach(function terminal_server_osNotification_wsClients(client:any):void {
            const netStat = function terminal_server_osNotification_wsClients_netStat(statError:nodeError, statOut:string):void {
                    if (statError === null) {
                        const args:string[] = statOut.replace(/\s+$/, "").split(" "),
                            pid:string = args[args.length - 1],
                            powershell = spawn("powershell.exe", [], {
                                shell: true
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

    const UInt32 FLASHW_STOP = 0;
    const UInt32 FLASHW_CAPTION = 1;
    const UInt32 FLASHW_TRAY = 2;
    const UInt32 FLASHW_ALL = 3;
    const UInt32 FLASHW_TIMER = 4;
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
"@;[window]::FlashWindow((get-process | where-object id -eq "${pid}").mainWindowHandle,250,1)\n
                        `);
                        // cspell:enable
                        //powershell.stdin.write(`[window]::FlashWindow((get-process | where-object id -eq "${pid}").mainWindowHandle,250,1)\n`);
                        powershell.stdin.end();
                        powershell.kill(0);
                        //vars.node.child(`(get-process | where-object id -eq "${pid}").mainWindowHandle`, windowHandle);
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