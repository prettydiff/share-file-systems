
/* lib/terminal/commands/test_agent - A connectivity tester to shared remote agents. */

import {ClientRequest, IncomingMessage, RequestOptions} from "http";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import readStorage from "../utilities/readStorage.js";
import vars from "../utilities/vars.js";

const test_agent = function terminal_testAgent():void {
    vars.verbose = true;
    if (process.argv[0] === undefined) {
        error([
            `${vars.text.angry}Missing parameter for agent hash.${vars.text.none}  Example:`,
            `${vars.text.green + vars.version.command} test_agent a5908e8446995926ab2dd037851146a2b3e6416dcdd68856e7350c937d6e92356030c2ee702a39a8a2c6c58dac9adc3d666c28b96ee06ddfcf6fead94f81054e${vars.text.none}`
        ]);
        return;
    }

    readStorage(function terminal_testAgent_storage(storage:storageItems) {
        const arg:string = process.argv[0],
            agentType:agentType = (storage.device[arg] === undefined)
                ? "user"
                : "device",
            agent:device = storage[agentType][arg],
            hash:string = storage.settings.hashDevice,
            payload:RequestOptions = {
                headers: {
                    agent: hash,
                    agentType: agentType,
                    "request-type": "agent_test"
                },
                host: agent.ip,
                method: "GET",
                path: "/",
                port: agent.port,
                timeout: 1000
            },
            callback = function terminal_testAgent_storage_callback(response:IncomingMessage):void {
                console.log(response);
            },
            requestError = function terminal_testAgent_storage_error(httpError:nodeError):void {
                error([
                    `HTTP error on command ${vars.command} from ${storage.settings.nameDevice} to ${storage[agentType][arg].name}:`,
                    httpError.toString()
                ]);
            },
            request:ClientRequest = vars.node.http.clientRequest(payload, callback);
        if (Object.keys(storage.device).length < 1) {
            error([
                `${vars.text.angry}Device data is not present in storage.${vars.text.angry}`,
                `Run the ${vars.text.cyan}server${vars.text.none} command and go to address ${vars.text.cyan}localhost${vars.text.none} in the web browser to initiate device data.`
            ]);
            return;
        }
        if (agent === undefined) {
            error([`${vars.text.angry}Parameter ${arg} is either not an accepted agent identifier or is not present in storage files device.json or user.json.${vars.text.none}`]);
            return;
        }
        if (arg === hash) {
            log([`The requested agent is this local device.  ${vars.text.angry}No connectivity test performed.${vars.text.none}`], true);
            return;
        }
        request.on("error", requestError);
        request.write(`${vars.version.name} agent test for ${storage[agentType][arg].name} from ${storage.settings.nameDevice}.`);
        request.end();
    });
};

export default test_agent;