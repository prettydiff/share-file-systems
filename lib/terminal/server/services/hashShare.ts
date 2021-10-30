

/* lib/terminal/server/services/hashShare - Creates a unique identifier for a new share object. */

import hash from "../../commands/hash.js";
import responder from "../transmission/responder.js";
import serverVars from "../serverVars.js";

const hashShare = function terminal_server_services_hashShare(socketData:socketData, transmit:transmit):void {
    const hashData:hashShare = socketData.data as hashShare,
        input:hashInput = {
            algorithm: "sha3-512",
            callback: function terminal_server_services_shareHash(hashOutput:hashOutput):void {
                const outputBody:hashShare = JSON.parse(hashOutput.id),
                    hashResponse:hashShareResponse = {
                        device: outputBody.device,
                        hash: hashOutput.hash,
                        share: outputBody.share,
                        type: outputBody.type
                    };
                responder({
                    data: hashResponse,
                    service: "hash-share"
                }, transmit);
            },
            directInput: true,
            id: JSON.stringify(hashData),
            source: serverVars.hashUser + serverVars.hashDevice + hashData.type + hashData.share
        };
    hash(input);
};

export default hashShare;