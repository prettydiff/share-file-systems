
/* lib/terminal/server/transmission/http - Parses incoming messages from the network. */

import node from "../../utilities/node.js";
import receiver from "./receiver.js";

const message_receiver = function terminal_server_transmission_messageReceiver(bufferData:Buffer):void {
    const decoder:node_stringDecoder_StringDecoder = new node.stringDecoder.StringDecoder("utf8"),
        result:string = decoder.end(bufferData);

    // prevent parsing errors in the case of malformed or empty payloads
    if (result.charAt(0) === "{" && result.charAt(result.length - 1) === "}" && result.indexOf("\"data\":") > 0 && result.indexOf("\"service\":") > 0) {
        try {
            receiver(JSON.parse(result) as socketData, {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-restricted-syntax
                socket: this,
                type: "ws"
            });
        } catch {}
    }
};

export default message_receiver;