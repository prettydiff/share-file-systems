/* lib/electron - API endpoint to electron desktop application wrapper. */

import { app, BrowserWindow } from "electron";
import entry from "./terminal/utilities/entry.js";

function createWindow () {
    const win = new BrowserWindow({
      width: 800,
      height: 600
    });
  
    win.loadFile("./index.html");
  };
  
  app.whenReady().then(() => {
    createWindow();
  
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    })
  });
  
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });