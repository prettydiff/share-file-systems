/* lib/terminal/server/transmission/tools - Generic transmission tools shared between HTTP and WS libraries. */

import agent_hash from "../services/agent_hash.js";
import agent_management from "../services/agent_management.js";
import agent_online from "../services/agent_online.js";
import agent_status from "../services/agent_status.js";
import browser from "../../test/application/browser.js";
import browserLog from "../services/browserLog.js";
import fileCopy from "../services/fileCopy.js";
import fileSystem from "../services/fileSystem.js";
import hashShare from "../services/hashShare.js";
import importSettings from "../services/importSettings.js";
import invite from "../services/invite.js";
import log from "../../utilities/log.js";
import message from "../services/message.js";
import perf from "../../commands/library/perf.js";
import settings from "../services/settings.js";
import terminal from "../services/terminal.js";
import transmit_http from "./transmit_http.js";
import transmit_ws from "./transmit_ws.js";
import vars from "../../utilities/vars.js";

/**
 * A collection of transmission tools for use with either HTTP or WS.
 * ```typescript
 * interface module_transmit_tools {
 *     logger: (config:config_transmit_logger) => void;
 *     receiver: (socketData:socketData, transmit:transmit_type) => void;
 *     responder: (socketData:socketData, transmit:transmit_type) => void;
 * }
 * ``` */
const tools:module_transmit_tools = {
    logger: function terminal_server_transmission_toolsLogger(config:config_transmit_logger):void {
        vars.network.count[config.transmit.type][config.direction] = vars.network.count[config.transmit.type][config.direction] + 1;
        vars.network.size[config.transmit.type][config.direction] = vars.network.size[config.transmit.type][config.direction] + config.size;
        if (vars.settings.verbose === true) {
            if (config.socketData.service === "GET") {
                const data:string = (typeof config.socketData.data === "string")
                    ? config.socketData.data
                    : JSON.stringify(config.socketData.data);
                log([
                    `GET response to browser for ${data}`
                ]);
            } else {
                log([
                    `${config.direction} ${config.transmit.type} from ${config.transmit.socket.type} ${config.transmit.socket.hash}`,
                    config.socketData.service,
                    // @ts-ignore - A deliberate type violation to output a formatted object to the terminal
                    config.socketData.data.toString(),
                    ""
                ]);
            }
        }
    },
    /* Library for handling all traffic related to incoming messages. */
    receiver: function terminal_server_transmission_toolsReceiver(socketData:socketData, transmit:transmit_type):void {
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
                "import": importSettings,
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
    },
    responder: function terminal_server_transmission_toolsResponder(data:socketData, transmit:transmit_type):void {
        if (transmit === null || transmit.socket === null) {
            return;
        }
        if (transmit.type === "http") {
            const serverResponse:httpSocket_response = transmit.socket as httpSocket_response;
            transmit_http.respond({
                message: JSON.stringify(data),
                mimeType: "application/json",
                responseType: data.service,
                serverResponse: serverResponse
            }, false, "");
            // account for security of http requests
        } else {
            const socket:websocket_client = transmit.socket as websocket_client;
            transmit_ws.queue(data, socket, 1);
        }
    }
};

export default tools;