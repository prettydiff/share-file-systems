
/* lib/terminal/commands/certificate - A command driven utility for creating an HTTPS certificate. */

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import mkdir from "../commands/mkdir.js";
import remove from "../commands/remove.js";
import vars from "../utilities/vars.js";

const certificate = function terminal_certificate(config:certificate_input):void {
    let index:number = 0;
    const fromCommand:boolean = (vars.command === "certificate"),
        commands:string[] = [],
        logConfig = function terminal_certificate_logConfig(logs:string[]):void {
            if (fromCommand === true) {
                logs.push(`Application mode: ${vars.text.cyan + config.mode + vars.text.none}`);
                if (config.mode === "create") {
                    logs.push(`Created at:       ${vars.text.cyan + config.location + vars.text.none}`);
                } else {
                    logs.push(`Removed from:     ${vars.text.cyan + config.location + vars.text.none}`);
                }
                logs.push(`Named:            ${vars.text.cyan + config.name + vars.text.none}`);
                logs.push(`Domain:           ${vars.text.cyan + config.domain + vars.text.none}`);
                logs.push(`Organization:     ${vars.text.cyan + config.organization + vars.text.none}`);
                logs.push(`Self Signed:      ${vars.text.cyan + config.selfSign + vars.text.none}`);
                if (config.selfSign === false || config.mode === "remove") {
                    logs.push(`Authority name:   ${vars.text.cyan + config.caName + vars.text.none}`);
                    logs.push(`Authority domain: ${vars.text.cyan + config.caDomain + vars.text.none}`);
                }
            }
            logs.push("");
        },
        posix = function terminal_certification_posix(logs:string[]):void {
            const name:string = (config.selfSign === true)
                    ? config.name
                    : config.caName,
                removes:[string, string] = (config.mode === "remove")
                    ? [" --remove", " || true"]
                    : ["", ""];
            if (config.mode === "remove") {
                if (fromCommand === true) {
                    logs.push("To remove this application's trusted certificate from your OS execute:");
                } else {
                    logs.push("To remove this application's trusted certificate from your OS open a shell and execute:");
                }
            } else {
                if (fromCommand === true) {
                    logs.push("To trust the new certificate use this command:");
                } else {
                    logs.push("To trust the new certificate open a shell and use this command:");
                }
            }
            logs.push(`${vars.text.green + vars.text.bold}sudo trust anchor${removes[0]} "${config.location + vars.sep + name}.crt"${removes[1] + vars.text.none}`);
        },
        crypto = function terminal_certificate_crypto():void {
            vars.node.child(commands[index], {
                cwd: config.location
            }, function terminal_certificate_child(erChild:Error):void {
                if (erChild === null) {
                    index = index + 1;
                    if (index < commands.length) {
                        terminal_certificate_crypto();
                    } else {
                        const logs:string[] = [
                            "",
                            `${vars.text.underline}Certificate created!${vars.text.none}`
                        ];
                        logConfig(logs);
                        if (process.platform === "win32") {
                            logs.push(`${vars.text.underline}To trust the new certificate open an administrative shell and execute:${vars.text.none}`);
                            // cspell:disable
                            if (config.selfSign === true) {
                                logs.push(`${vars.text.green + vars.text.bold}certutil.exe -addstore -enterprise root "${config.location + vars.sep + config.name}.crt"${vars.text.none}`);
                            } else {
                                logs.push(`${vars.text.green + vars.text.bold}certutil.exe -addstore -enterprise root "${config.location + vars.sep + config.caName}.crt"${vars.text.none}`);
                                logs.push(`${vars.text.green + vars.text.bold}certutil.exe -addstore -enterprise ca "${config.location + vars.sep + config.name}.crt"${vars.text.none}`);
                            }
                            // cspell:enable
                        } else {
                            posix(logs);
                        }
                        // Firefox
                        logs.push("");
                        logs.push(`${vars.text.underline}To enable in Firefox${vars.text.none}`);
                        logs.push(`${vars.text.angry}1.${vars.text.none} open Firefox to address: ${vars.text.cyan}about:config${vars.text.none}`);
                        logs.push(`${vars.text.angry}2.${vars.text.none} change key ${vars.text.cyan}security.enterprise_roots.enabled${vars.text.none} to value ${vars.text.bold + vars.text.green}true${vars.text.none}`);
                        config.callback(logs);
                    }
                    return;
                }
                log([erChild.toString()]);
            });
        },
        readdir = function terminal_certificate_readdir(err:nodeError, fileList:string[]):void {
            if (err === null) {
                const killList:string[] = [`${config.caName}.crt`, `${config.caName}.key`, `${config.caName}.srl`, `${config.name}.crt`, `${config.name}.csr`, `${config.name}.key`],
                    callback = function terminal_certificate_readdir_removeCallback():void {
                        status = status + 1;
                        if (total === 0 || status === total) {
                            const logs:string[] = [];
                            if (total === 0) {
                                logs.push("No certificate files to remove.");
                                logs.push("");
                            } else {
                                logs.push(`${vars.text.underline}Certificate removed!${vars.text.none}`);
                                logConfig(logs);
                            }
                            if (process.platform === "win32") {
                                // cspell:disable
                                const certDelete:certificate_remove = {
                                        ca: {
                                            command: "certutil.exe -store -enterprise ca",
                                            flag: false,
                                            logs: []
                                        },
                                        root: {
                                            command: "certutil.exe -store -enterprise root",
                                            flag: false,
                                            logs: []
                                        }
                                    },
                                    childBody = function terminal_certificate_readdir_removeCallback_childBody(erRoot:nodeError, stdout:string):void {
                                        if (erRoot === null) {
                                            const certs:string[] = stdout.split("================ C"),
                                                complete = function terminal_certificate_readdir_removeCallback_childBody_complete():void {
                                                    const plural:string = (certDelete.ca.logs.length + certDelete.root.logs.length === 1)
                                                            ? ""
                                                            : "s",
                                                        logsEach = function terminal_certificate_readdir_removeCallback_childBody_complete_each(value:string):void {
                                                            logs.push(value);
                                                        };
                                                    if (certDelete.ca.logs.length + certDelete.root.logs.length === 0) {
                                                        logs.push("No trusted certificates to remove from Windows.");
                                                        vars.verbose = true;
                                                        log(logs, true);
                                                        return;
                                                    }
                                                    logs.push(`To remove this application's trusted certificate${plural} stored in Windows open an administrative terminal and execute:`);
                                                    certDelete.ca.logs.forEach(logsEach);
                                                    certDelete.root.logs.forEach(logsEach);
                                                    config.callback(logs);
                                                };
                                            let certLength:number = certs.length,
                                                type:"ca"|"root" = (certs[0].indexOf("root") === 0)
                                                    ? "root"
                                                    : "ca",
                                                id:string;
                                            certDelete[type].flag = true;
                                            if (certLength > 1) {
                                                do {
                                                    certLength = certLength - 1;
                                                    if (certs[certLength].indexOf(`O=${config.organization},`) > 0) {
                                                        id = certs[certLength].slice(certs[certLength].indexOf("Serial Number: ") + "Serial Number: ".length);
                                                        id = id.replace(/\s+/g, " ");
                                                        id = id.slice(0, id.indexOf(" "));
                                                        certDelete[type].logs.push(`${vars.text.green + vars.text.bold}certutil.exe -delstore -enterprise ${type} ${id + vars.text.none}`);
                                                    }
                                                } while (certLength > 1);
                                                if (certDelete.ca.flag === true && certDelete.root.flag === true) {
                                                    complete();
                                                }
                                            } else if (certDelete.ca.flag === true && certDelete.root.flag === true) {
                                                complete();
                                            }
                                        } else {
                                            log([erRoot.toString()]);
                                            error([erRoot.toString()]);
                                        }
                                    };
                                vars.node.child(certDelete.ca.command, childBody);
                                vars.node.child(certDelete.root.command, childBody);
                            } else {
                                posix(logs);
                            }
                        }
                    };
                let status:number = 0,
                    total:number = 0;
                if (fileList.length > 0) {
                    fileList.forEach(function terminal_certificate_readdir_each(file:string):void {
                        if (killList.indexOf(file) > -1) {
                            total = total + 1;
                            log([`${vars.text.angry}*${vars.text.none} Removing file ${config.location + vars.sep + file}`]);
                            remove(config.location + vars.sep + file, callback);
                        }
                    });
                    if (total === 0) {
                        callback();
                    }
                } else {
                    callback();
                }
            } else {
                log([err.toString()]);
                error([err.toString()]);
            }
        };

    if (fromCommand === true) {
        const indexes:number[] = [];
        let indexLength:number,
            index:number = process.argv.length,
            orgTest:boolean = false;

        config = {
            caDomain: "share-file-ca",
            callback: function terminal_certificate_callback(logs:string[]):void {
                vars.verbose = true;
                log(logs, true);
            },
            caName: "share-file-ca",
            days: 16384,
            domain: "share-file",
            location: "",
            mode: "create",
            name: "share-file",
            organization: "share-file",
            selfSign: false
        };

        // apply configuration values from terminal arguments
        if (index > 0) {
            do {
                index = index - 1;
                if (process.argv[index] === "self-sign") {
                    indexes.push(index);
                    config.selfSign = true;
                } else if (process.argv[index].toLowerCase() === "remove") {
                    indexes.push(index);
                    config.mode = "remove";
                } else if (process.argv[index].indexOf("domain:") === 0) {
                    indexes.push(index);
                    config.domain = process.argv[index].replace("domain:", "");
                    if ((config.domain.charAt(0) === "\"" || config.domain.charAt(0) === "\"") && config.domain.charAt(config.domain.length - 1) === config.domain.charAt(0)) {
                        config.domain = config.domain.slice(1, config.domain.length - 1);
                    }
                } else if (process.argv[index].indexOf("organization:") === 0) {
                    orgTest = true;
                    indexes.push(index);
                    config.organization = process.argv[index].replace("organization:", "");
                    if ((config.organization.charAt(0) === "\"" || config.organization.charAt(0) === "\"") && config.organization.charAt(config.organization.length - 1) === config.organization.charAt(0)) {
                        config.organization = config.organization.slice(1, config.organization.length - 1);
                    }
                } else if (process.argv[index].indexOf("ca-domain:") === 0) {
                    indexes.push(index);
                    config.caDomain = process.argv[index].replace("ca-domain:", "");
                    if ((config.caDomain.charAt(0) === "\"" || config.caDomain.charAt(0) === "\"") && config.caDomain.charAt(config.caDomain.length - 1) === config.caDomain.charAt(0)) {
                        config.caDomain = config.caDomain.slice(1, config.caDomain.length - 1);
                    }
                } else if (process.argv[index].indexOf("name:") === 0) {
                    indexes.push(index);
                    config.name = process.argv[index].replace("name:", "");
                    if ((config.name.charAt(0) === "\"" || config.name.charAt(0) === "\"") && config.name.charAt(config.name.length - 1) === config.name.charAt(0)) {
                        config.name = config.name.slice(1, config.name.length - 1);
                    }
                } else if (process.argv[index].indexOf("ca-name:") === 0) {
                    indexes.push(index);
                    config.caName = process.argv[index].replace("ca-name:", "");
                    if ((config.caName.charAt(0) === "\"" || config.caName.charAt(0) === "\"") && config.caName.charAt(config.caName.length - 1) === config.caName.charAt(0)) {
                        config.caName = config.caName.slice(1, config.caName.length - 1);
                    }
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

        if (process.argv.length > 0) {
            config.location = process.argv[0];
        } else {
            config.location = `${vars.projectPath}lib${vars.sep}certificate`;
        }
        if (orgTest === false && config.selfSign === false) {
            config.organization = "share-file-ca";
        }
    } else if (config.location === "") {
        config.location = `${vars.projectPath}lib${vars.sep}certificate`;
    }

    config.location = config.location.replace(/(\/|\\)$/, "");

    // convert relative path to absolute from shell current working directory
    if ((process.platform === "win32" && (/^\w:\\/).test(config.location) === false) || (process.platform !== "win32" && config.location.charAt(0) !== "/")) {
        config.location = process.cwd() + vars.sep + config.location.replace(/^(\\|\/)+/, "");
    }
    
    if (config.mode === "create") {
        vars.node.fs.stat(config.location, function terminal_certificate_createStat(stat:nodeError):void {
            const create = function terminal_certificate_createStat_create():void {
                const mode:[string, string, string] = (config.selfSign === true)
                        ? ["selfSign", config.name, config.domain]
                        : ["ca", config.caName, config.caDomain],
                    confPath:string = `${vars.projectPath}lib${vars.sep}certificate${vars.sep + mode[0]}.cnf -extensions x509_ext`,
                    key = function terminal_certificate_createState_create_key(type:"name"|"caName"):string {
                        return `openssl genpkey -algorithm RSA -out ${config[type]}.key`;
                    },
                    cert:string = `openssl req -x509 -key ${mode[1]}.key -days ${config.days} -out ${mode[1]}.crt -subj "/CN=${mode[2]}/O=${config.organization}"`;
                if (fromCommand === true) {
                    log.title("Certificate Create");
                }
                // cspell:disable
                if (config.selfSign === true) {
                    commands.push(key("name"));
                    commands.push(`${cert} -config ${confPath}`);
                } else {
                    commands.push(key("caName"));
                    commands.push(cert);
                    commands.push(key("name"));
                    commands.push(`openssl req -new -key ${config.name}.key -out ${config.name}.csr -subj "/CN=${config.domain}/O=${config.organization}"`);
                    commands.push(`openssl x509 -req -in ${config.name}.csr -days ${config.days} -out ${config.name}.crt -CA ${config.caName}.crt -CAkey ${config.caName}.key -CAcreateserial -extfile ${confPath}`);
                }
                // cspell:enable
                crypto();
            };
            if (stat === null) {
                create();
            } else if (stat.code === "ENOENT") {
                mkdir(config.location, create, false);
            } else {
                log([stat.toString()]);
                error([stat.toString()]);
            }
        });
    } else {
        if (fromCommand === true) {
            log.title("Certificate Remove");
        }
        vars.node.fs.readdir(config.location, readdir);
    }
};

export default certificate;