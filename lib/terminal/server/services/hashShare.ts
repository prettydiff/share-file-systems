

/* lib/terminal/server/services/hashShare - Creates a unique identifier for a new share object. */

import hash from "../../commands/library/hash.js";
import network from "../transmission/network.js";
import vars from "../../utilities/vars.js";

const hashShare = function terminal_server_services_hashShare(socketData:socketData):void {
    const hashData:service_hashShare = socketData.data as service_hashShare,
        input:config_command_hash = {
            algorithm: "sha3-512",
            callback: function terminal_server_services_shareHash(title:string, hashOutput:hash_output):void {
                const outputBody:service_hashShare = JSON.parse(hashOutput.id) as service_hashShare,
                    hashResponse:service_hashShare = {
                        device: outputBody.device,
                        hash: hashOutput.hash,
                        share: outputBody.share,
                        type: outputBody.type
                    };
                network.send({
                    data: hashResponse,
                    route: {
                        device: "browser",
                        user: "browser"
                    },
                    service: "hash-share"
                });
            },
            digest: "hex",
            directInput: true,
            id: JSON.stringify(hashData),
            list: false,
            parent: null,
            source: vars.identity.hashUser + vars.identity.hashDevice + hashData.type + hashData.share,
            stat: null
        };
    hash(input);
};

export default hashShare;