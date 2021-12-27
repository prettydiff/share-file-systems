
/* lib/terminal/server/transmission/receiver - The library for handling all traffic related to HTTP requests with method POST. */

import { IncomingMessage } from "http";

import agent_management from "../services/agent_management.js";
import agent_online from "../services/agent_online.js";
import agent_status from "../services/agent_status.js";
import browser from "../../test/application/browser.js";
import browserLog from "../services/browserLog.js";
import copyFile from "../../fileService/copyFile.js";
import copyFileRequest from "../../fileService/copyFileRequest.js";
import fileStatusDevice from "../services/fileStatusDevice.js";
import fileStatusUser from "../services/fileStatusUser.js";
import hashAgent from "../services/hashAgent.js";
import hashShare from "../services/hashShare.js";
import invite from "../services/invite.js";
import message from "../services/message.js";
import fileSystemRoute from "../../fileService/fileSystemRoute.js";
import serverVars from "../serverVars.js";
import settings from "../services/settings.js";

const receiver = function terminal_server_transmission_receiver(socketData:socketData, transmit:transmit, request?:IncomingMessage):void {
    const actions:postActions = {
            "agent-management": agent_management,
            "agent-online": agent_online,
            "agent-status": agent_status,
            "copy": fileSystemRoute,
            "copy-file": copyFile,
            "copy-file-request": copyFileRequest,
            "file-system": fileSystemRoute,
            "file-status-device": fileStatusDevice,
            "file-status-user": fileStatusUser,
            "hash-agent": hashAgent,
            "hash-share": hashShare,
            "invite": invite,
            "log": browserLog,
            "message": message,
            "settings": settings,
            "test-browser": browser.methods.route
        };
    if (serverVars.testType === "service") {
        if (socketData.service === "invite") {
            serverVars.testSocket = null;
        } else {
            serverVars.testSocket = transmit.socket;
        }
    }
    if (actions[socketData.service] === undefined) {
        transmit.socket.destroy();
        if (transmit.type === "http") {
            request.socket.destroy();
        }
    } else {
        actions[socketData.service](socketData, transmit);
    }
};

export default receiver;