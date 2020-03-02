
import { ServerResponse } from "http";

import vars from "../vars.js";

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