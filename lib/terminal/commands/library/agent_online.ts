
/* lib/terminal/commands/library/agent_online - A connectivity tester to shared remote agents. */

import common from "../../../common/common.js";
import error from "../../utilities/error.js";
import ipResolve from "../../server/transmission/ipResolve.js";
import readStorage from "../../utilities/readStorage.js";
import vars from "../../utilities/vars.js";

const agentOnline = function terminal_commands_library_agentOnline(callback:commandCallback):void {
    vars.settings.verbose = true;

    readStorage(true, function terminal_commands_library_agentOnline_readStorage(settings:settings_item):void {
        const arg:string = process.argv[0],
            type:agentType = (settings.device[arg] === undefined)
                ? "user"
                : "device",
            hash:string = settings.configuration.hashDevice;
        let title:string = "";
        if (Object.keys(settings.device).length < 1) {
            error([
                `${vars.text.angry}Device data is not present in settings.${vars.text.angry}`,
                `Run the ${vars.text.cyan}service${vars.text.none} command and go to address ${vars.text.cyan + vars.network.domain[0] + vars.text.none} in the web browser to initiate device data.`
            ], null, true);
            return;
        }
        if (arg === "list") {
            const store:string[] = [];
            common.agents({
                countBy: "agent",
                perAgent: function terminal_commands_library_agentOnline_readStorage_perAgent(agentNames:agentNames):void {
                    const text:string = `${vars.text.angry}*${vars.text.none} ${vars.text.green + agentNames.agent + vars.text.none} - ${settings[agentNames.agentType][agentNames.agent].name}, ${settings[agentNames.agentType][agentNames.agent].ipSelected}`;
                    if (agentNames.agent === hash) {
                        store.push(text.replace(" - ", ` - ${vars.text.angry}(local device)${vars.text.none} - `));
                    } else {
                        store.push(text);
                    }
                },
                perAgentType: function terminal_commands_library_agentOnline_readStorage_perAgentType(agentNames:agentNames):void {
                    store.push("");
                    store.push(`${vars.text.cyan + vars.text.bold + common.capitalize(agentNames.agentType)}:${vars.text.none}`);
                    if (agentNames.agentType === "user" && Object.keys(settings.user).length < 1) {
                        store.push("no shared users");
                    }
                },
                source: settings
            });
            callback("Agent List", store, null);
        } else {
            const report = function terminal_commands_library_agentOnline_readStorage_report(summary:string):void {
                const output:string[] = [],
                    data:agentSummary = ((arg === "all" || arg === "device" || arg === "user") && summary !== "none")
                        ? JSON.parse(summary) as agentSummary
                        : null,
                    devices:string[] = (data !== null)
                        ? Object.keys(data.device)
                        : [],
                    users:string[] = (data !== null)
                        ? Object.keys(data.user)
                        : [],
                    star:string = `${vars.text.angry}*${vars.text.none}`,
                    offline = function terminal_commands_library_agentOnline_readStorage_report_offline(hash:string):string {
                        return vars.text.angry + hash + vars.text.none;
                    },
                    online = function terminal_commands_library_agentOnline_readStorage_report_online(hash:string):string {
                        return vars.text.green + hash + vars.text.none;
                    };
                let a:number = devices.length;
                if (arg === "all" || arg === "device") {
                    output.push(`${vars.text.cyan + vars.text.bold}Devices:${vars.text.none}`);
                    output.push(`${star} ${online(vars.settings.hashDevice)} - ${offline("(local device)")} - ${vars.settings.device[vars.settings.hashDevice].name}`);
                    if (a > 0) {
                        do {
                            a = a - 1;
                            if (data.device[devices[a]] === "unknown") {
                                output.push(`${star} ${offline(devices[a])} - ${vars.text.angry}unknown device${vars.text.none}`);
                            } else if (data.device[devices[a]] === "online") {
                                output.push(`${star} ${online(devices[a])} - ${vars.settings.device[devices[a]].name}, ${vars.settings.device[devices[a]].ipSelected}`);
                            } else if (data.device[devices[a]] !== "self") {
                                output.push(`${star} ${offline(devices[a])} - ${vars.settings.device[devices[a]].name}, ${vars.text.angry + data.device[devices[a]] + vars.text.none}`);
                            }
                        } while (a > 0);
                    }
                }
                if (arg === "all" || arg === "user") {
                    if (arg === "all") {
                        output.push("");
                    }
                    output.push(`${vars.text.cyan + vars.text.bold}Users:${vars.text.none}`);
                    a = users.length;
                    if (a > 0) {
                        do {
                            a = a - 1;
                            if (data.device[devices[a]] === "unknown") {
                                output.push(`${star} ${offline(users[a])} - ${vars.text.angry}unknown user${vars.text.none}`);
                            } else if (data.device[devices[a]] === "online") {
                                output.push(`${star} ${online(users[a])} - ${vars.settings.device[users[a]].name}, ${vars.settings.user[users[a]].ipSelected}`);
                            } else {
                                output.push(`${star} ${offline(users[a])} - ${vars.settings.device[users[a]].name}, ${vars.text.angry + data.user[users[a]] + vars.text.none}`);
                            }
                        } while (a > 0);
                    } else {
                        output.push("No shared users");
                    }
                }
                if (arg !== "all" && arg !== "device" && arg !== "user") {
                    if (summary === "unknown") {
                        output.push(`${star} ${offline(arg)} - ${vars.text.angry}unknown ${type + vars.text.none}`);
                    } else if (summary === "online") {
                        output.push(`${star} ${online(arg)} - ${vars.settings[type][arg].name}, ${vars.settings[type][arg].ipSelected}`);
                    } else {
                        output.push(`${star} ${offline(arg)} - ${vars.settings[type][arg].name}, ${vars.text.angry + summary + vars.text.none}`);
                    }
                }
                vars.settings.verbose = true;
                callback(title, output, null);
            };
            if (arg === "all") {
                title = "Test All Agent Connectivity";
            } else if (arg === "device" || arg === "user") {
                title = `Test Each ${common.capitalize(arg)} Agent`;
            } else {
                title = "Agent test for Single Agent";
            }
            if (arg !== "all" && arg !== "device" && arg !== "user" && vars.settings[type][arg] === undefined) {
                error([`${vars.text.angry}Parameter ${arg} is either not an accepted agent identifier or is not present in settings files device.json or user.json.${vars.text.none}`], null, true);
                return;
            }
            if (arg === hash) {
                callback(title, [`The requested agent is this local device.  ${vars.text.angry}No connectivity test performed.${vars.text.none}`], null);
                return;
            }
            ipResolve(arg, type, report);
        }
    });
};

export default agentOnline;