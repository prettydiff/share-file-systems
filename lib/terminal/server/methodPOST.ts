
/* lib/terminal/server/methodPOST - The library for handling all traffic related to HTTP requests with method POST. */

import { IncomingMessage, ServerResponse } from "http";
import { StringDecoder } from "string_decoder";

import hash from "../commands/hash.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import heartbeat from "./heartbeat.js";
import invite from "./invite.js";
import message from "./message.js";
import response from "./response.js";
import routeCopy from "../fileService/routeCopy.js";
import routeFile from "../fileService/routeFile.js";
import serverVars from "./serverVars.js";
import serviceCopy from "../fileService/serviceCopy.js";
import storage from "./storage.js";
import browser from "../test/application/browser.js";

const methodPOST = function terminal_server_methodPOST(request:IncomingMessage, serverResponse:ServerResponse) {
    let body:string = "";
    const decoder:StringDecoder = new StringDecoder("utf8"),
        end = function terminal_server_methodPOST_end():void {
            const task:requestType = <requestType>request.headers["request-type"],
                actions:postActions = {
                    "agent-online": function terminal_server_methodPOST_end_agentOnline():void {
                        // * processes the response for the agent-online terminal command utility
                        const host:string = (request.headers["agent-type"] === "device")
                            ? serverVars.hashDevice
                            : serverVars.hashUser;
                        response({
                            message: `response from ${host}`,
                            mimeType: "text/plain",
                            responseType: "agent-online",
                            serverResponse: serverResponse
                        });
                    },
                    "browser-log": function terminal_server_methodPOST_end_browserLog():void {
                        const data:any[] = JSON.parse(body);
                        if (serverVars.testType !== "browser" || (serverVars.testType === "browser" && data[0].toString().indexOf("Executing delay on test number") !== 0)) {
                            log(data);
                        }
                        response({
                            message: "browser log received",
                            mimeType: "text/plain",
                            responseType: "browser-log",
                            serverResponse: serverResponse
                        });
                    },
                    "copy": function terminal_server_methodPOST_end_copy():void {
                        // * file system asset movement for both local and remote
                        routeCopy(serverResponse, body);
                    },
                    "copy-file": function terminal_server_methodPOST_end_copyFile():void {
                        // * send file contents as an HTTP response
                        const data:copyFileRequest = JSON.parse(body);
                        serviceCopy.actions.sendFile(serverResponse, data);
                    },
                    "copy-request-file": function terminal_server_methodPOST_end_copyRequestFile():void {
                        // * request individual files from a list generated by serviceCopy.actions.requestList
                        const data:systemRequestFiles = JSON.parse(body);
                        serviceCopy.actions.requestFiles(serverResponse, data);
                    },
                    "delete-agents": function terminal_server_methodPOST_end_deleteAgents():void {
                        // * received a request from the browser to delete agents
                        heartbeat.delete(JSON.parse(body), serverResponse);
                    },
                    "fs": function terminal_server_methodPOST_end_fs():void {
                        // * file system interaction for both local and remote
                        routeFile(serverResponse, body);
                    },
                    "fs-update-remote": function terminal_server_methodPOST_end_fsUpdateRemote():void {
                        // * remote: Changes to the remote user's file system
                        // * local : Update local "File Navigator" modals for the respective remote user
                        vars.testLogger("service", "fs-update-remote", "Sends updated file system data from a remote agent to the local browser.")
                        vars.broadcast("fs-update-remote", body);
                        response({
                            message: `Received directory watch for ${body} at ${serverVars.ipAddress}.`,
                            mimeType: "text/plain",
                            responseType: "fs-update-remote",
                            serverResponse: serverResponse
                        });
                    },
                    "hash-device": function terminal_server_methodPOST_end_hashDevice():void {
                        // * produce a hash that describes a new device
                        const data:hashAgent = JSON.parse(body),
                            hashes:hashAgent = {
                                device: "",
                                user: ""
                            },
                            callbackUser = function terminal_server_methodPOST_end_hashUser(hashUser:hashOutput) {
                                const callbackDevice = function terminal_server_methodPOST_end_hashUser_hashDevice(hashDevice:hashOutput) {
                                    serverVars.hashDevice = hashDevice.hash;
                                    serverVars.nameDevice = data.device;
                                    serverVars.device[serverVars.hashDevice] = {
                                        ip: serverVars.ipAddress,
                                        name: data.device,
                                        port: serverVars.webPort,
                                        shares: {}
                                    };
                                    hashes.device = hashDevice.hash;
                                    storage({
                                        data: serverVars.device,
                                        response: null,
                                        type: "device"
                                    });
                                    response({
                                        message: JSON.stringify(hashes),
                                        mimeType: "application/json",
                                        responseType: "hash-user",
                                        serverResponse: serverResponse
                                    });
                                };
                                serverVars.hashUser = hashUser.hash;
                                serverVars.nameUser = data.user;
                                hashes.user = hashUser.hash;
                                input.callback = callbackDevice;
                                input.source = hashUser.hash + data.device;
                                hash(input);
                            },
                            input:hashInput = {
                                algorithm: "sha3-512",
                                callback: callbackUser,
                                directInput: true,
                                source: data.user + vars.node.os.hostname() + process.env.os + process.hrtime.bigint().toString()
                            };
                        vars.testLogger("service", "hashDevice", "Create a hash to name a device.");
                        hash(input);
                    },
                    "hash-share": function terminal_server_methodPOST_end_hashShare():void {
                        // * generate a hash string to name a share
                        const data:hashShare = JSON.parse(body),
                            input:hashInput = {
                                algorithm: "sha3-512",
                                callback: function terminal_server_methodPOST_end_shareHash(hashData:hashOutput) {
                                    const outputBody:hashShare = JSON.parse(hashData.id),
                                        hashResponse:hashShareResponse = {
                                            device: outputBody.device,
                                            hash: hashData.hash,
                                            share: outputBody.share,
                                            type: outputBody.type
                                        };
                                    response({
                                        message: JSON.stringify(hashResponse),
                                        mimeType: "application/json",
                                        responseType: "hash-share",
                                        serverResponse: serverResponse
                                    });
                                },
                                directInput: true,
                                id: body,
                                source: serverVars.hashUser + serverVars.hashDevice + data.type + data.share
                            };
                        vars.testLogger("service", "hashShare", "Create a hash to name a new share.");
                        hash(input);
                    },
                    "heartbeat-complete": function terminal_server_methodPOST_end_heartbeatComplete():void {
                        // * receipt of a heartbeat pulse on the distant end
                        heartbeat.parse(JSON.parse(body), serverResponse);
                    },
                    "heartbeat-delete-agents": function terminal_server_methodPOST_end_heartbeatDeleteAgents():void {
                        // * received instructions from remote to delete agents
                        heartbeat.deleteResponse(JSON.parse(body), serverResponse);
                    },
                    "heartbeat-status": function terminal_server_methodPOST_end_heartbeatStatus():void {
                        // * the response to a heartbeat at the original requestor
                        vars.broadcast("heartbeat-status", body);
                        response({
                            message: "heartbeat-status",
                            mimeType: "text/plain",
                            responseType: "heartbeat-status",
                            serverResponse: serverResponse
                        });
                    },
                    "heartbeat-update": function terminal_server_methodPOST_end_heartbeatUpdate():void {
                        // * prepare heartbeat pulse for connected agents
                        const dataPackage:heartbeatUpdate = JSON.parse(body);
                        dataPackage.response = serverResponse;
                        heartbeat.update(dataPackage);
                    },
                    "invite": function terminal_server_methodPOST_end_invite():void {
                        // * Handle all stages of invitation
                        invite(JSON.parse(body), serverResponse);
                    },
                    "message": function terminal_server_methodPOST_end_message():void {
                        // * process text messages
                        message(body, serverResponse);
                    },
                    "storage": function terminal_server_methodPOST_end_storage():void {
                        // * local: Writes changes to storage files
                        const dataPackage:storage = JSON.parse(body);
                        dataPackage.response = serverResponse;
                        storage(dataPackage);
                    },
                    "test-browser": function terminal_server_methodPOST_end_testBrowser():void {
                        // * validate a browser test iteration
                        browser.methods.route(JSON.parse(body), serverResponse);
                    }
                };
            actions[task]();
        };

    // request handling
    request.on('data', function terminal_server_methodPOST_data(data:Buffer) {
        body = body + decoder.write(data);
        if (body.length > 1e6) {
            request.connection.destroy();
        }
    });
    request.on("error", function terminal_server_methodPOST_errorRequest(errorMessage:nodeError):void {
        if (errorMessage.code !== "ETIMEDOUT") {
            log([
                `${vars.text.cyan}POST request, ${request.headers["request-type"]}, methodPOST.ts${vars.text.none}`,
                body,
                vars.text.angry + errorMessage.toString() + vars.text.none,
                ""
            ]);
        }
    });
    serverResponse.on("error", function terminal_server_methodPOST_errorResponse(errorMessage:nodeError):void {
        if (errorMessage.code !== "ETIMEDOUT") {
            log([
                `${vars.text.cyan}POST response, ${request.headers["request-type"]}, methodPOST.ts${vars.text.none}`,
                body,
                vars.text.angry + errorMessage.toString() + vars.text.none,
                ""
            ]);
        }
    });

    // request callbacks
    request.on("end", end);
};

export default methodPOST;