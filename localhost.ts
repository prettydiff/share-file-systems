import { browser } from "./lib/browser.js";
import { context } from "./lib/context.js";
import { fs } from "./lib/fs.js";
import { modal } from "./lib/modal.js";
import { network } from "./lib/network.js";
import { systems } from "./lib/systems.js";
import { util } from "./lib/util.js";
import { webSocket } from "./lib/webSocket.js";

(function local():void {
    webSocket();

    util.fixHeight();
    window.onresize = util.fixHeight;

    /* Restore state and assign events */
    (function local_load():void {
        const systemsBox:HTMLElement = (function local_systems():HTMLElement {
            const systemsElement:HTMLElement = document.createElement("div");
            let ul:HTMLElement = document.createElement("ul"),
                li:HTMLElement = document.createElement("li"),
                button:HTMLButtonElement = document.createElement("button");
            ul.setAttribute("class", "tabs");
            button.innerHTML = "⎔ System";
            button.setAttribute("class", "status active");
            button.onclick = systems.tabs;
            li.appendChild(button);
            ul.appendChild(li);
            li = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "⎋ Users";
            button.setAttribute("class", "users");
            button.onclick = systems.tabs;
            li.appendChild(button);
            ul.appendChild(li);
            li = document.createElement("li");
            button = document.createElement("button");
            button.innerHTML = "⌁ Errors";
            button.setAttribute("class", "errors");
            button.onclick = systems.tabs;
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
                    let types:number     = 0;
                    const valueTest:string = (typeof typeValue === "string") ? typeValue.toUpperCase() : "",
                        // eslint-disable-next-line
                        root:HTMLElement = (this === document) ? document.documentElement : this;
        
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
                        const output:Node[] = [],
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
                    // eslint-disable-next-line
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
                const el = document.getNodesByType(1);
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
            let storage:any,
                a:number = 0,
                cString:string = "",
                active:number = Date.now();
            const comments:Comment[] = document.getNodesByType(8),
                commentLength:number = comments.length,
                idleTime:number = 15000,
                idleness = function local_restore_idleness():void {
                    const time:number = Date.now();
                    if (time - active > idleTime) {
                        document.getElementById("localhost").setAttribute("class", "idle");
                        network.heartbeat("idle");
                    }
                    setTimeout(local_restore_idleness, idleTime);
                },
                loadComplete = function local_restore_complete():void {
                    const localhost:HTMLElement = document.getElementById("localhost");

                    // assign key default events
                    browser.content.onclick = context.menuRemove;
                    document.getElementById("all-shares").onclick = function local_restore_complete_sharesAll(event:MouseEvent):void {
                        modal.shares(event, "", null);
                    };
                    document.getElementById("invite-user").onclick = util.inviteStart;
                    document.getElementById("login-input").onkeyup = util.login;
                    document.getElementById("login").getElementsByTagName("button")[0].onclick = util.login;
                    document.getElementById("menuToggle").onclick = util.menu;
                    document.getElementById("systemLog").onclick = modal.systems;
                    document.getElementById("fileNavigator").onclick = fs.navigate;
                    document.getElementById("textPad").onclick = modal.textPad;
                    document.getElementById("export").onclick = modal.export;
                    network.heartbeat("active");
            
                    // determine if keyboard control keys are held
                    document.onkeydown = function load_restore_complete_keydown(event:KeyboardEvent):void {
                        const key:string = event.key.toLowerCase();
                        if (key === "shift") {
                            browser.characterKey = "shift";
                        } else if (key === "control" && browser.characterKey !== "shift") {
                            browser.characterKey = "control";
                        }
                        if (localhost !== null) {
                            const status:string = localhost.getAttribute("class")
                            if (status !== "active") {
                                localhost.setAttribute("class", "active");
                                network.heartbeat("active");
                            }
                        }
                        active = Date.now();
                    };
                    document.onkeyup = function load_restore_complete_keyup(event:KeyboardEvent):void {
                        const key:string = event.key.toLowerCase();
                        if (key === "shift" && browser.characterKey === "shift") {
                            browser.characterKey = "";
                        } else if (key === "control" && browser.characterKey === "control") {
                            browser.characterKey = "";
                        }
                    };

                    // watch for local idleness
                    document.onmousemove = function load_restore_complete_mousemove():void {
                        if (localhost !== null) {
                            const status:string = localhost.getAttribute("class");
                            if (status !== "active") {
                                localhost.setAttribute("class", "active");
                                network.heartbeat("active");
                            }
                        }
                        active = Date.now();
                    };
            
                    // building logging utility (systems log)
                    if (document.getElementById("systems-modal") === null) {
                        modal.create({
                            content: systemsBox,
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
                                systems.message("status", value[1], value[0]);
                                browser.messages.status.push([value[0], value[1]]);
                            });
                        }
                        if (storage.messages.users !== undefined && storage.messages.users.length > 0) {
                            storage.messages.users.forEach(function local_restore_usersEach(value:messageList):void {
                                systems.message("users", value[1], value[0]);
                                browser.messages.users.push([value[0], value[1]]);
                            });
                        }
                        if (storage.messages.errors !== undefined && storage.messages.errors.length > 0) {
                            storage.messages.errors.forEach(function local_restore_errorsEach(value:messageListError):void {
                                systems.message("errors", JSON.stringify({
                                    error:value[1],
                                    stack:value[2]
                                }), value[0]);
                                browser.messages.errors.push([value[0], value[1], value[2]]);
                            });
                        }
                    }

                    network.heartbeat("active");
                    browser.loadTest = false;
                };
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
                                        browser.data.zIndex = modalKeys.length;
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
                            browser.data.name = storage.settings.name;
                            util.addUser(`${storage.settings.name}@localhost`, storage.settings.name[storage.settings.shares[storage.settings.name]]);
                            
                            // restore shares
                            {
                                browser.data.shares = storage.settings.shares;
                                const users:string[] = Object.keys(storage.settings.shares),
                                    userLength:number = users.length;
                                let a:number = 0;
                                do {
                                    if (users[a] !== "localhost") {
                                        util.addUser(users[a], storage.settings.shares[users[a]]);
                                    }
                                    a = a + 1;
                                } while (a < userLength);
                            }
                            
                            if (modalKeys.length < 1) {
                                loadComplete();
                            }
                            modalKeys.forEach(function local_restore_modalKeys(value:string) {
                                if (storage.settings.modals[value].type === "fileNavigate") {
                                    network.fs({
                                        action: "fs-read",
                                        agent: "self",
                                        depth: 2,
                                        location: [storage.settings.modals[value].text_value],
                                        name: "",
                                        watch: "yes"
                                    }, function local_restore_modalKeys_fsCallback(responseText:string, id?:string):void {
                                        // an empty response occurs when XHR delivers an HTTP status of not 200 and not 0, which probably means path not found
                                        if (responseText !== "") {
                                            const files:HTMLElement = fs.list(storage.settings.modals[value].text_value, responseText),
                                                textValue:string = files.getAttribute("title");
                                            files.removeAttribute("title");
                                            storage.settings.modals[id].content = files;
                                            storage.settings.modals[id].id = id;
                                            if (storage.settings.modals[id].text_value !== "\\" && storage.settings.modals[id].text_value !== "/") {
                                                storage.settings.modals[id].text_value = textValue;
                                            }
                                            storage.settings.modals[id].text_event = fs.text;
                                            modal.create(storage.settings.modals[id]);
                                            z(id);
                                            if (storage.settings.modals[id].status === "maximized") {
                                                const button:HTMLButtonElement = <HTMLButtonElement>document.getElementById(id).getElementsByClassName("maximize")[0];
                                                browser.data.modals[id].status = "normal";
                                                button.click();
                                            } else if (storage.settings.modals[id].status === "minimized") {
                                                const button:HTMLButtonElement = <HTMLButtonElement>document.getElementById(id).getElementsByClassName("minimize")[0];
                                                browser.data.modals[id].status = "normal";
                                                button.click();
                                            }
                                        } else {
                                            z(id);
                                        }
                                    }, value);
                                } else if (storage.settings.modals[value].type === "textPad" || storage.settings.modals[value].type === "export") {
                                    const textArea:HTMLTextAreaElement = document.createElement("textarea");
                                    if (storage.settings.modals[value].type === "textPad") {
                                        if (storage.settings.modals[value].text_value !== undefined) {
                                            textArea.value = storage.settings.modals[value].text_value;
                                        }
                                        textArea.onblur = modal.textSave;
                                    } else {
                                        textArea.value = JSON.stringify(storage.settings);
                                    }
                                    storage.settings.modals[value].content = textArea;
                                    storage.settings.modals[value].id = value;
                                    modal.create(storage.settings.modals[value]);
                                    z(value);
                                } else if (storage.settings.modals[value].type === "systems") {
                                    storage.settings.modals[value].content = systemsBox;
                                    modal.create(storage.settings.modals[value]);
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
                                    modal.shares(null, storage.settings.modals[value].text_value, storage.settings.modals[value]);
                                    z(value);
                                } else if (storage.settings.modals[value].type === "inviteUser") {
                                    util.inviteStart(null, "", storage.settings.modals[value]);
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
            setTimeout(idleness, idleTime);
            if (storage === undefined || storage.settings === undefined || storage.settings.name === undefined) {
                browser.pageBody.setAttribute("class", "login");
            }
        }());
    }());
}());