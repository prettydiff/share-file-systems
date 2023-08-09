
/* lib/browser/index - The base JavaScript code that initiates the application in the browser. */

import agent_hash from "./utilities/agent_hash.js";
import agent_management from "./content/agent_management.js";
import agent_status from "./utilities/agent_status.js";
import browser from "./utilities/browser.js";
import configuration from "./content/configuration.js";
import context from "./content/context.js";
import dom from "./utilities/dom.js";
import message from "./content/message.js";
import modal_configuration from "./utilities/modal_configurations.js";
import modal from "./utilities/modal.js";
import network from "./utilities/network.js";
import remote from "./utilities/remote.js";
import tutorial from "./content/tutorial.js";
import uiDefault from "../common/uiDefault.js";
import webSocket from "./utilities/webSocket.js";

import disallowed from "../common/disallowed.js";



(function browser_init():void {

    {
        // intercept console.log in the browser and push its input to the terminal
        (function browser_log():void {
            // eslint-disable-next-line
            const log:(...params:unknown[]) => void = console.log;
            // eslint-disable-next-line
            console.log = function browser_log_logger(...params:unknown[]):void {
                // this condition prevents endless recursion against the http response text
                if (params[0] !== "browser log received") {
                    const error:string = new Error().stack;
                    params.forEach(function browser_low_logger_params(value:unknown, index:number, arr:unknown[]):void {
                        const element:HTMLElement = value as HTMLElement;
                        if (value !== null && value !== undefined && typeof element.nodeType === "number" && typeof element.parentNode === "object" && (/,"service":"log"\}$/).test(JSON.stringify(value)) === false) {
                            arr[index] = element.outerHTML;
                        }
                        log(value);
                    });
                    if (
                        params[0] === null ||
                        params[0] === undefined ||
                        (
                            error.indexOf("browser_network_send") < 0 &&
                            error.indexOf("browser_utilities_webSocket_sendWrapper_delay") < 0 &&
                            // prevent sending of verbose test automation comments
                            params[0].toString().indexOf("On browser receiving test index ") !== 0 &&
                            params[0].toString().indexOf("On browser sending results for test index ") !== 0
                        )
                    ) {
                        network.send(params, "log");
                    }
                }
            };
        }());

        // Extend the browser interface
        dom();
        disallowed(true);

        let logInTest:boolean = false,
            hashDevice:string = "",
            hashUser:string = "",
            state:stateData = null;
        const testBrowser:boolean = (location.href.indexOf("?test_browser") > 0),
            agentList:HTMLElement = document.getElementById("agentList"),
            stateItem:HTMLInputElement = document.getElementsByTagName("input")[0],
            tray:HTMLElement = document.getElementById("tray"),

            // execute test automation following a page reload
            testBrowserLoad = function browser_init_testBrowserLoad(delay:number):void {
                if (testBrowser === true && browser.testBrowser !== null) {
                    if (browser.testBrowser.action === "reset") {
                        remote.sendTest(null, -1, "reset-complete");
                    } else if (browser.testBrowser.action === "result") {
                        setTimeout(function browser_init_testBrowserLoad_delay():void {
                            remote.event(browser.testBrowser, true);
                        }, delay);
                    }
                }
            },

            // process the login form
            applyLogin = function browser_init_applyLogin():void {
                const login:HTMLElement = document.getElementById("login"),
                    button:HTMLButtonElement = login.getElementsByTagName("button")[0],
                    nameUser:HTMLInputElement = document.getElementById("login-user") as HTMLInputElement,
                    nameDevice:HTMLInputElement = document.getElementById("login-device") as HTMLInputElement,
                    action = function browser_init_applyLogin_action():void {
                        if (nameUser.value.replace(/\s+/, "") === "") {
                            nameUser.focus();
                        } else if (nameDevice.value.replace(/\s+/, "") === "") {
                            nameDevice.focus();
                        } else {
                            agent_hash.send(nameDevice, nameUser);
                        }
                    },
                    handlerKeyboard = function browser_init_applyLogin_handleKeyboard(event:KeyboardEvent):void {
                        if (event.key === "Enter") {
                            action();
                        }
                    },
                    handlerMouse = function browser_init_applyLogin_handleMouse():void {
                        action();
                    };
                nameUser.onkeyup = handlerKeyboard;
                nameDevice.onkeyup = handlerKeyboard;
                button.onclick = handlerMouse;
                testBrowserLoad(500);
            },

            // page initiation once state restoration completes
            loadComplete = function browser_init_complete(socket:boolean):void {
                // change status to idle
                const allDevice:HTMLElement = agentList.getElementsByClassName("device-all-shares")[0] as HTMLElement,
                    allUser:HTMLElement = agentList.getElementsByClassName("user-all-shares")[0] as HTMLElement,
                    allShares:HTMLElement = agentList.getElementsByClassName("all-shares")[0].getElementsByTagName("button")[0],
                    socketList:HTMLElement = agentList.getElementsByClassName("sockets")[0].getElementsByTagName("button")[0],
                    fullscreen = function browser_init_complete_fullscreen():void {
                        if (document.fullscreenEnabled === true) {
                            if (document.fullscreenElement === null) {
                                void browser.pageBody.requestFullscreen();
                            } else {
                                void document.exitFullscreen();
                            }
                        }
                    },
                    fullscreenChange = function browser_init_complete_fullscreenChange():void {
                        const button:HTMLElement = document.getElementById("fullscreen"),
                            span:HTMLElement = button.getElementsByTagName("span")[0],
                            text:string = (document.fullscreenElement === null)
                                ? "Toggle Fullscreen"
                                : "Exit Fullscreen";
                        span.appendText(text);
                        button.title = text;
                        button.firstChild.textContent = (document.fullscreenElement === null)
                            ? "\u26f6"
                            : "\u26cb";
                    },
                    menuAction = function browser_init_complete_menuAction():void {
                        const menu:HTMLElement = document.getElementById("menu");
                        if (menu.style.display !== "block") {
                            menu.style.display = "block";
                            if (browser.testBrowser === null) {
                                const move = function browser_init_complete_menuAction_move(event:MouseEvent):void {
                                    if (event.clientX > menu.clientWidth || event.clientY > menu.clientHeight + 51) {
                                        menu.style.display = "none";
                                        document.onmousemove = null;
                                    }
                                };
                                document.onmousemove = move;
                            }
                        } else {
                            menu.style.display = "none";
                        }
                    },
                    minimizeAll = function browser_init_complete_minimizeAll():void {
                        const keys:string[] = Object.keys(browser.ui.modals),
                            length:number = keys.length;
                        let a:number = 0,
                            status:modalStatus;
                        browser.ui.minimizeAll = true;
                        do {
                            status = browser.ui.modals[keys[a]].status;
                            if (status === "normal" || status === "maximized") {
                                modal.tools.forceMinimize(keys[a]);
                            }
                            a = a + 1;
                        } while (a < length);
                        browser.ui.minimizeAll = false;
                        network.configuration();
                    },
                    visibility = function browser_init_complete_visibility():void {
                        if (document.visibilityState === "visible") {
                            browser.visible = true;
                        } else {
                            browser.visible = false;
                        }
                    };

                // create menu buttons from modal type names and associated icons/text
                {
                    const buttons:string[] = Object.keys(modal_configuration.titles),
                        buttonLength:number = buttons.length,
                        menu:HTMLElement = document.getElementById("menu"),
                        menuBlur = function browser_init_complete_menuBlur():void {
                            menu.style.display = "none";
                        };
                    let index:number = 0,
                        button:HTMLButtonElement = null,
                        li:HTMLElement = null,
                        span:HTMLElement = null;
                    do {
                        if (modal_configuration.titles[buttons[index]].menu === true) {
                            button = document.createElement("button");
                            li = document.createElement("li");
                            span = document.createElement("span");
                            span.appendText(modal_configuration.titles[buttons[index]].icon);
                            button.setAttribute("class", buttons[index]);
                            button.setAttribute("type", "button");
                            button.appendChild(span);
                            button.appendText(` ${modal_configuration.titles[buttons[index]].text}`);
                            button.onblur = menuBlur;
                            button.onclick = modal_configuration.modals[buttons[index] as modalType];
                            li.appendChild(button);
                            menu.appendChild(li);
                        }
                        index = index + 1;
                    } while (index < buttonLength);
                }

                // populate text messages
                if (browser.ui.modalTypes.indexOf("message") > -1) {
                    message.tools.populate("");
                }

                // assign key default events
                browser.content.onclick                             = context.events.contextMenuRemove;
                document.getElementById("menuToggle").onclick       = menuAction;
                allShares.onclick                                   = modal_configuration.modals.shares;
                allDevice.onclick                                   = modal_configuration.modals.shares;
                allUser.onclick                                     = modal_configuration.modals.shares;
                socketList.onclick                                  = modal_configuration.modals["socket-list"];
                document.getElementById("minimize-all").onclick     = minimizeAll;
                document.onvisibilitychange                         = visibility;
                if (document.fullscreenEnabled === true) {
                    document.onfullscreenchange                   = fullscreenChange;
                    document.getElementById("fullscreen").onclick = fullscreen;
                } else {
                    const fullscreen:HTMLElement = document.getElementById("fullscreen");
                    fullscreen.parentNode.removeChild(fullscreen);
                }

                // build out the default modals, if not already present as a part of state restoration
                if (document.getModalsByModalType("configuration")[0] === undefined) {
                    modal_configuration.modals.configuration(null, null);
                }
                if (document.getModalsByModalType("socket-list")[0] === undefined) {
                    modal_configuration.modals["socket-list"](null, null);
                    configuration.tools.socketList({
                        data: state["socket-list"],
                        service: "socket-list"
                    });
                }

                // initiate webSocket and activity status
                agent_status.start();
                if (logInTest === true) {
                    testBrowserLoad(0);
                }
                if (location.href.indexOf("test_browser") < 0 && (browser.ui.tutorial === true || location.href.indexOf("?tutorial") > 0)) {
                    tutorial();
                }

                // loading data and modals is complete
                browser.loading = false;
                if (socket === true) {
                    webSocket.start(null, (state.test !== null && testBrowser === true)
                        ? "test-browser"
                        : hashDevice,
                        "primary"
                    );
                }
            },

            // on page load restore the application to exactly the way it was
            restoreState = function browser_init_restoreState():void {
                // state data
                let modalItem:config_modal = null,
                    count:number = 0;
                const modalKeys:string[] = Object.keys(state.settings.ui.modals),
                    indexes:[number, string][] = [],
                    // applies z-index to the modals in the proper sequence while restarting the value at 0
                    z = function browser_init_z(id:string):void {
                        count = count + 1;
                        if (id !== null) {
                            indexes.push([state.settings.ui.modals[id].zIndex, id]);
                        }
                        if (count === modalKeys.length) {
                            let index:number = 0,
                                uiModal:config_modal,
                                modalItem:HTMLElement = null;
                            const len:number = indexes.length,
                                restoreShares = function browser_init_restoreState_z_restoreShares(type:agentType):void {
                                    const list:string[] = Object.keys(state.settings.agents[type]),
                                        listLength:number = list.length;
                                    let a:number = 0;
                                    if (listLength > 0) {
                                        do {
                                            agent_management.tools.addAgent({
                                                hash: list[a],
                                                name: browser.agents[type][list[a]].name,
                                                type: type
                                            });
                                            a = a + 1;
                                        } while (a < listLength);
                                    }
                                };
                            browser.ui.zIndex = modalKeys.length;
                            indexes.sort(function browser_init_restoreState_z_sort(aa:[number, string], bb:[number, string]):number {
                                if (aa[0] < bb[0]) {
                                    return -1;
                                }
                                return 1;
                            });
                            // apply z-index - depth and overlapping order
                            do {
                                uiModal = state.settings.ui.modals[indexes[index][1]];
                                modalItem = document.getElementById(indexes[index][1]);
                                if (uiModal !== undefined && modalItem !== null) {
                                    uiModal.zIndex = index + 1;
                                    modalItem.style.zIndex = `${index + 1}`;
                                }
                                index = index + 1;
                            } while (index < len);
                            restoreShares("device");
                            restoreShares("user");
                            loadComplete(true);
                        }
                    };
                logInTest = true;
                browser.agents = state.settings.agents;
                browser.identity = state.settings.identity;
                browser.ui = state.settings.ui;
                if (browser.ui.colorBackgrounds === undefined) {
                    browser.ui.colorBackgrounds = uiDefault.colorBackgrounds;
                }
                {
                    const colors:string[] = Object.keys(browser.ui.colorBackgrounds),
                        text:string[] = ["/*window css start*/"];
                    colors.forEach(function browser_init_colorsEach(color:string):void {
                        text.push(`.${color} #spaces .box div.body{background:${browser.ui.colorBackgrounds[color][0]}}`);
                        text.push(`.${color} #spaces .box input, .${color} #spaces .box textarea{background:${browser.ui.colorBackgrounds[color][1]}}`);
                        text.push(`.${color} #spaces .box .body, .${color} #spaces .box textarea{backdrop-filter:${browser.ui.colorBackgrounds[color][2]}}`);
                    });
                    text.push("/*window css end*/");
                    browser.style.appendText(text.join("\n"));
                }
                modalKeys.forEach(function browser_init_restoreState_modalKeys(value:string) {
                    modalItem = state.settings.ui.modals[value];
                    modalItem.callback = function browser_init_restoreState_modalKeys_callback():void {
                        z(value);
                    };
                    modal_configuration.modals[modalItem.type](null, modalItem);
                });
            },

            // Resizes the interactive area to fit the browser viewport.
            fixHeight = function browser_init_fixHeight():void {
                const height:number = window.innerHeight || browser.pageBody.clientHeight;
                browser.content.style.height = `${(height - 51) / 10}em`;
                document.getElementById("agentList").style.height = `${(window.innerHeight - 80) / 10}em`;
                tray.style.width = `${(window.innerWidth - browser.scrollbar - 1) / 10}em`;
            };

        // readjusting the visual appearance of artifacts in the DOM to fit the screen before they are visible to eliminate load drag from page repaint
        window.onresize = fixHeight;
        document.getElementsByTagName("head")[0].appendChild(browser.style);
        agentList.style.right = (function browser_init_scrollBar():string {
            // agent list is position:fixed, which is outside of parent layout, so I need to ensure it does not overlap the parent scrollbar
            let width:number = 0;
            const div:HTMLElement = document.createElement("div"),
                inner:HTMLElement = document.createElement("div");
            div.style.visibility = "hidden";
            div.style.overflow = "scroll";
            div.appendChild(inner);
            browser.pageBody.appendChild(div);
            width = (div.offsetWidth - inner.offsetWidth);
            browser.pageBody.removeChild(div);
            browser.scrollbar = width;
            tray.style.margin = `0 0 ${width / 10}em 0`;
            return `${(width / 10)}em`;
        }());
        fixHeight();

        // set state from artifacts supplied to the page
        if (stateItem.getAttribute("type") === "hidden") {
            state = JSON.parse(stateItem.value) as stateData;
            if (state.settings.ui !== undefined) {
                if (state.settings.identity.hashDevice !== undefined) {
                    hashDevice = state.settings.identity.hashDevice;
                }
                if (state.settings.identity.hashUser !== undefined) {
                    hashUser = state.settings.identity.hashUser;
                }
            }
        }

        browser.network = state.network;
        browser.title   = state.name;
        if (state.settings !== undefined && state.settings !== null && state.settings.message !== undefined) {
            browser.message = state.settings.message;
        }
        if (state.test !== null && testBrowser === true) {
            // browser automation test
            if (state.test.test !== null && state.test.test.name === "refresh-complete") {
                return;
            }
            browser.testBrowser = state.test;
        }
        if (hashUser === "") {
            webSocket.start(
                applyLogin,
                (state.test !== null && testBrowser === true)
                    ? "test-browser"
                    : hashDevice,
                "primary"
            );
            loadComplete(false);
        } else {
            restoreState();
        }
    }
}());