
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
    windowsSep:string = vars.sep.replace(/\\/g, "\\\\"),
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
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`some-modal-id:${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-base64, Base 64 Local",
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
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`some-modal-id:${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-base64, Base 64 Remote",
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
                    "action": "fs-close",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}lib`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-close, Close Local",
            qualifier: "begins",
            test: `Watcher ${projectPath}lib closed.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-close",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}lib`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-close, Close Remote",
            qualifier: "begins",
            test: "{\"fs-update-remote\":{\"agent\":\"remoteUser@[::1]:XXXX\",\"dirs\":[["
        },
        {
            command: {
                "fs": {
                    "action": "fs-copy",
                    "agent": "localhost",
                    "copyAgent": "localhost",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": `${projectPath}storage`,
                    "watch": "no"
                }
            },
            name: "fs:fs-copy, Copy Local to Local",
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
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": `${projectPath}storage`,
                    "watch": "no"
                }
            },
            name: "fs:fs-copy, Copy Local to Remote",
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
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": `${projectPath}storage`,
                    "watch": "no"
                }
            },
            name: "fs:fs-copy, Copy Remote to Local",
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
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": `${projectPath}storage`,
                    "watch": "no"
                }
            },
            name: "fs:fs-copy, Copy Remote to Remote 1",
            qualifier: "contains",
            test: "fs-update-remote"
        },
        {
            command: {
                "fs": {
                    "action": "fs-copy",
                    "agent": "remoteUser",
                    "copyAgent": "remoteUser",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": `${projectPath}storage`,
                    "watch": "no"
                }
            },
            name: "fs:fs-copy, Copy Remote to Remote 2",
            qualifier: "contains",
            test: `["${windowsPath}storage","directory"`
        },
        {
            command: {
                "fs": {
                    "action": "fs-copy",
                    "agent": "remoteUser",
                    "copyAgent": "remoteUser",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": `${projectPath}storage`,
                    "watch": "no"
                }
            },
            name: "fs:fs-copy, Copy Remote to Remote 3",
            qualifier: "contains",
            test: "\"agent\":\"remoteUser@[::1]:XXXX\""
        },
        {
            command: {
                "fs": {
                    "action": "fs-details",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-details, Details of Local tsconfig.json",
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
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-details, Details of Remote tsconfig.json",
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
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal`],
                    "name": "directory",
                    "watch": "no"
                }
            },
            name: "fs:fs-new, Local New Directory",
            qualifier: "is",
            test: `${projectPath}serviceTestLocal created.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-new",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal.json`],
                    "name": "file",
                    "watch": "no"
                }
            },
            name: "fs:fs-new, Local New File",
            qualifier: "is",
            test: `${projectPath}serviceTestLocal.json created.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-new",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote`],
                    "name": "directory",
                    "watch": "no"
                }
            },
            name: "fs:fs-new, Remote New Directory",
            qualifier: "is",
            test: `${projectPath}serviceTestRemote created.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-new",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote.json`],
                    "name": "file",
                    "watch": "no"
                }
            },
            name: "fs:fs-new, Remote New File",
            qualifier: "is",
            test: `${projectPath}serviceTestRemote.json created.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-write",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal.json`],
                    "name": "local text fragment",
                    "watch": "no"
                }
            },
            name: "fs:fs-write, Write Local",
            qualifier: "is",
            test: `File ${projectPath}serviceTestLocal.json saved to disk on localhost.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-write",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote.json`],
                    "name": "remote text fragment",
                    "watch": "no"
                }
            },
            name: "fs:fs-write, Write Remote to Local",
            qualifier: "is",
            test: `File ${projectPath}serviceTestRemote.json saved to disk on remoteUser@[::1]:XXXX.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-read",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-read, Read Local",
            qualifier: "is",
            test: [{
                "content": "local text fragment",
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
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-read, Read Remote",
            qualifier: "is",
            test: [{
                "content": "remote text fragment",
                "id": "test-ID",
                "path": `${projectPath}serviceTestRemote.json`
            }]
        },
        {
            command: {
                "fs": {
                    "action": "fs-rename",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal`],
                    "name": "serviceLocal",
                    "watch": "no"
                }
            },
            name: "fs:fs-rename, Rename Local Directory",
            qualifier: "is",
            test: `Path ${projectPath}serviceTestLocal on agent localhost renamed to ${projectPath}serviceLocal.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-rename",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestLocal.json`],
                    "name": "serviceLocal.json",
                    "watch": "no"
                }
            },
            name: "fs:fs-rename, Rename Local File",
            qualifier: "is",
            test: `Path ${projectPath}serviceTestLocal.json on agent localhost renamed to ${projectPath}serviceLocal.json.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-rename",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote`],
                    "name": "serviceRemote",
                    "watch": "no"
                }
            },
            name: "fs:fs-rename, Rename Remote Directory",
            qualifier: "is",
            test: `Path ${projectPath}serviceTestRemote on agent remoteUser@[::1]:XXXX renamed to ${projectPath}serviceRemote.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-rename",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceTestRemote.json`],
                    "name": "serviceRemote.json",
                    "watch": "no"
                }
            },
            name: "fs:fs-rename, Rename Remote File",
            qualifier: "is",
            test: `Path ${projectPath}serviceTestRemote.json on agent remoteUser@[::1]:XXXX renamed to ${projectPath}serviceRemote.json.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-destroy",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceLocal`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-destroy, Destroy Local Directory",
            qualifier: "is",
            test: `Path(s) ${projectPath}serviceLocal destroyed on agent localhost.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-destroy",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceLocal.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-destory, Destroy Local File",
            qualifier: "is",
            test: `Path(s) ${projectPath}serviceLocal.json destroyed on agent localhost.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-destroy",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceRemote`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-destroy, Destroy Remote Directory",
            qualifier: "is",
            test: `Path(s) ${projectPath}serviceRemote destroyed on agent remoteUser@[::1]:XXXX.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-destroy",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`${projectPath}serviceRemote.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-destroy, Destroy Remote File",
            qualifier: "is",
            test: `Path(s) ${projectPath}serviceRemote.json destroyed on agent remoteUser@[::1]:XXXX.`
        },
        {
            command: {
                "fs": {
                    "action": "fs-hash",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`some-modal-id:${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-hash, Hash Local",
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
                    "depth": 1,
                    "id": "test-ID",
                    "location": [`some-modal-id:${projectPath}tsconfig.json`],
                    "name": "",
                    "watch": "no"
                }
            },
            name: "fs:fs-hash, Hash Remote",
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
                    "action": "fs-directory",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 2,
                    "id": "test-ID",
                    "location": [`${projectPath}js${vars.sep}lib`],
                    "name": ".js",
                    "watch": "no"
                }
            },
            name: "fs:fs-directory, Directory Local 1",
            qualifier: "begins",
            test: "{\"dirs\":[["
        },
        {
            command: {
                "fs": {
                    "action": "fs-directory",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 2,
                    "id": "test-ID",
                    "location": [`${projectPath}js${vars.sep}lib`],
                    "name": ".js",
                    "watch": "no"
                }
            },
            name: "fs:fs-directory, Directory Local 2",
            qualifier: "contains",
            test: `["${windowsPath}js${windowsSep}lib${windowsSep}browser${windowsSep}fs.js","file"`
        },
        {
            command: {
                "fs": {
                    "action": "fs-directory",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth": 2,
                    "id": "test-ID",
                    "location": [`${projectPath}js${vars.sep}lib`],
                    "name": ".js",
                    "watch": "no"
                }
            },
            name: "fs:fs-directory, Directory Remote 1",
            qualifier: "begins",
            test: "{\"dirs\":[["
        },
        {
            command: {
                "fs": {
                    "action": "fs-search",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth": 2,
                    "id": "test-ID",
                    "location": [`${projectPath}js${vars.sep}lib`],
                    "name": ".js",
                    "watch": "no"
                }
            },
            name: "fs:fs-directory, Directory Remote 2",
            qualifier: "contains",
            test: `["${windowsPath}js${windowsSep}lib${windowsSep}browser${windowsSep}fs.js","file"`
        },
        {
            command: {
                "fs": {
                    "action": "fs-search",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 0,
                    "id": "test-ID",
                    "location": [`${projectPath}`],
                    "name": ".js",
                    "watch": "no"
                }
            },
            name: "fs:fs-search, Search Local 1",
            qualifier: "begins",
            test: "{\"dirs\":[["
        },
        {
            command: {
                "fs": {
                    "action": "fs-search",
                    "agent": "localhost",
                    "copyAgent": "",
                    "depth": 0,
                    "id": "test-ID",
                    "location": [`${projectPath}`],
                    "name": ".js",
                    "watch": "no"
                }
            },
            name: "fs:fs-search, Search Local 2",
            qualifier: "contains",
            test: `["${windowsPath}js${windowsSep}lib${windowsSep}browser${windowsSep}fs.js","file"`
        },
        {
            command: {
                "fs": {
                    "action": "fs-search",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth": 0,
                    "id": "test-ID",
                    "location": [`${projectPath}`],
                    "name": ".js",
                    "watch": "no"
                }
            },
            name: "fs:fs-search, Search Remote 1",
            qualifier: "begins",
            test: "{\"dirs\":[["
        },
        {
            command: {
                "fs": {
                    "action": "fs-search",
                    "agent": "remoteUser",
                    "copyAgent": "",
                    "depth": 0,
                    "id": "test-ID",
                    "location": [`${projectPath}`],
                    "name": ".js",
                    "watch": "no"
                }
            },
            name: "fs:fs-search, Search Remote 2",
            qualifier: "contains",
            test: `["${windowsPath}js${windowsSep}lib${windowsSep}browser${windowsSep}fs.js","file"`
        },
        {
            command: {
                "fs-update-remote": {
                    agent: "remoteUser",
                    dirs: [
                        [`${projectPath}storage${vars.sep}storage.txt`, "file", "", 0, 0, "stat"]
                    ],
                    location: `${projectPath}storage`,
                    status: "test payload"
                }
            },
            name: "fs-update-remote, Local",
            qualifier: "begins",
            test: `Received directory watch for {"fs-update-remote":{"agent":"remoteUser@[::1]:XXXX","dirs":[["${windowsPath}storage${windowsSep}storage.txt","file","",0,0,"stat"]],"location":"${windowsPath}storage","status":"test payload","copyAgent":`
        },
        {
            command: {
                "share-update": {
                    user: "remoteUser@[::1]:XXXX",
                    shares: []
                }
            },
            name: "share-update, Local",
            qualifier: "is",
            test: "Received share update from remoteUser@[::1]:XXXX"
        },
        {
            command: {
                settings: {
                    audio: true,
                    brotli: 7,
                    color: "default",
                    hash: "sha3-512",
                    modals: {
                        "systems-modal": {
                            agent: "localhost",
                            content:{},
                            inputs: [
                                "close", "maximize", "minimize"
                            ],
                            read_only: false,
                            single: true,
                            status: "hidden",
                            title: "<span class=\"icon-systemLog\">⌬</span> System Log",
                            type: "systems",
                            width: 800,
                            zIndex: 1,
                            id: "systems-modal",
                            left: 200,
                            top: 200,
                            height: 400
                        },
                    },
                    modalTypes: [
                        "systems", "settings", "fileNavigate", "invite-request"
                    ],
                    name: "Austin",
                    zIndex: 6
                },
                send: true
            },
            name: "settings, Local settings storage",
            qualifier: "is",
            test: "settings written."
        },
        {
            command: {
                messages: {
                    status: [],
                    users: [],
                    errors: [
                        [
                            "[17 FEB 2020, 13:59:00.878]","EPERM: operation not permitted, rename 'settings-0.15976829605695686.json' -> 'settings.json'", [
                                "terminal_error_errorOut (file:///share-file-systems/js/lib/terminal/error.js:23:32))",
                                "Object.terminal_error [as error] (file:///share-file-systems/js/lib/terminal/error.js:103:9))",
                                "terminal_server_storage_renameNode (file:///share-file-systems/js/lib/terminal/server/storage.js:13:25))",
                                "FSReqCallback.oncomplete (fs.js:154:23)"
                            ]
                        ]
                    ]
                },
                send: true
            },
            name: "messages, Local messages storage",
            qualifier: "is",
            test: "messages written."
        },
        {
            command: {
                users: {
                    localhost: {
                        color: ["fff", "000"],
                        shares: []
                    },
                    remoteUser: {
                        color: ["fff", "ddd"],
                        shares: []
                    }
                },
                send: true
            },
            name: "users, Local users storage",
            qualifier: "is",
            test: "users written."
        },
        {
            command: {
                settings: {
                    audio: true,
                    brotli: 7,
                    color: "default",
                    hash: "sha3-512",
                    modals: {
                        "systems-modal": {
                            agent: "localhost",
                            content:{},
                            inputs: [
                                "close", "maximize", "minimize"
                            ],
                            read_only: false,
                            single: true,
                            status: "hidden",
                            title: "<span class=\"icon-systemLog\">⌬</span> System Log",
                            type: "systems",
                            width: 800,
                            zIndex: 1,
                            id: "systems-modal",
                            left: 200,
                            top: 200,
                            height: 400
                        },
                    },
                    modalTypes: [
                        "systems", "settings", "fileNavigate", "invite-request"
                    ],
                    name: "Austin",
                    zIndex: 6
                },
                send: false
            },
            name: "settings, Local settings storage without HTTP response",
            qualifier: "is",
            test: "settings written with false response for testing."
        },
        {
            command: {
                messages: {
                    status: [],
                    users: [],
                    errors: [
                        [
                            "[17 FEB 2020, 13:59:00.878]","EPERM: operation not permitted, rename 'settings-0.15976829605695686.json' -> 'settings.json'", [
                                "terminal_error_errorOut (file:///share-file-systems/js/lib/terminal/error.js:23:32))",
                                "Object.terminal_error [as error] (file:///share-file-systems/js/lib/terminal/error.js:103:9))",
                                "terminal_server_storage_renameNode (file:///share-file-systems/js/lib/terminal/server/storage.js:13:25))",
                                "FSReqCallback.oncomplete (fs.js:154:23)"
                            ]
                        ]
                    ]
                },
                send: false
            },
            name: "messages, Local messages storage without HTTP response",
            qualifier: "is",
            test: "messages written with false response for testing."
        },
        {
            command: {
                users: {
                    localhost: {
                        color: ["fff", "000"],
                        shares: []
                    },
                    remoteUser: {
                        color: ["fff", "ddd"],
                        shares: []
                    }
                },
                send: false
            },
            name: "users, Local users storage without HTTP response",
            qualifier: "is",
            test: "users written with false response for testing."
        },
        {
            command: {
                invite: {
                    action: "invite",
                    deviceKey: "",
                    deviceName: "",
                    message: "Hello",
                    name: "",
                    ip: "::1",
                    modal: "test-modal",
                    port: 80,
                    shares: [],
                    status: "declined",
                    type: "user",
                    userHash: "",
                    userName: ""
                }
            },
            name: "invite, invite - Local user invite",
            qualifier: "is",
            test: "Invitation received at start terminal XXXX from start browser. Sending invitation to remote terminal: ::1."
        }
        // todo
        // * heartbeat
        // * heartbeat-update
        // * invite-request
        // * invite-response
        // * invite-complete
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