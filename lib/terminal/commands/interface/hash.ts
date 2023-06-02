/* lib/terminal/commands/interface/hash - Shell interface to library hash, which generates a hash string. */

import { resolve } from "path";

import error from "../../utilities/error.js";
import hash from "../library/hash.js";
import vars from "../../utilities/vars.js";

const interfaceHash = function terminal_commands_interface_hash(callback:commandCallback):void {
    if (process.argv[0] === undefined) {
        error([
            `Command ${vars.text.cyan}hash${vars.text.none} requires some form of address of something to analyze, ${vars.text.angry}but no address is provided${vars.text.none}.`,
            `See ${vars.text.green + vars.terminal.command_instruction} commands hash${vars.text.none} for examples.`
        ], null, true);
        return;
    }
    let a:number = 0,
        length:number = process.argv.length,
        lower:string = "";
    const http:RegExp = (/^https?:\/\//),
        listIndex:number = process.argv.indexOf("list"),
        supportedAlgorithms:string[] = [
            "blake2d512",
            "blake2s256",
            "md5",
            "sha1",
            "sha3-224",
            "sha3-256",
            "sha3-384",
            "sha3-512",
            "sha384",
            "sha512-224",
            "sha512-256",
            "sha512",
            "shake128",
            "shake256"
        ],
        input:config_command_hash = {
            algorithm: "sha3-512",
            callback: function terminal_commands_interface_hash_callback(title:string, output:hash_output):void {
                if (vars.settings.verbose === true) {
                    callback(title, [`${vars.environment.name} hashed ${vars.text.cyan + input.source.toString() + vars.text.none}`, output.hash], null);
                } else if (listIndex > -1) {
                    callback("", [`${output.filePath}:${output.hash}`], null);
                } else {
                    callback("", [output.hash], null);
                }
            },
            digest: "hex",
            directInput: false,
            id: null,
            list: false,
            parent: null,
            source: process.argv[0],
            stat: null
        };
    if (http.test(input.source as string) === false) {
        input.source = resolve(process.argv[0]);
    }
    if (listIndex > -1) {
        process.argv.splice(listIndex);
        length = length - 1;
        input.list = true;
    }
    if (length > 0) {
        do {
            lower = process.argv[a].toLowerCase();
            if (supportedAlgorithms.indexOf(lower) > -1) {
                input.algorithm = lower as hash;
                process.argv.splice(a, 1);
                a = a - 1;
                length = length - 1;
            } else if (lower === "base64" || lower === "hex") {
                input.digest = lower;
                process.argv.splice(a, 1);
                a = a - 1;
                length = length - 1;
            } else if (lower.indexOf("string:") === 0) {
                const len:number = input.source.length - 8;
                input.directInput = true;
                input.source = process.argv[a].slice(7);
                if ((input.source.charAt(0) === "\"" && input.source.charAt(len) === "\"") || (input.source.charAt(0) === "\"" && input.source.charAt(len) === "\"")) {
                    input.source = input.source.slice(1, len);
                }
            }
            a = a + 1;
        } while (a < length);
    }
    hash(input);
};

export default interfaceHash;