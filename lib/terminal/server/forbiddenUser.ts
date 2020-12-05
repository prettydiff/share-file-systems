
/* lib/terminal/server/forbiddenUser - A single function for handling rejected HTTP responses associated with disallowed requests. */
import { ServerResponse } from "http";

import vars from "../utilities/vars.js";

import serverVars from "./serverVars.js";
import storage from "./storage.js";

const forbiddenUser = function terminal_server_forbiddenUser(agentName:string, agentType:agentType):void {
    vars.testLogger("forbiddenUser", "", "Messaging for connections from agents without a stored hash in the user or device lists.");
    if (serverVars[agentType][agentName] !== undefined) {
        delete serverVars[agentType][agentName];
        storage({
            data: serverVars[agentType],
            response: null,
            type: agentType
        });
        vars.ws.broadcast(JSON.stringify({
            [`delete-${agentType}`]: agentName
        }));
    }
};

export default forbiddenUser;