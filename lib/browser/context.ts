
/* lib/browser/context - A collection of event handlers associated with the right click context menu. */
import browser from "./browser.js";
import fs from "./fs.js";
import modal from "./modal.js";
import network from "./network.js";
import share from "./share.js";
import util from "./util.js";
import commas from "../common/commas.js";
import prettyBytes from "../common/prettyBytes.js";

const context:module_context = {
    element: null,
    type: ""
};
let clipboard:string = "";

/* Handler for file system artifact copy */
context.copy = function local_context_copy(event:MouseEvent):void {
    const addresses:string[] = [],
        element:Element = (context.element.nodeName.toLowerCase() === "li")
            ? context.element
            : <Element>context.element.parentNode,
        parent:Element = <Element>element.parentNode,
        box:Element = parent.getAncestor("box", "class"),
        contextElement:Element = <Element>event.srcElement || <Element>event.target,
        type:contextType = (context.type !== "")
            ? context.type
            : (contextElement.innerHTML.indexOf("Copy") === 0)
                ? "copy"
                : "cut",
        selected:[string, shareType, string][] = util.selectedAddresses(element, type),
        agency:agency = util.getAgent(box),
        id:string = box.getAttribute("id"),
        clipData:clipboard = {
            agent: agency[0],
            agentType: agency[2],
            data: addresses,
            id: id,
            share: browser.data.modals[id].share,
            type: type
        },
        clipStore:clipboard = (clipboard === "")
            ? null
            : JSON.parse(clipboard);
    if (selected.length < 1) {
        addresses.push(element.getElementsByTagName("label")[0].innerHTML);
    } else {
        selected.forEach(function local_context_destroy_each(value:[string, shareType, string]):void {
            addresses.push(value[0]);
        });
    }
    if (clipStore !== null) {
        if (clipStore.id !== box.getAttribute("id") || type !== "cut") {
            util.selectNone(document.getElementById(clipStore.id));
        }
    }
    clipboard = JSON.stringify(clipData);
    context.element = null;
    context.type = "";
};

/* Handler for base64, edit, and hash operations from the context menu */
context.dataString = function local_context_dataString(event:MouseEvent):void {
    const element:Element = context.element,
        contextElement:Element = <Element>event.srcElement || <Element>event.target,
        type:contextType = (context.type !== "")
            ? context.type
            : (contextElement.innerHTML.indexOf("Base64") === 0)
                ? "Base64"
                : (contextElement.innerHTML.indexOf("File as Text") > 0)
                    ? "Edit"
                    : "Hash",
        addresses:[string, shareType, string][] = util.selectedAddresses(element, "fileEdit"),
        box:Element = element.getAncestor("box", "class"),
        length:number = addresses.length,
        agency:agency = util.getAgent(box),
        id:string = box.getAttribute("id"),
        payloadNetwork:fileService = {
            action: (type === "Edit")
                ? "fs-read"
                : <serviceType>`fs-${type.toLowerCase()}`,
            agent: agency[0],
            agentType: agency[2],
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: id,
            location: [],
            name: "",
            share: browser.data.modals[id].share,
            watch: "no"
        },
        payloadModal:ui_modal = {
            agent: agency[0],
            agentType: agency[2],
            content: null,
            height: 500,
            inputs: (type === "Edit" && agency[1] === false)
                ? ["close", "save"]
                : ["close"],
            left: 0,
            read_only: agency[1],
            single: false,
            title: "",
            top: 0,
            type: "textPad",
            width: 500
        },
        callback = function local_context_dataString_callback(resultString:string):void {
            const data:stringDataList = JSON.parse(resultString),
                length:number = data.length;
            let a:number = 0,
                textArea:HTMLTextAreaElement,
                modalResult:Element,
                body:HTMLElement,
                heading:HTMLElement;
            if (data[0] === undefined) {
                return;
            }
            do {
                textArea = document.createElement("textarea");
                modalResult = document.getElementById(data[a].id),
                body = <HTMLElement>modalResult.getElementsByClassName("body")[0];
                textArea.onblur = modal.textSave;
                heading = modalResult.getElementsByTagName("h2")[0].getElementsByTagName("button")[0];
                if (type === "Base64") {
                    textArea.style.whiteSpace = "normal";
                }
                if (type === "Hash") {
                    textArea.style.minHeight = "5em";
                    body.style.height = "auto";
                }
                browser.data.modals[data[a].id].text_value = data[a].content;
                textArea.value = data[a].content;
                body.innerHTML = "";
                body.appendChild(textArea);
                body.style.overflow = "hidden";
                heading.style.width = `${(body.clientWidth - 50) / 18}em`;
                a = a + 1;
            } while (a < length);
            network.storage("settings");
        };
    let a:number = 0,
        delay:Element,
        modalInstance:Element;
    do {
        if (addresses[a][1] === "file") {
            delay = util.delay();
            payloadModal.content = delay;
            payloadModal.left = event.clientX + (a * 10);
            payloadModal.title = `${type} - ${browser[agency[2]][agency[0]].name} - ${addresses[a][0]}`;
            payloadModal.top = (event.clientY - 60) + (a * 10);
            modalInstance = modal.create(payloadModal);
            payloadNetwork.location.push(`${modalInstance.getAttribute("id")}:${addresses[a][0]}`);
        }
        a = a + 1;
    } while (a < length);
    network.fs(payloadNetwork, callback);
    context.element = null;
    context.type = "";
};

