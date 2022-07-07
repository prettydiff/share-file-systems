/* lib/electron - API endpoint to electron desktop application wrapper. */

import { app, BrowserWindow } from "electron";
//import entry from "./terminal/utilities/entry.js";

const createWindow = function electron_createWindow():void {
    const win = new BrowserWindow({
        width: 800,
        height: 600
    });
    win.loadFile("./index.html");
};
  
app.whenReady().then(function electron_whenReady():void {
    createWindow();

    app.on("activate", function electron_activate():void {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on("window-all-closed", function electron_windowClosed():void {
    if (process.platform !== "darwin") {
        app.quit();
    }
});