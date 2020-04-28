
/* lib/terminal/test/samples/service - A list of service related tests. */

import * as http from "http";

import agents from "../../../common/agents.js";
import readStorage from "../../utilities/readStorage.js";
import server from "../../commands/server.js";
import serverVars from "../../server/serverVars.js";
import vars from "../../utilities/vars.js";

import testComplete from "../application/complete.js";
import testEvaluation from "../application/evaluation.js";

// tests structure
// * artifact - the address of anything written to disk, so that it can be removed
// * command - the command to execute minus the `node js/services` part
// * file - a file system address to open
// * name - a short label to describe the test
// * qualifier - how to test, see simulationItem in index.d.ts for appropriate values
// * share - optional object containing share data to test against
// * test - the value to compare against

const services = function test_services():testServiceArray {
    const projectPath:string = vars.projectPath,
        windowsPath:string = projectPath.replace(/\\/g, "\\\\"),
        windowsSep:string = vars.sep.replace(/\\/g, "\\\\"),
        loopback:string = (serverVars.addresses[0].length > 1)
            ? "[::1]"
            : "127.0.0.1",
        loopbackTest:string = (loopback === "127.0.0.1")
            ? "XXXX"
            : loopback,
        hash:string = "622d3d0c8cb85c227e6bad1c99c9cd8f9323c8208383ece09ac58e713c94c34868f121de6e58e358de00a41f853f54e4ef66e6fe12a86ee124f7e452dbe89800",

        // start test list
        service:testServiceArray = [
            // todo: fs - readonly tests
            // todo: user tests
        ];
    service.addServers = function test_services_addServers(callback:Function):void {
        const storageComplete = function test_services_addServers_storageComplete(storageData:storageItems):void {
            const complete = function test_services_addServers_complete(counts:agentCounts):void {
                    counts.count = counts.count + 1;
                    if (counts.count === counts.total) {
                        callback();
                    }
                };

            serverVars.brotli = storageData.settings.brotli;
            serverVars.hashDevice = storageData.settings.hashDevice;
            serverVars.hashType = storageData.settings.hashType;
            serverVars.hashUser = storageData.settings.hashUser;
            serverVars.nameDevice = storageData.settings.nameDevice;
            serverVars.nameUser = storageData.settings.nameUser;
            serverVars.device = storageData.device;
            serverVars.user = storageData.user;

            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-base64",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`some-modal-id:${projectPath}tsconfig.json`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-base64, Base 64 Local",
                qualifier: "is",
                test: [{
                    content: "ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAibW9kdWxlUmVzb2x1dGlvbiI6ICJub2RlIiwKICAgICAgICAib3V0RGlyIjogImpzIiwKICAgICAgICAicHJldHR5IjogdHJ1ZSwKICAgICAgICAidGFyZ2V0IjogIkVTNiIsCiAgICAgICAgInR5cGVzIjogWyJub2RlIl0sCiAgICAgICAgInR5cGVSb290cyI6IFsibm9kZV9tb2R1bGVzL0B0eXBlcyJdCiAgICB9LAogICAgImV4Y2x1ZGUiOiBbCiAgICAgICAgImpzIiwKICAgICAgICAibm9kZV9tb2R1bGVzIgogICAgXSwKICAgICJpbmNsdWRlIjogWwogICAgICAgICIqLnRzIiwKICAgICAgICAiKiovKi50cyIKICAgIF0KfQ==",
                    id: "some-modal-id",
                    path: `${projectPath}tsconfig.json`
                }]
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-base64",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`some-modal-id:${projectPath}tsconfig.json`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-base64, Base 64 Remote Device",
                qualifier: "is",
                test: [{
                    content: "ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAibW9kdWxlUmVzb2x1dGlvbiI6ICJub2RlIiwKICAgICAgICAib3V0RGlyIjogImpzIiwKICAgICAgICAicHJldHR5IjogdHJ1ZSwKICAgICAgICAidGFyZ2V0IjogIkVTNiIsCiAgICAgICAgInR5cGVzIjogWyJub2RlIl0sCiAgICAgICAgInR5cGVSb290cyI6IFsibm9kZV9tb2R1bGVzL0B0eXBlcyJdCiAgICB9LAogICAgImV4Y2x1ZGUiOiBbCiAgICAgICAgImpzIiwKICAgICAgICAibm9kZV9tb2R1bGVzIgogICAgXSwKICAgICJpbmNsdWRlIjogWwogICAgICAgICIqLnRzIiwKICAgICAgICAiKiovKi50cyIKICAgIF0KfQ==",
                    id: "some-modal-id",
                    path: `${projectPath}tsconfig.json`
                }]
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-close",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}lib`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-close, Close Local",
                qualifier: "begins",
                test: `Watcher ${projectPath}lib closed.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-close",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}lib`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-close, Close Remote Device",
                qualifier: "begins",
                test: "{\"fs-update-remote\":{\"agent\":\"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e\",\"agentType\":\"device\",\"dirs\":[["
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-copy",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: serverVars.hashDevice,
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}tsconfig.json`],
                        name: `${projectPath}storage`,
                        watch: "no"
                    }
                },
                name: "fs:fs-copy, Copy Local to Local",
                qualifier: "is",
                test: {
                    "file-list-status": {
                        failures: [],
                        message: "Copy complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.",
                        target: "remote-test-ID"
                    }
                }
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-copy",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}tsconfig.json`],
                        name: `${projectPath}storage`,
                        watch: "no"
                    }
                },
                name: "fs:fs-copy, Copy Local to Remote Device",
                qualifier: "is",
                test: {
                    "file-list-status": {
                        failures: [],
                        message: "Copy complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.",
                        target: "remote-test-ID"
                    }
                }
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-copy",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: serverVars.hashDevice,
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}tsconfig.json`],
                        name: `${projectPath}storage`,
                        watch: "no"
                    }
                },
                name: "fs:fs-copy, Copy Remote Device to Local",
                qualifier: "is",
                test: {
                    "file-list-status": {
                        failures: [],
                        message: "Copy complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.",
                        target: "remote-test-ID"
                    }
                }
            });
            /*service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-copy",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "fa042a71aee124b7b667d97fd84c0a309e72aefcae5d95762bc05d39cbeedae88122758f8625910a669271251d5f561a1c2749c6d66664f5d35dcc8c608c1a89",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}version.json`],
                        name: `${projectPath}storage`,
                        watch: "no"
                    }
                },
                name: "fs:fs-copy, Copy Remote Device to different Remote Device",
                qualifier: "is",
                test: {
                    "file-list-status": {
                        failures: [],
                        message: "Copy complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.",
                        target: "remote-test-ID"
                    }
                }
            });*/
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-copy",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}tsconfig.json`],
                        name: `${projectPath}storage`,
                        watch: "no"
                    }
                },
                name: "fs:fs-copy, Copy Remote Device to Same Remote Device 1",
                qualifier: "contains",
                test: "fs-update-remote"
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-copy",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}tsconfig.json`],
                        name: `${projectPath}storage`,
                        watch: "no"
                    }
                },
                name: "fs:fs-copy, Copy Remote Device to Same Remote Device 2",
                qualifier: "contains",
                test: `["${windowsPath}storage","directory"`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-copy",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}tsconfig.json`],
                        name: `${projectPath}storage`,
                        watch: "no"
                    }
                },
                name: "fs:fs-copy, Copy Remote Device to Same Remote Device 3",
                qualifier: "contains",
                test: "\"agent\":\"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e\""
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-details",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}tsconfig.json`],
                        name: "",
                        watch: "no"
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
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-details",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}tsconfig.json`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-details, Details of Remote Device tsconfig.json",
                qualifier: "is",
                test: {
                    dirs: [
                        [`${projectPath}tsconfig.json`,"file","",0,0,"stat"]
                    ],
                    fail: [],
                    id: "test-ID"
                }
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-new",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceTestLocal`],
                        name: "directory",
                        watch: "no"
                    }
                },
                name: "fs:fs-new, Local New Directory",
                qualifier: "is",
                test: `${projectPath}serviceTestLocal created.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-new",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceTestLocal.json`],
                        name: "file",
                        watch: "no"
                    }
                },
                name: "fs:fs-new, Local New File",
                qualifier: "is",
                test: `${projectPath}serviceTestLocal.json created.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-new",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceTestRemote`],
                        name: "directory",
                        watch: "no"
                    }
                },
                name: "fs:fs-new, Remote Device New Directory",
                qualifier: "is",
                test: `${projectPath}serviceTestRemote created.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-new",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceTestRemote.json`],
                        name: "file",
                        watch: "no"
                    }
                },
                name: "fs:fs-new, Remote Device New File",
                qualifier: "is",
                test: `${projectPath}serviceTestRemote.json created.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-write",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceTestLocal.json`],
                        name: "local text fragment",
                        watch: "no"
                    }
                },
                name: "fs:fs-write, Write Local",
                qualifier: "is",
                test: `File ${projectPath}serviceTestLocal.json saved to disk on local device.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-write",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceTestRemote.json`],
                        name: "remote device text fragment",
                        watch: "no"
                    }
                },
                name: "fs:fs-write, Write Remote Device to Local",
                qualifier: "is",
                test: `File ${projectPath}serviceTestRemote.json saved to disk on device a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-read",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceTestLocal.json`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-read, Read Local",
                qualifier: "is",
                test: [{
                    content: "local text fragment",
                    id: "test-ID",
                    path: `${projectPath}serviceTestLocal.json`
                }]
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-read",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceTestRemote.json`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-read, Read Remote Device",
                qualifier: "is",
                test: [{
                    content: "remote device text fragment",
                    id: "test-ID",
                    path: `${projectPath}serviceTestRemote.json`
                }]
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-rename",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceTestLocal`],
                        name: "serviceLocal",
                        watch: "no"
                    }
                },
                name: "fs:fs-rename, Rename Local Directory",
                qualifier: "is",
                test: `Path ${projectPath}serviceTestLocal on device ${serverVars.hashDevice} renamed to ${projectPath}serviceLocal.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-rename",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceTestLocal.json`],
                        name: "serviceLocal.json",
                        watch: "no"
                    }
                },
                name: "fs:fs-rename, Rename Local File",
                qualifier: "is",
                test: `Path ${projectPath}serviceTestLocal.json on device ${serverVars.hashDevice} renamed to ${projectPath}serviceLocal.json.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-rename",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceTestRemote`],
                        name: "serviceRemote",
                        watch: "no"
                    }
                },
                name: "fs:fs-rename, Rename Remote Device Directory",
                qualifier: "is",
                test: `Path ${projectPath}serviceTestRemote on device a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e renamed to ${projectPath}serviceRemote.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-rename",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceTestRemote.json`],
                        name: "serviceRemote.json",
                        watch: "no"
                    }
                },
                name: "fs:fs-rename, Rename Remote Device File",
                qualifier: "is",
                test: `Path ${projectPath}serviceTestRemote.json on device a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e renamed to ${projectPath}serviceRemote.json.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-destroy",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceLocal`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-destroy, Destroy Local Directory",
                qualifier: "is",
                test: `Path(s) ${projectPath}serviceLocal destroyed on device ${serverVars.hashDevice}.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-destroy",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceLocal.json`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-destroy, Destroy Local File",
                qualifier: "is",
                test: `Path(s) ${projectPath}serviceLocal.json destroyed on device ${serverVars.hashDevice}.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-destroy",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceRemote`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-destroy, Destroy Remote Device Directory",
                qualifier: "is",
                test: `Path(s) ${projectPath}serviceRemote destroyed on device a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-destroy",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`${projectPath}serviceRemote.json`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-destroy, Destroy Remote Device File",
                qualifier: "is",
                test: `Path(s) ${projectPath}serviceRemote.json destroyed on device a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e.`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-hash",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`some-modal-id:${projectPath}tsconfig.json`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-hash, Hash Local",
                qualifier: "is",
                test: [{
                    content: hash,
                    id: "some-modal-id",
                    path: `${projectPath}tsconfig.json`
                }]
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-hash",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: "test-ID",
                        location: [`some-modal-id:${projectPath}tsconfig.json`],
                        name: "",
                        watch: "no"
                    }
                },
                name: "fs:fs-hash, Hash Remote Device",
                qualifier: "is",
                test: [{
                    content: hash,
                    id: "some-modal-id",
                    path: `${projectPath}tsconfig.json`
                }]
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-directory",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 2,
                        id: "test-ID",
                        location: [`${projectPath}js${vars.sep}lib`],
                        name: ".js",
                        watch: "no"
                    }
                },
                name: "fs:fs-directory, Directory Local 1",
                qualifier: "begins",
                test: "{\"dirs\":[["
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-directory",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 2,
                        id: "test-ID",
                        location: [`${projectPath}js${vars.sep}lib`],
                        name: ".js",
                        watch: "no"
                    }
                },
                name: "fs:fs-directory, Directory Local 2",
                qualifier: "contains",
                test: `["${windowsPath}js${windowsSep}lib${windowsSep}browser${windowsSep}fs.js","file"`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-directory",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 2,
                        id: "test-ID",
                        location: [`${projectPath}js${vars.sep}lib`],
                        name: ".js",
                        watch: "no"
                    }
                },
                name: "fs:fs-directory, Directory Remote Device 1",
                qualifier: "begins",
                test: "{\"dirs\":[["
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-directory",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 2,
                        id: "test-ID",
                        location: [`${projectPath}js${vars.sep}lib`],
                        name: ".js",
                        watch: "no"
                    }
                },
                name: "fs:fs-directory, Directory Remote Device 2",
                qualifier: "contains",
                test: `["${windowsPath}js${windowsSep}lib${windowsSep}browser${windowsSep}fs.js","file"`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-search",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 0,
                        id: "test-ID",
                        location: [`${projectPath}`],
                        name: ".js",
                        watch: "no"
                    }
                },
                name: "fs:fs-search, Search Local 1",
                qualifier: "begins",
                test: "{\"dirs\":[["
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-search",
                        agent: serverVars.hashDevice,
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 0,
                        id: "test-ID",
                        location: [`${projectPath}`],
                        name: ".js",
                        watch: "no"
                    }
                },
                name: "fs:fs-search, Search Local 2",
                qualifier: "contains",
                test: `["${windowsPath}js${windowsSep}lib${windowsSep}browser${windowsSep}fs.js","file"`
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-search",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 0,
                        id: "test-ID",
                        location: [`${projectPath}`],
                        name: ".js",
                        watch: "no"
                    }
                },
                name: "fs:fs-search, Search Remote Device 1",
                qualifier: "begins",
                test: "{\"dirs\":[["
            });
            service.push(<testTemplateFileService>{
                command: {
                    fs: {
                        action: "fs-search",
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        copyAgent: "",
                        copyType: "device",
                        depth: 0,
                        id: "test-ID",
                        location: [`${projectPath}`],
                        name: ".js",
                        watch: "no"
                    }
                },
                name: "fs:fs-search, Search Remote Device 2",
                qualifier: "contains",
                test: `["${windowsPath}js${windowsSep}lib${windowsSep}browser${windowsSep}fs.js","file"`
            });
            service.push(<testTemplateUpdateRemote>{
                command: {
                    "fs-update-remote": {
                        agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        dirs: [
                            [`${projectPath}storage${vars.sep}storage.txt`, "file", "", 0, 0, "stat"]
                        ],
                        fail: [],
                        location: `${projectPath}storage`,
                        status: "test payload"
                    }
                },
                name: "fs-update-remote, Local",
                qualifier: "is",
                test: `Received directory watch for {"fs-update-remote":{"agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","dirs":[["${windowsPath}storage${windowsSep}storage.txt","file","",0,0,"stat"]],"fail":[],"location":"${windowsPath}storage","status":"test payload"}} at ${serverVars.ipAddress}.`
            });
            service.push(<testTemplateSettings>{
                command: {
                    settings: {
                        audio: true,
                        brotli: 7,
                        color: "default",
                        colors: {
                            device: {
                                [serverVars.hashDevice]: ["fff", "eee"]
                            },
                            user: {}
                        },
                        hashDevice: serverVars.hashDevice,
                        hashType: "sha3-512",
                        hashUser: serverVars.hashUser,
                        modals: {
                            "systems-modal": {
                                agent: serverVars.hashDevice,
                                agentType: "device",
                                content: null,
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
                        nameDevice: "this device name",
                        nameUser: "local user name",
                        zIndex: 6
                    }
                },
                name: "settings, Local settings storage without HTTP response",
                qualifier: "is",
                test: "settings storage written with false response for testing."
            });
            service.push(<testTemplateMessages>{
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
                    }
                },
                name: "messages, Local messages storage without HTTP response",
                qualifier: "is",
                test: "messages storage written with false response for testing."
            });
            service.push(<testTemplateDevice>{
                command: {
                    device: {
                        [serverVars.hashDevice]: {
                            ip: loopback,
                            name: "local device name",
                            port: 80,
                            shares: {
                                [serverVars.hashDevice]: {
                                    execute: false,
                                    name: "C:\\mp3",
                                    readOnly: false,
                                    type: "directory"
                                }
                            }
                        }
                    }
                },
                name: "device storage, Local device storage without HTTP response",
                qualifier: "is",
                test: "device storage written with false response for testing."
            });
            service.push(<testTemplateUser>{
                command: {
                    user: {
                        [serverVars.hashDevice]: {
                            ip: loopback,
                            name: "remote user name",
                            port: 80,
                            shares: {
                                [serverVars.hashDevice]: {
                                    execute: false,
                                    name: "C:\\movies",
                                    readOnly: false,
                                    type: "directory"
                                }
                            }
                        }
                    }
                },
                name: "user storage, Local user storage without HTTP response",
                qualifier: "is",
                test: "user storage written with false response for testing."
            });
            service.push(<testTemplateInvite>{
                command: {
                    invite: {
                        action: "invite",
                        deviceHash: serverVars.hashDevice,
                        deviceName: "old desktop computer",
                        message: "Hello",
                        name: "",
                        ip: loopback,
                        modal: "test-modal",
                        port: 80,
                        shares: {
                            [serverVars.hashDevice]: {
                                ip: loopback,
                                name: "old desktop computer",
                                port: 80,
                                shares: {
                                    "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                        execute: false,
                                        name: "C:\\music",
                                        readOnly: true,
                                        type: "directory"
                                    }
                                }
                            }
                        },
                        status: "invited",
                        type: "device",
                        userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                        userName: "local user name"
                    }
                },
                name: "invite, invite - Local device invite",
                qualifier: "is",
                test: `Invitation received at start terminal XXXX from start browser. Sending invitation to remote terminal: ${loopbackTest} `
            });
            service.push(<testTemplateInvite>{
                command: {
                    invite: {
                        action: "invite-request",
                        deviceHash: serverVars.hashDevice,
                        deviceName: "old desktop computer",
                        message: "Hello",
                        name: "",
                        ip: loopback,
                        modal: "test-modal",
                        port: 80,
                        shares: {
                            [serverVars.hashDevice]: {
                                ip: loopback,
                                name: "old desktop computer",
                                port: 80,
                                shares: {
                                    "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                        execute: false,
                                        name: "C:\\music",
                                        readOnly: true,
                                        type: "directory"
                                    }
                                }
                            }
                        },
                        status: "invited",
                        type: "device",
                        userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                        userName: "local user name"
                    }
                },
                name: "invite, invite-request - Local device invite",
                qualifier: "is",
                test: `Invitation received at remote terminal ${loopbackTest} and sent to remote browser.`
            });
            service.push(<testTemplateInvite>{
                command: {
                    invite: {
                        action: "invite-response",
                        deviceHash: serverVars.hashDevice,
                        deviceName: "old desktop computer",
                        message: "Hello",
                        name: "",
                        ip: loopback,
                        modal: "test-modal",
                        port: 80,
                        shares: {
                            [serverVars.hashDevice]: {
                                ip: loopback,
                                name: "old desktop computer",
                                port: 80,
                                shares: {
                                    "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                        execute: false,
                                        name: "C:\\music",
                                        readOnly: true,
                                        type: "directory"
                                    }
                                }
                            }
                        },
                        status: "invited",
                        type: "device",
                        userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                        userName: "local user name"
                    }
                },
                name: "invite, invite-response - Local device invite",
                qualifier: "is",
                test: `Ignored invitation response processed at remote terminal ${loopbackTest} and sent to start terminal.`
            });
            service.push(<testTemplateInvite>{
                command: {
                    invite: {
                        action: "invite-response",
                        deviceHash: serverVars.hashDevice,
                        deviceName: "old desktop computer",
                        message: "Hello",
                        name: "",
                        ip: loopback,
                        modal: "test-modal",
                        port: 80,
                        shares: {
                            [serverVars.hashDevice]: {
                                ip: loopback,
                                name: "old desktop computer",
                                port: 80,
                                shares: {
                                    "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                        execute: false,
                                        name: "C:\\music",
                                        readOnly: true,
                                        type: "directory"
                                    }
                                }
                            }
                        },
                        status: "accepted",
                        type: "device",
                        userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                        userName: "local user name"
                    }
                },
                name: "invite, invite-response - Local device invite response, accepted",
                qualifier: "is",
                test: `Accepted invitation response processed at remote terminal ${loopbackTest} and sent to start terminal.`
            });
            service.push(<testTemplateInvite>{
                command: {
                    invite: {
                        action: "invite-response",
                        deviceHash: serverVars.hashDevice,
                        deviceName: "old desktop computer",
                        message: "Hello",
                        name: "",
                        ip: loopback,
                        modal: "test-modal",
                        port: 80,
                        shares: {
                            [serverVars.hashDevice]: {
                                ip: loopback,
                                name: "old desktop computer",
                                port: 80,
                                shares: {
                                    "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                        execute: false,
                                        name: "C:\\music",
                                        readOnly: true,
                                        type: "directory"
                                    }
                                }
                            }
                        },
                        status: "invited",
                        type: "device",
                        userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                        userName: "local user name"
                    }
                },
                name: "invite, invite-response - Local device invite response, ignored",
                qualifier: "is",
                test: `Ignored invitation response processed at remote terminal ${loopbackTest} and sent to start terminal.`
            });
            service.push(<testTemplateInvite>{
                command: {
                    invite: {
                        action: "invite-response",
                        deviceHash: serverVars.hashDevice,
                        deviceName: "old desktop computer",
                        message: "Hello",
                        name: "",
                        ip: loopback,
                        modal: "test-modal",
                        port: 80,
                        shares: {
                            [serverVars.hashDevice]: {
                                ip: loopback,
                                name: "old desktop computer",
                                port: 80,
                                shares: {
                                    "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                        execute: false,
                                        name: "C:\\music",
                                        readOnly: true,
                                        type: "directory"
                                    }
                                }
                            }
                        },
                        status: "declined",
                        type: "device",
                        userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                        userName: "local user name"
                    }
                },
                name: "invite, invite-response - Local device invite response, declined",
                qualifier: "is",
                test: `Declined invitation response processed at remote terminal ${loopbackTest} and sent to start terminal.`
            });
            service.push(<testTemplateInvite>{
                command: {
                    invite: {
                        action: "invite-complete",
                        deviceHash: serverVars.hashDevice,
                        deviceName: "old desktop computer",
                        message: "Hello",
                        name: "",
                        ip: loopback,
                        modal: "test-modal",
                        port: 80,
                        shares: {
                            [serverVars.hashDevice]: {
                                ip: loopback,
                                name: "old desktop computer",
                                port: 80,
                                shares: {
                                    "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                        execute: false,
                                        name: "C:\\music",
                                        readOnly: true,
                                        type: "directory"
                                    }
                                }
                            }
                        },
                        status: "accepted",
                        type: "device",
                        userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                        userName: "local user name"
                    }
                },
                name: "invite, invite-complete - Local user invite complete, accepted",
                qualifier: "is",
                test: "Accepted invitation sent to from start terminal XXXX to start browser."
            });
            service.push(<testTemplateInvite>{
                command: {
                    invite: {
                        action: "invite-complete",
                        deviceHash: serverVars.hashDevice,
                        deviceName: "old desktop computer",
                        message: "Hello",
                        name: "",
                        ip: loopback,
                        modal: "test-modal",
                        port: 80,
                        shares: {
                            "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                execute: false,
                                name: "C:\\music",
                                readOnly: true,
                                type: "directory"
                            }
                        },
                        status: "invited",
                        type: "device",
                        userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                        userName: "local user name"
                    }
                },
                name: "invite, invite-complete - Local user invite complete, ignored",
                qualifier: "is",
                test: "Ignored invitation sent to from start terminal XXXX to start browser."
            });
            service.push(<testTemplateHeartbeatBroadcast>{
                command: {
                    "heartbeat-broadcast": {
                        agentFrom: "localhost-browser",
                        shareFrom: serverVars.hashDevice,
                        shares: {
                            "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                execute: false,
                                name: "C:\\music",
                                readOnly: true,
                                type: "directory"
                            }
                        },
                        status: "active"
                    }
                },
                name: "heartbeat-broadcast, from Browser",
                qualifier: "is",
                test: "Heartbeat response received for each remote terminal."
            });
            service.push(<testTemplateHeartbeatBroadcast>{
                command: {
                    "heartbeat-broadcast": {
                        agentFrom: "localhost-terminal",
                        shareFrom: serverVars.hashDevice,
                        shares: {
                            "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                execute: false,
                                name: "C:\\music",
                                readOnly: true,
                                type: "directory"
                            }
                        },
                        status: "active"
                    }
                },
                name: "heartbeat-broadcast, from Terminal",
                qualifier: "is",
                test: "Heartbeat response received for each remote terminal."
            });
            service.push(<testTemplateHeartbeat>{
                command: {
                    heartbeat: {
                        agentFrom: serverVars.hashDevice,
                        agentTo: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        shareFrom: serverVars.hashDevice,
                        shares: {
                            "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                execute: false,
                                name: "C:\\music",
                                readOnly: true,
                                type: "directory"
                            }
                        },
                        status: "active"
                    }
                },
                name: "heartbeat, regular heartbeat",
                qualifier: "is",
                test: {
                    "heartbeat-response": {
                        agentFrom: serverVars.hashDevice,
                        agentTo: serverVars.hashDevice,
                        agentType: "device",
                        shareFrom: serverVars.hashDevice,
                        shares: {
                            "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                execute: false,
                                name: "C:\\music",
                                readOnly: true,
                                type: "directory"
                            }
                        },
                        status: "active"
                    }
                }
            });
            service.push(<testTemplateHeartbeat>{
                command: {
                    heartbeat: {
                        agentFrom: serverVars.hashUser,
                        agentTo: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                        agentType: "device",
                        shareFrom: serverVars.hashDevice,
                        shares: {
                            "76e9d9d3e3d66051b793b980f21ab270e14fa3c2682a4f9a047ce104c853291ab846669d4305aeda67126af6850c06bc168cda9610f3d730a601185e29ee20be": {
                                execute: false,
                                name: "C:\\music",
                                readOnly: true,
                                type: "directory"
                            }
                        },
                        status: "active"
                    }
                },
                name: "heartbeat, Unexpected User",
                qualifier: "is",
                test: "Unexpected user."
            });

            service.serverRemote = {
                device: {},
                user: {}
            };

            agents({
                complete: complete,
                countBy: "agent",
                perAgent: function test_services_addServers_perAgent(agentNames:agentNames, counts:agentCounts):void {
                    const serverCallback = function test_services_addServers_perAgent_serverCallback(output:serverOutput):void {
                        serverVars[output.agentType][output.agent].port = output.webPort;
                        serverVars[output.agentType][output.agent].ip = loopback;
                        if (output.agentType === "device" && output.agent === serverVars.hashDevice) {
                            serverVars.wsPort = output.wsPort;
                        }
                        complete(counts);
                    };
                    service.serverRemote[agentNames.agentType][agentNames.agent] = server({
                        agent: agentNames.agent,
                        agentType: agentNames.agentType,
                        callback: serverCallback
                    });
                },
                source: serverVars
            });
        };
        serverVars.storage = serverVars.storage = `${vars.projectPath}lib${vars.sep}terminal${vars.sep}test${vars.sep}storage`;
        readStorage(storageComplete);
    };
    service.execute = function test_services_execute(index:number, incrementor:Function):void {
        const testItem:testServiceInstance = service[index],
            keyword:string = (function test_services_execute_keyword():string {
                const words:string[] = Object.keys(testItem.command);
                return words[0];
            }()),
            agent:string = testItem.command[keyword].agent,
            command:string = (function test_services_execute_command():string {
                if (keyword === "invite") {
                    if (testItem.command.invite.action === "invite" || testItem.command.invite.action === "invite-response") {
                        if (testItem.command.invite.type === "device") {
                            testItem.command.invite.port = service.serverRemote.device["a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e"].port;
                        } else {
                            // add user hash once here once created
                            testItem.command.invite.port = service.serverRemote.user[""].port;
                        }
                    } else {
                        testItem.command.invite.port = serverVars.device[serverVars.hashDevice].port;
                    }
                }
                return JSON.stringify(testItem.command);
            }()),
            name:string = (testItem.name === undefined)
                ? command
                : testItem.name,
            header:http.OutgoingHttpHeaders = (agent === serverVars.hashDevice || agent === undefined)
                ? {
                    "content-type": "application/x-www-form-urlencoded",
                    "content-length": Buffer.byteLength(command),
                    "agent-name": "localUser",
                    "agent-type": "device",
                    "remote-user": (testItem.command[keyword].copyAgent !== undefined && testItem.command[keyword].copyAgent !== "" && testItem.command[keyword].copyAgent !== serverVars.hashDevice)
                        ? testItem.command[keyword].copyAgent
                        : "localUser"
                }
                : {
                    "content-type": "application/x-www-form-urlencoded",
                    "content-length": Buffer.byteLength(command),
                    "agent-name": testItem.command[keyword].agent,
                    "agent-type": "user",
                    "remote-user": "localUser"
                },
            payload:http.RequestOptions = {
                headers: header,
                host: loopback,
                method: "POST",
                path: "/",
                port: (keyword === "invite")
                    ? testItem.command.invite.port
                    : (keyword === "heartbeat" || testItem.command[keyword].agent === undefined)
                        ? serverVars.device[serverVars.hashDevice].port
                        : serverVars[testItem.command[keyword].agentType][testItem.command[keyword].agent].port,
                timeout: 1000
            },
            callback = function test_testListRunner_service_callback(response:http.IncomingMessage):void {
                const chunks:string[] = [];
                response.on("data", function test_testListRunner_service_callback_data(chunk:string):void {
                    chunks.push(chunk);
                });
                response.on("end", function test_testListRunner_service_callback_end():void {
                    testEvaluation({
                        test: <testItem>service[index],
                        testType: "service",
                        values: [chunks.join(""), "", ""]
                    }, incrementor);
                });
            },
            request:http.ClientRequest = http.request(payload, callback);
        request.on("error", function test_testListRunner_service_error(reqError:nodeError):void {
            testEvaluation({
                test: <testItem>service[index],
                testType: "service",
                values: [`fail - Failed to execute on service test: ${name}: ${reqError.toString()}`, "", ""]
            }, incrementor);
        });
        request.write(command);
        setTimeout(function test_testListRunner_service_callback_delay():void {
            request.end();
        }, 100);
    };
    service.killServers = function test_services_killServers(complete:testComplete):void {
        const agentComplete = function test_services_killServers_complete(counts:agentCounts):void {
            counts.count = counts.count + 1;
            if (counts.count === counts.total) {
                testComplete(complete);
            }
        };
        agents({
            complete: agentComplete,
            countBy: "agent",
            perAgent: function test_services_killServers_perAgent(agentNames:agentNames, counts:agentCounts):void {
                service.serverRemote[agentNames.agentType][agentNames.agent].close();
                agentComplete(counts);
            },
            source: serverVars
        });
    };
    return service;
};

export default services;