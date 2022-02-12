

/* lib/terminal/server/services/hashShare - Creates a unique identifier for a new share object. */

import hash from "../../commands/hash.js";
import sender from "../transmission/sender.js";
import vars from "../../utilities/vars.js";

const hashShare = function terminal_server_services_hashShare(socketData:socketData):void {
    const hashData:service_hashShare = socketData.data as service_hashShare,
        input:config_command_hash = {
            algorithm: "sha3-512",
            callback: function terminal_server_services_shareHash(hashOutput:hashOutput):void {
                const outputBody:service_hashShare = JSON.parse(hashOutput.id),
                    hashResponse:service_hashShare = {
                        device: outputBody.device,
                        hash: hashOutput.hash,
                        share: outputBody.share,
                        type: outputBody.type
                    };
                sender.broadcast({
                    data: hashResponse,
                    service: "hash-share"
                }, "browser");
            },
            directInput: true,
            id: JSON.stringify(hashData),
            source: vars.settings.hashUser + vars.settings.hashDevice + hashData.type + hashData.share
        };
    hash(input);
};

export default hashShare;