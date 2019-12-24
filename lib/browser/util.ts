
import audio from "./audio.js";
import browser from "./browser.js";
import context from "./context.js";
import fs from "./fs.js";
import network from "./network.js";
import share from "./share.js";

const util:module_util = {},
    expression:RegExp = new RegExp("(\\s+((selected)|(cut)|(lastType)))+");

/* Adds users to the user bar */
util.addUser = function local_util_addUser(user:string):void {
    const li:HTMLLIElement = document.createElement("li"),
        button:HTMLElement = document.createElement("button"),
        name:string = (user.lastIndexOf("@localhost") === user.length - "@localhost".length)
            ? "localhost"
            : user,
        addStyle = function local_util_addUser_addStyle() {
            let body:string,
                heading:string;
            const prefix:string = `#spaces .box[data-agent="${user}"] `,
                generateColor = function local_util_addUser_addStyle_generateColor():void {
                    const rand:[number, number, number] = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)],
                        code1:string[] = ["#"],
                        code2:string[] = ["#"];
                    rand.forEach(function local_util_addUser_addStyle_generateColor_each(value:number) {
                        if (value < 4) {
                            code1.push("d");
                            code2.push("c");
                        } else if (value < 7) {
                            code1.push("e");
                            code2.push("d");
                        } else {
                            code1.push("f");
                            code2.push("e");
                        }
                    });
                    body = code1.join("");
                    heading = code2.join("");
                };
            if (browser.users[user].color[0] === "") {
                generateColor();
                if (body.charAt(1) === body.charAt(2) && body.charAt(2) === body.charAt(3)) {
                    do {
                        generateColor();
                    } while (body.charAt(1) === body.charAt(2) && body.charAt(2) === body.charAt(3));
                }
                browser.users[user].color = [body, heading];
            } else {
                body = browser.users[user].color[0];
                heading = browser.users[user].color[1];
            }
            browser.style.innerHTML = browser.style.innerHTML + [
                `#spaces #users button[data-agent="${user}"],${prefix}.status-bar,${prefix}.footer,${prefix} h2.heading{background-color:${heading}}`,
                `${prefix}.body,#spaces #users button[data-agent="${user}"]:hover{background-color:${body}}`
            ].join("");
        },
        sharesModal = function local_util_addUser_sharesModal(event:MouseEvent) {
            let element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
                name:string;
            if (element.nodeName.toLowerCase() !== "button") {
                do {
                    element = <HTMLElement>element.parentNode;
                } while (element.nodeName.toLowerCase() !== "button" && element !== document.documentElement);
            }
            name = element.lastChild.textContent.replace(/^\s+/, "");
            share.modal(event, name, null);
        },
        modals:string[] = Object.keys(browser.data.modals),
        length: number = modals.length;
    let a:number = 0,
        shareUser:HTMLElement;
    button.innerHTML = `<em class="status-active">●<span> Active</span></em><em class="status-idle">●<span> Idle</span></em><em class="status-offline">●<span> Offline</span></em> ${user}`;
    if (name === "localhost") {
        button.setAttribute("class", "active");
    } else {
        button.setAttribute("class", "offline");
        button.setAttribute("data-agent", user);
        addStyle();
    }
    button.onclick = sharesModal;
    li.appendChild(button);
    document.getElementById("users").getElementsByTagName("ul")[0].appendChild(li);
    if (name === "localhost") {
        button.setAttribute("id", "localhost");
    }
    if (browser.loadTest === false) {
        do {
            if (browser.data.modals[modals[a]].type === "shares" && browser.data.modals[modals[a]].agent === "") {
                shareUser = document.createElement("li");
                shareUser.appendChild(share.content(user));
                document.getElementById(modals[a]).getElementsByClassName("userList")[0].appendChild(shareUser);
            }
            a = a + 1;
        } while (a < length);
    }
    network.storage("users", false);
};

