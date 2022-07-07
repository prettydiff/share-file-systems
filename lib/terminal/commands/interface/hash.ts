/* lib/terminal/commands/interface/hash - Shell interface to library hash, which generates a hash string. */

import { resolve } from "path";

import hash from "../library/hash.js";
import log from "../../utilities/log.js";
import vars from "../../utilities/vars.js";

const interfaceHash = function terminal_commands_interface_hash():void {
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
            algorithm: null,
            callback: function terminal_commands_library_hash_callback(title:string, output:hash_output):void {
                if (vars.settings.verbose === true) {
                    log.title(title);
                    log([`${vars.environment.name} hashed ${vars.text.cyan + input.source + vars.text.none}`, output.hash], true);
                } else if (listIndex > -1) {
                    log([`${output.filePath}:${output.hash}`]);
                } else {
                    log([output.hash]);
                }
            },
            digest: null,
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
                input.digest = lower as "base64" | "hex";
                process.argv.splice(a, 1);
                a = a - 1;
                length = length - 1;
            } else if (lower.indexOf("string:") === 0) {
                input.directInput = true;
                input.source = lower.slice(7);
            }
            a = a + 1;
        } while (a < length);
    }
    input.algorithm = (input.algorithm === null)
        ? "sha3-512"
        : input.algorithm;
    input.digest = (input.digest === null)
        ? "hex"
        : input.digest;
    hash(input);
};

export default interfaceHash;