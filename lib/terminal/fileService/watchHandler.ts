/* lib/terminal/fileService/watchHandler - An event handler for file system watch events. */

import directory from "../commands/directory.js";
import error from "../utilities/error.js";
import httpClient from "../server/httpClient.js";
import log from "../utilities/log.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";

const watchHandler = function terminal_fileService_watchHandler(config:fileServiceWatch):void {
    const localDevice:boolean = (config.data.agent === serverVars.hashDevice && config.data.agentType === "device");
    if (config.value.indexOf(vars.projectPath.replace(/(\\|\/)$/, "").replace(/\\/g, "\\\\")) !== 0) {
        if (localDevice === true) {
            if (serverVars.watches[config.value] !== undefined) {
                const now:number = Date.now();
                vars.testLogger("fileService", "watchHandler", "Central watch handler for local device file system");
                if (serverVars.watches[config.value].time > now - 2000) {
                    const fsUpdateCallback = function terminal_fileService_watchHandler_fsUpdateCallback(result:directoryList):void {
                            vars.broadcast("fs-update-local", JSON.stringify(result));
                        },
                        dirConfig:readDirectory = {
                            callback: fsUpdateCallback,
                            depth: 2,
                            exclusions: [],
                            logRecursion: config.logRecursion,
                            mode: "read",
                            path: config.value,
                            symbolic: true
                        };
                    vars.testLogger("fileService", "fsUpdateLocal", "Read from a directory and send the data to the local browser via websocket broadcast.");
                    directory(dirConfig);
                    config.logRecursion = false;
                }
                serverVars.watches[config.value].time = now;
            }
        } else {
            const intervalHandler = function terminal_fileServices_watchHandler_intervalHandler():void {
                    if (serverVars.watches[config.value] === undefined) {
                        clearInterval(interval);
                    } else if (Date.now() > serverVars.watches[config.value].time - 7200000) {
                        serverVars.watches[config.value].close();
                        delete serverVars.watches[config.value];
                        clearInterval(interval);
                    }
                },
                dirConfig:readDirectory = {
                    callback: function terminal_fileService_watchHandler_remote(result:directoryList):void {
                        const update:copyStatusMessage = {
                                address: config.value,
                                agent: config.data.agent,
                                agentType: config.data.agentType,
                                fileList: result,
                                message: ""
                            },
                            payload:string = JSON.stringify(update),
                            requestError = function terminal_fileService_watchHandler_remote_requestError(message:nodeError):void {
                                const copyStatus:copyStatusMessage = {
                                        address: config.value,
                                        agent: config.data.agent,
                                        agentType: config.data.agentType,
                                        fileList: null,
                                        message: message.toString()
                                    },
                                    fsRemote:fsRemote = {
                                        dirs: "missing",
                                        fail: [],
                                        id: (config.data.id.indexOf("|Copying ") > 0)
                                            ? JSON.stringify(copyStatus)
                                            : config.data.id
                                    };
                                if (message.code !== "ETIMEDOUT" && message.code !== "ECONNREFUSED") {
                                    error([errorMessage, message.toString()]);
                                }
                                response({
                                    message: JSON.stringify(fsRemote),
                                    mimeType: "application/json",
                                    responseType: "file-list-status",
                                    serverResponse: config.serverResponse
                                });
                            },
                            responseError = function terminal_fileService_watchHandler_remote_responseError(message:nodeError):void {
                                if (message.code !== "ETIMEDOUT") {
                                    log([errorMessage, errorMessage.toString()]);
                                    vars.broadcast("error", errorMessage);
                                }
                            },
                            errorMessage:string = `Error related to remote file system watch at ${config.data.agent}.`,
                            httpConfig:httpConfiguration = {
                                agentType: config.data.agentType,
                                callback: function terminal_fileService_watchHandler_remote_directoryCallback(message:Buffer|string):void {
                                    response({
                                        message: message.toString(),
                                        mimeType: "application/json",
                                        responseType: "file-list-status",
                                        serverResponse: config.serverResponse
                                    });
                                },
                                errorMessage: errorMessage,
                                ip: serverVars[config.data.agentType][config.data.agent].ip,
                                payload: payload,
                                port: serverVars[config.data.agentType][config.data.agent].port,
                                requestError: requestError,
                                requestType: "file-list-status",
                                responseStream: httpClient.stream,
                                responseError: responseError
                            };
                        httpClient(httpConfig);
                    },
                    depth: 2,
                    exclusions: [],
                    logRecursion: config.logRecursion,
                    mode: "read",
                    path: config.value,
                    symbolic: true
                },
                interval = setInterval(intervalHandler, 60000);
            vars.testLogger("fileService", "watchHandler", "Central watch handler for file systems outside current device, checked against a timed interval");
            if (serverVars.watches[config.value] !== undefined) {
                serverVars.watches[config.value].time = Date.now();
            }
            // create directoryList object and send to remote
            directory(dirConfig);
            config.logRecursion = false;
        }
    }
};

export default watchHandler;