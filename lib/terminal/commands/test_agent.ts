
/* lib/terminal/commands/test_agent - A connectivity tester to shared remote agents. */

import {ClientRequest, IncomingMessage, RequestOptions} from "http";

import agents from "../../common/agents.js";
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
            hash:string = storage.settings.hashDevice;
        if (Object.keys(storage.device).length < 1) {
            error([
                `${vars.text.angry}Device data is not present in storage.${vars.text.angry}`,
                `Run the ${vars.text.cyan}server${vars.text.none} command and go to address ${vars.text.cyan}localhost${vars.text.none} in the web browser to initiate device data.`
            ]);
            return;
        }
        if (arg === "list") {
            const store:string[] = [];
            log.title("Agent List");
            agents({
                countBy: "agent",
                perAgent: function terminal_testAgent_storage_perAgent(agentNames:agentNames):void {
                    const text:string = `${vars.text.angry}*${vars.text.none} ${vars.text.green + agentNames.agent + vars.text.none} - ${storage[agentNames.agentType][agentNames.agent].name}, ${storage[agentNames.agentType][agentNames.agent].ip}`;
                    if (agentNames.agent === hash) {
                        store.push(text.replace(" - ", ` - ${vars.text.angry}(local device)${vars.text.none} - `));
                    } else {
                        store.push(text);
                    }
                },
                perAgentType: function terminal_testAgent_storage_perAgentType(agentNames:agentNames):void {
                    store.push("");
                    store.push(`${vars.text.cyan + vars.text.bold + agentNames.agentType.slice(0, 1).toUpperCase() + agentNames.agentType.slice(1)}:${vars.text.none}`);
                    if (agentNames.agentType === "user" && Object.keys(storage.user).length < 1) {
                        store.push("no shared users");
                    }
                },
                source: storage
            });
            log(store, true);
        } else {
            const payload:RequestOptions = {
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
                    const chunks:Buffer[] = [];
                    response.setEncoding("utf8");
                    response.on("data", function terminal_testAgent_storage_callback_data(chunk:Buffer):void {
                        chunks.push(chunk);
                    });
                    response.on("end", function terminal_testAgent_storage_callback_end():void {
                        const body:Buffer|string = (Buffer.isBuffer(chunks[0]) === true)
                            ? Buffer.concat(chunks)
                            : chunks.join("");
                        log([body.toString()], true);
                    });
                    response.on("error", requestError);
                },
                requestError = function terminal_testAgent_storage_error(httpError:nodeError):void {
                    error([
                        `HTTP error on command ${vars.command} from ${storage.settings.nameDevice} to ${storage[agentType][arg].name}:`,
                        httpError.toString()
                    ]);
                },
                request:ClientRequest = vars.node.http.request(payload, callback);
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
        }
    });
};

export default test_agent;