
/* lib/terminal/server/transmission/receiver - The library for handling all traffic related to HTTP requests with method POST. */

import agent_hash from "../services/agent_hash.js";
import agent_management from "../services/agent_management.js";
import agent_online from "../services/agent_online.js";
import agent_status from "../services/agent_status.js";
import browser from "../../test/application/browser.js";
import browserLog from "../services/browserLog.js";
import fileCopy from "../services/fileCopy.js";
import fileSystem from "../services/fileSystem.js";
import hashShare from "../services/hashShare.js";
import invite from "../services/invite.js";
import message from "../services/message.js";
import settings from "../services/settings.js";
import vars from "../../utilities/vars.js";

const receiver = function terminal_server_transmission_receiver(socketData:socketData, transmit:transmit):void {
    const services:requestType = socketData.service,
        actions:postActions = {
            "agent-hash": agent_hash,
            "agent-management": agent_management,
            "agent-online": agent_online,
            "agent-status": agent_status,
            "copy": fileCopy.route.copy,
            "copy-list": fileCopy.route["copy-list"],
            //"copy-file-request": copyFileRequest,
            "file-system": fileSystem.route.menu,
            "file-system-details": fileSystem.route.browser,
            "file-system-status": fileSystem.route.browser,
            "file-system-string": fileSystem.route.browser,
            "hash-share": hashShare,
            "invite": invite,
            "log": browserLog,
            "message": message,
            "settings": settings,
            "test-browser": browser.methods.route
        };
    if (vars.test.type === "service") {
        if (services === "invite") {
            vars.test.socket = null;
        } else {
            vars.test.socket = transmit.socket;
        }
    }
    if (actions[services] === undefined) {
        transmit.socket.destroy();
    } else {
        actions[services](socketData, transmit);
    }
};

export default receiver;