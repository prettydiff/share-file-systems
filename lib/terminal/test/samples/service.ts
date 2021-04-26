
/* lib/terminal/test/samples/service - A list of service tests. */

import filePathEncode from "../application/browserUtilities/file_path_encode.js";
import serverVars from "../../server/serverVars.js";

const serviceTests = function terminal_test_samples_services():testService[] {
    const service:testService[] = [],
        base64:string = "ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAibW9kdWxlUmVzb2x1dGlvbiI6ICJub2RlIiwKICAgICAgICAib3V0RGlyIjogImpzIiwKICAgICAgICAicHJldHR5IjogdHJ1ZSwKICAgICAgICAidGFyZ2V0IjogIkVTMjAyMCIsCiAgICAgICAgInR5cGVzIjogWyJub2RlIl0sCiAgICAgICAgInR5cGVSb290cyI6IFsibm9kZV9tb2R1bGVzL0B0eXBlcyJdCiAgICB9LAogICAgImV4Y2x1ZGUiOiBbCiAgICAgICAgImpzIiwKICAgICAgICAibGliL3Rlcm1pbmFsL3Rlc3Qvc3RvcmFnZUJyb3dzZXIiLAogICAgICAgICJsaWIvd3MtZXM2IiwKICAgICAgICAiKiovbm9kZV9tb2R1bGVzIiwKICAgICAgICAiKiovLiovIgogICAgXSwKICAgICJpbmNsdWRlIjogWwogICAgICAgICIqKi8qLnRzIgogICAgXQp9",
        hash:string = "bd4677866c92cd872e1f56004eccc54e08772c99ec45b0001048317a88ee416759f9aad1b5a4119f6e83d7a0b871e9abfc8f7b2c2de14dab2851042ae598ce9c",
        loopback:string = "127.0.0.1";

    service.push(<testService>{
        command: {
            action: "fs-base64",
            agent: {
                id: serverVars.hashDevice,
                modalAddress: filePathEncode("absolute", ""),
                share: "",
                type: "device"
            },
            agentType: "device",
            depth: 1,
            location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
            name: "",
        },
        name: "fs-base64, Base 64 Local",
        qualifier: "is",
        requestType: "fs",
        test: [{
            content: base64,
            id: "some-modal-id",
            path: filePathEncode("absolute", "tsconfig.json")
        }]
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-base64, Base 64 Remote Device",
        qualifier: "is",
        requestType: "fs",
        test: [{
            content: base64,
            id: "some-modal-id",
            path: filePathEncode("absolute", "tsconfig.json")
        }]
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-close, Close Local",
        qualifier: "begins",
        requestType: "fs",
        test: `{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-close, Close Remote Device",
        qualifier: "begins",
        requestType: "fs",
        test: `{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push(<testService>{
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
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
            location: [filePathEncode("absolute", "tsconfig.json")],
            tempSource: "",
            tempWrite: ""
        },
        name: "copy, Copy Local to Local",
        qualifier: "begins",
        requestType: "copy",
        test: `{"address":"${filePathEncode("absolute", "lib/settings", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":`
    });
    service.push(<testService>{
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
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
            location: [filePathEncode("absolute", "tsconfig.json")],
            tempSource: "",
            tempWrite: ""
        },
        name: "copy, Copy Local to Remote Device",
        qualifier: "ends",
        requestType: "copy",
        test: "\"message\":\"Copying XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\"}"
    });
    service.push(<testService>{
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
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
            location: [filePathEncode("absolute", "tsconfig.json")],
            tempSource: "",
            tempWrite: ""
        },
        name: "copy, Copy Remote Device to Local",
        qualifier: "ends",
        requestType: "copy",
        test: "\"message\":\"Copying XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\"}"
    });
    service.push({
        command: {
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
        },
        name: "copy, Copy from Remote Device to different Remote Device",
        qualifier: "ends",
        requestType: "copy",
        test:  "\"message\":\"Copying XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\"}"
    });
    service.push(<testService>{
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
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
            location: [filePathEncode("absolute", "tsconfig.json")],
            tempSource: "",
            tempWrite: ""
        },
        name: "copy, Copy Remote Device to Same Remote Device 1",
        qualifier: "ends",
        requestType: "copy",
        test: "\"message\":\"Copying XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\"}"
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-details, Details of Local tsconfig.json",
        qualifier: "is",
        requestType: "fs",
        test: {
            dirs: [
                [filePathEncode("absolute", "tsconfig.json"), "file", "", 0, 0, null]
            ],
            id: "test-ID"
        }
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-details, Details of Remote Device tsconfig.json",
        qualifier: "is",
        requestType: "fs",
        test: {
            dirs: [
                [filePathEncode("absolute", "tsconfig.json"), "file", "", 0, 0, null]
            ],
            id: "test-ID"
        }
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-new, Local New Directory",
        qualifier: "begins",
        requestType: "fs",
        test: `{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-new, Local New File",
        qualifier: "begins",
        requestType: "fs",
        test: `{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-new, Remote Device New Directory",
        qualifier: "begins",
        requestType: "fs",
        test: `{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-new, Remote Device New File",
        qualifier: "begins",
        requestType: "fs",
        test: `{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-write, Write Local",
        qualifier: "begins",
        requestType: "fs",
        test: "Saved to disk!"
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-write, Write Remote Device to Local",
        qualifier: "begins",
        requestType: "fs",
        test: "Saved to disk!"
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-read, Read Local",
        qualifier: "begins",
        requestType: "fs",
        test: `[{"content":"local test fragment","id":"new-window-id","path":"${filePathEncode("absolute", "serviceTestLocal.json")}"}]`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-read, Read Remote Device",
        qualifier: "begins",
        requestType: "fs",
        test: `[{"content":"remote device text fragment","id":"new-window-id","path":"${filePathEncode("absolute", "serviceTestRemote.json")}"}]`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-rename, Rename Local Directory",
        qualifier: "begins",
        requestType: "fs",
        test: `{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-rename, Rename Local File",
        qualifier: "begins",
        requestType: "fs",
        test: `{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-rename, Rename Remote Device Directory",
        qualifier: "begins",
        requestType: "fs",
        test: `{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-rename, Rename Remote Device File",
        qualifier: "begins",
        requestType: "fs",
        test: `{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "", true)}","directory",`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-destroy, Destroy Local Directory",
        qualifier: "not contains",
        requestType: "fs",
        test: "serviceLocal\",\"directory\""
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-destroy, Destroy Local File",
        qualifier: "not contains",
        requestType: "fs",
        test: "serviceLocal.json"
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-destroy, Destroy Remote Device Directory",
        qualifier: "not contains",
        requestType: "fs",
        test: "serviceRemote\",\"directory\""
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-destroy, Destroy Remote Device File",
        qualifier: "not contains",
        requestType: "fs",
        test: {
            address: "test-ID",
            agent: serverVars.hashDevice,
            agentType: "device",
            fileList: null,
            message: "serviceRemote.json"
        }
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-hash, Hash Local",
        qualifier: "is",
        requestType: "fs",
        test: [{
            content: hash,
            id: "some-modal-id",
            path: filePathEncode("absolute", "tsconfig.json")
        }]
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-hash, Hash Remote Device",
        qualifier: "is",
        requestType: "fs",
        test: [{
            content: hash,
            id: "some-modal-id",
            path: filePathEncode("absolute", "tsconfig.json")
        }]
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-directory, Directory Local 1",
        qualifier: "begins",
        requestType: "fs",
        test: `{"address":"${filePathEncode("absolute", "", true)}","agent":"${serverVars.hashDevice}","agentType":"device","fileList":[["${filePathEncode("absolute", "js/lib", true)}","directory",`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-directory, Directory Local 2",
        qualifier: "contains",
        requestType: "fs",
        test: `["${filePathEncode("absolute", "tsconfig.json", true)}","file"`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-directory, Directory Remote Device 1",
        qualifier: "is",
        requestType: "fs",
        test: `{"address":"${filePathEncode("absolute", "", true)}","agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","fileList":[["${filePathEncode("absolute", "tsconfig.json", true)}","file","",0,0,null]],"message":"0 directories, XXXX files, XXXX symbolic links, XXXX errors"}`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-directory, Directory Remote Device 2",
        qualifier: "contains",
        requestType: "fs",
        test: `["${filePathEncode("absolute", "tsconfig.json", true)}","file"`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-search, Search Local 1",
        qualifier: "not contains",
        requestType: "fs",
        test: ".ts"
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-search, Search Local 2",
        qualifier: "contains",
        requestType: "fs",
        test: `["${filePathEncode("absolute", "js/lib/browser/fileBrowser.js", true)}","file"`
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-search, Search Remote Device 1",
        qualifier: "not contains",
        requestType: "fs",
        test: ".ts"
    });
    service.push(<testService>{
        command: {
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
        },
        name: "fs-search, Search Remote Device 2",
        qualifier: "contains",
        requestType: "fs",
        test: `["${filePathEncode("absolute", "js/lib/browser/fileBrowser.js", true)}","file"`
    });
    service.push(<testService>{
        command: {
            data: {
                [serverVars.hashDevice]: {
                    ipAll: {
                        IPv4: [loopback],
                        IPv6: []
                    },
                    ipSelected: loopback,
                    name: "local device name",
                    port: 443,
                    shares: {
                        [serverVars.hashDevice]: {
                            execute: false,
                            name: "C:\\mp3",
                            readOnly: false,
                            type: "directory"
                        }
                    }
                }
            },
            serverResponse: null,
            type: "device"
        },
        name: "settings device, Local device settings without HTTP response",
        qualifier: "is",
        requestType: "settings",
        test: "device settings written"
    });
    service.push(<testService>{
        command: {
            data: [{
                agentFrom: "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594",
                agentTo: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                agentType: "device",
                date: 1616070795053,
                message: "text message"
            }],
            serverResponse: null,
            type: "message"
        },
        name: "settings message, Local message settings without HTTP response",
        qualifier: "is",
        requestType: "settings",
        test: "message settings written"
    });
    service.push(<testService>{
        command: {
            data: {
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
                zIndex: 6
            },
            serverResponse: null,
            type: "configuration"
        },
        name: "settings, Local settings without HTTP response",
        qualifier: "is",
        requestType: "settings",
        test: "settings written"
    });
    service.push(<testService>{
        command: {
            data: {
                [serverVars.hashDevice]: {
                    ipAll: {
                        IPv4: [loopback],
                        IPv6: []
                    },
                    ipSelected: loopback,
                    name: "remote user name",
                    port: 443,
                    shares: {
                        [serverVars.hashDevice]: {
                            execute: false,
                            name: "C:\\movies",
                            readOnly: false,
                            type: "directory"
                        }
                    }
                }
            },
            serverResponse: null,
            type: "user"
        },
        name: "settings user, Local user settings without HTTP response",
        qualifier: "is",
        requestType: "settings",
        test: "user settings written"
    });
    service.push(<testService>{
        command: {
            action: "invite-request",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ipAll: {
                IPv4: [loopback],
                IPv6: []
            },
            ipSelected: loopback,
            modal: "test-modal",
            port: 443,
            shares: serverVars.device,
            status: "invited",
            type: "device",
            userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
            userName: "local user name"
        },
        name: "invite, invite-request - Local device invite",
        qualifier: "is",
        requestType: "invite-request",
        test: "Accepted invitation. Request processed at remote terminal XXXX for type device.  Agent already present, so auto accepted and returned to start terminal."
    });
    service.push(<testService>{
        command: {
            action: "invite-response",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ipAll: {
                IPv4: [loopback],
                IPv6: []
            },
            ipSelected: loopback,
            modal: "test-modal",
            port: 443,
            shares: serverVars.device,
            status: "invited",
            type: "device",
            userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
            userName: "local user name"
        },
        name: "invite, invite-response - Local device invite",
        qualifier: "is",
        requestType: "invite-response",
        test: "Ignored invitation response processed at remote terminal XXXX and sent to start terminal."
    });
    service.push(<testService>{
        command: {
            action: "invite-response",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ipAll: {
                IPv4: [loopback],
                IPv6: []
            },
            ipSelected: loopback,
            modal: "test-modal",
            port: 443,
            shares: serverVars.device,
            status: "accepted",
            type: "device",
            userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
            userName: "local user name"
        },
        name: "invite, invite-response - Local device invite response, accepted",
        qualifier: "is",
        requestType: "invite-response",
        test: "Accepted invitation response processed at remote terminal XXXX and sent to start terminal."
    });
    service.push(<testService>{
        command: {
            action: "invite-response",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ipAll: {
                IPv4: [loopback],
                IPv6: []
            },
            ipSelected: loopback,
            modal: "test-modal",
            port: 443,
            shares: serverVars.device,
            status: "invited",
            type: "device",
            userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
            userName: "local user name"
        },
        name: "invite, invite-response - Local device invite response, ignored",
        qualifier: "is",
        requestType: "invite-response",
        test: "Ignored invitation response processed at remote terminal XXXX and sent to start terminal."
    });
    service.push(<testService>{
        command: {
            action: "invite-response",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ipAll: {
                IPv4: [loopback],
                IPv6: []
            },
            ipSelected: loopback,
            modal: "test-modal",
            port: 443,
            shares: serverVars.device,
            status: "declined",
            type: "device",
            userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
            userName: "local user name"
        },
        name: "invite, invite-response - Local device invite response, declined",
        qualifier: "is",
        requestType: "invite-response",
        test: "Declined invitation response processed at remote terminal XXXX and sent to start terminal."
    });
    service.push(<testService>{
        command: {
            action: "invite-complete",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ipAll: {
                IPv4: [loopback],
                IPv6: []
            },
            ipSelected: loopback,
            modal: "test-modal",
            port: 443,
            shares: serverVars.device,
            status: "accepted",
            type: "device",
            userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
            userName: "local user name"
        },
        name: "invite, invite-complete - Local user invite complete, accepted",
        qualifier: "is",
        requestType: "invite-complete",
        test: "Accepted invitation returned to XXXX from this local terminal and to the local browser(s)."
    });
    service.push(<testService>{
        command: {
            action: "invite-complete",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ipAll: {
                IPv4: [loopback],
                IPv6: []
            },
            ipSelected: loopback,
            modal: "test-modal",
            port: 443,
            shares: serverVars.device,
            status: "invited",
            type: "device",
            userHash: "21ca7db79e6eb80ea103c4a10f7dee9b6ee3116717579ee9f06808a0eb8b8f416d063512c8fd91199d9fa17fbafaa9dccb93034530a8e473dffd321aca1ec872",
            userName: "local user name"
        },
        name: "invite, invite-complete - Local user invite complete, ignored",
        qualifier: "is",
        requestType: "invite-complete",
        test: "Ignored invitation returned to XXXX from this local terminal and to the local browser(s)."
    });
    service.push(<testService>{
        command: {
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
        },
        name: "heartbeat-broadcast, from Browser",
        qualifier: "is",
        requestType: "heartbeat-update",
        test: "response from heartbeat.update"
    });
    service.push(<testService>{
        command: {
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
        },
        name: "heartbeat-broadcast, from Terminal",
        qualifier: "is",
        requestType: "heartbeat-update",
        test: "response from heartbeat.update"
    });
    service.push(<testService>{
        command: {
            agentFrom: serverVars.hashDevice,
            agentTo: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            shares: serverVars.device,
            shareType: "device",
            status: "active"
        },
        name: "heartbeat complete",
        qualifier: "is",
        requestType: "heartbeat-complete",
        test: {
            agentFrom: "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594",
            agentTo: "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594",
            agentType: "device",
            shares: {},
            shareType: "device",
            status: "active"
        }
    });
    return service;
};

export default serviceTests;