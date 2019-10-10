import browser from "./browser.js";
import fs from "./fs.js";
import modal from "./modal.js";
import network from "./network.js";
import util from "./util.js";

const context:module_context = {},
    agent = function local_fs_agent(element:HTMLElement):string {
        const box:HTMLElement = (element.getAttribute("class") === "box")
                ? element
                : (function local_fs_agent_box():HTMLElement {
                    let boxEl:HTMLElement = element;
                    do {
                        boxEl = <HTMLElement>boxEl.parentNode;
                    } while (boxEl !== document.documentElement && boxEl.getAttribute("class") !== "box");
                    return boxEl;
                }()),
            searchString:string = "Navigator - ";
        let text:string = box.getElementsByTagName("h2")[0].lastChild.textContent;
        text = text.slice(text.indexOf(searchString) + searchString.length);
        return text;
    };
let clipboard:string = "";

/* Handler for file system artifact copy */
context.copy = function local_context_copy(element:HTMLElement, type:"copy"|"cut"):void {
    let selected:[string, string][],
        addresses:string[] = [],
        box:HTMLElement; 
    if (element.nodeName !== "li") {
        element = <HTMLElement>element.parentNode;
    }
    box = <HTMLElement>element.parentNode;
    do {
        box = <HTMLElement>box.parentNode;
    } while (box !== document.documentElement && box.getAttribute("class") !== "box");
    selected = util.selectedAddresses(element, type);
    if (selected.length < 1) {
        addresses.push(element.getElementsByTagName("label")[0].innerHTML);
    } else {
        selected.forEach(function local_context_destroy_each(value:[string, string]):void {
            addresses.push(value[0]);
        });
    }
    if (clipboard !== "") {
        const clipData:clipboard = JSON.parse(clipboard);
        if (clipData.id !== box.getAttribute("id") || type !== "cut") {
            util.selectNone(document.getElementById(clipData.id));
        }
    }
    clipboard = JSON.stringify({
        agent: agent(box),
        data: addresses,
        id: box.getAttribute("id"),
        type: type
    });
};

/* Handler for hash and base64 operations from the context menu */
context.dataString = function local_context_dataString(event:MouseEvent, element?:HTMLElement, type?:"Hash" | "Base64"):void {
    let address:string = element.getElementsByTagName("label")[0].innerHTML;
    address = element.getElementsByTagName("label")[0].innerHTML;
    network.fs({
        action: `fs-${type.toLowerCase()}`,
        agent: agent(element),
        depth: 1,
        location: [address],
        name: "",
        watch: "no"
    }, function local_context_dataString(resultString:string):void {
        resultString = resultString.slice(resultString.indexOf("\"dirs\":") + 7, resultString.length - 1);
        modal.textPad(event, resultString, `${type} - ${address}`);
        network.settings();
    });
};

/* Handler for removing file system artifacts via context menu */
context.destroy = function local_context_destroy(element:HTMLElement):void {
    let selected:[string, string][],
        addresses:string[] = []; 
    if (element.nodeName.toLowerCase() !== "li") {
        element = <HTMLElement>element.parentNode;
    }
    selected = util.selectedAddresses(element, "destroy");
    if (selected.length < 1) {
        addresses.push(element.getElementsByTagName("label")[0].innerHTML);
    } else {
        selected.forEach(function local_context_destroy_each(value:[string, string]):void {
            addresses.push(value[0]);
        });
    }
    network.fs({
        action: "fs-destroy",
        agent: agent(element),
        depth: 1,
        location: addresses,
        name: "",
        watch: "no"
    }, function local_context_destroy_callback():void {
        // todo: log to systems list
    });
};

