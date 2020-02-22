
import server from "../lib/terminal/server.js";
import vars from "../lib/terminal/vars.js";

// tests structure
// * artifact - the address of anything written to disk, so that it can be removed
// * command - the command to execute minus the `node js/services` part
// * file - a file system address to open
// * name - a short label to describe the test
// * qualifier - how to test, see simulationItem in index.d.ts for appropriate values
// * share - optional object containing share data to test against
// * test - the value to compare against

const //sep:string = vars.sep,
    projectPath:string = vars.projectPath,
    windowsPath:string = projectPath.replace(/\\/g, "\\\\"),
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
            name: "Base 64 Local",
            qualifier: "is",
            test: [{
                "content": "ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAibW9kdWxlUmVzb2x1dGlvbiI6ICJub2RlIiwKICAgICAgICAib3V0RGlyIjogImpzIiwKICAgICAgICAicHJldHR5IjogdHJ1ZSwKICAgICAgICAidGFyZ2V0IjogIkVTNiIsCiAgICAgICAgInR5cGVzIjogWyJub2RlIl0sCiAgICAgICAgInR5cGVSb290cyI6IFsibm9kZV9tb2R1bGVzL0B0eXBlcyJdCiAgICB9LAogICAgImV4Y2x1ZGUiOiBbCiAgICAgICAgImpzIiwKICAgICAgICAibm9kZV9tb2R1bGVzIgogICAgXSwKICAgICJpbmNsdWRlIjogWwogICAgICAgICIqLnRzIiwKICAgICAgICAiKiovKi50cyIKICAgIF0KfQ==",
                "id": "some-modal-id",
                "path": `${projectPath}tsconfig.json`
            }]
        },
        {
            command: {
                "fs": {
                    "action": "fs-base64",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`some-modal-id:${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Base 64 Remote",
            qualifier: "is",
            test: [{
                "content": "ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAibW9kdWxlUmVzb2x1dGlvbiI6ICJub2RlIiwKICAgICAgICAib3V0RGlyIjogImpzIiwKICAgICAgICAicHJldHR5IjogdHJ1ZSwKICAgICAgICAidGFyZ2V0IjogIkVTNiIsCiAgICAgICAgInR5cGVzIjogWyJub2RlIl0sCiAgICAgICAgInR5cGVSb290cyI6IFsibm9kZV9tb2R1bGVzL0B0eXBlcyJdCiAgICB9LAogICAgImV4Y2x1ZGUiOiBbCiAgICAgICAgImpzIiwKICAgICAgICAibm9kZV9tb2R1bGVzIgogICAgXSwKICAgICJpbmNsdWRlIjogWwogICAgICAgICIqLnRzIiwKICAgICAgICAiKiovKi50cyIKICAgIF0KfQ==",
                "id": "some-modal-id",
                "path": `${projectPath}tsconfig.json`
            }]
        },
        {
            command: {
                "fs": {
                    "action": "fs-copy",
                    "agent": "localhost",
                    "copyAgent": "localhost",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": `${projectPath}storage`,
                    "watch": "no"
                }
            },
            name: "Copy Local to Local",
            qualifier: "is",
            test: {
                "file-list-status": {
                    "failures": [],
                    "message": "Copy complete. XXXX file written at size XXXX (XXXX bytes) with XXXX failures.",
                    "target": "remote-test-ID"
                }
            }
        },
        {
            command: {
                "fs": {
                    "action": "fs-copy",
                    "agent": "localhost",
                    "copyAgent": "remoteUser",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": `${projectPath}storage`,
                    "watch": "no"
                }
            },
            name: "Copy Local to Remote",
            qualifier: "is",
            test: {
                id: {
                    "file-list-status": {
                        failures: [],
                        message: "Copying 100% complete. XXXX files written at size XXXX (XXXX bytes) and XXXX integrity failures.",
                        target: `local-${projectPath.replace(/\\/g, "\\\\")}storage`
                    }
                },
                dirs: "missing"
            }
        },
        {
            command: {
                "fs": {
                    "action": "fs-copy",
                    "agent": "remoteUser",
                    "copyAgent": "localhost",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": `${projectPath}storage`,
                    "watch": "no"
                }
            },
            name: "Copy Remote to Local",
            qualifier: "is",
            test: {
                "file-list-status": {
                    failures: [],
                    message: "Copy complete. XXXX file written at size XXXX (XXXX bytes) with XXXX failures.",
                    target: "remote-test-ID"
                }
            }
        },
        {
            command: {
                "fs": {
                    "action": "fs-copy",
                    "agent": "remoteUser",
                    "copyAgent": "remoteUser",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": `${projectPath}storage`,
                    "watch": "no"
                }
            },
            name: "Copy Remote to Remote 1",
            qualifier: "contains",
            test: "fs-update-remote"
        },
        {
            command: {
                "fs": {
                    "action": "fs-copy",
                    "agent": "remoteUser",
                    "copyAgent": "remoteUser",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": `${projectPath}storage`,
                    "watch": "no"
                }
            },
            name: "Copy Remote to Remote 2",
            qualifier: "contains",
            test: `["${windowsPath}storage","directory"`
        },
        {
            command: {
                "fs": {
                    "action": "fs-copy",
                    "agent": "remoteUser",
                    "copyAgent": "remoteUser",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": `${projectPath}storage`,
                    "watch": "no"
                }
            },
            name: "Copy Remote to Remote 3",
            qualifier: "contains",
            test: "\"agent\":\"remoteUser@[::1]:XXXX\""
        },
        {
            command: {
                "fs": {
                    "action": "fs-details",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Details of Local tsconfig.json",
            qualifier: "is",
            test: {
                dirs: [
                    [`${projectPath}tsconfig.json`,"file","",0,0,"stat"]
                ],
                fail: [],
                id: "test-ID"
            }
        },
        {
            command: {
                "fs": {
                    "action": "fs-details",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Details of Remote tsconfig.json",
            qualifier: "is",
            test: {
                dirs: [
                    [`${projectPath}tsconfig.json`,"file","",0,0,"stat"]
                ],
                fail: [],
                id: "test-ID"
            }
        },
        {
            command: {
                "fs": {
                    "action": "fs-new",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal`],
                    "name": "directory",
                    "watch": "no"
                }
            },
            name: "Local New Directory",
            qualifier: "is",
            test: `${projectPath}serviceTestLocal created.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-new",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal.json`],
                    "name": "file",
                    "watch": "no"
                }
            },
            name: "Local New File",
            qualifier: "is",
            test: `${projectPath}serviceTestLocal.json created.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-new",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote`],
                    "name": "directory",
                    "watch": "no"
                }
            },
            name: "Remote New Directory",
            qualifier: "is",
            test: `${projectPath}serviceTestRemote created.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-new",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote.json`],
                    "name": "file",
                    "watch": "no"
                }
            },
            name: "Remote New File",
            qualifier: "is",
            test: `${projectPath}serviceTestRemote.json created.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-write",
                    "agent": "localhost",
                    "copyAgent": "localhost",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal.json`],
                    "name": "local to local text fragment",
                    "watch": "no"
                }
            },
            name: "Write Local to Local",
            qualifier: "is",
            test: `File ${projectPath}serviceTestLocal.json saved to disk on localhost.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-write",
                    "agent": "localhost",
                    "copyAgent": "remoteUser",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote.json`],
                    "name": "local to remote text fragment",
                    "watch": "no"
                }
            },
            name: "Write Local to Remote",
            qualifier: "is",
            test: `File ${projectPath}serviceTestRemote.json saved to disk on remoteUser@[::1]:XXXX.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-write",
                    "agent": "remoteUser",
                    "copyAgent": "localhost",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal.json`],
                    "name": "remote to local text fragment",
                    "watch": "no"
                }
            },
            name: "Write Remote to Local",
            qualifier: "is",
            test: `File ${projectPath}serviceTestLocal.json saved to disk on localhost.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-write",
                    "agent": "remoteUser",
                    "copyAgent": "remoteUser",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote.json`],
                    "name": "remote to remote text fragment",
                    "watch": "no"
                }
            },
            name: "Write Remote to Remote",
            qualifier: "is",
            test: `File ${projectPath}serviceTestRemote.json saved to disk on remoteUser@[::1]:XXXX.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-read",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Read Local",
            qualifier: "is",
            test: [{
                "content": "remote to local text fragment",
                "id": "test-ID",
                "path": `${projectPath}serviceTestLocal.json`
            }]
        },
        {
            command: {
                "fs": {
                    "action": "fs-read",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Read Remote",
            qualifier: "is",
            test: [{
                "content": "remote to remote text fragment",
                "id": "test-ID",
                "path": `${projectPath}serviceTestRemote.json`
            }]
        },
        {
            command: {
                "fs": {
                    "action": "fs-destroy",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Destroy Local Directory",
            qualifier: "is",
            test: `Path(s) ${projectPath}serviceTestLocal destroyed.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-destroy",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Destroy Local File",
            qualifier: "is",
            test: `Path(s) ${projectPath}serviceTestLocal.json destroyed.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-destroy",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Destroy Remote Directory",
            qualifier: "is",
            test: `Path(s) ${projectPath}serviceTestRemote destroyed.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-destroy",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Destroy Remote File",
            qualifier: "is",
            test: `Path(s) ${projectPath}serviceTestRemote.json destroyed.`
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
            name: "Hash Local",
            qualifier: "is",
            test: [{
                "content": hash,
                "id": "some-modal-id",
                "path": `${projectPath}tsconfig.json`
            }]
        },
        {
            command: {
                "fs": {
                    "action": "fs-hash",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth":1,
                    "id": "test-ID",
                    "location": [`some-modal-id:${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "Hash Remote",
            qualifier: "is",
            test: [{
                "content": hash,
                "id": "some-modal-id",
                "path": `${projectPath}tsconfig.json`
            }]
        }
    ];

services.addServers = function test_services_addServers(callback:Function):void {
    const flag:serviceFlags = {
            local: false,
            remote: false
        },
        completionLocal = function test_services_addServers_completion():void {
            flag.local = true;
            if (flag.remote === true) {
                callback();
            }
        },
        completionRemote = function test_services_addServers_completionRemote():void {
            flag.remote = true;
            if (flag.local === true) {
                callback();
            }
        };
    services.serverLocal = server(completionLocal);
    services.serverRemote = server(completionRemote);
};

export default services;