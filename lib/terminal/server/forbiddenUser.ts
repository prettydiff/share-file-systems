
/* lib/terminal/server/forbiddenUser - A single function for handling rejected HTTP responses associated with disallowed requests. */

import vars from "../utilities/vars.js";

import serverVars from "./serverVars.js";
import storage from "./storage.js";

const forbiddenUser = function terminal_server_forbiddenUser(agentName:string, agentType:agentType):void {
    if (serverVars[agentType] !== undefined && serverVars[agentType][agentName] !== undefined) {
        delete serverVars[agentType][agentName];
        storage({
            data: serverVars[agentType],
            serverResponse: null,
            type: agentType
        });
        vars.broadcast("heartbeat-delete", `${agentName},${agentType}`);
    }
};

export default forbiddenUser;