/* Handler for details action of context menu */
context.details = function local_context_details(event:MouseEvent, element?:HTMLElement):void {
    const div:HTMLElement = util.delay(),
        addresses:[string, string][] = util.selectedAddresses(element, "details"),
        modalInstance:HTMLElement = modal.create({
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
        addressList:string[] = (function local_context_details_addressList():string[] {
            const output:string[] = [],
                length:number = addresses.length;
            let a:number = 0;
            do {
                output.push(addresses[a][0]);
                a = a + 1;
            } while (a < length);
            return output;
        }());
    network.fs({
        action: "fs-details",
        agent: agent(element),
        depth: 0,
        location: addressList,
        name: "",
        watch: "no"
    }, function local_context_details_callback(response:string):void {
        const payload:fsRemote = JSON.parse(response),
            list:directoryList = (payload.dirs === "missing")
                ? []
                : payload.dirs,
            body:HTMLElement = <HTMLElement>modalInstance.getElementsByClassName("body")[0],
            length:number = list.length,
            details:fsDetails = {
                size: 0,
                files: 0,
                directories: 0,
                links: 0
            },
            output:HTMLElement = document.createElement("div");
        let a:number = 0,
            tr:HTMLElement,
            td:HTMLElement,
            childLength:number,
            heading:HTMLElement = document.createElement("h3"),
            table:HTMLElement = document.createElement("table"),
            tbody:HTMLElement = document.createElement("tbody"),
            mTime:Date,
            aTime:Date,
            cTime:Date;
        list.sort(function local_network_fsDetails_callback_sort(a:directoryItem, b:directoryItem):number {
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
        do {
            if (list[a][1] === "directory") {
                details.directories = details.directories + 1;
            } else if (list[a][1] === "link") {
                details.links = details.links + 1;
            } else {
                details.files = details.files + 1;
                details.size = details.size + list[a][4].size;
            }
            a = a + 1;
        } while (a < childLength);

        output.setAttribute("class", "fileDetailOutput");
        heading.innerHTML = `File System Details - ${list.length} items`;
        output.appendChild(heading);
        a = 0;
        childLength = addresses.length;
        do {
            tr = document.createElement("tr");
            td = document.createElement("th");
            td.innerHTML = list[a][1];
            td.setAttribute("class", list[a][1]);
            tr.appendChild(td);
            td = document.createElement("td");
            td.innerHTML = list[a][0];
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
            td.innerHTML = `${util.commas(details.size)} bytes (${util.prettyBytes(details.size)})`;
        } else {
            td.innerHTML = `${util.commas(details.size)} bytes`;
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
        td.innerHTML = util.commas(details.files);
        tr.appendChild(td);
        tbody.appendChild(tr);
        tr = document.createElement("tr");
        td = document.createElement("th");
        td.innerHTML = "Directories";
        tr.appendChild(td);
        td = document.createElement("td");
        td.innerHTML = util.commas(details.directories);
        tr.appendChild(td);
        tbody.appendChild(tr);
        tr = document.createElement("tr");
        td = document.createElement("th");
        td.innerHTML = "Symbolic Links";
        tr.appendChild(td);
        td = document.createElement("td");
        td.innerHTML = util.commas(details.links);
        tr.appendChild(td);
        tbody.appendChild(tr);
        table.appendChild(tbody);
        output.appendChild(table);
        
        if (list.length === 1) {
            mTime = new Date(list[0][4].mtimeMs);
            aTime = new Date(list[0][4].atimeMs);
            cTime = new Date(list[0][4].ctimeMs);
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
        }
        body.innerHTML = "";
        body.appendChild(output);
    });
    util.selectNone(element);
};

/* Handler for creating new directories */
context.fsNew = function local_context_fsNew(element:HTMLElement, type:"directory" | "file"):void {
    const field:HTMLInputElement = document.createElement("input"),
        text:HTMLElement = document.createElement("label"),
        actionKeyboard = function local_context_fsNew_actionKeyboard(actionEvent:KeyboardEvent):void {
            if (actionEvent.keyCode === 13) {
                const value:string = field.value.replace(/(\s+|\.)$/, "");
                field.value = value;
                text.innerHTML = path + value;
                network.fs({
                    action: "fs-new",
                    agent: agent(element),
                    depth: 1,
                    location: [path + value],
                    name: type,
                    watch: "no"
                }, function local_context_fsNew_actionKeyboard_callback():void {
                    // todo: log in systems log
                });
            } else {
                if (actionEvent.keyCode === 27) {
                    element.removeChild(item);
                    return;
                }
                field.value = field.value.replace(/\?|<|>|"|\||\*|:|\\|\/|\u0000/g, "");
            }
        },
        actionBlur = function local_context_fsNew_actionBlur(actionEvent:FocusEvent):void {
            if (actionEvent.type === "blur" && field.value.replace(/\s+/, "") !== "") {
                const value:string = field.value.replace(/(\s+|\.)$/, "");
                field.value = value;
                text.innerHTML = path + value;
                network.fs({
                    action: "fs-new",
                    agent: agent(element),
                    depth: 1,
                    location: [path + value],
                    name: type,
                    watch: "no"
                }, function local_context_fsNew_actionBlur_callback():void {
                    // todo: log in systems log
                });
            }
        },
        build = function local_context_fsNew_build():HTMLElement {
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
            text.oncontextmenu = context.menu;
            text.onclick = fs.select;
            text.innerHTML = path;
            field.onkeyup = actionKeyboard;
            field.onblur = actionBlur;
            text.appendChild(field);
            li.appendChild(text);
            span = document.createElement("span");
            span.onclick = fs.select;
            span.oncontextmenu = context.menu;
            li.appendChild(span);
            li.oncontextmenu = context.menu;
            li.appendChild(label);
            li.onclick = fs.select;
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
    if (path.charAt(path.length - 1) !== slash) {
        path = path + slash;
    }
    item = build();
    element.appendChild(item);
    field.focus();
};

/* Creates context menu */
context.menu = function local_context_menu(event:MouseEvent):void {
    const itemList:HTMLElement[] = [],
        menu:HTMLElement = document.createElement("ul");
    let element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        nodeName:string = element.nodeName.toLowerCase(),
        parent:HTMLElement = <HTMLElement>element.parentNode,
        item:HTMLElement,
        button:HTMLButtonElement,
        functions:contextFunctions = {
            base64: function local_context_menu_base64():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "Base64";
                button.onclick = function local_context_menu_base64_handler():void {
                    context.dataString(event, element, "Base64");
                };
                item.appendChild(button);
                itemList.push(item);
            },
            copy: function local_context_menu_copy():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "Copy";
                button.onclick = function local_context_menu_copy_handler():void {
                    context.copy(element, "copy");
                }
                item.appendChild(button);
                itemList.push(item);
            },
            cut: function local_context_menu_cut():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "Cut";
                button.onclick = function local_context_menu_cut_handler():void {
                    context.copy(element, "cut");
                }
                item.appendChild(button);
                itemList.push(item);
            },
            destroy: function local_context_menu_destroy():void {
                let input:HTMLInputElement = <HTMLInputElement>parent;
                do {
                    input = <HTMLInputElement>input.parentNode;
                } while (input !== document.documentElement && input.getAttribute("class") !== "border");
                input = input.getElementsByTagName("input")[0];
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "Destroy";
                button.setAttribute("class", "destroy");
                if (input.value === "/" || input.value === "\\") {
                    button.disabled = true;
                } else {
                    button.onclick = function local_context_menu_destroy():void {
                        context.destroy(element);
                    };
                }
                item.appendChild(button);
                itemList.push(item);
            },
            details: function local_context_menu_details():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "Details";
                button.onclick = function local_context_menu_details_handler():void {
                    context.details(event, element);
                };
                item.appendChild(button);
                itemList.push(item);
            },
            hash: function local_context_menu_hash():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "Hash";
                button.onclick = function local_context_menu_hash_handler():void {
                    context.dataString(event, element, "Hash");
                };
                item.appendChild(button);
                itemList.push(item);
            },
            newDirectory: function local_context_menu_newDirectory():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "New Directory";
                button.onclick = function local_context_menu_newDirectory_handler():void {
                    context.fsNew(element, "directory");
                };
                item.appendChild(button);
                itemList.push(item);
            },
            newFile: function local_context_menu_newFile():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "New File";
                button.onclick = function local_context_menu_newFile_handler():void {
                    context.fsNew(element, "file");
                };
                item.appendChild(button);
                itemList.push(item);
            },
            paste: function local_context_menu_paste():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "Paste";
                button.onclick = function local_context_menu_paste_handler():void {
                    context.paste(element);
                };
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
                let input:HTMLInputElement = <HTMLInputElement>parent;
                do {
                    input = <HTMLInputElement>input.parentNode;
                } while (input !== document.documentElement && input.getAttribute("class") !== "border");
                input = input.getElementsByTagName("input")[0];
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "Rename";
                if (input.value === "/" || input.value === "\\") {
                    button.disabled = true;
                } else {
                    button.onclick = function local_context_menu_rename():void {
                        fs.rename(event);
                    };
                }
                item.appendChild(button);
                itemList.push(item);
            },
            share: function local_context_menu_share():void {
                item = document.createElement("li");
                button = document.createElement("button");
                button.innerHTML = "Share";
                button.onclick = function local_context_menu_share_handler():void {
                    context.share(element);
                };
                item.appendChild(button);
                itemList.push(item);
            }
        },
        reverse:boolean = false,
        a:number = 0;
    event.stopPropagation();
    if (nodeName === "input") {
        return;
    }
    if (nodeName === "span" || nodeName === "label" || element.getAttribute("class") === "expansion") {
        element = <HTMLElement>element.parentNode;
        parent = <HTMLElement>parent.parentNode;
        nodeName = element.nodeName.toLowerCase();
    }
    context.menuRemove();
    event.preventDefault();
    event.stopPropagation();
    menu.setAttribute("id", "contextMenu");
    if (element.getAttribute("class") === "fileList") {
        functions.newDirectory();
        functions.newFile();
        functions.paste();
    } else if (parent.getAttribute("class") === "fileList") {

        functions.details();
        functions.share();

        if (element.getAttribute("class").indexOf("file") === 0) {
            functions.hash();
            functions.base64();
        }

        functions.newDirectory();
        functions.newFile();
        functions.copy();
        functions.cut();
        functions.paste();
        functions.rename();
        functions.destroy();
    }

    // menu display position
    menu.style.zIndex = `${browser.data.zIndex + 10}`;
    if (browser.content.clientHeight < ((itemList.length * 46) + 1) + event.clientY) {
        reverse = true;
        menu.style.top = `${(event.clientY - ((itemList.length * 46) + 1)) / 10}em`;
    } else {
        menu.style.top = `${(event.clientY - 50) / 10}em`;
    }
    if (browser.content.clientWidth < (200 + event.clientX)) {
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
    browser.content.appendChild(menu);
};