/* Handler for removing file system artifacts via context menu */
context.destroy = function local_context_destroy():void {
    let element:Element = context.element,
        selected:[string, shareType, string][],
        box:Element = element.getAncestor("box", "class"),
        agency:agency = util.getAgent(element),
        id:string = box.getAttribute("id"),
        payload:fileService = {
            action: "fs-destroy",
            agent: agency[0],
            agentType: agency[2],
            copyAgent: "",
            copyType: "device",
            depth: 1,
            id: id,
            location: [],
            name: box.getElementsByClassName("header")[0].getElementsByTagName("input")[0].value,
            share: browser.data.modals[id].share,
            watch: "no"
        },
        callback = function local_context_destroy_callback(responseText:string):void {
            const list:[Element, number, string] = fs.list(payload.name, JSON.parse(responseText)),
                body:Element = box.getElementsByClassName("body")[0],
                count:number = payload.location.length,
                plural:string = (count === 1)
                    ? ""
                    : "s";
            if (box.parentNode !== null) {
                body.innerHTML = "";
                body.appendChild(list[0]);
                box.getElementsByClassName("status-bar")[0].getElementsByTagName("p")[0].innerHTML = `${payload.location.length} item${plural} deleted.`;
            }
        }; 
    if (element.nodeName.toLowerCase() !== "li") {
        element = <HTMLElement>element.parentNode;
    }
    selected = util.selectedAddresses(element, "destroy");
    if (selected.length < 1) {
        payload.location.push(element.getElementsByTagName("label")[0].innerHTML);
    } else {
        selected.forEach(function local_context_destroy_each(value:[string, shareType, string]):void {
            payload.location.push(value[0]);
        });
    }
    network.fs(payload, callback);
    context.element = null;
};

