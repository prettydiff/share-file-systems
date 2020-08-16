
/* lib/terminal/commands/certificate_create - A command driven utility for creating an HTTPS certificate. */

import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import serverVars from "../server/serverVars.js";

const certificate_create = function terminal_certificateCreate(callback:(logs:string[]) => void, selfSign:boolean):void {
    // cspell:disable
    let index:number = 0;
    const selfSigned:boolean = (vars.command === "certificate_create")
            ? (process.argv[0] === "self-signed")
                ? true
                : false
            : selfSign,
        commands:string[] = [],
        // cspell:enable
        crypto = function terminal_server_service_crypto():void {
            vars.node.child(commands[index], {
                cwd: `${vars.projectPath}certificate`
            }, function terminal_server_service_child(erChild:Error):void {
                if (erChild === null) {
                    index = index + 1;
                    if (index < commands.length) {
                        terminal_server_service_crypto();
                    } else {
                        const logs:string[] = [
                            `${vars.text.underline}Certificate created!${vars.text.none}`,
                            "",
                            "To trust the new certificate open an administrative shell and execute:"
                        ];
                        if (process.platform === "win32") {
                            logs.push("To trust the new certificate open an administrative shell and execute:");
                            // cspell:disable
                            if (selfSigned === true) {
                                logs.push(`${vars.text.green + vars.text.bold}certutil.exe -addstore -enterprise root "${serverVars.certPath}crt"${vars.text.none}`);
                            } else {
                                logs.push(`${vars.text.green + vars.text.bold}certutil.exe -addstore -enterprise ca "${serverVars.certPath}crt"${vars.text.none}`);
                            }
                            // cspell:enable
                        } else {
                            logs.push("To trust the new certificate open a shell and use this command:");
                            // cspell:disable
                            logs.push(`${vars.text.green + vars.text.bold}sudo trust anchor "${serverVars.certPath}crt"${vars.text.none}`);
                            // cspell:enable
                        }
                        if (vars.command === "certificate_create") {
                            vars.verbose = true;
                            log(logs, true);
                        } else {
                            callback(logs);
                        }
                    }
                    return;
                }
                log([erChild.toString()]);
            });
        };
    if (vars.command === "certificate_create") {
        log.title("Certificate Create");
    }
    
    // cspell:disable
    if (selfSigned === true) {
        commands.push(`openssl genpkey -algorithm RSA -out ${serverVars.certName}.key`);
        commands.push(`openssl req -x509 -key ${serverVars.certName}.key -out ${serverVars.certName}.crt -subj \"/CN=localhost/O=localhost\" -config selfSign.cnf -extensions x509_ext`);
    } else {
        commands.push("openssl genpkey -algorithm RSA -out ca.key");
        commands.push("openssl req -x509 -key ca.key -out ca.crt -subj \"/CN=localhost-ca/O=localhost-ca\"");
        commands.push(`openssl genpkey -algorithm RSA -out ${serverVars.certName}.key`);
        commands.push(`openssl req -new -key ${serverVars.certName}.key -out ${serverVars.certName}.csr -subj \"/CN=localhost/O=localhost-ca\"`);
        commands.push(`openssl x509 -req -in ${serverVars.certName}.csr -days 9999 -out ${serverVars.certName}.crt -CA ca.crt -CAkey ca.key -CAcreateserial -extfile ca.cnf -extensions x509_ext`);
    }
    // cspell:enable
    crypto();
};

export default certificate_create;