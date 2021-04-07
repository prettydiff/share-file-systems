
/* lib/terminal/server/forbiddenUser - A single function for handling rejected HTTP responses associated with disallowed requests. */

import serverVars from "./serverVars.js";
import settings from "./settings.js";

const forbiddenUser = function terminal_server_forbiddenUser(agentName:string, agentType:agentType):void {
    if (serverVars[agentType] !== undefined && serverVars[agentType][agentName] !== undefined) {
        delete serverVars[agentType][agentName];
        settings({
            data: serverVars[agentType],
            serverResponse: null,
            type: agentType
        });
        serverVars.broadcast("heartbeat-delete", `${agentName},${agentType}`);
    }
};

export default forbiddenUser;