/* Handler for details action of context menu */
context.details = function local_context_details(event:MouseEvent):void {
    const element:Element = context.element,
        div:Element = util.delay(),
        agency:agency = util.getAgent(element),
        addresses:[string, shareType, string][] = util.selectedAddresses(element, "details"),
        payloadModal:ui_modal = {
            agent: agency[0],
            agentType: agency[2],
            content: div,
            height: 600,
            inputs: ["close"],
            left: event.clientX,
            read_only: agency[1],
            single: true,
            title: `Details - ${agency[2].slice(0, 1).toUpperCase() + agency[2].slice(1)}, ${browser[agency[2]][agency[0]].name} - ${addresses.length} items`,
            top: event.clientY - 60,
            type: "details",
            width: 500
        },
        modalInstance:Element = modal.create(payloadModal),
        id:string = modalInstance.getAttribute("id"),
        payloadNetwork:fileService = {
            action: "fs-details",
            agent: agency[0],
            agentType: agency[2],
            copyAgent: "",
            copyType: "device",
            depth: 0,
            id: id,
            location: (function local_context_details_addressList():string[] {
                const output:string[] = [],
                    length:number = addresses.length;
                let a:number = 0;
                if (context.element.nodeName.toLowerCase() === "ul") {
                    const box:Element = context.element.getAncestor("box", "class"),
                        input:HTMLInputElement = box.getElementsByTagName("input")[0];
                    return [input.value];
                }
                do {
                    output.push(addresses[a][0]);
                    a = a + 1;
                } while (a < length);
                return output;
            }()),
            name: "",
            share: browser.data.modals[id].share,
            watch: "no"
        },
        callback = function local_context_details_callback(response:string):void {
            const payload:fsRemote = JSON.parse(response),
                list:directoryList = (payload.dirs === "missing" || payload.dirs === "noShare" || payload.dirs === "readOnly")
                    ? []
                    : payload.dirs,
                fileList:directoryList = [],
                body:Element = document.getElementById(payload.id).getElementsByClassName("body")[0],
                length:number = list.length,
                details:fsDetails = {
                    size: 0,
                    files: 0,
                    directories: 0,
                    links: 0
                },
                output:Element = document.createElement("div");
            let a:number = 0,
                tr:Element,
                td:HTMLElement,
                heading:Element = document.createElement("h3"),
                table:HTMLElement = document.createElement("table"),
                tbody:Element = document.createElement("tbody"),
                mTime:Date,
                aTime:Date,
                cTime:Date;
            if (length > 0) {
                do {
                    if (list[a][1] === "directory") {
                        details.directories = details.directories + 1;
                    } else if (list[a][1] === "link") {
                        details.links = details.links + 1;
                    } else {
                        fileList.push(list[a]);
                        details.files = details.files + 1;
                        details.size = details.size + list[a][5].size;
                    }
                    a = a + 1;
                } while (a < length);
            }
    
            output.setAttribute("class", "fileDetailOutput");
            heading.innerHTML = `File System Details - ${commas(list.length)} items`;
            output.appendChild(heading);
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Location";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = payload.dirs[0][0];
            tr.appendChild(td);
            tbody.appendChild(tr);
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Total Size";
            tr.appendChild(td);
            td = document.createElement("td");
            if (details.size > 1024) {
                td.innerHTML = `${commas(details.size)} bytes (${prettyBytes(details.size)})`;
            } else {
                td.innerHTML = `${commas(details.size)} bytes`;
            }
            tr.appendChild(td);
            tbody.appendChild(tr);
            table.appendChild(tbody);
            output.appendChild(table);
    
            heading = document.createElement("h3");
            heading.innerHTML = "Contains";
            output.appendChild(heading);
            td = document.createElement("p");
            td.innerHTML = "Does not count read protected assets.";
            output.appendChild(td);
            table = document.createElement("table");
            tbody = document.createElement("tbody");
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Files";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = commas(details.files);
            tr.appendChild(td);
            tbody.appendChild(tr);
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Directories";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = commas(details.directories);
            tr.appendChild(td);
            tbody.appendChild(tr);
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Symbolic Links";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = commas(details.links);
            tr.appendChild(td);
            tbody.appendChild(tr);
            table.appendChild(tbody);
            output.appendChild(table);

            mTime = new Date(list[0][5].mtimeMs);
            aTime = new Date(list[0][5].atimeMs);
            cTime = new Date(list[0][5].ctimeMs);
            heading = document.createElement("h3");
            heading.innerHTML = "MAC";
            output.appendChild(heading);
            table = document.createElement("table");
            tbody = document.createElement("tbody");
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Modified";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = util.dateFormat(mTime);
            tr.appendChild(td);
            tbody.appendChild(tr);
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Accessed";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = util.dateFormat(aTime);
            tr.appendChild(td);
            tbody.appendChild(tr);
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = "Created";
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = util.dateFormat(cTime);
            tr.appendChild(td);
            tbody.appendChild(tr);
            table.appendChild(tbody);
            output.appendChild(table);
    
            if (list[0][1] === "directory" && details.files > 0) {
                let button:HTMLElement = document.createElement("button");
                td = document.createElement("p");
                heading = document.createElement("h3");
                heading.innerHTML = "List files";
                output.appendChild(heading);

                // largest files
                button.innerHTML = "List 100 largest files";
                button.onclick = function local_context_details_callback_largest(event:MouseEvent):void {
                    fileList.sort(function local_context_details_callback_largest_sort(aa:directoryItem, bb:directoryItem):number {
                        if (aa[5].size > bb[5].size) {
                            return -1;
                        }
                        return 1;
                    });
                    const element:Element = <Element>event.srcElement || <Element>event.target,
                        grandParent:Element = <Element>element.parentNode.parentNode,
                        table:HTMLElement = <HTMLElement>grandParent.getElementsByClassName("detailFileList")[0],
                        p:HTMLElement = <HTMLElement>table.previousSibling,
                        tableBody:HTMLElement = table.getElementsByTagName("tbody")[0],
                        dataLength:number = Math.min(fileList.length, 100);
                    let aa:number = 0,
                        row:HTMLElement,
                        cell:HTMLElement;
                    p.innerHTML = `${dataLength} largest files`;
                    tbody.innerHTML = "";
                    do {
                        row = document.createElement("tr");
                        cell = document.createElement("th");
                        cell.setAttribute("class", "file");
                        cell.innerHTML = fileList[aa][0];
                        row.appendChild(cell);
                        cell = document.createElement("td");
                        cell.innerHTML = commas(fileList[aa][5].size);
                        row.appendChild(cell);
                        cell = document.createElement("td");
                        cell.innerHTML = prettyBytes(fileList[aa][5].size);
                        row.appendChild(cell);
                        tableBody.appendChild(row);
                        aa = aa + 1;
                    } while (aa < dataLength);
                    table.style.display = "block";
                    p.style.display = "block";
                };
                td.appendChild(button);
                output.appendChild(td);

                // most recent files
                td = document.createElement("p"),
                button = document.createElement("button");
                button.innerHTML = "List 100 most recently changed files";
                button.onclick = function local_context_details_callback_recent(event:MouseEvent):void {
                    fileList.sort(function local_context_details_callback_recent_sort(aa:directoryItem, bb:directoryItem):number {
                        if (aa[5].mtimeMs > bb[5].mtimeMs) {
                            return -1;
                        }
                        return 1;
                    });
                    const element:Element = <Element>event.srcElement || <Element>event.target,
                        grandParent:Element = <Element>element.parentNode.parentNode,
                        table:HTMLElement = <HTMLElement>grandParent.getElementsByClassName("detailFileList")[0],
                        p:HTMLElement = <HTMLElement>table.previousSibling,
                        tableBody:HTMLElement = table.getElementsByTagName("tbody")[0],
                        dataLength:number = Math.min(fileList.length, 100);
                    let aa:number = 0,
                        row:HTMLElement,
                        cell:HTMLElement;
                    p.innerHTML = `${dataLength} most recently changed files`;
                    tbody.innerHTML = "";
                    do {
                        row = document.createElement("tr");
                        cell = document.createElement("th");
                        cell.setAttribute("class", "file");
                        cell.innerHTML = fileList[aa][0];
                        row.appendChild(cell);
                        cell = document.createElement("td");
                        cell.innerHTML = util.dateFormat(new Date(fileList[aa][5].mtimeMs));
                        row.appendChild(cell);
                        tableBody.appendChild(row);
                        aa = aa + 1;
                    } while (aa < dataLength);
                    table.style.display = "block";
                    p.style.display = "block";
                };
                td.appendChild(button);
                output.appendChild(td);

                // all files
                td = document.createElement("p");
                button = document.createElement("button");
                button.innerHTML = "List all files alphabetically";
                button.onclick = function local_context_details_callback_allFiles(event:MouseEvent):void {
                    fileList.sort(function local_context_details_callback_allFiles_sort(aa:directoryItem, bb:directoryItem):number {
                        if (aa[0] < bb[0]) {
                            return -1;
                        }
                        return 1;
                    });
                    const element:Element = <Element>event.srcElement || <Element>event.target,
                        grandParent:Element = <Element>element.parentNode.parentNode,
                        table:HTMLElement = <HTMLElement>grandParent.getElementsByClassName("detailFileList")[0],
                        p:HTMLElement = <HTMLElement>table.previousSibling,
                        tableBody:HTMLElement = table.getElementsByTagName("tbody")[0],
                        dataLength:number = fileList.length;
                    let aa:number = 0,
                        row:HTMLElement,
                        cell:HTMLElement;
                    p.innerHTML = `All ${commas(dataLength)} files sorted alphabetically`;
                    tbody.innerHTML = "";
                    do {
                        row = document.createElement("tr");
                        cell = document.createElement("th");
                        cell.setAttribute("class", "file");
                        cell.innerHTML = fileList[aa][0];
                        row.appendChild(cell);
                        tableBody.appendChild(row);
                        aa = aa + 1;
                    } while (aa < dataLength);
                    table.style.display = "block";
                    p.style.display = "block";
                };
                td.appendChild(button);
                output.appendChild(td);

                // subject paragraph
                td = document.createElement("p");
                td.style.display = "none";
                output.appendChild(td);

                // table
                table = document.createElement("table");
                tbody = document.createElement("tbody");
                table.appendChild(tbody);
                table.style.display = "none";
                table.setAttribute("class", "detailFileList");
                output.appendChild(table);
            }
    
            body.innerHTML = "";
            body.appendChild(output);
        };
    if (browser.loadTest === true) {
        return;
    }
    network.fs(payloadNetwork, callback);
    context.element = null;
};

