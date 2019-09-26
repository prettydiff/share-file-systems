
import { Socket } from "net";
import { NetworkInterfaceInfo } from "os";
import WebSocket from "../../ws-es6/lib/websocket.js";

import copy from "./copy.js";
import directory from "./directory.js";
import error from "./error.js";
import log from "./log.js";
import makeDir from "./makeDir.js";
import readFile from "./readFile.js";
import remove from "./remove.js";
import vars from "./vars.js";

interface socketList {
    [key:string]: Socket;
}

// runs services: http, web sockets, and file system watch.  Allows rapid testing with automated rebuilds
const library = {
        copy: copy,
        directory: directory,
        error: error,
        log: log,
        makeDir: makeDir,
        readFile: readFile,
        remove: remove
    },
    server = function node_apps_server():void {
        let timeStore:number = 0,
            serverPort:number = 0, // serverPort - for TCP sockets across the network
            webPort:number = 0, // webPort - http port for requests from browser
            wsPort:number = 0, // wsPort - web socket port for requests from node
            interfaceLongest:number = 0,
            responder:any,
            socketList:socketList = {};
        const browser:boolean = (function node_apps_server_browser():boolean {
                const index:number = process.argv.indexOf("browser");
                if (index > -1) {
                    process.argv.splice(index, 1);
                    return true;
                }
                return false;
            }()),
            addresses:[string, string, string][] = (function node_apps_server_addresses():[string, string, string][] {
                const interfaces:NetworkInterfaceInfo = vars.node.os.networkInterfaces(),
                    store:[string, string, string][] = [],
                    keys:string[] = Object.keys(interfaces),
                    length:number = keys.length;
                let a:number = 0,
                    b:number = 0,
                    ipv6:number,
                    ipv4:number;
                do {
                    ipv4 = -1;
                    ipv6 = -1;
                    b = 0;
                    do {
                        if (interfaces[keys[a]][b].internal === false) {
                            if (interfaces[keys[a]][b].family === "IPv6") {
                                ipv6 = b;
                                if (ipv4 > -1) {
                                    break;
                                }
                            }
                            if (interfaces[keys[a]][b].family === "IPv4") {
                                ipv4 = b;
                                if (ipv6 > -1) {
                                    break;
                                }
                            }
                        }
                        b = b + 1;
                    } while (b < interfaces[keys[a]].length);
                    if (ipv6 > -1) {
                        store.push([keys[a], interfaces[keys[a]][ipv6].address, "ipv6"]);
                        if (ipv4 > -1) {
                            store.push(["", interfaces[keys[a]][ipv4].address, "ipv4"]);
                        }
                    } else if (ipv4 > -1) {
                        store.push([keys[a], interfaces[keys[a]][ipv4].address, "ipv4"]);
                    }
                    if (keys[a].length > interfaceLongest && interfaces[keys[a]][0].internal === false) {
                        interfaceLongest = keys[a].length;
                    }
                    a = a + 1;
                } while (a < length);
                return store;
            }()),
            port:number = (isNaN(Number(process.argv[0])) === true)
                ? vars.version.port
                : Number(process.argv[0]),
            keyword:string = (process.platform === "darwin")
                ? "open"
                : (process.platform === "win32")
                    ? "start"
                    : "xdg-open",
            watches = {},
            server = vars.node.http.createServer(function node_apps_server_create(request, response):void {
                if (request.method === "GET") {
                    let quest:number = request.url.indexOf("?"),
                        uri:string = (quest > 0)
                            ? request.url.slice(0, quest)
                            : request.url;
                    const localPath:string = (uri === "/")
                        ? `${vars.projectPath}index.xhtml`
                        : vars.projectPath + uri.slice(1).replace(/\/$/, "").replace(/\//g, vars.sep);
                    vars.node.fs.stat(localPath, function node_apps_server_create_stat(ers:nodeError, stat:Stats):void {
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
                                vars.node.fs.readdir(localPath, function node_apps_server_create_stat_dir(erd:Error, list:string[]) {
                                    const dirList:string[] = [`<p>directory of ${localPath}</p> <ul>`];
                                    if (erd !== null) {
                                        library.error([erd.toString()]);
                                        return;
                                    }
                                    list.forEach(function node_apps_server_create_stat_dir_list(value:string) {
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
                                const readCallback = function node_apps_server_create_readCallback(args:readFile, data:string|Buffer):void {
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
                                        response.writeHead(200, {"Content-Type": "application/xhtml+xml"});
                                        if (localPath === `${vars.projectPath}index.xhtml` && typeof data === "string") {
                                            const flag:any = {
                                                settings: false,
                                                messages: false
                                            };
                                            let list:string[] = [],
                                                appliedData = function node_apps_server_create_readFile_appliedData():string {
                                                    const start:string = "<!--storage:-->",
                                                        startLength:number = data.indexOf(start) + start.length - 3,
                                                        dataString:string = data.replace("<!--network:-->", `<!--network:{"family":"${addresses[1][2]}","ip":"${addresses[1][1]}","port":${webPort},"wsPort":${wsPort},"serverPort":${serverPort}}-->`);
                                                    return `${dataString.slice(0, startLength)}{${list.join(",")}}${dataString.slice(startLength)}`;
                                                };
                                            tool = true;
                                            vars.node.fs.stat(`${vars.projectPath}storage${vars.sep}settings.json`, function node_apps_server_create_readFile_statSettings(erSettings:nodeError):void {
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
                                                    vars.node.fs.readFile(`${vars.projectPath}storage${vars.sep}settings.json`, "utf8", function node_apps_server_create_readFile_statSettings(errSettings:Error, settings:string):void {
                                                        if (errSettings !== null) {
                                                            library.error([errSettings.toString()]);
                                                            response.write(data);
                                                            response.end();
                                                        } else {
                                                            list.push(`"settings":${settings}`);
                                                            flag.settings = true;
                                                            if (flag.messages === true) {
                                                                response.write(appliedData());
                                                                response.end();
                                                            }
                                                        }
                                                    });
                                                }
                                            });
                                            vars.node.fs.stat(`${vars.projectPath}storage${vars.sep}messages.json`, function node_apps_server_create_readFile_statMessages(erMessages:nodeError):void {
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
                                                    vars.node.fs.readFile(`${vars.projectPath}storage${vars.sep}messages.json`, "utf8", function node_apps_server_create_readFile_statMessages(errMessages:Error, messages:string):void {
                                                        if (errMessages !== null) {
                                                            library.error([errMessages.toString()]);
                                                            response.write(data);
                                                            response.end();
                                                        } else {
                                                            list.push(`"messages":${messages}`);
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
                } else {
                    let body:string = "";
                    request.on('data', function (data:string) {
                        body = body + data;
                        if (body.length > 1e6) {
                            request.connection.destroy();
                        }
                    });

                    request.on('end', function node_apps_server_create_end():void {
                        let task:string = body.slice(0, body.indexOf(":")).replace("{", "").replace(/"/g, ""),
                            dataString:string = (body.charAt(0) === "{")
                                ? body.slice(body.indexOf(":") + 1, body.length - 1)
                                : body.slice(body.indexOf(":") + 1);
                        if (task === "fs") {
                            const data:localService = JSON.parse(dataString);
                            if (data.agent === "self") {
                                if (data.action === "fs-read" || data.action === "fs-details") {
                                    const callback = function node_apps_server_create_end_putCallback(result:directoryList):void {
                                            count = count + 1;
                                            output.push(result);
                                            if (count === pathLength) {
                                                response.writeHead(200, {"Content-Type": "application/json"});
                                                response.write(JSON.stringify(output));
                                                response.end();
                                            }
                                        },
                                        windowsRoot = function node_apps_server_create_end_windowsRoot():void {
                                            //cspell:disable
                                            vars.node.child("wmic logicaldisk get name", function node_apps_server_create_windowsRoot(erw:Error, stdout:string, stderr:string):void {
                                            //cspell:enable
                                                if (erw !== null) {
                                                    library.error([erw.toString()]);
                                                } else if (stderr !== "") {
                                                    library.error([stderr]);
                                                }
                                                const drives:string[] = stdout.replace(/Name\s+/, "").replace(/\s+$/, "").replace(/\s+/g, " ").split(" "),
                                                    length:number = drives.length,
                                                    date:Date = new Date(),
                                                    driveList = function node_apps_server_create_windowsRoot_driveList(result:directoryList):void {
                                                        let b:number = 1;
                                                        const resultLength:number = result.length,
                                                            masterIndex:number = masterList.length;
                                                        do {
                                                            result[b][2] = masterIndex; 
                                                            b = b + 1;
                                                        } while (b < resultLength);
                                                        a = a + 1;
                                                        masterList = masterList.concat(result);
                                                        if (a === length) {
                                                            callback(masterList);
                                                        }
                                                    };
                                                let masterList:directoryList = [["\\", "directory", 0, length, {
                                                        dev: 0,
                                                        ino: 0,
                                                        mode: 0,
                                                        nlink: 0,
                                                        uid: 0,
                                                        gid: 0,
                                                        rdev: 0,
                                                        size: 0,
                                                        blksize: 0,
                                                        blocks: 0,
                                                        atimeMs: 0,
                                                        mtimeMs: 0,
                                                        ctimeMs: 0,
                                                        birthtimeMs: 0,
                                                        atime: date,
                                                        mtime: date,
                                                        ctime: date,
                                                        birthtime: date,
                                                        isBlockDevice: function node_apps_server_create_windowsRoot_isBlockDevice() {},
                                                        isCharacterDevice: function node_apps_server_create_windowsRoot_isCharacterDevice() {},
                                                        isDirectory: function node_apps_server_create_windowsRoot_isDirectory() {},
                                                        isFIFO: function node_apps_server_create_windowsRoot_isFIFO() {},
                                                        isFile: function node_apps_server_create_windowsRoot_isFile() {},
                                                        isSocket: function node_apps_server_create_windowsRoot_isSocket() {},
                                                        isSymbolicLink: function node_apps_server_create_windowsRoot_isSymbolicLink() {}
                                                    }]],
                                                    a:number = 0;
                                                drives.forEach(function node_apps_server_create_windowsRoot_each(value:string) {
                                                    library.directory({
                                                        callback: driveList,
                                                        depth: 1,
                                                        exclusions: [],
                                                        path: `${value}\\`,
                                                        recursive: true,
                                                        symbolic: true
                                                    });
                                                });
                                            });
                                        },
                                        pathList:string[] = data.location,
                                        pathLength:number = pathList.length,
                                        output:directoryList[] = [];
                                    let count:number = 0;
                                    if (pathList[0] === "defaultLocation") {
                                        pathList[0] = vars.projectPath;
                                    }
                                    pathList.forEach(function node_apps_server_create_end_pathEach(value:string):void {
                                        if (value === "\\" || value === "\\\\") {
                                            windowsRoot();
                                        } else {
                                            vars.node.fs.stat(value, function node_apps_server_create_end_putStat(erp:nodeError):void {
                                                if (erp !== null) {
                                                    if (erp.code === "ENOENT") {
                                                        response.writeHead(404, {"Content-Type": "application/json"});
                                                        response.write("missing");
                                                        response.end();
                                                    }
                                                    library.error([erp.toString()]);
                                                    count = count + 1;
                                                    return;
                                                }

                                                // please note
                                                // watch must be "no" on all operations but fs-read
                                                // fs-read must only contain a single path
                                                if (data.watch !== "no" && data.watch !== vars.projectPath) {
                                                    if (data.watch !== "yes" && watches[data.watch] !== undefined) {
                                                        watches[data.watch].close();
                                                        delete watches[data.watch];
                                                    }
                                                    if (watches[value] === undefined) {
                                                        watches[value] = vars.node.fs.watch(value, {
                                                            recursive: false
                                                        }, function node_apps_server_watch():void {
                                                            if (value !== vars.projectPath && value + vars.sep !== vars.projectPath) {
                                                                vars.ws.broadcast(`fsUpdate:${value}`);
                                                            }
                                                        });
                                                    }
                                                }
                                                library.directory({
                                                    callback: callback,
                                                    depth: data.depth,
                                                    exclusions: [],
                                                    path: value,
                                                    recursive: true,
                                                    symbolic: true
                                                });
                                            });
                                        }
                                    });
                                } else if (data.action === "fs-close") {
                                    if (watches[data.location[0]] !== undefined) {
                                        watches[data.location[0]].close();
                                        delete watches[data.location[0]];
                                    }
                                    response.writeHead(200, {"Content-Type": "text/plain"});
                                    response.write(`Watcher ${data.location[0]} closed.`);
                                    response.end();
                                } else if (data.action === "fs-copy" || data.action === "fs-cut") {
                                    let count:number = 0,
                                        length:number = data.location.length;
                                    data.location.forEach(function node_apps_server_create_end_copyEach(value:string):void {
                                        const callback = (data.action === "fs-copy")
                                            ? function node_apps_server_create_end_copyEach_copy():void {
                                                count = count + 1;
                                                if (count === length) {
                                                    response.writeHead(200, {"Content-Type": "text/plain"});
                                                    response.write(`Path(s) ${data.location.join(", ")} copied.`);
                                                    response.end();
                                                }
                                            }
                                            : function node_apps_server_create_end_copyEach_cut():void {
                                                library.remove(value, function node_apps_server_create_end_copyEach_cut_callback():void {
                                                    count = count + 1;
                                                    if (count === length) {
                                                        response.writeHead(200, {"Content-Type": "text/plain"});
                                                        response.write(`Path(s) ${data.location.join(", ")} cut and pasted.`);
                                                        response.end();
                                                    }
                                                });
                                            }
                                        library.copy({
                                            callback: callback,
                                            destination:data.name,
                                            exclusions:[""],
                                            target:value
                                        });
                                    });
                                } else if (data.action === "fs-destroy") {
                                    let count:number = 0;
                                    data.location.forEach(function node_apps_server_create_end_destroyEach(value:string):void {
                                        if (watches[value] !== undefined) {
                                            watches[value].close();
                                            delete watches[value];
                                        }
                                        library.remove(value, function node_apps_server_create_end_destroy():void {
                                            count = count + 1;
                                            if (count === data.location.length) {
                                                response.writeHead(200, {"Content-Type": "text/plain"});
                                                response.write(`Path(s) ${data.location.join(", ")} destroyed.`);
                                                response.end();
                                            }
                                        });
                                    });
                                } else if (data.action === "fs-rename") {
                                    const newPath:string[] = data.location[0].split(vars.sep);
                                    newPath.pop();
                                    newPath.push(data.name);
                                    vars.node.fs.rename(data.location[0], newPath.join(vars.sep), function node_apps_server_create_end_rename(erRename:Error):void {
                                        if (erRename === null) {
                                            response.writeHead(200, {"Content-Type": "text/plain"});
                                            response.write(`Path ${data.location[0]} renamed to ${newPath.join(vars.sep)}.`);
                                            response.end();
                                        } else {
                                            library.error([erRename.toString()]);
                                            library.log([erRename.toString()]);
                                            response.writeHead(500, {"Content-Type": "text/plain"});
                                            response.write(erRename.toString());
                                            response.end();
                                        }
                                    });
                                } else if (data.action === "fs-hash" || data.action === "fs-base64") {
                                    const task:string = data.action.replace("fs-", "");
                                    library[task](data.location[0], function node_apps_server_create_end_dataString(dataString:string):void {
                                        response.writeHead(200, {"Content-Type": "text/plain"});
                                        response.write(dataString);
                                        response.end();
                                    });
                                } else if (data.action === "fs-new") {
                                    const slash:string = (data.location[0].indexOf("/") < 0 || (data.location[0].indexOf("\\") < data.location[0].indexOf("/") && data.location[0].indexOf("\\") > -1 && data.location[0].indexOf("/") > -1))
                                            ? "\\"
                                            : "/",
                                        dirs = data.location[0].split(slash);
                                    dirs.pop();
                                    if (data.name === "directory") {
                                        library.makeDir(data.location[0], function node_apps_server_create_end_newDirectory():void {
                                            response.writeHead(200, {"Content-Type": "text/plain"});
                                            response.write(`${data.location[0]} created.`);
                                            vars.ws.broadcast(`fsUpdate:${dirs.join(slash)}`);
                                            response.end();
                                        });
                                    } else if (data.name === "file") {
                                        vars.node.fs.writeFile(data.location[0], "", "utf8", function node_apps_Server_create_end_newFile(erNewFile:Error):void {
                                            if (erNewFile === null) {
                                                response.writeHead(200, {"Content-Type": "text/plain"});
                                                response.write(`${data.location[0]} created.`);
                                                vars.ws.broadcast(`fsUpdate:${dirs.join(slash)}`);
                                                response.end();
                                            } else {
                                                library.error([erNewFile.toString()]);
                                                library.log([erNewFile.toString()]);
                                                response.writeHead(500, {"Content-Type": "text/plain"});
                                                response.write(erNewFile.toString());
                                                response.end();
                                            }
                                        });
                                    }
                                }
                            }
                        } else if (task === "settings" || task === "messages") {
                            const fileName:string = `${vars.projectPath}storage${vars.sep + task}-${Math.random()}.json`;
                            vars.node.fs.writeFile(fileName, dataString, "utf8", function node_apps_server_create_writeStorage(erSettings:Error):void {
                                if (erSettings !== null) {
                                    library.error([erSettings.toString()]);
                                    library.log([erSettings.toString()]);
                                    response.writeHead(200, {"Content-Type": "text/plain"});
                                    response.write(erSettings.toString());
                                    response.end();
                                    return;
                                }
                                vars.node.fs.rename(fileName, `${vars.projectPath}storage${vars.sep + task}.json`, function node_apps_server_create_writeStorage_rename(erName:Error) {
                                    if (erName !== null) {
                                        library.error([erName.toString()]);
                                        library.log([erName.toString()]);
                                        vars.node.fs.unlink(fileName, function node_apps_server_create_writeStorage_rename_unlink(erUnlink:Error) {
                                            if (erUnlink !== null) {
                                                library.error([erUnlink.toString()]);
                                            }
                                        });
                                        response.writeHead(500, {"Content-Type": "text/plain"});
                                        response.write(erName.toString());
                                        response.end();
                                        return;
                                    }
                                    response.writeHead(200, {"Content-Type": "text/plain"});
                                    response.write(`${task} written.`);
                                    response.end();
                                });
                            });
                        } else if (task === "invite") {
                            const data:invite = JSON.parse(dataString);
                            if (socketList[data.ip] === undefined) {
                                socketList[data.ip] = new vars.node.net.Socket();
                                socketList[data.ip].connect(data.port, data.ip, function node_apps_server_create_end_inviteConnect():void {
                                    socketList[data.ip].write(`invite:{"ip":"${addresses[1][1]}","family":"${addresses[1][2]}","message":"${data.message}","modal":"${data.modal}","name":"${data.name}","port":"${serverPort}","shares":${JSON.stringify(data.shares)},"status":"${data.status}"}`);
                                });
                                socketList[data.ip].on("data", function node_apps_server_create_end_inviteData(socketData:string):void {
                                    library.log([socketData]);
                                });
                                socketList[data.ip].on("error", function node_app_server_create_end_inviteError(errorMessage:nodeError):void {
                                    library.log([errorMessage.toString()]);
                                    library.error([errorMessage.toString()]);
                                    vars.ws.broadcast(`invite-error:{"error":"${errorMessage.toString()}","modal":"${data.modal}"}`);
                                    if (socketList[data.ip] !== undefined) {
                                        socketList[data.ip].destroy();
                                        delete socketList[data.ip];
                                    }
                                });
                            } else {
                                if (socketList[data.ip].connecting === true) {
                                    const failMessage:string = (socketList[data.ip].localAddress === "0.0.0.0")
                                        ? `Socket to ${vars.text.cyan + vars.text.bold + data.ip + vars.text.none} appears to be ${vars.text.angry}broken${vars.text.none}.`
                                        : "Write to a socket not connected.";
                                    library.log([
                                        failMessage,
                                        `  ${vars.text.angry}*${vars.text.none} Specified Address: ${data.ip}`,
                                        `  ${vars.text.angry}*${vars.text.none} Specified Port   : ${data.port}`,
                                        `  ${vars.text.angry}*${vars.text.none} Local Address    : ${vars.text.angry + socketList[data.ip].localAddress + vars.text.none}`,
                                        `  ${vars.text.angry}*${vars.text.none} Local Port       : ${socketList[data.ip].localPort}`,
                                        `  ${vars.text.angry}*${vars.text.none} Remote Address   : ${socketList[data.ip].remoteAddress}`,
                                        `  ${vars.text.angry}*${vars.text.none} Remote Port      : ${socketList[data.ip].remotePort}`,
                                        ""
                                    ]);
                                }
                                socketList[data.ip].write(`invite:{"ip":"${addresses[1][1]}","family":"${addresses[1][2]}","message":"${data.message}","modal":"${data.modal}","name":"${data.name}","port":"${serverPort}","shares":${JSON.stringify(data.shares)},"status":"${data.status}"}`);
                            }
                        } else if (task === "heartbeat") {
                            const data = JSON.parse(dataString);
                            if (socketList[data.ip] === undefined) {
                                socketList[data.ip] = new vars.node.net.Socket();
                                socketList[data.ip].connect(data.port, data.ip, function node_apps_server_create_end_heartbeatConnect():void {
                                    socketList[data.ip].write(`heartbeat:{"ip":"${addresses[1][1]}","family":"${addresses[1][2]}","port":${serverPort},"status":"${data.status}","user":"${data.user}"}`);
                                });
                                socketList[data.ip].on("data", function node_apps_server_create_end_heartbeatData(socketData:string):void {
                                    library.log([socketData]);
                                });
                                socketList[data.ip].on("error", function node_app_server_create_end_heartbeatError(errorMessage:nodeError):void {
                                    library.log([`Socket error on ${data.ip}.`, errorMessage.toString()]);
                                    library.error([errorMessage.toString()]);
                                    if (socketList[data.ip] !== undefined && socketList[data.ip].destroyed === true) {
                                        delete socketList[data.ip];
                                    }
                                    if (errorMessage.code === "ECONNRESET") {
                                        if (data.ip.indexOf(":") > 0) {
                                            vars.ws.broadcast(`heartbeat:{"ip":"${addresses[1][1]}","family":"${addresses[1][2]}","port":${serverPort},"status":"offline","user":"@[${data.ip}]:${data.port}"}`);
                                        } else {
                                            vars.ws.broadcast(`heartbeat:{"ip":"${addresses[1][1]}","family":"${addresses[1][2]}","port":${serverPort},"status":"offline","user":"@${data.ip}:${data.port}"}`);
                                        }
                                    } else {
                                        vars.ws.broadcast(`heartbeat:{"ip":"${addresses[1][1]}","family":"${addresses[1][2]}","port":${serverPort},"status":"offline","user":"${data.user}"}`);
                                    }
                                });
                            } else {
                                if (socketList[data.ip].connecting === true) {
                                    const failMessage:string = (socketList[data.ip].localAddress === "0.0.0.0")
                                        ? `Socket to ${vars.text.cyan + vars.text.bold + data.ip + vars.text.none} appears to be ${vars.text.angry}broken${vars.text.none}.`
                                        : "Write to a socket not connected.";
                                    library.log([
                                        failMessage,
                                        `  ${vars.text.angry}*${vars.text.none} Specified Address: ${data.ip}`,
                                        `  ${vars.text.angry}*${vars.text.none} Specified Port   : ${data.port}`,
                                        `  ${vars.text.angry}*${vars.text.none} Local Address    : ${vars.text.angry + socketList[data.ip].localAddress + vars.text.none}`,
                                        `  ${vars.text.angry}*${vars.text.none} Local Port       : ${socketList[data.ip].localPort}`,
                                        `  ${vars.text.angry}*${vars.text.none} Remote Address   : ${socketList[data.ip].remoteAddress}`,
                                        `  ${vars.text.angry}*${vars.text.none} Remote Port      : ${socketList[data.ip].remotePort}`,
                                        ""
                                    ]);
                                }
                                socketList[data.ip].write(`heartbeat:{"ip":"${addresses[1][1]}","family":"${addresses[1][2]}","port":${serverPort},"status":"${data.status}","user":"${data.user}"}`);
                            }
                        }
                    });
                }
            }),
            serverError = function node_apps_server_serverError(error:nodeError, port:number):void {
                if (error.code === "EADDRINUSE") {
                    if (error.port === port + 1) {
                        library.error([`Web socket channel port, ${vars.text.cyan + port + vars.text.none}, is in use!  The web socket channel is 1 higher than the port designated for the HTTP server.`]);
                    } else {
                        library.error([`Specified port, ${vars.text.cyan + port + vars.text.none}, is in use!`]);
                    }
                } else {
                    library.error([`${error.Error}`]);
                }
                return
            },
            ignore   = function node_apps_server_ignore(input:string|null):boolean {
                if (input.indexOf(".git") === 0) {
                    return true;
                }
                if (input.indexOf("node_modules") === 0) {
                    return true;
                }
                if (input.indexOf("js") === 0) {
                    return true;
                }
                return false;
            },
            start = function node_apps_server_start() {
                if (process.cwd() !== vars.projectPath) {
                    process.chdir(vars.projectPath);
                }
                watches[vars.projectPath] = vars.node.fs.watch(vars.projectPath, {
                    recursive: true
                }, function node_apps_server_watch(type:"rename"|"change", filename:string|null):void {
                    if (filename === null || ignore(filename) === true || filename.indexOf("storage") === 0) {
                        return;
                    }
                    const extension:string = (function node_apps_server_watch_extension():string {
                            const list = filename.split(".");
                            return list[list.length - 1];
                        }()),
                        time = function node_apps_server_watch_time(message:string):number {
                            const date:Date = new Date(),
                                dateArray:string[] = [];
                            let hours:string = String(date.getHours()),
                                minutes:string = String(date.getMinutes()),
                                seconds:string = String(date.getSeconds()),
                                milliSeconds:string = String(date.getMilliseconds());
                            if (hours.length === 1) {
                                hours = `0${hours}`;
                            }
                            if (minutes.length === 1) {
                                minutes = `0${minutes}`;
                            }
                            if (seconds.length === 1) {
                                seconds = `0${seconds}`;
                            }
                            if (milliSeconds.length < 3) {
                                do {
                                    milliSeconds = `0${milliSeconds}`;
                                } while (milliSeconds.length < 3);
                            }
                            dateArray.push(hours);
                            dateArray.push(minutes);
                            dateArray.push(seconds);
                            dateArray.push(milliSeconds);
                            library.log([`[${vars.text.cyan + dateArray.join(":") + vars.text.none}] ${message}`]);
                            timeStore = date.valueOf();
                            return timeStore;
                        };
                    if (extension === "ts" && timeStore < Date.now() - 1000) {
                        let start:number,
                            compile:number,
                            duration = function node_apps_server_watch_duration(length:number):void {
                                let hours:number = 0,
                                    minutes:number = 0,
                                    seconds:number = 0,
                                    list:string[] = [];
                                if (length > 3600000) {
                                    hours = Math.floor(length / 3600000);
                                    length = length - (hours * 3600000);
                                }
                                list.push(hours.toString());
                                if (list[0].length < 2) {
                                    list[0] = `0${list[0]}`;
                                }
                                if (length > 60000) {
                                    minutes = Math.floor(length / 60000);
                                    length = length - (minutes * 60000);
                                }
                                list.push(minutes.toString());
                                if (list[1].length < 2) {
                                    list[1] = `0${list[1]}`;
                                }
                                if (length > 1000) {
                                    seconds = Math.floor(length / 1000);
                                    length = length - (seconds * 1000);
                                }
                                list.push(seconds.toString());
                                if (list[2].length < 2) {
                                    list[2] = `0${list[2]}`;
                                }
                                list.push(length.toString());
                                if (list[3].length < 3) {
                                    do {
                                        list[3] = `0${list[3]}`;
                                    } while (list[3].length < 3);
                                }
                                library.log([`[${vars.text.bold + vars.text.purple + list.join(":") + vars.text.none}] Total compile time.\u0007`]);
                            };
                        library.log([""]);
                        start = time(`Compiling for ${vars.text.green + filename + vars.text.none}`);
                        vars.node.child(`${vars.version.command} build incremental`, {
                            cwd: vars.projectPath
                        }, function node_apps_server_watch_child(err:Error, stdout:string, stderr:string):void {
                            if (err !== null) {
                                library.error([err.toString()]);
                                return;
                            }
                            if (stderr !== "") {
                                library.error([stderr]);
                                return;
                            }
                            compile = time("TypeScript Compiled") - start;
                            duration(compile);
                            vars.ws.broadcast("reload");
                            return;
                        });
                    } else if (extension === "css" || extension === "xhtml") {
                        vars.ws.broadcast("reload");
                    } else {
                        vars.ws.broadcast(`fsUpdate:${vars.projectPath}`);
                    }
                });
                server.on("error", serverError);
                server.listen(port);
                webPort = server.address().port;
                wsPort = (port === 0)
                    ? 0
                    : webPort + 1;

                vars.ws = new WebSocket.server({port: wsPort});

                responder = vars.node.net.createServer(function node_apps_server_start_listener(response:Socket):void {
                    response.on("data", function node_apps_server_start_listener_data(data:Buffer):void {
                        const message:string = data.toString();
                        if (message.indexOf("invite:") === 0 && message !== "invite:") {
                            vars.ws.broadcast(message);
                        } else if (message.indexOf("heartbeat:") === 0 && message !== "heartbeat:") {
                            vars.ws.broadcast(message);
                        }
                    });
                    response.on("end", function node_apps_server_start_listener_end():void {
                        library.log(["Socket server disconnected."]);
                    });
                    response.on("error", function node_apps_server_start_listener_error(data:Buffer):void {
                        const error:string = data.toString();
                        library.log(["Socket server."]);
                        if (error.indexOf("ECONNRESET") > 0) {
                            library.log(["Connection reset.  That is a fancy way of saying the remote took a dump. :("]);
                        } else {
                            library.log(["Socket server error"]);
                        }
                        library.log([error]);
                    });
                });
                serverPort = (port === 0)
                    ? 0
                    : wsPort + 1;
                responder.listen(serverPort, addresses[1][1], function node_apps_server_start_listen():void {
                    serverPort = responder.address().port;

                    vars.ws.broadcast = function node_apps_server_start_broadcast(data:string):void {
                        vars.ws.clients.forEach(function node_apps_server_start_broadcast_clients(client):void {
                            if (client.readyState === WebSocket.OPEN) {
                                client.send(data);
                            }
                        });
                    };
                    wsPort = vars.ws.address().port;

                    library.log([
                        "",
                        `${vars.text.cyan}HTTP server${vars.text.none} on port: ${vars.text.bold + vars.text.green + webPort + vars.text.none}`,
                        `${vars.text.cyan}Web Sockets${vars.text.none} on port: ${vars.text.bold + vars.text.green + wsPort + vars.text.none}`,
                        `${vars.text.cyan}TCP Service${vars.text.none} on port: ${vars.text.bold + vars.text.green + serverPort + vars.text.none}`,
                        "Local IP addresses are:"
                    ]);
                    {
                        let a:number = 0;
                        addresses.forEach(function node_apps_server_localAddresses(value:[string, string, string]):void {
                            a = value[0].length;
                            if (a < interfaceLongest) {
                                do {
                                    value[0] = value[0] + " ";
                                    a = a + 1;
                                } while (a < interfaceLongest);
                            }
                            if (value[0].charAt(0) === " ") {
                                library.log([`     ${value[0]}: ${value[1]}`]);
                            } else {
                                library.log([`   ${vars.text.angry}*${vars.text.none} ${value[0]}: ${value[1]}`]);
                            }
                        });
                        library.log([
                            `Address for web browser: ${vars.text.bold + vars.text.green}http://localhost:${webPort + vars.text.none}`,
                            `or                     : ${vars.text.bold + vars.text.green}http://[${addresses[0][1]}]:${webPort + vars.text.none}`
                        ]);
                        if (addresses[1][0].charAt(0) === " ") {
                            library.log([
                                `or                     : ${vars.text.bold + vars.text.green}http://${addresses[1][1]}:${webPort + vars.text.none}`,
                                "",
                                `Address for net service: ${vars.text.bold + vars.text.green + addresses[1][1]}:${serverPort + vars.text.none}`
                            ]);
                        } else {
                            library.log(["", `Address for net service: ${vars.text.bold + vars.text.green}[${addresses[0][1]}]:${serverPort + vars.text.none}`]);
                        }
                        library.log([""]);
                    }
                });
            };
        if (process.argv[0] !== undefined && isNaN(Number(process.argv[0])) === true) {
            library.error([`Specified port, ${vars.text.angry + process.argv[0] + vars.text.none}, is not a number.`]);
            return;
        }

        start();

        // open a browser from the command line
        if (browser === true) {
            vars.node.child(`${keyword} http://localhost:${port}/`, {cwd: vars.cwd}, function node_apps_server_create_stat_browser(errs:nodeError, stdout:string, stdError:string|Buffer):void {
                if (errs !== null) {
                    library.error([errs.toString()]);
                    return;
                }
                if (stdError !== "") {
                    library.error([stdError.toString()]);
                    return;
                }
                library.log(["", "Launching default web browser..."]);
            });
        }
    };

export default server;