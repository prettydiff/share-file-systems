
/* lib/terminal/server/methodPOST - The library for handling all traffic related to HTTP requests with method POST. */

import { IncomingMessage, ServerResponse } from "http";
import { StringDecoder } from "string_decoder";

import hash from "../commands/hash.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import heartbeat from "./heartbeat.js";
import invite from "./invite.js";
import readOnly from "./readOnly.js";
import response from "./response.js";
import serverVars from "./serverVars.js";
import storage from "./storage.js";
import browser from "../test/application/browser.js";

const methodPOST = function terminal_server_post(request:IncomingMessage, serverResponse:ServerResponse) {
    let body:string = "";
    const decoder:StringDecoder = new StringDecoder("utf8"),
        end = function terminal_server_post_end():void {
            const hashDevice = function terminal_server_post_end_hashDevice():void {
                const nameData:hashUser = JSON.parse(body).hashDevice,
                        hashes:hashUser = {
                            device: "",
                            user: ""
                        },
                        callbackUser = function terminal_server_post_end_hashUser(hashUser:hashOutput) {
                            const callbackDevice = function terminal_server_post_end_hashUser_hashDevice(hashDevice:hashOutput) {
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
                                response(serverResponse, "text/plain", JSON.stringify(hashes));
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
                            source: nameData.user + vars.node.os.hostname() + process.env.os + process.hrtime().join("")
                        };
                    vars.testLogger("server", "hashDevice", "Create a hash to name a device.");
                    hash(input);
                },
                hashShare = function terminal_server_post_end_hashShare():void {
                    const hashShare:hashShare = JSON.parse(body).hashShare,
                        input:hashInput = {
                            algorithm: "sha3-512",
                            callback: function terminal_server_post_end_shareHash(hashData:hashOutput) {
                                const outputBody:hashShare = JSON.parse(hashData.id).hashShare,
                                    hashResponse:hashShareResponse = {
                                        device: outputBody.device,
                                        hash: hashData.hash,
                                        share: outputBody.share,
                                        type: outputBody.type
                                    };
                                response(serverResponse, "application/json", JSON.stringify({shareHashResponse:hashResponse}));
                            },
                            directInput: true,
                            id: body,
                            source: serverVars.hashUser + serverVars.hashDevice + hashShare.type + hashShare.share
                        };
                    vars.testLogger("server", "hashShare", "Create a hash to name a new share.");
                    hash(input);
                },
                updateRemote = function terminal_server_post_end_updateRemote():void {
                    vars.testLogger("server", "fs-update-remote", "Sends updated file system data from a remote agent to the local browser.")
                    vars.ws.broadcast(body);
                    response(serverResponse, "text/plain", `Received directory watch for ${body} at ${serverVars.ipAddress}.`);
                };
            let task:serverTask = <serverTask>body.slice(0, body.indexOf(":")).replace("{", "").replace(/"/g, "");
            if (task === "heartbeat-update") {
                // * prepare heartbeat pulse for connected agents
                const dataPackage:heartbeatUpdate = JSON.parse(body)["heartbeat-update"];
                dataPackage.response = serverResponse;
                heartbeat.update(dataPackage);
            } else if (task === "heartbeat-complete") {
                // * receipt of a heartbeat pulse on the distant end
                heartbeat.parse(JSON.parse(body)["heartbeat-complete"], serverResponse);
            } else if (task === "heartbeat-status") {
                // * the response to a heartbeat at the original requestor
                vars.ws.broadcast(body);
            } else if (task === "fs") {
                // * file system interaction for both local and remote
                readOnly(request, serverResponse, body);
            } else if (task === "fs-update-remote") {
                // * remote: Changes to the remote user's file system
                // * local : Update local "File Navigator" modals for the respective remote user
                updateRemote();
            } else if (task === "delete-agents") {
                // * received a request from the browser to delete agents
                heartbeat.delete(JSON.parse(body)["delete-agents"], serverResponse);
            } else if (task === "heartbeat-delete-agents") {
                // * received instructions from remote to delete agents
                heartbeat.deleteResponse(JSON.parse(body)["heartbeat-delete-agents"], serverResponse);
            } else if (task === "storage") {
                // * local: Writes changes to storage files
                const dataPackage:storage = JSON.parse(body).storage;
                dataPackage.response = serverResponse;
                storage(dataPackage);
            } else if (task === "hashShare") {
                // * generate a hash string to name a share
                hashShare();
            } else if (task === "hashDevice") {
                // * produce a hash that describes a new device
                hashDevice();
            } else if (task === "invite") {
                // * Handle all stages of invitation
                invite(body, serverResponse);
            } else if (task === "test-browser") {
                // * validate a browser test iteration
                browser.result(JSON.parse(body)["test-browser"], serverResponse);
            } else if (task === "test-browser-loaded") {
                // * browser is ready to receive test samples
                browser.reload(serverResponse);
            }
        };

    // request handling
    request.on('data', function terminal_server_post_data(data:Buffer) {
        body = body + decoder.write(data);
        if (body.length > 1e6) {
            request.connection.destroy();
        }
    });
    request.on("error", function terminal_server_post_errorRequest(errorMessage:nodeError):void {
        if (errorMessage.code !== "ETIMEDOUT") {
            log([body, "request", errorMessage.toString()]);
            vars.ws.broadcast(JSON.stringify({
                error: errorMessage
            }));
        }
    });
    serverResponse.on("error", function terminal_server_post_errorResponse(errorMessage:nodeError):void {
        if (errorMessage.code !== "ETIMEDOUT") {
            log([body, "response"]);
            if (errorMessage.toString().indexOf("write after end") > -1) {
                log([errorMessage.stack]);
            }
            vars.ws.broadcast(JSON.stringify({
                error: errorMessage
            }));
        }
    });

    // request callbacks
    request.on("end", end);
};

export default methodPOST;