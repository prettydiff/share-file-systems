
/* lib/browser/utilities/remote - A collection of instructions to allow event execution from outside the browser, like a remote control. */

import browser from "./browser.js";
import network from "./network.js";

/**
 * A browser remote control interface used for browser test automation.
 * ```typescript
 * interface module_remote {
 *     action     : test_browserAction;                                   // A property holding the action property value of the current test item.
 *     delay      : (config:test_browserItem) => void;                    // A utility to delay execution of evaluation criteria if the current test item features a delay property.
 *     domFailure : boolean;                                              // A flag indicating whether an event resulted in a DOM failure for reporting to the terminal.
 *     error      : (message:string, source:string, line:number, col:number, error:Error) => void; // Gathers JavaScript errors from the page for reporting to the terminal as a test failure.
 *     evaluate   : (test:test_browserTest) => [boolean, string, string]; // Executes the units of evaluation provided in a test item.
 *     event      : (item:service_testBrowser, pageLoad:boolean) => void; // Executes the events provided in a test item.
 *     getProperty: (test:test_browserTest) => [HTMLElement, primitive];  // Retrieve the value of the specified DOM property or attribute.
 *     index      : number;                                               // A property holding the index of the current test item.
 *     keyAlt     : boolean;                                              // A flag indicating whether the Alt key is pressed and not released while executing further events.
 *     keyControl : boolean;                                              // A flag indicating whether the Control/Command key is pressed and not released while executing further events.
 *     keyShift   : boolean;                                              // A flag indicating whether the Shift key is pressed and not released while executing further events.
 *     node       : (dom:test_browserDOM, property:string) => HTMLElement;// Retrieves a DOM node from the page by reading instructions from the test item.
 *     receive    : (socketData:socketData) => void;                      // Receives test instructions from the terminal and will either close the browser or execute *remote.event*.
 *     report     : (test:test_browserTest[], index:number) => void;      // Generates the evaluation report for sending to the terminal.
 *     sendTest   : (payload:[boolean, string, string][], index:number, task:test_browserAction) => void; // Sends test results to terminal.
 *     stringify  : (primitive:primitive) => string;                      // Converts a primitive of any type into a string for presentation.
 * }
 * type primitive = boolean | number | string | null | undefined;
 * type testBrowserAction = "close" | "nothing" | "reset" | "reset-complete" | "result";
 * ``` */
