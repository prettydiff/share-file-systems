
/* lib/terminal/commands/library/agent_data - Forms a report of agent data. */

import { readFile } from "fs";

import vars from "../../utilities/vars.js";

const agentData = function terminal_commands_library_agentData(type:agentType, callback:(title:string, text:string[]) => void):void {
    const lists:agentType|"" = (type === "device" || type === "user")
            ? type
            : "",
        agents:agentData = {
            device: {},
            user: {}
        },
        readFlag:[boolean, boolean] = [false, false],
        ipAll = function terminal_commands_library_agentData_ipAll(agent:agent, output:string[], single:boolean):string {
            const length4:number = (agent.ipAll === undefined)
                    ? 0
                    : agent.ipAll.IPv4.length,
                length6:number = (agent.ipAll === undefined)
                    ? 0
                    : agent.ipAll.IPv6.length,
                start:string = (single === true)
                    ? `${vars.text.angry}*${vars.text.none}`
                    : `  ${vars.text.angry}-${vars.text.none}`,
                end:string = (single === true)
                    ? `${vars.text.cyan}]${vars.text.none}`
                    : `  ${vars.text.cyan}]${vars.text.none}`,
                prefix:string = (single === true)
                    ? `  ${vars.text.angry}-${vars.text.none}`
                    : `    ${vars.text.angry}*${vars.text.none}`;
            let a:number = 0;
            output.push(`${start} ${vars.text.cyan}IP All${vars.text.none}     : ${vars.text.cyan}[${vars.text.none}`);
            if (length6 > 0) {
                do {
                    output.push(`${prefix} ${agent.ipAll.IPv6[a]}`);
                    a = a + 1;
                } while (a < length6);
            }
            if (length4 > 0) {
                a = 0;
                do {
                    output.push(`${prefix} ${agent.ipAll.IPv4[a]}`);
                    a = a + 1;
                } while (a < length4);
            }
            output.push(end);
            return output.join("");
        },
        output = function terminal_commands_library_agentData_output():void {
            const text:string[] = [],
                typeList = function terminal_commands_library_agentData_output_typeList(input:agentType):void{
                    const keys:string[] = Object.keys(agents[input]),
                        length:number = keys.length,
                        output:agentTextList = [];
                    let a:number = 0;
                    if (length > 0) {
                        do {
                            output.push([input, keys[a]]);
                            a = a + 1;
                        } while (a < length);
                        list(output, true);
                    } else {
                        text.push(`${vars.text.angry}* No agents of type ${input}.${vars.text.none}`);
                    }
                },
                list = function terminal_commands_library_agentData_output_list(keys:agentTextList, perType:boolean):void {
                    const length:number = keys.length;
                    let a:number = 0,
                        b:number = 0,
                        shares:agentShares,
                        shareNames:string[],
                        shareLength:number;
                    if (length > 0) {
                        do {
                            shares = agents[keys[a][0]][keys[a][1]].shares;
                            shareNames = Object.keys(shares);
                            shareLength = shareNames.length;
                            text.push(`${vars.text.angry}*${vars.text.none} ${vars.text.green + vars.text.bold + agents[keys[a][0]][keys[a][1]].name + vars.text.none}`);
                            if (perType === false) {
                                text.push(`  ${vars.text.angry}-${vars.text.none} ${vars.text.cyan}Type${vars.text.none}  : ${keys[a][0]}`);
                            }
                            text.push(`  ${vars.text.angry}-${vars.text.none} ${vars.text.cyan}ID${vars.text.none}         : ${keys[a][1]}`);
                            ipAll(agents[keys[a][0]][keys[a][1]], text, false);
                            text.push(`  ${vars.text.angry}-${vars.text.none} ${vars.text.cyan}IP Selected${vars.text.none}: ${agents[keys[a][0]][keys[a][1]].ipSelected}`);
                            text.push(`  ${vars.text.angry}-${vars.text.none} ${vars.text.cyan}Port${vars.text.none}       : ${agents[keys[a][0]][keys[a][1]].ports.http}`);
                            if (shareLength < 1) {
                                text.push(`  ${vars.text.angry}-${vars.text.none} ${vars.text.cyan}Shares${vars.text.none}     : none`);
                            } else {
                                text.push(`  ${vars.text.angry}-${vars.text.none} ${vars.text.cyan}Shares${vars.text.none}     :`);
                                b = 0;
                                do {
                                    text.push(`    ${vars.text.angry}*${vars.text.none} ${vars.text.green + vars.text.bold + shares[shareNames[b]].name + vars.text.none}`);
                                    text.push(`      ${vars.text.angry}-${vars.text.none} ${vars.text.cyan}ID${vars.text.none}       : ${shareNames[b]}`);
                                    text.push(`      ${vars.text.angry}-${vars.text.none} ${vars.text.cyan}Execute${vars.text.none}  : ${shares[shareNames[b]].execute}`);
                                    text.push(`      ${vars.text.angry}-${vars.text.none} ${vars.text.cyan}Read Only${vars.text.none}: ${shares[shareNames[b]].readOnly}`);
                                    text.push(`      ${vars.text.angry}-${vars.text.none} ${vars.text.cyan}Type${vars.text.none}     : ${shares[shareNames[b]].type}`);
                                    b = b + 1;
                                } while (b < shareLength);
                            }
                            text.push("");
                            a = a + 1;
                        } while (a < length);
                    }
                };
            if (lists === "") {
                if (type === null) {
                    text.push("");
                    text.push(`${vars.text.cyan + vars.text.bold}Devices${vars.text.none}`);
                    typeList("device");
                    text.push("");
                    text.push(`${vars.text.cyan + vars.text.bold}Users${vars.text.none}`);
                    typeList("user");
                    callback("All Agent Data", text);
                } else if ((/^[0-9a-f]{128}$/).test(type) === true && type.length === 128) {
                    const title:string = "Agent Details by Hash ID",
                        selectiveAgent = function terminal_commands_library_agentData_output_selectiveAgent(agentType:agentType):void {
                            const shares:agentShares = agents[agentType][type].shares,
                                shareNames:string[] = Object.keys(shares),
                                shareLength:number = shareNames.length;
                            let a:number = 0;
                            text.push(`${vars.text.green + vars.text.bold + agents[agentType][type].name + vars.text.none}`);
                            text.push(`${vars.text.angry}*${vars.text.none} ${vars.text.cyan}Type${vars.text.none}       : ${agentType}`);
                            text.push(`${vars.text.angry}*${vars.text.none} ${vars.text.cyan}ID${vars.text.none}         : ${type}`);
                            ipAll(agents[agentType][type], text, true);
                            text.push(`${vars.text.angry}*${vars.text.none} ${vars.text.cyan}IP Selected${vars.text.none}: ${agents[agentType][type].ipSelected}`);
                            text.push(`${vars.text.angry}*${vars.text.none} ${vars.text.cyan}Port${vars.text.none}       : ${agents[agentType][type].ports.http}`);
                            if (shareLength < 1) {
                                text.push(`${vars.text.angry}*${vars.text.none} ${vars.text.cyan}Shares${vars.text.none}     : none`);
                            } else {
                                text.push(`${vars.text.angry}*${vars.text.none} ${vars.text.cyan}Shares${vars.text.none}     :`);
                                do {
                                    text.push(`  ${vars.text.angry}-${vars.text.none} ${vars.text.green + vars.text.bold + shares[shareNames[a]].name + vars.text.none}`);
                                    text.push(`    ${vars.text.angry}*${vars.text.none} ${vars.text.cyan}ID${vars.text.none}       : ${shareNames[a]}`);
                                    text.push(`    ${vars.text.angry}*${vars.text.none} ${vars.text.cyan}Execute${vars.text.none}  : ${shares[shareNames[a]].execute}`);
                                    text.push(`    ${vars.text.angry}*${vars.text.none} ${vars.text.cyan}Read Only${vars.text.none}: ${shares[shareNames[a]].readOnly}`);
                                    text.push(`    ${vars.text.angry}*${vars.text.none} ${vars.text.cyan}Type${vars.text.none}     : ${shares[shareNames[a]].type}`);
                                    a = a + 1;
                                } while (a < shareLength);
                            }
                            callback(title, text);
                        };
                    if (agents.device[type] !== undefined) {
                        selectiveAgent("device");
                    } else if (agents.user[type] !== undefined) {
                        selectiveAgent("user");
                    } else {
                        callback(title, [`${vars.text.angry}No agents presents with that hash ID.${vars.text.none}`]);
                    }
                } else {
                    const matches:agentTextList = [],
                        devices:string[] = Object.keys(agents.device),
                        deviceLength:number = devices.length,
                        users:string[] = Object.keys(agents.user),
                        userLength:number = users.length;
                    if (deviceLength > 0) {
                        let a:number = 0;
                        do {
                            if (agents.device[devices[a]].name.indexOf(type) > -1) {
                                matches.push(["device", devices[a]]);
                            }
                            a = a + 1;
                        } while (a < deviceLength);
                    }
                    if (userLength > 0) {
                        let a:number = 0;
                        do {
                            if (agents.user[users[a]].name.indexOf(type) > -1) {
                                matches.push(["user", users[a]]);
                            }
                            a = a + 1;
                        } while (a < userLength);
                    }
                    if (matches.length < 1) {
                        text.push(`${vars.text.angry}* No agents contain search hint ${type} in their name.${vars.text.none}`);
                    } else {
                        list(matches, false);
                        callback("Agent data for selected agent(s)", text);
                    }
                }
            } else if (lists === "device") {
                typeList("device");
                callback("Data for Device Agents", text);
            } else if (lists === "user") {
                typeList("user");
                callback("Data for User Agents", text);
            }
        },
        deviceCallback = function terminal_commands_library_agentData_deviceCallback(readErr:NodeJS.ErrnoException, fileData:string):void {
            if (readErr === null) {
                agents.device = JSON.parse(fileData);
                readFlag[0] = true;
                if (readFlag[1] === true) {
                    output();
                }
            } else if (readErr.code === "ENOENT") {
                readFlag[0] = true;
                if (readFlag[1] === true) {
                    output();
                }
            } else {
                callback("Agent Data", [readErr.toString()]);
                process.exit(0);
                return;
            }
        },
        userCallback = function terminal_commands_library_agentData_userCallback(readErr:NodeJS.ErrnoException, fileData:string):void {
            if (readErr === null) {
                agents.user = JSON.parse(fileData);
                readFlag[1] = true;
                if (readFlag[0] === true) {
                    output();
                }
            } else if (readErr.code === "ENOENT") {
                readFlag[1] = true;
                if (readFlag[0] === true) {
                    output();
                }
            } else {
                callback("Agent Data", [readErr.toString()]);
                process.exit(0);
                return;
            }
        };
    vars.settings.verbose = true;
    if (lists === "device" || lists === "") {
        readFile(`${vars.path.settings}device.json`, "utf8", deviceCallback);
    } else {
        readFlag[0] = true;
    }
    if (lists === "user" || lists === "") {
        readFile(`${vars.path.settings}user.json`, "utf8", userCallback);
    } else {
        readFlag[1] = true;
    }
};

export default agentData;