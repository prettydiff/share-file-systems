
/* lib/terminal/test/service - A list of service related tests. */

import server from "../commands/server.js";
import agents from "../../common/agents.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";

// tests structure
// * artifact - the address of anything written to disk, so that it can be removed
// * command - the command to execute minus the `node js/services` part
// * file - a file system address to open
// * name - a short label to describe the test
// * qualifier - how to test, see simulationItem in index.d.ts for appropriate values
// * share - optional object containing share data to test against
// * test - the value to compare against

const services = function test_services():testServiceArray {
    serverVars.device = {
        "89dd9677902964305274242975a060cdb3251ea8d74a53e1bf5d3d9f8e5508e9b1412bfe624f6251b0d826004a62ea2bafef680c0c43a4b348900173f352b0da": {
            ip: "::1",
            name: "test local device",
            port: 0,
            shares: {
                "a89e4ac7eec0c4b557aab68ad7499dd136d21d8eb2e5f51a6973dcf5f854b9a1895bec63f3a9d1b5e6243524e6bb8bc29d34c9741c1fc7fc77a7f0e8a934d153": {
                    execute: false,
                    name: "C:\\mp3\\deviceLocal",
                    readOnly: true,
                    type: "directory"
                },
                "16f07e8ed7225f07912da48e0d51308e8fbf9dafc89d8accaa58abc1da8a2832a046082bfc2534eb4933a00bd673019cb90437c8a94cc0d0adaf9cff40c5083b": {
                    execute: false,
                    name: "E:\\deviceLocal",
                    readOnly: false,
                    type: "directory"
                },
                "2772fe10a1f1efe6a34c01408dc6bf51fa43ba657c72cff9f77c02a96eb61490b995325330a1b954e1e8e6e55d87003840e65c223e1e465d1a30486dfdef1211": {
                    execute: false,
                    name: "C:\\deviceLocal\\notes.pdf",
                    readOnly: true,
                    type: "file"
                }
            }
        },
        "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e": {
            ip: "::1",
            name: "test device laptop",
            port: 0,
            shares: {
                "ccd7be8a1603ae4ca8d39f142e538c18fa16b157ce8f315a0f8a66060b3fbe71fa429bc309c964e8b8ce6c7cf699b4802777a99b5c961e8419ae24d6bfaf241b": {
                    execute: false,
                    name: "C:\\mp3\\deviceLaptop",
                    readOnly: true,
                    type: "directory"
                },
                "1a36a5c57a86e6015aff4a2888d1e399d7a8b74d306952f01243822f84812174224feee82760d90883b300cb3848f2ef4c41cc00a703101b47b314c6af5894ee": {
                    execute: false,
                    name: "E:\\deviceLaptop",
                    readOnly: false,
                    type: "directory"
                },
                "0d8e80125088946594d6d80070e833b978a466e9789504e51c67462d09133f33994d0ea06cf9006d4d7fc651a5adceab72b6b80797166288458cfb53d021dbc6": {
                    execute: false,
                    name: "C:\\deviceLaptop\\notes.pdf",
                    readOnly: true,
                    type: "file"
                }
            }
        }
    };
    serverVars.hashDevice = "89dd9677902964305274242975a060cdb3251ea8d74a53e1bf5d3d9f8e5508e9b1412bfe624f6251b0d826004a62ea2bafef680c0c43a4b348900173f352b0da";
    serverVars.hashUser = "8aacedad1ca13c7e41a6cdc41b935d23484b58e35ef5b1ad9afaffe7ca338558a4fd5670e3270412a53608f56c854617191490d394dfeade683d220148d04013";
    serverVars.nameDevice = "test local device";
    serverVars.nameUser = "test local user";
    serverVars.user = {};
    const projectPath:string = vars.projectPath,
        windowsPath:string = projectPath.replace(/\\/g, "\\\\"),
        windowsSep:string = vars.sep.replace(/\\/g, "\\\\"),
        hash:string = "622d3d0c8cb85c227e6bad1c99c9cd8f9323c8208383ece09ac58e713c94c34868f121de6e58e358de00a41f853f54e4ef66e6fe12a86ee124f7e452dbe89800",

        // start test list
        service:testServiceArray = [
            (function test_service_fsBase64_Local():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsBase64_RemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsClose_Local():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsClose_RemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsCopy_LocalToLocal():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsCopy_LocalToRemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsCopy_RemoteDeviceToLocal():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsCopy_RemoteDeviceToSameRemoteDevice1():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsCopy_RemoteDeviceToSameRemoteDevice2():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsCopy_RemoteDeviceToSameRemoteDevice3():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsDetails_Local():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsDetails_RemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsNewDirectory_Local():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsNewFile_Local():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsNewDirectory_RemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsNewFile_RemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsWrite_Local():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsWrite_RemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsRead_Local():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsRead_RemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsRenameDirectory_Local():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsRenameFile_Local():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsRenameDirectory_RemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsRenameFile_RemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsDestroyDirectory_Local():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsDestroyFile_Local():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsDestroyDirectory_RemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsDestroyFile_RemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsHash_Local():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsHash_RemoteDevice():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsDirectory_Local1():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsDirectory_Local2():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsDirectory_RemoteDevice1():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsDirectory_RemoteDevice2():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsSearch_Local1():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsSearch_Local2():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsSearch_RemoteDevice1():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsSearch_RemoteDevice2():testTemplateFileService {
                const template:testTemplateFileService = {
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
                };
                return template;
            }()),
            (function test_service_fsUpdate_RemoteDevice():testTemplateUpdateRemote {
                const template:testTemplateUpdateRemote = {
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
                    test: `Received directory watch for {"fs-update-remote":{"agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","dirs":[["${windowsPath}storage${windowsSep}storage.txt","file","",0,0,"stat"]],"fail":[],"location":"${windowsPath}storage","status":"test payload"}} at ${serverVars.addresses[0][1][1]}.`
                };
                return template;
            }()),
            (function test_service_settings():testTemplateSettings {
                const template:testTemplateSettings = {
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
                };
                return template;
            }()),
            (function test_service_settings():testTemplateMessages {
                const template:testTemplateMessages = {
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
                };
                return template;
            }()),
            (function test_service_device():testTemplateDevice {
                const template:testTemplateDevice = {
                    command: {
                        device: {
                            [serverVars.hashDevice]: {
                                ip: "::1",
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
                };
                return template;
            }()),
            (function test_service_user():testTemplateUser {
                const template:testTemplateUser = {
                    command: {
                        user: {
                            [serverVars.hashDevice]: {
                                ip: "::1",
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
                };
                return template;
            }()),
            (function test_service_inviteStart_Device():testTemplateInvite {
                const template:testTemplateInvite = {
                    command: {
                        invite: {
                            action: "invite",
                            deviceHash: serverVars.hashDevice,
                            deviceName: "old desktop computer",
                            message: "Hello",
                            name: "",
                            ip: "::1",
                            modal: "test-modal",
                            port: 80,
                            shares: {
                                [serverVars.hashDevice]: {
                                    ip: "::1",
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
                    test: "Invitation received at start terminal XXXX from start browser. Sending invitation to remote terminal: ::1."
                };
                return template;
            }()),
            (function test_service_inviteRequest_Device():testTemplateInvite {
                const template:testTemplateInvite = {
                    command: {
                        invite: {
                            action: "invite-request",
                            deviceHash: serverVars.hashDevice,
                            deviceName: "old desktop computer",
                            message: "Hello",
                            name: "",
                            ip: "::1",
                            modal: "test-modal",
                            port: 80,
                            shares: {
                                [serverVars.hashDevice]: {
                                    ip: "::1",
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
                    test: "Invitation received at remote terminal ::1 and sent to remote browser."
                };
                return template;
            }()),
            (function test_service_inviteResponse_Device():testTemplateInvite {
                const template:testTemplateInvite = {
                    command: {
                        invite: {
                            action: "invite-response",
                            deviceHash: serverVars.hashDevice,
                            deviceName: "old desktop computer",
                            message: "Hello",
                            name: "",
                            ip: "::1",
                            modal: "test-modal",
                            port: 80,
                            shares: {
                                [serverVars.hashDevice]: {
                                    ip: "::1",
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
                    test: "Ignored invitation response processed at remote terminal ::1 and sent to start terminal."
                };
                return template;
            }()),
            (function test_service_inviteResponseAccepted_Device():testTemplateInvite {
                const template:testTemplateInvite = {
                    command: {
                        invite: {
                            action: "invite-response",
                            deviceHash: serverVars.hashDevice,
                            deviceName: "old desktop computer",
                            message: "Hello",
                            name: "",
                            ip: "::1",
                            modal: "test-modal",
                            port: 80,
                            shares: {
                                [serverVars.hashDevice]: {
                                    ip: "::1",
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
                    test: "Accepted invitation response processed at remote terminal ::1 and sent to start terminal."
                };
                return template;
            }()),
            (function test_service_inviteResponseIgnored_Device():testTemplateInvite {
                const template:testTemplateInvite = {
                    command: {
                        invite: {
                            action: "invite-response",
                            deviceHash: serverVars.hashDevice,
                            deviceName: "old desktop computer",
                            message: "Hello",
                            name: "",
                            ip: "::1",
                            modal: "test-modal",
                            port: 80,
                            shares: {
                                [serverVars.hashDevice]: {
                                    ip: "::1",
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
                    test: "Ignored invitation response processed at remote terminal ::1 and sent to start terminal."
                };
                return template;
            }()),
            (function test_service_inviteResponseDeclined_Device():testTemplateInvite {
                const template:testTemplateInvite = {
                    command: {
                        invite: {
                            action: "invite-response",
                            deviceHash: serverVars.hashDevice,
                            deviceName: "old desktop computer",
                            message: "Hello",
                            name: "",
                            ip: "::1",
                            modal: "test-modal",
                            port: 80,
                            shares: {
                                [serverVars.hashDevice]: {
                                    ip: "::1",
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
                    test: "Declined invitation response processed at remote terminal ::1 and sent to start terminal."
                };
                return template;
            }()),
            (function test_service_inviteCompleteAccepted_Device():testTemplateInvite {
                const template:testTemplateInvite = {
                    command: {
                        invite: {
                            action: "invite-complete",
                            deviceHash: serverVars.hashDevice,
                            deviceName: "old desktop computer",
                            message: "Hello",
                            name: "",
                            ip: "::1",
                            modal: "test-modal",
                            port: 80,
                            shares: {
                                [serverVars.hashDevice]: {
                                    ip: "::1",
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
                };
                return template;
            }()),
            (function test_service_inviteCompleteIgnored_Device():testTemplateInvite {
                const template:testTemplateInvite = {
                    command: {
                        invite: {
                            action: "invite-complete",
                            deviceHash: serverVars.hashDevice,
                            deviceName: "old desktop computer",
                            message: "Hello",
                            name: "",
                            ip: "::1",
                            modal: "test-modal",
                            port: 80,
                            shares: {
                                [serverVars.hashDevice]: {
                                    ip: "::1",
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
                    name: "invite, invite-complete - Local user invite complete, ignored",
                    qualifier: "is",
                    test: "Ignored invitation sent to from start terminal XXXX to start browser."
                };
                return template;
            }()),
            (function test_service_heartbeatBrowser_Device():testTemplateHeartbeat {
                const template:testTemplateHeartbeat = {
                    command: {
                        heartbeat: {
                            agent: "localhost-browser",
                            agentType: "device",
                            shares: {
                                [serverVars.hashDevice]: {
                                    ip: "::1",
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
                            status: "active",
                            user: serverVars.hashDevice
                        }
                    },
                    name: "heartbeat, from Browser",
                    qualifier: "is",
                    test: {
                        "heartbeat-response": {
                            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                            agentType: "device",
                            shares: {},
                            status: "idle",
                            user: serverVars.nameUser
                        }
                    }
                };
                return template;
            }()),
            (function test_service_heartbeatTerminal_Device():testTemplateHeartbeat {
                const template:testTemplateHeartbeat = {
                    command: {
                        heartbeat: {
                            agent: "localhost-terminal",
                            agentType: "device",
                            shares: {
                                [serverVars.hashDevice]: {
                                    ip: "::1",
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
                            status: "active",
                            user: serverVars.hashDevice
                        }
                    },
                    name: "heartbeat, from Terminal",
                    qualifier: "is",
                    test: {
                        "heartbeat-response": {
                            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                            agentType: "device",
                            shares: {},
                            status: "idle",
                            user: serverVars.nameUser
                        }
                    }
                };
                return template;
            }()),
            (function test_service_heartbeatUnexpectedUser_Device():testTemplateHeartbeat {
                const template:testTemplateHeartbeat = {
                    command: {
                        heartbeat: {
                            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                            agentType: "device",
                            shares: {
                                [serverVars.hashDevice]: {
                                    ip: "::1",
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
                            status: "active",
                            user: serverVars.hashDevice
                        }
                    },
                    name: "heartbeat, Unexpected User",
                    qualifier: "is",
                    test: "Unexpected user."
                };
                return template;
            }())
            // todo: fs - readonly tests
            // todo: user tests
        ];
    service.addServers = function test_services_addServers(callback:Function):void {
        const complete = function test_services_addServers_complete(counts:agentCounts):void {
                counts.count = counts.count + 1;
                if (counts.count === counts.total) {
                    callback();
                }
            };
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
                    serverVars[output.agentType][output.agent].ip = "::1";
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
    return service;
};

export default services;