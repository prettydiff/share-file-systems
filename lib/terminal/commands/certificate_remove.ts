
/* lib/terminal/commands/certificate_remove - Removes an HTTPS certificate created by this application. */

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import vars from "../utilities/vars.js";

import remove from "./remove.js";
import serverVars from "../server/serverVars.js";

const certificate_remove = function terminal_certificateRemove():void {
    if (vars.command === "certificate_remove") {
        log.title("Certificate Remove");
    }
    vars.node.fs.readdir(serverVars.certPath.replace(`${vars.sep + serverVars.certName}.`, ""), function terminal_certificateRemove_readdir(err:nodeError, fileList:string[]):void {
        if (err === null) {
            const ignore = function terminal_certificateRemove_readdir_ignore(value:string):void {
                    const index = fileList.indexOf(value);
                    if (index > -1) {
                        fileList.splice(index, 1);
                    }
                },
                ignoreList:string[] = ["ca.cnf", "readme.md", "selfSign.cnf"],
                callback = function terminal_certificateRemove_readdir_removeCallback():void {
                    status = status + 1;
                    if (status === total) {
                        const logs:string[] = [
                            `${vars.text.underline}Certificate deleted!${vars.text.none}`,
                            ""
                        ];
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
                                childBody = function terminal_certificateRemove_readdir_removeCallback_childBody(erRoot:nodeError, stdout:string):void {
                                    if (erRoot === null) {
                                        const certs:string[] = stdout.split("================ C"),
                                            complete = function terminal_certificateRemove_readdir_removeCallback_childBody_complete():void {
                                                const plural:string = (certDelete.ca.logs.length + certDelete.root.logs.length === 1)
                                                        ? ""
                                                        : "s",
                                                    logsEach = function terminal_certificateRemove_readdir_removeCallback_childBody_complete_each(value:string):void {
                                                        logs.push(value);
                                                    };
                                                if (certDelete.ca.logs.length + certDelete.root.logs.length === 0) {
                                                    vars.verbose = true;
                                                    log(logs, true);
                                                    return;
                                                }
                                                logs.push(`To remove the trusted certificate${plural} this application stored in your OS open an administrative terminal and execute:`);
                                                certDelete.ca.logs.forEach(logsEach);
                                                certDelete.root.logs.forEach(logsEach);
                                                vars.verbose = true;
                                                log(logs, true);
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
                                                if ((type === "root" && certs[certLength].indexOf("O=localhost,") > 0) || (type === "ca" && certs[certLength].indexOf("O=localhost-ca,") > 0)) {
                                                    id = certs[certLength].slice(certs[certLength].indexOf("Serial Number: ") + "Serial Number: ".length);
                                                    id = id.replace(/\s+/g, " ");
                                                    id = id.slice(0, id.indexOf(" "));
                                                    certDelete[type].logs.push(`${vars.text.green + vars.text.bold}certutil.exe -delstore -enterprise ${type} ${id + vars.text.none}`);
                                                }
                                            } while (certLength > 1);
                                            if (certDelete.ca.flag === true && certDelete.root.flag === true) {
                                                complete();
                                            }
                                        }
                                    } else {
                                        log([erRoot.toString()]);
                                        error([erRoot.toString()]);
                                    }
                                };
                            vars.node.child(certDelete.ca.command, childBody);
                            vars.node.child(certDelete.root.command, childBody);
                        } else {
                            logs.push("To remove this application's trusted certificate from your OS execute:");
                            logs.push(`${vars.text.green + vars.text.bold}sudo trust anchor --remove "${serverVars.certPath}crt"${vars.text.none} || true`);
                            vars.verbose = true;
                            log(logs, true);
                        }
                    }
                };
            let status:number = 0,
                total:number;
            ignoreList.forEach(ignore);
            total = fileList.length;
            if (total > 0) {
                fileList.forEach(function terminal_certificateRemove_readdir_each(file:string):void {
                    remove(`${vars.projectPath}certificate${vars.sep + file}`, callback);
                });
            } else {
                total = 1;
                callback();
            }
        } else {
            log([err.toString()]);
            error([err.toString()]);
        }
    });
};

export default certificate_remove;