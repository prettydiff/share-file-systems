
/* lib/browser/utilities/util - Miscellaneous tools for the browser environment. */
import audio from "./audio.js";
import browser from "./browser.js";
import context from "../content/context.js";
import file_browser from "../content/file_browser.js";
import network from "./network.js";
import share from "../content/share.js";

/**
 * A list of common tools that only apply to the browser side of the application.
 * ```typescript
 * interface module_util {
 *     audio            : (name:string) => void;                             // Plays audio in the browser.
 *     delay            : () => Element;                                     // Create a div element with a spinner and class name of 'delay'.
 *     dragBox          : eventCallback;                                     // Draw a selection box to capture a collection of items into a selection.
 *     dragList         : (event:MouseEvent, dragBox:Element) => void;       // Selects list items in response to drawing a drag box.
 *     fileAgent        : (element:Element, copyElement:Element, address?:string) => [fileAgent, fileAgent, fileAgent]; // Produces fileAgent objects for service_fileSystem and service_copy.
 *     fixHeight        : () => void;                                        // Resizes the interactive area to fit the browser viewport.
 *     formKeys         : (event:KeyboardEvent, submit:() => void) => void;  // Provides form execution on key down of 'Enter' key to input fields not in a form.
 *     getAgent         : (element:Element) => agency;                       // Get the agent of a given modal.
 *     keys             : (event:KeyboardEvent) => void;                     // Executes shortcut key combinations.
 *     name             : (item:Element) => string;                          // Get a lowercase node name for a given element.
 *     radioListItem    : (config:config_radioListItem) => void) => Element; // Creates a radio button inside a list item element.
 *     sanitizeHTML     : (input:string) => string;                          // Make a string safe to inject via innerHTML.
 *     screenPosition   : (node:Element) => DOMRect;                         // Gathers the view port position of an element.
 *     selectedAddresses: (element:Element, type:string) => [string, fileType, string][]; // Gather the selected addresses and types of file system artifacts in a fileNavigator modal.
 *     selectNone       : (element:Element) => void;                         // Remove selections of file system artifacts in a given fileNavigator modal.
 * }
 * type agency = [string, boolean, agentType];
 * type eventCallback = (event:Event, callback:(event:MouseEvent, dragBox:Element) => void) => void;
 * type fileType = "directory" | "file" | "link";
 * ``` */
