/* lib/terminal/server/transmission/receiver - Routes incoming messages from the network to the respective libraries. */

import agent_hash from "../services/agent_hash.js";
import agent_management from "../services/agent_management.js";
import agent_status from "../services/agent_status.js";
import browser from "../../test/application/browser.js";
import browserLog from "../services/browserLog.js";
import fileCopy from "../services/fileCopy.js";
import fileSystem from "../services/fileSystem.js";
import hashShare from "../services/hashShare.js";
import importSettings from "../services/importSettings.js";
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
            "import": importSettings,
            "invite": invite,
            "log": browserLog,
            "message": message,
            "perf-socket": perf.conclude.socket,
            "settings": settings,
            "socket-map": transmit_ws.socketMapUpdate,
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
    if (
        // do not process service data on unknown service identifiers
        actions[services] !== undefined && (
            // http traffic is limited to GET requests and 'invite' service types
            (transmit.type === "http" && services === "invite") ||
            // ws traffic must not be on an agent associated socket unless the corresponding agent identifier is already locally known
            (transmit.type === "ws" && (
                ((transmit.socket.type === "user" || transmit.socket.type === "device") && vars.agents[transmit.socket.type] !== undefined && vars.agents[transmit.socket.type][transmit.socket.hash] !== undefined) ||
                (transmit.socket.type !== "user" && transmit.socket.type !== "device")
            ))
        )
    ) {
        actions[services](socketData, transmit);
    }
};

export default receiver;