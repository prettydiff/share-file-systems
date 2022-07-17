/* lib/electron - API endpoint to electron desktop application wrapper. */

/*import { app, BrowserWindow } from "electron";

import entry from "./terminal/utilities/entry.js";
import log from "./terminal/utilities/log.js";
import vars from "./terminal/utilities/vars.js";

const createWindow = function electron_createWindow():void {
    const win = new BrowserWindow({
        width: 800,
        height: 600
    });
    win.title = vars.environment.name;
    win.loadURL("https://localhost");
};
  
app.whenReady().then(function electron_whenReady():void {
    const entryWrapper = function electron_whenReady_entryWrapper():void {
        entry(function electron_whenReady_entryWrapper_callback(title:string, text:string[]):void {
            log.title(title);
            log(text);
            createWindow();
        });
    };

    entryWrapper();

    app.on("activate", function electron_activate():void {
        if (BrowserWindow.getAllWindows().length === 0) {
            entryWrapper();
        }
    });
});

app.on("window-all-closed", function electron_windowClosed():void {
    if (process.platform !== "darwin") {
        app.quit();
    }
});*/