const util:module_util = {

    /* Play audio in the browser */
    audio: function browser_utilities_util_audio(name:string):void {
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

    /* Create a div element with a spinner and class name of 'delay'. */
    delay: function browser_utilities_util_delay():Element {
        const div:Element = document.createElement("div"),
            text:Element = document.createElement("p"),
            svg:Element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 57 57");
        svg.innerHTML = "<g fill=\"none\" fill-rule=\"evenodd\"><g transform=\"translate(1 1)\" stroke-width=\"2\"><circle cx=\"5\" cy=\"50\" r=\"5\"><animate attributeName=\"cy\" begin=\"0s\" dur=\"2.2s\" values=\"50;5;50;50\" calcMode=\"linear\" repeatCount=\"indefinite\"/><animate attributeName=\"cx\" begin=\"0s\" dur=\"2.2s\" values=\"5;27;49;5\" calcMode=\"linear\" repeatCount=\"indefinite\"/></circle><circle cx=\"27\" cy=\"5\" r=\"5\"><animate attributeName=\"cy\" begin=\"0s\" dur=\"2.2s\" from=\"5\" to=\"5\" values=\"5;50;50;5\" calcMode=\"linear\" repeatCount=\"indefinite\"/><animate attributeName=\"cx\" begin=\"0s\" dur=\"2.2s\" from=\"27\" to=\"27\" values=\"27;49;5;27\" calcMode=\"linear\" repeatCount=\"indefinite\"/></circle><circle cx=\"49\" cy=\"50\" r=\"5\"><animate attributeName=\"cy\" begin=\"0s\" dur=\"2.2s\" values=\"50;50;5;50\" calcMode=\"linear\" repeatCount=\"indefinite\"/><animate attributeName=\"cx\" from=\"49\" to=\"49\" begin=\"0s\" dur=\"2.2s\" values=\"49;5;27;49\" calcMode=\"linear\" repeatCount=\"indefinite\"/></circle></g></g>";
        //svg.setAttribute("viewBox", "0 0 44 44");
        //svg.innerHTML = "<g fill=\"none\" fill-rule=\"evenodd\" stroke-width=\"2\"><circle cx=\"22\" cy=\"22\" r=\"1\"><animate attributeName=\"r\" begin=\"0s\" dur=\"1.8s\" values=\"1; 20\" calcMode=\"spline\" keyTimes=\"0; 1\" keySplines=\"0.165, 0.84, 0.44, 1\" repeatCount=\"indefinite\"/><animate attributeName=\"stroke-opacity\" begin=\"0s\" dur=\"1.8s\" values=\"1; 0\" calcMode=\"spline\" keyTimes=\"0; 1\" keySplines=\"0.3, 0.61, 0.355, 1\" repeatCount=\"indefinite\"/></circle><circle cx=\"22\" cy=\"22\" r=\"1\"><animate attributeName=\"r\" begin=\"-0.9s\" dur=\"1.8s\" values=\"1; 20\" calcMode=\"spline\" keyTimes=\"0; 1\" keySplines=\"0.165, 0.84, 0.44, 1\" repeatCount=\"indefinite\"/><animate attributeName=\"stroke-opacity\" begin=\"-0.9s\" dur=\"1.8s\" values=\"1; 0\" calcMode=\"spline\" keyTimes=\"0; 1\" keySplines=\"0.3, 0.61, 0.355, 1\" repeatCount=\"indefinite\"/></circle></g>";
        text.innerHTML = "Waiting on data. Please stand by.";
        div.setAttribute("class", "delay");
        div.appendChild(svg);
        div.appendChild(text);
        return div;
    },

    /* Draw a selection box to capture a collection of items into a selection. */
    dragBox: function browser_utilities_util_dragBox(event:Event, callback:(event:MouseEvent, drag:Element) => void):void {
        const element:Element = event.target as Element,
            list:Element = element.getAncestor("fileList", "class"),
            body:HTMLElement = list.getAncestor("body", "class"),
            box:HTMLElement = body.getAncestor("box", "class"),
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
            drop       = function browser_utilities_util_dragBox_drop(e:Event):boolean {
                callback(event as MouseEvent, drag);
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
                network.configuration();
                e.preventDefault();
                setTimeout(function browser_utilities_util_dragBox_drop_scroll():void {
                    body.scrollLeft = bodyScrollLeft;
                    body.scrollTop = bodyScrollTop;
                }, 5);
                return false;
            },
            boxMove = function browser_utilities_util_dragBox_boxMove(moveEvent:MouseEvent|TouchEvent):boolean {
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

    /* Selects list items in response to drawing a drag box. */
    dragList: function browser_utilities_util_dragList(event:MouseEvent, dragBox:Element):void {
        const element:Element = event.target as Element,
            li:HTMLCollectionOf<HTMLElement> = element.getElementsByTagName("li"),
            length:number = li.length,
            dragLocation:DOMRect = util.screenPosition(dragBox),
            control:boolean = (event.ctrlKey === true),
            shift:boolean = (event.shiftKey === true);
        let a:number = 0,
            item:DOMRect,
            first:number = null,
            last:number = null;
        if (dragBox.parentNode !== null) {
            dragBox.parentNode.removeChild(dragBox);
        }
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
                        file_browser.dragFlag = "control";
                        li[a].getElementsByTagName("p")[0].click();
                        file_browser.dragFlag = "";
                    } else if (shift === true) {
                        file_browser.dragFlag = "shift";
                        li[a].getElementsByTagName("p")[0].click();
                        file_browser.dragFlag = "";
                    } else {
                        li[a].getElementsByTagName("p")[0].click();
                    }
                } else {
                    if (control === true) {
                        file_browser.dragFlag = "control";
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
                        file_browser.dragFlag = "shift";
                        li[last].getElementsByTagName("p")[0].click();
                    }
                    file_browser.dragFlag = "";
                }
            }
        }
    },

    /* A boilerplate function to produce fileAgent data types used with service_fileSystem and service_copy */
    fileAgent: function browser_utilities_util_fileAgent(element:Element, copyElement:Element, address?:string):[fileAgent, fileAgent, fileAgent] {
        if (element === null) {
            return [null, null, null];
        }
        const box:Element = element.getAncestor("box", "class"),
            agency:agency = util.getAgent(box),
            modalAddress:string = (address === null || address === undefined)
                ? box.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value
                : address,
            share:string = browser.data.modals[box.getAttribute("id")].share;
        if (box === null || box === document.documentElement) {
            return [null, null, null];
        }
        return [
            // agentRequest
            {
                device: browser.data.hashDevice,
                modalAddress: "",
                share: "",
                user: browser.data.hashUser
            },
            // agentSource
            {
                device: (agency[2] === "device")
                    ? agency[0]
                    : "",
                modalAddress: modalAddress,
                share: share,
                user: (agency[2] === "device")
                    ? browser.data.hashUser
                    : agency[0]
            },
            // agentWrite - used with service_copy but not service_fileSystem
            (copyElement === null)
                ? null
                : (function browser_utilities_util_fileAgent_copyElement():fileAgent {
                    const copyBox:Element = copyElement.getAncestor("box", "class"),
                        copyId:string = copyBox.getAttribute("id"),
                        copyData:config_modal = browser.data.modals[copyId];
                    return {
                        device: (copyData.agentType === "device")
                            ? copyData.agent
                            : "",
                        modalAddress: copyBox.getElementsByClassName("fileAddress")[0].getElementsByTagName("input")[0].value,
                        share: copyData.share,
                        user: (copyData.agentType === "device")
                            ? browser.data.hashUser
                            : copyData.agent
                    };
                }())
        ];
    },

    /* Resizes the interactive area to fit the browser viewport. */
    fixHeight: function browser_utilities_util_fixHeight():void {
        const height:number   = window.innerHeight || document.getElementsByTagName("body")[0].clientHeight;
        document.getElementById("spaces").style.height = `${height / 10}em`;
        browser.content.style.height = `${(height - 51) / 10}em`;
        document.getElementById("agentList").style.height = `${(window.innerHeight - 80) / 10}em`;
        document.getElementById("tray").style.width = `${(window.innerWidth - 17.5) / 10}em`;
    },

    /* Provides form execution to input fields not in a form. */
    formKeys: function browser_utilities_util_formKeys(event:KeyboardEvent, submit:() => void):void {
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

    /* Get the agent of a given modal. */
    getAgent: function browser_utilities_util_getAgent(element:Element):agency {
        const box:Element = element.getAncestor("box", "class"),
            id:string = box.getAttribute("id");
        let agent:string = browser.data.modals[id].agent;
        if (agent === "" && browser.data.modals[id].type === "shares") {
            const ancestor:HTMLElement = element.getAncestor("agent", "class");
            agent = ancestor.dataset.hash;
        }
        return [agent, browser.data.modals[id].read_only, browser.data.modals[id].agentType];
    },

    /* Executes shortcut key combinations. */
    keys: function browser_utilities_util_keys(event:KeyboardEvent):void {
        const key:string = event.key.toLowerCase(),
            windowEvent:KeyboardEvent = window.event as KeyboardEvent,
            element:Element = (function browser_utilities_util_keys_element():Element {
                let el:Element = document.activeElement;
                const name:string = util.name(el);
                if (el.parentNode === null || name === "li" || name === "ul") {
                    return el;
                }
                return el.getAncestor("li", "tag");
            }()),
            input:HTMLInputElement = event.target as HTMLInputElement,
            elementName:string = util.name(element),
            p:Element = element.getElementsByTagName("p")[0];
        if (key === "f5" || (windowEvent.ctrlKey === true && key === "r")) {
            location.reload();
        }
        if ((util.name(event.target as Element) === "input" && input.type === "text") || element.parentNode === null || document.activeElement === document.getElementById("newFileItem")) {
            return;
        }
        if (key === "enter" && elementName === "li" && (element.getAttribute("class") === "directory" || element.getAttribute("class") === "directory lastType" || element.getAttribute("class") === "directory selected") && p.getAttribute("class") === "selected" && util.selectedAddresses(element, "directory").length === 1) {
            file_browser.events.directory(event);
            return;
        }
        event.preventDefault();
        if (elementName !== "ul") {
            event.stopPropagation();
        }
        if (key === "delete" || key === "del") {
            context.element = element;
            context.events.destroy(event);
        } else if (windowEvent.altKey === true && windowEvent.ctrlKey === true) {
            if (key === "b" && elementName === "li") {
                // key b, base64
                context.element = element;
                context.type = "Base64";
                context.events.dataString(event);
            } else if (key === "d") {
                // key d, new directory
                context.element = element;
                context.type = "directory";
                context.events.fsNew(event);
            } else if (key === "e") {
                // key e, edit file
                context.element = element;
                context.type = "Edit";
                context.events.dataString(event);
            } else if (key === "f") {
                // key f, new file
                context.element = element;
                context.type = "file";
                context.events.fsNew(event);
            } else if (key === "h" && elementName === "li") {
                // key h, hash
                context.element = element;
                context.type = "Hash";
                context.events.dataString(event);
            } else if (key === "r" && elementName === "li") {
                // key r, rename
                file_browser.events.rename(event);
            } else if (key === "s") {
                // key s, share
                context.element = element;
                share.events.context(event);
            } else if (key === "t") {
                // key t, details
                context.events.details(event);
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
                context.events.copy(event);
            } else if (key === "d" && elementName === "li") {
                // key d, destroy
                context.element = element;
                context.events.destroy(event);
            } else if (key === "v") {
                // key v, paste
                context.element = element;
                context.events.paste(event);
            } else if (key === "x") {
                // key x, cut
                context.element = element;
                context.type = "cut";
                context.events.copy(event);
            }
        }
    },

    /* Get a lowercase node name for a given element. */
    name: function browser_utilities_util_name(item:Element):string {
        return item.nodeName.toLowerCase();
    },

    /* Creates HTML radio button inside a list item. */
    radioListItem: function browser_content_agentManagement_menu_radio(config:config_radioListItem):Element {
        let li:HTMLElement = null,
            label:HTMLElement = null,
            input:HTMLInputElement = null,
            index:number = 0;
        const len:number = config.list.length,
            click = function browser_content_agentManagement_menu_radio(event:MouseEvent):void {
                const target:HTMLInputElement = event.target as HTMLInputElement,
                    ul:Element = target.getAncestor("ul", "tag"),
                    radios:HTMLCollectionOf<HTMLInputElement> = ul.getElementsByTagName("input");
                let len:number = radios.length,
                    parent:Element = null;
                do {
                    len = len - 1;
                    parent = radios[len].parentNode as Element;
                    if (radios[len] !== target) {
                        parent.removeAttribute("class");
                    } else {
                        parent.setAttribute("class", "radio-checked");
                    }
                } while (len > 0);
                config.handler(event);
            };
        do {
            li = document.createElement("li");
            label = document.createElement("label");
            input = document.createElement("input");
            if (config.defaultValue.toLowerCase() === config.list[index].toLowerCase()) {
                input.checked = true;
                label.setAttribute("class", "radio-checked");
            }
            input.name = config.name;
            input.type = "radio";
            input.value = config.list[index].toLowerCase().replace(/\s+/g, "_");
            input.onclick = click;
            label.innerHTML = config.list[index];
            label.insertBefore(input, label.firstChild);
            li.appendChild(label);
            li.setAttribute("class", "list-radio");
            config.parent.appendChild(li);
            index = index + 1;
        } while (index < len);
        config.parent.setAttribute("class", "radio-list");
        return config.parent;
    },

    /* Make a string safe to inject via innerHTML. */
    sanitizeHTML: function browser_utilities_util_sanitizeHTML(input:string):string {
        return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    },

    /* Gathers the view port position of an element */
    screenPosition: function browser_utilities_util_screenPosition(node:Element):DOMRect {
        const output:DOMRect = node.getBoundingClientRect();
        return {
            bottom: Math.round(output.bottom),
            height: Math.round(output.height),
            left: Math.round(output.left),
            right: Math.round(output.right),
            top: Math.round(output.top),
            width: Math.round(output.width),
            x: Math.round(output.x),
            y: Math.round(output.y),
            toJSON: output.toJSON
        };
    },

    /* Gather the selected addresses and types of file system artifacts in a fileNavigator modal. */
    selectedAddresses: function browser_utilities_util_selectedAddresses(element:Element, type:string):[string, fileType, string][] {
        const output:[string, fileType, string][] = [],
            parent:Element = element.parentNode as Element,
            agent:string = util.getAgent(element)[0],
            drag:boolean = (parent.getAttribute("id") === "file-list-drag"),
            sanitize = function browser_utilities_util_selectedAddresses_sanitize(item:Element, classItem:Element):void {
                const text:string = (util.name(item) === "label")
                    ? item.innerHTML
                    : item.getElementsByTagName("label")[0].innerHTML;
                output.push([text, classItem.getAttribute("class").replace(" lastType", "").replace(" selected", "").replace(" cut", "") as fileType, agent]);
            };
        let a:number = 0,
            length:number = 0,
            itemParent:HTMLElement,
            classy:string,
            itemList:HTMLCollectionOf<Element>,
            box:Element,
            dataModal:config_modal,
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
                sanitize(addressItem, itemParent);
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
        sanitize(element.getElementsByTagName("label")[0], element);
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

    /* Remove selections of file system artifacts in a given fileNavigator modal. */
    selectNone: function browser_utilities_util_selectNone(element:Element):void {
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
    }

};

export default util;