
/* lib/terminal/server/readCerts - Reads certificates for secure transmission protocol support */

import error from "../utilities/error.js";
import node from "../utilities/node.js";
import vars from "../utilities/vars.js";

const readCerts = function terminal_server_readCerts(callback:(options:transmit_tlsOptions) => void):void {
    const certLocation:string = `${vars.path.project}lib${vars.path.sep}certificate${vars.path.sep}`,
        certName:string = "share-file",
        caName:string = "share-file-ca",
        https:transmit_tlsOptions = {
            options: {
                ca: "",
                cert: "",
                key: ""
            },
            fileFlag: {
                ca: false,
                crt: false,
                key: false
            }
        },
        certCheck = function terminal_server_readCerts_certCheck():void {
            if (https.fileFlag.ca === true && https.fileFlag.crt === true && https.fileFlag.key === true) {
                if (https.options.ca === "" || https.options.cert === "" || https.options.key === "") {
                    error([
                        `${vars.text.angry}Required certificate files are missing.${vars.text.none}`,
                        "Run the build again:",
                        `${vars.text.cyan}share build${vars.text.none}`
                    ], null);
                } else {
                    callback(https);
                }
            }
        },
        httpsRead = function terminal_server_readCerts_httpsRead(certType:certKey):void {
            const location:string = (certType === "ca")
                ? `${certLocation + caName}.crt`
                : `${certLocation + certName}.${certType}`;
            node.fs.readFile(location, "utf8", function terminal_server_readCerts_httpsRead_readFile(fileError:node_error, fileData:string):void {
                https.fileFlag[certType] = true;
                if (fileError === null) {
                    if (certType === "crt") {
                        https.options.cert = fileData;
                    } else {
                        https.options[certType] = fileData;
                    }
                }
                certCheck();
            });
        },
        httpsFile = function terminal_server_readCerts_httpsFile(certType:certKey):void {
            const location:string = (certType === "ca")
                ? `${certLocation + caName}.crt`
                : `${certLocation + certName}.${certType}`;
            node.fs.stat(location, function terminal_server_readCerts_httpsFile_stat(statError:node_error):void {
                if (statError === null) {
                    httpsRead(certType);
                } else {
                    https.fileFlag[certType] = true;
                    certCheck();
                }
            });
        };

    httpsFile("ca");
    httpsFile("crt");
    httpsFile("key");
};

export default readCerts;