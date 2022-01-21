
/* lib/terminal/test/samples/service - A list of service tests. */

import filePathEncode from "../application/browserUtilities/file_path_encode.js";
import serverVars from "../../server/serverVars.js";
import { SERVFAIL } from "dns";

const serviceTests = function terminal_test_samples_services():testService[] {
    const service:testService[] = [],
        base64:string = "ewogICAgImNvbXBpbGVyT3B0aW9ucyI6IHsKICAgICAgICAiYWx3YXlzU3RyaWN0IjogdHJ1ZSwKICAgICAgICAibW9kdWxlUmVzb2x1dGlvbiI6ICJub2RlIiwKICAgICAgICAib3V0RGlyIjogImpzIiwKICAgICAgICAibm9JbXBsaWNpdEFueSI6IHRydWUsCiAgICAgICAgInByZXR0eSI6IHRydWUsCiAgICAgICAgInN0cmljdEZ1bmN0aW9uVHlwZXMiOiB0cnVlLAogICAgICAgICJ0YXJnZXQiOiAiRVMyMDIwIiwKICAgICAgICAidHlwZXMiOiBbIm5vZGUiXSwKICAgICAgICAidHlwZVJvb3RzIjogWyJub2RlX21vZHVsZXMvQHR5cGVzIl0KICAgIH0sCiAgICAiZXhjbHVkZSI6IFsKICAgICAgICAianMiLAogICAgICAgICJsaWIvdGVybWluYWwvdGVzdC9zdG9yYWdlQnJvd3NlciIsCiAgICAgICAgIioqL25vZGVfbW9kdWxlcyIsCiAgICAgICAgIioqLy4qLyIKICAgIF0sCiAgICAiaW5jbHVkZSI6IFsKICAgICAgICAiKiovKi50cyIKICAgIF0KfQ==",
        hash:string = "8083e63a4e5cf38fe24ca2cf474949180ad9335f59659505fa2b8ad321a09a04628889367ecae5794969c977f0f1c462105595f5a61d8f929f68ddfff75c3a9f",
        remoteDevice1:string = "a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e",
        remoteDevice2:string = "fa042a71aee124b7b667d97fd84c0a309e72aefcae5d95762bc05d39cbeedae88122758f8625910a669271251d5f561a1c2749c6d66664f5d35dcc8c608c1a89",
        storagePath:string = "lib/terminal/test/storageService/test_storage/",
        testLocation:string = filePathEncode("absolute", storagePath.slice(0, storagePath.length - 1)),
        loopback:string = "127.0.0.1",
        self = function terminal_test_samples_self(address:string):fileAgent {
            const absolute:string = (address === null)
                ? ""
                : filePathEncode("absolute", address)
            return {
                device: serverVars.hashDevice,
                modalAddress: address,
                share: "",
                user: serverVars.hashUser
            };
        },
        selfModal:fileAgent = {
            device: serverVars.hashDevice,
            modalAddress: testLocation,
            share: "",
            user: serverVars.hashUser
        };

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
                    user: serverVars.hashUser
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
    /*service.push({
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
            data: {
                agentRequest: self(null),
                agentSource: self(""),
                agentWrite: selfModal,
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
                agentTarget: selfModal,
                fileList: [
                    [testLocation,"directory","",0,2,null],
                    [filePathEncode("absolute", `${storagePath}test_storage.txt`),"file","",0,0,null],
                    [filePathEncode("absolute", `${storagePath}tsconfig.json`),"file","",0,0,null]
                ],
                message: "Copying XXXX 00% complete. XXXX file written at size XXXX (XXXX bytes) with XXXX integrity failures."
            },
            service: "file-system-status"
        }
    });
    service.push({
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
            data: {
                agentRequest: self(null),
                agentSource: self(""),
                agentWrite: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    user: serverVars.hashUser
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
                agentTarget: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share:"",
                    user: serverVars.hashUser
                },
                fileList: null,
                message: "Preparing file copy to device test local laptop."
            },
            service: "file-system-status"
        }
    });
    service.push({
        artifact: filePathEncode("absolute", "lib/settings/tsconfig.json"),
        command: {
            data: {
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: self("lib/settings"),
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
                agentTarget: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    user: serverVars.hashUser
                },
                fileList: null,
                message: "Preparing to transfer XXXX directories and XXXX file at size XXXX."
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
                    user: serverVars.hashUser
                },
                agentWrite: {
                    device: remoteDevice2,
                    modalAddress: testLocation,
                    share: "",
                    user: serverVars.hashUser
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
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", "lib/settings"),
                    share: "",
                    user: serverVars.hashUser
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
    });*/
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
                agentRequest: self(null),
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
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
                agentTarget: self(testLocation),
                fileList:[
                    [testLocation,"directory","",0,2,null],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal`),"directory","",0,0,null],
                    [filePathEncode("absolute", `${storagePath}test_storage.txt`),"file","",0,0,null]
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
                    user: serverVars.hashUser
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
                agentTarget: {
                    device: remoteDevice1,
                    modalAddress: testLocation, 
                    share: "",
                    user: serverVars.hashUser
                },
                fileList: [
                    [testLocation,"directory","",0,3,null],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal`),"directory","",0,0,null],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal.json`),"file","",0,0,null],
                    [filePathEncode("absolute", `${storagePath}test_storage.txt`),"file","",0,0,null]
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
                    user: serverVars.hashUser
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
                agentTarget: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: serverVars.hashUser
                },
                fileList: [
                    [testLocation,"directory","",0,4,null],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal`),"directory","",0,0,null],
                    [filePathEncode("absolute", `${storagePath}serviceTestRemote`),"directory","",0,0,null],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal.json`),"file","",0,0,null],
                    [filePathEncode("absolute", `${storagePath}test_storage.txt`),"file","",0,0,null]
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
                    user: serverVars.hashUser
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
                agentTarget: {
                    device: remoteDevice1,
                    modalAddress: testLocation,
                    share: "",
                    user: serverVars.hashUser
                },
                fileList: [
                    [testLocation,"directory","",0,5,null],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal`),"directory","",0,0,null],
                    [filePathEncode("absolute", `${storagePath}serviceTestRemote`),"directory","",0,0,null],
                    [filePathEncode("absolute", `${storagePath}serviceTestLocal.json`),"file","",0,0,null],
                    [filePathEncode("absolute", `${storagePath}serviceTestRemote.json`),"file","",0,0,null],
                    [filePathEncode("absolute", `${storagePath}test_storage.txt`),"file","",0,0,null]
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
                    user: serverVars.hashUser
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
                    user: serverVars.hashUser
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
        test: ""
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
        test: ""
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
                    user: serverVars.hashUser
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
        test: ""
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
                    user: serverVars.hashUser
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
        test: ""
    });
    /*service.push({
        command: {
            data: {
                action: "fs-destroy",
                agentRequest: {
                    device: serverVars.hashDevice,
                    modalAddress: "",
                    share: "",
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: null,
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: null,
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: null,
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: null,
                depth: 1,
                location: [filePathEncode("absolute", "serviceRemote.json")],
                name: ""
            } as service_fileSystem,
            service: "file-system"
        },
        name: "fs-destroy, Destroy Remote Device File",
        qualifier: "not contains",
        test: {
            agentRequest: {
                device: serverVars.hashDevice,
                modalAddress: "",
                share: "",
                user: serverVars.hashUser
            },
            agentTarget: {
                device: serverVars.hashDevice,
                modalAddress: "test-ID",
                share: "",
                user: serverVars.hashUser
            },
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
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
            data: [{
                content: hash,
                id: "some-modal-id",
                path: filePathEncode("absolute", "tsconfig.json")
            }],
            service: "file-system-string"
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
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
            data: [{
                content: hash,
                id: "some-modal-id",
                path: filePathEncode("absolute", "tsconfig.json")
            }],
            service: "file-system-string"
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: null,
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: null,
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: null,
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: null,
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: null,
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: serverVars.hashDevice,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: null,
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: null,
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
                    user: serverVars.hashUser
                },
                agentSource: {
                    device: remoteDevice1,
                    modalAddress: filePathEncode("absolute", ""),
                    share: "",
                    user: serverVars.hashUser
                },
                agentWrite: null,
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
    });*/
    return service;
};

export default serviceTests;