
/* lib/terminal/server/forbiddenUser - A single function for handling rejected HTTP responses associated with disallowed requests. */
import { ServerResponse } from "http";

import vars from "../utilities/vars.js";

import serverVars from "./serverVars.js";
import storage from "./storage.js";

const forbiddenUser = function terminal_server_forbiddenUser(user:string, response:ServerResponse):void {
    delete serverVars.users[user];
    storage(JSON.stringify(serverVars.users).replace(/\}$/, ",\"send\":false}"), response, "users");
    vars.ws.broadcast(JSON.stringify({
        "delete-user": user
    }));
};

export default forbiddenUser;