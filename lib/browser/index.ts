
/* lib/browser/index - The base JavaScript code that initiates the application in the browser. */

import agent_hash from "./utilities/agent_hash.js";
import agent_management from "./content/agent_management.js";
import agent_status from "./utilities/agent_status.js";
import browser from "./utilities/browser.js";
import global_events from "./content/global_events.js";
import dom from "./utilities/dom.js";
import message from "./content/message.js";
import modal_configuration from "./utilities/modal_configurations.js";
import network from "./utilities/network.js";
import remote from "./utilities/remote.js";
import tutorial from "./content/tutorial.js";
import util from "./utilities/util.js";
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

        window.onresize = util.fixHeight;
        document.getElementsByTagName("head")[0].appendChild(browser.style);

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
                modal_configuration.modals.configuration(null);
                testBrowserLoad(500);
            },

            // page initiation once state restoration completes
            loadComplete = function browser_init_complete():void {
                // change status to idle
                const allDevice:HTMLElement = agentList.getElementsByClassName("device-all-shares")[0] as HTMLElement,
                    allUser:HTMLElement = agentList.getElementsByClassName("user-all-shares")[0] as HTMLElement;

                // create menu buttons from modal type names and associated icons/text
                {
                    const buttons:string[] = Object.keys(modal_configuration.titles),
                        buttonLength:number = buttons.length,
                        menu = document.getElementById("menu"),
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

                if (browser.data.hashDevice === "") {
                    // Terminate load completion dependent upon creation of device hash
                    return;
                }

                // populate text messages
                if (browser.data.modalTypes.indexOf("message") > -1) {
                    message.tools.populate("");
                }

                // assign key default events
                modal_configuration.modals.configuration(null, null);
                browser.content.onclick                             = global_events.contextMenuRemove;
                document.getElementById("menuToggle").onclick       = global_events.menu;
                agentList.getElementsByTagName("button")[0].onclick = modal_configuration.modals.shares;
                allDevice.onclick                                   = modal_configuration.modals.shares;
                allUser.onclick                                     = modal_configuration.modals.shares;
                document.getElementById("minimize-all").onclick     = global_events.minimizeAll;
                document.onvisibilitychange                         = global_events.visibility;
                if (document.fullscreenEnabled === true) {
                    document.onfullscreenchange                   = global_events.fullscreenChange;
                    document.getElementById("fullscreen").onclick = global_events.fullscreen;
                } else {
                    const fullscreen:HTMLElement = document.getElementById("fullscreen");
                    fullscreen.parentNode.removeChild(fullscreen);
                }

                // initiate webSocket and activity status
                agent_status.start();
                if (logInTest === true) {
                    testBrowserLoad(0);
                }
                if (location.href.indexOf("test_browser") < 0 && (browser.data.tutorial === true || location.href.indexOf("?tutorial") > 0)) {
                    tutorial();
                }

                // loading data and modals is complete
                browser.loading = false;
            },

            // on page load restore the application to exactly the way it was
            restoreState = function browser_init_restoreState():void {
                // state data
                let modalItem:config_modal = null,
                    count:number = 0,
                    configKey:boolean = false;
                const modalKeys:string[] = Object.keys(state.settings.configuration.modals),
                    indexes:[number, string][] = [],
                    // applies z-index to the modals in the proper sequence while restarting the value at 0
                    z = function browser_init_z(id:string):void {
                        count = count + 1;
                        if (id !== null) {
                            indexes.push([state.settings.configuration.modals[id].zIndex, id]);
                        }
                        if (count === modalKeys.length) {
                            let index:number = 0,
                                len:number = indexes.length,
                                uiModal:config_modal,
                                modalItem:HTMLElement = null;
                            const restoreShares = function browser_init_restoreState_restoreShares(type:agentType):void {
                                const list:string[] = Object.keys(state.settings[type]),
                                    listLength:number = list.length;
                                let a:number = 0;
                                if (listLength > 0) {
                                    do {
                                        agent_management.tools.addAgent({
                                            hash: list[a],
                                            name: browser[type][list[a]].name,
                                            type: type
                                        });
                                        a = a + 1;
                                    } while (a < listLength);
                                }
                            };
                            browser.data.zIndex = modalKeys.length;
                            indexes.sort(function browser_init_z_sort(aa:[number, string], bb:[number, string]):number {
                                if (aa[0] < bb[0]) {
                                    return -1;
                                }
                                return 1;
                            });
                            // apply z-index - depth and overlapping order
                            do {
                                uiModal = state.settings.configuration.modals[indexes[index][1]];
                                modalItem = document.getElementById(indexes[index][1]);
                                if (uiModal !== undefined && modalItem !== null) {
                                    uiModal.zIndex = index + 1;
                                    modalItem.style.zIndex = `${index + 1}`;
                                }
                                index = index + 1;
                            } while (index < len);
                            if (configKey ===  false) {
                                modal_configuration.modals.configuration(null);
                            }
                            restoreShares("device");
                            restoreShares("user");
                            loadComplete();
                        }
                    };
                logInTest = true;
                browser.data.color = state.settings.configuration.color;
                browser.data.colors = state.settings.configuration.colors;
                browser.data.fileSort = state.settings.configuration.fileSort;
                browser.data.hashDevice = state.settings.configuration.hashDevice;
                browser.data.hashUser = state.settings.configuration.hashUser;
                browser.data.nameUser = state.settings.configuration.nameUser;
                browser.data.nameDevice = state.settings.configuration.nameDevice;
                browser.data.statusTime = state.settings.configuration.statusTime;
                browser.data.storage = state.settings.configuration.storage;
                browser.data.tutorial = state.settings.configuration.tutorial;
                browser.device = state.settings.device;
                browser.user = state.settings.user;
                browser.pageBody.setAttribute("class", browser.data.color);
                modalKeys.forEach(function browser_init_modalKeys(value:string) {
                    modalItem = state.settings.configuration.modals[value];
                    modalItem.callback = function browser_init_modalKeys_callback():void {
                        z(value);
                    };
                    if (value === "configuration-modal") {
                        configKey = true;
                    }
                    modal_configuration.modals[modalItem.type](null, modalItem);
                });
            },

            // callback once the socket tunnel is operational
            socketCallback = function browser_init_socketCallback():void {
                if (hashUser === "") {
                    applyLogin();
                } else {
                    restoreState();
                }
            };
        // set state from artifacts supplied to the page
        if (stateItem.getAttribute("type") === "hidden") {
            state = JSON.parse(stateItem.value);
            if (state.settings.configuration !== undefined) {
                if (state.settings.configuration.hashDevice !== undefined) {
                    hashDevice = state.settings.configuration.hashDevice;
                }
                if (state.settings.configuration.hashUser !== undefined) {
                    hashUser = state.settings.configuration.hashUser;
                }
            }
        }

        // readjusting the visual appearance of artifacts in the DOM to fit the screen before they are visible to eliminate load drag from page repaint
        util.fixHeight();
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
            return `${(width / 10)}em`;
        }());

        browser.network = state.network;
        browser.loadComplete = loadComplete;
        browser.title        = state.name;
        if (state.settings !== undefined && state.settings !== null && state.settings.message !== undefined) {
            browser.message = state.settings.message;
        }
        if (state.test !== null && testBrowser === true) {
            // browser automation test
            if (state.test.test !== null && state.test.test.name === "refresh-complete") {
                return;
            }
            browser.testBrowser = state.test;
            webSocket.start(socketCallback, "test-browser");
        } else {
            webSocket.start(socketCallback, hashDevice);
        }
    }
}());