
/* lib/terminal/server/readCerts - Reads certificates for secure transmission protocol support */

import { readFile, stat } from "fs";

import error from "../utilities/error.js";
import vars from "../utilities/vars.js";

const readCerts = function terminal_server_readCerts(callback:(cert:certificate, certLogs:string[]) => void):void {
    let certLogs:string[] = null;
    const certLocation:string = `${vars.path.project}lib${vars.path.sep}certificate${vars.path.sep}`,
        certName:string = "share-file",
        caName:string = "share-file-ca",
        https:certificate = {
            certificate: {
                ca: "",
                cert: "",
                key: ""
            },
            flag: {
                ca: false,
                crt: false,
                key: false
            }
        },
        certCheck = function terminal_server_transmission_agentHttp_server_certCheck():void {
            if (https.flag.ca === true && https.flag.crt === true && https.flag.key === true) {
                if (https.certificate.ca === "" || https.certificate.cert === "" || https.certificate.key === "") {
                    error([
                        `${vars.text.angry}Required certificate files are missing.${vars.text.none}`,
                        "Run the build again:",
                        `${vars.text.cyan}share build${vars.text.none}`
                    ]);
                } else {
                    callback(https, certLogs);
                }
            }
        },
        httpsRead = function terminal_server_transmission_agentHttp_server_httpsRead(certType:certKey):void {
            const location:string = (certType === "ca")
                ? `${certLocation + caName}.crt`
                : `${certLocation + certName}.${certType}`;
            readFile(location, "utf8", function terminal_server_transmission_agentHttp_server_httpsFile_stat_read(fileError:Error, fileData:string):void {
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
            const location:string = (certType === "ca")
                ? `${certLocation + caName}.crt`
                : `${certLocation + certName}.${certType}`;
            stat(location, function terminal_server_transmission_agentHttp_server_httpsFile_stat(statError:Error):void {
                if (statError === null) {
                    httpsRead(certType);
                } else {
                    https.flag[certType] = true;
                    certCheck();
                }
            });
        };

    httpsFile("ca");
    httpsFile("crt");
    httpsFile("key");
};

export default readCerts;