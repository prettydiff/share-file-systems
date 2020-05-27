
/* lib/browser/util - Miscellaneous tools for the browser environment. */
import audio from "./audio.js";
import browser from "./browser.js";
import context from "./context.js";
import fs from "./fs.js";
import network from "./network.js";
import share from "./share.js";

const util:module_util = {};

util.audio = function local_util_audio(name:string):void {
    const context:AudioContext = new AudioContext(),
        binary:BinaryType = <BinaryType>window.atob(audio[name].data),
        source:AudioBufferSourceNode  = context.createBufferSource(),
        buff:ArrayBuffer   = new ArrayBuffer(binary.length),
        bytes:Uint8Array   = new Uint8Array(buff),
        byteLength:number = buff.byteLength;
    let a:number       = 0;
    if (browser.data.audio === false) {
        return;
    }
    do {
        bytes[a] = binary.charCodeAt(a);
        a = a + 1;
    } while (a < byteLength);
    context.decodeAudioData(buff, function load_util_audio_decode(buffer:AudioBuffer):void {
        source.buffer = buffer;
        source.loop   = false;
        source.connect(context.destination);
        source.start(0, 0, audio[name].seconds);
    });
};

/* Converts a date object into US Army date format */
util.dateFormat = function local_util_dateFormat(date:Date):string {
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
util.delay = function local_util_delay():Element {
    const div:Element = document.createElement("div"),
        text:Element = document.createElement("p"),
        svg:Element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // cspell:disable
    svg.setAttribute("viewBox", "0 0 57 57");
    svg.innerHTML = `<g fill="none" fill-rule="evenodd"><g transform="translate(1 1)" stroke-width="2"><circle cx="5" cy="50" r="5"><animate attributeName="cy" begin="0s" dur="2.2s" values="50;5;50;50" calcMode="linear" repeatCount="indefinite"/><animate attributeName="cx" begin="0s" dur="2.2s" values="5;27;49;5" calcMode="linear" repeatCount="indefinite"/></circle><circle cx="27" cy="5" r="5"><animate attributeName="cy" begin="0s" dur="2.2s" from="5" to="5" values="5;50;50;5" calcMode="linear" repeatCount="indefinite"/><animate attributeName="cx" begin="0s" dur="2.2s" from="27" to="27" values="27;49;5;27" calcMode="linear" repeatCount="indefinite"/></circle><circle cx="49" cy="50" r="5"><animate attributeName="cy" begin="0s" dur="2.2s" values="50;50;5;50" calcMode="linear" repeatCount="indefinite"/><animate attributeName="cx" from="49" to="49" begin="0s" dur="2.2s" values="49;5;27;49" calcMode="linear" repeatCount="indefinite"/></circle></g></g>`;
    //svg.setAttribute("viewBox", "0 0 44 44");
    //svg.innerHTML = `<g fill="none" fill-rule="evenodd" stroke-width="2"><circle cx="22" cy="22" r="1"><animate attributeName="r" begin="0s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/><animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/></circle><circle cx="22" cy="22" r="1"><animate attributeName="r" begin="-0.9s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/><animate attributeName="stroke-opacity" begin="-0.9s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/></circle></g>`;
    // cspell:enable
    text.innerHTML = "Waiting on data. Please stand by.";
    div.setAttribute("class", "delay");
    div.appendChild(svg);
    div.appendChild(text);
    return div;
};

/* Drag a selection box to capture a collection of items into a selection */
util.dragBox = function local_util_dragBox(event:Event, callback:Function):void {
    const element:Element = <Element>event.srcElement || <Element>event.target,
        list:Element = element.getAncestor("fileList", "class"),
        body:HTMLElement = <HTMLElement>list.getAncestor("body", "class"),
        box:HTMLElement = <HTMLElement>body.getAncestor("box", "class"),
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
        mouseEvent = <MouseEvent>event,
        touchEvent = <TouchEvent>event,
        x:number = (touch === true)
            ? touchEvent.touches[0].clientX
            : mouseEvent.clientX,
        y:number = (touch === true)
            ? touchEvent.touches[0].clientY
            : mouseEvent.clientY,   
        drop       = function local_util_dragBox_drop(e:Event):boolean {
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
            network.storage("settings");
            e.preventDefault();
            setTimeout(function local_util_dragBox_drop_scroll():void {
                body.scrollLeft = bodyScrollLeft;
                body.scrollTop = bodyScrollTop;
            }, 5);
            return false;
        },
        boxMove = function local_util_dragBox_boxMove(moveEvent:MouseEvent|TouchEvent):boolean {
            const touchEvent:TouchEvent = (touch === true)
                    ? <TouchEvent>moveEvent
                    : null,
                mouseEvent:MouseEvent = (touch === true)
                    ? null
                    : <MouseEvent>moveEvent,
                clientX:number = (touch === true)
                    ? touchEvent.touches[0].clientX
                    : mouseEvent.clientX,
                clientY:number = (touch === true)
                    ? touchEvent.touches[0].clientY
                    : mouseEvent.clientY;
            moveEvent.preventDefault();
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
    if (oldDrag !== null) {
        oldDrag.parentNode.removeChild(oldDrag);
    }
    event.preventDefault();
    drag.setAttribute("id", "dragBox");
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
};

/* Selects list items in response to drawing a drag box */
util.dragList = function local_util_dragList(event:MouseEvent, dragBox:Element):void {
    const element:Element = <Element>event.srcElement || <Element>event.target,
        li:HTMLCollectionOf<HTMLElement> = element.getElementsByTagName("li"),
        length:number = li.length,
        perimeter = function local_util_dragList_perimeter(node:HTMLElement):perimeter {
            return {
                bottom: node.offsetTop + node.clientHeight,
                left: node.offsetLeft,
                right: node.offsetLeft + node.clientWidth,
                top: node.offsetTop
            };
        },
        liLocation:perimeter[] = [],
        dragArea:perimeter = perimeter(<HTMLElement>dragBox);
    let a:number = 0,
        first:number = 0,
        last:number = 0;
    dragBox.parentNode.removeChild(dragBox);
    if (dragArea.bottom < 1) {
        return;
    }
    event.preventDefault();
    if (length > 0) {
        do {
            liLocation.push(perimeter(li[a]));
            a = a + 1;
        } while (a < length);
        // since list items are vertically listed we can account for left and right bounding without a loop
        if (
            // overlap from the middle
            (dragArea.left >= liLocation[0].left && dragArea.right <= liLocation[0].right && (
                (dragArea.bottom >= liLocation[length - 1].bottom && dragArea.top < liLocation[length - 1].bottom) ||
                (dragArea.top <= liLocation[0].top && dragArea.bottom > liLocation[0].top)
            )) ||
            // overlap from the left
            (dragArea.left <= liLocation[0].left && dragArea.right <= liLocation[0].right) ||
            // overlap from the right
            (dragArea.left <= (liLocation[0].left + li[0].clientWidth) && dragArea.right >= liLocation[0].right)
        ) {
            a = 0;
            if (dragArea.bottom > liLocation[length - 1].bottom && dragArea.top < liLocation[length - 1].bottom) {
                last = length - 1;
            }
            do {
                if (liLocation[a].top < dragArea.top) {
                    if (liLocation[a].bottom >= dragArea.bottom) {
                        // drag area covering only a single list item
                        if (event.ctrlKey === true) {
                            fs.dragFlag = "control";
                            li[a].click();
                            fs.dragFlag = "";
                        } else if (event.shiftKey === true) {
                            fs.dragFlag = "shift";
                            li[a].click();
                            fs.dragFlag = "";
                        } else {
                            li[a].click();
                        }
                        return;
                    }
                    if (dragArea.top < liLocation[a].bottom) {
                        first = a;
                        if (dragArea.bottom > liLocation[length - 1].bottom) {
                            break;
                        }
                    }
                } else if (liLocation[a].bottom > dragArea.bottom && dragArea.bottom > liLocation[a].top) {
                    last = a;
                    break;
                }
                a = a + 1;
            } while (a < length);
            if (event.ctrlKey === true) {
                fs.dragFlag = "control";
                a = first;
                last = last + 1;
                do {
                    li[a].click();
                    a = a + 1
                } while (a < last);
            } else {
                if (li[first].getElementsByTagName("input")[0].checked === true) {
                    li[first].click();
                }
                li[first].click();
                fs.dragFlag = "shift";
                li[last].click();
            }
            fs.dragFlag = "";
        }
    }
    return;
};

/* A utility to format and describe status bar messaging in a file navigator modal */
util.fileListStatus = function local_util_fileListStatus(text:string):void {
    const data:copyStatus = JSON.parse(text),
        modals:Element[] = (data.target.indexOf("remote-") === 0)
            ? [document.getElementById(data.target.replace("remote-", ""))]
            : (function local_util_fileListStatus_modals():Element[] {
                const names:string[] = Object.keys(browser.data.modals),
                    address:string = data.target.replace("local-", ""),
                    namesLength:number = names.length,
                    output:Element[] = [];
                let b:number = 0;
                do {
                    if (browser.data.modals[names[b]].text_value === address) {
                        output.push(document.getElementById(names[b]));
                    }
                    b = b + 1;
                } while (b < namesLength);
                return output;
            }()),
        failLength:number = Math.min(10, data.failures.length),
        fails:Element = document.createElement("ul"),
        length:number = modals.length;
    let statusBar:Element,
        list:Element,
        p:Element,
        clone:Element,
        a:number = 0;
    if (length > 0) {
        if (failLength > 0) {
            let b:number = 0,
                li:Element;
            do {
                li = document.createElement("li");
                li.innerHTML = data.failures[b];
                fails.appendChild(li);
                b = b + 1;
            } while (b < failLength);
            if (data.failures.length > 10) {
                li = document.createElement("li");
                li.innerHTML = "more...";
                fails.appendChild(li);
            }
        }
        do {
            if (modals[a] !== null) {
                statusBar = <HTMLElement>modals[a].getElementsByClassName("status-bar")[0];
                list = statusBar.getElementsByTagName("ul")[0];
                p = statusBar.getElementsByTagName("p")[0];
                p.innerHTML = data.message;
                if (list !== undefined) {
                    statusBar.removeChild(list);
                }
                if (failLength > 0) {
                    clone = <HTMLElement>fails.cloneNode(true);
                    statusBar.appendChild(clone);
                }
            }
            a = a + 1;
        } while (a < length);
    }
};

/* Resizes the interactive area to fit the browser viewport */
util.fixHeight = function local_util_fixHeight():void {
    const height:number   = window.innerHeight || document.getElementsByTagName("body")[0].clientHeight;
    document.getElementById("spaces").style.height = `${height / 10}em`;
    browser.content.style.height = `${(height - 51) / 10}em`;
    document.getElementById("agentList").style.height = `${(height - 102) / 10}em`;
};

/* A simple utility to provide form execution to input fields not in a form */
util.formKeys = function local_util_login(event:KeyboardEvent, submit:Function):void {
    const key:string = event.key;
    if (key === "Enter") {
        const element:Element = <Element>event.srcElement || <Element>event.target,
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
};

/* Get the agent of a given modal */
util.getAgent = function local_util_getAgent(element:Element):agency {
    const box:Element = element.getAncestor("box", "class"),
        id:string = box.getAttribute("id");
    let agent:string = browser.data.modals[id].agent;
    if (agent === "" && browser.data.modals[id].type === "shares") {
        const ancestor = element.getAncestor("agent", "class");
        agent = ancestor.getAttribute("data-hash");
    }
    return [agent, browser.data.modals[id].read_only, browser.data.modals[id].agentType];
};

/* Shortcut key combinations */
util.keys = function local_util_keys(event:KeyboardEvent):void {
    const key:string = event.key,
        element:Element = (function local_util_keys_element():Element {
            let el:Element = <Element>event.srcElement || <Element>event.target;
            if (el.parentNode === null || el.nodeName.toLowerCase() === "li" || el.nodeName.toLowerCase() === "ul") {
                return el;
            }
            return el.getAncestor("li", "tag");
        }());
    if (key === "F5" || key === "f5" || (event.ctrlKey === true && (key === "r" || key === "R"))) {
        location.reload();
    }
    if (element.parentNode === null || document.activeElement === document.getElementById("newFileItem")) {
        return;
    }
    event.preventDefault();
    if (element.nodeName.toLowerCase() !== "ul") {
        event.stopPropagation();
    }
    if (key === "Delete" || key === "DEL") {
        context.element = element;
        context.destroy(event);
    } else if (event.altKey === true && event.ctrlKey === true) {
        if ((key === "b" || key === "B") && element.nodeName.toLowerCase() === "li") {
            // key b, base64
            context.element = element;
            context.type = "Base64";
            context.dataString(event);
        } else if (key === "d" || key === "D") {
            // key d, new directory
            context.element = element;
            context.type = "directory";
            context.fsNew;
        } else if (key === "e" || key === "E") {
            // key e, edit file
            context.element = element;
            context.type = "Edit";
            context.dataString(event);
        } else if (key === "f" || key === "F") {
            // key f, new file
            context.element = element;
            context.type = "file";
            context.fsNew;
        } else if ((key === "h" || key === "H") && element.nodeName.toLowerCase() === "li") {
            // key h, hash
            context.element = element;
            context.type = "Hash";
            context.dataString(event);
        } else if ((key === "r" || key === "R") && element.nodeName.toLowerCase() === "li") {
            // key r, rename
            fs.rename(event);
        } else if (key === "s" || key === "S") {
            // key s, share
            context.element = element;
            share.context(event);
        } else if (key === "t" || key === "T") {
            // key t, details
            context.details(event, element);
        }
    } else if (event.ctrlKey === true) {
        if (key === "a" || key === "A") {
            // key a, select all
            const list:Element = (element.nodeName.toLowerCase() === "ul")
                    ? element
                    : <Element>element.parentNode,
                items:HTMLCollectionOf<Element> = list.getElementsByTagName("li"),
                length:number = items.length;
            let a:number = 0;
            do {
                items[a].setAttribute("class", `${items[a].getAttribute("class").replace(" selected", "")} selected`);
                items[a].getElementsByTagName("input")[0].checked = true;
                a = a + 1;
            } while (a < length);
        } else if (key === "c" || key === "C") {
            // key c, copy
            context.element = element;
            context.type = "copy";
            context.copy(event);
        } else if ((key === "d" || key === "D") && element.nodeName.toLowerCase() === "li") {
            // key d, destroy
            context.element = element;
            context.destroy(event);
        } else if (key === "v" || key === "V") {
            // key v, paste
            context.element = element;
            context.paste(event);
        } else if (key === "x" || key === "X") {
            // key x, cut
            context.element = element;
            context.type = "cut";
            context.copy(event);
        }
    }
};

/* Show/hide for the primary application menu that hangs off the title bar */
util.menu = function local_util_menu():void {
    const menu:HTMLElement = document.getElementById("menu"),
        move = function local_util_menu_move(event:MouseEvent):void {
            const menu:HTMLElement = document.getElementById("menu");
            if (event.clientX > menu.clientWidth || event.clientY > menu.clientHeight + 51) {
                menu.style.display = "none";
                document.onmousemove = null;
            }
        };
    menu.style.display = "block";
    document.onmousemove = move;
};

/* Minimize all modals to the bottom tray that are of modal status: normal and maximized */
util.minimizeAll = function local_util_minimizeAll() {
    const keys:string[] = Object.keys(browser.data.modals),
        length:number = keys.length;
    let a:number = 0,
        status:modalStatus,
        minimize:HTMLButtonElement;
    util.minimizeAllFlag = true;
    do {
        status = browser.data.modals[keys[a]].status;
        if (status === "normal" || status === "maximized") {
            minimize = <HTMLButtonElement>document.getElementById(keys[a]).getElementsByClassName("minimize")[0];
            if (minimize !== undefined) {
                minimize.click();
            }
        }
        a = a + 1;
    } while (a < length);
    util.minimizeAllFlag = false;
    network.storage("settings");
};

util.minimizeAllFlag = false;

/* Gather the selected addresses and types of file system artifacts in a fileNavigator modal */
util.selectedAddresses = function local_util_selectedAddresses(element:Element, type:string):[string, shareType, string][] {
    const output:[string, shareType, string][] = [],
        parent:Element = <Element>element.parentNode,
        agent:string = util.getAgent(element)[0],
        drag:boolean = (parent.getAttribute("id") === "file-list-drag");
    let a:number = 0,
        length:number = 0,
        itemList:HTMLCollectionOf<Element>,
        box:Element,
        dataModal:ui_modal,
        addressItem:Element;
    if (element.nodeName.toLowerCase() !== "li") {
        element = <Element>element.parentNode;
    }
    box = element.getAncestor("box", "class");
    dataModal = browser.data.modals[box.getAttribute("id")];
    itemList = (drag === true)
        ? parent.getElementsByTagName("li")
        : box.getElementsByClassName("fileList")[0].getElementsByTagName("li");
    length = itemList.length;
    do {
        if (itemList[a].getElementsByTagName("input")[0].checked === true) {
            addressItem = (itemList[a].firstChild.nodeName.toLowerCase() === "button")
                ? <Element>itemList[a].firstChild.nextSibling
                : <Element>itemList[a].firstChild;
            output.push([addressItem.innerHTML, <shareType>itemList[a].getAttribute("class").replace(util.selectExpression, ""), agent]);
            if (type === "cut") {
                itemList[a].setAttribute("class", itemList[a].getAttribute("class").replace(util.selectExpression, " cut"));
                dataModal.selection[itemList[a].getElementsByTagName("label")[0].innerHTML] = itemList[a].getAttribute("class");
            }
        } else {
            itemList[a].setAttribute("class", itemList[a].getAttribute("class").replace(util.selectExpression, ""));
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
    output.push([element.getElementsByTagName("label")[0].innerHTML, <shareType>element.getAttribute("class"), agent]);
    if (type === "cut") {
        element.setAttribute("class", element.getAttribute("class").replace(util.selectExpression, " cut"));
        dataModal.selection[itemList[a].getElementsByTagName("label")[0].innerHTML] = itemList[a].getAttribute("class");
    }
    return output;
};

util.selectExpression = new RegExp("(\\s+((selected)|(cut)|(lastType)))+");

/* Remove selections of file system artifacts in a given fileNavigator modal */
util.selectNone = function local_util_selectNone(element:Element):void {
    const box:Element = element.getAncestor("box", "class");
    let a:number = 0,
        inputLength:number,
        li:HTMLCollectionOf<Element>,
        inputs:HTMLCollectionOf<HTMLInputElement>,
        fileList:Element;
    if (document.getElementById("newFileItem") !== null) {
        return;
    }
    fileList = <Element>box.getElementsByClassName("fileList")[0];
    inputs = fileList.getElementsByTagName("input");
    li = fileList.getElementsByTagName("li");
    inputLength = inputs.length;
    if (inputLength > 0) {
        do {
            if (inputs[a].type === "checkbox") {
                inputs[a].checked = false;
                li[a].setAttribute("class", li[a].getAttribute("class").replace(util.selectExpression, ""));
            }
            a = a + 1;
        } while (a < inputLength);
    }
};

export default util;