
/* lib/terminal/commands/certificate - A command driven utility for creating an HTTPS certificate. */

import { exec } from "child_process";
import { stat } from "fs";
import { resolve } from "path";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import mkdir from "../commands/mkdir.js";
import vars from "../utilities/vars.js";

// cspell:word addstore, CAcreateserial, certutil, delstore, extfile, genpkey

const certificate = function terminal_commands_certificate(config:config_command_certificate):void {
    let index:number = 0;
    const fromCommand:boolean = (vars.environment.command === "certificate"),
        commands:string[] = [],
        crypto = function terminal_commands_certificate_crypto():void {
            exec(commands[index], {
                cwd: config.location
            }, function terminal_commands_certificate_child(erChild:Error):void {
                if (erChild === null) {
                    index = index + 1;
                    if (index < commands.length) {
                        terminal_commands_certificate_crypto();
                    } else {
                       config.callback();
                    }
                } else {
                    error([erChild.toString()]);
                }
            });
        };

    if (fromCommand === true) {
        const indexes:number[] = [],
            args = function terminal_commands_certificate_args(key:"intermediate-domain"|"intermediate-fileName"|"location"|"organization"|"root-domain"|"root-fileName"|"server-domain"|"server-fileName"):void {
                let value:string = process.argv[index].replace(`${key}:`, "");
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
                    const names:string[] = key.split("-");
                    config.names[names[0] as "intermediate"|"root"|"server"][names[1] as "domain"|"fileName"] = value;
                }
            };
        let indexLength:number,
            index:number = process.argv.length,
            orgTest:boolean = false;

        config = {
            callback: function terminal_commands_certificate_callback():void {
                vars.settings.verbose = true;
                log([`Certificates created at ${config.location}`], true);
            },
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
        };

        // apply configuration values from terminal arguments
        if (index > 0) {
            do {
                index = index - 1;
                if (process.argv[index] === "self-sign") {
                    indexes.push(index);
                    config.selfSign = true;
                } else if (process.argv[index].indexOf("intermediate-domain:") === 0) {
                    args("intermediate-domain");
                } else if (process.argv[index].indexOf("intermediate-fileName:") === 0) {
                    args("intermediate-fileName");
                } else if (process.argv[index].indexOf("root-domain:") === 0) {
                    args("root-domain");
                } else if (process.argv[index].indexOf("root-fileName:") === 0) {
                    args("root-fileName");
                } else if (process.argv[index].indexOf("server-domain:") === 0) {
                    args("server-domain");
                } else if (process.argv[index].indexOf("server-fileName:") === 0) {
                    args("server-fileName");
                } else if (process.argv[index].indexOf("organization:") === 0) {
                    args("organization");
                } else if (process.argv[index].indexOf("location:") === 0) {
                    args("location");
                } else if (process.argv[index].indexOf("days:") === 0) {
                    indexes.push(index);
                    if (isNaN(Number(process.argv[index].replace("days:", ""))) === false) {
                        config.days = Number(process.argv[index].replace("days:", ""));
                    }
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
    }
    if (config.location === "") {
        config.location = `${vars.path.project}lib${vars.path.sep}certificate`;
    }

    config.location = config.location.replace(/(\/|\\)$/, "");

    // convert relative path to absolute from shell current working directory
    if ((process.platform === "win32" && (/^\w:\\/).test(config.location) === false) || (process.platform !== "win32" && config.location.charAt(0) !== "/")) {
        config.location = process.cwd() + vars.path.sep + config.location.replace(/^(\\|\/)+/, "");
    }

    stat(config.location, function terminal_commands_certificate_createStat(stats:NodeJS.ErrnoException):void {

        // OpenSSL features used:
        // * file extensions
        //    - crt: certificate
        //    - csr: certificate signing request
        //    - key: private key associated with a certificate
        //    - srl: CA serial number associated with certificate signing
        // * genpkey, command to generate a private key - https://www.openssl.org/docs/man1.0.2/man1/openssl-genpkey.html
        //    - algorithm: public key algorithm to use
        //    - out      : filename of key output
        // * req, a certificate request command - https://www.openssl.org/docs/man1.0.2/man1/openssl-req.html
        //    - days : time to live in days (expiry)
        //    - key  : key filepath to read from
        //    - new  : generate a new certificate
        //    - nodes: not encrypt a created private key
        //    - out  : filename of certificate output
        //    - subj : data to populate into the certificate
        //    - x509 : generate a self-signed cert
        // * x509, command to display and sign certificates - https://www.openssl.org/docs/man1.0.2/man1/openssl-x509.html
        //    - CA            : specifies the CA certificate file to use for signing
        //    - CAcreateserial: creates a CA serial number file, necessary to avoid an OpenSSL error
        //    - CAkey         : specifies the CA private key file to use for signing
        //    - days          : time to live in days (expiry)
        //    - extensions    : specifies the form of extensions "x509_ext" contained in the extensions file
        //    - extfile       : file location of extension details
        //    - in            : specifies certificate request file path of certificate to sign
        //    - out           : file location to output the signed certificate
        //    - req           : use a certificate request as input opposed to an actual certificate
        const create = function terminal_commands_certificate_createStat_create():void {
            const mode:[string, string] = (config.selfSign === true)
                    ? [config.names.server.fileName, config.names.server.domain]
                    : [config.names.root.fileName, config.names.root.domain],
                confPath = function terminal_commands_certificate_createStat_create_confPath(configName:"ca"|"selfSign"):string {
                    return `"${vars.path.project}lib${vars.path.sep}certificate${vars.path.sep + configName}.cnf" -extensions x509_ext`;
                },
                key = function terminal_commands_certificate_createState_create_key(type:"intermediate"|"root"|"server"):string {
                    return `openssl genpkey -algorithm RSA -out ${config.names[type].fileName}.key`;
                },
                cert:string = `openssl req -x509 -key ${mode[0]}.key -days ${config.days} -out ${mode[0]}.crt -subj "/CN=${mode[1]}/O=${config.names.organization}"`;
            if (fromCommand === true) {
                log.title("Certificate Create");
            }
            if (config.selfSign === true) {
                commands.push(key("root"));
                commands.push(`${cert} -config ${confPath("selfSign")}`);
            } else {
                // 1. generate a private key for root certificate
                commands.push(key("root"));
                // 2. generate a root certificate
                commands.push(cert);
                // 3. generate a private key for intermediate certificate
                commands.push(key("intermediate"));
                // 4. generate an intermediate certificate signing request
                commands.push(`openssl req -new -key ${config.names.intermediate.fileName}.key -out ${config.names.intermediate.fileName}.csr -subj "/CN=${config.names.intermediate.domain}/O=${config.names.organization}"`);
                // 5. sign the intermediate certificate with the root certificate
                commands.push(`openssl x509 -req -in ${config.names.intermediate.fileName}.csr -days ${config.days} -out ${config.names.intermediate.fileName}.crt -CA ${config.names.root.fileName}.crt -CAkey ${config.names.root.fileName}.key -CAcreateserial -extfile ${confPath("selfSign")}`);
                // 6. generate a private key for server certificate
                commands.push(key("server"));
                // 7. generate a server certificate signing request
                commands.push(`openssl req -new -key ${config.names.server.fileName}.key -out ${config.names.server.fileName}.csr -subj "/CN=${config.names.server.domain}/O=${config.names.organization}"`);
                // 8. sign the server certificate with the intermediate certificate
                commands.push(`openssl x509 -req -in ${config.names.server.fileName}.csr -days ${config.days} -out ${config.names.server.fileName}.crt -CA ${config.names.intermediate.fileName}.crt -CAkey ${config.names.intermediate.fileName}.key -CAcreateserial -extfile ${confPath("ca")}`);
            }
            crypto();
        };
        if (stats === null) {
            create();
        } else if (stats.code === "ENOENT") {
            mkdir(config.location, create);
        } else {
            error([stats.toString()]);
        }
    });
};

export default certificate;