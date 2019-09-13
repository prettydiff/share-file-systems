
(function local():void {
    "use strict";
    const content:HTMLElement = document.getElementById("content-area"),
        ws:WebSocket = new WebSocket(`ws://localhost:${(function local_webSocketsPort() {
            const uri:string = location.href;
            let domain:string = uri.slice(location.href.indexOf("host:") + 5),
                index:number = domain.indexOf("/");
            if (index > 0) {
                domain = domain.slice(0, index);
            }
            index = domain.indexOf("?");
            if (index > 0) {
                domain = domain.slice(0, index);
            }
            index = domain.indexOf("#");
            if (index > 0) {
                domain = domain.slice(0, index);
            }
            index = Number(domain);
            if (isNaN(index) === true) {
                return 8080;
            }
            return index;
        }()) + 1}`),
        network:network = {},
        ui:ui = {
            context: {},
            fs: {},
            modal: {},
            systems: {},
            util: {}
        };
    let loadTest:boolean = true,
        data:ui_data = {
            clipboard: "",
            modals: {},
            modalTypes: [],
            name: "",
            shares: {
                localhost: []
            },
            zIndex: 0
        },
        messageTransmit:boolean = true,
        messages:messages = {
            status: [],
            users: [],
            errors: []
        },
        characterKey:characterKey = "";

    /* Gathers a hash or base64 and returns the hash value */
    network.dataString = function local_network_hash(address:string, type:"hash" | "base64", callback:Function):void {
        const xhr:XMLHttpRequest = new XMLHttpRequest(),
            loc:string = location.href.split("?")[0];
        messageTransmit = false;
        ui.context.menuRemove();
        xhr.onreadystatechange = function local_network_fileDetails_callback():void {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    callback(xhr.responseText);
                } else {
                    ui.systems.message("errors", `{"error":"XHR responded with ${xhr.status} when requesting ${type} on ${address}.","stack":["${new Error().stack.replace(/\s+$/, "")}"]}`);
                }
                messageTransmit = true;
                network.messages();
            }
        };
        xhr.withCredentials = true;
        xhr.open("POST", loc, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.send(JSON.stringify({
            fs: {
                action  : `fs-${type}`,
                agent   : "self",
                depth   : 1,
                location: address,
                watch   : "no"
            }
        }));
    };

    /* Gathers fully recursive file system details and displays to screen */
    network.fileDetails = function local_network_fileDetails(address:string[], callback:Function):void {
        const xhr:XMLHttpRequest = new XMLHttpRequest(),
            loc:string = location.href.split("?")[0];
        messageTransmit = false;
        ui.context.menuRemove();
        xhr.onreadystatechange = function local_network_fileDetails_callback():void {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    const list:directoryList[] = JSON.parse(xhr.responseText),
                        length:number = list.length,
                        details:fsDetails = {
                            size: 0,
                            files: 0,
                            directories: 0,
                            links: 0
                        },
                        output:HTMLElement = document.createElement("div");
                    let a:number = 0,
                        b:number = 0,
                        tr:HTMLElement,
                        td:HTMLElement,
                        childLength:number,
                        heading:HTMLElement = document.createElement("h3"),
                        table:HTMLElement = document.createElement("table"),
                        tbody:HTMLElement = document.createElement("tbody"),
                        mTime:Date,
                        aTime:Date,
                        cTime:Date;
                    list.sort(function local_network_fileDetails_callback_sort(a:directoryList, b:directoryList):number {
                        // when types are the same
                        if (a[0][1] === b[0][1]) {
                            if (a[0][0] < b[0][0]) {
                                return -1;
                            }
                            return 1;
                        }

                        // when types are different
                        if (a[0][1] === "directory") {
                            return -1;
                        }
                        if (a[0][1] === "link" && b[0][1] === "file") {
                            return -1;
                        }
                        return 1;
                    });
                    do {
                        childLength = list[b].length;
                        if (list[b][0][1] === "directory" && childLength > 0) {
                            a = 1;
                            do {
                                if (list[b][a][1] === "directory") {
                                    details.directories = details.directories + 1;
                                } else if (list[b][a][1] === "link") {
                                    details.links = details.links + 1;
                                } else {
                                    details.files = details.files + 1;
                                    details.size = details.size + list[b][a][4].size;
                                }
                                a = a + 1;
                            } while (a < childLength);
                        } else {
                            details.size = details.size + list[b][0][4].size;
                        }
                        b = b + 1;
                    } while (b < length);

                    output.setAttribute("class", "fileDetailOutput");
                    heading.innerHTML = `File System Details - ${list.length} items`;
                    output.appendChild(heading);
                    a = 0;
                    childLength = address.length;
                    do {
                        tr = document.createElement("tr");
                        td = document.createElement("th");
                        td.innerHTML = list[a][0][1];
                        td.setAttribute("class", list[a][0][1]);
                        tr.appendChild(td);
                        td = document.createElement("td");
                        td.innerHTML = list[a][0][0];
                        tr.appendChild(td);
                        tbody.appendChild(tr);
                        a = a + 1;
                    } while (a < length);
                    tr = document.createElement("tr");
                    td = document.createElement("th");
                    td.innerHTML = "Total Size";
                    tr.appendChild(td);
                    td = document.createElement("td");
                    if (details.size > 1024) {
                        td.innerHTML = `${ui.util.commas(details.size)} bytes (${ui.util.prettyBytes(details.size)})`;
                    } else {
                        td.innerHTML = `${ui.util.commas(details.size)} bytes`;
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
                    td.innerHTML = ui.util.commas(details.files);
                    tr.appendChild(td);
                    tbody.appendChild(tr);
                    tr = document.createElement("tr");
                    td = document.createElement("th");
                    td.innerHTML = "Directories";
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.innerHTML = ui.util.commas(details.directories);
                    tr.appendChild(td);
                    tbody.appendChild(tr);
                    tr = document.createElement("tr");
                    td = document.createElement("th");
                    td.innerHTML = "Symbolic Links";
                    tr.appendChild(td);
                    td = document.createElement("td");
                    td.innerHTML = ui.util.commas(details.links);
                    tr.appendChild(td);
                    tbody.appendChild(tr);
                    table.appendChild(tbody);
                    output.appendChild(table);
                    
                    if (list.length === 1) {
                        mTime = new Date(list[0][0][4].mtimeMs);
                        aTime = new Date(list[0][0][4].atimeMs);
                        cTime = new Date(list[0][0][4].ctimeMs);
                        heading = document.createElement("h3");
                        heading.innerHTML = "Modified, Accessed, Created";
                        output.appendChild(heading);
                        table = document.createElement("table");
                        tbody = document.createElement("tbody");
                        tr = document.createElement("tr");
                        td = document.createElement("th");
                        td.innerHTML = "Modified";
                        tr.appendChild(td);
                        td = document.createElement("td");
                        td.innerHTML = ui.util.dateFormat(mTime);
                        tr.appendChild(td);
                        tbody.appendChild(tr);
                        tr = document.createElement("tr");
                        td = document.createElement("th");
                        td.innerHTML = "Accessed";
                        tr.appendChild(td);
                        td = document.createElement("td");
                        td.innerHTML = ui.util.dateFormat(aTime);
                        tr.appendChild(td);
                        tbody.appendChild(tr);
                        tr = document.createElement("tr");
                        td = document.createElement("th");
                        td.innerHTML = "Created";
                        tr.appendChild(td);
                        td = document.createElement("td");
                        td.innerHTML = ui.util.dateFormat(cTime);
                        tr.appendChild(td);
                        tbody.appendChild(tr);
                        table.appendChild(tbody);
                        output.appendChild(table);
                    }

                    callback(output);
                } else {
                    ui.systems.message("errors", `{"error":"XHR responded with ${xhr.status} when requesting file system.","stack":["${new Error().stack.replace(/\s+$/, "")}"]}`);
                }
                messageTransmit = true;
                network.messages();
            }
        };
        xhr.withCredentials = true;
        xhr.open("POST", loc, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.send(JSON.stringify({
            fs: {
                action  : "fs-details",
                agent   : "self",
                depth   : 0,
                location: address,
                watch   : "no"
            }
        }));
    };
    
    /* Gathers file system data and builds an HTML artifact */
    network.fs = function local_network_fs(configuration:fsRead):void {
        const xhr:XMLHttpRequest = new XMLHttpRequest(),
            loc:string = location.href.split("?")[0];
        xhr.onreadystatechange = function local_network_fs_callback():void {
            if (xhr.readyState === 4) {
                const elementParent:HTMLElement = (configuration.element === null)
                    ? null
                    : <HTMLElement>configuration.element.parentNode;
                if (xhr.status === 0) {
                    const output:HTMLElement = document.createElement("ul");
                    output.setAttribute("class", "fileList");
                    output.title = configuration.location;
                    configuration.callback(output, configuration.id);
                } else if (xhr.status === 200) {
                    const list:directoryList = JSON.parse(xhr.responseText)[0],
                        local:directoryList = [],
                        length:number = list.length,
                        output:HTMLElement = document.createElement("ul");
                    let a:number = 0,
                        localLength:number = 0;
                    if (xhr.responseText === "[[]]") {
                        output.setAttribute("class", "fileList");
                        output.title = configuration.location;
                        configuration.callback(output, configuration.id);
                        return;
                    }
                    if (configuration.element.nodeName === "input") {
                        configuration.element.removeAttribute("class");
                    }

                    do {
                        if (list[a][2] === 0) {
                            local.push(list[a]);
                        }
                        a = a + 1;
                    } while (a < length);
                    local.sort(function local_network_fs_callback_sort(a:directoryItem, b:directoryItem):number {
                        // when types are the same
                        if (a[1] === b[1]) {
                            if (a[0] < b[0]) {
                                return -1;
                            }
                            return 1;
                        }

                        // when types are different
                        if (a[1] === "directory") {
                            return -1;
                        }
                        if (a[1] === "link" && b[1] === "file") {
                            return -1;
                        }
                        return 1;
                    });
                    if (configuration.location === "\\" || configuration.location === "/") {
                        a = 0;
                    } else {
                        a = 1;
                    }
                    localLength = local.length;
                    do {
                        if (local[a][0] !== "\\" && local[a][0] !== "/") {
                            if (a < localLength - 1 && local[a + 1][1] !== local[a][1]) {
                                output.appendChild(ui.util.fsObject(local[a], "lastType"));
                            } else {
                                output.appendChild(ui.util.fsObject(local[a], ""));
                            }
                        }
                        a = a + 1;
                    } while (a < localLength);
                    output.title = local[0][0];
                    output.setAttribute("class", "fileList");
                    configuration.callback(output, configuration.id);
                } else {
                    if (loadTest === true) {
                        const output:HTMLElement = document.createElement("p");
                        output.setAttribute("class", "error");
                        if (xhr.status === 404) {
                            output.innerHTML = "This path is not found.";
                        } else {
                            output.innerHTML = `Server error: ${xhr.status}.<hr/>${new Error().stack.replace(/\s+$/, "")}`;
                        }
                        configuration.callback(output, configuration.id);
                    }
                    configuration.element.setAttribute("class", "error");
                    if (elementParent !== undefined && elementParent !== null) {
                        const span:HTMLElement = elementParent.getElementsByTagName("span")[0];
                        if (span !== undefined) {
                            span.innerHTML = "Address not found.";
                        }
                    }
                    ui.systems.message("errors", `{"error":"XHR responded with ${xhr.status} when requesting file system.","stack":["${new Error().stack.replace(/\s+$/, "")}"]}`);
                }
            }
        };
        xhr.withCredentials = true;
        xhr.open("POST", loc, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.send(JSON.stringify({
            fs: {
                action  : "fs-read",
                agent   : configuration.agent,
                depth   : configuration.depth,
                location:[configuration.location.replace(/\\/g, "\\\\")],
                watch   : configuration.watch.replace(/\\/g, "\\\\")
            }
        }));
    };

    network.fsNew = function local_network_fsNew(agent:string, type:"file" | "directory", address:string):void {
        const xhr:XMLHttpRequest = new XMLHttpRequest(),
            loc:string = location.href.split("?")[0];
        xhr.onreadystatechange = function local_network_fs_callback():void {};
        xhr.withCredentials = true;
        xhr.open("POST", loc, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.send(JSON.stringify({
            fs: {
                action  : "fs-new",
                agent   : agent,
                depth   : 1,
                location:[address.replace(/\\/g, "\\\\")],
                type    : type,
                watch   : "no"
            }
        }));
    };

    /* Rename a single file system artifact */
    network.fsRename = function local_network_fsRename(configuration:fsRename):void {
        const xhr:XMLHttpRequest = new XMLHttpRequest(),
            loc:string = location.href.split("?")[0];
        xhr.onreadystatechange = function local_network_fs_callback():void {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    configuration.callback();
                } else {
                    configuration.element.setAttribute("class", "error");
                    configuration.element.value = configuration.original;
                    ui.systems.message("errors", `{"error":"XHR responded with ${xhr.status} when requesting file system.","stack":["${new Error().stack.replace(/\s+$/, "")}"]}`);
                }
            }
        };
        xhr.withCredentials = true;
        xhr.open("POST", loc, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.send(JSON.stringify({
            fs: {
                action  : "fs-rename",
                agent   : configuration.agent,
                depth   : 1,
                location:[configuration.location.replace(/\\/g, "\\\\")],
                name    : configuration.name,
                watch   : "no"
            }
        }));
    };

    /* Stores systems log messages to storage/messages.json file */
    network.messages = function local_network_messages():void {
        if (loadTest === true || messageTransmit === false) {
            return;
        }
        const xhr:XMLHttpRequest = new XMLHttpRequest(),
            loc:string = location.href.split("?")[0];
        xhr.onreadystatechange = function local_network_messages_callback():void {
            if (xhr.readyState === 4) {
                if (xhr.status !== 200 && xhr.status !== 0) {
                    ui.systems.message("errors", `{"error":"XHR responded with ${xhr.status} when sending messages.","stack":["${new Error().stack.replace(/\s+$/, "")}"]}`);
                }
            }
        };
        xhr.withCredentials = true;
        xhr.open("POST", loc, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.send(`messages:${JSON.stringify(messages)}`);
    };

    /* Stores settings data to a storage/settings.json file */
    network.settings = function local_network_settings():void {
        if (loadTest === true) {
            return;
        }
        const xhr:XMLHttpRequest = new XMLHttpRequest(),
            loc:string = location.href.split("?")[0];
        xhr.onreadystatechange = function local_network_settings_callback():void {
            if (xhr.readyState === 4) {
                if (xhr.status !== 200 && xhr.status !== 0) {
                    ui.systems.message("errors", `{"error":"XHR responded with ${xhr.status} when sending settings.","stack":${new Error().stack}`);
                }
            }
        };
        xhr.withCredentials = true;
        xhr.open("POST", loc, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.send(`settings:${JSON.stringify(data)}`);
    };

    /* Handler for file system artifact copy */
    ui.context.copy = function local_ui_context_copy(event:MouseEvent, element?:HTMLElement):void {

    };

    /* Handler for hash and base64 operations from the context menu */
    ui.context.dataString = function local_ui_context_dataString(event:MouseEvent, element?:HTMLElement, task?:"Hash" | "Base64"):void {
        let address:string = element.getElementsByTagName("label")[0].innerHTML;
        address = element.getElementsByTagName("label")[0].innerHTML;
        network.dataString(address, <"hash"|"base64">task.toLowerCase(), function local_ui_context_dataString_callback(resultString:string):void {
            ui.modal.textPad(event, resultString, `${task} - ${address}`);
            network.settings();
        });
    };

    /* Handler for removing file system artifacts via context menu */
    ui.context.destroy = function local_ui_context_destroy(event:MouseEvent, element?:HTMLElement):void {

    };

    /* Handler for details action of context menu */
    ui.context.details = function local_ui_context_details(event:MouseEvent, element?:HTMLElement):void {
        const div:HTMLElement = ui.util.delay(),
            addresses:[string, string][] = ui.util.selectedAddresses(element),
            modal:HTMLElement = ui.modal.create({
                content: div,
                height: 500,
                inputs: ["close"],
                left: event.clientX,
                single: true,
                title: `Details - ${addresses.length} items`,
                top: event.clientY - 60,
                type: "details",
                width: 500
            }),
            addressList:string[] = (function local_ui_context_details_addressList():string[] {
                const output:string[] = [],
                    length:number = addresses.length;
                let a:number = 0;
                do {
                    output.push(addresses[a][0]);
                    a = a + 1;
                } while (a < length);
                return output;
            }());
        network.fileDetails(addressList, function local_ui_context_details_callback(files:HTMLElement) {
            const body:HTMLElement = <HTMLElement>modal.getElementsByClassName("body")[0];
            body.innerHTML = "";
            body.appendChild(files);
        });
        ui.util.selectNone(element);
    }

    /* Handler for creating new directories */
    ui.context.fsNew = function local_ui_context_fsNew(event:MouseEvent, element?:HTMLElement, type?:"file" | "directory"):void {
        const field:HTMLInputElement = document.createElement("input"),
            text:HTMLElement = document.createElement("label"),
            action = <EventHandlerNonNull>function local_ui_context_fsNew_action(actionEvent:KeyboardEvent):void {
                if ((actionEvent.type === "blur" && field.value.replace(/\s+/, "") !== "") || (actionEvent.type === "keyup" && actionEvent.keyCode === 13)) {
                    const value:string = field.value.replace(/(\s+|\.)$/, "");
                    field.value = value;
                    text.innerHTML = path + slash + value;
                    network.fsNew("self", type, path + slash + value);
                } else if (actionEvent.type === "keyup") {
                    if (actionEvent.keyCode === 27) {
                        element.removeChild(item);
                        return;
                    }
                    field.value = field.value.replace(/\?|<|>|"|\||\*|:|\\|\/|\u0000/g, "");
                }
            },
            build = function local_ui_context_fsNew_build():HTMLElement {
                const li:HTMLElement = document.createElement("li"),
                    label:HTMLLabelElement = document.createElement("label"),
                    input:HTMLInputElement = document.createElement("input");
                let span:HTMLElement;
                li.setAttribute("class", type);
                input.type = "checkbox";
                input.checked = false;
                label.innerHTML = "Selected";
                label.appendChild(input);
                label.setAttribute("class", "selection");
                text.oncontextmenu = ui.context.menu;
                text.onclick = ui.fs.select;
                text.innerHTML = path + slash;
                field.onkeyup = action;
                field.onblur = action;
                text.appendChild(field);
                li.appendChild(text);
                span = document.createElement("span");
                span.onclick = ui.fs.select;
                span.oncontextmenu = ui.context.menu;
                li.appendChild(span);
                li.oncontextmenu = ui.context.menu;
                li.appendChild(label);
                li.onclick = ui.fs.select;
                return li;
            };
        let item:HTMLElement,
            box:HTMLElement,
            path:string,
            slash:"\\" | "/";
        if (element.getAttribute("class") !== "fileList") {
            do {
                element = <HTMLElement>element.parentNode;
            } while (element !== document.documentElement && element.getAttribute("class") !== "fileList");
        }
        box = <HTMLElement>element.parentNode;
        do {
            box = <HTMLElement>box.parentNode;
        } while (box !== document.documentElement && box.getAttribute("class") !== "box");
        path = box.getElementsByTagName("input")[0].value;
        if (path.indexOf("/") < 0 || (path.indexOf("\\") < path.indexOf("/") && path.indexOf("\\") > -1 && path.indexOf("/") > -1)) {
            slash = "\\";
        }
        item = build();
        element.appendChild(item);
        field.focus();
    };

    /* Creates context menu */
    ui.context.menu = function local_ui_context_menu(event:MouseEvent):void {
        const itemList:HTMLElement[] = [],
            menu:HTMLElement = document.createElement("ul");
        let element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            parent:HTMLElement = <HTMLElement>element.parentNode,
            item:HTMLElement,
            button:HTMLButtonElement,
            reverse:boolean = false,
            a:number = 0;
        if (element.nodeName === "input") {
            return;
        }
        if (element.nodeName === "span" || element.nodeName === "label" || element.getAttribute("class") === "expansion") {
            element = <HTMLElement>element.parentNode;
            parent = <HTMLElement>parent.parentNode;
        }
        ui.context.menuRemove();
        event.preventDefault();
        event.stopPropagation();
        menu.setAttribute("id", "contextMenu");
        if (parent.getAttribute("class") === "fileList") {
            let input:HTMLInputElement = <HTMLInputElement>parent;
            do {
                input = <HTMLInputElement>input.parentNode;
            } while (input !== document.documentElement && input.getAttribute("class") !== "border");
            input = input.getElementsByTagName("input")[0];

            // details
            item = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "Details";
            button.onclick = function local_ui_context_menu() {
                ui.context.details(event, element);
            };
            item.appendChild(button);
            itemList.push(item);

            // share
            item = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "Share";
            button.onclick = function local_ui_context_menu_share():void {
                ui.context.share(event, element);
            };
            item.appendChild(button);
            itemList.push(item);

            if (element.getAttribute("class").indexOf("file") === 0) {
                //hash
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "Hash";
                button.onclick = function local_ui_context_menu_hash():void {
                    ui.context.dataString(event, element, "Hash");
                };
                item.appendChild(button);
                itemList.push(item);
                
                //base64
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "Base64";
                button.onclick = function local_ui_context_menu_base64():void {
                    ui.context.dataString(event, element, "Base64");
                };
                item.appendChild(button);
                itemList.push(item);
            }

            // new Directory
            item = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "New Directory";
            button.onclick = function local_ui_context_menu_newDirectory():void {
                ui.context.fsNew(event, element, "directory");
            };
            item.appendChild(button);
            itemList.push(item);

            // new File
            item = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "New File";
            button.onclick = function local_ui_context_menu_newFile():void {
                ui.context.fsNew(event, element, "file");
            };
            item.appendChild(button);
            itemList.push(item);

            // copy
            item = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "Copy";
            //button.onclick = wrap network.fs and open it to do more than generate file list
            item.appendChild(button);
            itemList.push(item);

            // move
            item = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "Move";
            //button.onclick = wrap network.fs and open it to do more than generate file list
            item.appendChild(button);
            itemList.push(item);

            // rename
            item = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "Rename";
            if (input.value === "/" || input.value === "\\") {
                button.disabled = true;
            } else {
                button.onclick = function local_ui_context_menu_rename():void {
                    ui.fs.rename(event);
                };
            }
            item.appendChild(button);
            itemList.push(item);

            // destroy
            item = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "Destroy";
            button.setAttribute("class", "destroy");
            if (input.value === "/" || input.value === "\\") {
                button.disabled = true;
            } else {
                //button.onclick = function local_ui_context_menu_destroy():void {};
            }
            item.appendChild(button);
            itemList.push(item);
        }

        // menu display position
        menu.style.zIndex = `${data.zIndex + 10}`;
        if (content.clientHeight < ((itemList.length * 46) + 1) + event.clientY) {
            reverse = true;
            menu.style.top = `${(event.clientY - ((itemList.length * 46) + 1)) / 10}em`;;
        } else {
            menu.style.top = `${(event.clientY - 50) / 10}em`;
        }
        if (content.clientWidth < (200 + event.clientX)) {
            reverse = true;
            menu.style.left = `${(event.clientX - 200) / 10}em`;
        } else {
            menu.style.left = `${event.clientX / 10}em`;
        }
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
        content.appendChild(menu);
    };

    /* Destroys a context menu */
    ui.context.menuRemove = function local_ui_context_menuRemove():void {
        if (document.getElementById("contextMenu") !== null) {
            content.removeChild(document.getElementById("contextMenu"));
        }
    }

    /* Handler for moving file system artifacts from one location to another */
    ui.context.move = function local_ui_context_move(event:MouseEvent, element?:HTMLElement):void {

    };

    /* Share utility for the context menu list */
    ui.context.share = function local_ui_context_share(event:MouseEvent, element?:HTMLElement):void {
        const shareLength:number = data.shares.localhost.length,
            addresses:[string, string][] = ui.util.selectedAddresses(element),
            addressesLength:number = addresses.length;
        let a:number = 0,
            b:number = 0;
        if (shareLength > 0) {
            do {
                b = 0;
                do {
                    if (addresses[a][0] === data.shares.localhost[b][0] && data.shares.localhost[b][1] === addresses[a][1]) {
                        break;
                    }
                    b = b + 1;
                } while (b < shareLength);
                if (b === shareLength) {
                    data.shares.localhost.push(addresses[a]);
                }
                a = a + 1;
            } while (a < addressesLength);
        } else {
            do {
                data.shares.localhost.push(addresses[a]);
                a = a + 1;
            } while (a < addressesLength);
        }
        ui.util.selectNone(element);
        network.settings();
    }

    /* navigate into a directory by double click */
    ui.fs.directory = function local_ui_fs_directory(event:MouseEvent):void {
        const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
            li:HTMLElement = (element.nodeName === "li")
                ? element
                : <HTMLElement>element.parentNode,
            path:string = li.getElementsByTagName("label")[0].innerHTML;
        let body:HTMLElement = li,
            box:HTMLElement,
            input:HTMLInputElement,
            watchValue:string;
        event.preventDefault();
        do {
            body = <HTMLElement>body.parentNode;
        } while (body !== document.documentElement && body.getAttribute("class") !== "body");
        box = <HTMLElement>body.parentNode.parentNode;
        input = box.getElementsByTagName("input")[0];
        watchValue = input.value;
        input.value = path;
        network.fs({
            agent: "self",
            depth: 2,
            callback: function local_ui_fs_text_callback(files:HTMLElement) {
                body.innerHTML = "";
                body.appendChild(files);
                data.modals[box.getAttribute("id")].text_value = path;
                network.settings();
            },
            element: input,
            id: "",
            location: path,
            watch: watchValue
        });
    };

    /* Shows child elements of a directory */
    ui.fs.expand = function local_ui_fs_expand(event:MouseEvent):void {
        const button:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            li:HTMLElement = <HTMLElement>button.parentNode;
        if (button.innerHTML.indexOf("+") === 0) {
            button.innerHTML = "-<span>Collapse this folder</span>";
            network.fs({
                agent: "self",
                depth: 2,
                callback: function local_ui_fs_expand_callback(files:HTMLElement) {
                    li.appendChild(files);
                },
                element: button,
                id: "",
                location: li.firstChild.nextSibling.textContent,
                watch: "no"
            });
        } else {
            const ul:HTMLCollectionOf<HTMLUListElement> = li.getElementsByTagName("ul");
            button.innerHTML = "+<span>Expand this folder</span>";
            if (ul.length > 0) {
                li.removeChild(li.getElementsByTagName("ul")[0]);
            }
        }
        event.stopPropagation();
    };

    /* Create a file navigator modal */
    ui.fs.navigate = function local_ui_fs_navigate(event:MouseEvent, path?:string):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            location:string = (typeof path === "string")
                ? path
                : "defaultLocation";
        network.fs({
            agent: "self",
            depth: 2,
            callback: function local_ui_fs_navigate_callback(files:HTMLElement) {
                const value:string = files.getAttribute("title");
                files.removeAttribute("title");
                ui.modal.create({
                    content: files,
                    inputs: ["close", "maximize", "minimize", "text"],
                    text_event: ui.fs.text,
                    text_placeholder: "Optionally type a file system address here.",
                    text_value: value,
                    title: document.getElementById("fileNavigator").innerHTML,
                    type: "fileNavigate",
                    width: 800
                });
            },
            element: element,
            id: "",
            location: location,
            watch: "yes"
        });
    };

    /* Request file system information of the parent directory */
    ui.fs.parent = function local_ui_fs_parent(event:MouseEvent):boolean {
        const element:HTMLElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
            label:HTMLElement = <HTMLElement>element.nextSibling,
            input:HTMLInputElement = label.getElementsByTagName("input")[0],
            slash:string = (input.value.indexOf("/") > -1 && (input.value.indexOf("\\") < 0 || input.value.indexOf("\\") > input.value.indexOf("/")))
                ? "/"
                : "\\",
            value:string = input.value;
        let body:HTMLElement = <HTMLElement>element.parentNode,
            box:HTMLElement,
            id:string = "";
        if (input.value === "\\" || input.value === "/") {
            return false;
        }
        body = <HTMLElement>body.parentNode;
        box = <HTMLElement>body.parentNode;
        id = box.getAttribute("id");
        body = body.getElementsByTagName("div")[0];
        if ((/^\w:\\$/).test(value) === true) {
            input.value = "\\";
        } else if (value.indexOf(slash) === value.lastIndexOf(slash)) {
            input.value = value.slice(0, value.lastIndexOf(slash) + 1);
        } else {
            input.value = value.slice(0, value.lastIndexOf(slash));
        }
        network.fs({
            agent: "self",
            depth: 2,
            callback: function local_ui_fs_parent_callback(files:HTMLElement) {
                body.innerHTML = "";
                body.appendChild(files);
                data.modals[id].text_value = input.value;
                network.settings();
            },
            element: element,
            id: "",
            location: input.value,
            watch: value
        });
    };

    /* The front-side of renaming a file system object */
    ui.fs.rename = function local_ui_fs_rename(event:MouseEvent):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            input:HTMLInputElement = document.createElement("input"),
            action = <EventHandlerNonNull>function local_ui_fs_rename_action(action:KeyboardEvent):void {
                if (action.type === "blur" || (action.type === "keyup" && action.keyCode === 13)) {
                    input.value = input.value.replace(/(\s+|\.)$/, "");
                    if (dir + input.value === text) {
                        label.innerHTML = text;
                    } else {
                        network.fsRename({
                            agent: "self",
                            callback: function local_ui_fs_rename_action_callback():void {
                                label.removeChild(input);
                                label.innerHTML = label.innerHTML + input.value;
                            },
                            element: input,
                            location: text,
                            name: input.value,
                            original: last
                        });
                    }
                } else if (action.type === "keyup") {
                    if (action.keyCode === 27) {
                        label.innerHTML = text;
                        return;
                    }
                    input.value = input.value.replace(/\?|<|>|"|\||\*|:|\\|\/|\u0000/g, "");
                }
            };
        let li:HTMLElement = element,
            label:HTMLElement,
            slash:"\\" | "/" = "/",
            last:string,
            text:string,
            dirs:string[],
            dir:string;
        if (li.nodeName !== "li") {
            do {
                li = <HTMLElement>li.parentNode;
            } while (li !== document.documentElement && li.nodeName !== "li");
        }
        label = li.getElementsByTagName("label")[0];
        text = label.innerHTML;
        if (text.indexOf("/") < 0 || (text.indexOf("\\") < text.indexOf("/") && text.indexOf("\\") > -1 && text.indexOf("/") > -1)) {
            slash = "\\";
        }
        dirs = text.split(slash);
        last = dirs.pop();
        input.type = "text";
        input.value = last;
        input.onblur = action;
        input.onkeyup = action;
        dir = dirs.join(slash) + slash;
        label.innerHTML = dir;
        label.appendChild(input);
        input.focus();
    };

    /* Select a file system item for an action */
    ui.fs.select = function local_ui_fs_select(event:MouseEvent):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            li:HTMLElement = (element.nodeName === "li")
                ? element
                : <HTMLElement>element.parentNode,
            input:HTMLInputElement = li.getElementsByTagName("input")[0];
        let state:boolean = input.checked,
            body:HTMLElement = li,
            box:HTMLElement;
        event.stopPropagation();
        ui.context.menuRemove();
        do {
            body = <HTMLElement>body.parentNode;
        } while (body !== document.documentElement && body.getAttribute("class") !== "body");
        box = <HTMLElement>body.parentNode.parentNode;
        if (characterKey === "") {
            const inputs = body.getElementsByTagName("input"),
                inputsLength = inputs.length;
            let a:number = 0,
                item:HTMLElement;
            do {
                if (inputs[a].checked === true) {
                    inputs[a].checked = false;
                    item = <HTMLElement>inputs[a].parentNode.parentNode;
                    item.setAttribute("class", item.getAttribute("class").replace(/\s*selected/, ""));
                }
                a = a + 1;
            } while (a < inputsLength);
            if (state === false) {
                input.checked = true;
                li.setAttribute("class", `${li.getAttribute("class")} selected`);
            }
        } else if (characterKey === "control") {
            if (state === true) {
                input.checked = false;
                li.setAttribute("class", li.getAttribute("class").replace(/\s*selected/, ""));
            } else {
                input.checked = true;
                li.setAttribute("class", `${li.getAttribute("class")} selected`);
            }
        } else if (characterKey === "shift") {
            const liList = body.getElementsByTagName("li"),
                shift = function local_ui_fs_select_shift(index:number, end:number):void {
                    if (state === true) {
                        do {
                            liList[index].getElementsByTagName("input")[0].checked = false;
                            liList[index].setAttribute("class", liList[index].getAttribute("class").replace(/\s*selected/, ""));
                            index = index + 1;
                        } while (index < end);
                    } else {
                        do {
                            liList[index].getElementsByTagName("input")[0].checked = true;
                            liList[index].setAttribute("class", `${liList[index].getAttribute("class")} selected`);
                            index = index + 1;
                        } while (index < end);
                    }
                };
            let a:number = 0,
                focus:HTMLElement = data.modals[box.getAttribute("id")].focus,
                elementIndex:number = -1,
                focusIndex:number = -1,
                listLength:number = liList.length;
            if (focus === null || focus === undefined) {
                data.modals[box.getAttribute("id")].focus = liList[0];
                focus = liList[0];
            }
            do {
                if (liList[a] === li) {
                    elementIndex = a;
                    if (focusIndex > -1) {
                        break;
                    }
                } else if (liList[a] === focus) {
                    focusIndex = a;
                    if (elementIndex > -1) {
                        break;
                    }
                }
                a = a + 1;
            } while (a < listLength);
            if (focusIndex === elementIndex) {
                if (state === true) {
                    input.checked = false;
                    li.setAttribute("class", li.getAttribute("class").replace(/\s*selected/, ""));
                } else {
                    input.checked = true;
                    li.setAttribute("class", `${li.getAttribute("class")} selected`);
                }
            } else if (focusIndex > elementIndex) {
                shift(elementIndex, focusIndex);
            } else {
                shift(focusIndex + 1, elementIndex + 1);
            }
        }
        data.modals[box.getAttribute("id")].focus = li;
    };

    /* Requests file system data from a text field */
    ui.fs.text = function local_ui_fs_text(event:KeyboardEvent):void {
        const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
            watchValue:string = element.value;
        let parent:HTMLElement = <HTMLElement>element.parentNode.parentNode,
            box:HTMLElement,
            id:string;
        parent = <HTMLElement>parent.parentNode;
        box = <HTMLElement>parent.parentNode;
        id = box.getAttribute("id");
        parent = parent.getElementsByTagName("div")[0];
        if (event.type === "blur" || (event.type === "keyup" && event.keyCode === 13)) {
            network.fs({
                agent: "self",
                depth: 2,
                callback: function local_ui_fs_text_callback(files:HTMLElement) {
                    parent.innerHTML = "";
                    parent.appendChild(files);
                    data.modals[id].text_value = element.value;
                    network.settings();
                },
                element: element,
                id: "",
                location: element.value,
                watch: watchValue
            });
        }
    };

    /* Removes a modal from the DOM for garbage collection, except systems log is merely hidden */
    ui.modal.close = function local_ui_modal_close(event:MouseEvent):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            keys:string[] = Object.keys(data.modals),
            keyLength:number = keys.length;
        let parent:HTMLElement = <HTMLElement>element.parentNode,
            id:string,
            type:string,
            a:number = 0,
            count:number = 0;
        do {
            parent = <HTMLElement>parent.parentNode;
        } while (parent.getAttribute("class") !== "box");
        parent.onclick = null;
        parent.parentNode.removeChild(parent);
        id = parent.getAttribute("id");
        type = id.split("-")[0];
        do {
            if (data.modals[keys[a]].type === type) {
                count = count + 1;
                if (count > 1) {
                    break;
                }
            }
            a = a + 1;
        } while (a < keyLength);
        if (count === 1) {
            data.modalTypes.splice(data.modalTypes.indexOf(type), 1);
        }
        delete data.modals[id];
        network.settings();
    };

    /* Modal creation factory */
    ui.modal.create = function local_ui_modal_create(options:ui_modal):HTMLElement {
        let button:HTMLElement = document.createElement("button"),
            h2:HTMLElement = document.createElement("h2"),
            input:HTMLInputElement,
            extra:HTMLElement;
        const id:string = (options.type === "systems")
                ? "systems-modal"
                : (options.id || `${options.type}-${Math.random().toString() + data.zIndex + 1}`),
            box:HTMLElement = document.createElement("div"),
            body:HTMLElement = document.createElement("div"),
            border:HTMLElement = document.createElement("div"),
            modalCount:number = Object.keys(data.modals).length;
        data.zIndex = data.zIndex + 1;
        if (options.zIndex === undefined) {
            options.zIndex = data.zIndex;
        }
        if (data.modalTypes.indexOf(options.type) > -1) {
            if (options.single === true) {
                return;
            }
        } else {
            data.modalTypes.push(options.type);
        }
        if (options.left === undefined) {
            options.left = 200 + (modalCount * 5);
        }
        if (options.top === undefined) {
            options.top = 200 + (modalCount * 5);
        }
        if (options.width === undefined) {
            options.width = 400;
        }
        if (options.height === undefined) {
            options.height = 400;
        }
        if (options.status === undefined) {
            options.status = "normal";
        }
        if (options.type === "systems") {
            button.innerHTML = document.getElementById("systemLog").innerHTML;
        } else {
            button.innerHTML = options.title;
        }
        button.onmousedown = ui.modal.move;
        button.ontouchstart = ui.modal.move;
        button.onblur  = function local_ui_modal_create_blur():void {
            button.onclick = null;
        };
        box.setAttribute("id", id);
        box.onmousedown = ui.modal.zTop;
        data.modals[id] = options;
        box.style.zIndex = data.zIndex.toString();
        box.setAttribute("class", "box");
        border.setAttribute("class", "border");
        body.setAttribute("class", "body");
        body.style.height = `${options.height / 10}em`;
        body.style.width = `${options.width / 10}em`;
        box.style.left = `${options.left / 10}em`;
        box.style.top = `${options.top / 10}em`;
        h2.appendChild(button);
        h2.setAttribute("class", "heading");
        border.appendChild(h2);
        if (Array.isArray(options.inputs) === true) {
            if (options.inputs.indexOf("close") > -1 || options.inputs.indexOf("maximize") > -1 || options.inputs.indexOf("minimize") > -1) {
                h2 = document.createElement("p");
                h2.setAttribute("class", "buttons");
                if (options.inputs.indexOf("minimize") > -1) {
                    button = document.createElement("button");
                    button.innerHTML = "🗕 <span>Minimize</span>";
                    button.setAttribute("class", "minimize");
                    button.onclick = ui.modal.minimize;
                    h2.appendChild(button);
                }
                if (options.inputs.indexOf("maximize") > -1) {
                    button = document.createElement("button");
                    button.innerHTML = "🗖 <span>Maximize</span>";
                    button.setAttribute("class", "maximize");
                    button.onclick = ui.modal.maximize;
                    h2.appendChild(button);
                }
                if (options.inputs.indexOf("close") > -1) {
                    button = document.createElement("button");
                    button.innerHTML = "🗙 <span>close</span>";
                    button.setAttribute("class", "close");
                    if (options.type === "systems") {
                        button.onclick = function local_ui_modal_create_systemsHide(event:MouseEvent):void {
                            let box:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
                            do {
                                box = <HTMLElement>box.parentNode;
                            } while (box !== document.documentElement && box.getAttribute("class") !== "box");
                            if (box.getAttribute("class") === "box") {
                                box.style.display = "none";
                                data.modals["systems-modal"].text_placeholder = data.modals["systems-modal"].status;
                                data.modals["systems-modal"].status = "hidden";
                            }
                            network.settings();
                        };
                        if (options.status === "hidden") {
                            box.style.display = "none";
                        }
                    } else {
                        button.onclick = ui.modal.close;
                    }
                    h2.appendChild(button);
                }
                border.appendChild(h2);
            }
            if (options.inputs.indexOf("text") > -1) {
                const label:HTMLElement = document.createElement("label"),
                    span:HTMLElement = document.createElement("span");
                span.innerHTML = "Text of file system address.";
                label.appendChild(span);
                extra = document.createElement("p");
                if (options.type === "fileNavigate") {
                    extra.style.paddingLeft = "5em";
                    button = document.createElement("button");
                    button.innerHTML = "▲<span>Parent directory</span>";
                    button.setAttribute("class", "parentDirectory");
                    button.onclick = ui.fs.parent;
                    extra.appendChild(button);
                }
                input = document.createElement("input");
                input.type = "text";
                input.spellcheck = false;
                if (options.text_event !== undefined) {
                    input.onblur = options.text_event;
                    input.onkeyup = options.text_event;
                }
                if (options.text_placeholder !== undefined) {
                    input.placeholder = options.text_placeholder;
                }
                if (options.text_value !== undefined) {
                    input.value = options.text_value;
                }
                extra.setAttribute("class", "header");
                label.appendChild(input);
                extra.appendChild(label);
                border.appendChild(extra);
            }
        }
        border.appendChild(body);
        if (options.resize !== false) {
            button = document.createElement("button");
            button.innerHTML = "resize box width and height";
            button.setAttribute("class", "corner-tl");
            button.onmousedown = ui.modal.resize;
            border.appendChild(button);
            button = document.createElement("button");
            button.innerHTML = "resize box width and height";
            button.setAttribute("class", "corner-tr");
            button.onmousedown = ui.modal.resize;
            border.appendChild(button);
            button = document.createElement("button");
            button.innerHTML = "resize box width and height";
            button.setAttribute("class", "corner-bl");
            button.onmousedown = ui.modal.resize;
            border.appendChild(button);
            button = document.createElement("button");
            button.innerHTML = "resize box width and height";
            button.setAttribute("class", "corner-br");
            button.onmousedown = ui.modal.resize;
            border.appendChild(button);
            button = document.createElement("button");
            button.innerHTML = "resize box height";
            button.setAttribute("class", "side-t");
            button.style.width = `${(options.width / 10) + 1}em`;
            button.onmousedown = ui.modal.resize;
            border.appendChild(button);
            button = document.createElement("button");
            button.innerHTML = "resize box width";
            button.setAttribute("class", "side-r");
            button.style.height = `${(options.height / 10) + 3}em`;
            button.onmousedown = ui.modal.resize;
            border.appendChild(button);
            button = document.createElement("button");
            button.innerHTML = "resize box height";
            button.setAttribute("class", "side-b");
            button.style.width = `${(options.width / 10) + 1}em`;
            button.onmousedown = ui.modal.resize;
            border.appendChild(button);
            button = document.createElement("button");
            button.innerHTML = "resize box width";
            button.setAttribute("class", "side-l");
            button.style.height = `${(options.height / 10) + 3}em`;
            button.onmousedown = ui.modal.resize;
            border.appendChild(button);
        }
        body.appendChild(options.content);
        if (options.type === "export" || options.type === "textPad") {
            body.style.overflow = "hidden";
        }
        if (Array.isArray(options.inputs) === true && (options.inputs.indexOf("cancel") > -1 || options.inputs.indexOf("confirm") > -1)) {
            extra = document.createElement("p");
            extra.setAttribute("class", "footer");
            if (options.inputs.indexOf("confirm") > -1) {
                button = document.createElement("button");
                button.innerHTML = "✓ Confirm";
                button.setAttribute("class", "confirm");
                if (options.type === "export") {
                    button.onclick = ui.modal.import;
                }
                extra.appendChild(button);
            }
            if (options.inputs.indexOf("cancel") > -1) {
                button = document.createElement("button");
                button.innerHTML = "🗙 Cancel";
                button.setAttribute("class", "cancel");
                button.onclick = ui.modal.close;
                extra.appendChild(button);
            }
            border.appendChild(extra);
        }
        box.appendChild(border);
        content.appendChild(box);
        network.settings();
        return box;
    };

    /* Creates an import/export modal */
    ui.modal.export = function local_ui_modal_export(event:MouseEvent):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            textArea:HTMLTextAreaElement = document.createElement("textarea");
        textArea.onblur = ui.modal.textSave;
        textArea.value = JSON.stringify(data);
        ui.modal.create({
            content: textArea,
            inputs: ["cancel", "close", "confirm", "maximize", "minimize"],
            single: true,
            title: element.innerHTML,
            type: "export"
        });
    };

    /* Modifies saved settings from an imported JSON string then reloads the page */
    ui.modal.import = function local_ui_modal_import(event:MouseEvent):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            dataString:string = JSON.stringify(data);
        let box:HTMLElement = element,
            textArea:HTMLTextAreaElement,
            button:HTMLButtonElement;
        do {
            box = <HTMLElement>box.parentNode;
        } while (box !== document.documentElement && box.getAttribute("class") !== "box");
        textArea = box.getElementsByTagName("textarea")[0];
        if (textArea.value !== dataString) {
            data = JSON.parse(textArea.value);
        }
        button = <HTMLButtonElement>document.getElementsByClassName("cancel")[0];
        button.click();
        if (textArea.value !== dataString) {
            network.settings();
            location.replace(location.href);
        }
    };

    /* The given modal consumes the entire view port of the content area */
    ui.modal.maximize = function local_ui_modal_maximize(event:Event):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            contentArea:HTMLElement = document.getElementById("content-area");
        let box:HTMLElement = element,
            body:HTMLElement,
            title:HTMLElement,
            id:string;
        do {
            box = <HTMLElement>box.parentNode;
        } while (box !== document.documentElement && box.getAttribute("class") !== "box");
        if (box === document.documentElement) {
            return;
        }
        id = box.getAttribute("id");
        body = box.getElementsByTagName("div")[1];
        title = <HTMLElement>box.getElementsByTagName("h2")[0];
        if (title !== undefined) {
            title = title.getElementsByTagName("button")[0];
        }
        if (data.modals[id].status === "maximized") {
            title.style.cursor = "move";
            title.onmousedown = ui.modal.move;
            data.modals[id].status = "normal";
            box.style.top = `${data.modals[id].top / 10}em`;
            box.style.left = `${data.modals[id].left / 10}em`;
            body.style.width = `${data.modals[id].width / 10}em`;
            body.style.height = `${data.modals[id].height / 10}em`;
        } else {
            data.modals[id].status = "maximized";
            title.style.cursor = "default";
            title.onmousedown = null;
            box.style.top = "0em";
            box.style.left = "0em";
            body.style.width = `${(contentArea.clientWidth - 20) / 10}em`;
            body.style.height = (function local_ui_modal_maximize_maxHeight():string {
                let height:number = contentArea.clientHeight,
                    footer:HTMLElement = <HTMLElement>box.getElementsByClassName("footer")[0],
                    header:HTMLElement = <HTMLElement>box.getElementsByClassName("header")[0];
                height = (height - title.clientHeight) - 27;
                if (footer !== undefined) {
                    height = height - footer.clientHeight;
                }
                if (header !== undefined) {
                    height = height - header.clientHeight;
                }
                return `${height / 10}em`;
            }());
        }
        network.settings();
    };

    /* Visually minimize a modal to the tray at the bottom of the content area */
    ui.modal.minimize = function local_ui_modal_minimize(event:Event):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
        let border:HTMLElement = element,
            box:HTMLElement,
            title:HTMLElement,
            id:string,
            children:NodeListOf<ChildNode>,
            child:HTMLElement,
            a:number = 1;
        do {
            border = <HTMLElement>border.parentNode;
        } while (border !== document.documentElement && border.getAttribute("class") !== "border");
        if (border === document.documentElement) {
            return;
        }
        box = <HTMLElement>border.parentNode;
        id = box.getAttribute("id");
        title = <HTMLElement>border.getElementsByTagName("h2")[0];
        title.getElementsByTagName("button")[0].onmousedown = ui.modal.move;
        children = border.childNodes;
        if (data.modals[id].status === "minimized") {
            const li:HTMLElement = <HTMLElement>box.parentNode,
                body:HTMLElement = <HTMLElement>border.getElementsByClassName("body")[0];
            do {
                child = <HTMLElement>children[a];
                child.style.display = "block";
                a = a + 1;
            } while (a < children.length);
            document.getElementById("tray").removeChild(li);
            li.removeChild(box);
            box.style.zIndex = data.modals[id].zIndex.toString();
            title.getElementsByTagName("button")[0].style.cursor = "move";
            content.appendChild(box);
            data.modals[id].status = "normal";
            box.style.top = `${data.modals[id].top / 10}em`;
            box.style.left = `${data.modals[id].left / 10}em`;
            body.style.width = `${data.modals[id].width / 10}em`;
            body.style.height = `${data.modals[id].height / 10}em`;
        } else {
            const li:HTMLLIElement = document.createElement("li");
            do {
                child = <HTMLElement>children[a];
                child.style.display = "none";
                a = a + 1;
            } while (a < children.length);
            box.style.zIndex = "0";
            box.parentNode.removeChild(box);
            title.getElementsByTagName("button")[0].style.cursor = "pointer";
            li.appendChild(box);
            document.getElementById("tray").appendChild(li);
            data.modals[id].status = "minimized";
        }
        network.settings();
    };

    /* Drag and drop interaction for modals */
    ui.modal.move = function local_ui_modal_move(event:Event):boolean {
        const x:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            heading:HTMLElement = <HTMLElement>x.parentNode,
            box:HTMLElement        = <HTMLElement>heading.parentNode.parentNode,
            settings:ui_modal = data.modals[box.getAttribute("id")],
            border:HTMLElement = box.getElementsByTagName("div")[0],
            minifyTest:boolean = (box.parentNode.nodeName === "li"),
            touch:boolean      = (event !== null && event.type === "touchstart"),
            mouseEvent = <MouseEvent>event,
            touchEvent = <TouchEvent>event,
            mouseX = (touch === true)
                ? 0
                : mouseEvent.clientX,
            mouseY = (touch === true)
                ? 0
                : mouseEvent.clientY,
            touchX = (touch === true)
                ? touchEvent.touches[0].clientX
                : 0,
            touchY = (touch === true)
                ? touchEvent.touches[0].clientY
                : 0,   
            drop       = function local_ui_modal_move_drop(e:Event):boolean {
                const headingWidth:number = box.getElementsByTagName("h2")[0].clientWidth;
                boxLeft = box.offsetLeft;
                boxTop  = box.offsetTop;
                if (touch === true) {
                    document.ontouchmove = null;
                    document.ontouchend  = null;
                } else {
                    document.onmousemove = null;
                    document.onmouseup   = null;
                }
                if (boxTop < 10) {
                    boxTop = 10;
                } else if (boxTop > (max - 40)) {
                    boxTop = max - 40;
                }
                if (boxLeft < ((headingWidth * -1) + 40)) {
                    boxLeft = (headingWidth * -1) + 40;
                }
                box.style.top = `${boxTop / 10}em`;
                box.style.left = `${boxLeft / 10}em`;
                border.style.opacity = "1";
                box.style.height   = "auto";
                settings.top = boxTop;
                settings.left = boxLeft;
                network.settings();
                e.preventDefault();
                return false;
            },
            boxMoveTouch    = function local_ui_modal_move_touch(f:TouchEvent):boolean {
                f.preventDefault();
                box.style.right = "auto";
                box.style.left      = `${(boxLeft + (f.touches[0].clientX - touchX)) / 10}em`;
                box.style.top       = `${(boxTop + (f.touches[0].clientY - touchY)) / 10}em`;
                document.ontouchend = drop;
                return false;
            },
            boxMoveClick = function local_ui_modal_move_click(f:MouseEvent):boolean {
                f.preventDefault();
                box.style.right = "auto";
                box.style.left     = `${(boxLeft + (f.clientX - mouseX)) / 10}em`;
                box.style.top      = `${(boxTop + (f.clientY - mouseY)) / 10}em`;
                document.onmouseup = drop;
                return false;
            };
        let boxLeft:number    = box.offsetLeft,
            boxTop:number     = box.offsetTop,
            max:number        = content.clientHeight;
        if (minifyTest === true) {
            const button:HTMLButtonElement = <HTMLButtonElement>box.getElementsByClassName("minimize")[0];
            button.click();
            return false;
        }
        event.preventDefault();
        border.style.opacity = ".5";
        //heading.style.top  = `${box.clientHeight / 20}0em`;
        box.style.height   = ".1em";
        if (touch === true) {
            document.ontouchmove  = boxMoveTouch;
            document.ontouchstart = null;
        } else {
            document.onmousemove = boxMoveClick;
            document.onmousedown = null;
        }
        // update settings
        return false;
    };

    /* Allows resizing of modals in 1 of 8 directions */
    ui.modal.resize = function local_ui_modal_resize(event:MouseEvent):void {
        let bodyWidth:number  = 0,
            bodyHeight:number = 0,
            computedHeight:number = 0,
            computedWidth:number = 0;
        const node:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            parent:HTMLElement     = <HTMLElement>node.parentNode,
            box:HTMLElement        = <HTMLElement>parent.parentNode,
            top:number = box.offsetTop,
            left:number = box.offsetLeft,
            body:HTMLDivElement       = box.getElementsByTagName("div")[1],
            offX:number = event.clientX,
            offY:number = event.clientY,
            mac:boolean        = (navigator.userAgent.indexOf("macintosh") > 0),
            direction:string = node.getAttribute("class").split("-")[1],
            offsetWidth:number    = (mac === true)
                ? 20
                : -16,
            offsetHeight:number    = (mac === true)
                ? 18
                : -20,
            drop       = function local_ui_modal_resize_drop():void {
                const settings:ui_modal = data.modals[box.getAttribute("id")];
                document.onmousemove = null;
                document.onmouseup = null;
                bodyWidth            = body.clientWidth;
                bodyHeight           = body.clientHeight;
                settings.width = bodyWidth - offsetWidth;
                settings.height = bodyHeight - offsetHeight;
                if (box.getAttribute("id") === "systems-modal") {
                    const tabs:HTMLElement = <HTMLElement>box.getElementsByClassName("tabs")[0];
                    tabs.style.width = `${body.clientWidth / 10}em`;
                }
                network.settings();
            },
            side:any    = {
                b: function local_ui_modal_resize_sizeB(f:MouseEvent):void {
                    computedHeight = (bodyHeight + ((f.clientY - offsetHeight) - offY)) / 10;
                    if (computedHeight > 10) {
                        body.style.height  = `${computedHeight}em`;
                    }
                    document.onmouseup = drop;
                },
                bl: function local_ui_modal_resize_sizeBL(f:MouseEvent):void {
                    computedWidth = left + (f.clientX - offX);
                    if (((bodyWidth - offsetWidth) + (left - computedWidth)) / 10 > 35) {
                        box.style.left = `${computedWidth / 10}em`;
                        body.style.width  = `${((bodyWidth - offsetWidth) + (left - computedWidth)) / 10}em`;
                    }
                    computedHeight = (bodyHeight + ((f.clientY - offsetHeight) - offY)) / 10;
                    if (computedHeight > 10) {
                        body.style.height  = `${computedHeight}em`;
                    }
                    document.onmouseup = drop;
                },
                br: function local_ui_modal_resize_sizeBR(f:MouseEvent):void {
                    computedWidth = (bodyWidth + ((f.clientX - offsetWidth) - offX)) / 10;
                    if (computedWidth > 35) {
                        body.style.width = `${computedWidth}em`;
                    }
                    computedHeight = (bodyHeight + ((f.clientY - offsetHeight) - offY)) / 10;
                    if (computedHeight > 10) {
                        body.style.height  = `${computedHeight}em`;
                    }
                    document.onmouseup = drop;
                },
                l: function local_ui_modal_resize_sizeL(f:MouseEvent):void {
                    computedWidth = left + (f.clientX - offX);
                    if (((bodyWidth - offsetWidth) + (left - computedWidth)) / 10 > 35) {
                        box.style.left = `${computedWidth / 10}em`;
                        body.style.width  = `${((bodyWidth - offsetWidth) + (left - computedWidth)) / 10}em`;
                    }
                    document.onmouseup = drop;
                },
                r: function local_ui_modal_resize_sizeR(f:MouseEvent):void {
                    computedWidth = (bodyWidth + ((f.clientX - offsetWidth) - offX)) / 10;
                    if (computedWidth > 35) {
                        body.style.width = `${computedWidth}em`;
                    }
                    document.onmouseup = drop;
                },
                t: function local_ui_modal_resize_sizeT(f:MouseEvent):void {
                    computedHeight = top + (f.clientY - offY);
                    if (((bodyHeight - offsetHeight) + (top - computedHeight)) / 10 > 10) {
                        box.style.top = `${computedHeight / 10}em`;
                        body.style.height  = `${((bodyHeight - offsetHeight) + (top - computedHeight)) / 10}em`;
                    }
                    document.onmouseup = drop;
                },
                tl: function local_ui_modal_resize_sizeTL(f:MouseEvent):void {
                    computedHeight = top + (f.clientY - offY);
                    if (((bodyHeight - offsetHeight) + (top - computedHeight)) / 10 > 10) {
                        box.style.top = `${computedHeight / 10}em`;
                        body.style.height  = `${((bodyHeight - offsetHeight) + (top - computedHeight)) / 10}em`;
                    }
                    computedWidth = left + (f.clientX - offX);
                    if (((bodyWidth - offsetWidth) + (left - computedWidth)) / 10 > 35) {
                        box.style.left = `${computedWidth / 10}em`;
                        body.style.width  = `${((bodyWidth - offsetWidth) + (left - computedWidth)) / 10}em`;
                    }
                    document.onmouseup = drop;
                },
                tr: function local_ui_modal_resize_sizeTR(f:MouseEvent):void {
                    computedHeight = top + (f.clientY - offY);
                    if (((bodyHeight - offsetHeight) + (top - computedHeight)) / 10 > 10) {
                        box.style.top = `${computedHeight / 10}em`;
                        body.style.height  = `${((bodyHeight - offsetHeight) + (top - computedHeight)) / 10}em`;
                    }
                    computedWidth = (bodyWidth + ((f.clientX - offsetWidth) - offX)) / 10;
                    if (computedWidth > 35) {
                        body.style.width = `${computedWidth}em`;
                    }
                    document.onmouseup = drop;
                }
            };
        bodyWidth  = body.clientWidth;
        bodyHeight = body.clientHeight;
        document.onmousemove = side[direction];
        document.onmousedown = null;
    };

    /* Displays a list of shared items for each user */
    ui.modal.shares = function local_ui_modal_shares(event:MouseEvent, user?:string, configuration?:ui_modal):void {
        const userKeys:string[] = Object.keys(data.shares),
            keyLength:number = userKeys.length,
            fileNavigate = function local_ui_modal_shares_fileNavigate(event:MouseEvent):void {
                const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
                    path:string = element.innerHTML,
                    type:string = element.getAttribute("class"),
                    slash:string = (path.indexOf("/") > -1 && (path.indexOf("\\") < 0 || path.indexOf("\\") > path.indexOf("/")))
                        ? "/"
                        : "\\";
                let address:string;
                if (type === "file" || type === "link") {
                    const dirs:string[] = path.replace(/\\/g, "/").split("/");
                    dirs.pop();
                    address = dirs.join(slash);
                } else {
                    address = path;
                }
                ui.fs.navigate(event, address);
            };
        let users:HTMLElement,
            eachUser:HTMLElement;
        if (typeof user === "string" && user.indexOf("@localhost") === user.length - 10) {
            user = "localhost";
        }
        if (keyLength === 1 && data.shares.localhost.length === 0) {
            eachUser = document.createElement("h3");
            eachUser.innerHTML = "There are no shares at this time.";
            ui.modal.create({
                content: eachUser,
                inputs: ["close", "maximize", "minimize"],
                title: "All Shares",
                type: "shares",
                width: 800
            });
        } else {
            let userName:HTMLElement,
                itemList:HTMLElement,
                item:HTMLElement,
                button:HTMLElement,
                a:number = 0,
                b:number = 0,
                shareLength:number,
                title:string;
            if (user === "") {
                title = "All Shares";
                users = document.createElement("ul");
                users.setAttribute("class", "userList");
                do {
                    eachUser = document.createElement("li");
                    userName = document.createElement("h3");
                    userName.setAttribute("class", "user");
                    userName.innerHTML = userKeys[a];
                    eachUser.appendChild(userName);
                    shareLength = data.shares[userKeys[a]].length;
                    if (shareLength > 0) {
                        b = 0;
                        itemList = document.createElement("ul");
                        do {
                            item = document.createElement("li");
                            button = document.createElement("button");
                            button.setAttribute("class", data.shares[userKeys[a]][b][1]);
                            button.innerHTML = data.shares[userKeys[a]][b][0];
                            if (data.shares[userKeys[a]][b][1] === "directory" || data.shares[userKeys[a]][b][1] === "file" || data.shares[userKeys[a]][b][1] === "link") {
                                button.onclick = fileNavigate;
                            }
                            item.appendChild(button);
                            itemList.appendChild(item);
                            b = b + 1;
                        } while (b < shareLength);
                    } else {
                        itemList = document.createElement("p");
                        itemList.innerHTML = "This user is not sharing anything.";
                    }
                    eachUser.appendChild(itemList);
                    users.appendChild(eachUser);
                    a = a + 1;
                } while (a < keyLength);
            } else {
                title = `Shares for user - ${user}`;
                shareLength = data.shares[user].length;
                users = document.createElement("div");
                users.setAttribute("class", "userList");
                userName = document.createElement("h3");
                userName.setAttribute("class", "user");
                userName.innerHTML = user;
                if (shareLength === 0) {
                    itemList = document.createElement("p");
                    itemList.innerHTML = `User ${user} is not sharing anything.`;
                } else {
                    itemList = document.createElement("ul");
                    do {
                        item = document.createElement("li");
                        button = document.createElement("button");
                        button.setAttribute("class", data.shares[userKeys[a]][b][1]);
                        button.innerHTML = data.shares[userKeys[a]][b][0];
                        if (data.shares[userKeys[a]][b][1] === "directory" || data.shares[userKeys[a]][b][1] === "file" || data.shares[userKeys[a]][b][1] === "link") {
                            button.onclick = fileNavigate;
                        }
                        item.appendChild(button);
                        itemList.appendChild(item);
                        b = b + 1;
                    } while (b < shareLength);
                }
                users.appendChild(userName);
                users.appendChild(itemList);
            }
            if (configuration === undefined || configuration === null) {
                configuration = {
                    content: users,
                    title: title,
                    type: "shares",
                    width: 800
                };
            } else {
                configuration.content = users;
                configuration.title = title;
                configuration.type = "shares";
            }
            configuration.text_value = user;
            configuration.inputs = ["close", "maximize", "minimize"];
            ui.modal.create(configuration);
        }
    };

    /* Shows the system log modal in the correct visual status */
    ui.modal.systems = function local_ui_modal_systems() {
        document.getElementById("systems-modal").style.display = "block";
        if (data.modals["systems-modal"].text_placeholder === "maximized" || data.modals["systems-modal"].text_placeholder === "normal") {
            data.modals["systems-modal"].status = data.modals["systems-modal"].text_placeholder;
        } else {
            data.modals["systems-modal"].status = "normal";
        }
    };

    /* Creates a textPad modal */
    ui.modal.textPad = function local_ui_modal_textPad(event:MouseEvent, value?:string, title?:string):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            titleText:string = (typeof title === "string")
                ? title
                : element.innerHTML,
            textArea:HTMLTextAreaElement = document.createElement("textarea");
        if (typeof value === "string") {
            textArea.value = value;
        }
        textArea.onblur = ui.modal.textSave;
        if (titleText.indexOf("Base64 - ") === 0) {
            textArea.style.whiteSpace = "normal";
        }
        ui.modal.create({
            content: textArea,
            inputs: ["close", "maximize", "minimize"],
            title: titleText,
            type: "textPad",
            width: 800
        });
    };

    /* Pushes the text content of a textPad modal into settings so that it is saved */
    ui.modal.textSave = function local_ui_modal_textSave(event:MouseEvent):void {
        const element:HTMLTextAreaElement = <HTMLTextAreaElement>event.srcElement || <HTMLTextAreaElement>event.target;
        let box:HTMLElement = element;
            do {
                box = <HTMLElement>box.parentNode;
            } while (box !== document.documentElement && box.getAttribute("class") !== "box");
        data.modals[box.getAttribute("id")].text_value = element.value;
        network.settings();
    };

    /* Manages z-index of modals and moves a modal to the top on interaction */
    ui.modal.zTop     = function local_ui_modal_zTop(event:MouseEvent):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            parent:HTMLElement = <HTMLElement>element.parentNode,
            grandParent:HTMLElement = <HTMLElement>parent.parentNode;
        let box:HTMLElement = element;
        if ((parent.getAttribute("class") === "fileList" || grandParent.getAttribute("class") === "fileList") && characterKey === "shift") {
            event.preventDefault();
        }
        if (element.getAttribute("class") !== "box") {
            do {
                box = <HTMLElement>box.parentNode;
            } while (box.getAttribute("class") !== "box" && box !== document.documentElement);
        }
        data.zIndex = data.zIndex + 1;
        data.modals[box.getAttribute("id")].zIndex = data.zIndex;
        box.style.zIndex = data.zIndex.toString();
    };

    /* Show/hide of stack trace information for error messages in the system log */
    ui.systems.expand = function local_ui_systems_expand(event:MouseEvent):void {
        const button:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            li:HTMLElement = <HTMLElement>button.parentNode,
            ul:HTMLElement = li.getElementsByTagName("ul")[0],
            modal:HTMLElement = document.getElementById("systems-modal"),
            tabs:HTMLElement = <HTMLElement>modal.getElementsByClassName("tabs")[0];
        if (button.innerHTML.indexOf("+") === 0) {
            ul.style.display = "block";
            button.innerHTML = "-<span>Collapse stack trace</span>";
        } else {
            ul.style.display = "none";
            button.innerHTML = "+<span>Expand stack trace</span>";
        }
        tabs.style.width = `${modal.getElementsByClassName("body")[0].scrollWidth / 10}em`;
    };

    /* Processes messages into the system log modal */
    ui.systems.message = function local_ui_systems_message(type:messageType, content:string, timeStore?:string):void {
        const dateString:string = ui.util.dateFormat(new Date()),
            li:HTMLElement = document.createElement("li"),
            span:HTMLElement = document.createElement("span"),
            text:Text = document.createTextNode("");
        let list:HTMLElement,
            ul:HTMLElement;
        if (loadTest === true) {
            span.innerHTML = timeStore;
        } else {
            span.innerHTML = `[${dateString}]`;
        }
        content = content.replace(/(\d+m)?\[\d+m/g, "");
        if (type === "errors") {
            const messageContent:messageError = JSON.parse(content),
                button:HTMLButtonElement = document.createElement("button");
            let stackItem:HTMLElement;
            ul = document.createElement("ul");
            ul.setAttribute("class", "stack");
            button.setAttribute("class", "expansion");
            button.innerHTML = "+<span>Expand this folder</span>";
            button.onclick = ui.systems.expand;
            messageContent.stack.forEach(function local_ui_systems_message_stack(value:string) {
                if (value.replace(/\s+/, "") !== "") {
                    stackItem = document.createElement("li");
                    stackItem.innerHTML = value;
                    ul.appendChild(stackItem);
                }
            });
            li.appendChild(button);
            text.textContent = messageContent.error.replace(/^\s*Error:\s*/, "");
            if (loadTest === false) {
                messages.errors.push([`[${dateString}]`, messageContent.error.replace(/^\s*Error:\s*/, ""), messageContent.stack]);
            }
        } else {
            text.textContent = content;
            if (loadTest === false) {
                messages[type].push([`[${dateString}]`, content]);
            }
        }
        li.appendChild(span);
        list = document.getElementById(`system-${type}`);
        if (loadTest === false && list.childNodes.length > 49) {
            list.removeChild(list.getElementsByTagName("li")[0]);
            messages[type].splice(0, 1);
        }
        li.appendChild(text);
        if (type === "errors") {
            li.appendChild(ul);
        }
        list.appendChild(li);
        network.messages();
    };

    /* Toggles tabs in the systems log modal */
    ui.systems.tabs = function local_ui_systems_tabs(event:MouseEvent):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            parent:HTMLElement = <HTMLElement>element.parentNode.parentNode,
            className:string = element.getAttribute("class").replace(" active", "");
        if (className === "status") {
            element.setAttribute("class", "status active");
            parent.getElementsByClassName("users")[0].setAttribute("class", "users");
            parent.getElementsByClassName("errors")[0].setAttribute("class", "errors");
            document.getElementById("system-status").setAttribute("class", "messageList active");
            document.getElementById("system-users").setAttribute("class", "messageList");
            document.getElementById("system-errors").setAttribute("class", "messageList");
        } else if (className === "users") {
            element.setAttribute("class", "users active");
            parent.getElementsByClassName("status")[0].setAttribute("class", "status");
            parent.getElementsByClassName("errors")[0].setAttribute("class", "errors");
            document.getElementById("system-status").setAttribute("class", "messageList");
            document.getElementById("system-users").setAttribute("class", "messageList active");
            document.getElementById("system-errors").setAttribute("class", "messageList");
        } else if (className === "errors") {
            element.setAttribute("class", "errors active");
            parent.getElementsByClassName("status")[0].setAttribute("class", "status");
            parent.getElementsByClassName("users")[0].setAttribute("class", "users");
            document.getElementById("system-status").setAttribute("class", "messageList");
            document.getElementById("system-users").setAttribute("class", "messageList");
            document.getElementById("system-errors").setAttribute("class", "messageList active");
        }
        data.modals["systems-modal"].text_value = className;
        network.settings();
    };

    /* Adds users to the user bar */
    ui.util.addUser = function local_ui_util_addUser(userName:string, ip:string):void {
        const li:HTMLLIElement = document.createElement("li"),
            button:HTMLElement = document.createElement("button");
        button.innerHTML = `${userName}@${ip}`;
        if (ip === "localhost") {
            button.setAttribute("class", "local");
        } else {
            button.setAttribute("class", "offline");
            data.shares[userName] = [];
        }
        button.onclick = function local_ui_util_addUser(event:MouseEvent) {
            ui.modal.shares(event, button.innerHTML, null);
        };
        li.appendChild(button);
        document.getElementById("users").getElementsByTagName("ul")[0].appendChild(li);
    };

    /* Transforms numbers into a string of 3 digit comma separated groups */
    ui.util.commas = function local_ui_util_commas(number:number):string {
        const str:string = String(number);
        let arr:string[] = [],
            a:number   = str.length;
        if (a < 4) {
            return str;
        }
        arr = String(number).split("");
        a   = arr.length;
        do {
            a      = a - 3;
            arr[a] = "," + arr[a];
        } while (a > 3);
        return arr.join("");
    };

    /* Converts a date object into US Army date format */
    ui.util.dateFormat = function local_ui_util_dateFormat(date:Date):string {
        const dateData:string[] = [
                date.getFullYear().toString(),
                date.getMonth().toString(),
                date.getDate().toString(),
                date.getHours().toString(),
                date.getMinutes().toString(),
                date.getSeconds().toString(),
                date.getMilliseconds().toString()
            ],
            output:string[] = [];
        let month:string;
        if (dateData[2].length === 1) {
            dateData[2] = `0${dateData[2]}`;
        }
        if (dateData[3].length === 1) {
            dateData[3] = `0${dateData[3]}`;
        }
        if (dateData[4].length === 1) {
            dateData[4] = `0${dateData[4]}`;
        }
        if (dateData[5].length === 1) {
            dateData[5] = `0${dateData[5]}`;
        }
        if (dateData[6].length === 1) {
            dateData[6] = `00${dateData[6]}`;
        } else if (dateData[6].length === 2) {
            dateData[6] = `0${dateData[6]}`;
        }
        if (dateData[1] === "0") {
            month = "JAN";
        } else if (dateData[1] === "1") {
            month = "FEB";
        } else if (dateData[1] === "2") {
            month = "MAR";
        } else if (dateData[1] === "3") {
            month = "APR";
        } else if (dateData[1] === "4") {
            month = "MAY";
        } else if (dateData[1] === "5") {
            month = "JUN";
        } else if (dateData[1] === "6") {
            month = "JUL";
        } else if (dateData[1] === "7") {
            month = "AUG";
        } else if (dateData[1] === "8") {
            month = "SEP";
        } else if (dateData[1] === "9") {
            month = "OCT";
        } else if (dateData[1] === "10") {
            month = "NOV";
        } else if (dateData[1] === "11") {
            month = "DEC";
        }
        output.push(dateData[2]);
        output.push(month);
        output.push(`${dateData[0]},`);
        output.push(`${dateData[3]}:${dateData[4]}:${dateData[5]}.${dateData[6]}`);
        return output.join(" ");
    };

    /* Create a div element with a spinner and class name of 'delay' */
    ui.util.delay = function local_ui_util_delay():HTMLElement {
        const div:HTMLElement = document.createElement("div"),
            //cspell:disable
            //delayCircles:string = `<svg viewBox="0 0 57 57" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g transform="translate(1 1)" stroke-width="2"><circle cx="5" cy="50" r="5"><animate attributeName="cy" begin="0s" dur="2.2s" values="50;5;50;50" calcMode="linear" repeatCount="indefinite"/><animate attributeName="cx" begin="0s" dur="2.2s" values="5;27;49;5" calcMode="linear" repeatCount="indefinite"/></circle><circle cx="27" cy="5" r="5"><animate attributeName="cy" begin="0s" dur="2.2s" from="5" to="5" values="5;50;50;5" calcMode="linear" repeatCount="indefinite"/><animate attributeName="cx" begin="0s" dur="2.2s" from="27" to="27" values="27;49;5;27" calcMode="linear" repeatCount="indefinite"/></circle><circle cx="49" cy="50" r="5"><animate attributeName="cy" begin="0s" dur="2.2s" values="50;50;5;50" calcMode="linear" repeatCount="indefinite"/><animate attributeName="cx" from="49" to="49" begin="0s" dur="2.2s" values="49;5;27;49" calcMode="linear" repeatCount="indefinite"/></circle></g></g></svg>`,
            delayPulse:string = `<svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd" stroke-width="2"><circle cx="22" cy="22" r="1"><animate attributeName="r" begin="0s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/><animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/></circle><circle cx="22" cy="22" r="1"><animate attributeName="r" begin="-0.9s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/><animate attributeName="stroke-opacity" begin="-0.9s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/></circle></g></svg>`,
            //cspell:enable
            text:string = "<p>Waiting on data.  Please stand by.</p>";
        div.setAttribute("class", "delay");
        div.innerHTML = delayPulse + text;
        return div;
    };

    /* Resizes the interactive area to fit the browser viewport */
    ui.util.fixHeight = function local_ui_util_fixHeight():void {
        const height:number   = window.innerHeight || document.getElementsByTagName("body")[0].clientHeight;
        content.style.height = `${(height - 51) / 10}em`;
        document.getElementById("users").style.height = `${(height - 102) / 10}em`;
    };

    /* Build a single file system object from data */
    ui.util.fsObject = function local_ui_util_fsObject(item:directoryItem, extraClass:string):HTMLElement {
        const driveLetter = function local_ui_util_fsObject_driveLetter(drive:string):string {
                return drive.replace("\\\\", "\\");
            },
            li:HTMLElement = document.createElement("li"),
            label:HTMLLabelElement = document.createElement("label"),
            text:HTMLElement = document.createElement("label"),
            input:HTMLInputElement = document.createElement("input");
        let span:HTMLElement,
            plural:string;
        if (extraClass.replace(/\s+/, "") !== "") {
            li.setAttribute("class", `${item[1]} ${extraClass}`);
        } else {
            li.setAttribute("class", item[1]);
        }
        input.type = "checkbox";
        input.checked = false;
        label.innerHTML = "Selected";
        label.appendChild(input);
        label.setAttribute("class", "selection");
        text.innerHTML = item[0].replace(/^\w:\\\\/, driveLetter);
        text.oncontextmenu = ui.context.menu;
        text.onclick = ui.fs.select;
        li.appendChild(text);
        if (item[1] === "file") {
            span = document.createElement("span");
            if (item[4].size === 1) {
                plural = "";
            } else {
                plural = "s";
            }
            span.textContent = `file - ${ui.util.commas(item[4].size)} byte${plural}`;
        } else if (item[1] === "directory") {
            if (item[3] > 0) {
                const button = document.createElement("button");
                button.setAttribute("class", "expansion");
                button.innerHTML = "+<span>Expand this folder</span>";
                button.onclick = ui.fs.expand;
                li.insertBefore(button, li.firstChild);
            }
            span = document.createElement("span");
            if (item[3] === 1) {
                plural = "";
            } else {
                plural = "s";
            }
            span.textContent = `directory - ${ui.util.commas(item[3])} item${plural}`;
            li.ondblclick = ui.fs.directory;
        } else {
            span = document.createElement("span");
            if (item[1] === "link") {
                span.textContent = "symbolic link";
            } else {
                span.textContent = item[1];
            }
        }
        span.onclick = ui.fs.select;
        span.oncontextmenu = ui.context.menu;
        li.appendChild(span);
        li.oncontextmenu = ui.context.menu;
        li.appendChild(label);
        li.onclick = ui.fs.select;
        return li;
    };

    /* Interaction from the button on the login page */
    ui.util.login = function local_ui_util_login(event:KeyboardEvent):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            login:HTMLElement = document.getElementById("login"),
            input:HTMLInputElement = login.getElementsByTagName("input")[0],
            button:HTMLElement = login.getElementsByTagName("button")[0];
        if (element === button || (event.type === "keyup" && event.keyCode === 13)) {
            if (input.value.replace(/\s+/, "") === "") {
                input.focus();
            } else {
                data.name = input.value;
                ui.util.addUser(input.value, "localhost");
                document.getElementsByTagName("body")[0].removeAttribute("class");
            }
        }
    };

    /* Show/hide for the primary application menu that hangs off the title bar */
    ui.util.menu = function local_ui_util_menu():void {
        const menu:HTMLElement = document.getElementById("menu"),
            move = function local_ui_util_menu_move(event:MouseEvent):void {
                const menu:HTMLElement = document.getElementById("menu");
                if (event.clientX > menu.clientWidth || event.clientY > menu.clientHeight + 51) {
                    menu.style.display = "none";
                    document.onmousemove = null;
                }
            };
        menu.style.display = "block";
        document.onmousemove = move;
    };

    /* Round data sizes to human readable powers of 1024 */
    ui.util.prettyBytes = function local_ui_util_prettyBytes(an_integer:number):string {
        //find the string length of input and divide into triplets
        let output:string = "",
            length:number  = an_integer
                .toString()
                .length;
        const triples:number = (function local_ui_util_prettyBytes_triples():number {
                if (length < 22) {
                    return Math.floor((length - 1) / 3);
                }
                //it seems the maximum supported length of integer is 22
                return 8;
            }()),
            //each triplet is worth an exponent of 1024 (2 ^ 10)
            power:number   = (function local_ui_util_prettyBytes_power():number {
                let a = triples - 1,
                    b = 1024;
                if (triples === 0) {
                    return 0;
                }
                if (triples === 1) {
                    return 1024;
                }
                do {
                    b = b * 1024;
                    a = a - 1;
                } while (a > 0);
                return b;
            }()),
            //kilobytes, megabytes, and so forth...
            unit    = [
                "",
                "KB",
                "MB",
                "GB",
                "TB",
                "PB",
                "EB",
                "ZB",
                "YB"
            ];

        if (typeof an_integer !== "number" || Number.isNaN(an_integer) === true || an_integer < 0 || an_integer % 1 > 0) {
            //input not a positive integer
            output = "0.0B";
        } else if (triples === 0) {
            //input less than 1000
            output = `${an_integer}B`;
        } else {
            //for input greater than 999
            length = Math.floor((an_integer / power) * 100) / 100;
            output = length.toFixed(1) + unit[triples];
        }
        return output;
    };

    /* Gather the selected addresses and types of file system artifacts in a fileNavigator modal */
    ui.util.selectedAddresses = function local_ui_util_selectedAddresses(element:HTMLElement):[string, string][] {
        const output:[string, string][] = [];
        let a:number = 0,
            length:number = 0,
            itemList:HTMLCollectionOf<HTMLElement>,
            addressItem:HTMLElement,
            box:HTMLElement = element;
        if (box.getAttribute("class") !== "box") {
            do {
                box = <HTMLElement>box.parentNode;
            } while (box !== document.documentElement && box.getAttribute("class") !== "box");
        }
        itemList = box.getElementsByClassName("fileList")[0].getElementsByTagName("li");
        length = itemList.length;
        do {
            if (itemList[a].getElementsByTagName("input")[0].checked === true) {
                addressItem = (itemList[a].firstChild.nodeName === "button")
                    ? <HTMLElement>itemList[a].firstChild.nextSibling
                    : <HTMLElement>itemList[a].firstChild;
                output.push([addressItem.innerHTML, itemList[a].getAttribute("class").replace(" selected", "")]);
            }
            a = a + 1;
        } while (a < length);
        if (output.length > 0) {
            return output;
        }
        output.push([element.getElementsByTagName("label")[0].innerHTML, element.getAttribute("class")]);
        return output;
    };

    /* Remove selections of file system artifacts in a given fileNavigator modal */
    ui.util.selectNone = function local_ui_util_selectNone(element:HTMLElement):void {
        let a:number = 0,
            inputLength:number,
            li:HTMLCollectionOf<HTMLElement>,
            inputs:HTMLCollectionOf<HTMLInputElement>,
            box:HTMLElement = element,
            fileList:HTMLElement;
        if (box.getAttribute("class") !== "box") {
            do {
                box = <HTMLElement>box.parentNode;
            } while (box !== document.documentElement && box.getAttribute("class") !== "box");
        }
        fileList = <HTMLElement>box.getElementsByClassName("fileList")[0];
        inputs = fileList.getElementsByTagName("input");
        li = fileList.getElementsByTagName("li");
        inputLength = inputs.length;
        do {
            if (inputs[a].type === "checkbox") {
                inputs[a].checked = false;
                li[a].setAttribute("class", li[a].getAttribute("class").replace(" selected", ""));
            }
            a = a + 1;
        } while (a < inputLength);
    };

    /* Handle Web Socket responses */
    ws.onmessage = function local_socketMessage(event:SocketEvent):void {console.log(event.data);
        if (event.data === "reload") {
            location.reload();
        } else if (event.data.indexOf("error-") === 0) {
            const data:string = event.data.slice(6),
                modal:HTMLElement = document.getElementById("systems-modal"),
                tabs:HTMLElement = <HTMLElement>modal.getElementsByClassName("tabs")[0];
            ui.systems.message("errors", data, "websocket");
            if (modal.clientWidth > 0) {
                tabs.style.width = `${modal.getElementsByClassName("body")[0].scrollWidth / 10}em`;
            }
        } else if (event.data.indexOf("fsUpdate-") === 0) {
            const value:string = event.data.slice(9).replace(/(\\|\/)+$/, "").replace(/\\\\/g, "\\"),
                modalKeys:string[] = Object.keys(data.modals),
                keyLength:number = modalKeys.length;
            let a:number = 0;
            do {
                if (data.modals[modalKeys[a]].type === "fileNavigate" && data.modals[modalKeys[a]].text_value === value) {
                    const body:HTMLElement = <HTMLElement>document.getElementById(data.modals[modalKeys[a]].id).getElementsByClassName("body")[0];
                    network.fs({
                        agent: "self",
                        callback: function local_socketMessage_updateCallback(files:HTMLElement):void {
                            body.innerHTML = "";
                            body.appendChild(files);
                        },
                        depth: 2,
                        element: body,
                        location: value,
                        watch: "no"
                    });
                }
                a = a + 1;
            } while (a < keyLength);
        }
    };
    ws.onclose = function local_socketClose():void {
        const title:HTMLElement = <HTMLElement>document.getElementsByClassName("title")[0];
        title.style.background = "#ff6";
        title.getElementsByTagName("h1")[0].innerHTML = "Local service terminated.";
    };

    ui.util.fixHeight();
    window.onresize = ui.util.fixHeight;

    /* Restore state and assign events */
    (function local_load():void {
        const systems:HTMLElement = (function local_systems():HTMLElement {
            const systemsElement:HTMLElement = document.createElement("div");
            let ul:HTMLElement = document.createElement("ul"),
                li:HTMLElement = document.createElement("li"),
                button:HTMLButtonElement = document.createElement("button");
            ul.setAttribute("class", "tabs");
            button.innerHTML = "⎔ System";
            button.setAttribute("class", "status active");
            button.onclick = ui.systems.tabs;
            li.appendChild(button);
            ul.appendChild(li);
            li = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "⎋ Users";
            button.setAttribute("class", "users");
            button.onclick = ui.systems.tabs;
            li.appendChild(button);
            ul.appendChild(li);
            li = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "⌁ Errors";
            button.setAttribute("class", "errors");
            button.onclick = ui.systems.tabs;
            li.appendChild(button);
            ul.appendChild(li);
            systemsElement.appendChild(ul);
            ul = document.createElement("ul");
            ul.setAttribute("id", "system-status");
            ul.setAttribute("class", "messageList active");
            systemsElement.appendChild(ul);
            ul = document.createElement("ul");
            ul.setAttribute("id", "system-users");
            ul.setAttribute("class", "messageList");
            systemsElement.appendChild(ul);
            ul = document.createElement("ul");
            ul.setAttribute("id", "system-errors");
            ul.setAttribute("class", "messageList");
            systemsElement.appendChild(ul);
            return systemsElement;
        }());

        // getNodesByType
        (function local_nodes():void {
            const getNodesByType = function local_nodes_getNodesByType(typeValue:string|number):Node[] {
                    "use strict";
                    let types:number     = 0;
                    const valueTest:string = (typeof typeValue === "string") ? typeValue.toUpperCase() : "",
                        root:HTMLElement = (this === document)
                            ? document.documentElement
                            : this;
        
                    // Normalize string input for case insensitivity.
                    if (typeof typeValue === "string") {
                        typeValue = typeValue.toLowerCase();
                    }
        
                    // If input is a string and supported standard value
                    // associate to the standard numeric type
                    if (typeValue === "all") {
                        types = 0;
                    } else if (typeValue === "element_node") {
                        types = 1;
                    } else if (typeValue === "attribute_node") {
                        types = 2;
                    } else if (typeValue === "text_node") {
                        types = 3;
                    } else if (typeValue === "cdata_section_node") {
                        types = 4;
                    } else if (typeValue === "entity_reference_node") {
                        types = 5;
                    } else if (typeValue === "entity_node") {
                        types = 6;
                    } else if (typeValue === "processing_instruction_node") {
                        types = 7;
                    } else if (typeValue === "comment_node") {
                        types = 8;
                    } else if (typeValue === "document_node") {
                        types = 9;
                    } else if (typeValue === "document_type_node") {
                        types = 10;
                    } else if (typeValue === "document_fragment_node") {
                        types = 11;
                    } else if (typeValue === "notation_node") {
                        types = 12;
                    }
        
                    // If input is type string but the value is a supported number
                    if (isNaN(Number(valueTest)) === false && (valueTest.length === 1 || valueTest === "10" || valueTest === "11" || valueTest === "12")) {
                        types = Number(valueTest);
                    }
        
                    // If input is a supported number
                    if (valueTest === "" && (typeValue === 0 || typeValue === 1 || typeValue === 2 || typeValue === 3 || typeValue === 4 || typeValue === 5 || typeValue === 6 || typeValue === 7 || typeValue === 8 || typeValue === 9 || typeValue === 10 || typeValue === 11 || typeValue === 12)) {
                        types = typeValue;
                    }
        
                    // A handy dandy function to trap all the DOM walking
                    return (function local_nodes_getNodesByType_walking():Node[] {
                        var output:Node[] = [],
                            child  = function local_nodes_getNodesByType_walking_child(x:HTMLElement):void {
                                const children:NodeListOf<ChildNode> = x.childNodes;
                                let a:NamedNodeMap    = x.attributes,
                                    b:number    = a.length,
                                    c:number    = 0;
                                // Special functionality for attribute types.
                                if (b > 0 && (types === 2 || types === 0)) {
                                    do {
                                        output.push(a[c]);
                                        c = c + 1;
                                    } while (c < b);
                                }
                                b = children.length;
                                c = 0;
                                if (b > 0) {
                                    do {
                                        if (children[c].nodeType === types || types === 0) {
                                            output.push(<HTMLElement>children[c]);
                                        }
                                        if (children[c].nodeType === 1) {
                                            //recursion magic
                                            local_nodes_getNodesByType_walking_child(<HTMLElement>children[c]);
                                        }
                                        c = c + 1;
                                    } while (c < b);
                                }
                            };
                        child(root);
                        return output;
                    }());
                },
                getElementsByAttribute = function local_nodes_getElementsByAttribute(name:string, value:string):Element[] {
                    const attrs:Attr[] = this.getNodesByType(2),
                        out:Element[]   = [];
                    if (typeof name !== "string") {
                        name = "";
                    }
                    if (typeof value !== "string") {
                        value = "";
                    }
                    attrs.forEach(function local_nodes_getElementsByAttribute_loop(item) {
                        if (item.name === name || name === "") {
                            if (item.value === value || value === "") {
                                out.push(item.ownerElement);
                            }
                        }
                    });
                    return out;
                };
        
            // Create a document method
            document.getNodesByType         = getNodesByType;
            document.getElementsByAttribute = getElementsByAttribute;
        
            (function local_nodes_addToExistingElements() {
                var el = document.getNodesByType(1);
                el.forEach(function local_nodes_addToExistingElements_loop(item) {
                    item.getNodesByType         = getNodesByType;
                    item.getElementsByAttribute = getElementsByAttribute;
                });
            }());
            // Add this code as a method onto each DOM element
        
            // Ensure dynamically created elements get this method too
            Element.prototype.getNodesByType         = getNodesByType;
            Element.prototype.getElementsByAttribute = getElementsByAttribute;
        
        }());

        // restore state
        (function local_restore():void {
            let storage:any;
            const comments:Comment[] = document.getNodesByType(8),
                commentLength:number = comments.length,
                loadComplete = function load_restore_complete():void {
                    // assign key default events
                    content.onclick = ui.context.menuRemove;
                    document.getElementById("all-shares").onclick = function local_restore_complete_sharesAll(event:MouseEvent):void {
                        ui.modal.shares(event, "", null);
                    };
                    document.getElementById("login-input").onkeyup = ui.util.login;
                    document.getElementById("login").getElementsByTagName("button")[0].onclick = ui.util.login;
                    document.getElementById("menuToggle").onclick = ui.util.menu;
                    document.getElementById("systemLog").onclick = ui.modal.systems;
                    document.getElementById("fileNavigator").onclick = ui.fs.navigate;
                    document.getElementById("textPad").onclick = ui.modal.textPad;
                    document.getElementById("export").onclick = ui.modal.export;
            
                    // determine if keyboard control keys are held
                    document.onkeydown = function load_keydown(event:KeyboardEvent) {
                        const key:string = event.key.toLowerCase();
                        if (key === "shift") {
                            characterKey = "shift";
                        } else if (key === "control" && characterKey !== "shift") {
                            characterKey = "control";
                        }
                    };
                    document.onkeyup = function load_keyup(event:KeyboardEvent) {
                        const key:string = event.key.toLowerCase();
                        if (key === "shift" && characterKey === "shift") {
                            characterKey = "";
                        } else if (key === "control" && characterKey === "control") {
                            characterKey = "";
                        }
                    };
            
                    // building logging utility (systems log)
                    if (document.getElementById("systems-modal") === null) {
                        ui.modal.create({
                            content: systems,
                            inputs: ["close", "maximize", "minimize"],
                            single: true,
                            title: "",
                            type: "systems",
                            width: 800
                        });
                    }

                    // systems log messages
                    if (storage !== undefined && storage.messages !== undefined) {
                        if (storage.messages.status !== undefined && storage.messages.status.length > 0) {
                            storage.messages.status.forEach(function local_restore_statusEach(value:messageList):void {
                                ui.systems.message("status", value[1], value[0]);
                                messages.status.push([value[0], value[1]]);
                            });
                        }
                        if (storage.messages.users !== undefined && storage.messages.users.length > 0) {
                            storage.messages.users.forEach(function local_restore_usersEach(value:messageList):void {
                                ui.systems.message("users", value[1], value[0]);
                                messages.users.push([value[0], value[1]]);
                            });
                        }
                        if (storage.messages.errors !== undefined && storage.messages.errors.length > 0) {
                            storage.messages.errors.forEach(function local_restore_errorsEach(value:messageListError):void {
                                ui.systems.message("errors", JSON.stringify({
                                    error:value[1],
                                    stack:value[2]
                                }), value[0]);
                                messages.errors.push([value[0], value[1], value[2]]);
                            });
                        }
                    }

                    loadTest = false;
                };
            let a:number = 0,
                cString:string = "";
            do {
                cString = comments[a].substringData(0, comments[a].length);
                if (cString.indexOf("storage:") === 0) {
                    if (cString.length > 12) {
                        storage = JSON.parse(cString.replace("storage:", ""));
                        if (Object.keys(storage.settings).length < 1) {
                            loadComplete();
                        } else {
                            const modalKeys:string[] = Object.keys(storage.settings.modals),
                                indexes:[number, string][] = [],
                                z = function local_restore_z(id:string) {
                                    count = count + 1;
                                    indexes.push([storage.settings.modals[id].zIndex, id]);
                                    if (count === modalKeys.length) {
                                        let cc:number = 0;
                                        data.zIndex = modalKeys.length;
                                        indexes.sort(function local_restore_z_sort(aa:[number, string], bb:[number, string]):number {
                                            if (aa[0] < bb[0]) {
                                                return -1;
                                            }
                                            return 1;
                                        });
                                        do {
                                            if (storage.settings.modals[indexes[cc][1]] !== undefined && document.getElementById(indexes[cc][1]) !== null) {
                                                storage.settings.modals[indexes[cc][1]].zIndex = cc + 1;
                                                document.getElementById(indexes[cc][1]).style.zIndex = `${cc + 1}`;
                                            }
                                            cc = cc + 1;
                                        } while (cc < modalKeys.length);
                                        loadComplete();
                                    }
                                };
                            let count:number = 0;
                            
                            // restore shares
                            {
                                data.shares = storage.settings.shares;
                                const users:string[] = Object.keys(storage.settings.shares),
                                    userLength:number = users.length;
                                let a:number = 0;
                                do {
                                    if (users[a] !== "localhost") {
                                        ui.util.addUser(users[a], "xxx");
                                    }
                                    a = a + 1;
                                } while (a < userLength);
                            }

                            if (storage.settings.name === undefined || storage.settings.name === "") {
                                document.getElementsByTagName("body")[0].setAttribute("class", "login");
                            } else {
                                data.name = storage.settings.name;
                                ui.util.addUser(storage.settings.name, "localhost");
                            }
                            if (modalKeys.length < 1) {
                                loadComplete();
                            }
                            modalKeys.forEach(function local_restore_modalKeys(value:string) {
                                if (storage.settings.modals[value].type === "fileNavigate") {
                                    network.fs({
                                        agent: "self",
                                        depth: 2,
                                        callback: function local_restore_modalKeys_callback(files:HTMLElement, id:string) {
                                            const textValue:string = files.getAttribute("title");
                                            files.removeAttribute("title");
                                            storage.settings.modals[id].content = files;
                                            storage.settings.modals[id].id = id;
                                            if (storage.settings.modals[id].text_value !== "\\" && storage.settings.modals[id].text_value !== "/") {
                                                storage.settings.modals[id].text_value = textValue;
                                            }
                                            storage.settings.modals[id].text_event = ui.fs.text;
                                            ui.modal.create(storage.settings.modals[id]);
                                            z(id);
                                            if (storage.settings.modals[id].status === "maximized") {
                                                const button:HTMLButtonElement = <HTMLButtonElement>document.getElementById(id).getElementsByClassName("maximize")[0];
                                                data.modals[id].status = "normal";
                                                button.click();
                                            } else if (storage.settings.modals[id].status === "minimized") {
                                                const button:HTMLButtonElement = <HTMLButtonElement>document.getElementById(id).getElementsByClassName("minimize")[0];
                                                data.modals[id].status = "normal";
                                                button.click();
                                            }
                                        },
                                        element: content,
                                        id: value,
                                        location: storage.settings.modals[value].text_value,
                                        watch: "yes"
                                    });
                                } else if (storage.settings.modals[value].type === "textPad" || storage.settings.modals[value].type === "export") {
                                    const textArea:HTMLTextAreaElement = document.createElement("textarea");
                                    if (storage.settings.modals[value].type === "textPad") {
                                        if (storage.settings.modals[value].text_value !== undefined) {
                                            textArea.value = storage.settings.modals[value].text_value;
                                        }
                                        textArea.onblur = ui.modal.textSave;
                                    } else {
                                        textArea.value = JSON.stringify(storage.settings);
                                    }
                                    storage.settings.modals[value].content = textArea;
                                    storage.settings.modals[value].id = value;
                                    ui.modal.create(storage.settings.modals[value]);
                                    z(value);
                                } else if (storage.settings.modals[value].type === "systems") {
                                    storage.settings.modals[value].content = systems;
                                    ui.modal.create(storage.settings.modals[value]);
                                    const systemsModal:HTMLElement = document.getElementById("systems-modal");
                                    let button:HTMLButtonElement;
                                    if (storage.settings.modals[value].text_value === "status") {
                                        button = <HTMLButtonElement>systemsModal.getElementsByClassName("status")[0];
                                        button.click();
                                    } else if (storage.settings.modals[value].text_value === "users") {
                                        button = <HTMLButtonElement>systemsModal.getElementsByClassName("users")[0];
                                        button.click();
                                    } else if (storage.settings.modals[value].text_value === "errors") {
                                        button = <HTMLButtonElement>systemsModal.getElementsByClassName("errors")[0];
                                        button.click();
                                    }
                                    z(value);
                                } else if (storage.settings.modals[value].type === "shares") {
                                    ui.modal.shares(null, storage.settings.modals[value].text_value, storage.settings.modals[value]);
                                    z(value);
                                } else {
                                    z(value);
                                }
                            });
                        }
                    } else {
                        loadComplete();
                    }
                }
                a = a + 1;
            } while (a < commentLength);
        }());
    }());
}());