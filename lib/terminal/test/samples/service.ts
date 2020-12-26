
/* lib/terminal/test/samples/service - A list of service tests. */

import filePathEncode from "../application/file_path_encode.js";
import serverVars from "../../server/serverVars.js";

const serviceTests = function terminal_test_samples_services():testService[] {
    const service:testService[] = [],
        base64:string = "ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAibW9kdWxlUmVzb2x1dGlvbiI6ICJub2RlIiwKICAgICAgICAib3V0RGlyIjogImpzIiwKICAgICAgICAicHJldHR5IjogdHJ1ZSwKICAgICAgICAidGFyZ2V0IjogIkVTMjAyMCIsCiAgICAgICAgInR5cGVzIjogWyJub2RlIl0sCiAgICAgICAgInR5cGVSb290cyI6IFsibm9kZV9tb2R1bGVzL0B0eXBlcyJdCiAgICB9LAogICAgImV4Y2x1ZGUiOiBbCiAgICAgICAgImpzIiwKICAgICAgICAibGliL3Rlcm1pbmFsL3Rlc3Qvc3RvcmFnZUJyb3dzZXIiLAogICAgICAgICJsaWIvd3MtZXM2IiwKICAgICAgICAiKiovbm9kZV9tb2R1bGVzIiwKICAgICAgICAiKiovLiovIgogICAgXSwKICAgICJpbmNsdWRlIjogWwogICAgICAgICIqKi8qLnRzIgogICAgXQp9",
        hash:string = "bd4677866c92cd872e1f56004eccc54e08772c99ec45b0001048317a88ee416759f9aad1b5a4119f6e83d7a0b871e9abfc8f7b2c2de14dab2851042ae598ce9c",
        loopback:string = (serverVars.ipFamily === "IPv6")
            ? "::1"
            : "127.0.0.1";

    service.push(<testService>{
        command: {
            action: "fs-base64",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
            name: "",
            watch: "no"
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
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
            name: "",
            watch: "no"
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
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "lib")],
            name: "",
            watch: "no"
        },
        name: "fs-close, Close Local",
        qualifier: "begins",
        requestType: "fs",
        test: `Watcher ${filePathEncode("absolute", "lib")} closed.`
    });
    service.push(<testService>{
        command: {
            action: "fs-close",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "lib")],
            name: "",
            watch: "no"
        },
        name: "fs-close, Close Remote Device",
        qualifier: "begins",
        requestType: "fs",
        test: "{\"agent\":\"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e\",\"agentType\":\"device\",\"dirs\":[["
    });
    service.push(<testService>{
        artifact: filePathEncode("absolute", "lib/storage/tsconfig.json"),
        command: {
            action: "fs-copy",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: serverVars.hashDevice,
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "tsconfig.json")],
            name: filePathEncode("absolute", "lib/storage"),
            share: "",
            watch: "no"
        },
        name: "fs-copy, Copy Local to Local",
        qualifier: "is",
        requestType: "fs",
        test: {
            failures: [],
            message: "Copy complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.",
            target: "remote-test-ID"
        }
    });
    service.push(<testService>{
        artifact: filePathEncode("absolute", "lib/storage/tsconfig.json"),
        command: {
            action: "fs-copy",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "tsconfig.json")],
            name: filePathEncode("absolute", "lib/storage"),
            share: "",
            watch: "no"
        },
        name: "fs-copy, Copy Local to Remote Device",
        qualifier: "contains",
        requestType: "fs",
        test: "\"message\":\"Copy complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\"",
    });
    service.push(<testService>{
        artifact: filePathEncode("absolute", "lib/storage/tsconfig.json"),
        command: {
            action: "fs-copy",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: serverVars.hashDevice,
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "tsconfig.json")],
            name: filePathEncode("absolute", "lib/storage"),
            share: "",
            watch: "no"
        },
        name: "fs-copy, Copy Remote Device to Local",
        qualifier: "contains",
        requestType: "fs",
        test: "\"message\":\"Copy complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.\""
    });
    /*service.push({
        command: {
            action: "fs-copy",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "fa042a71aee124b7b667d97fd84c0a309e72aefcae5d95762bc05d39cbeedae88122758f8625910a669271251d5f561a1c2749c6d66664f5d35dcc8c608c1a89",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [`${projectPath}version.json`],
            name: filePathEncode("absolute", "lib/storage"),
            share: "",
            watch: "no"
        },
        name: "fs-copy, Copy from Remote Device to different Remote Device",
        qualifier: "is",
        requestType: "fs",
        test: {
            "file-list-status": {
                failures: [],
                message: "Copy complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures.",
                target: "remote-test-ID"
            }
        }
    });*/
    service.push(<testService>{
        artifact: filePathEncode("absolute", "lib/storage/tsconfig.json"),
        command: {
            action: "fs-copy",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "tsconfig.json")],
            name: filePathEncode("absolute", "lib/storage"),
            share: "",
            watch: "no"
        },
        name: "fs-copy, Copy Remote Device to Same Remote Device 1",
        qualifier: "contains",
        requestType: "fs",
        test: "Copy complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures."
    });
    service.push(<testService>{
        command: {
            action: "fs-details",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "tsconfig.json")],
            name: "",
            watch: "no"
        },
        name: "fs-details, Details of Local tsconfig.json",
        qualifier: "is",
        requestType: "fs",
        test: {
            dirs: [
                [filePathEncode("absolute", "tsconfig.json"), "file", "", 0, 0, null]
            ],
            fail: [],
            id: "test-ID"
        }
    });
    service.push(<testService>{
        command: {
            action: "fs-details",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "tsconfig.json")],
            name: "",
            watch: "no"
        },
        name: "fs-details, Details of Remote Device tsconfig.json",
        qualifier: "is",
        requestType: "fs",
        test: {
            dirs: [
                [filePathEncode("absolute", "tsconfig.json"), "file", "", 0, 0, null]
            ],
            fail: [],
            id: "test-ID"
        }
    });
    service.push(<testService>{
        command: {
            action: "fs-new",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceTestLocal")],
            name: "directory",
            watch: "no"
        },
        name: "fs-new, Local New Directory",
        qualifier: "is",
        requestType: "fs",
        test: `${filePathEncode("absolute", "serviceTestLocal")} created.`
    });
    service.push(<testService>{
        command: {
            action: "fs-new",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceTestLocal.json")],
            name: "file",
            watch: "no"
        },
        name: "fs-new, Local New File",
        qualifier: "is",
        requestType: "fs",
        test: `${filePathEncode("absolute", "serviceTestLocal.json")} created.`
    });
    service.push(<testService>{
        command: {
            action: "fs-new",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceTestRemote")],
            name: "directory",
            watch: "no"
        },
        name: "fs-new, Remote Device New Directory",
        qualifier: "is",
        requestType: "fs",
        test: `${filePathEncode("absolute", "serviceTestRemote")} created.`
    });
    service.push(<testService>{
        command: {
            action: "fs-new",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [`${filePathEncode("absolute", "serviceTestRemote.json")}`],
            name: "file",
            watch: "no"
        },
        name: "fs-new, Remote Device New File",
        qualifier: "is",
        requestType: "fs",
        test: `${filePathEncode("absolute", "serviceTestRemote.json")} created.`
    });
    service.push(<testService>{
        command: {
            action: "fs-write",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceTestLocal.json")],
            name: "local text fragment",
            watch: "no"
        },
        name: "fs-write, Write Local",
        qualifier: "is",
        requestType: "fs",
        test: `File ${filePathEncode("absolute", "serviceTestLocal.json")} saved to disk on local device.`
    });
    service.push(<testService>{
        command: {
            action: "fs-write",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceTestRemote.json")],
            name: "remote device text fragment",
            watch: "no"
        },
        name: "fs-write, Write Remote Device to Local",
        qualifier: "is",
        requestType: "fs",
        test: `File ${filePathEncode("absolute", "serviceTestRemote.json")} saved to disk on device a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e.`
    });
    service.push(<testService>{
        command: {
            action: "fs-read",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [`new-window-id:${filePathEncode("absolute", "serviceTestLocal.json")}`],
            name: "",
            watch: "no"
        },
        name: "fs-read, Read Local",
        qualifier: "is",
        requestType: "fs",
        test: [{
            content: "local text fragment",
            id: "new-window-id",
            path: filePathEncode("absolute", "serviceTestLocal.json")
        }]
    });
    service.push(<testService>{
        command: {
            action: "fs-read",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [`new-window-id:${filePathEncode("absolute", "serviceTestRemote.json")}`],
            name: "",
            watch: "no"
        },
        name: "fs-read, Read Remote Device",
        qualifier: "is",
        requestType: "fs",
        test: [{
            content: "remote device text fragment",
            id: "new-window-id",
            path: filePathEncode("absolute", "serviceTestRemote.json")
        }]
    });
    service.push(<testService>{
        command: {
            action: "fs-rename",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceTestLocal")],
            name: "serviceLocal",
            watch: "no"
        },
        name: "fs-rename, Rename Local Directory",
        qualifier: "is",
        requestType: "fs",
        test: `Path ${filePathEncode("absolute", "serviceTestLocal")} on device ${serverVars.hashDevice} renamed to ${filePathEncode("absolute", "serviceLocal")}.`
    });
    service.push(<testService>{
        command: {
            action: "fs-rename",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceTestLocal.json")],
            name: "serviceLocal.json",
            watch: "no"
        },
        name: "fs-rename, Rename Local File",
        qualifier: "is",
        requestType: "fs",
        test: `Path ${filePathEncode("absolute", "serviceTestLocal.json")} on device ${serverVars.hashDevice} renamed to ${filePathEncode("absolute", "serviceLocal.json")}.`
    });
    service.push(<testService>{
        command: {
            action: "fs-rename",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceTestRemote")],
            name: "serviceRemote",
            watch: "no"
        },
        name: "fs-rename, Rename Remote Device Directory",
        qualifier: "is",
        requestType: "fs",
        test: `Path ${filePathEncode("absolute", "serviceTestRemote")} on device a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e renamed to ${filePathEncode("absolute", "serviceRemote")}.`
    });
    service.push(<testService>{
        command: {
            action: "fs-rename",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceTestRemote.json")],
            name: "serviceRemote.json",
            watch: "no"
        },
        name: "fs-rename, Rename Remote Device File",
        qualifier: "is",
        requestType: "fs",
        test: `Path ${filePathEncode("absolute", "serviceTestRemote.json")} on device a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e renamed to ${filePathEncode("absolute", "serviceRemote.json")}.`
    });
    service.push(<testService>{
        command: {
            action: "fs-destroy",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceLocal")],
            name: "",
            watch: "no"
        },
        name: "fs-destroy, Destroy Local Directory",
        qualifier: "is",
        requestType: "fs",
        test: `Path(s) ${filePathEncode("absolute", "serviceLocal")} destroyed on device ${serverVars.hashDevice}.`
    });
    service.push(<testService>{
        command: {
            action: "fs-destroy",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceLocal.json")],
            name: "",
            watch: "no"
        },
        name: "fs-destroy, Destroy Local File",
        qualifier: "is",
        requestType: "fs",
        test: `Path(s) ${filePathEncode("absolute", "serviceLocal.json")} destroyed on device ${serverVars.hashDevice}.`
    });
    service.push(<testService>{
        command: {
            action: "fs-destroy",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceRemote")],
            name: "",
            watch: "no"
        },
        name: "fs-destroy, Destroy Remote Device Directory",
        qualifier: "is",
        requestType: "fs",
        test: `Path(s) ${filePathEncode("absolute", "serviceRemote")} destroyed on device a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e.`
    });
    service.push(<testService>{
        command: {
            action: "fs-destroy",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [filePathEncode("absolute", "serviceRemote.json")],
            name: "",
            watch: "no"
        },
        name: "fs-destroy, Destroy Remote Device File",
        qualifier: "is",
        requestType: "fs",
        test: `Path(s) ${filePathEncode("absolute", "serviceRemote.json")} destroyed on device a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e.`
    });
    service.push(<testService>{
        command: {
            action: "fs-hash",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
            name: "",
            watch: "no"
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
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: "test-ID",
            location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
            name: "",
            watch: "no"
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
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 2,
            id: "test-ID",
            location: [filePathEncode("absolute", "js/lib")],
            name: ".js",
            watch: "no"
        },
        name: "fs-directory, Directory Local 1",
        qualifier: "begins",
        requestType: "fs",
        test: "{\"dirs\":[["
    });
    service.push(<testService>{
        command: {
            action: "fs-directory",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 2,
            id: "test-ID",
            location: [filePathEncode("absolute", "tsconfig.json")],
            name: ".js",
            watch: "no"
        },
        name: "fs-directory, Directory Local 2",
        qualifier: "contains",
        requestType: "fs",
        test: `["${filePathEncode("absolute", "tsconfig.json", true)}","file"`
    });
    service.push(<testService>{
        command: {
                action: "fs-directory",
                agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
                agentType: "device",
                copyAgent: "",
                copyType: "device",
                depth: 2,
                id: "test-ID",
                location: [filePathEncode("absolute", "tsconfig.json")],
                name: ".js",
                watch: "no"
        },
        name: "fs-directory, Directory Remote Device 1",
        qualifier: "begins",
        requestType: "fs",
        test: "{\"dirs\":[["
    });
    service.push(<testService>{
        command: {
            action: "fs-directory",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 2,
            id: "test-ID",
            location: [filePathEncode("absolute", "tsconfig.json")],
            name: ".js",
            watch: "no"
        },
        name: "fs-directory, Directory Remote Device 2",
        qualifier: "contains",
        requestType: "fs",
        test: `["${filePathEncode("absolute", "tsconfig.json", true)}","file"`
    });
    service.push(<testService>{
        command: {
            action: "fs-search",
            agent: serverVars.hashDevice,
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 0,
            id: "test-ID",
            location: [filePathEncode("absolute", "")],
            name: ".js",
            watch: "no"
        },
        name: "fs-search, Search Local 1",
        qualifier: "begins",
        requestType: "fs",
        test: "{\"dirs\":[["
    });
    service.push(<testService>{
        command: {
                action: "fs-search",
                agent: serverVars.hashDevice,
                agentType: "device",
                copyAgent: "",
                copyType: "device",
                depth: 0,
                id: "test-ID",
                location: [filePathEncode("absolute", "")],
                name: ".js",
                watch: "no"
        },
        name: "fs-search, Search Local 2",
        qualifier: "contains",
        requestType: "fs",
        test: `["${filePathEncode("absolute", "js/lib/browser/fileBrowser.js", true)}","file"`
    });
    service.push(<testService>{
        command: {
            action: "fs-search",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 0,
            id: "test-ID",
            location: [filePathEncode("absolute", "")],
            name: ".js",
            watch: "no"
        },
        name: "fs-search, Search Remote Device 1",
        qualifier: "begins",
        requestType: "fs",
        test: "{\"dirs\":[["
    });
    service.push(<testService>{
        command: {
            action: "fs-search",
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            copyAgent: "",
            copyType: "device",
            depth: 0,
            id: "test-ID",
            location: [filePathEncode("absolute", "")],
            name: ".js",
            watch: "no"
        },
        name: "fs-search, Search Remote Device 2",
        qualifier: "contains",
        requestType: "fs",
        test: `["${filePathEncode("absolute", "js/lib/browser/fileBrowser.js", true)}","file"`
    });
    service.push(<testService>{
        command: {
            agent: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            dirs: [
                [filePathEncode("absolute", "lib/storage/storage.txt"), "file", "", 0, 0, null]
            ],
            fail: [],
            location: filePathEncode("absolute", "lib/storage"),
            status: {}
        },
        name: "fs-update-remote, Local",
        qualifier: "is",
        requestType: "fs-update-remote",
        test: `Received directory watch for {"agent":"a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e","agentType":"device","dirs":[["${filePathEncode("absolute", "lib/storage/storage.txt", true)}","file","",0,0,null]],"fail":[],"location":"${filePathEncode("absolute", "lib/storage", true)}","status":{}} at XXXX `
    });
    service.push(<testService>{
        command: {
            data: {
                [serverVars.hashDevice]: {
                    ip: loopback,
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
            response: null,
            type: "device"
        },
        name: "storage device, Local device storage without HTTP response",
        qualifier: "is",
        requestType: "device",
        test: "device storage written"
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
                    "settings-modal": {
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
                        type: "settings",
                        width: 800,
                        zIndex: 1,
                        id: "settings-modal",
                        left: 200,
                        top: 200,
                        height: 400
                    },
                },
                modalTypes: [
                    "settings", "fileNavigate", "invite-request"
                ],
                nameDevice: "this device name",
                nameUser: "local user name",
                zIndex: 6
            },
            response: null,
            type: "settings"
        },
        name: "storage settings, Local settings storage without HTTP response",
        qualifier: "is",
        requestType: "settings",
        test: "settings storage written"
    });
    service.push(<testService>{
        command: {
            data: {
                [serverVars.hashDevice]: {
                    ip: loopback,
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
            response: null,
            type: "user"
        },
        name: "storage user, Local user storage without HTTP response",
        qualifier: "is",
        requestType: "user",
        test: "user storage written"
    });
    service.push(<testService>{
        command: {
            action: "invite-request",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ip: loopback,
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
        test: `Accepted invitation. Request processed at remote terminal XXXX   Agent already present, so auto accepted and returned to start terminal.`
    });
    service.push(<testService>{
        command: {
            action: "invite-response",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ip: loopback,
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
        test: `Ignored invitation response processed at remote terminal XXXX and sent to start terminal.`
    });
    service.push(<testService>{
        command: {
            action: "invite-response",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ip: loopback,
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
        test: `Accepted invitation response processed at remote terminal XXXX and sent to start terminal.`
    });
    service.push(<testService>{
        command: {
            action: "invite-response",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ip: loopback,
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
        test: `Ignored invitation response processed at remote terminal XXXX and sent to start terminal.`
    });
    service.push(<testService>{
        command: {
            action: "invite-response",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ip: loopback,
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
        test: `Declined invitation response processed at remote terminal XXXX and sent to start terminal.`
    });
    service.push(<testService>{
        command: {
            action: "invite-complete",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ip: loopback,
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
        test: "Accepted invitation returned to XXXX from this local terminal XXXX and to the local browser(s)."
    });
    service.push(<testService>{
        command: {
            action: "invite-complete",
            deviceHash: serverVars.hashDevice,
            deviceName: "old desktop computer",
            message: "Hello",
            name: serverVars.device[serverVars.hashDevice].name,
            ip: loopback,
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
        test: "Ignored invitation returned to XXXX from this local terminal XXXX and to the local browser(s)."
    });
    service.push(<testService>{
        command: {
            agentFrom: "localhost-browser",
            agentTo: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
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
    service.push(<testService>{
        command: {
            agentFrom: serverVars.hashDevice,
            agentTo: "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
            agentType: "device",
            shares: {
                "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594": {
                    "ip"    : "::1",
                    "name"  : "test local device",
                    "port"  : 0,
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
                    }
                },
                "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e": {
                    "ip"    : "::1",
                    "name"  : "test device laptop",
                    "port"  : 0,
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
                    }
                },
                "fa042a71aee124b7b667d97fd84c0a309e72aefcae5d95762bc05d39cbeedae88122758f8625910a669271251d5f561a1c2749c6d66664f5d35dcc8c608c1a89": {
                    "ip"    : "::1",
                    "name"  : "test device desktop",
                    "port"  : 0,
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
                    }
                }
            },
            shareType: "device",
            status: "active"
        },
        name: "heartbeat complete with share change",
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