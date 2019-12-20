
import vars from "../vars.js";

import serverVars from "./serverVars.js";
import storage from "./storage.js";

const forbiddenUser = function terminal_server_forbiddenUser(user:string):void {
    delete serverVars.users[user];
    storage(JSON.stringify(serverVars.users), "noSend", "users");
    vars.ws.broadcast(`deleteUser:${user}`);
};

export default forbiddenUser;