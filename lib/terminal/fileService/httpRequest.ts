/* lib/terminal/fileService/httpRequest - Format a properly packaged http request for file services. */

import error from "../utilities/error.js";
import httpClient from "../server/httpClient.js";
import log from "../utilities/log.js";
import response from "../server/response.js";
import serverVars from "../server/serverVars.js";
import vars from "../utilities/vars.js";

const httpRequest = function terminal_fileService_httpRequest(config:fileServiceRequest) {
    if (serverVars[config.data.agentType] === undefined || serverVars[config.data.agentType][config.data.agent] === undefined) {
        error([`Count not resolve IP address for agent ${config.data.agent} of type ${config.data.agentType}.`]);
        return;
    }
    const test:boolean = (vars.command.indexOf("test") === 0),
        payload:fileService = {
            action: config.data.action,
            agent: (test === true)
                ? (config.data.copyType === "device")
                    ? serverVars.hashDevice
                    : serverVars.hashUser
                : config.data.agent,
            agentType: (test === true && config.data.copyAgent !== "")
                ? <agentType>config.data.copyType
                : config.data.agentType,
            copyAgent: (test === true)
                ? config.data.agent
                : config.data.copyAgent,
            copyShare: (test === true)
                ? config.data.share
                : config.data.copyShare,
            copyType: (test === true)
                ? config.data.agentType
                : config.data.copyType,
            depth: config.data.depth,
            id: config.data.id,
            location: config.data.location,
            name: config.data.name,
            originAgent: config.data.originAgent,
            remoteWatch: (config.data.action === "fs-directory")
                ? `${serverVars.ipAddress}_${serverVars.webPort}`
                : (config.data.remoteWatch === undefined)
                    ? null
                    : config.data.remoteWatch,
            share: (test === true)
                ? config.data.copyShare
                : config.data.share,
            watch: config.data.watch
        },
        requestError = function terminal_fileService_httpRequest_requestError(httpError:nodeError):void {
            const copyStatus:copyStatus = {
                    failures: [],
                    id: config.data.id.slice(0, config.data.id.indexOf("|")),
                    message: config.data.id.slice(config.data.id.indexOf("|") + 1)
                },
                fsRemote:fsRemote = {
                    dirs: "missing",
                    fail: [],
                    id: (config.data.id.indexOf("|Copying ") > 0)
                        ? JSON.stringify(copyStatus)
                        : config.data.id
                };
            if (httpError.code !== "ETIMEDOUT" && httpError.code !== "ECONNREFUSED" && (vars.command.indexOf("test") === 0 || vars.command.indexOf("test") !== 0)) {
                log([config.errorMessage, httpError.toString()]);
            }
            response({
                message: JSON.stringify(fsRemote),
                mimeType: "application/json",
                responseType: "fs-update-remote",
                serverResponse: config.serverResponse
            });
        },
        responseError = function terminal_fileService_httpRequest_responseError(httpError:nodeError):void {
            if (httpError.code !== "ETIMEDOUT" && ((vars.command.indexOf("test") === 0 && httpError.code !== "ECONNREFUSED") || vars.command.indexOf("test") !== 0)) {
                log([config.errorMessage, config.errorMessage.toString()]);
                vars.broadcast("error", config.errorMessage);
            }
        },
        httpConfig:httpConfiguration = {
            agentType: config.data.agentType,
            callback: config.callback,
            errorMessage: config.errorMessage,
            ip: serverVars[config.data.agentType][config.data.agent].ip,
            payload: JSON.stringify(payload),
            port: serverVars[config.data.agentType][config.data.agent].port,
            remoteName: config.data.agent,
            requestError: requestError,
            requestType: "fs",
            responseStream: config.stream,
            responseError: responseError
        };
    if (config.data.agentType === "user" && config.data.copyType !== "user") {
        config.data.copyAgent = serverVars.hashUser;
        config.data.copyType = "user";
    } else if (config.data.copyType === "user" && config.data.agentType !== "user") {
        config.data.agent = serverVars.hashUser;
        config.data.agentType = "user";
    }
    vars.testLogger("fileService", "httpRequest", "An abstraction to the httpClient library for the fileService library.");
    httpClient(httpConfig);
};

export default httpRequest;