/* Handler for creating new directories */
context.fsNew = function local_context_fsNew(event:MouseEvent):void {
    const element:Element = <Element>event.srcElement || <Element>event.target,
        cancel = function local_context_fsNew_cancel(actionElement:Element):void {
            const list:Element = actionElement.getAncestor("fileList", "class"),
                input:HTMLElement = <HTMLElement>list.getElementsByTagName("input")[0];
            setTimeout(function local_context_fsNew_cancel_delay():void {
                if (actionElement.parentNode.parentNode.parentNode === list) {
                    list.removeChild(actionElement.parentNode.parentNode);
                    input.focus();
                }
            }, 10);
        },
        actionKeyboard = function local_context_fsNew_actionKeyboard(actionEvent:KeyboardEvent):void {
            const actionElement:HTMLInputElement = <HTMLInputElement>actionEvent.srcElement || <HTMLInputElement>actionEvent.target,
                actionParent:Element = <Element>actionElement.parentNode;
            if (actionEvent.key === "Enter") {
                const value:string = actionElement.value.replace(/(\s+|\.)$/, ""),
                    parent:Element = <Element>actionElement.parentNode,
                    id:string = parent.getAncestor("box", "class").getAttribute("id"),
                    agency:agency = util.getAgent(actionElement),
                    payload:fileService = {
                        action: "fs-new",
                        agent: agency[0],
                        agentType: agency[2],
                        copyAgent: "",
                        copyType: "device",
                        depth: 1,
                        id: id,
                        location: [actionElement.getAttribute("data-location") + value],
                        name: actionElement.getAttribute("data-type"),
                        share: browser.data.modals[id].share,
                        watch: "no"
                    },
                    callback = function local_context_fsNew_actionKeyboard_callback():void {
                        return;
                    };
                if (value.replace(/\s+/, "") !== "") {
                    actionParent.innerHTML = payload.location[0];
                    network.fs(payload, callback);
                }
            } else {
                if (actionEvent.key === "Escape") {
                    cancel(actionElement);
                    return;
                }
                actionElement.value = actionElement.value.replace(/\?|<|>|"|\||\*|:|\\|\/|\u0000/g, "");
            }
        },
        actionBlur = function local_context_fsNew_actionBlur(actionEvent:FocusEvent):void {
            const actionElement:HTMLInputElement = <HTMLInputElement>actionEvent.srcElement || <HTMLInputElement>actionEvent.target,
                value:string = actionElement.value.replace(/(\s+|\.)$/, "");
            if (actionEvent.type === "blur") {
                if (value.replace(/\s+/, "") === "") {
                    cancel(actionElement);
                } else {
                    const actionParent:Element = <Element>actionElement.parentNode,
                        agency:agency = util.getAgent(actionElement),
                        id:string = actionParent.getAncestor("box", "class").getAttribute("id"),
                        payload:fileService = {
                            action: "fs-new",
                            agent: agency[0],
                            agentType: agency[2],
                            copyAgent: "",
                            copyType: "device",
                            depth: 1,
                            id: id,
                            location: [actionElement.getAttribute("data-location") + value],
                            name: actionElement.getAttribute("data-type"),
                            share: browser.data.modals[id].share,
                            watch: "no"
                        },
                        callback = function local_context_fsNew_actionBlur_callback():void {
                            return;
                        };
                    actionParent.innerHTML = payload.location[0];
                    network.fs(payload, callback);
                }
            }
        },
        build = function local_context_fsNew_build():void {
            const li:HTMLElement = document.createElement("li"),
                label:HTMLLabelElement = document.createElement("label"),
                input:HTMLInputElement = document.createElement("input"),
                field:HTMLInputElement = document.createElement("input"),
                text:HTMLElement = document.createElement("label"),
                parent:Element = (context.element === null)
                    ? null
                    : <Element>context.element.parentNode,
                box = (parent === null)
                    ? null
                    : parent.getAncestor("box", "class"),
                type:contextType = (context.type !== "")
                    ? context.type
                    : (element.innerHTML.indexOf("New File") === 0)
                        ? "file"
                        : "directory";

            if (parent === null) {
                return;
            }

            let span:HTMLElement,
                slash:"\\"|"/" = "/",
                path:string = box.getElementsByTagName("input")[0].value;

            li.setAttribute("class", type);
            if (type === "directory") {
                li.ondblclick = fs.directory;
            }
            path = box.getElementsByTagName("input")[0].value;
            if (path.indexOf("/") < 0 || (path.indexOf("\\") < path.indexOf("/") && path.indexOf("\\") > -1 && path.indexOf("/") > -1)) {
                slash = "\\";
            }
            if (path.charAt(path.length - 1) !== slash) {
                path = path + slash;
            }
            input.type = "checkbox";
            input.checked = false;
            label.innerHTML = "Selected";
            label.appendChild(input);
            label.setAttribute("class", "selection");
            text.oncontextmenu = context.menu;
            text.onclick = fs.select;
            text.innerHTML = path;
            field.onkeyup = actionKeyboard;
            field.onblur = actionBlur;
            field.setAttribute("id", "newFileItem");
            field.setAttribute("data-type", type);
            field.setAttribute("data-location", path);
            text.appendChild(field);
            li.appendChild(text);
            span = document.createElement("span");
            span.onclick = fs.select;
            span.oncontextmenu = context.menu;
            li.appendChild(span);
            li.oncontextmenu = context.menu;
            li.appendChild(label);
            li.onclick = fs.select;
            if (context.element.nodeName.toLowerCase() === "ul") {
                context.element.appendChild(li);
            } else {
                context.element.parentNode.appendChild(li);
            }
            field.focus();
        };
    if (document.getElementById("newFileItem") !== null) {
        return;
    }
    build();
    context.element = null;
    context.type = "";
};

/* Creates context menu */
context.menu = function local_context_menu(event:MouseEvent):void {
    const itemList:Element[] = [],
        menu:HTMLElement = document.createElement("ul"),
        command:string = (navigator.userAgent.indexOf("Mac OS X") > 0)
            ? "Command"
            : "CTRL",
        functions:contextFunctions = {
            base64: function local_context_menu_base64():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Base64 <em>${command} + ALT + B</em>`;
                button.onclick = context.dataString;
                item.appendChild(button);
                itemList.push(item);
            },
            copy: function local_context_menu_copy():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Copy <em>${command} + C</em>`;
                button.onclick = context.copy;
                item.appendChild(button);
                itemList.push(item);
            },
            cut: function local_context_menu_cut():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Cut <em>${command} + X</em>`;
                button.onclick = context.copy;
                item.appendChild(button);
                itemList.push(item);
            },
            destroy: function local_context_menu_destroy():void {
                let input:HTMLInputElement = <HTMLInputElement>parent.getAncestor("border", "class");
                input = input.getElementsByTagName("input")[0];
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Destroy <em>DEL</em>`;
                button.setAttribute("class", "destroy");
                if (input.value === "/" || input.value === "\\") {
                    button.disabled = true;
                } else {
                    button.onclick = context.destroy;
                }
                item.appendChild(button);
                itemList.push(item);
            },
            details: function local_context_menu_details():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Details <em>${command} + ALT + T</em>`;
                button.onclick = context.details;
                item.appendChild(button);
                itemList.push(item);
            },
            edit: function local_context_menu_edit():void {
                item = document.createElement("li");
                button = document.createElement("button");
                if (readOnly === true) {
                    button.innerHTML = `Read File as Text <em>${command} + ALT + E</em>`;
                } else {
                    button.innerHTML = `Edit File as Text <em>${command} + ALT + E</em>`;
                }
                button.onclick = context.dataString;
                item.appendChild(button);
                itemList.push(item);
            },
            hash: function local_context_menu_hash():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Hash <em>${command} + ALT + H</em>`;
                button.onclick = context.dataString;
                item.appendChild(button);
                itemList.push(item);
            },
            newDirectory: function local_context_menu_newDirectory():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `New Directory <em>${command} + ALT + D</em>`;
                button.onclick = context.fsNew;
                item.appendChild(button);
                itemList.push(item);
            },
            newFile: function local_context_menu_newFile():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `New File <em>${command} + ALT + F</em>`;
                button.onclick = context.fsNew;
                item.appendChild(button);
                itemList.push(item);
            },
            paste: function local_context_menu_paste():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Paste <em>${command} + V</em>`;
                button.onclick = context.paste;
                if (clipboard === "" || (
                    (element.getAttribute("class") === "fileList" || parent.getAttribute("class") === "fileList") &&
                    (clipboard.indexOf("\"type\":") < 0 || clipboard.indexOf("\"data\":") < 0)
                )) {
                    button.disabled = true;
                }
                item.appendChild(button);
                itemList.push(item);
            },
            rename: function local_context_menu_rename():void {
                let input:HTMLInputElement = <HTMLInputElement>parent.getAncestor("border", "class");
                input = input.getElementsByTagName("input")[0];
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Rename <em>${command} + ALT + R</em>`;
                if (input.value === "/" || input.value === "\\") {
                    button.disabled = true;
                } else {
                    button.onclick = fs.rename;
                }
                item.appendChild(button);
                itemList.push(item);
            },
            share: function local_context_menu_share():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = `Share <em>${command} + ALT + S</em>`;
                button.onclick = share.context;
                item.appendChild(button);
                itemList.push(item);
            }
        };
    let element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        nodeName:string = element.nodeName.toLowerCase(),
        parent:Element = <Element>element.parentNode,
        item:Element,
        button:HTMLButtonElement,
        clientX:number,
        clientY:number,
        box:HTMLElement = <HTMLElement>element.getAncestor("box", "class"),
        readOnly:boolean = browser.data.modals[box.getAttribute("id")].read_only,
        reverse:boolean = false,
        a:number = 0;
    event.stopPropagation();
    if (nodeName === "input") {
        return;
    }
    if (nodeName === "span" || nodeName === "label" || element.getAttribute("class") === "expansion") {
        element = <HTMLElement>element.parentNode;
        parent = <Element>parent.parentNode;
        nodeName = element.nodeName.toLowerCase();
    }
    context.element = element;
    context.menuRemove();
    event.preventDefault();
    event.stopPropagation();
    menu.setAttribute("id", "contextMenu");
    menu.onclick = context.menuRemove;
    if (element.getAttribute("class") === "fileList") {
        if (readOnly === true) {
            return;
        }
        functions.details();
        functions.newDirectory();
        functions.newFile();
        functions.paste();
    } else if (parent.getAttribute("class") === "fileList") {
        functions.details();
        if (box.getAttribute("data-agentType") === "device") {
            functions.share();
        }
        if (element.getAttribute("class").indexOf("file") === 0) {
            functions.edit();
            functions.hash();
            functions.base64();
        }

        if (readOnly === false) {
            functions.newDirectory();
            functions.newFile();
        }
        functions.copy();
        if (readOnly === false) {
            functions.cut();
            functions.paste();
            functions.rename();
            functions.destroy();
        }
    }

    // this accounts for events artificially created during test automation
    if (event.clientY === undefined || event.clientX === undefined) {
        const body:HTMLElement = <HTMLElement>element.getAncestor("body", "class");
        clientX = element.offsetLeft + body.offsetLeft + box.offsetLeft + 50;
        clientY = element.offsetTop + body.offsetTop + box.offsetTop + 65;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    // menu display position
    menu.style.zIndex = `${browser.data.zIndex + 10}`;
    // vertical
    if (browser.content.clientHeight < ((itemList.length * 57) + 1) + clientY) {
        const offset:number = (function local_context_menu_verticalOffset():number {
            // modify position of the menu when performing test automation
            if (event.clientY === undefined) {
                return -25;
            }
            if (location.href.indexOf("?test_browser") < 0) {
                reverse = true;
            }
            return 1;
        }());
        menu.style.top = `${(clientY - ((itemList.length * 57) + offset)) / 10}em`;
    } else {
        menu.style.top = `${(clientY - 50) / 10}em`;
    }
    // horizontal
    if (browser.content.clientWidth < (200 + clientX)) {
        if (event.clientX !== undefined && location.href.indexOf("?test_browser") < 0) {
            reverse = true;
        }
        menu.style.left = `${(clientX - 200) / 10}em`;
    } else {
        menu.style.left = `${clientX / 10}em`;
    }

    // button order
    if (reverse === true) {
        a = itemList.length;
        do {
            a = a - 1;
            menu.appendChild(itemList[a]);
        } while (a > 0);
    } else {
        do {
            menu.appendChild(itemList[a]);
            a = a + 1;
        } while (a < itemList.length);
    }
    browser.content.appendChild(menu);
};

