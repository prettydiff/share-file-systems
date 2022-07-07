/* lib/terminal/commands/interface/base64 - Shell interface for base64, which provides base64 encoding/decoding. */

import base64 from "../library/base64.js";
import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

const interfaceBase64 = function terminal_commands_interface_base64():void {
    const input:config_command_base64 = {
            callback: function terminal_commands_interface_base64_callback(title:string, output:base64Output):void {
                log.title(title);
                if (vars.settings.verbose === true) {
                    const list:string[] = [output.base64];
                    list.push("");
                    list.push(`from ${vars.text.angry + input.source + vars.text.none}`);
                    log(list, true);
                } else {
                    log([output.base64]);
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
    vars.settings.verbose = true;
    base64(input);
};

export default interfaceBase64;