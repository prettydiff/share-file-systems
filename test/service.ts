
import serverVars from "../lib/terminal/server/serverVars.js";

import server from "../lib/terminal/server.js";
import vars from "../lib/terminal/vars.js";

// tests structure
// * artifact - the address of anything written to disk, so that it can be removed
// * command - the command to execute minus the `node js/services` part
// * file - a file system address to open
// * name - a short label to describe the test
// * qualifier - how to test, see simulationItem in index.d.ts for appropriate values
// * test - the value to compare against

const //sep:string = vars.sep,
    projectPath:string = vars.projectPath,
    //superSep:string = (sep === "\\")
    //    ? "\\\\"
    //    : sep,
    // the tsconfig.json file hash used in multiple tests
    hash:string = "622d3d0c8cb85c227e6bad1c99c9cd8f9323c8208383ece09ac58e713c94c34868f121de6e58e358de00a41f853f54e4ef66e6fe12a86ee124f7e452dbe89800",
    services:serviceTests = [
        {
            command: {
                "fs": {
                    "action": "fs-base64",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`some-modal-id:${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Base 64",
            qualifier: "contains",
            test: [{
                "content": "ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAibW9kdWxlUmVzb2x1dGlvbiI6ICJub2RlIiwKICAgICAgICAib3V0RGlyIjogImpzIiwKICAgICAgICAicHJldHR5IjogdHJ1ZSwKICAgICAgICAidGFyZ2V0IjogIkVTNiIsCiAgICAgICAgInR5cGVzIjogWyJub2RlIl0sCiAgICAgICAgInR5cGVSb290cyI6IFsibm9kZV9tb2R1bGVzL0B0eXBlcyJdCiAgICB9LAogICAgImV4Y2x1ZGUiOiBbCiAgICAgICAgImpzIiwKICAgICAgICAibm9kZV9tb2R1bGVzIgogICAgXSwKICAgICJpbmNsdWRlIjogWwogICAgICAgICIqLnRzIiwKICAgICAgICAiKiovKi50cyIKICAgIF0KfQ==",
                "id": "some-modal-id",
                "path": `${projectPath}tsconfig.json`
            }]
        },
        {
            command: {
                "fs": {
                    "action": "fs-hash",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`some-modal-id:${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Hash",
            qualifier: "contains",
            test: [{
                "content": hash,
                "id": "some-modal-id",
                "path": `${projectPath}tsconfig.json`
            }]
        }
    ];

services.addServers = function test_services_addServers():void {
    services.serverLocal = server({
        ip: "localhost",
        port: 80,
        silent: true
    });
    services.serverRemote = server({
        ip: serverVars.addresses[0][0][1],
        port: 80,
        silent: true
    });
};

export default services;