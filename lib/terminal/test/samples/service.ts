
/* lib/terminal/test/samples/service - A list of service tests. */

import filePathEncode from "../application/browserUtilities/file_path_encode.js";
import vars from "../../utilities/vars.js";

// cspell:words brotli

const serviceTests = function terminal_test_samples_services():test_service[] {
    const service:test_service[] = [],
        base64:string = "ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAiYWx3YXlzU3RyaWN0IjogdHJ1ZSwKICAgICAgICAibW9kdWxlIjogIkVTMjAyMCIsCiAgICAgICAgIm1vZHVsZVJlc29sdXRpb24iOiAibm9kZSIsCiAgICAgICAgIm91dERpciI6ICIuL2pzL2xpYiIsCiAgICAgICAgIm5vRW1pdCI6IHRydWUsCiAgICAgICAgIm5vSW1wbGljaXRBbnkiOiB0cnVlLAogICAgICAgICJwcmV0dHkiOiB0cnVlLAogICAgICAgICJzdHJpY3RGdW5jdGlvblR5cGVzIjogdHJ1ZSwKICAgICAgICAidGFyZ2V0IjogIkVTMjAyMCIsCiAgICAgICAgInR5cGVzIjogWyJub2RlIl0sCiAgICAgICAgInR5cGVSb290cyI6IFsiLi9ub2RlX21vZHVsZXMvQHR5cGVzIl0KICAgIH0sCiAgICAiZXhjbHVkZSI6IFsKICAgICAgICAianMiLAogICAgICAgICJsaWIvdGVybWluYWwvdGVzdC9zdG9yYWdlVGVzdC90ZW1wIiwKICAgICAgICAiKiovbm9kZV9tb2R1bGVzIiwKICAgICAgICAiKiovLiovIgogICAgXSwKICAgICJpbmNsdWRlIjogWwogICAgICAgICIqKi8qLnRzIgogICAgXQp9",
        hash:string = "7afd87e5c2ba29c3b437413d16e239fd4757881ffae55e347bbe2b4f1ab41bc97f1434523e06bc51101029a029f2eb13388117481321137af7bee17b452014e9",
        remoteDevice1:string = "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
        remoteDevice2:string = "fa042a71aee124b7b667d97fd84c0a309e72aefcae5d95762bc05d39cbeedae88122758f8625910a669271251d5f561a1c2749c6d66664f5d35dcc8c608c1a89",
        storagePath:string = "lib/terminal/test/storageTest/temp/",
        inviteResponse = function terminal_test_samples_services_inviteResponse(message:string, status:string, action:string):socketData {
            return {
                data: {
                    action: `invite-${action}` as inviteAction,
                    agentRequest: {
                        devices: {
                            "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594": {
                                deviceData: {
                                    cpuCores: 1,
                                    cpuID: "",
                                    memTotal: 0,
                                    osName: "",
                                    osType: "",
                                    osUptime: 0,
                                    osVersion: "",
                                    platform: ""
                                },
                                ipAll: null,
                                ipSelected: "",
                                name: "test local device",
                                ports: {
                                    http: 9999,
                                    ws: 9999
                                },
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
                                },
                                status: "active"
                            },
                            "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e": {
                                deviceData: {
                                    cpuCores: 1,
                                    cpuID: "",
                                    memTotal: 0,
                                    osName: "",
                                    osType: "",
                                    osUptime: 0,
                                    osVersion: "",
                                    platform: ""
                                },
                                ipAll: null,
                                ipSelected: "",
                                name: "test local laptop",
                                ports: {
                                    http: 9999,
                                    ws: 9999
                                },
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
                                },
                                status: "active"
                            },
                            "fa042a71aee124b7b667d97fd84c0a309e72aefcae5d95762bc05d39cbeedae88122758f8625910a669271251d5f561a1c2749c6d66664f5d35dcc8c608c1a89": {
                                deviceData: {
                                    cpuCores: 1,
                                    cpuID: "",
                                    memTotal: 0,
                                    osName: "",
                                    osType: "",
                                    osUptime: 0,
                                    osVersion: "",
                                    platform: ""
                                },
                                ipAll: null,
                                ipSelected: "",
                                name: "test device device",
                                ports: {
                                    http: 9999,
                                    ws: 9999
                                },
                                shares: {
                                    "36b0d1a2ddc81858b0339d3296b4f69513b779a122ec279ea71a1cb50231952e5f5ba9197c6438e91cd3d8bd6b3d5feee78ce4fd0e4386abe3af0487449a02d7": {
                                        execute: false,
                                        name: "C:\\mp3\\deviceDesktop",
                                        readOnly: true,
                                        type: "directory"
                                    },
                                    "71f79d5cc211b5fa52f95a33ad9aaa4b6bf3ad3951ac06365ee316e5f4da70811fd3ed8fa585024009683cf83e40fd31211b1a36324dfc79148d12dea16fbcef": {
                                        execute: false,
                                        name: "E:\\deviceDesktop",
                                        readOnly: false,
                                        type: "directory"
                                    },
                                    "768b031d795208e4adca58a4908161e77d61132c3e6ef5a76960fcd51b05f1e96ada60af01b3a9561f5c061a6e9dabc311e9970853b8b5ce0c1f0966b02315e7": {
                                        execute: false,
                                        name: "C:\\deviceDesktop\\notes.pdf",
                                        readOnly: true,
                                        type: "file"
                                    }
                                },
                                status: "active"
                            }
                        },
                        hashDevice: vars.identity.hashDevice,
                        hashUser: vars.identity.hashUser,
                        ipAll: null,
                        ipSelected: "",
                        modal: "test-modal-requestor",
                        nameDevice: "old desktop computer",
                        nameUser: "local user name",
                        ports: {
                            http: 9999,
                            ws: 9999
                        },
                        shares: {}
                    },
                    agentSource: {
                        devices: {},
                        hashDevice: "",
                        hashUser: "",
                        ipAll: null,
                        ipSelected: "",
                        modal: "test-modal-responder",
                        nameDevice: "responding device",
                        nameUser: "responding user",
                        ports: {
                            http: 9999,
                            ws: 9999
                        },
                        shares: {}
                    },
                    message: message,
                    status: status,
                    type: "device"
                } as service_invite,
                service: "invite"
            };
        },
        testLocation:string = filePathEncode("absolute", storagePath.slice(0, storagePath.length - 1)),
        self = function terminal_test_samples_self(address:string):fileAgent {
            return {
                device: vars.identity.hashDevice,
                modalAddress: address,
                share: "",
                user: vars.identity.hashUser
            };
        };

    // file service tests
    service.push({
        command: {
            data: {
                action: "fs-base64",
                agentRequest: self(null),
                agentSource: self(""),
                agentWrite: null,
                depth: 1,
                location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
                name: "",
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-base64, Base 64 Local",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                files: [{
                    content: base64,
                    id: "some-modal-id",
                    path: filePathEncode("absolute", "tsconfig.json")
                }],
                type: "base64"
            },
            service: "file-system-string"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-base64",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 1,
                location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-base64, Base 64 Remote Device",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                files: [{
                    content: base64,
                    id: "some-modal-id",
                    path: filePathEncode("absolute", "tsconfig.json")
                }],
                type: "base64"
            },
            service: "file-system-string"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-details",
                agentRequest: self(null),
                agentSource: self(""),
                agentWrite: null,
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
                agentRequest: self(null),
                dirs: [
                    [filePathEncode("absolute", "tsconfig.json"), "file", "", 0, 0, null, ""]
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
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
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
                agentRequest: self(null),
                dirs: [
                    [filePathEncode("absolute", "tsconfig.json"), "file", "", 0, 0, null, ""]
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
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceTestLocal`)],
                name: "directory"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-new, Local New Directory",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                fileList:[
                    [testLocation,"directory","",0,2,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal`),"directory", "", 0, 0, null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file", "", 0, 0, null, ""]
                ],
                message: "1 directory, XXXX file, XXXX symbolic links, XXXX errors"
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-new",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceTestLocal.json`)],
                name: "file"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-new, Local New File",
        qualifier: "is",
        test: {
            data:{
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,3,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: "1 directory, XXXX files, XXXX symbolic links, XXXX errors"
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-new",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceTestRemote`)],
                name: "directory"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-new, Remote Device New Directory",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,4,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestRemote`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: "2 directories, XXXX files, XXXX symbolic links, XXXX errors"
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-new",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceTestRemote.json`)],
                name: "file"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-new, Remote Device New File",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,5,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestRemote`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestRemote.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: "2 directories, XXXX files, XXXX symbolic links, XXXX errors"
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-write",
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceTestLocal.json`)],
                name: "local test fragment"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-write, Write Local",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                files: [
                    {
                        content: "Saved to disk!",
                        id: "local test fragment",
                        path: filePathEncode("absolute", `${storagePath}serviceTestLocal.json`)
                    }
                ],
                type: "read"
            },
            service: "file-system-string"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-write",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceTestRemote.json`)],
                name: "remote device text fragment"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-write, Write Remote Device to Local",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                files: [
                    {
                        content: "Saved to disk!",
                        id: "remote device text fragment",
                        path: filePathEncode("absolute", `${storagePath}serviceTestRemote.json`)
                    }
                ],
                type: "read"
            },
            service: "file-system-string"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-read",
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                depth: 1,
                location: [`new-window-id:${filePathEncode("absolute", `${storagePath}serviceTestLocal.json`)}`],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-read, Read Local",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                files: [
                    {
                        content: "local test fragment",
                        id: "new-window-id",
                        path: filePathEncode("absolute", `${storagePath}serviceTestLocal.json`)
                    }
                ],
                type: "read"
            },
            service: "file-system-string"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-read",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 1,
                location: [`new-window-remote-id:${filePathEncode("absolute", `${storagePath}serviceTestRemote.json`)}`],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-read, Read Remote Device",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                files: [
                    {
                        content: "remote device text fragment",
                        id: "new-window-remote-id",
                        path: filePathEncode("absolute", `${storagePath}serviceTestRemote.json`)
                    }
                ],
                type: "read"
            },
            service: "file-system-string"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-rename",
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceTestLocal`)],
                name: "serviceLocal"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-rename, Rename Local Directory",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,5,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestRemote`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestRemote.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: `Renamed serviceLocal from ${filePathEncode("absolute", `${storagePath}serviceTestLocal`)}`
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-rename",
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceTestLocal.json`)],
                name: "serviceLocal.json"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-rename, Rename Local File",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,5,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestRemote`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestRemote.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: `Renamed serviceLocal.json from ${filePathEncode("absolute", `${storagePath}serviceTestLocal.json`)}`
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-rename",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceTestRemote`)],
                name: "serviceRemote"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-rename, Rename Remote Device Directory",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,5,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceTestRemote.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: `Renamed serviceRemote from ${filePathEncode("absolute", `${storagePath}serviceTestRemote`)}`
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-rename",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceTestRemote.json`)],
                name: "serviceRemote.json"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-rename, Rename Remote Device File",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,5,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: `Renamed serviceRemote.json from ${filePathEncode("absolute", `${storagePath}serviceTestRemote.json`)}`
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-directory",
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                depth: 2,
                location: [testLocation],
                name: ".js"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-directory, Directory Local 1",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,5,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: "2 directories, XXXX files, XXXX symbolic links, XXXX errors"
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-directory",
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                depth: 2,
                location: [filePathEncode("absolute", `${storagePath}serviceLocal.json`)],
                name: ".js"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-directory, Directory Local 2",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                fileList: [
                    [filePathEncode("absolute", `${storagePath}serviceLocal.json`),"file","",0,0,null, ""]
                ],
                message: "0 directories, XXXX files, XXXX symbolic links, XXXX errors"
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-directory",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 2,
                location: [testLocation],
                name: ".js"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-directory, Directory Remote Device 1",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,5,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: "2 directories, XXXX files, XXXX symbolic links, XXXX errors"
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-directory",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 2,
                location: [testLocation],
                name: ".js"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-directory, Directory Remote Device 2",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,5,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: "2 directories, XXXX files, XXXX symbolic links, XXXX errors"
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-search",
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                depth: 0,
                location: [testLocation],
                name: ".json"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-search, Search Local 1",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                fileList: [
                    [filePathEncode("absolute", `${storagePath}serviceLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote.json`),"file","",0,0,null, ""]
                ],
                message: `search-Directory fragment search "<em>.json</em>" returned <strong>2</strong> matches from <em>${testLocation}</em>.`
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-search",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 0,
                location: [testLocation],
                name: ".json"
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-search, Search Remote Device 1",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                fileList: [
                    [filePathEncode("absolute", `${storagePath}serviceLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote.json`),"file","",0,0,null, ""]
                ],
                message: `search-Directory fragment search "<em>.json</em>" returned <strong>2</strong> matches from <em>${testLocation}</em>.`
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-destroy",
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceLocal`)],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-destroy, Destroy Local Directory",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,4,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceLocal.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: "Destroyed XXXX file system item"
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-destroy",
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceLocal.json`)],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-destroy, Destroy Local File",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,3,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote`),"directory","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: "Destroyed XXXX file system item"
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-destroy",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceRemote`)],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-destroy, Destroy Remote Device Directory",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,2,null, ""],
                    [filePathEncode("absolute", `${storagePath}serviceRemote.json`),"file","",0,0,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: "Destroyed XXXX file system item"
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-destroy",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", `${storagePath}serviceRemote.json`)],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-destroy, Destroy Remote Device File",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                fileList: [
                    [testLocation,"directory","",0,1,null, ""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null, ""]
                ],
                message: "Destroyed XXXX file system item"
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-hash",
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: null,
                depth: 1,
                location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-hash, Hash Local",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                files: [
                    {
                        content: hash,
                        id: "some-modal-id",
                        path: filePathEncode("absolute", "tsconfig.json")
                    }
                ],
                type: "hash"
            },
            service: "file-system-string"
        }
    });
    service.push({
        command: {
            data: {
                action: "fs-hash",
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: null,
                depth: 1,
                location: [`some-modal-id:${filePathEncode("absolute", "tsconfig.json")}`],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-hash, Hash Remote Device",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                files: [
                    {
                        content: hash,
                        id: "some-modal-id",
                        path: filePathEncode("absolute", "tsconfig.json")
                    }
                ],
                type: "hash"
            },
            service: "file-system-string"
        }
    });

    // file copy tests
    service.push({
        artifact: filePathEncode("absolute", `${testLocation}/tsconfig.json`),
        command: {
            data: {
                agentRequest: self(null),
                agentSource: self(""),
                agentWrite: self(testLocation),
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "tsconfig.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy Local to Local",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: self(""),
                fileList: [
                    [testLocation,"directory","",0,2,null,""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig.json`),"file","",0,0,null,""]
                ],
                message: "Writing XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures."
            },
            service: "file-system-status"
        }
    });
    service.push({
        artifact: filePathEncode("absolute", `${testLocation}/tsconfig.json`),
        command: {
            data: {
                agentRequest: self(null),
                agentSource: self(""),
                agentWrite: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "tsconfig.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy Local to Remote Device",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share:"",
                    user: vars.identity.hashUser
                },
                agentWrite: self(""),
                fileList: [
                    [testLocation,"directory","",0,3,null,""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig.json`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig_0.json`),"file","",0,0,null,""]
                ],
                message: "Writing XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures."
            },
            service: "file-system-status"
        }
    });
    service.push({
        artifact: filePathEncode("absolute", `${testLocation}tsconfig.json`),
        command: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: self(testLocation),
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "tsconfig.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy Remote Device to Local",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: self(testLocation),
                agentWrite: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: vars.identity.hashUser
                },
                fileList: [
                    [testLocation,"directory","",0,4,null,""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig.json`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig_0.json`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig_1.json`),"file","",0,0,null,""]
                ],
                message: "Writing XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures."
            },
            service: "file-system-status"
        }
    });
    service.push({
        command: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: {
                    device: remoteDevice2,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "version.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy from Remote Device to different Remote Device",
        qualifier: "is",
        test:  {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice2,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: vars.identity.hashUser
                },
                fileList: [
                    [testLocation,"directory","",0,5,null,""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig.json`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig_0.json`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig_1.json`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}version.json`),"file","",0,0,null,""]
                ],
                message: "Writing XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures."
            },
            service: "file-system-status"
        }
    });
    service.push({
        artifact: filePathEncode("absolute", `${testLocation}tsconfig.json`),
        command: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                cut: false,
                execute: false,
                location: [filePathEncode("absolute", "tsconfig.json")]
            } as service_copy,
            service: "copy"
        },
        name: "copy, Copy Remote Device to Same Remote Device 1",
        qualifier: "is",
        test: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: vars.identity.hashUser
                },
                agentWrite: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: vars.identity.hashUser
                },
                fileList: [
                    [testLocation,"directory","",0,6,null,""],
                    [filePathEncode("absolute", `${storagePath}temp.txt`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig.json`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig_0.json`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig_1.json`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}tsconfig_2.json`),"file","",0,0,null,""],
                    [filePathEncode("absolute", `${storagePath}version.json`),"file","",0,0,null,""]
                ],
                message: "Writing XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures."
            },
            service: "file-system-status"
        }
    });

    // settings tests
    // * test criteria is a literal reflection of the object submitted
    service.push({
        command: {
            data: {
                settings: {
                    [vars.identity.hashDevice]: {
                        ipAll: null,
                        ipSelected: "",
                        name: "local device name",
                        ports: {
                            http: 443,
                            ws: 0
                        },
                        shares: {
                            [vars.identity.hashDevice]: {
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
        name: "settings device, Local device settings",
        qualifier: "is",
        test: {
            data: {
                settings: {
                    [vars.identity.hashDevice]: {
                        ipAll: null,
                        ipSelected: "",
                        name: "local device name",
                        ports: {
                            http: 9999,
                            ws: 9999
                        },
                        shares: {
                            [vars.identity.hashDevice]: {
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
        }
    });
    service.push({
        command: {
            data: {
                settings: [{
                    agentFrom: vars.identity.hashDevice,
                    agentTo: remoteDevice1,
                    agentType: "device",
                    date: 1616070795053,
                    message: "text message"
                }] as service_message,
                type: "message"
            } as service_settings,
            service: "settings"
        },
        name: "settings message, Local message",
        qualifier: "is",
        test: {
            data: {
                settings: [{
                    agentFrom: vars.identity.hashDevice,
                    agentTo: remoteDevice1,
                    agentType: "device",
                    date: 1616070795053,
                    message: "text message"
                }] as service_message,
                type: "message"
            } as service_settings,
            service: "settings"
        }
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
                            [vars.identity.hashDevice]: ["fff", "eee"]
                        },
                        user: {}
                    },
                    fileSort: "file-system-type",
                    hashDevice: vars.identity.hashDevice,
                    hashType: "sha3-512",
                    hashUser: vars.identity.hashUser,
                    minimizeAll: false,
                    modals: {
                        "configuration-modal": {
                            agent: vars.identity.hashDevice,
                            agentIdentity: false,
                            agentType: "device",
                            content: null,
                            inputs: [
                                "close", "maximize", "minimize"
                            ],
                            read_only: false,
                            single: true,
                            status: "hidden",
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
                        "configuration", "file-navigate", "invite-request"
                    ],
                    nameDevice: "this device name",
                    nameUser: "local user name",
                    statusTime: 15000,
                    storage: filePathEncode("absolute", "lib/storage"),
                    tutorial: false,
                    zIndex: 6
                },
                type: "ui"
            } as service_settings,
            service: "settings"
        },
        name: "settings configuration, Local settings",
        qualifier: "is",
        test: {
            data: {
                settings: {
                    audio: true,
                    brotli: 7,
                    color: "default",
                    colors: {
                        device: {
                            [vars.identity.hashDevice]: ["fff", "eee"]
                        },
                        user: {}
                    },
                    fileSort: "file-system-type",
                    hashDevice: vars.identity.hashDevice,
                    hashType: "sha3-512",
                    hashUser: vars.identity.hashUser,
                    minimizeAll: false,
                    modals: {
                        "configuration-modal": {
                            agent: vars.identity.hashDevice,
                            agentIdentity: false,
                            agentType: "device",
                            content: null,
                            inputs: [
                                "close", "maximize", "minimize"
                            ],
                            read_only: false,
                            single: true,
                            status: "hidden",
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
                        "configuration", "file-navigate", "invite-request"
                    ],
                    nameDevice: "this device name",
                    nameUser: "local user name",
                    statusTime: 15000,
                    storage: filePathEncode("absolute", "lib/storage"),
                    tutorial: false,
                    zIndex: 6
                },
                type: "ui"
            } as service_settings,
            service: "settings"
        }
    });
    service.push({
        command: {
            data: {
                settings: {
                    [vars.identity.hashDevice]: {
                        ipAll: null,
                        ipSelected: "",
                        name: "remote user name",
                        ports: {
                            http: 443,
                            ws: 0
                        },
                        shares: {
                            [vars.identity.hashDevice]: {
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
        name: "settings user, Local user",
        qualifier: "is",
        test: {
            data: {
                settings: {
                    [vars.identity.hashDevice]: {
                        ipAll: null,
                        ipSelected: "",
                        name: "remote user name",
                        ports: {
                            http: 9999,
                            ws: 9999
                        },
                        shares: {
                            [vars.identity.hashDevice]: {
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
        }
    });


    // invitation tests
    service.push({
        command: {
            data: {
                action: "invite-request",
                agentRequest: {
                    devices: vars.agents.device,
                    hashDevice: vars.identity.hashDevice,
                    hashUser: vars.identity.hashUser,
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: {}
                },
                agentSource: {
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: "",
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
        qualifier: "is",
        test: {
            data: {
                action: "invite-complete",
                agentRequest: {
                    devices: {
                        "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594": {
                            deviceData: {
                                cpuCores: 1,
                                cpuID: "",
                                memTotal: 0,
                                osName: "",
                                osType: "",
                                osUptime: 0,
                                osVersion: "",
                                platform: ""
                            },
                            ipAll: null,
                            ipSelected: "",
                            name: "test local device",
                            ports: {
                                http: 9999,
                                ws: 9999
                            },
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
                            },
                            status: "active"
                        },
                        "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e": {
                            deviceData: {
                                cpuCores: 1,
                                cpuID: "",
                                memTotal: 0,
                                osName: "",
                                osType: "",
                                osUptime: 0,
                                osVersion: "",
                                platform: ""
                            },
                            ipAll: null,
                            ipSelected: "",
                            name: "test local laptop",
                            ports: {
                                http: 9999,
                                ws: 9999
                            },
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
                            },
                            status: "active"
                        },
                        "fa042a71aee124b7b667d97fd84c0a309e72aefcae5d95762bc05d39cbeedae88122758f8625910a669271251d5f561a1c2749c6d66664f5d35dcc8c608c1a89": {
                            deviceData: {
                                cpuCores: 1,
                                cpuID: "",
                                memTotal: 0,
                                osName: "",
                                osType: "",
                                osUptime: 0,
                                osVersion: "",
                                platform: ""
                            },
                            ipAll: null,
                            ipSelected: "",
                            name: "test device device",
                            ports: {
                                http: 9999,
                                ws: 9999
                            },
                            shares: {
                                "36b0d1a2ddc81858b0339d3296b4f69513b779a122ec279ea71a1cb50231952e5f5ba9197c6438e91cd3d8bd6b3d5feee78ce4fd0e4386abe3af0487449a02d7": {
                                    execute: false,
                                    name: "C:\\mp3\\deviceDesktop",
                                    readOnly: true,
                                    type: "directory"
                                },
                                "71f79d5cc211b5fa52f95a33ad9aaa4b6bf3ad3951ac06365ee316e5f4da70811fd3ed8fa585024009683cf83e40fd31211b1a36324dfc79148d12dea16fbcef": {
                                    execute: false,
                                    name: "E:\\deviceDesktop",
                                    readOnly: false,
                                    type: "directory"
                                },
                                "768b031d795208e4adca58a4908161e77d61132c3e6ef5a76960fcd51b05f1e96ada60af01b3a9561f5c061a6e9dabc311e9970853b8b5ce0c1f0966b02315e7": {
                                    execute: false,
                                    name: "C:\\deviceDesktop\\notes.pdf",
                                    readOnly: true,
                                    type: "file"
                                }
                            },
                            status: "active"
                        }
                    },
                    hashDevice: vars.identity.hashDevice,
                    hashUser: vars.identity.hashUser,
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop",
                    nameUser: "local user name",
                    ports: {
                        http: 9999,
                        ws: 9999
                    },
                    shares: {}
                },
                agentSource: {
                    devices: {
                        "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594": {
                            deviceData: {
                                cpuCores: 1,
                                cpuID: "",
                                memTotal: 0,
                                osName: "",
                                osType: "",
                                osUptime: 0,
                                osVersion: "",
                                platform: ""
                            },
                            ipAll: null,
                            ipSelected: "",
                            name: "test local device",
                            ports: {
                                http: 9999,
                                ws: 9999
                            },
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
                            },
                            status: "active"
                        },
                        "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e": {
                            deviceData: {
                                cpuCores: 1,
                                cpuID: "",
                                memTotal: 0,
                                osName: "",
                                osType: "",
                                osUptime: 0,
                                osVersion: "",
                                platform: ""
                            },
                            ipAll: null,
                            ipSelected: "",
                            name: "test local laptop",
                            ports: {
                                http: 9999,
                                ws: 9999
                            },
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
                            },
                            status: "active"
                        },
                        "fa042a71aee124b7b667d97fd84c0a309e72aefcae5d95762bc05d39cbeedae88122758f8625910a669271251d5f561a1c2749c6d66664f5d35dcc8c608c1a89": {
                            deviceData: {
                                cpuCores: 1,
                                cpuID: "",
                                memTotal: 0,
                                osName: "",
                                osType: "",
                                osUptime: 0,
                                osVersion: "",
                                platform: ""
                            },
                            ipAll: null,
                            ipSelected: "",
                            name: "test device device",
                            ports: {
                                http: 9999,
                                ws: 9999
                            },
                            shares: {
                                "36b0d1a2ddc81858b0339d3296b4f69513b779a122ec279ea71a1cb50231952e5f5ba9197c6438e91cd3d8bd6b3d5feee78ce4fd0e4386abe3af0487449a02d7": {
                                    execute: false,
                                    name: "C:\\mp3\\deviceDesktop",
                                    readOnly: true,
                                    type: "directory"
                                },
                                "71f79d5cc211b5fa52f95a33ad9aaa4b6bf3ad3951ac06365ee316e5f4da70811fd3ed8fa585024009683cf83e40fd31211b1a36324dfc79148d12dea16fbcef": {
                                    execute: false,
                                    name: "E:\\deviceDesktop",
                                    readOnly: false,
                                    type: "directory"
                                },
                                "768b031d795208e4adca58a4908161e77d61132c3e6ef5a76960fcd51b05f1e96ada60af01b3a9561f5c061a6e9dabc311e9970853b8b5ce0c1f0966b02315e7": {
                                    execute: false,
                                    name: "C:\\deviceDesktop\\notes.pdf",
                                    readOnly: true,
                                    type: "file"
                                }
                            },
                            status: "active"
                        }
                    },
                    hashDevice: "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594",
                    hashUser: vars.identity.hashUser,
                    ipAll: null,
                    ipSelected: "",
                    modal: "",
                    nameDevice: "test local device",
                    nameUser: "test local user",
                    ports: {
                        http: 9999,
                        ws: 9999
                    },
                    shares: {
                        "a89e4ac7eec0c4b557aab68ad7499dd136d21d8eb2e5f51a6973dcf5f854b9a1895bec63f3a9d1b5e6243524e6bb8bc29d34c9741c1fc7fc77a7f0e8a934d153": {
                            "execute": false,
                            "name": "C:\\mp3\\deviceLocal",
                            "readOnly": true,
                            "type": "directory"
                        },
                        "16f07e8ed7225f07912da48e0d51308e8fbf9dafc89d8accaa58abc1da8a2832a046082bfc2534eb4933a00bd673019cb90437c8a94cc0d0adaf9cff40c5083b": {
                            "execute": false,
                            "name": "E:\\deviceLocal",
                            "readOnly": false,
                            "type": "directory"
                        },
                        "2772fe10a1f1efe6a34c01408dc6bf51fa43ba657c72cff9f77c02a96eb61490b995325330a1b954e1e8e6e55d87003840e65c223e1e465d1a30486dfdef1211": {
                            "execute": false,
                            "name": "C:\\deviceLocal\\notes.pdf",
                            "readOnly": true,
                            "type": "file"
                        }
                    }
                },
                message: "Accepted invitation. Request processed at responding terminal XXXX for type device.  Agent already present, so auto accepted and returned to requesting terminal.",
                status: "accepted",
                type: "device"
            } as service_invite,
            service: "invite"
        }
    });
    service.push({
        command: {
            data: {
                action: "invite-response",
                agentRequest: {
                    devices: vars.agents.device,
                    hashDevice: vars.identity.hashDevice,
                    hashUser: vars.identity.hashUser,
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: {}
                },
                agentSource: {
                    devices: {},
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: "",
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
        qualifier: "is",
        test: {
            data: {
                action: "invite-complete",
                agentRequest: {
                    devices: {
                        "7f22346707be198af81ac14d5f718875ba67f67fb94bd2256c226fb8c676301f153bdd972818bc5b00aab7ee38190e9374d8e75e600ed5bbbddf4dbc5d5ca594": {
                            deviceData: {
                                cpuCores: 1,
                                cpuID: "",
                                memTotal: 0,
                                osName: "",
                                osType: "",
                                osUptime: 0,
                                osVersion: "",
                                platform: ""
                            },
                            ipAll: null,
                            ipSelected: "",
                            name: "test local device",
                            ports: {
                                http: 9999,
                                ws: 9999
                            },
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
                            },
                            status: "active"
                        },
                        "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e": {
                            deviceData: {
                                cpuCores: 1,
                                cpuID: "",
                                memTotal: 0,
                                osName: "",
                                osType: "",
                                osUptime: 0,
                                osVersion: "",
                                platform: ""
                            },
                            ipAll: null,
                            ipSelected: "",
                            name: "test local laptop",
                            ports: {
                                http: 9999,
                                ws: 9999
                            },
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
                            },
                            status: "active"
                        },
                        "fa042a71aee124b7b667d97fd84c0a309e72aefcae5d95762bc05d39cbeedae88122758f8625910a669271251d5f561a1c2749c6d66664f5d35dcc8c608c1a89": {
                            deviceData: {
                                cpuCores: 1,
                                cpuID: "",
                                memTotal: 0,
                                osName: "",
                                osType: "",
                                osUptime: 0,
                                osVersion: "",
                                platform: ""
                            },
                            ipAll: null,
                            ipSelected: "",
                            name: "test device device",
                            ports: {
                                http: 9999,
                                ws: 9999
                            },
                            shares: {
                                "36b0d1a2ddc81858b0339d3296b4f69513b779a122ec279ea71a1cb50231952e5f5ba9197c6438e91cd3d8bd6b3d5feee78ce4fd0e4386abe3af0487449a02d7": {
                                    execute: false,
                                    name: "C:\\mp3\\deviceDesktop",
                                    readOnly: true,
                                    type: "directory"
                                },
                                "71f79d5cc211b5fa52f95a33ad9aaa4b6bf3ad3951ac06365ee316e5f4da70811fd3ed8fa585024009683cf83e40fd31211b1a36324dfc79148d12dea16fbcef": {
                                    execute: false,
                                    name: "E:\\deviceDesktop",
                                    readOnly: false,
                                    type: "directory"
                                },
                                "768b031d795208e4adca58a4908161e77d61132c3e6ef5a76960fcd51b05f1e96ada60af01b3a9561f5c061a6e9dabc311e9970853b8b5ce0c1f0966b02315e7": {
                                    execute: false,
                                    name: "C:\\deviceDesktop\\notes.pdf",
                                    readOnly: true,
                                    type: "file"
                                }
                            },
                            status: "active"
                        }
                    },
                    hashDevice: vars.identity.hashDevice,
                    hashUser: vars.identity.hashUser,
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 9999,
                        ws: 9999
                    },
                    shares: {}
                },
                agentSource: {
                    devices: {},
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-responder",
                    nameDevice: "responding device",
                    nameUser: "responding user",
                    ports: {
                        http: 9999,
                        ws: 9999
                    },
                    shares: null
                },
                message: "Ignored invitation response processed at responding terminal XXXX and sent to requesting terminal XXXX ",
                status: "ignored",
                type: "device"
            } as service_invite,
            service: "invite"
        }
    });
    service.push({
        command: {
            data: {
                action: "invite-response",
                agentRequest: {
                    devices: vars.agents.device,
                    hashDevice: vars.identity.hashDevice,
                    hashUser: vars.identity.hashUser,
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: {}
                },
                agentSource: {
                    devices: {},
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-responder",
                    nameDevice: "responding device",
                    nameUser: "responding user",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: {}
                },
                message: "Hello",
                status: "accepted",
                type: "device"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-response - Local device invite response, accepted",
        qualifier: "is",
        test: inviteResponse("Accepted invitation response processed at responding terminal XXXX and sent to requesting terminal XXXX ", "accepted", "complete")
    });
    service.push({
        command: {
            data: {
                action: "invite-response",
                agentRequest: {
                    devices: vars.agents.device,
                    hashDevice: vars.identity.hashDevice,
                    hashUser: vars.identity.hashUser,
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: {}
                },
                agentSource: {
                    devices: {},
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-responder",
                    nameDevice: "responding device",
                    nameUser: "responding user",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: {}
                },
                message: "Ignored invitation",
                status: "ignored",
                type: "device"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-response - Local device invite response, ignored",
        qualifier: "is",
        test: inviteResponse("Ignored invitation", "ignored", "response")
    });
    service.push({
        command: {
            data: {
                action: "invite-response",
                agentRequest: {
                    devices: vars.agents.device,
                    hashDevice: vars.identity.hashDevice,
                    hashUser: vars.identity.hashUser,
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: {}
                },
                agentSource: {
                    devices: {},
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-responder",
                    nameDevice: "responding device",
                    nameUser: "responding user",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: {}
                },
                message: "Hello",
                status: "declined",
                type: "device"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-response - Local device invite response, declined",
        qualifier: "is",
        test: inviteResponse("Declined invitation response processed at responding terminal XXXX and sent to requesting terminal XXXX ", "declined", "complete")
    });
    service.push({
        command: {
            data: {
                action: "invite-complete",
                agentRequest: {
                    devices: vars.agents.device,
                    hashDevice: vars.identity.hashDevice,
                    hashUser: vars.identity.hashUser,
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: {}
                },
                agentSource: {
                    devices: {},
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-responder",
                    nameDevice: "responding device",
                    nameUser: "responding user",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: {}
                },
                message: "Hello",
                status: "accepted",
                type: "device"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-complete - Local user invite complete, accepted",
        qualifier: "is",
        test: inviteResponse("Accepted invitation returned from device 'responding device'.", "accepted", "complete")
    });
    service.push({
        command: {
            data: {
                action: "invite-complete",
                agentRequest: {
                    devices: vars.agents.device,
                    hashDevice: vars.identity.hashDevice,
                    hashUser: vars.identity.hashUser,
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-requestor",
                    nameDevice: "old desktop computer",
                    nameUser: "local user name",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: {}
                },
                agentSource: {
                    devices: {},
                    hashDevice: "",
                    hashUser: "",
                    ipAll: null,
                    ipSelected: "",
                    modal: "test-modal-responder",
                    nameDevice: "responding device",
                    nameUser: "responding user",
                    ports: {
                        http: 443,
                        ws: 0
                    },
                    shares: {}
                },
                message: "Ignored invitation",
                status: "ignored",
                type: "device"
            } as service_invite,
            service: "invite"
        },
        name: "invite, invite-complete - Local user invite complete, ignored",
        qualifier: "is",
        test: inviteResponse("Ignored invitation", "ignored", "complete")
    });
    return service;
};

export default serviceTests;