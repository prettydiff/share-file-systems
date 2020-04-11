
/* lib/terminal/server/methodGET - The library for handling all traffic related to HTTP requests with method GET. */
import { Stats } from "fs";
import { IncomingMessage, ServerResponse } from "http";

import error from "../utilities/error.js";
import log from "../utilities/log.js";
import readFile from "../utilities/readFile.js";
import readStorage from "../utilities/readStorage.js";
import vars from "../utilities/vars.js";

import serverVars from "./serverVars.js";

const methodGET = function terminal_server_get(request:IncomingMessage, response:ServerResponse):void {
    let quest:number = request.url.indexOf("?"),
        uri:string = (quest > 0)
            ? request.url.slice(0, quest)
            : request.url;
    const library = {
            error: error,
            log: log,
            readFile: readFile,
            readStorage: readStorage
        },
        localPath:string = (uri === "/")
            ? `${vars.projectPath}index.html`
            : vars.projectPath + uri.slice(1).replace(/\/$/, "").replace(/\//g, vars.sep);
    vars.node.fs.stat(localPath, function terminal_server_create_stat(ers:nodeError, stat:Stats):void {
        const random:number = Math.random(),
            // navigating a file structure in the browser by direct address, like apache HTTP
            page:string = [
                //cspell:disable
                `<!DOCTYPE html><html lang="en" xmlns="http://www.w3.org/1999/xhtml"><head><title>${vars.version.name}</title><meta content="width=device-width, initial-scale=1" name="viewport"/><meta content="index, follow" name="robots"/><meta content="#fff" name="theme-color"/><meta content="en" http-equiv="Content-Language"/><meta content="application/xhtml+xml;charset=UTF-8" http-equiv="Content-Type"/><meta content="blendTrans(Duration=0)" http-equiv="Page-Enter"/><meta content="blendTrans(Duration=0)" http-equiv="Page-Exit"/><meta content="text/css" http-equiv="content-style-type"/><meta content="application/javascript" http-equiv="content-script-type"/><meta content="#bbbbff" name="msapplication-TileColor"/></head><body>`,
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
                        const pageState = function terminal_server_create_readCallback_pageState():void {
                                const appliedData = function terminal_server_create_readCallback_appliedData(storageData:storageItems):void {
                                        const dataString:string = (typeof data === "string")
                                                ? data.replace("<!--network:-->", `<!--network:{"family":"ipv6","ip":"::1","httpPort":${serverVars.webPort},"wsPort":${serverVars.wsPort}}--><!--storage:${JSON.stringify(storageData).replace(/--/g, "&#x2d;&#x2d;")}-->`)
                                                : "";
                                        response.write(dataString);
                                        response.end();
                                    };
                                
                                tool = true;
                                library.readStorage(appliedData);
                            },
                            csp:string = `default-src 'self'; font-src 'self' data:;style-src 'self' 'unsafe-inline'; connect-src 'self' ws://localhost:${serverVars.wsPort}/; frame-ancestors 'none'; media-src 'none'; object-src 'none'`;
                        if (localPath.indexOf(".js") === localPath.length - 3) {
                            response.writeHead(200, {"Content-Type": "application/javascript"});
                        } else if (localPath.indexOf(".css") === localPath.length - 4) {
                            response.writeHead(200, {"Content-Type": "text/css"});
                        } else if (localPath.indexOf(".jpg") === localPath.length - 4) {
                            response.writeHead(200, {"Content-Type": "image/jpeg"});
                        } else if (localPath.indexOf(".png") === localPath.length - 4) {
                            response.writeHead(200, {"Content-Type": "image/png"});
                        } else if (localPath.indexOf(".svg") === localPath.length - 4) {
                            response.writeHead(200, {"Content-Type": "image/svg+xml"});
                        } else if (localPath.indexOf(".xhtml") === localPath.length - 6) {
                            response.setHeader("content-security-policy", csp);
                            response.setHeader("connection", "keep-alive");
                            response.writeHead(200, {"Content-Type": "application/xhtml+xml"});
                            if (localPath === `${vars.projectPath}index.xhtml` && typeof data === "string") {
                                pageState();
                            }
                        } else if (localPath.indexOf(".html") === localPath.length - 5 || localPath.indexOf(".htm") === localPath.length - 4) {
                            response.setHeader("content-security-policy", csp);
                            response.setHeader("connection", "keep-alive");
                            response.writeHead(200, {"Content-Type": "text/html"});
                            if (localPath === `${vars.projectPath}index.html` && typeof data === "string") {
                                pageState();
                            }
                        } else {
                            response.writeHead(200, {"Content-Type": "text/plain"});
                        }
                        if (tool === false) {
                            response.write(data);
                            response.end();
                        }
                    },
                    readConfig:readFile = {
                        callback: readCallback,
                        index: 0,
                        path: localPath,
                        stat: stat
                    };
                library.readFile(readConfig);
            } else {
                response.end();
            }
            return;
        }
    });
};

export default methodGET;