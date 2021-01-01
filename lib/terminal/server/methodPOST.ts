
/* lib/terminal/server/methodPOST - The library for handling all traffic related to HTTP requests with method POST. */

import { IncomingMessage, ServerResponse } from "http";
import { StringDecoder } from "string_decoder";

import hash from "../commands/hash.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import heartbeat from "./heartbeat.js";
import invite from "./invite.js";
import message from "./message.js";
import readOnly from "../fileService/readOnly.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
import storage from "./storage.js";
import browser from "../test/application/browser.js";

const methodPOST = function terminal_server_methodPOST(request:IncomingMessage, serverResponse:ServerResponse, host:string) {
    let body:string = "";
    const decoder:StringDecoder = new StringDecoder("utf8"),
        end = function terminal_server_methodPOST_end():void {
            const hashDevice = function terminal_server_methodPOST_end_hashDevice(nameData:hashAgent):void {
                const hashes:hashAgent = {
                            device: "",
                            user: ""
                        },
                        callbackUser = function terminal_server_methodPOST_end_hashUser(hashUser:hashOutput) {
                            const callbackDevice = function terminal_server_methodPOST_end_hashUser_hashDevice(hashDevice:hashOutput) {
                                serverVars.hashDevice = hashDevice.hash;
                                serverVars.nameDevice = nameData.device;
                                serverVars.device[serverVars.hashDevice] = {
                                    ip: serverVars.ipAddress,
                                    name: nameData.device,
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
                            serverVars.nameUser = nameData.user;
                            hashes.user = hashUser.hash;
                            input.callback = callbackDevice;
                            input.source = hashUser.hash + nameData.device;
                            hash(input);
                        },
                        input:hashInput = {
                            algorithm: "sha3-512",
                            callback: callbackUser,
                            directInput: true,
                            source: nameData.user + vars.node.os.hostname() + process.env.os + process.hrtime.bigint().toString()
                        };
                    vars.testLogger("service", "hashDevice", "Create a hash to name a device.");
                    hash(input);
                },
                hashShare = function terminal_server_methodPOST_end_hashShare(hashShare:hashShare):void {
                    const input:hashInput = {
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
                            source: serverVars.hashUser + serverVars.hashDevice + hashShare.type + hashShare.share
                        };
                    vars.testLogger("service", "hashShare", "Create a hash to name a new share.");
                    hash(input);
                },
                updateRemote = function terminal_server_methodPOST_end_updateRemote():void {
                    vars.testLogger("service", "fs-update-remote", "Sends updated file system data from a remote agent to the local browser.")
                    vars.broadcast("fs-update-remote", body);
                    response({
                        message: `Received directory watch for ${body} at ${serverVars.ipAddress}.`,
                        mimeType: "text/plain",
                        responseType: "fs-update-remote",
                        serverResponse: serverResponse
                    });
                };
            let task:requestType = <requestType>request.headers["request-type"];
            if (task === "heartbeat-update") {
                // * prepare heartbeat pulse for connected agents
                const dataPackage:heartbeatUpdate = JSON.parse(body);
                dataPackage.response = serverResponse;
                heartbeat.update(dataPackage);
            } else if (task === "heartbeat-complete") {
                // * receipt of a heartbeat pulse on the distant end
                heartbeat.parse(JSON.parse(body), serverResponse);
            } else if (task === "heartbeat-status") {
                // * the response to a heartbeat at the original requestor
                vars.broadcast("heartbeat-status", body);
                response({
                    message: "heartbeat-status",
                    mimeType: "text/plain",
                    responseType: "heartbeat-status",
                    serverResponse: serverResponse
                });
            } else if (task === "fs") {
                // * file system interaction for both local and remote
                readOnly(host, serverResponse, JSON.parse(body));
            } else if (task === "fs-update-remote") {
                // * remote: Changes to the remote user's file system
                // * local : Update local "File Navigator" modals for the respective remote user
                updateRemote();
            } else if (task === "delete-agents") {
                // * received a request from the browser to delete agents
                heartbeat.delete(JSON.parse(body), serverResponse);
            } else if (task === "heartbeat-delete-agents") {
                // * received instructions from remote to delete agents
                heartbeat.deleteResponse(JSON.parse(body), serverResponse);
            } else if (task === "message") {
                // * process text messages
                message(body, serverResponse);
            } else if (task === "device" || task === "settings" || task === "user") {
                // * local: Writes changes to storage files
                const dataPackage:storage = JSON.parse(body);
                dataPackage.response = serverResponse;
                storage(dataPackage);
            } else if (task === "hash-share") {
                // * generate a hash string to name a share
                hashShare(JSON.parse(body));
            } else if (task === "hash-device") {
                // * produce a hash that describes a new device
                hashDevice(JSON.parse(body));
            } else if (task.indexOf("invite") === 0) {
                // * Handle all stages of invitation
                invite(JSON.parse(body), serverResponse);
            } else if (task === "test-browser") {
                // * validate a browser test iteration
                browser.methods.route(JSON.parse(body), serverResponse);
            }
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