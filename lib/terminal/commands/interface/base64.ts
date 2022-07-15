/* lib/terminal/commands/interface/base64 - Shell interface for base64, which provides base64 encoding/decoding. */

import base64 from "../library/base64.js";
import vars from "../../utilities/vars.js";

const interfaceBase64 = function terminal_commands_interface_base64(callback:commandCallback):void {
    const input:config_command_base64 = {
            callback: function terminal_commands_interface_base64_callback(title:string, output:base64Output):void {
                
                if (vars.settings.verbose === true) {
                    const list:string[] = [output.base64];
                    list.push("");
                    list.push(`from ${vars.text.angry + input.source + vars.text.none}`);
                    callback(title, list, null);
                } else {
                    callback("", [output.base64], null);
                }
            },
            direction: (function terminal_commands_interface_base64_direction():"decode"|"encode" {
                let index:number = process.argv.indexOf("encode");
                if (index > -1) {
                    process.argv.splice(index, 1);
                }
                index = process.argv.indexOf("decode");
                if (index > -1) {
                    process.argv.splice(index, 1);
                    return "decode";
                }
                return "encode";
            }()),
            id: "",
            source: process.argv[0]
        };
    base64(input);
};

export default interfaceBase64;