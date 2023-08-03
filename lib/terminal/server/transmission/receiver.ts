
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
import perf from "../../commands/library/perf.js";
import settings from "../services/settings.js";
import terminal from "../services/terminal.js";
import transmit_ws from "./transmit_ws.js";
import vars from "../../utilities/vars.js";

const receiver = function terminal_server_transmission_receiver(socketData:socketData, transmit:transmit_type):void {
    const services:service_type = socketData.service,
        actions:transmit_receiver = {
            "agent-hash": agent_hash,
            "agent-management": agent_management,
            "agent-online": agent_online,
            "agent-status": agent_status,
            "copy": fileCopy.route,
            "copy-list": fileCopy.route,
            "copy-list-request": fileCopy.route,
            "copy-send-file": fileCopy.actions.fileRespond,
            "cut": fileCopy.route,
            "file-system": fileSystem.route,
            "file-system-details": fileSystem.route,
            "file-system-status": fileSystem.route,
            "file-system-string": fileSystem.route,
            "hash-share": hashShare,
            "invite": invite,
            "log": browserLog,
            "message": message,
            "perf-socket": perf.conclude.socket,
            "settings": settings,
            "socket-list": transmit_ws.statusUpdate,
            "terminal": terminal.input,
            "test-browser": browser.methods.route
        };
    if (vars.environment.command === "perf" && services.indexOf("perf-") !== 0) {
        return;
    }
    if (vars.test.type === "service") {
        if (services === "invite") {
            vars.test.socket = null;
        } else {
            vars.test.socket = transmit.socket as httpSocket_response;
        }
    }
    if (actions[services] !== undefined) {
        actions[services](socketData, transmit);
    }
};

export default receiver;