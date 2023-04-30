/* lib/terminal/utilities/resetState - A convenience tool to baseline environmental settings */

import transmit_ws from "../server/transmission/transmit_ws.js";
import vars from "./vars.js";

const resetState = function terminal_utilities_resetState(callback:() => void):void {
    let agentType:agentType = "device";
    const deviceKeys:string[] = Object.keys(transmit_ws.clientList.device),
        userKeys:string[] = Object.keys(transmit_ws.clientList.user),
        agentKill = function terminal_utilities_resetState_agentKill(agent:string):void {
            transmit_ws.agentClose(transmit_ws.clientList[agentType][agent]);
        },
        mapValues = function terminal_utilities_resetState_mapValues(source:settings_item|ui_data, configuration:boolean):void {
            const keys:string[] = Object.keys(source);
            let index:number = keys.length,
                keyIndex:keys_configuration|keys_stateDefault = null;
            do {
                index = index - 1;
                keyIndex = (configuration === true)
                    ? keys[index] as keys_configuration
                    : keys[index] as keys_stateDefault;
                if (keyIndex !== "configuration") {
                    // @ts-ignore - ignoring warnings about type ambiguity because types are mapped against values of typed objects
                    if (typeof source[keyIndex] === "object") {
                        // @ts-ignore - ignoring warnings about type ambiguity because types are mapped against values of typed objects
                        if (Array.isArray(source[keyIndex]) === true) {
                            // @ts-ignore - ignoring warnings about type ambiguity because types are mapped against values of typed objects
                            vars.settings[keyIndex] = [];
                        } else {
                            // @ts-ignore - ignoring warnings about type ambiguity because types are mapped against values of typed objects
                            // eslint-disable-next-line
                            if (source[keyIndex].device === undefined) {
                                // @ts-ignore - ignoring warnings about type ambiguity because types are mapped against values of typed objects
                                vars.settings[keyIndex] = {};
                            } else {
                                // @ts-ignore - ignoring warnings about type ambiguity because types are mapped against values of typed objects
                                vars.settings[keyIndex] = {
                                    device: {},
                                    user: {}
                                };
                            }
                        }
                    // @ts-ignore - ignoring warnings about type ambiguity because types are mapped against values of typed objects
                    } else if (typeof source[keyIndex] === "bigint") {
                        // @ts-ignore - ignoring warnings about type ambiguity because types are mapped against values of typed objects
                        vars.settings[keyIndex] = process.hrtime.bigint();
                    } else {
                        // @ts-ignore - ignoring warnings about type ambiguity because types are mapped against values of typed objects
                        // eslint-disable-next-line
                        vars.settings[keyIndex] = source[keyIndex];
                    }
                }
            } while (index > 0);
            if (configuration === true) {
                callback();
            }
        };
    deviceKeys.forEach(agentKill);
    agentType = "user";
    userKeys.forEach(agentKill);
    mapValues(vars.environment.stateDefault, false);
    mapValues(vars.environment.stateDefault.configuration, true);
};

export default resetState;