/* Destroys a context menu */
context.menuRemove = function local_context_menuRemove():void {
    if (document.getElementById("contextMenu") !== null) {
        browser.content.removeChild(document.getElementById("contextMenu"));
    }
};

/* Prepare the network action to write files */
context.paste = function local_context_paste(element:HTMLElement):void {
    let destination:string,
        clipData:clipboard = JSON.parse(clipboard);
    do {
        element = <HTMLElement>element.parentNode;
    } while (element !== document.documentElement && element.getAttribute("class") !== "box");
    destination = element.getElementsByTagName("input")[0].value;
    network.fs({
        action: `fs-${clipData.type}`,
        agent: clipData.agent,
        depth: 1,
        location: clipData.data,
        name: destination,
        watch: "no"
    }, function local_context_paste_callback():void {
        clipboard = "";
        util.selectNone(document.getElementById(clipData.id));
    });
};

/* Share utility for the context menu list */
context.share = function local_context_share(element:HTMLElement):void {
    const shareLength:number = browser.data.shares.localhost.length,
        addresses:[string, string][] = util.selectedAddresses(element, "share"),
        addressesLength:number = addresses.length;
    let a:number = 0,
        b:number = 0;
    if (shareLength > 0) {
        do {
            b = 0;
            do {
                if (addresses[a][0] === browser.data.shares.localhost[b][0] && browser.data.shares.localhost[b][1] === addresses[a][1]) {
                    break;
                }
                b = b + 1;
            } while (b < shareLength);
            if (b === shareLength) {
                browser.data.shares.localhost.push(addresses[a]);
            }
            a = a + 1;
        } while (a < addressesLength);
    } else {
        do {
            browser.data.shares.localhost.push(addresses[a]);
            a = a + 1;
        } while (a < addressesLength);
    }
    util.selectNone(element);
    network.settings();
};

export default context;