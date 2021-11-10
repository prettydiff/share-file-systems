
/* lib/terminal/test/samples/service - A list of service tests. */

import filePathEncode from "../application/browserUtilities/file_path_encode.js";
import serverVars from "../../server/serverVars.js";

const serviceTests = function terminal_test_samples_services():testService[] {
    const service:testService[] = [],
        base64:string = "ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAiYWx3YXlzU3RyaWN0IjogdHJ1ZSwKICAgICAgICAibW9kdWxlUmVzb2x1dGlvbiI6ICJub2RlIiwKICAgICAgICAib3V0RGlyIjogImpzIiwKICAgICAgICAibm9JbXBsaWNpdEFueSI6IHRydWUsCiAgICAgICAgInByZXR0eSI6IHRydWUsCiAgICAgICAgInN0cmljdEZ1bmN0aW9uVHlwZXMiOiB0cnVlLAogICAgICAgICJ0YXJnZXQiOiAiRVMyMDIwIiwKICAgICAgICAidHlwZXMiOiBbIm5vZGUiXSwKICAgICAgICAidHlwZVJvb3RzIjogWyJub2RlX21vZHVsZXMvQHR5cGVzIl0KICAgIH0sCiAgICAiZXhjbHVkZSI6IFsKICAgICAgICAianMiLAogICAgICAgICJsaWIvdGVybWluYWwvdGVzdC9zdG9yYWdlQnJvd3NlciIsCiAgICAgICAgIioqL25vZGVfbW9kdWxlcyIsCiAgICAgICAgIioqLy4qLyIKICAgIF0sCiAgICAiaW5jbHVkZSI6IFsKICAgICAgICAiKiovKi50cyIKICAgIF0KfQ==",
        hash:string = "8083e63a4e5cf38fe24ca2cf474949180ad9335f59659505fa2b8ad321a09a04628889367ecae5794969c977f0f1c462105595f5a61d8f929f68ddfff75c3a9f",
        loopback:string = "127.0.0.1";

    service.push({
        command: {
            data: {
                action: "fs-base64",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
                name: "",
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-base64, Base 64 Local",
        qualifier: "is",
        test: {
            data: [{
                content: base64,
                id: "some-modal-id",
                path: filePathEncode("absolute", "tsconfig.json")
            }],
            service: "fs"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-base64",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
                name: ""
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-base64, Base 64 Remote Device",
        qualifier: "is",
        test: {
            data: [{
                content: base64,
                id: "some-modal-id",
                path: filePathEncode("absolute", "tsconfig.json")
            }],
            service: "fs"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-close",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "lib")],
                name: ""
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-close, Close Local",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-close",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "lib")],
                name: ""
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-close, Close Remote Device",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
            data: {
                action: "copy-request",
                agentSource: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                agentWrite: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    type: "device"
                },
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "tsconfig.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy Local to Local",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "lib/settings", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":`
    });
    service.push({
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
            data: {
                action: "copy-request",
                agentSource: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                agentWrite: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    type: "device"
                },
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "tsconfig.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy Local to Remote Device",
        qualifier: "ends",
        test: "\"message\":\"Copying XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\"},\"service\":\"fs\"}"
    });
    service.push({
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
            data: {
                action: "copy-request",
                agentSource: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                agentWrite: {
                    id:  serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    type: "device"
                },
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "tsconfig.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy Remote Device to Local",
        qualifier: "ends",
        test: "\"message\":\"Copying XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\"},\"service\":\"fs\"}"
    });
    service.push({
        command: {
            data: {
                action: "copy-request",
                agentSource: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                agentWrite: {
                    id: "fa042a71aee124b7b667d97fd84c0a309e72aefcae5d95762bc05d39cbeedae88122758f8625910a669271251d5f561a1c2749c6d66664f5d35dcc8c608c1a89",
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    type: "device"
                },
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "version.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy from Remote Device to different Remote Device",
        qualifier: "ends",
        test:  "\"message\":\"Copying XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\"},\"service\":\"fs\"}"
    });
    service.push({
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
            data: {
                action: "copy-request",
                agentSource: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                agentWrite: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    type: "device"
                },
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "tsconfig.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy Remote Device to Same Remote Device 1",
        qualifier: "ends",
        test: "\"message\":\"Copying XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\"},\"service\":\"copy\"}"
    });
    service.push({
        command: {
            data: {
                action: "fs-details",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "tsconfig.json")],
                name: "test-ID"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-details, Details of Local tsconfig.json",
        qualifier: "is",
        test: {
            data: {
                dirs: [
                    [filePathEncode("absolute", "tsconfig.json"), "file", "", 0, 0, null]
                ],
                id: "test-ID"
            },
            service: "fs"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-details",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "tsconfig.json")],
                name: "test-ID"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-details, Details of Remote Device tsconfig.json",
        qualifier: "is",
        test: {
            data: {
                dirs: [
                    [filePathEncode("absolute", "tsconfig.json"), "file", "", 0, 0, null]
                ],
                id: "test-ID"
            },
            service: "fs"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-new",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestLocal")],
                name: "directory"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-new, Local New Directory",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-new",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestLocal.json")],
                name: "file"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-new, Local New File",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-new",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestRemote")],
                name: "directory"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-new, Remote Device New Directory",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-new",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [`${filePathEncode("absolute", "serviceTestRemote.json")}`],
                name: "file"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-new, Remote Device New File",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-write",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestLocal.json")],
                name: "local test fragment"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-write, Write Local",
        qualifier: "begins",
        test: "{\"data\":[{\"content\":\"Saved to disk!\""
    });
    service.push({
        command: {
            data: {
                action: "fs-write",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestRemote.json")],
                name: "remote device text fragment"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-write, Write Remote Device to Local",
        qualifier: "begins",
        test: "{\"data\":[{\"content\":\"Saved to disk!\""
    });
    service.push({
        command: {
            data: {
                action: "fs-read",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [`new-window-id:${filePathEncode("absolute", "serviceTestLocal.json")}`],
                name: ""
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-read, Read Local",
        qualifier: "begins",
        test: `{"data":[{"content":"local test fragment","id":"new-window-id","path":"${filePathEncode("absolute", "serviceTestLocal.json", true)}"}]`
    });
    service.push({
        command: {
            data: {
                action: "fs-read",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [`new-window-id:${filePathEncode("absolute", "serviceTestRemote.json")}`],
                name: ""
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-read, Read Remote Device",
        qualifier: "begins",
        test: `{"data":[{"content":"remote device text fragment","id":"new-window-id","path":"${filePathEncode("absolute", "serviceTestRemote.json", true)}"}]`
    });
    service.push({
        command: {
            data: {
                action: "fs-rename",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestLocal")],
                name: "serviceLocal"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-rename, Rename Local Directory",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-rename",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestLocal.json")],
                name: "serviceLocal.json"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-rename, Rename Local File",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-rename",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestRemote")],
                name: "serviceRemote"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-rename, Rename Remote Device Directory",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-rename",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestRemote.json")],
                name: "serviceRemote.json"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-rename, Rename Remote Device File",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-destroy",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceLocal")],
                name: ""
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-destroy, Destroy Local Directory",
        qualifier: "not contains",
        test: "serviceLocal\",\"directory\""
    });
    service.push({
        command: {
            data: {
                action: "fs-destroy",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceLocal.json")],
                name: ""
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-destroy, Destroy Local File",
        qualifier: "not contains",
        test: "serviceLocal.json"
    });
    service.push({
        command: {
            data: {
                action: "fs-destroy",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceRemote")],
                name: ""
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-destroy, Destroy Remote Device Directory",
        qualifier: "not contains",
        test: "serviceRemote\",\"directory\""
    });
    service.push({
        command: {
            data: {
                action: "fs-destroy",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceRemote.json")],
                name: ""
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-destroy, Destroy Remote Device File",
        qualifier: "not contains",
        test: {
            address: "test-ID",
            agent: serverVars.hashDevice,
            agentType: "device",
            fileList: null,
            message: "serviceRemote.json"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-hash",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
                name: ""
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-hash, Hash Local",
        qualifier: "is",
        test: {
            data: [{
                content: hash,
                id: "some-modal-id",
                path: filePathEncode("absolute", "tsconfig.json")
            }],
            service: "fs"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-hash",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 1,
                location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
                name: ""
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-hash, Hash Remote Device",
        qualifier: "is",
        test: {
            data: [{
                content: hash,
                id: "some-modal-id",
                path: filePathEncode("absolute", "tsconfig.json")
            }],
            service: "fs"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-directory",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 2,
                location: [filePathEncode("absolute", "js/lib")],
                name: ".js"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-directory, Directory Local 1",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "js/lib", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-directory",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 2,
                location: [filePathEncode("absolute", "tsconfig.json")],
                name: ".js"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-directory, Directory Local 2",
        qualifier: "contains",
        test: `["${filePathEncode("absolute", "tsconfig.json", true)}","file"`
    });
    service.push({
        command: {
            data: {
                action: "fs-directory",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 2,
                location: [filePathEncode("absolute", "tsconfig.json")],
                name: ".js"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-directory, Directory Remote Device 1",
        qualifier: "is",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "tsconfig.json", true)}","file","",0,0,null]],"message":"0 directories, XXXX file, XXXX symbolic links, XXXX errors"},"service":"fs"}`
    });
    service.push({
        command: {
            data: {
                action: "fs-directory",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 2,
                location: [filePathEncode("absolute", "tsconfig.json")],
                name: ".js"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-directory, Directory Remote Device 2",
        qualifier: "contains",
        test: `["${filePathEncode("absolute", "tsconfig.json", true)}","file"`
    });
    service.push({
        command: {
            data: {
                action: "fs-search",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 0,
                location: [filePathEncode("absolute", "")],
                name: ".js"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-search, Search Local 1",
        qualifier: "not contains",
        test: ".ts"
    });
    service.push({
        command: {
            data: {
                action: "fs-search",
                agent: {
                    id: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 0,
                location: [filePathEncode("absolute", "")],
                name: ".js"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-search, Search Local 2",
        qualifier: "contains",
        test: `["${filePathEncode("absolute", "js/lib/browser/fileBrowser.js", true)}","file"`
    });
    service.push({
        command: {
            data: {
                action: "fs-search",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 0,
                location: [filePathEncode("absolute", "")],
                name: ".js"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-search, Search Remote Device 1",
        qualifier: "not contains",
        test: ".ts"
    });
    service.push({
        command: {
            data: {
                action: "fs-search",
                agent: {
                    id: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    type: "device"
                },
                depth: 0,
                location: [filePathEncode("absolute", "")],
                name: ".js"
            } as service_fileSystem,
            service: "fs"
        },
        name: "fs-search, Search Remote Device 2",
        qualifier: "contains",
        test: `["${filePathEncode("absolute", "js/lib/browser/fileBrowser.js", true)}","file"`
    });
    service.push({
        command: {
            data: {
                settings: {
                    [serverVars.hashDevice]: {
                        ipAll: {
                            IPv4: [loopback],
                            IPv6: []
                        },
                        ipSelected: loopback,
                        name: "local device name",
                        ports: {
                            http: 443,
                            ws: 0
                        },
                        shares: {
                            [serverVars.hashDevice]: {
                                execute: false,
                                name: "C:\\mp3",
                                readOnly: false,
                                type: "directory"
                            }
                        }
                    }
                } as agents,
                type: "device"
            } as service_settings,
            service: "settings"
        },
        name: "settings device, Local device settings without HTTP response",
        qualifier: "is",
        test: "device settings written"
    });
    service.push({
        command: {
            data: {
                settings: [{
                    agentFrom: "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594",
                    agentTo: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                    agentType: "device",
                    date: 1616070795053,
                    message: "text message"
                }] as service_message,
                type: "message"
            } as service_settings,
            service: "settings"
        },
        name: "settings message, Local message settings without HTTP response",
        qualifier: "is",
        test: "message settings written"
    });
    service.push({
        command: {
            data: {
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
                        "configuration-modal": {
                            agent: serverVars.hashDevice,
                            agentType: "device",
                            content: null,
                            inputs: [
                                "close", "maximize", "minimize"
                            ],
                            read_only: false,
                            single: true,
                            status: "hidden",
                            title: "<span class=\"icon-settings\">⚙</span> Settings",
                            type: "configuration",
                            width: 800,
                            zIndex: 1,
                            id: "configuration-modal",
                            left: 200,
                            top: 200,
                            height: 400
                        },
                    },
                    modalTypes: [
                        "configuration", "fileNavigate", "invite-request"
                    ],
                    nameDevice: "this device name",
                    nameUser: "local user name",
                    storage: filePathEncode("absolute", "lib/storage"),
                    tutorial: false,
                    zIndex: 6
                },
                type: "configuration"
            } as service_settings,
            service: "settings"
        },
        name: "settings, Local settings without HTTP response",
        qualifier: "is",
        test: "configuration settings written"
    });
    service.push({
        command: {
            data: {
                settings: {
                    [serverVars.hashDevice]: {
                        ipAll: {
                            IPv4: [loopback],
                            IPv6: []
                        },
                        ipSelected: loopback,
                        name: "remote user name",
                        ports: {
                            http: 443,
                            ws: 0
                        },
                        shares: {
                            [serverVars.hashDevice]: {
                                execute: false,
                                name: "C:\\movies",
                                readOnly: false,
                                type: "directory"
                            }
                        }
                    }
                } as agents,
                type: "user"
            } as service_settings,
            service: "settings"
        },
        name: "settings user, Local user settings without HTTP response",
        qualifier: "is",
        test: "user settings written"
    });
    service.push({
        command: {
            data: {
                action: "invite-request",
                deviceHash: serverVars.hashDevice,
                deviceName: "old desktop computer",
                ipAll: {
                    IPv4: [loopback],
                    IPv6: []
                },
                ipSelected: loopback,
                message: "Hello",
                modal: "test-modal",
                ports: {
                    http: 443,
                    ws: 0
                },
                shares: serverVars.device,
                status: "invited",
                type: "device",
                userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                userName: "local user name"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-request - Local device invite",
        qualifier: "contains",
        test: "Accepted invitation. Request processed at remote terminal XXXX for type device.  Agent already present, so auto accepted and returned to start terminal."
    });
    service.push({
        command: {
            data: {
                action: "invite-response",
                deviceHash: serverVars.hashDevice,
                deviceName: "old desktop computer",
                ipAll: {
                    IPv4: [loopback],
                    IPv6: []
                },
                ipSelected: loopback,
                message: "Hello",
                modal: "test-modal",
                ports: {
                    http: 443,
                    ws: 0
                },
                shares: serverVars.device,
                status: "invited",
                type: "device",
                userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                userName: "local user name"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-response - Local device invite",
        qualifier: "contains",
        test: "Ignored invitation response processed at remote terminal XXXX and sent to start terminal."
    });
    service.push({
        command: {
            data: {
                action: "invite-response",
                deviceHash: serverVars.hashDevice,
                deviceName: "old desktop computer",
                ipAll: {
                    IPv4: [loopback],
                    IPv6: []
                },
                ipSelected: loopback,
                message: "Hello",
                modal: "test-modal",
                ports: {
                    http: 443,
                    ws: 0
                },
                shares: serverVars.device,
                status: "accepted",
                type: "device",
                userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                userName: "local user name"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-response - Local device invite response, accepted",
        qualifier: "contains",
        test: "Accepted invitation response processed at remote terminal XXXX and sent to start terminal."
    });
    service.push({
        command: {
            data: {
                action: "invite-response",
                deviceHash: serverVars.hashDevice,
                deviceName: "old desktop computer",
                ipAll: {
                    IPv4: [loopback],
                    IPv6: []
                },
                ipSelected: loopback,
                message: "Hello",
                modal: "test-modal",
                ports: {
                    http: 443,
                    ws: 0
                },
                shares: serverVars.device,
                status: "invited",
                type: "device",
                userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                userName: "local user name"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-response - Local device invite response, ignored",
        qualifier: "contains",
        test: "Ignored invitation response processed at remote terminal XXXX and sent to start terminal."
    });
    service.push({
        command: {
            data: {
                action: "invite-response",
                deviceHash: serverVars.hashDevice,
                deviceName: "old desktop computer",
                ipAll: {
                    IPv4: [loopback],
                    IPv6: []
                },
                ipSelected: loopback,
                message: "Hello",
                modal: "test-modal",
                ports: {
                    http: 443,
                    ws: 0
                },
                shares: serverVars.device,
                status: "declined",
                type: "device",
                userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                userName: "local user name"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-response - Local device invite response, declined",
        qualifier: "contains",
        test: "Declined invitation response processed at remote terminal XXXX and sent to start terminal."
    });
    service.push({
        command: {
            data: {
                action: "invite-complete",
                deviceHash: serverVars.hashDevice,
                deviceName: "old desktop computer",
                ipAll: {
                    IPv4: [loopback],
                    IPv6: []
                },
                ipSelected: loopback,
                message: "Hello",
                modal: "test-modal",
                ports: {
                    http: 443,
                    ws: 0
                },
                shares: serverVars.device,
                status: "accepted",
                type: "device",
                userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                userName: "local user name"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-complete - Local user invite complete, accepted",
        qualifier: "contains",
        test: "Accepted invitation returned to XXXX from this local terminal and to the local browser(s)."
    });
    service.push({
        command: {
            data: {
                action: "invite-complete",
                deviceHash: serverVars.hashDevice,
                deviceName: "old desktop computer",
                ipAll: {
                    IPv4: [loopback],
                    IPv6: []
                },
                ipSelected: loopback,
                message: "Hello",
                modal: "test-modal",
                ports: {
                    http: 443,
                    ws: 0
                },
                shares: serverVars.device,
                status: "invited",
                type: "device",
                userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                userName: "local user name"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-complete - Local user invite complete, ignored",
        qualifier: "contains",
        test: "Ignored invitation returned to XXXX from this local terminal and to the local browser(s)."
    });
    service.push({
        command: {
            data: {
                action: "update",
                agentFrom: "localhost-browser",
                agentTo: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                agentType: "device",
                deviceData: {
                    "cpuCores": "1",
                    "cpuID": "",
                    "memTotal": 0,
                    "osName": "",
                    "osType": "",
                    "osUptime": 0,
                    "platform": ""
                },
                broadcastList: null,
                shares: {},
                shareType: "device",
                status: "active"
            } as service_heartbeat,
            service: "heartbeat"
        },
        name: "heartbeat-broadcast, from Browser",
        qualifier: "ends",
        test: ",\"service\":\"heartbeat\"}"
    });
    service.push({
        command: {
            data: {
                action: "update",
                agentFrom: "localhost-terminal",
                agentTo: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                agentType: "device",
                deviceData: {
                    "cpuCores": "1",
                    "cpuID": "",
                    "memTotal": 0,
                    "osName": "",
                    "osType": "",
                    "osUptime": 0,
                    "platform": ""
                },
                broadcastList: null,
                shares: {},
                shareType: "device",
                status: "active"
            } as service_heartbeat,
            service: "heartbeat"
        },
        name: "heartbeat-broadcast, from Terminal",
        qualifier: "ends",
        test: ",\"service\":\"heartbeat\"}"
    });
    service.push({
        command: {
            data: {
                action: "complete",
                agentFrom: serverVars.hashDevice,
                agentTo: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                agentType: "device",
                shares: serverVars.device,
                shareType: "device",
                status: "active"
            } as service_heartbeat,
            service: "heartbeat"
        },
        name: "heartbeat complete",
        qualifier: "is",
        test: {
            data: {
                action: "complete",
                agentFrom: "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594",
                agentTo: "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594",
                agentType: "device",
                shares: {},
                shareType: "device",
                status: "active"
            },
            service: "heartbeat"
        }
    });
    service.push({
        command: {
            data: {
                action: "complete",
                agentFrom: serverVars.hashDevice,
                agentTo: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                agentType: "device",
                shares: {
                    "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594": {
                        "deviceData": {
                            "cpuCores": 1,
                            "cpuID": "",
                            "memTotal": 0,
                            "osVersion": "",
                            "osType": "",
                            "platform": ""
                        },
                        "ipAll": {
                            "IPv4": [loopback],
                            "IPv6": []
                        },
                        "ipSelected": loopback,
                        "name"  : "test local device",
                        "ports"  : {
                            "http": 0,
                            "ws": 0
                        },
                        "shares": {
                            "a89e4ac7eec0c4b557aab68ad7499dd136d21d8eb2e5f51a6973dcf5f854b9a1895bec63f3a9d1b5e6243524e6bb8bc29d34c9741c1fc7fc77a7f0e8a934d153": {
                                "execute" : false,
                                "name"    : "C:\\mp3\\deviceLocal",
                                "readOnly": true,
                                "type"    : "directory"
                            },
                            "16f07e8ed7225f07912da48e0d51308e8fbf9dafc89d8accaa58abc1da8a2832a046082bfc2534eb4933a00bd673019cb90437c8a94cc0d0adaf9cff40c5083b": {
                                "execute" : false,
                                "name"    : "E:\\deviceLocal",
                                "readOnly": false,
                                "type"    : "directory"
                            },
                            "2772fe10a1f1efe6a34c01408dc6bf51fa43ba657c72cff9f77c02a96eb61490b995325330a1b954e1e8e6e55d87003840e65c223e1e465d1a30486dfdef1211": {
                                "execute" : false,
                                "name"    : "C:\\deviceLocal\\notes.pdf",
                                "readOnly": true,
                                "type"    : "file"
                            }
                        },
                        "status": "active"
                    },
                    "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e": {
                        "deviceData": {
                            "cpuCores": 1,
                            "cpuID": "",
                            "memTotal": 0,
                            "osVersion": "",
                            "osType": "",
                            "platform": ""
                        },
                        "ipAll": {
                            "IPv4": [loopback],
                            "IPv6": []
                        },
                        "ipSelected": loopback,
                        "name"  : "test device laptop",
                        "ports"  : {
                            "http": 0,
                            "ws": 0
                        },
                        "shares": {
                            "ccd7be8a1603ae4ca8d39f142e538c18fa16b157ce8f315a0f8a66060b3fbe71fa429bc309c964e8b8ce6c7cf699b4802777a99b5c961e8419ae24d6bfaf241b": {
                                "execute" : false,
                                "name"    : "C:\\mp3\\deviceLaptop",
                                "readOnly": false,
                                "type"    : "directory"
                            },
                            "1a36a5c57a86e6015aff4a2888d1e399d7a8b74d306952f01243822f84812174224feee82760d90883b300cb3848f2ef4c41cc00a703101b47b314c6af5894ee": {
                                "execute" : false,
                                "name"    : "E:\\deviceLaptop",
                                "readOnly": false,
                                "type"    : "directory"
                            },
                            "0d8e80125088946594d6d80070e833b978a466e9789504e51c67462d09133f33994d0ea06cf9006d4d7fc651a5adceab72b6b80797166288458cfb53d021dbc6": {
                                "execute" : false,
                                "name"    : "C:\\deviceLaptop\\notes.pdf",
                                "readOnly": true,
                                "type"    : "file"
                            }
                        },
                        "status": "active"
                    },
                    "fa042a71aee124b7b667d97fd84c0a309e72aefcae5d95762bc05d39cbeedae88122758f8625910a669271251d5f561a1c2749c6d66664f5d35dcc8c608c1a89": {
                        "deviceData": {
                            "cpuCores": 1,
                            "cpuID": "",
                            "memTotal": 0,
                            "osVersion": "",
                            "osType": "",
                            "platform": ""
                        },
                        "ipAll": {
                            "IPv4": [loopback],
                            "IPv6": []
                        },
                        "ipSelected": loopback,
                        "name"  : "test device desktop",
                        "ports"  : {
                            "http": 0,
                            "ws": 0
                        },
                        "shares": {
                            "36b0d1a2ddc81858b0339d3296b4f69513b779a122ec279ea71a1cb50231952e5f5ba9197c6438e91cd3d8bd6b3d5feee78ce4fd0e4386abe3af0487449a02d7": {
                                "execute" : false,
                                "name"    : "C:\\mp3\\deviceDesktop",
                                "readOnly": true,
                                "type"    : "directory"
                            },
                            "71f79d5cc211b5fa52f95a33ad9aaa4b6bf3ad3951ac06365ee316e5f4da70811fd3ed8fa585024009683cf83e40fd31211b1a36324dfc79148d12dea16fbcef": {
                                "execute" : false,
                                "name"    : "E:\\deviceDesktop",
                                "readOnly": false,
                                "type"    : "directory"
                            },
                            "768b031d795208e4adca58a4908161e77d61132c3e6ef5a76960fcd51b05f1e96ada60af01b3a9561f5c061a6e9dabc311e9970853b8b5ce0c1f0966b02315e7": {
                                "execute" : false,
                                "name"    : "C:\\deviceDesktop\\notes.pdf",
                                "readOnly": true,
                                "type"    : "file"
                            }
                        },
                        "status": "active"
                    }
                },
                shareType: "device",
                status: "active"
            } as service_heartbeat,
            service: "heartbeat"
        },
        name: "heartbeat complete with share change",
        qualifier: "is",
        test: {
            data: {
                action: "complete",
                agentFrom: "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594",
                agentTo: "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594",
                agentType: "device",
                shares: {},
                shareType: "device",
                status: "active"
            },
            service: "heartbeat"
        }
    });
    return service;
};

export default serviceTests;