util.audio = function local_util_audio(name:string):void {
    const context:AudioContext = new AudioContext(),
        binary:BinaryType = <BinaryType>window.atob(audio[name].data),
        source:AudioBufferSourceNode  = context.createBufferSource(),
        buff:ArrayBuffer   = new ArrayBuffer(binary.length),
        bytes:Uint8Array   = new Uint8Array(buff),
        byteLength:number = buff.byteLength;
    let a:number       = 0;
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
util.delay = function local_util_delay():HTMLElement {
    const div:HTMLElement = document.createElement("div"),
        text:HTMLElement = document.createElement("p"),
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
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        list:HTMLElement = (function local_util_dragBox_list():HTMLElement {
            if (element.getAttribute("class") === "fileList") {
                return element;
            }
            let el:HTMLElement = element;
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.getAttribute("class") !== "fileList");
            return el;
        }()),
        body:HTMLElement = (function local_util_dragBox_body():HTMLElement {
            let el:HTMLElement = list;
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.getAttribute("class") !== "body");
            return el;
        }()),
        box:HTMLElement = (function local_util_dragBox_box():HTMLElement {
            let el:HTMLElement = body;
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.getAttribute("class") !== "box");
            return el;
        }()),
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
                    drag.style.height = `${(y - clientY) / 10}em`;
                    drag.style.top = `${(clientY - offsetTop) / 10}em`;
                    if (clientY < (viewportY - bodyHeight - 50)) {
                        body.scrollTop = body.scrollTop - ((viewportY - bodyHeight - 50) - clientY);
                        viewportY = clientY + bodyHeight + 50;
                    }
                }
            } else {
                // drag down
                if (clientY < maxDown) {
                    drag.style.height = `${(clientY - y) / 10}em`;
                    drag.style.top = `${(y - offsetTop) / 10}em`;
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
util.dragList = function local_util_dragList(event:MouseEvent, dragBox:HTMLElement):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
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
        dragArea:perimeter = perimeter(dragBox);
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
    const data:copyStatus = JSON.parse(text.slice("fileListStatus:".length)),
        modals:HTMLElement[] = (data.target.indexOf("remote-") === 0)
            ? [document.getElementById(data.target.replace("remote-", ""))]
            : (function local_util_fileListStatus_modals():HTMLElement[] {
                const names:string[] = Object.keys(browser.data.modals),
                    address:string = data.target.replace("local-", ""),
                    namesLength:number = names.length,
                    output:HTMLElement[] = [];
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
        fails:HTMLElement = document.createElement("ul"),
        length:number = modals.length;
    let statusBar:HTMLElement,
        list:HTMLElement,
        p:HTMLElement,
        clone:HTMLElement,
        a:number = 0;
    if (length > 0) {
        if (failLength > 0) {
            let b:number = 0,
                li:HTMLElement;
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
    document.getElementById("users").style.height = `${(height - 102) / 10}em`;
};

/* Get the agent of a given modal */
util.getAgent = function local_util_getAgent(element:HTMLElement):[string, boolean] {
    const box:HTMLElement = (element.getAttribute("class") === "box")
        ? element
        : (function local_util_getAgent_box():HTMLElement {
            let boxEl:HTMLElement = element;
            do {
                boxEl = <HTMLElement>boxEl.parentNode;
            } while (boxEl !== document.documentElement && boxEl.getAttribute("class") !== "box");
            return boxEl;
        }()),
    id:string = box.getAttribute("id");
    return [browser.data.modals[id].agent, browser.data.modals[id].read_only];
};

/* Shortcut key combinations */
util.keys = function local_util_keys(event:KeyboardEvent):void {
    const key:number = event.keyCode,
        element:HTMLElement = (function local_util_keys_element():HTMLElement {
            let el:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
            if (el.parentNode === null || el.nodeName.toLowerCase() === "li" || el.nodeName.toLowerCase() === "ul") {
                return el;
            }
            do {
                el = <HTMLElement>el.parentNode;
            } while (el !== document.documentElement && el.nodeName.toLowerCase() !== "li");
            return el;
        }());
    if (key === 116 || (event.ctrlKey === true && key === 82)) {
        location.reload();
    }
    if (element.parentNode === null || document.activeElement === document.getElementById("newFileItem")) {
        return;
    }
    event.preventDefault();
    if (element.nodeName.toLowerCase() !== "ul") {
        event.stopPropagation();
    }
    if (key === 46) {
        context.element = element;
        context.destroy(event);
    } else if (event.altKey === true && event.ctrlKey === true) {
        if (key === 66 && element.nodeName.toLowerCase() === "li") {
            // key b, base64
            context.element = element;
            context.type = "Base64";
            context.dataString(event);
        } else if (key === 68) {
            // key d, new directory
            context.element = element;
            context.type = "directory";
            context.fsNew;
        } else if (key === 69) {
            // key e, edit file
            context.element = element;
            context.type = "Edit";
            context.dataString(event);
        } else if (key === 70) {
            // key f, new file
            context.element = element;
            context.type = "file";
            context.fsNew;
        } else if (key === 72 && element.nodeName.toLowerCase() === "li") {
            // key h, hash
            context.element = element;
            context.type = "Hash";
            context.dataString(event);
        } else if (key === 82 && element.nodeName.toLowerCase() === "li") {
            // key r, rename
            fs.rename(event);
        } else if (key === 83) {
            // key s, share
            context.element = element;
            share.context(event);
        } else if (key === 84) {
            // key t, details
            context.details(event, element);
        }
    } else if (event.ctrlKey === true) {
        if (key === 65) {
            // key a, select all
            const list:HTMLElement = (element.nodeName.toLowerCase() === "ul")
                    ? element
                    : <HTMLElement>element.parentNode,
                items:HTMLCollectionOf<HTMLElement> = list.getElementsByTagName("li"),
                length:number = items.length;
            let a:number = 0;
            do {
                items[a].setAttribute("class", `${items[a].getAttribute("class").replace(" selected", "")} selected`);
                items[a].getElementsByTagName("input")[0].checked = true;
                a = a + 1;
            } while (a < length);
        } else if (key === 67) {
            // key c, copy
            context.element = element;
            context.type = "copy";
            context.copy(event);
        } else if (key === 68 && element.nodeName.toLowerCase() === "li") {
            // key d, destroy
            context.element = element;
            context.destroy(event);
        } else if (key === 86) {
            // key v, paste
            context.element = element;
            context.paste(event);
        } else if (key === 88) {
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
util.minimizeAll = function local_util_minimizeAll(event:MouseEvent) {
    const keys:string[] = Object.keys(browser.data.modals),
        length:number = keys.length;
    let a:number = 0,
        status:modalStatus,
        minimize:HTMLButtonElement;
    do {
        status = browser.data.modals[keys[a]].status;
        if (status === "normal" || status === "maximized") {
            minimize = <HTMLButtonElement>document.getElementById(keys[a]).getElementsByClassName("minimize")[0];
            minimize.click();
        }
        a = a + 1;
    } while (a < length);
};

/* Gather the selected addresses and types of file system artifacts in a fileNavigator modal */
util.selectedAddresses = function local_util_selectedAddresses(element:HTMLElement, type:string):[string, string][] {
    const output:[string, string][] = [],
        parent:HTMLElement = <HTMLElement>element.parentNode,
        drag:boolean = (parent.getAttribute("id") === "file-list-drag");
    let a:number = 0,
        length:number = 0,
        itemList:HTMLCollectionOf<HTMLElement>,
        addressItem:HTMLElement;
    if (element.nodeName.toLowerCase() !== "li") {
        element = <HTMLElement>element.parentNode;
    }
    itemList = (drag === true)
        ? parent.getElementsByTagName("li")
        : (function local_util_selectedAddresses_box():HTMLCollectionOf<HTMLElement> {
            let box:HTMLElement = element;
            if (box.getAttribute("class") !== "box") {
                do {
                    box = <HTMLElement>box.parentNode;
                } while (box !== document.documentElement && box.getAttribute("class") !== "box");
            }
            return box.getElementsByClassName("fileList")[0].getElementsByTagName("li");
        }());
    length = itemList.length;
    do {
        if (itemList[a].getElementsByTagName("input")[0].checked === true) {
            addressItem = (itemList[a].firstChild.nodeName.toLowerCase() === "button")
                ? <HTMLElement>itemList[a].firstChild.nextSibling
                : <HTMLElement>itemList[a].firstChild;
            output.push([addressItem.innerHTML, itemList[a].getAttribute("class").replace(expression, "")]);
            if (type === "cut") {
                itemList[a].setAttribute("class", itemList[a].getAttribute("class").replace(expression, " cut"));
            }
        } else {
            itemList[a].setAttribute("class", itemList[a].getAttribute("class").replace(expression, ""));
        }
        a = a + 1;
    } while (a < length);
    if (output.length > 0) {
        return output;
    }
    output.push([element.getElementsByTagName("label")[0].innerHTML, element.getAttribute("class")]);
    if (type === "cut") {
        element.setAttribute("class", element.getAttribute("class").replace(expression, " cut"));
    }
    return output;
};

/* Remove selections of file system artifacts in a given fileNavigator modal */
util.selectNone = function local_util_selectNone(element:HTMLElement):void {
    let a:number = 0,
        inputLength:number,
        li:HTMLCollectionOf<HTMLElement>,
        inputs:HTMLCollectionOf<HTMLInputElement>,
        box:HTMLElement = element,
        fileList:HTMLElement;
    if (document.getElementById("newFileItem") !== null) {
        return;
    }
    if (box.getAttribute("class") !== "box") {
        do {
            box = <HTMLElement>box.parentNode;
        } while (box !== document.documentElement && box.getAttribute("class") !== "box");
    }
    fileList = <HTMLElement>box.getElementsByClassName("fileList")[0];
    inputs = fileList.getElementsByTagName("input");
    li = fileList.getElementsByTagName("li");
    inputLength = inputs.length;
    if (inputLength > 0) {
        do {
            if (inputs[a].type === "checkbox") {
                inputs[a].checked = false;
                li[a].setAttribute("class", li[a].getAttribute("class").replace(expression, ""));
            }
            a = a + 1;
        } while (a < inputLength);
    }
};

export default util;