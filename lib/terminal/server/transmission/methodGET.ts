
/* lib/terminal/server/transmission/methodGET - The library for handling all traffic related to HTTP requests with method GET. */
import { createReadStream, readdir, stat, Stats } from "fs";
import { IncomingMessage } from "http";

import error from "../../utilities/error.js";
import log from "../../utilities/log.js";
import readStorage from "../../utilities/readStorage.js";
import transmit_http from "./transmit_http.js";
import vars from "../../utilities/vars.js";


// cspell:words msapplication

const methodGET = function terminal_server_transmission_methodGET(request:IncomingMessage, serverResponse:httpSocket_response):void {
    const quest:number = request.url.indexOf("?"),
        uri:string = (quest > 0)
            ? request.url.slice(0, quest)
            : request.url,
        localPath:string = (uri === "/")
            ? `${vars.path.project}index.html`
            : vars.path.project + uri.slice(1).replace(/\/$/, "").replace(/\//g, vars.path.sep);
    stat(localPath, function terminal_server_transmission_methodGET_stat(ers:NodeJS.ErrnoException, stat:Stats):void {
        const random:number = Math.random(),
            // navigating a file structure in the browser by direct address, like apache HTTP
            xml:boolean = ((/\.xhtml/).test(localPath) === true),
            xmlPrefix:string = (xml === true)
                ? "xml:"
                : "",
            xmlTag:string = (xml === true)
                ? "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                : "",
            xmlns:string = (xml === true)
                ? " xmlns=\"http://www.w3.org/1999/xhtml\""
                : "",
            mimeType:mimeType = (xml === true)
                ? "application/xhtml+xml"
                : "text/html",
            page:string = [
                `${xmlTag}<!DOCTYPE html><html ${xmlPrefix}lang="en"${xmlns}><head><title>${vars.environment.name}</title><meta content="width=device-width, initial-scale=1" name="viewport"/><meta content="index, follow" name="robots"/><meta content="#fff" name="theme-color"/><meta content="en" http-equiv="Content-Language"/><meta content="${mimeType};charset=UTF-8" http-equiv="Content-Type"/><meta content="blendTrans(Duration=0)" http-equiv="Page-Enter"/><meta content="blendTrans(Duration=0)" http-equiv="Page-Exit"/><meta content="text/css" http-equiv="content-style-type"/><meta content="application/javascript" http-equiv="content-script-type"/><meta content="#bbbbff" name="msapplication-TileColor"/></head><body>`,
                `<h1>${vars.environment.name}</h1><div class="section">insertMe</div></body></html>`
            ].join("");
        if (request.url.indexOf("favicon.ico") < 0 && request.url.indexOf("images/apple") < 0) {
            if (ers === null) {
                if (stat.isDirectory() === true) {
                    readdir(localPath, function terminal_server_transmission_methodGET_stat_dir(erd:Error, list:string[]) {
                        const dirList:string[] = [`<p>directory of ${localPath}</p> <ul>`];
                        if (erd !== null) {
                            error([erd.toString()]);
                            return;
                        }
                        list.forEach(function terminal_server_transmission_methodGET_stat_dir_list(value:string) {
                            if ((/\.x?html?$/).test(value.toLowerCase()) === true) {
                                dirList.push(`<li><a href="${uri.replace(/\/$/, "")}/${value}">${value}</a></li>`);
                            } else {
                                dirList.push(`<li><a href="${uri.replace(/\/$/, "")}/${value}?${random}">${value}</a></li>`);
                            }
                        });
                        dirList.push("</ul>");
                        transmit_http.respond({
                            message: page.replace("insertMe", dirList.join("")),
                            mimeType: "text/html",
                            responseType: "GET",
                            serverResponse: serverResponse
                        }, true, request.url);
                    });
                    return;
                }
                if (stat.isFile() === true) {
                    const dataStore:Buffer[] = [],
                        readCallback = function terminal_server_transmission_methodGET_readCallback():void {
                            let tool:boolean = false,
                                type:mimeType;
                            const pageState = function terminal_server_transmission_methodGET_readCallback_pageState():void {
                                    const appliedData = function terminal_server_transmission_methodGET_readCallback_pageState_appliedData(settingsData:settings_item):void {
                                            if (settingsData.configuration.hashDevice === "") {
                                                settingsData.configuration.hashDevice = vars.settings.hashDevice;
                                            }
                                            const testBrowser:string = (vars.test.browser !== null && request.url.indexOf("?test_browser") > 0)
                                                    ? JSON.stringify(vars.test.browser)
                                                    : "{}",
                                                storageString:string = `<input type="hidden" value='{"addresses":${JSON.stringify(vars.environment.addresses)},"httpPort":${vars.environment.ports.http},"wsPort":${vars.environment.ports.ws}}'/><input type="hidden" value='${JSON.stringify(settingsData).replace(/'/g, "&#39;")}'/><input type="hidden" value='${testBrowser}'/>`,
                                                dataString:string = (localPath === `${vars.path.project}lib${vars.path.sep}index.html`)
                                                    ? Buffer.concat(dataStore).toString().replace("<!--stateString-->", storageString).replace("xml:lang=", "lang=")
                                                    : Buffer.concat(dataStore).toString().replace("<!--stateString-->", storageString);
                                            if (vars.test.browser !== null) {
                                                vars.test.browser.action = "nothing";
                                                vars.test.browser.test = null;
                                            }
                                            transmit_http.respond({
                                                message: dataString,
                                                mimeType: mimeType,
                                                responseType: "GET",
                                                serverResponse: serverResponse
                                            }, true, request.url);
                                        };
                                    tool = true;
                                    readStorage(appliedData);
                                };
    
                            if (localPath.indexOf(".js") === localPath.length - 3) {
                                type = "application/javascript";
                            } else if (localPath.indexOf(".css") === localPath.length - 4) {
                                type = "text/css";
                            } else if (localPath.indexOf(".jpg") === localPath.length - 4) {
                                type = "image/jpeg";
                            } else if (localPath.indexOf(".png") === localPath.length - 4) {
                                type = "image/png";
                            } else if (localPath.indexOf(".svg") === localPath.length - 4) {
                                type = "image/svg+xml";
                            } else if (xml === true) {
                                if (localPath === `${vars.path.project}index.xhtml`) {
                                    pageState();
                                } else {
                                    type = mimeType;
                                }
                            } else if (localPath.indexOf(".html") === localPath.length - 5 || localPath.indexOf(".htm") === localPath.length - 4) {
                                if (localPath === `${vars.path.project}index.html`) {
                                    pageState();
                                } else {
                                    type = mimeType;
                                }
                            } else {
                                type = mimeType;
                            }
                            if (tool === false) {
                                transmit_http.respond({
                                    message: Buffer.concat(dataStore),
                                    mimeType: type,
                                    responseType: "GET",
                                    serverResponse: serverResponse
                                }, true, request.url);
                            }
                        },
                        readStream = createReadStream(localPath);
                    readStream.on("data", function terminal_server_transmission_methodGET_readData(chunk:Buffer):void {
                        dataStore.push(chunk);
                    });
                    readStream.on("end", readCallback);
                } else {
                    serverResponse.end();
                }
            } else {
                if (ers.code === "ENOENT") {
                    log([`${vars.text.angry}404${vars.text.none} for ${uri}`]);
                    transmit_http.respond({
                        message: page.replace("insertMe", `<p>HTTP 404: ${uri}</p>`),
                        mimeType: "text/html",
                        responseType: "GET",
                        serverResponse: serverResponse
                    }, true, request.url);
                } else {
                    error([ers.toString()]);
                }
            }
        }
    });
};

export default methodGET;