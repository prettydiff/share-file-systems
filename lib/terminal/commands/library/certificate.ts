
/* lib/terminal/commands/library/certificate - A command driven utility for creating an HTTPS certificate. */

import error from "../../utilities/error.js";
import mkdir from "./mkdir.js";
import node from "../../utilities/node.js";
import vars from "../../utilities/vars.js";

// cspell:word addstore, CAcreateserial, certutil, delstore, extfile, genpkey

const certificate = function terminal_commands_library_certificate(config:config_command_certificate):void {
    let index:number = 0;
    const commands:string[] = [],
        crypto = function terminal_commands_library_certificate_crypto():void {
            node.child_process.exec(commands[index], {
                cwd: config.location
            }, function terminal_commands_library_certificate_child(erChild:Error):void {
                if (erChild === null) {
                    index = index + 1;
                    if (index < commands.length) {
                        terminal_commands_library_certificate_crypto();
                    } else {
                       config.callback("Certificate", [`Certificates created at ${config.location}`], null);
                    }
                } else {
                    error([`Error executing command: ${commands[index]}`], erChild);
                }
            });
        };

    node.fs.stat(config.location, function terminal_commands_library_certificate_createStat(stats:NodeJS.ErrnoException):void {

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
        const create = function terminal_commands_library_certificate_createStat_create():void {
            const mode:[string, string] = (config.selfSign === true)
                    ? [config.names.server.fileName, config.names.server.domain]
                    : [config.names.root.fileName, config.names.root.domain],
                org:string = `/O=${config.names.organization}/OU=${config.names.organization}`,
                // provides the path to the configuration file used for certificate signing
                pathConfig = function terminal_commands_library_certificate_createStat_create_confPath(extension:string):string {
                    return `"${vars.path.project}lib${vars.path.sep}certificate${vars.path.sep}extensions.cnf" -extensions ${extension}`;
                },
                // create a certificate signed by another certificate
                actionCert = function terminal_commands_library_certificate_createStat_create_cert(type:"intermediate"|"server"):string {
                    return `openssl req -new -sha512 -key ${config.names[type].fileName}.key -out ${config.names[type].fileName}.csr -subj "/CN=${config.names[type].domain + org}"`;
                },
                // generates the key file associated with a given certificate
                actionKey = function terminal_commands_library_certificate_createState_create_key(type:"intermediate"|"root"|"server"):string {
                    return `openssl genrsa -out ${config.names[type].fileName}.key 4096`;
                },
                // signs the certificate
                actionSign = function terminal_commands_library_certificate_createState_create_sign(cert:string, parent:string, path:"ca"|"selfSign"):string {
                    return `openssl x509 -req -sha512 -in ${cert}.csr -days ${config.days} -out ${cert}.crt -CA ${parent}.crt -CAkey ${parent}.key -CAcreateserial -extfile ${pathConfig("cert")}`;
                },
                root:string = `openssl req -x509 -new -newkey rsa:4096 -nodes -key ${mode[0]}.key -days ${config.days} -out ${mode[0]}.crt -subj "/CN=${mode[1] + org}"`;
            if (config.selfSign === true) {
                commands.push(actionKey("root"));
                commands.push(`${root} -config ${pathConfig("ca")}`);
            } else {
                // 1. generate a private key for root certificate
                commands.push(actionKey("root"));
                // 2. generate a root certificate
                commands.push(root);
                // 3. generate a private key for intermediate certificate
                commands.push(actionKey("intermediate"));
                // 4. generate an intermediate certificate signing request
                commands.push(actionCert("intermediate"));
                // 5. sign the intermediate certificate with the root certificate
                commands.push(actionSign(config.names.intermediate.fileName, config.names.root.fileName, "selfSign"));
                // 6. generate a private key for server certificate
                commands.push(actionKey("server"));
                // 7. generate a server certificate signing request
                commands.push(actionCert("server"));
                // 8. sign the server certificate with the intermediate certificate
                commands.push(actionSign(config.names.server.fileName, config.names.intermediate.fileName, "ca"));
            }
            crypto();
        };
        if (stats === null) {
            create();
        } else if (stats.code === "ENOENT") {
            mkdir(config.location, create);
        } else {
            error(["Certificate already exists."], null);
        }
    });
};

export default certificate;