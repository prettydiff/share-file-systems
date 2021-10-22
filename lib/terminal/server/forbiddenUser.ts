
/* lib/terminal/server/forbiddenUser - A single function for handling rejected HTTP responses associated with disallowed requests. */

import serverVars from "./serverVars.js";
import settings from "./settings.js";
import websocket from "./websocket.js";

const forbiddenUser = function terminal_server_forbiddenUser(agentName:string, agentType:agentType):void {
    if (serverVars[agentType] !== undefined && serverVars[agentType][agentName] !== undefined) {
        const deleted:agentList = {
            device: [],
            user: []
        };
        delete serverVars[agentType][agentName];
        settings({
            data: serverVars[agentType],
            type: agentType
        });
        deleted[agentType].push(agentName);
        websocket.broadcast({
            data: deleted,
            service: "heartbeat-delete"
        }, "browser");
    }
};

export default forbiddenUser;