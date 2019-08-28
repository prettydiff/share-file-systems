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
        content.style.height = `${(height / 10) - 10}em`;
    };
    ui.fs.expand = function local_ui_fs_expand(event:MouseEvent):void {
        const button:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            li:HTMLElement = <HTMLElement>button.parentNode;
        li.removeChild(button);
        network.fs({
            agent: "self",
            callback: function local_ui_fs_expand_callback(files:HTMLElement) {
                li.appendChild(files);
            },
            location: li.firstChild.textContent
        });
    };
    ui.fs.open = function local_ui_fs_open():void {
        network.fs({
            agent: "self",
            callback: function local_ui_fs_open_callback(files:HTMLElement) {
                const value:string = files.getAttribute("title");
                files.removeAttribute("title");
                ui.modal.create({
                    content: files,
                    inputs: ["cancel", "close", "confirm", "maximize", "minimize", "text"],
                    single: true,
                    text_event: ui.fs.text,
                    text_placeholder: "Optionally type a file system address here.",
                    text_value: value,
                    title: "Select a file or directory",
                    type: "openFS",
                    width: 800
                });
            },
            location: "default"
        });
    };
    ui.fs.text = function local_ui_fs_text(event:MouseEvent):void {
        const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target;
        let parent:HTMLElement = <HTMLElement>element.parentNode;
        parent = <HTMLElement>parent.parentNode;
        parent = parent.getElementsByTagName("div")[0];
        network.fs({
            agent: "self",
            callback: function local_ui_fs_text_callback(files:HTMLElement) {
                parent.innerHTML = "";
                parent.appendChild(files);
            },
            location: element.value
        });
    };
    ui.modal.close = function local_ui_modal_close(event:MouseEvent):void {
        const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target;
        let parent:HTMLElement = <HTMLElement>element.parentNode,
            id:string;
        do {
            parent = <HTMLElement>parent.parentNode;
        } while (parent.getAttribute("class") !== "box");
        parent.parentNode.removeChild(parent);
        id = parent.getAttribute("id").split("-")[0];
        data.modalTypes.splice(data.modalTypes.indexOf(id), 1);
    };
    // drag and drop, or if minimized then resize
    ui.modal.move = function local_ui_modal_move(event:Event):boolean {
        const x:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
            heading:HTMLElement = <HTMLElement>x.parentNode,
            box:HTMLElement        = <HTMLElement>heading.parentNode.parentNode,
            settings:ui_modal = data.modals[box.getAttribute("id")],
            border:HTMLElement = box.getElementsByTagName("div")[0],
            body:HTMLElement = border.getElementsByTagName("div")[0],
            minifyTest:boolean = (border.style.display === "none"),
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
            filled:boolean     = (body.innerHTML.length > 50000),    
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
            if (filled === true) {
                box.style.right = "auto";
            } else {
                box.style.left = "auto";
            }
            //minButton.click();
            return false;
        }
        ui.zTop(box);
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
    ui.modal.create = function local_ui_modal_create(options:ui_modal):void {
        let button:HTMLElement = document.createElement("button"),
            h2:HTMLElement = document.createElement("h2"),
            input:HTMLInputElement,
            extra:HTMLElement;
        const box:HTMLElement = document.createElement("div"),
            body:HTMLElement = document.createElement("div"),
            border:HTMLElement = document.createElement("div"),
            left:number = (options.left || 200),
            top:number = (options.top || 200),
            width:number = (options.width || 400),
            height:number = (options.height || 400);
        if (data.modalTypes.indexOf(options.type) > -1) {
            if (options.single === true) {
                return;
            }
        } else {
            data.modalTypes.push(options.type);
        }
        button.innerHTML = options.title;
        button.onmousedown = ui.modal.move;
        button.ontouchstart = ui.modal.move;
        //button.onfocus  = ui.minimize;
        button.onblur  = function local_ui_modal_create_blur():void {
            button.onclick = null;
        };
        box.setAttribute("id", `${options.type}-${data.zIndex}`);
        data.modals[`${options.type}-${data.zIndex}`] = options;
        box.setAttribute("class", "box");
        border.setAttribute("class", "border");
        body.setAttribute("class", "body");
        body.style.height = `${height / 10}em`;
        body.style.width = `${width / 10}em`;
        box.style.left = `${left / 10}em`;
        box.style.top = `${top / 10}em`;
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
                    button.onclick = ui.minimize;
                    h2.appendChild(button);
                }
                if (options.inputs.indexOf("maximize") > -1) {
                    button = document.createElement("button");
                    button.innerHTML = "🗖 <span>Maximize</span>";
                    button.setAttribute("class", "maximize");
                    button.onclick = ui.maximize;
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
                input = document.createElement("input");
                input.type = "text";
                input.spellcheck = false;
                if (options.text_event !== undefined) {
                    input.onblur = options.text_event;
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
            button.style.width = `${(width / 10) + 1}em`;
            button.onmousedown = ui.modal.resize;
            border.appendChild(button);
            button = document.createElement("button");
            button.innerHTML = "resize box width";
            button.setAttribute("class", "side-r");
            button.style.height = `${(height / 10) + 3}em`;
            button.onmousedown = ui.modal.resize;
            border.appendChild(button);
            button = document.createElement("button");
            button.innerHTML = "resize box height";
            button.setAttribute("class", "side-b");
            button.style.width = `${(width / 10) + 1}em`;
            button.onmousedown = ui.modal.resize;
            border.appendChild(button);
            button = document.createElement("button");
            button.innerHTML = "resize box width";
            button.setAttribute("class", "side-l");
            button.style.height = `${(height / 10) + 3}em`;
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
        // update settings
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
                    if (((bodyWidth - offsetWidth) + (left - computedWidth)) / 10 > 30) {
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
                    if (computedWidth > 30) {
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
                    if (((bodyWidth - offsetWidth) + (left - computedWidth)) / 10 > 30) {
                        box.style.left = `${computedWidth / 10}em`;
                        body.style.width  = `${((bodyWidth - offsetWidth) + (left - computedWidth)) / 10}em`;
                    }
                    document.onmouseup = drop;
                },
                r: function local_ui_modal_resize_sizeR(f:MouseEvent):void {
                    computedWidth = (bodyWidth + ((f.clientX - offsetWidth) - offX)) / 10;
                    if (computedWidth > 30) {
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
                    if (((bodyWidth - offsetWidth) + (left - computedWidth)) / 10 > 30) {
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
                    if (computedWidth > 30) {
                        body.style.width = `${computedWidth}em`;
                    }
                    document.onmouseup = drop;
                }
            };
        bodyWidth  = body.clientWidth,
        bodyHeight = body.clientHeight
        ui.zTop(box);
        document.onmousemove = side[direction];
        document.onmousedown = null;
    };
    ui.zTop     = function local_ui_zTop(x:HTMLElement):void {
        data.zIndex = data.zIndex + 1;
        x.style.zIndex = data.zIndex.toString();
    };
    network.fs = function local_network_fs(configuration:updateFS): void {
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
                            li.textContent = local[a][0];
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
                                button = document.createElement("button");
                                button.setAttribute("class", "expansion");
                                button.innerHTML = "+<span>Expand this folder</span>";
                                button.onclick = ui.fs.expand;
                                li.insertBefore(button, li.firstChild);
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
                    a = 1;
                    localLength = local.length;
                    do {
                        buildItem();
                        output.appendChild(li);
                        a = a + 1;
                    } while (a < localLength);
                    output.setAttribute("class", "fileList");
                    output.title = local[0][0];
                    configuration.callback(output);
                } else {
                    //error message
                }
            }
        };
        xhr.withCredentials = true;
        xhr.open("POST", loc, true);
        xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        xhr.send(`{"action":"fs-read","agent":"${configuration.agent}","location":"${configuration.location.replace(/\\/g, "\\\\")}"}`);
    };
    ws.addEventListener("message", function dom_load_webSockets(event) {
        if (event.data === "reload") {
            location.reload();
        }
    });
    ui.fixHeight();
    window.onresize = ui.fixHeight;
    document.getElementById("open-fs").onclick = ui.fs.open;
}());