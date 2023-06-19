/* lib/tauri - API endpoint to Tauri desktop application wrapper. */

// cspell:words tauri

import entry from "./terminal/utilities/entry.js";
import error from "./terminal/utilities/error.js";
import log from "./terminal/utilities/log.js";
import node from "./terminal/utilities/node.js";
import vars from "./terminal/utilities/vars.js";

entry(function tauri_entry(title:string, text:string[]):void {
    log.title(title);
    log(text);
    node.child_process.exec("npm run tauri dev", {cwd: vars.path.project}, function tauri_entry_exec(err:node_childProcess_ExecException, stdout:string, stderr:string):void {
        if (err !== null) {
            error([
                `${vars.text.angry}Error starting Tauri.${vars.text.none}`,
                stdout,
                stderr
            ], err);
        }
    });
});