const remote:module_remote = {

    /* The action this module should take in response to test instructions from the terminal */
    action: "result",

    /* Executes the delay test unit if a given test has a delay property */
    delay: function browser_utilities_remote_delay(config:test_browserItem):void {
        let a:number = 0;
        const delay:number = 25,
            maxTries:number = 200,
            delayFunction = function browser_utilities_remote_delay_timeout():void {
                const testResult:[boolean, string, string] = remote.evaluate(config.delay);
                if (testResult[0] === true) {
                    if (config.unit === null || config.unit.length < 1) {
                        remote.sendTest([testResult], remote.index, remote.action);
                    } else {
                        remote.report(config.unit, remote.index);
                    }
                    return;
                }
                a = a + 1;
                if (a === maxTries) {
                    const element:HTMLElement = remote.node(config.delay.node, config.delay.target[0]);
                    if (element !== undefined && element !== null && element.nodeType === 1) {
                        element.highlight();
                    }
                    remote.sendTest([
                        [false, "delay timeout", config.delay.node.nodeString],
                        remote.evaluate(config.delay)
                    ], remote.index, remote.action);
                    return;
                }
                setTimeout(browser_utilities_remote_delay_timeout, delay);
            };
        if (config.delay === undefined || config.delay === null) {
            remote.report(config.unit, remote.index);
        } else {
            setTimeout(delayFunction, delay);
        }
    },

    /* Indicates a well formed test that is logically invalid against the DOM */
    domFailure: false,

    /* Report javascript errors as test failures */
    // eslint-disable-next-line
    error: function browser_utilities_remote_error(message:string, source:string, line:number, col:number, error:Error):void {
        remote.sendTest([[false, JSON.stringify({
            file: source,
            column: col,
            line: line,
            message: message,
            stack: (error === null)
                ? null
                : error.stack
        }), "error"]], remote.index, remote.action);
    },

    /* Determine whether a given test item is pass or fail */
    evaluate: function browser_utilities_remote_evaluate(test:test_browserTest):[boolean, string, string] {
        const rawValue:[HTMLElement, primitive] = remote.getProperty(test),
            value:HTMLElement|primitive = (test.type === "element")
                ? rawValue[0]
                : rawValue[1],
            qualifier:qualifier = test.qualifier,
            configString:string = test.value as string,
            highlight = function browser_utilities_remote_evaluate_highlight():void {
                if (test !== browser.testBrowser.test.delay && rawValue[0] !== null && rawValue[0] !== undefined && rawValue[0].nodeType === 1) {
                    rawValue[0].highlight();
                }
            };
        if (qualifier === "is" && value === configString) {
            return [true, "", test.node.nodeString];
        }
        if (qualifier === "not" && value !== configString) {
            return [true, "", test.node.nodeString];
        }
        if (typeof value !== typeof configString) {
            highlight();
            return [false, remote.stringify(value as primitive), test.node.nodeString.replace(/\s?highlight/, "")];
        }
        if (typeof value === "string") {
            const index:number = value.indexOf(configString);
            if (qualifier === "begins" && index === 0) {
                return [true, "", test.node.nodeString];
            }
            if (qualifier === "contains" && index > -1) {
                return [true, "", test.node.nodeString];
            }
            if (qualifier === "ends" && value.slice(value.length - configString.length) === configString) {
                return [true, "", test.node.nodeString];
            }
            if (qualifier === "not contains" && index < 0) {
                return [true, "", test.node.nodeString];
            }
        }
        if (typeof value === "number") {
            // @ts-ignore - value is type primitive but operator > requires type number
            if (qualifier === "greater" && value > test.value) {
                return [true, "", test.node.nodeString];
            }
            // @ts-ignore - value is type primitive but operator < requires type number
            if (qualifier === "lesser" && value < test.value) {
                return [true, "", test.node.nodeString];
            }
        }
        if (test.type === "element") {
            highlight();
            return [false, "element", test.node.nodeString.replace(/\s?highlight/, "")];
        }
        highlight();
        return [false, remote.stringify(value as primitive), test.node.nodeString.replace(/\s?highlight/, "")];
    },

    /* Process a single event instance */
    event: function browser_utilities_remote_event(item:service_testBrowser, pageLoad:boolean):void {
        if (item.index > remote.index || remote.index < 0) {
            remote.index = item.index;
            let a:number = 0,
                refresh:boolean = false;
            const complete = function browser_utilities_remote_event_complete():void {
                    if (refresh === false) {
                        remote.delay(item.test);
                    }
                },
                action = function browser_utilities_remote_event_action(index:number):void {
                    let element:HTMLElement,
                        config:test_browserEvent,
                        htmlElement:HTMLInputElement,
                        delay:number;
                    do {
                        config = item.test.interaction[index];
                        if (config.event === "refresh") {
                            if (index === 0) {
                                location.reload();
                            } else {
                                remote.error("The event 'refresh' was provided not as the first event of a test", "", 0, 0, null);
                            }
                            return;
                        }
                        if (config.event === "wait") {
                            delay = (isNaN(Number(config.value)) === true)
                                ? 0
                                : Number(config.value);
                            index = index + 1;
                            setTimeout(function browser_utilities_remote_event_action_delayNext():void {
                                if (index < eventLength) {
                                    browser_utilities_remote_event_action(index);
                                } else {
                                    complete();
                                }
                            }, delay);
                            return;
                        } else if (config.event === "resize" && config.node[0][0] === "window") {
                            if (config.coords === undefined || config.coords === null || config.coords.length !== 2 || isNaN(Number(config.coords[0])) === true || isNaN(Number(config.coords[0])) === true) {
                                remote.sendTest([
                                    [false, `event error ${String(element)}`, config.node.nodeString]
                                ], item.index, item.action);
                                browser.testBrowser = null;
                                return;
                            }
                            window.resizeTo(Number(config.coords[0]), Number(config.coords[1]));
                        } else if (config.event !== "refresh-interaction") {
                            element = remote.node(config.node, null);
                            if (remote.domFailure === true) {
                                remote.domFailure = false;
                                return;
                            }
                            if (element === null || element === undefined) {
                                remote.sendTest([
                                    [false, `event error ${String(element)}`, config.node.nodeString]
                                ], item.index, item.action);
                                browser.testBrowser = null;
                                return;
                            }
                            if (config.event === "move") {
                                element.style.top = `${config.coords[0]}em`;
                                element.style.left = `${config.coords[1]}em`;
                            } else if (config.event === "resize") {
                                element.style.width = `${config.coords[0]}em`;
                                element.style.height = `${config.coords[1]}em`;
                            } else if (config.event === "setValue") {
                                config.value = config.value
                                    .replace(/string-replace-hash-hashDevice/g, browser.identity.hashDevice)
                                    .replace(/string-replace-hash-hashUser/g, browser.identity.hashUser);
                                htmlElement = element as HTMLInputElement;
                                if (config.value.indexOf("replace\u0000") === 0) {
                                    const values:[string, string] = ["", ""],
                                        parent:HTMLElement = element.parentNode,
                                        sep:string = (htmlElement.value.charAt(0) === "/")
                                            ? "/"
                                            : "\\";
                                    config.value = config.value.replace("replace\u0000", "");
                                    values[0] = config.value.slice(0, config.value.indexOf("\u0000"));
                                    values[1] = config.value.slice(config.value.indexOf("\u0000") + 1).replace(/(\\|\/)/g, sep);
                                    if (parent.getAttribute("class") === "fileAddress") {
                                        htmlElement.value = htmlElement.value.replace(values[0], values[1]);
                                    } else {
                                        htmlElement.value = config.value;
                                    }
                                } else {
                                    htmlElement.value = config.value;
                                }
                            } else {
                                if (config.event === "keydown" || config.event === "keyup") {
                                    if (config.value === "Alt") {
                                        if (config.event === "keydown") {
                                            remote.keyAlt = true;
                                        } else {
                                            remote.keyAlt = false;
                                        }
                                    } else if (config.value === "Control") {
                                        if (config.event === "keydown") {
                                            remote.keyControl = true;
                                        } else {
                                            remote.keyControl = false;
                                        }
                                    } else if (config.value === "Shift") {
                                        if (config.event === "keydown") {
                                            remote.keyShift = true;
                                        } else {
                                            remote.keyShift = false;
                                        }
                                    } else {
                                        const tabIndex:number = element.tabIndex,
                                            event:KeyboardEvent = new KeyboardEvent(config.event, {
                                                key: config.value,
                                                altKey: remote.keyAlt,
                                                ctrlKey: remote.keyControl,
                                                shiftKey: remote.keyShift
                                            });
                                        element.tabIndex = 0;
                                        element.dispatchEvent(new Event("focus"));
                                        element.dispatchEvent(event);
                                        element.tabIndex = tabIndex;
                                    }
                                } else if (config.event === "click" || config.event === "contextmenu" || config.event === "dblclick" || config.event === "mousedown" || config.event === "mouseenter" || config.event === "mouseleave" || config.event === "mousemove" || config.event === "mouseout" || config.event === "mouseover" || config.event === "mouseup" || config.event === "touchend" || config.event === "touchstart") {
                                    const event:MouseEvent = new MouseEvent(config.event, {
                                        altKey: remote.keyAlt,
                                        ctrlKey: remote.keyControl,
                                        shiftKey: remote.keyShift
                                    });
                                    element.dispatchEvent(event);
                                } else {
                                    const event:Event = new Event(config.event, {bubbles: true, cancelable:true});
                                    element.dispatchEvent(event);
                                }
                            }
                        }
                        index = index + 1;
                    } while (index < eventLength);
                    complete();
                },
                eventLength:number = (item.test.interaction === null)
                    ? 0
                    : item.test.interaction.length;
            if (item.action === "nothing") {
                return;
            }
            remote.action = item.action;
            browser.testBrowser = item;
            if (eventLength > 0) {
                do {
                    if (item.test.interaction[a].event === "refresh-interaction") {
                        if (pageLoad === true) {
                            remote.delay(item.test);
                            return;
                        }
                        refresh = true;
                        break;
                    }
                    a = a + 1;
                } while (a < eventLength);
            }
            if (item.test.interaction === null || item.test.interaction.length < 1) {
                complete();
            } else {
                action(0);
            }
        }
    },

    /* Get the value of the specified property/attribute */
    getProperty: function browser_utilities_remote_getProperty(test:test_browserTest):[HTMLElement, primitive] {
        const element:HTMLElement = (test.node.length > 0)
                ? remote.node(test.node, test.target[0])
                : null,
            pLength:number = test.target.length - 1,
            method = function browser_utilities_remote_getProperty_method(prop:primitive|object, name:string):primitive {
                if (name.slice(name.length - 2) === "()") {
                    name = name.slice(0, name.length - 2);
                    // @ts-ignore - prop is some unknown DOM element or element property
                    // eslint-disable-next-line
                    return prop[name]();
                }
                // @ts-ignore - prop is some unknown DOM element or element property
                // eslint-disable-next-line
                return prop[name];
            },
            property = function browser_utilities_remote_getProperty_property(origin:HTMLElement|Window):primitive {
                let b:number = 1,
                    item:primitive = method(origin, test.target[0]);
                if (item === null) {
                    return null;
                }
                if (pLength > 1) {
                    do {
                        item = method(item, test.target[b]);
                        if (item === null) {
                            return null;
                        }
                        b = b + 1;
                    } while (b < pLength);
                }
                return method(item, test.target[b]);
            };
        if (test.type === "element") {
            return [element, false];
        }
        if (test.target[0] === "window") {
            return [element, property(window)];
        }
        if (element === null) {
            return [null, null];
        }
        if (element === undefined || pLength < 0) {
            return [undefined, undefined];
        }
        return (test.type === "attribute")
            ? [element, element.getAttribute(test.target[0])]
            : (pLength === 0)
                ? [element, method(element, test.target[0])]
                : [element, property(element)];
    },

    /* The index of the current executing test */
    index: -1,

    /* Whether the Alt key is pressed, which can modify many various events */
    keyAlt: false,

    /* Whether the Control key is pressed, which can modify many various events */
    keyControl: false,

    /* Whether the Shift key is pressed, which can modify many various events */
    keyShift: false,

    /* Gather a DOM node using instructions from a data structure */
    node: function browser_utilities_remote_node(dom:test_browserDOM, property:string):HTMLElement {
        let element:Document|HTMLElement = document,
            node:[domMethod, string, number],
            a:number = 0,
            fail:string = "";
        const nodeLength:number = dom.length,
            str:string[] = ["document"];
        if (dom === null || dom === undefined) {
            return null;
        }
        do {
            node = dom[a];
            if (node[0] === "getElementById" && a > 0) {
                fail = "Bad test. Method 'getElementById' must only occur as the first DOM method.";
            }
            if (node[2] === null && (node[0] === "childNodes" || node[0] === "getElementsByAttribute" || node[0] === "getElementsByClassName" || node[0] === "getElementsByName" || node[0] === "getElementsByTagName" || node[0] === "getElementsByText" || node[0] === "getModalsByModalType" || node[0] === "getNodesByType")) {
                if (property !== "length" && a !== nodeLength - 1) {
                    fail = `Bad test. Property '${node[0]}' requires an index value as the third data point of a DOM item: ["${node[0]}", "${node[1]}", ${node[2]}]`;
                }
            }
            if (node[1] === "" || node[1] === null || node[0] === "activeElement" || node[0] === "documentElement" || node[0] === "firstChild" || node[0] === "lastChild" || node[0] === "nextSibling" || node[0] === "parentNode" || node[0] === "previousSibling") {
                if (fail === "") {
                    // @ts-ignore - TypeScript's DOM types do not understand custom extensions to the Document object
                    // eslint-disable-next-line
                    element = element[node[0]];
                }
                str.push(".");
                str.push(node[0]);
            } else if (node[0] === "childNodes" && node[2] !== null) {
                if (fail === "") {
                    element = element.childNodes[node[2]] as HTMLElement;
                }
                str.push(".childNodes[");
                str.push(String(node[2]));
                str.push("]");
            } else if (node[2] === null || node[0] === "getElementById") {
                if (fail === "") {
                    // @ts-ignore - TypeScript cannot implicitly walk the DOM by combining data structures and DOM methods
                    // eslint-disable-next-line
                    element = element[node[0]](node[1]);
                }
                str.push(".");
                str.push(node[0]);
                str.push("(\"");
                str.push(node[1]);
                str.push("\")");
            } else {
                // @ts-ignore - TypeScript cannot implicitly walk the DOM by combining data structures and DOM methods
                // eslint-disable-next-line
                const el:HTMLElement[] = element[node[0]](node[1]),
                    len:number = (el === null || el.length < 1)
                        ? -1
                        : el.length;
                str.push(".");
                str.push(node[0]);
                str.push("(\"");
                str.push(node[1]);
                str.push("\")");
                str.push("[");
                if (node[2] < 0 && len > 0) {
                    if (fail === "") {
                        element = el[len - 1];
                    }
                    str.push(String(len - 1));
                } else {
                    if (fail === "") {
                        element = el[node[2]];
                    }
                    str.push(String(node[2]));
                }
                str.push("]");
            }
            if (element === null || element === undefined) {
                dom.nodeString = str.join("");
                if (element === undefined) {
                    return undefined;
                }
                return null;
            }
            a = a + 1;
        } while (a < nodeLength);
        dom.nodeString = str.join("");
        if (fail !== "") {
            remote.sendTest([
                [false, fail, dom.nodeString]
            ], remote.index, remote.action);
            remote.domFailure = true;
            return null;
        }
        return element as HTMLElement;
    },

    /* Receives test instructions from the network */
    receive: function browser_utilities_remote_receive(socketData:socketData):void {
        if (location.href.indexOf("?test_browser") > 0) {
            const data:service_testBrowser = socketData.data as service_testBrowser;
            if (location.href.indexOf("test_browser_verbose") > 0) {
                // eslint-disable-next-line
                console.log(`On browser receiving test index ${data.index}`);
            }
            if (data.action === "close") {
                window.close();
                return;
            }
            if (data.action === "result" && Array.isArray(data.result) === true && data.result.length > 0) {
                remote.sendTest(data.result, data.index, "result");
                return;
            }
            if (data.action !== "nothing" && data.action !== "reset") {
                remote.event(data, false);
            }
        }
    },

    /* Process all cases of a test scenario for a given test item */
    report: function browser_utilities_remote_report(test:test_browserTest[], index:number):void {
        let a:number = 0;
        const result:[boolean, string, string][] = [],
            length:number = test.length;
        if (length > 0) {
            do {
                result.push(remote.evaluate(test[a]));
                if (remote.domFailure === true) {
                    remote.domFailure = false;
                    return;
                }
                a = a + 1;
            } while (a < length);
            remote.sendTest(result, index, remote.action);
        }
    },

    /* A single location to package test evaluations into a format for transfer across the network */
    sendTest: function browser_utilities_remote_sendTest(payload:[boolean, string, string][], index:number, task:test_browserAction):void {
        const test:service_testBrowser = {
            action: task,
            exit: (task === "reset-complete")
                ? browser.testBrowser.exit
                : null,
            index: index,
            result: payload,
            test: null
        };
        if (location.href.indexOf("test_browser_verbose") > 0) {
            // eslint-disable-next-line
            console.log(`On browser sending results for test index ${index}`);
        }
        network.send(test, "test-browser");
    },

    /* Converts a primitive of any type into a string for presentation */
    stringify: function browser_utilities_remote_raw(primitive:primitive):string {
        return (typeof primitive === "string")
            ? `"${primitive.replace(/"/g, "\\\"")}"`
            : String(primitive);
    }

};


export default remote;