
import vars from "../vars.js";

import serverVars from "./serverVars.js";
import storage from "./storage.js";

const forbiddenUser = function terminal_server_forbiddenUser(user:string):void {
    delete serverVars.users[user];
    storage(JSON.stringify(serverVars.users), "noSend", "users");
    vars.ws.broadcast(JSON.stringify({
        "delete-user": user
    }));
};

export default forbiddenUser;