(function local():void {
    "use strict";
    const content:HTMLElement = document.getElementById("content-area"),
        ws = new WebSocket(`ws://localhost:${(function local_webSocketsPort() {
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
        data:ui_data = {
            modals: {},
            modalTypes: [],
            zIndex: 0
        },
        network:any = {},
        ui:any = {
            fs: {},
            modal: {}
        };
    ui.commas = function local_ui_commas(number:number):string {
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
    ui.fixHeight = function local_ui_fixHeight():void {
        const height:number   = window.innerHeight || document.getElementsByTagName("body")[0].clientHeight;
        content.style.height = `${(height - 51) / 10}em`;
    };
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
                id: "",
                location: li.firstChild.nextSibling.textContent
            });
        } else {
            const ul:HTMLCollectionOf<HTMLUListElement> = li.getElementsByTagName("ul");
            button.innerHTML = "+<span>Expand this folder</span>";
            if (ul.length > 0) {
                li.removeChild(li.getElementsByTagName("ul")[0]);
            }
        }
    };
    ui.fs.open = function local_ui_fs_open():void {
        network.fs({
            agent: "self",
            depth: 2,
            callback: function local_ui_fs_open_callback(files:HTMLElement) {
                const value:string = files.getAttribute("title");
                files.removeAttribute("title");
                ui.modal.create({
                    content: files,
                    inputs: ["cancel", "close", "confirm", "maximize", "minimize", "text"],
                    //single: true,
                    text_event: ui.fs.text,
                    text_placeholder: "Optionally type a file system address here.",
                    text_value: value,
                    title: "Select a file or directory",
                    type: "fileSystem",
                    width: 800
                });
            },
            id: "",
            location: "default"
        });
    };
    ui.fs.parent = function local_ui_fs_parent():boolean {
        const element:HTMLElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
            input:HTMLInputElement = <HTMLInputElement>element.nextSibling,
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
            id: "",
            location: input.value
        });
    };
    ui.fs.text = function local_ui_fs_text(event:KeyboardEvent):void {
        const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target;
        let parent:HTMLElement = <HTMLElement>element.parentNode,
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
                id: "",
                location: element.value
            });
        }
    };
    ui.modal.close = function local_ui_modal_close(event:MouseEvent):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
        let parent:HTMLElement = <HTMLElement>element.parentNode,
            id:string,
            type:string;
        do {
            parent = <HTMLElement>parent.parentNode;
        } while (parent.getAttribute("class") !== "box");
        parent.onclick = null;
        parent.parentNode.removeChild(parent);
        id = parent.getAttribute("id");
        type = id.split("-")[0];
        data.modalTypes.splice(data.modalTypes.indexOf(type), 1);
        delete data.modals[id];
        network.settings();
    };
    ui.modal.create = function local_ui_modal_create(options:ui_modal):void {
        let button:HTMLElement = document.createElement("button"),
            h2:HTMLElement = document.createElement("h2"),
            input:HTMLInputElement,
            extra:HTMLElement;
        const id:string = (options.id || `${options.type}-${data.zIndex + 1}`),
            box:HTMLElement = document.createElement("div"),
            body:HTMLElement = document.createElement("div"),
            border:HTMLElement = document.createElement("div");
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
            options.left = 200;
        }
        if (options.top === undefined) {
            options.top = 200;
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
        button.innerHTML = options.title;
        button.onmousedown = ui.modal.move;
        button.ontouchstart = ui.modal.move;
        //button.onfocus  = ui.minimize;
        button.onblur  = function local_ui_modal_create_blur():void {
            button.onclick = null;
        };
        box.setAttribute("id", id);
        box.onmousedown = ui.zTop;
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
                    button.onclick = ui.modal.close;
                    h2.appendChild(button);
                }
                border.appendChild(h2);
            }
            if (options.inputs.indexOf("text") > -1) {
                extra = document.createElement("p");
                if (options.type === "fileSystem") {
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
                extra.appendChild(input);
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
        if (Array.isArray(options.inputs) === true && (options.inputs.indexOf("cancel") > -1 || options.inputs.indexOf("confirm") > -1)) {
            extra = document.createElement("p");
            extra.setAttribute("class", "footer");
            if (options.inputs.indexOf("confirm") > -1) {
                button = document.createElement("button");
                button.innerHTML = "✓ Confirm";
                button.setAttribute("class", "confirm");
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
    };
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
        if (data.modals[id].status === "normal") {
            data.modals[id].status = "maximized";
            title.style.cursor = "default";
            title.onmousedown = null;
            box.style.top = "0em";
            box.style.left = "0em";
            body.style.width = `${(contentArea.clientWidth - 40) / 10}em`;
            body.style.height = (function local_ui_modal_maximize_maxHeight():string {
                let height:number = contentArea.clientHeight,
                    footer:HTMLElement = <HTMLElement>box.getElementsByClassName("footer")[0],
                    header:HTMLElement = <HTMLElement>box.getElementsByClassName("header")[0];
                height = (height - title.clientHeight) - 47;
                if (footer !== undefined) {
                    height = height - footer.clientHeight;
                }
                if (header !== undefined) {
                    height = height - header.clientHeight;
                }
                return `${height / 10}em`;
            }());
        } else {
            title.style.cursor = "move";
            title.onmousedown = ui.modal.move;
            data.modals[id].status = "normal";
            box.style.top = `${data.modals[id].top / 10}em`;
            box.style.left = `${data.modals[id].left / 10}em`;
            body.style.width = `${data.modals[id].width / 10}em`;
            body.style.height = `${data.modals[id].height / 10}em`;
        }
        network.settings();
    };
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
        children = border.childNodes;
        if (data.modals[id].status === "normal") {
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
        } else {
            const li:HTMLElement = <HTMLElement>box.parentNode;
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
        }
    };
    // drag and drop, or if minimized then resize
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
    ui.modal.resize = function local_ui_modal_resize(e:MouseEvent):void {
        let bodyWidth:number  = 0,
            bodyHeight:number = 0,
            computedHeight:number = 0,
            computedWidth:number = 0;
        const node:HTMLElement = <HTMLElement>e.srcElement || <HTMLElement>e.target,
            parent:HTMLElement     = <HTMLElement>node.parentNode,
            box:HTMLElement        = <HTMLElement>parent.parentNode,
            top:number = box.offsetTop,
            left:number = box.offsetLeft,
            body:HTMLDivElement       = box.getElementsByTagName("div")[1],
            offX:number = e.clientX,
            offY:number = e.clientY,
            mac:boolean        = (navigator.userAgent.indexOf("macintosh") > 0),
            direction:string = node.getAttribute("class").split("-")[1],
            offsetWidth:number    = (mac === true)
                ? 20
                : 4,
            offsetHeight:number    = (mac === true)
                ? 18
                : 0,
            drop       = function local_ui_modal_resize_drop():void {
                const settings:ui_modal = data.modals[box.getAttribute("id")];
                document.onmousemove = null;
                document.onmouseup = null;
                bodyWidth            = body.clientWidth;
                bodyHeight           = body.clientHeight;
                settings.width = bodyWidth;
                settings.height = bodyHeight;
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
    ui.zTop     = function local_ui_zTop(event:MouseEvent):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
        let box:HTMLElement = element;
        if (element.getAttribute("class") !== "box") {
            do {
                box = <HTMLElement>box.parentNode;
            } while (box.getAttribute("class") !== "box" && box !== document.documentElement);
        }
        data.zIndex = data.zIndex + 1;
        data.modals[box.getAttribute("id")].zIndex = data.zIndex;
        box.style.zIndex = data.zIndex.toString();
    };
    network.error = function local_network_error():void {};
    network.fs = function local_network_fs(configuration:readFS):void {
        const xhr:XMLHttpRequest = new XMLHttpRequest(),
            loc:string = location.href.split("?")[0];
        xhr.onreadystatechange = function local_network_fs_callback():void {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    const list:directoryList = JSON.parse(xhr.responseText),
                        local:directoryList = [],
                        length:number = list.length,
                        output:HTMLElement = document.createElement("ul"),
                        buildItem = function local_network_fs_callback_buildItem():void {
                            const driveLetter = function local_network_fs_callback_driveLetter(drive:string):string {
                                return drive.replace("\\\\", "\\");
                            };
                            li = document.createElement("li");
                            if (a < localLength - 1 && local[a + 1][1] !== local[a][1]) {
                                li.setAttribute("class", `${local[a][1]} last`);
                            } else {
                                li.setAttribute("class", local[a][1]);
                            }
                            if (a % 2 === 0) {
                                li.setAttribute("class", `${li.getAttribute("class")} even`);
                            } else {
                                li.setAttribute("class", `${li.getAttribute("class")} odd`);
                            }
                            li.textContent = local[a][0].replace(/^\w:\\\\/, driveLetter);
                            if (local[a][1] === "file") {
                                span = document.createElement("span");
                                if (local[a][4].size === 1) {
                                    plural = "";
                                } else {
                                    plural = "s";
                                }
                                span.textContent = `file - ${ui.commas(local[a][4].size)} byte${plural}`;
                                li.appendChild(span);
                            } else if (local[a][1] === "directory") {
                                if (local[a][3] > 0) {
                                    button = document.createElement("button");
                                    button.setAttribute("class", "expansion");
                                    button.innerHTML = "+<span>Expand this folder</span>";
                                    button.onclick = ui.fs.expand;
                                    li.insertBefore(button, li.firstChild);
                                }
                                span = document.createElement("span");
                                if (local[a][3] === 1) {
                                    plural = "";
                                } else {
                                    plural = "s";
                                }
                                span.textContent = `directory - ${ui.commas(local[a][3])} item${plural}`;
                                li.appendChild(span);
                            } else {
                                span = document.createElement("span");
                                if (local[a][1] === "link") {
                                    span.textContent = "symbolic link";
                                } else {
                                    span.textContent = local[a][1];
                                }
                                li.appendChild(span);
                            }
                        };
                    let a:number = 0,
                        button:HTMLElement,
                        li:HTMLElement,
                        span:HTMLElement,
                        plural:string,
                        localLength:number = 0;
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
                            buildItem();
                            output.appendChild(li);
                        }
                        a = a + 1;
                    } while (a < localLength);
                    output.setAttribute("class", "fileList");
                    output.title = local[0][0];
                    configuration.callback(output, configuration.id);
                } else {
                    network.error("something");
                }
            }
        };
        xhr.withCredentials = true;
        xhr.open("POST", loc, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.send(`fs:{"action":"fs-read","agent":"${configuration.agent}","depth":${configuration.depth},"location":"${configuration.location.replace(/\\/g, "\\\\")}"}`);
    };
    network.settings = function local_network_settings():void {
        const xhr:XMLHttpRequest = new XMLHttpRequest(),
            loc:string = location.href.split("?")[0];
        xhr.onreadystatechange = function local_network_settings_callback():void {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    
                } else {
                    network.error("something");
                }
            }
        };
        xhr.withCredentials = true;
        xhr.open("POST", loc, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.send(`settings:${JSON.stringify(data)}`);
    };
    ws.addEventListener("message", function local_webSockets(event) {
        if (event.data === "reload") {
            location.reload();
        }
    });
    ui.fixHeight();
    window.onresize = ui.fixHeight;
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
    (function local_restore():void {
        const comments:Comment[] = document.getNodesByType(8),
            commentLength:number = comments.length;
        let a:number = 0,
            cString:string = "";
        do {
            cString = comments[a].substringData(0, comments[a].length);
            if (cString.indexOf("storage:") === 0 && cString.length > 12) {
                const storage:any = JSON.parse(cString.replace("storage:", "")),
                    modalKeys:string[] = Object.keys(storage.settings.modals),
                    indexes:[number, string][] = [],
                    z = function local_restore_modalKeys_z(id:string) {
                        count = count + 1;
                        indexes.push([storage.settings.modals[id].zIndex, id]);
                        if (count === modalKeys.length) {
                            let cc:number = 0;
                            data.zIndex = modalKeys.length;
                            indexes.sort(function local_restore_modalKeys_z_sort(aa:[number, string], bb:[number, string]):number {
                                if (aa[0] < bb[0]) {
                                    return -1;
                                }
                                return 1;
                            });
                            do {
                                if (storage.settings.modals[indexes[cc][1]] !== undefined) {
                                    storage.settings.modals[indexes[cc][1]].zIndex = cc + 1;
                                    document.getElementById(indexes[cc][1]).style.zIndex = `${cc + 1}`;
                                }
                                cc = cc + 1;
                            } while (cc < modalKeys.length);
                        }
                    };
                let count:number = 0;
                modalKeys.forEach(function local_restore_modalKeys(value:string) {
                    if (storage.settings.modals[value].type === "fileSystem") {
                        network.fs({
                            agent: "self",
                            depth: 2,
                            callback: function local_restore_modalKeys_callback(files:HTMLElement, id:string) {
                                const textValue:string = files.getAttribute("title");
                                files.removeAttribute("title");
                                storage.settings.modals[id].content = files;
                                storage.settings.modals[id].id = id;
                                storage.settings.modals[id].text_value = textValue;
                                if (storage.settings.modals[id].type === "fileSystem") {
                                    storage.settings.modals[id].text_event = ui.fs.text;
                                }
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
                            id: value,
                            location: storage.settings.modals[value].text_value
                        });
                    }
                });
            }
            a = a + 1;
        } while (a < commentLength);
    }());
    document.getElementById("open-fs").onclick = ui.fs.open;
}());