
/* lib/terminal/server/readCerts - Reads certificates for secure transmission protocol support */

import { readFile, stat } from "fs";

import certificate from "../commands/certificate.js";
import vars from "../utilities/vars.js";

const readCerts = function terminal_server_readCerts(callback:(cert:certificate, certLogs:string[]) => void):void {
    let certLogs:string[] = null;
    const certLocation:string = `${vars.projectPath}lib${vars.sep}certificate${vars.sep}`,
        certName:string = "share-file",
        https:certificate = {
            certificate: {
                cert: "",
                key: ""
            },
            flag: {
                crt: false,
                key: false
            }
        },
        certCheck = function terminal_server_transmission_agentHttp_server_certCheck():void {
            if (https.flag.crt === true && https.flag.key === true) {
                if (https.certificate.cert === "" || https.certificate.key === "") {
                    certificate({
                        caDomain: "share-file-ca",
                        callback: function terminal_server_transmission_agentHttp_server_certCheck_callback(logs:string[]):void {
                            https.flag.crt = false;
                            https.flag.key = false;
                            httpsRead("crt");
                            httpsRead("key");
                            certLogs = logs;
                        },
                        caName: "share-file-ca",
                        days: 16384,
                        domain: "share-file",
                        location: certLocation,
                        mode: "create",
                        name: certName,
                        organization: "share-file",
                        selfSign: false
                    });
                } else {
                    callback(https, certLogs);
                }
            }
        },
        httpsRead = function terminal_server_transmission_agentHttp_server_httpsRead(certType:certKey):void {
            readFile(`${certLocation + certName}.${certType}`, "utf8", function terminal_server_transmission_agentHttp_server_httpsFile_stat_read(fileError:Error, fileData:string):void {
                https.flag[certType] = true;
                if (fileError === null) {
                    if (certType === "crt") {
                        https.certificate.cert = fileData;
                    } else {
                        https.certificate[certType] = fileData;
                    }
                }
                certCheck();
            });
        },
        httpsFile = function terminal_server_transmission_agentHttp_server_httpsFile(certType:certKey):void {
            stat(`${certLocation + certName}.${certType}`, function terminal_server_transmission_agentHttp_server_httpsFile_stat(statError:Error):void {
                if (statError === null) {
                    httpsRead(certType);
                } else {
                    https.flag[certType] = true;
                    certCheck();
                }
            });
        };

    httpsFile("crt");
    httpsFile("key");
};

export default readCerts;