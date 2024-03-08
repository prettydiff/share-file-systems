/* lib/terminal/server/transmission/http_get - A library to process HTTP GET responses. */

import common from "../../../common/common.js";
import error from "../../utilities/error.js";
import log from "../../utilities/log.js";
import node from "../../utilities/node.js";
import readStorage from "../../utilities/readStorage.js";
import transmit_ws from "./transmit_ws.js";
import vars from "../../utilities/vars.js";

const http_get = function terminal_server_transmission_httpGET(url:string, socket:websocket_client):void {
    const quest:number = url.indexOf("?"),
        uri:string = (quest > 0)
            ? url.slice(0, quest)
            : url,
        localPath:string = (uri === "/")
            ? "/"
            : vars.path.project + uri.slice(1).replace(/\/$/, "").replace(/\//g, vars.path.sep),
        respond = function terminal_server_transmission_httpGET_respond(payload:Buffer|string, type:[mimeType, boolean], status:string):void {
            const size:number = Buffer.byteLength(payload),
                headers:string = (function terminal_server_transmission_httpGET_respond_headers():string {
                    const protocol:string = (vars.settings.secure === true)
                            ? "wss"
                            : "ws",
                        csp:string = `default-src 'self'; base-uri 'self'; font-src 'self' data:; form-action 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; connect-src 'self' ${protocol}://localhost/; frame-ancestors 'none'; media-src 'none'; object-src 'none'; worker-src 'none'; manifest-src 'none'`,
                        output:string[] = [
                            `HTTP/1.1 ${status}`,
                            `content-type: ${type[0]}`,
                            "vary: Accept-Encoding,User-Agent",
                            `content-security-policy: ${csp}`,
                            "alt-svc: clear",
                            "cache-control: no-store",
                            "strict-transport-security: max-age=63072000",
                            "referrer-policy: no-referrer",
                            "x-content-type-options: nosniff",
                            `content-length: ${size.toString()}`,
                            "",
                            ""
                        ];
                    return output.join("\r\n");
                }());
            if (type[1] === true) {
                const  headerSize:number = Buffer.byteLength(headers),
                    buf:Buffer = Buffer.alloc(headerSize + size);
                buf.write(headers, 0, "utf8");
                buf.fill(payload, headerSize, buf.length, "utf8");
                socket.write(buf);
            } else {
                socket.write(`${headers + payload.toString()}\r\n\r\n`);
            }
            socket.once("drain", function terminal_server_transmission_httpGET_respond_drain():void {
                socket.destroy();
            });
        };
    if (localPath === "/") {
        const appliedData = function terminal_server_transmission_httpGET_appliedData(settingsData:state_storage):void {
            settingsData.queue = null;
            if (settingsData.identity.hashDevice === "") {
                settingsData.identity.hashDevice = vars.identity.hashDevice;
            } else {
                common.agents({
                    countBy: "agent",
                    perAgent: function terminal_server_transmission_httpGET_appliedData_perAgent(agentNames:agentNames):void {
                        if (agentNames.agentType === "user" || (agentNames.agentType === "device" && agentNames.agent !== vars.identity.hashDevice)) {
                            settingsData.agents[agentNames.agentType][agentNames.agent].status = vars.agents[agentNames.agentType][agentNames.agent].status;
                        }
                    },
                    source: vars
                });
            }
            const state:stateData = {
                    name: vars.environment.name,
                    network: {
                        addresses: vars.network.addresses,
                        default: vars.network.port_default,
                        port: vars.network.port
                    },
                    settings: settingsData,
                    "socket-map": transmit_ws.socketMap,
                    test: (vars.test.browser !== null && url.indexOf("?test_browser") > 0)
                        ? vars.test.browser
                        : null
                },
                storageString:string = `<input type="hidden" value='${JSON.stringify(state).replace(/'/g, "&#39;")}'/>`,
                login:string = (settingsData.identity.nameDevice === "")
                    ? " login"
                    : "",
                pageApplication:string = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <title>${vars.environment.name}</title>
    <meta content="text/html" http-equiv="Content-Type"/>
    <meta content="width=device-width, initial-scale=1" name="viewport"/>
    <meta content="noindex, nofollow" name="robots"/>
    <meta content="${vars.environment.name}" name="DC.title"/>
    <meta content="#fff" name="theme-color"/>
    <meta content="" name="description"/>
    <meta content="Global" name="distribution"/>
    <meta content="en" http-equiv="Content-Language"/>
    <meta content="blendTrans(Duration=0)" http-equiv="Page-Enter"/>
    <meta content="blendTrans(Duration=0)" http-equiv="Page-Exit"/>
    <meta content="text/css" http-equiv="content-style-type"/>
    <meta content="application/javascript" http-equiv="content-script-type"/>
    <meta content="#bbbbff" name="msapplication-TileColor"/>
    <link href="lib/css/bundle.css" media="all" rel="stylesheet" type="text/css"/>
    <link rel="icon" type="image/png" href="data:image/png;base64,iVBORw0KGgo="/>
</head>
<body class="${vars.settings.ui.color + login}">
    ${storageString}
    <div id="spaces">
        <div id="login">
            <h1>${vars.environment.name} <span class="application-version">version ${vars.environment.version}</span></h1>
            <p><label for="login-user">Provide a Username</label> <input type="text" id="login-user"/></p>
            <p><label for="login-device">Provide a Name for this Computer/Device</label> <input type="text" id="login-device"/></p>
            <p><button type="button">✓ Confirm</button></p>
        </div>
        <div id="title-bar">
            <button type="button" id="menuToggle" title="Application Menu">&#9776;<span>Application Menu</span></button>
            <button type="button" id="fullscreen" title="Toggle Fullscreen">&#9974;<span>Toggle Fullscreen</span></button>
            <h1>${vars.environment.name} <span class="application-version">version ${vars.environment.version}</span></h1>
            <p>A tool for interactive collaboration.</p>
        </div>
        <ul id="menu"></ul>
        <div id="content-area">
            <div id="agentList">
                <p class="sockets"><button type="button">🖧 Open Sockets</button></p>
                <p class="all-shares"><button type="button">⌘ All Shares</button></p>
                <div id="device"><h2>Device List</h2><ul><li><button type="button" class="device-all-shares">🖳 All Device Shares</button></li></ul><span></span></div>
                <div id="user"><h2>User List</h2><ul><li><button type="button" class="user-all-shares">👤 All User Shares</button></li></ul><span></span></div>
            </div>
            <div id="tray"><button type="button" id="minimize-all" title="Minimize all modals">⇊ <span>Minimize all modals</span></button><ul></ul></div>
            <p id="message-update" role="status" aria-live="polite"></p>
        </div>
    </div>
    <script type="module" src="js/lib/browser/bundle.js"></script>
</body>
</html>`;
            if (vars.test.browser !== null) {
                if (vars.test.browser.index > 0) {
                    vars.test.browser.action = "nothing";
                } else {
                    vars.test.browser.action = "reset";
                }
                vars.test.browser.test = null;
            }
            respond(pageApplication, ["text/html", false], "200 OK");
        };
        readStorage(false, appliedData);
    } else {
        node.fs.stat(localPath, function terminal_server_transmission_httpGET_stat(ers:node_error, stat:node_fs_Stats):void {
            const random:number = Math.random();
            if (url.indexOf("favicon.ico") < 0 && url.indexOf("images/apple") < 0) {
                const page:string = [
                    `<!DOCTYPE html><html lang="en"><head><title>${vars.environment.name}</title><meta content="width=device-width, initial-scale=1" name="viewport"/><meta content="index, follow" name="robots"/><meta content="#fff" name="theme-color"/><meta content="en" http-equiv="Content-Language"/><meta content="text/html;charset=UTF-8" http-equiv="Content-Type"/><meta content="blendTrans(Duration=0)" http-equiv="Page-Enter"/><meta content="blendTrans(Duration=0)" http-equiv="Page-Exit"/><meta content="text/css" http-equiv="content-style-type"/><meta content="application/javascript" http-equiv="content-script-type"/><meta content="#bbbbff" name="msapplication-TileColor"/></head><body>`,
                    `<h1>${vars.environment.name}</h1><div class="section">insertMe</div></body></html>`
                ].join("");
                if (ers === null) {
                    if (stat.isDirectory() === true) {
                        node.fs.readdir(localPath, function terminal_server_transmission_httpGET_stat_dir(erd:node_error, list:string[]) {
                            const dirList:string[] = [`<p>directory of ${localPath}</p> <ul>`];
                            if (erd !== null) {
                                error([`Error reading directory of ${localPath}`], erd);
                                return;
                            }
                            list.forEach(function terminal_server_transmission_httpGET_stat_dir_list(value:string) {
                                if ((/\.x?html?$/).test(value.toLowerCase()) === true) {
                                    dirList.push(`<li><a href="${uri.replace(/\/$/, "")}/${value}">${value}</a></li>`);
                                } else {
                                    dirList.push(`<li><a href="${uri.replace(/\/$/, "")}/${value}?${random}">${value}</a></li>`);
                                }
                            });
                            dirList.push("</ul>");
                            respond(page.replace("insertMe", dirList.join("")), ["text/html", false], "200 OK");
                        });
                        return;
                    }
                    if (stat.isFile() === true) {
                        const dataStore:Buffer[] = [],
                            readCallback = function terminal_server_transmission_httpGET_stat_readCallback():void {
                                const type:[mimeType, boolean] = (function terminal():[mimeType, boolean] {
                                    if (localPath.indexOf(".js") === localPath.length - 3) {
                                        return ["application/javascript", false];
                                    }
                                    if (localPath.indexOf(".css") === localPath.length - 4) {
                                        return ["text/css", false];
                                    }
                                    if (localPath.indexOf(".jpg") === localPath.length - 4) {
                                        return ["image/jpeg", true];
                                    }
                                    if (localPath.indexOf(".png") === localPath.length - 4) {
                                        return ["image/png", true];
                                    }
                                    if (localPath.indexOf(".svg") === localPath.length - 4) {
                                        return ["image/svg+xml", false];
                                    }
                                    return ["text/html", false];
                                }());
                                respond(Buffer.concat(dataStore), type, "200 OK");
                            },
                            readStream:node_fs_ReadStream = node.fs.createReadStream(localPath);
                        readStream.on("data", function terminal_server_transmission_httpGET_stat_readData(chunk:Buffer):void {
                            dataStore.push(chunk);
                        });
                        readStream.on("end", readCallback);
                    } else {
                        socket.destroy();
                    }
                } else {
                    if (ers.code === "ENOENT") {
                        log([`${vars.text.angry}404${vars.text.none} for ${uri}`]);
                        respond(page.replace("insertMe", `<p>HTTP 404: ${uri}</p>`), ["text/html", false], "404 NOT FOUND");
                    } else {
                        error([`Error on stat of ${localPath}`], ers);
                    }
                }
            }
        });
    }
};

export default http_get;