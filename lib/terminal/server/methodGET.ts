
import { IncomingMessage, ServerResponse } from "http";

import error from "../error.js";
import log from "../log.js";
import readFile from "../readFile.js";
import vars from "../vars.js";

import serverVars from "./serverVars.js";

const methodGET = function terminal_server_get(request:IncomingMessage, response:ServerResponse):void {
    let quest:number = request.url.indexOf("?"),
        uri:string = (quest > 0)
            ? request.url.slice(0, quest)
            : request.url;
    const library = {
            error: error,
            log: log,
            readFile: readFile
        },
        localPath:string = (uri === "/")
            ? `${vars.projectPath}index.xhtml`
            : vars.projectPath + uri.slice(1).replace(/\/$/, "").replace(/\//g, vars.sep);
    vars.node.fs.stat(localPath, function terminal_server_create_stat(ers:nodeError, stat:Stats):void {
        const random:number = Math.random(),
            // navigating a file structure in the browser by direct address, like apache HTTP
            page:string = [
                //cspell:disable
                `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE html><html xml:lang="en" xmlns="http://www.w3.org/1999/xhtml"><head><title>${vars.version.name}</title><meta content="width=device-width, initial-scale=1" name="viewport"/><meta content="index, follow" name="robots"/><meta content="#fff" name="theme-color"/><meta content="en" http-equiv="Content-Language"/><meta content="application/xhtml+xml;charset=UTF-8" http-equiv="Content-Type"/><meta content="blendTrans(Duration=0)" http-equiv="Page-Enter"/><meta content="blendTrans(Duration=0)" http-equiv="Page-Exit"/><meta content="text/css" http-equiv="content-style-type"/><meta content="application/javascript" http-equiv="content-script-type"/><meta content="#bbbbff" name="msapplication-TileColor"/></head><body>`,
                //cspell:enable
                `<h1>${vars.version.name}</h1><div class="section">insertMe</div></body></html>`
            ].join("");
        if (request.url.indexOf("favicon.ico") < 0 && request.url.indexOf("images/apple") < 0) {
            if (ers !== null) {
                if (ers.code === "ENOENT") {
                    library.log([`${vars.text.angry}404${vars.text.none} for ${uri}`]);
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write(page.replace("insertMe", `<p>HTTP 404: ${uri}</p>`));
                    response.end();
                } else {
                    library.error([ers.toString()]);
                }
                return;
            }
            if (stat.isDirectory() === true) {
                vars.node.fs.readdir(localPath, function terminal_server_create_stat_dir(erd:Error, list:string[]) {
                    const dirList:string[] = [`<p>directory of ${localPath}</p> <ul>`];
                    if (erd !== null) {
                        library.error([erd.toString()]);
                        return;
                    }
                    list.forEach(function terminal_server_create_stat_dir_list(value:string) {
                        if ((/\.x?html?$/).test(value.toLowerCase()) === true) {
                            dirList.push(`<li><a href="${uri.replace(/\/$/, "")}/${value}">${value}</a></li>`);
                        } else {
                            dirList.push(`<li><a href="${uri.replace(/\/$/, "")}/${value}?${random}">${value}</a></li>`);
                        }
                    });
                    dirList.push("</ul>");
                    response.writeHead(200, {"Content-Type": "text/html"});
                    response.write(page.replace("insertMe", dirList.join("")));
                    response.end();
                });
                return;
            }
            if (stat.isFile() === true) {
                const readCallback = function terminal_server_create_readCallback(args:readFile, data:string|Buffer):void {
                    let tool:boolean = false;
                    if (localPath.indexOf(".js") === localPath.length - 3) {
                        response.writeHead(200, {"Content-Type": "application/javascript"});
                    } else if (localPath.indexOf(".css") === localPath.length - 4) {
                        response.writeHead(200, {"Content-Type": "text/css"});
                    } else if (localPath.indexOf(".jpg") === localPath.length - 4) {
                        response.writeHead(200, {"Content-Type": "image/jpeg"});
                    } else if (localPath.indexOf(".png") === localPath.length - 4) {
                        response.writeHead(200, {"Content-Type": "image/png"});
                    } else if (localPath.indexOf(".xhtml") === localPath.length - 6) {
                        response.setHeader("content-security-policy", `default-src 'self'; font-src 'self' data:; connect-src 'self' ws://${serverVars.addresses[0][1][1]}:${serverVars.wsPort}; frame-ancestors 'none'; media-src 'none'; object-src 'none'`);
                        response.setHeader("connection", "keep-alive");
                        response.writeHead(200, {"Content-Type": "application/xhtml+xml"});
                        if (localPath === `${vars.projectPath}index.xhtml` && typeof data === "string") {
                            const flag:any = {
                                settings: false,
                                messages: false
                            };
                            let list:string[] = [],
                                appliedData = function terminal_server_create_readFile_appliedData():string {
                                    const start:string = "<!--storage:-->",
                                        startLength:number = data.indexOf(start) + start.length - 3,
                                        dataString:string = data.replace("<!--network:-->", `<!--network:{"family":"${serverVars.addresses[0][1][2]}","ip":"${serverVars.addresses[0][1][1]}","port":${serverVars.webPort},"wsPort":${serverVars.wsPort},"serverPort":${serverVars.serverPort}}-->`);
                                    return `${dataString.slice(0, startLength)}{${list.join(",")}}${dataString.slice(startLength)}`;
                                };
                            tool = true;
                            vars.node.fs.stat(`${vars.projectPath}storage${vars.sep}settings.json`, function terminal_server_create_readFile_statSettings(erSettings:nodeError):void {
                                if (erSettings !== null) {
                                    if (erSettings.code === "ENOENT") {
                                        flag.settings = true;
                                        list.push(`"settings":{}`);
                                        if (flag.messages === true) {
                                            response.write(appliedData());
                                            response.end();
                                        }
                                    } else {
                                        library.error([erSettings.toString()]);
                                        response.write(data);
                                        response.end();
                                    }
                                } else {
                                    vars.node.fs.readFile(`${vars.projectPath}storage${vars.sep}settings.json`, "utf8", function terminal_server_create_readFile_statSettings(errSettings:Error, settings:string):void {
                                        if (errSettings !== null) {
                                            library.error([errSettings.toString()]);
                                            response.write(data);
                                            response.end();
                                        } else {
                                            list.push(`"settings":${settings.replace(/--/g, "&#x2d;&#x2d;")}`);
                                            flag.settings = true;
                                            if (flag.messages === true) {
                                                response.write(appliedData());
                                                response.end();
                                            }
                                        }
                                    });
                                }
                            });
                            vars.node.fs.stat(`${vars.projectPath}storage${vars.sep}messages.json`, function terminal_server_create_readFile_statMessages(erMessages:nodeError):void {
                                if (erMessages !== null) {
                                    if (erMessages.code === "ENOENT") {
                                        flag.messages = true;
                                        list.push(`"messages":{}`);
                                        if (flag.settings === true) {
                                            response.write(appliedData());
                                            response.end();
                                        }
                                    } else {
                                        library.error([erMessages.toString()]);
                                        response.write(data);
                                        response.end();
                                    }
                                } else {
                                    vars.node.fs.readFile(`${vars.projectPath}storage${vars.sep}messages.json`, "utf8", function terminal_server_create_readFile_statMessages(errMessages:Error, messages:string):void {
                                        if (errMessages !== null) {
                                            library.error([errMessages.toString()]);
                                            response.write(data);
                                            response.end();
                                        } else {
                                            list.push(`"messages":${messages.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/--/g, "&#x2d;&#x2d;")}`);
                                            flag.messages = true;
                                            if (flag.settings === true) {
                                                response.write(appliedData());
                                                response.end();
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    } else if (localPath.indexOf(".html") === localPath.length - 5 || localPath.indexOf(".htm") === localPath.length - 4) {
                        response.setHeader("Content-Security-Policy", `default-src 'self'; font-src 'self' data:; connect-src 'self' ws://${serverVars.addresses[0][1][1]}:${serverVars.wsPort}; frame-ancestors 'none'; media-src 'none'; object-src 'none'`);
                        response.writeHead(200, {"Content-Type": "text/html"});
                    } else {
                        response.writeHead(200, {"Content-Type": "text/plain"});
                    }
                    if (tool === false) {
                        response.write(data);
                        response.end();
                    }
                };
                library.readFile({
                    callback: readCallback,
                    index: 0,
                    path: localPath,
                    stat: stat
                });
            } else {
                response.end();
            }
            return;
        }
    });
};

export default methodGET;