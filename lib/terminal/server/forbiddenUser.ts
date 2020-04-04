
/* lib/terminal/server/forbiddenUser - A single function for handling rejected HTTP responses associated with disallowed requests. */
import { ServerResponse } from "http";

import vars from "../utilities/vars.js";

import serverVars from "./serverVars.js";
import storage from "./storage.js";

const forbiddenUser = function terminal_server_forbiddenUser(agentName:string, agentType:agentType, response:ServerResponse):void {
    delete serverVars[agentType][agentName];
    storage(JSON.stringify(serverVars.user), response, agentType);
    vars.ws.broadcast(JSON.stringify({
        [`delete-${agentType}`]: agentName
    }));
};

export default forbiddenUser;