/* Destroys a context menu */
context.menuRemove = function local_context_menuRemove():void {
    const menu:Element = document.getElementById("contextMenu");
    if (menu !== null) {
        menu.parentNode.removeChild(menu);
    }
};

/* Prepare the network action to write files */
context.paste = function local_context_paste():void {
    const element:Element = context.element.getAncestor("box", "class"),
        destination:string = element.getElementsByTagName("input")[0].value,
        clipData:clipboard = (clipboard === "")
            ? {}
            : JSON.parse(clipboard),
        id:string = element.getAttribute("id"),
        copyAgent:string = browser.data.modals[id].agent,
        copyType:agentType = browser.data.modals[id].agentType,
        payload:fileService = {
            action   : <serviceType>`fs-${clipData.type}`,
            agent    : clipData.agent,
            agentType: clipData.agentType,
            copyAgent: copyAgent,
            copyShare: browser.data.modals[id].share,
            copyType : copyType,
            depth    : 1,
            id       : id,
            location : clipData.data,
            name     : destination,
            share    : clipData.share,
            watch    : "no"
        },
        callback = function local_context_paste_callback():void {
            clipboard = "";
            util.selectNone(document.getElementById(clipData.id));
        };
    if (clipboard === "") {
        return;
    }
    network.fs(payload, callback);
    context.element = null;
};

context.type = "";

export default context;