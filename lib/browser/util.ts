
/* lib/browser/util - Miscellaneous tools for the browser environment. */
import audio from "./audio.js";
import browser from "./browser.js";
import context from "./context.js";
import fileBrowser from "./fileBrowser.js";
import network from "./network.js";
import share from "./share.js";
import modal from "./modal.js";

const util:module_util = {

    /* Play audio in the browser */
    audio: function browser_util_audio(name:string):void {
        const audioContext:AudioContext = new AudioContext(),
            binary:BinaryType = window.atob(audio[name].data) as BinaryType,
            source:AudioBufferSourceNode = audioContext.createBufferSource(),
            buff:ArrayBuffer = new ArrayBuffer(binary.length),
            bytes:Uint8Array = new Uint8Array(buff),
            byteLength:number = buff.byteLength;
        let a:number = 0;
        if (browser.data.audio === false) {
            return;
        }
        do {
            bytes[a] = binary.charCodeAt(a);
            a = a + 1;
        } while (a < byteLength);
        audioContext.decodeAudioData(buff, function load_util_audio_decode(buffer:AudioBuffer):void {
            source.buffer = buffer;
            source.loop   = false;
            source.connect(audioContext.destination);
            source.start(0, 0, audio[name].seconds);
        });
    },

    /* Converts a date object into US Army date format */
    dateFormat: function browser_util_dateFormat(date:Date):string {
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
    },

    /* Create a div element with a spinner and class name of 'delay' */
    delay: function browser_util_delay():Element {
        const div:Element = document.createElement("div"),
            text:Element = document.createElement("p"),
            svg:Element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        // cspell:disable
        svg.setAttribute("viewBox", "0 0 57 57");
        svg.innerHTML = "<g fill=\"none\" fill-rule=\"evenodd\"><g transform=\"translate(1 1)\" stroke-width=\"2\"><circle cx=\"5\" cy=\"50\" r=\"5\"><animate attributeName=\"cy\" begin=\"0s\" dur=\"2.2s\" values=\"50;5;50;50\" calcMode=\"linear\" repeatCount=\"indefinite\"/><animate attributeName=\"cx\" begin=\"0s\" dur=\"2.2s\" values=\"5;27;49;5\" calcMode=\"linear\" repeatCount=\"indefinite\"/></circle><circle cx=\"27\" cy=\"5\" r=\"5\"><animate attributeName=\"cy\" begin=\"0s\" dur=\"2.2s\" from=\"5\" to=\"5\" values=\"5;50;50;5\" calcMode=\"linear\" repeatCount=\"indefinite\"/><animate attributeName=\"cx\" begin=\"0s\" dur=\"2.2s\" from=\"27\" to=\"27\" values=\"27;49;5;27\" calcMode=\"linear\" repeatCount=\"indefinite\"/></circle><circle cx=\"49\" cy=\"50\" r=\"5\"><animate attributeName=\"cy\" begin=\"0s\" dur=\"2.2s\" values=\"50;50;5;50\" calcMode=\"linear\" repeatCount=\"indefinite\"/><animate attributeName=\"cx\" from=\"49\" to=\"49\" begin=\"0s\" dur=\"2.2s\" values=\"49;5;27;49\" calcMode=\"linear\" repeatCount=\"indefinite\"/></circle></g></g>";
        //svg.setAttribute("viewBox", "0 0 44 44");
        //svg.innerHTML = "<g fill=\"none\" fill-rule=\"evenodd\" stroke-width=\"2\"><circle cx=\"22\" cy=\"22\" r=\"1\"><animate attributeName=\"r\" begin=\"0s\" dur=\"1.8s\" values=\"1; 20\" calcMode=\"spline\" keyTimes=\"0; 1\" keySplines=\"0.165, 0.84, 0.44, 1\" repeatCount=\"indefinite\"/><animate attributeName=\"stroke-opacity\" begin=\"0s\" dur=\"1.8s\" values=\"1; 0\" calcMode=\"spline\" keyTimes=\"0; 1\" keySplines=\"0.3, 0.61, 0.355, 1\" repeatCount=\"indefinite\"/></circle><circle cx=\"22\" cy=\"22\" r=\"1\"><animate attributeName=\"r\" begin=\"-0.9s\" dur=\"1.8s\" values=\"1; 20\" calcMode=\"spline\" keyTimes=\"0; 1\" keySplines=\"0.165, 0.84, 0.44, 1\" repeatCount=\"indefinite\"/><animate attributeName=\"stroke-opacity\" begin=\"-0.9s\" dur=\"1.8s\" values=\"1; 0\" calcMode=\"spline\" keyTimes=\"0; 1\" keySplines=\"0.3, 0.61, 0.355, 1\" repeatCount=\"indefinite\"/></circle></g>";
        // cspell:enable
        text.innerHTML = "Waiting on data. Please stand by.";
        div.setAttribute("class", "delay");
        div.appendChild(svg);
        div.appendChild(text);
        return div;
    },

    /* Drag a selection box to capture a collection of items into a selection */
    dragBox: function browser_util_dragBox(event:Event, callback:Function):void {
        const element:Element = event.target as Element,
            list:Element = element.getAncestor("fileList", "class"),
            body:HTMLElement = list.getAncestor("body", "class") as HTMLElement,
            box:HTMLElement = body.getAncestor("box", "class") as HTMLElement,
            boxTop:number = box.offsetTop,
            boxLeft:number = box.offsetLeft,
            bodyTop:number = body.offsetTop,
            bodyLeft:number = body.offsetLeft,
            listHeight:number = list.clientHeight,
            bodyHeight:number = body.clientHeight,
            bodyWidth:number = body.clientWidth,
            bodyScrollTop:number = body.scrollTop,
            bodyScrollLeft:number = body.scrollLeft,
            offsetLeft:number = boxLeft + bodyLeft - body.scrollLeft,
            offsetTop:number = boxTop + bodyTop - bodyScrollTop + 50,
            maxUp:number = boxTop + bodyTop + 50 - bodyScrollTop,
            maxDown:number = boxTop + bodyTop + listHeight + 50 - bodyScrollTop,
            maxLeft:number = boxLeft + bodyLeft - bodyScrollLeft,
            maxRight:number = boxLeft + bodyLeft + bodyWidth - 4,
            drag:HTMLElement = document.createElement("div"),
            oldDrag:Element = document.getElementById("dragBox"),
            touch:boolean      = (event !== null && event.type === "touchstart"),
            mouseEvent = event as MouseEvent,
            touchEvent = event as TouchEvent,
            x:number = (touch === true)
                ? touchEvent.touches[0].clientX
                : mouseEvent.clientX,
            y:number = (touch === true)
                ? touchEvent.touches[0].clientY
                : mouseEvent.clientY,   
            drop       = function browser_util_dragBox_drop(e:Event):boolean {
                callback(event, drag);
                if (drag.parentNode !== null) {
                    drag.parentNode.removeChild(drag);
                }
                if (touch === true) {
                    document.ontouchmove = null;
                    document.ontouchend  = null;
                } else {
                    document.onmousemove = null;
                    document.onmouseup   = null;
                }
                network.settings("configuration", null);
                e.preventDefault();
                setTimeout(function browser_util_dragBox_drop_scroll():void {
                    body.scrollLeft = bodyScrollLeft;
                    body.scrollTop = bodyScrollTop;
                }, 5);
                return false;
            },
            boxMove = function browser_util_dragBox_boxMove(moveEvent:MouseEvent|TouchEvent):boolean {
                const touchEvent:TouchEvent = (touch === true)
                        ? moveEvent as TouchEvent
                        : null,
                    mouseEvent:MouseEvent = (touch === true)
                        ? null
                        : moveEvent as MouseEvent,
                    clientX:number = (touch === true)
                        ? touchEvent.touches[0].clientX
                        : mouseEvent.clientX,
                    clientY:number = (touch === true)
                        ? touchEvent.touches[0].clientY
                        : mouseEvent.clientY;
                moveEvent.preventDefault();
                drag.style.display = "block";
                // horizontal
                // * less complexity is required for horizontal movement, because at this time lists do not scroll horizontally in their modal body
                if (x > clientX) {
                    // drag left
                    if (clientX > maxLeft) {
                        drag.style.width = `${(x - clientX) / 10}em`;
                        drag.style.left = `${(clientX - offsetLeft) / 10}em`;
                        if (clientX < (viewportX - bodyWidth - 4)) {
                            body.scrollLeft = body.scrollLeft - ((viewportX - bodyWidth - 4) - clientX);
                            viewportX = clientX + bodyWidth + 4;
                        }
                    }
                } else {
                    // drag right
                    if (clientX < maxRight) {
                        drag.style.width = `${(clientX - x) / 10}em`;
                        drag.style.left = `${(x - offsetLeft) / 10}em`;
                        if (clientX > viewportX) {
                            body.scrollLeft = body.scrollLeft + (clientX - viewportX);
                            viewportX = clientX;
                        }
                    }
                }

                // vertical
                if (y > clientY) {
                    // drag up
                    if (clientY > maxUp) {
                        if (bodyScrollTop > body.scrollTop) {
                            drag.style.height = `${((y + (bodyScrollTop - body.scrollTop)) - clientY) / 10}em`;
                            drag.style.top = `${((clientY - (bodyScrollTop - body.scrollTop)) - offsetTop) / 10}em`;
                        } else {
                            drag.style.height = `${(y - clientY) / 10}em`;
                            drag.style.top = `${(clientY - offsetTop) / 10}em`;
                        }
                        if (clientY < (viewportY - bodyHeight - 50)) {
                            body.scrollTop = body.scrollTop - ((viewportY - bodyHeight - 50) - clientY);
                            viewportY = clientY + bodyHeight + 50;
                        }
                    }
                } else {
                    // drag down
                    if (clientY < maxDown) {
                        if (bodyScrollTop < body.scrollTop) {
                            drag.style.height = `${((clientY + (body.scrollTop - bodyScrollTop)) - y) / 10}em`;
                            drag.style.top = `${(y - offsetTop) / 10}em`;
                        } else {
                            drag.style.height = `${(clientY - y) / 10}em`;
                            drag.style.top = `${(y - offsetTop) / 10}em`;
                        }
                        if (clientY > viewportY) {
                            body.scrollTop = body.scrollTop + (clientY - viewportY);
                            viewportY = clientY;
                        }
                    }
                }
                return false;
            };
        let viewportY:number = bodyTop + boxTop + bodyHeight + 50 + bodyScrollTop,
            viewportX:number = bodyLeft + boxLeft + 4 + bodyScrollLeft;
        if (touch === false && mouseEvent.button > 1) {
            return;
        }
        if (oldDrag !== null) {
            oldDrag.parentNode.removeChild(oldDrag);
        }
        event.preventDefault();
        drag.setAttribute("id", "dragBox");
        drag.style.display = "none";
        body.insertBefore(drag, body.firstChild);
        if (touch === true) {
            document.ontouchend = drop;
            document.ontouchmove = boxMove;
            document.ontouchstart = null;
        } else {
            document.onmouseup = drop;
            document.onmousemove = boxMove;
            document.onmousedown = null;
        }
    },

    /* Selects list items in response to drawing a drag box */
    dragList: function browser_util_dragList(event:MouseEvent, dragBox:Element):void {
        const element:Element = event.target as Element,
            li:HTMLCollectionOf<HTMLElement> = element.getElementsByTagName("li"),
            length:number = li.length,
            dragLocation:ClientRect = util.screenPosition(dragBox),
            control:boolean = (event.ctrlKey === true),
            shift:boolean = (event.shiftKey === true);
        let a:number = 0,
            item:ClientRect,
            first:number = null,
            last:number = null;
        dragBox.parentNode.removeChild(dragBox);
        if (dragLocation.height < 1) {
            return;
        }
        event.preventDefault();
        if (length > 0) {
            do {
                item = util.screenPosition(li[a]);
                // item fully below the drag box
                if (item.top > dragLocation.bottom && item.left > dragLocation.right) {
                    break;
                }
                if (
                    // min bottom - max top
                    Math.min(item.bottom, dragLocation.bottom) - Math.max(item.top, dragLocation.top) > -1 &&
                    // min right - max left
                    Math.min(item.right, dragLocation.right) - Math.max(item.left, dragLocation.left) > -1
                ) {
                    if (first === null) {
                        first = a;
                    }
                    last = a;
                }
                a = a + 1;
            } while (a < length);
            if (last !== null) {
                if (first === last) {
                    if (control === true) {
                        fileBrowser.dragFlag = "control";
                        li[a].getElementsByTagName("p")[0].click();
                        fileBrowser.dragFlag = "";
                    } else if (shift === true) {
                        fileBrowser.dragFlag = "shift";
                        li[a].getElementsByTagName("p")[0].click();
                        fileBrowser.dragFlag = "";
                    } else {
                        li[a].getElementsByTagName("p")[0].click();
                    }
                } else {
                    if (control === true) {
                        fileBrowser.dragFlag = "control";
                        a = first;
                        last = last + 1;
                        do {
                            li[a].getElementsByTagName("p")[0].click();
                            a = a + 1;
                        } while (a < last);
                    } else {
                        if (li[first].getElementsByTagName("input")[0].checked === true) {
                            li[first].getElementsByTagName("p")[0].click();
                        }
                        li[first].getElementsByTagName("p")[0].click();
                        fileBrowser.dragFlag = "shift";
                        li[last].getElementsByTagName("p")[0].click();
                    }
                    fileBrowser.dragFlag = "";
                }
            }
        }
    },

    /* A utility to format and describe status bar messaging in a file navigator modal */
    fileListStatus: function browser_util_fileListStatus(data:fileStatusMessage):void {
        const keys:string[] = Object.keys(browser.data.modals),
            failures:string[] = (data.fileList === null || typeof data.fileList === "string" || data.fileList.failures === undefined)
                ? []
                : data.fileList.failures,
            failLength:number = (data.fileList === null || typeof data.fileList === "string" || data.fileList.failures === undefined)
                ? 0
                : Math.min(10, data.fileList.failures.length),
            fails:Element = document.createElement("ul");
        let listData:Element,
            body:Element,
            clone:Element,
            keyLength:number = keys.length,
            statusBar:Element,
            list:Element,
            p:Element,
            modal:modal,
            box:Element;
        if (failLength > 0) {
            let b:number = 0,
                li:Element;
            do {
                li = document.createElement("li");
                li.innerHTML = failures[b];
                fails.appendChild(li);
                b = b + 1;
            } while (b < failLength);
            if (failures.length > 10) {
                li = document.createElement("li");
                li.innerHTML = "more...";
                fails.appendChild(li);
            }
        }
        if (keyLength > 0) {
            do {
                keyLength = keyLength - 1;
                modal = browser.data.modals[keys[keyLength]];
                if (modal.type === "fileNavigate") {
                    if (modal.agent === data.agent && modal.agentType === data.agentType && modal.text_value === data.address) {
                        box = document.getElementById(keys[keyLength]);
                        statusBar = box.getElementsByClassName("status-bar")[0];
                        list = statusBar.getElementsByTagName("ul")[0];
                        p = statusBar.getElementsByTagName("p")[0];
                        if (failLength > 0) {
                            clone = fails.cloneNode(true) as HTMLElement;
                            statusBar.appendChild(clone);
                        } else if (data.message !== "") {
                            p.innerHTML = data.message;
                            p.setAttribute("aria-live", "polite");
                            p.setAttribute("role", "status");
                            if (list !== undefined) {
                                statusBar.removeChild(list);
                            }
                        }
                        if (data.fileList !== null) {
                            body = box.getElementsByClassName("body")[0];
                            body.innerHTML = "";
                            listData = fileBrowser.list(data.address, data.fileList, data.message);
                            if (listData !== null) {
                                body.appendChild(listData);
                            }
                        }
                    }
                }
            } while (keyLength > 0);
        }
    },

    /* Resizes the interactive area to fit the browser viewport */
    fixHeight: function browser_util_fixHeight():void {
        const height:number   = window.innerHeight || document.getElementsByTagName("body")[0].clientHeight;
        document.getElementById("spaces").style.height = `${height / 10}em`;
        browser.content.style.height = `${(height - 51) / 10}em`;
        document.getElementById("agentList").style.height = `${browser.content.scrollHeight / 10}em`;
    },

    /* Provides form execution to input fields not in a form */
    formKeys: function browser_util_formKeys(event:KeyboardEvent, submit:Function):void {
        const key:string = event.key;
        if (key === "Enter") {
            const element:Element = event.target as Element,
                div:Element = element.getAncestor("div", "tag"),
                inputs:HTMLCollectionOf<HTMLInputElement> = div.getElementsByTagName("input"),
                length:number = inputs.length;
            let a:number = 0;
            do {
                if (inputs[a].value.replace(/\s+/g, "") === "") {
                    inputs[a].focus();
                    return;
                }
                a = a + 1;
            } while (a < length);
            submit();
        }
    },

    /* Get the agent of a given modal */
    getAgent: function browser_util_getAgent(element:Element):agency {
        const box:Element = element.getAncestor("box", "class"),
            id:string = box.getAttribute("id");
        let agent:string = browser.data.modals[id].agent;
        if (agent === "" && browser.data.modals[id].type === "shares") {
            const ancestor:Element = element.getAncestor("agent", "class");
            agent = ancestor.getAttribute("data-hash");
        }
        return [agent, browser.data.modals[id].read_only, browser.data.modals[id].agentType];
    },

    /* Shortcut key combinations */
    keys: function browser_util_keys(event:KeyboardEvent):void {
        const key:string = event.key.toLowerCase(),
            windowEvent:KeyboardEvent = window.event as KeyboardEvent,
            element:Element = (function browser_util_keys_element():Element {
                let el:Element = document.activeElement;
                const name:string = util.name(el);
                if (el.parentNode === null || name === "li" || name === "ul") {
                    return el;
                }
                return el.getAncestor("li", "tag");
            }()),
            elementName:string = util.name(element),
            p:Element = element.getElementsByTagName("p")[0];
        if (key === "F5" || key === "f5" || (windowEvent.ctrlKey === true && (key === "r" || key === "R"))) {
            location.reload();
        }
        if (element.parentNode === null || document.activeElement === document.getElementById("newFileItem")) {
            return;
        }
        if (key === "enter" && elementName === "li" && (element.getAttribute("class") === "directory" || element.getAttribute("class") === "directory lastType" || element.getAttribute("class") === "directory selected") && p.getAttribute("class") === "selected" && util.selectedAddresses(element, "directory").length === 1) {
            fileBrowser.directory(event);
            return;
        }
        event.preventDefault();
        if (elementName !== "ul") {
            event.stopPropagation();
        }
        if (key === "delete" || key === "del") {
            context.element = element;
            context.destroy(event);
        } else if (windowEvent.altKey === true && windowEvent.ctrlKey === true) {
            if (key === "b" && elementName === "li") {
                // key b, base64
                context.element = element;
                context.type = "Base64";
                context.dataString(event);
            } else if (key === "d") {
                // key d, new directory
                context.element = element;
                context.type = "directory";
                context.fsNew(event);
            } else if (key === "e") {
                // key e, edit file
                context.element = element;
                context.type = "Edit";
                context.dataString(event);
            } else if (key === "f") {
                // key f, new file
                context.element = element;
                context.type = "file";
                context.fsNew(event);
            } else if (key === "h" && elementName === "li") {
                // key h, hash
                context.element = element;
                context.type = "Hash";
                context.dataString(event);
            } else if (key === "r" && elementName === "li") {
                // key r, rename
                fileBrowser.rename(event);
            } else if (key === "s") {
                // key s, share
                context.element = element;
                share.context(event);
            } else if (key === "t") {
                // key t, details
                context.details(event);
            }
        } else if (windowEvent.ctrlKey === true) {
            if (key === "a") {
                // key a, select all
                const list:Element = (elementName === "ul")
                        ? element
                        : element.parentNode as Element,
                    items:HTMLCollectionOf<Element> = list.getElementsByTagName("li"),
                    length:number = items.length;
                let a:number = 0,
                    classy:string;
                do {
                    classy = items[a].getAttribute("class");
                    if (classy !== null && classy.indexOf("cut") > -1) {
                        items[a].setAttribute("class", "selected cut");
                    } else {
                        items[a].setAttribute("class", "selected");
                    }
                    items[a].getElementsByTagName("input")[0].checked = true;
                    a = a + 1;
                } while (a < length);
            } else if (key === "c") {
                // key c, copy
                context.element = element;
                context.type = "copy";
                context.copy(event);
            } else if (key === "d" && elementName === "li") {
                // key d, destroy
                context.element = element;
                context.destroy(event);
            } else if (key === "v") {
                // key v, paste
                context.element = element;
                context.paste(event);
            } else if (key === "x") {
                // key x, cut
                context.element = element;
                context.type = "cut";
                context.copy(event);
            }
        }
    },

    /* Show/hide for the primary application menu that hangs off the title bar */
    menu: function browser_util_menu():void {
        const menu:HTMLElement = document.getElementById("menu"),
            move = function browser_util_menu_move(event:MouseEvent):void {
                if (event.clientX > menu.clientWidth || event.clientY > menu.clientHeight + 51) {
                    menu.style.display = "none";
                    document.onmousemove = null;
                }
            };
        if (menu.style.display !== "block") {
            menu.style.display = "block";
        } else {
            menu.style.display = "none";
        }
        document.onmousemove = move;
    },

    menuBlur: function browser_util_menuBlur():void {
        const active:Element = document.activeElement,
            menu:HTMLElement = document.getElementById("menu");
        if (active.parentNode.parentNode !== menu) {
            menu.style.display = "none";
        }
    },

    /* Minimize all modals to the bottom tray that are of modal status: normal and maximized */
    minimizeAll: function browser_util_minimizeAll():void {
        const keys:string[] = Object.keys(browser.data.modals),
            length:number = keys.length;
        let a:number = 0,
            status:modalStatus;
        util.minimizeAllFlag = true;
        do {
            status = browser.data.modals[keys[a]].status;
            if (status === "normal" || status === "maximized") {
                modal.forceMinimize(keys[a]);
            }
            a = a + 1;
        } while (a < length);
        util.minimizeAllFlag = false;
        network.settings("configuration", null);
    },

    /* A flag to keep settings informed about application state in response to minimizing all modals */
    minimizeAllFlag: false,

    /* Get a lowercase node name for a given element */
    name: function browser_util_name(item:Element):string {
        return item.nodeName.toLowerCase();
    },

    /* Make a string safe to inject via innerHTML */
    sanitizeHTML: function browser_util_sanitizeHTML(input:string):string {
        return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },

    /* Gathers the view port position of an element */
    screenPosition: function browser_util_screenPosition(node:Element):ClientRect {
        const output:ClientRect = node.getBoundingClientRect();
        return {
            bottom: Math.round(output.bottom),
            height: Math.round(output.height),
            left: Math.round(output.left),
            right: Math.round(output.right),
            top: Math.round(output.top),
            width: Math.round(output.width)
        };
    },

    /* Gather the selected addresses and types of file system artifacts in a fileNavigator modal */
    selectedAddresses: function browser_util_selectedAddresses(element:Element, type:string):[string, shareType, string][] {
        const output:[string, shareType, string][] = [],
            parent:Element = element.parentNode as Element,
            agent:string = util.getAgent(element)[0],
            drag:boolean = (parent.getAttribute("id") === "file-list-drag");
        let a:number = 0,
            length:number = 0,
            itemParent:HTMLElement,
            classy:string,
            itemList:HTMLCollectionOf<Element>,
            box:Element,
            dataModal:modal,
            addressItem:Element;
        if (util.name(element) !== "li") {
            element = element.parentNode as Element;
        }
        box = element.getAncestor("box", "class");
        dataModal = browser.data.modals[box.getAttribute("id")];
        itemList = (drag === true)
            ? parent.getElementsByTagName("p")
            : box.getElementsByClassName("fileList")[0].getElementsByTagName("p");
        length = itemList.length;
        do {
            itemParent = itemList[a].parentNode as HTMLElement;
            classy = itemList[a].getAttribute("class");
            if (itemParent.getElementsByTagName("input")[0].checked === true) {
                addressItem = itemList[a].firstChild as Element;
                output.push([addressItem.innerHTML, itemParent.getAttribute("class") as shareType, agent]);
                if (type === "cut") {
                    if (classy !== null && classy.indexOf("selected") > -1) {
                        itemList[a].setAttribute("class", "selected cut");
                    } else {
                        itemList[a].setAttribute("class", "cut");
                    }
                    dataModal.selection[itemList[a].getElementsByTagName("label")[0].innerHTML] = itemList[a].getAttribute("class");
                }
            } else {
                itemList[a].removeAttribute("class");
                if (dataModal.selection === undefined) {
                    dataModal.selection = {};
                } else {
                    delete dataModal.selection[itemList[a].getElementsByTagName("label")[0].innerHTML];
                }
            }
            a = a + 1;
        } while (a < length);
        if (output.length > 0) {
            return output;
        }
        output.push([element.getElementsByTagName("label")[0].innerHTML, element.getAttribute("class").replace(" lastType", "") as shareType, agent]);
        if (itemList[a] !== undefined && type === "cut") {
            classy = element.getAttribute("class");
            if (classy !== null && classy.indexOf("selected") > -1) {
                element.setAttribute("class", "selected cut");
            } else {
                element.setAttribute("class", "cut");
            }
            dataModal.selection[itemList[a].getElementsByTagName("label")[0].innerHTML] = itemList[a].getAttribute("class");
        }
        return output;
    },

    /* Remove selections of file system artifacts in a given fileNavigator modal */
    selectNone: function browser_util_selectNone(element:Element):void {
        const box:Element = element.getAncestor("box", "class"),
            fileList:Element = box.getElementsByClassName("fileList")[0] as Element,
            child:Element = (fileList === undefined)
                ? null
                : fileList.firstChild as Element,
            inputs:HTMLCollectionOf<HTMLInputElement> = (fileList === undefined)
                ? null
                : fileList.getElementsByTagName("input"),
            inputLength:number = (fileList === undefined)
                ? 0
                : inputs.length,
            p:HTMLCollectionOf<Element> = (fileList === undefined)
                ? null
                : fileList.getElementsByTagName("p");
        let a:number = 0;
        if (fileList === undefined || document.getElementById("newFileItem") !== null || child.getAttribute("class") === "empty-list") {
            return;
        }
        if (inputLength > 0) {
            do {
                if (inputs[a].type === "checkbox") {
                    inputs[a].checked = false;
                    p[a].removeAttribute("class");
                }
                a = a + 1;
            } while (a < inputLength);
        }
    },

    /* produce a time string from a date object */
    time: function browser_util_time(date:Date):string {
        const hours:string = date.getHours().toString(),
            minutes:string = date.getMinutes().toString(),
            seconds:string = date.getSeconds().toString(),
            pad = function browser_util_time_pad(input:string):string {
                if (input.length === 1) {
                    return `0${input}`;
                }
                return input;
            };
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }

};

export default util;