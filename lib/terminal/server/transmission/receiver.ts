
/* lib/terminal/server/transmission/receiver - The library for handling all traffic related to HTTP requests with method POST. */

import agentOnline from "../services/agentOnline.js";
import browser from "../../test/application/browser.js";
import browserLog from "../services/browserLog.js";
import fileListStatusDevice from "../services/fileListStatusDevice.js";
import fileListStatusUser from "../services/fileListStatusUser.js";
import hashDevice from "../services/hashDevice.js";
import heartbeat from "../services/heartbeat.js";
import hashShare from "../services/hashShare.js";
import invite from "../services/invite.js";
import message from "../services/message.js";
import routeCopy from "../../fileService/routeCopy.js";
import routeFile from "../../fileService/routeFile.js";
import serverVars from "../serverVars.js";
import settings from "../services/settings.js";

const receiver = function terminal_server_transmission_receiver(socketData:socketData, transmit:transmit):void {
    const actions:postActions = {
            "agent-online": agentOnline,
            "browser-log": browserLog,
            "copy": routeCopy,
            "fs": routeFile,
            "file-list-status-device": fileListStatusDevice,
            "file-list-status-user": fileListStatusUser,
            "hash-device": hashDevice,
            "hash-share": hashShare,
            "heartbeat": heartbeat,
            "invite": invite,
            "message": function terminal_server_transmission_receiver_messageAction():void {
                message(socketData.data as messageItem[], true);
            },
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
    } else {
        actions[socketData.service](socketData, transmit);
    }
};

export default receiver;