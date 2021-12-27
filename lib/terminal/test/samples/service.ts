
/* lib/terminal/test/samples/service - A list of service tests. */

import filePathEncode from "../application/browserUtilities/file_path_encode.js";
import serverVars from "../../server/serverVars.js";

const serviceTests = function terminal_test_samples_services():testService[] {
    const service:testService[] = [],
        base64:string = "ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAiYWx3YXlzU3RyaWN0IjogdHJ1ZSwKICAgICAgICAibW9kdWxlUmVzb2x1dGlvbiI6ICJub2RlIiwKICAgICAgICAib3V0RGlyIjogImpzIiwKICAgICAgICAibm9JbXBsaWNpdEFueSI6IHRydWUsCiAgICAgICAgInByZXR0eSI6IHRydWUsCiAgICAgICAgInN0cmljdEZ1bmN0aW9uVHlwZXMiOiB0cnVlLAogICAgICAgICJ0YXJnZXQiOiAiRVMyMDIwIiwKICAgICAgICAidHlwZXMiOiBbIm5vZGUiXSwKICAgICAgICAidHlwZVJvb3RzIjogWyJub2RlX21vZHVsZXMvQHR5cGVzIl0KICAgIH0sCiAgICAiZXhjbHVkZSI6IFsKICAgICAgICAianMiLAogICAgICAgICJsaWIvdGVybWluYWwvdGVzdC9zdG9yYWdlQnJvd3NlciIsCiAgICAgICAgIioqL25vZGVfbW9kdWxlcyIsCiAgICAgICAgIioqLy4qLyIKICAgIF0sCiAgICAiaW5jbHVkZSI6IFsKICAgICAgICAiKiovKi50cyIKICAgIF0KfQ==",
        hash:string = "8083e63a4e5cf38fe24ca2cf474949180ad9335f59659505fa2b8ad321a09a04628889367ecae5794969c977f0f1c462105595f5a61d8f929f68ddfff75c3a9f",
        hashUser:string = "8aacedad1ca13c7e41a6cdc41b935d23484b58e35ef5b1ad9afaffe7ca338558a4fd5670e3270412a53608f56c854617191490d394dfeade683d220148d04013",
        remoteDevice1:string = "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
        remoteDevice2:string = "fa042a71aee124b7b667d97fd84c0a309e72aefcae5d95762bc05d39cbeedae88122758f8625910a669271251d5f561a1c2749c6d66664f5d35dcc8c608c1a89",
        loopback:string = "127.0.0.1";

    service.push({
        command: {
            data: {
                action: "fs-base64",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
                name: "",
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-base64, Base 64 Local",
        qualifier: "is",
        test: {
            data: [{
                content: base64,
                id: "some-modal-id",
                path: filePathEncode("absolute", "tsconfig.json")
            }],
            service: "string-generate"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-base64",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-base64, Base 64 Remote Device",
        qualifier: "is",
        test: {
            data: [{
                content: base64,
                id: "some-modal-id",
                path: filePathEncode("absolute", "tsconfig.json")
            }],
            service: "string-generate"
        }
    });
    service.push({
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
            data: {
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                agentWrite: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    user: hashUser
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
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                agentWrite: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    user: hashUser
                },
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "tsconfig.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy Local to Remote Device",
        qualifier: "ends",
        test: "\"message\":\"Copying XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\"},\"service\":\"file-system\"}"
    });
    service.push({
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
            data: {
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                agentWrite: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    user: hashUser
                },
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "tsconfig.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy Remote Device to Local",
        qualifier: "ends",
        test: "\"message\":\"Copying XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\"},\"service\":\"file-system\"}"
    });
    service.push({
        command: {
            data: {
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                agentWrite: {
                    device: remoteDevice2,
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    user: hashUser
                },
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "version.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy from Remote Device to different Remote Device",
        qualifier: "ends",
        test:  "\"message\":\"Copying XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\"},\"service\":\"file-system\"}"
    });
    service.push({
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
            data: {
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                agentWrite: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    user: hashUser
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
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "tsconfig.json")],
                name: "test-ID"
            } as service_fileSystem,
            service: "file-system"
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
            service: "file-system-details"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-details",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "tsconfig.json")],
                name: "test-ID"
            } as service_fileSystem,
            service: "file-system"
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
            service: "file-system-details"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-new",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestLocal")],
                name: "directory"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-new, Local New Directory",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-new",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestLocal.json")],
                name: "file"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-new, Local New File",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-new",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestRemote")],
                name: "directory"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-new, Remote Device New Directory",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-new",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [`${filePathEncode("absolute", "serviceTestRemote.json")}`],
                name: "file"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-new, Remote Device New File",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-write",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestLocal.json")],
                name: "local test fragment"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-write, Write Local",
        qualifier: "begins",
        test: "{\"data\":[{\"content\":\"Saved to disk!\""
    });
    service.push({
        command: {
            data: {
                action: "fs-write",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestRemote.json")],
                name: "remote device text fragment"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-write, Write Remote Device to Local",
        qualifier: "begins",
        test: "{\"data\":[{\"content\":\"Saved to disk!\""
    });
    service.push({
        command: {
            data: {
                action: "fs-read",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [`new-window-id:${filePathEncode("absolute", "serviceTestLocal.json")}`],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-read, Read Local",
        qualifier: "begins",
        test: `{"data":[{"content":"local test fragment","id":"new-window-id","path":"${filePathEncode("absolute", "serviceTestLocal.json", true)}"}]`
    });
    service.push({
        command: {
            data: {
                action: "fs-read",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [`new-window-id:${filePathEncode("absolute", "serviceTestRemote.json")}`],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-read, Read Remote Device",
        qualifier: "begins",
        test: `{"data":[{"content":"remote device text fragment","id":"new-window-id","path":"${filePathEncode("absolute", "serviceTestRemote.json", true)}"}]`
    });
    service.push({
        command: {
            data: {
                action: "fs-rename",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestLocal")],
                name: "serviceLocal"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-rename, Rename Local Directory",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-rename",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestLocal.json")],
                name: "serviceLocal.json"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-rename, Rename Local File",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-rename",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestRemote")],
                name: "serviceRemote"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-rename, Rename Remote Device Directory",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-rename",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceTestRemote.json")],
                name: "serviceRemote.json"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-rename, Rename Remote Device File",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-destroy",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceLocal")],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-destroy, Destroy Local Directory",
        qualifier: "not contains",
        test: "serviceLocal\",\"directory\""
    });
    service.push({
        command: {
            data: {
                action: "fs-destroy",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceLocal.json")],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-destroy, Destroy Local File",
        qualifier: "not contains",
        test: "serviceLocal.json"
    });
    service.push({
        command: {
            data: {
                action: "fs-destroy",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceRemote")],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-destroy, Destroy Remote Device Directory",
        qualifier: "not contains",
        test: "serviceRemote\",\"directory\""
    });
    service.push({
        command: {
            data: {
                action: "fs-destroy",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [filePathEncode("absolute", "serviceRemote.json")],
                name: ""
            } as service_fileSystem,
            service: "file-system"
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
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-hash, Hash Local",
        qualifier: "is",
        test: {
            data: [{
                content: hash,
                id: "some-modal-id",
                path: filePathEncode("absolute", "tsconfig.json")
            }],
            service: "string-generate"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-hash",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 1,
                location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-hash, Hash Remote Device",
        qualifier: "is",
        test: {
            data: [{
                content: hash,
                id: "some-modal-id",
                path: filePathEncode("absolute", "tsconfig.json")
            }],
            service: "string-generate"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-directory",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 2,
                location: [filePathEncode("absolute", "js/lib")],
                name: ".js"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-directory, Directory Local 1",
        qualifier: "begins",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "js/lib", true)}","directory",`
    });
    service.push({
        command: {
            data: {
                action: "fs-directory",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 2,
                location: [filePathEncode("absolute", "tsconfig.json")],
                name: ".js"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-directory, Directory Local 2",
        qualifier: "contains",
        test: `["${filePathEncode("absolute", "tsconfig.json", true)}","file"`
    });
    service.push({
        command: {
            data: {
                action: "fs-directory",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 2,
                location: [filePathEncode("absolute", "tsconfig.json")],
                name: ".js"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-directory, Directory Remote Device 1",
        qualifier: "is",
        test: `{"data":{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "tsconfig.json", true)}","file","",0,0,null]],"message":"0 directories, XXXX file, XXXX symbolic links, XXXX errors"},"service":"file-status-device"}`
    });
    service.push({
        command: {
            data: {
                action: "fs-directory",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 2,
                location: [filePathEncode("absolute", "tsconfig.json")],
                name: ".js"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-directory, Directory Remote Device 2",
        qualifier: "contains",
        test: `["${filePathEncode("absolute", "tsconfig.json", true)}","file"`
    });
    service.push({
        command: {
            data: {
                action: "fs-search",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 0,
                location: [filePathEncode("absolute", "")],
                name: ".js"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-search, Search Local 1",
        qualifier: "not contains",
        test: ".ts"
    });
    service.push({
        command: {
            data: {
                action: "fs-search",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 0,
                location: [filePathEncode("absolute", "")],
                name: ".js"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-search, Search Local 2",
        qualifier: "contains",
        test: `["${filePathEncode("absolute", "js/lib/browser/fileBrowser.js", true)}","file"`
    });
    service.push({
        command: {
            data: {
                action: "fs-search",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 0,
                location: [filePathEncode("absolute", "")],
                name: ".js"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-search, Search Remote Device 1",
        qualifier: "not contains",
        test: ".ts"
    });
    service.push({
        command: {
            data: {
                action: "fs-search",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: hashUser
                },
                depth: 0,
                location: [filePathEncode("absolute", "")],
                name: ".js"
            } as service_fileSystem,
            service: "file-system"
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
                agentRequest: {
                    hashDevice: serverVars.hashDevice,
                    hashUser: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                    ipAll: {
                        IPv4: [loopback],
                        IPv6: []
                    },
                    ipSelected: loopback,
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: serverVars.device
                },
                agentResponse: {
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: loopback,
                    modal: "",
                    nameDevice: "",
                    nameUser: "",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: null
                },
                message: "Hello",
                status: "invited",
                type: "device"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-request - Local device invite",
        qualifier: "contains",
        test: "Accepted invitation. Request processed at responding terminal XXXX for type device.  Agent already present, so auto accepted and returned to requesting terminal."
    });
    service.push({
        command: {
            data: {
                action: "invite-response",
                agentRequest: {
                    hashDevice: serverVars.hashDevice,
                    hashUser: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                    ipAll: {
                        IPv4: [loopback],
                        IPv6: []
                    },
                    ipSelected: loopback,
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: serverVars.device
                },
                agentResponse: {
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: loopback,
                    modal: "test-modal-responder",
                    nameDevice: "responding device",
                    nameUser: "responding user",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: null
                },
                message: "Hello",
                status: "ignored",
                type: "device"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-response - Local device invite",
        qualifier: "contains",
        test: "Ignored invitation response processed at responding terminal XXXX and sent to requesting terminal XXXX "
    });
    service.push({
        command: {
            data: {
                action: "invite-response",
                agentRequest: {
                    hashDevice: serverVars.hashDevice,
                    hashUser: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                    ipAll: {
                        IPv4: [loopback],
                        IPv6: []
                    },
                    ipSelected: loopback,
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: serverVars.device
                },
                agentResponse: {
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: loopback,
                    modal: "test-modal-responder",
                    nameDevice: "responding device",
                    nameUser: "responding user",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: null
                },
                message: "Hello",
                status: "accepted",
                type: "device"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-response - Local device invite response, accepted",
        qualifier: "contains",
        test: "Accepted invitation response processed at responding terminal XXXX and sent to requesting terminal XXXX "
    });
    service.push({
        command: {
            data: {
                action: "invite-response",
                agentRequest: {
                    hashDevice: serverVars.hashDevice,
                    hashUser: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                    ipAll: {
                        IPv4: [loopback],
                        IPv6: []
                    },
                    ipSelected: loopback,
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: serverVars.device
                },
                agentResponse: {
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: loopback,
                    modal: "test-modal-responder",
                    nameDevice: "responding device",
                    nameUser: "responding user",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: null
                },
                message: "Hello",
                status: "ignored",
                type: "device"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-response - Local device invite response, ignored",
        qualifier: "contains",
        test: "Ignored invitation response processed at responding terminal XXXX and sent to requesting terminal XXXX "
    });
    service.push({
        command: {
            data: {
                action: "invite-response",
                agentRequest: {
                    hashDevice: serverVars.hashDevice,
                    hashUser: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                    ipAll: {
                        IPv4: [loopback],
                        IPv6: []
                    },
                    ipSelected: loopback,
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: serverVars.device
                },
                agentResponse: {
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: loopback,
                    modal: "test-modal-responder",
                    nameDevice: "responding device",
                    nameUser: "responding user",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: null
                },
                message: "Hello",
                status: "declined",
                type: "device"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-response - Local device invite response, declined",
        qualifier: "contains",
        test: "Declined invitation response processed at responding terminal XXXX and sent to requesting terminal XXXX "
    });
    service.push({
        command: {
            data: {
                action: "invite-complete",
                agentRequest: {
                    hashDevice: serverVars.hashDevice,
                    hashUser: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                    ipAll: {
                        IPv4: [loopback],
                        IPv6: []
                    },
                    ipSelected: loopback,
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: serverVars.device
                },
                agentResponse: {
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: loopback,
                    modal: "test-modal-responder",
                    nameDevice: "responding device",
                    nameUser: "responding user",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: null
                },
                message: "Hello",
                status: "accepted",
                type: "device"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-complete - Local user invite complete, accepted",
        qualifier: "contains",
        test: "Accepted invitation returned from device 'responding device'."
    });
    service.push({
        command: {
            data: {
                action: "invite-complete",
                agentRequest: {
                    hashDevice: serverVars.hashDevice,
                    hashUser: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
                    ipAll: {
                        IPv4: [loopback],
                        IPv6: []
                    },
                    ipSelected: loopback,
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: serverVars.device
                },
                agentResponse: {
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: loopback,
                    modal: "test-modal-responder",
                    nameDevice: "responding device",
                    nameUser: "responding user",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: null
                },
                message: "Hello",
                status: "ignored",
                type: "device"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-complete - Local user invite complete, ignored",
        qualifier: "contains",
        test: "Ignored invitation returned from device 'responding device'."
    });
    return service;
};

export default serviceTests;