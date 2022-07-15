/* lib/terminal/commands/interface/certificate - Shell interface for creating certificates. */

import { resolve } from "path";

import certificate from "../library/certificate.js";
import vars from "../../utilities/vars.js";

const interfaceCertificate = function terminal_commands_inteface_certificate(callback:commandCallback):void {
    const indexes:number[] = [],
        config = {
            callback: callback,
            days: 16384,
            location: "",
            names: {
                intermediate: {
                    domain: "share-file-ca",
                    fileName: "share-file-ca"
                },
                organization: "share-file",
                root: {
                    domain: "share-file-root",
                    fileName: "share-file-root"
                },
                server: {
                    domain: "share-file",
                    fileName: "share-file"
                }
            },
            selfSign: false
        },
        args = function terminal_commands_certificate_args(key:certArgs):void {
            let value:string = argNames[1];
            indexes.push(index);
            if ((value.charAt(0) === "\"" || value.charAt(0) === "\"") && value.charAt(value.length - 1) === value.charAt(0)) {
                value = value.slice(1, value.length - 1);
            }
            if (key === "organization") {
                orgTest = true;
                config.names.organization = value;
            } else if (key === "location") {
                config.location = resolve(value);
            } else {
                const names:string[] = argNames[0].split("-");
                names[1] = names[1].replace("filename", "fileName");
                config.names[names[0] as "intermediate"|"root"|"server"][names[1] as "domain"|"fileName"] = value;
            }
        };
    let indexLength:number,
        index:number = process.argv.length,
        orgTest:boolean = false,
        argNames:string[];

    vars.settings.verbose = true;

    // apply configuration values from terminal arguments
    if (index > 0) {
        do {
            index = index - 1;
            argNames = process.argv[index].split(":");
            if (process.argv[index] === "self-sign") {
                indexes.push(index);
                config.selfSign = true;
            } else if (argNames[0] === "days") {
                indexes.push(index);
                if (isNaN(Number(process.argv[index].replace("days:", ""))) === false) {
                    config.days = Number(process.argv[index].replace("days:", ""));
                }
            } else {
                args(argNames[0] as certArgs);
            }
        } while (index > 0);
    }

    indexLength = indexes.length;
    if (indexLength > 0) {
        do {
            process.argv.splice(indexes[index], 1);
            index = index + 1;
        } while (index < indexLength);
    }
    if (orgTest === false && config.selfSign === false) {
        config.names.organization = "share-file-ca";
    }
    if (config.location === "") {
        config.location = `${vars.path.project}lib${vars.path.sep}certificate`;
    }

    config.location = config.location.replace(/(\/|\\)$/, "");

    // convert relative path to absolute from shell current working directory
    if ((process.platform === "win32" && (/^\w:\\/).test(config.location) === false) || (process.platform !== "win32" && config.location.charAt(0) !== "/")) {
        config.location = process.cwd() + vars.path.sep + config.location.replace(/^(\\|\/)+/, "");
    }
    certificate(config);
};

export default interfaceCertificate;