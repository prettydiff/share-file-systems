
/* lib/browser/remote - A collection of instructions to allow event execution from outside the browser, like a remote control. */

import browser from "./browser.js";
import network from "./network.js";

const remote:module_remote = {

    /* The action this module should take in response to test instructions from the terminal */
    action: "result",

    /* Executes the delay test unit if a given test has a delay property */
    delay: function browser_remote_delay(config:testBrowserItem):void {
        let a:number = 0;
        const delay:number = 50,
            maxTries:number = 200,
            delayFunction = function browser_remote_delay_timeout():void {
                const testResult:[boolean, string, string] = remote.evaluate(config.delay);
                if (testResult[0] === true) {
                    if (config.unit.length > 0) {
                        remote.report(config.unit, remote.index);
                    } else {
                        network.testBrowser([testResult], remote.index, remote.action);
                    }
                    return;
                }
                a = a + 1;
                if (a === maxTries) {
                    network.testBrowser([
                        [false, "delay timeout", config.delay.node.nodeString],
                        remote.evaluate(config.delay)
                    ], remote.index, remote.action);
                    return;
                }
                setTimeout(browser_remote_delay_timeout, delay);
            };
        // eslint-disable-next-line
        console.log(`Executing delay on test number ${remote.index + 1}: ${config.name}`);
        if (config.delay === undefined) {
            remote.report(config.unit, remote.index);
        } else {
            setTimeout(delayFunction, delay);
        }
    },

    /* Indicates a well formed test that is logically invalid against the DOM */
    domFailure: false,

    /* Report javascript errors as test failures */
    // eslint-disable-next-line
    error: function browser_remote_error(message:string, source:string, line:number, col:number, error:Error):void {
        network.testBrowser([[false, JSON.stringify({
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
    evaluate: function browser_remote_evaluate(test:testBrowserTest):[boolean, string, string] {
        const rawValue:Element|primitive = (test.type === "element")
                ? remote.node(test.node, test.target[0])
                : remote.getProperty(test),
            qualifier:qualifier = test.qualifier,
            configString:string = test.value as string;
        if (qualifier === "is" && rawValue === configString) {
            return [true, "", test.node.nodeString];
        }
        if (qualifier === "not" && rawValue !== configString) {
            return [true, "", test.node.nodeString];
        }
        if (typeof rawValue !== typeof configString) {
            return [false, remote.stringify(rawValue as primitive), test.node.nodeString];
        }
        if (typeof rawValue === "string") {
            const index:number = rawValue.indexOf(configString);
            if (qualifier === "begins" && index === 0) {
                return [true, "", test.node.nodeString];
            }
            if (qualifier === "contains" && index > -1) {
                return [true, "", test.node.nodeString];
            }
            if (qualifier === "ends" && rawValue.slice(rawValue.length - configString.length) === configString) {
                return [true, "", test.node.nodeString];
            }
            if (qualifier === "not contains" && index < 0) {
                return [true, "", test.node.nodeString];
            }
        }
        if (typeof rawValue === "number") {
            if (qualifier === "greater" && rawValue > test.value) {
                return [true, "", test.node.nodeString];
            }
            if (qualifier === "lesser" && rawValue < test.value) {
                return [true, "", test.node.nodeString];
            }
        }
        if (test.type === "element") {
            return [false, "element", test.node.nodeString];
        }
        return [false, remote.stringify(rawValue as primitive), test.node.nodeString];
    },

    /* Process a single event instance */
    event: function browser_remote_event(item:testBrowserRoute, pageLoad:boolean):void {
        let a:number = 0,
            refresh:boolean = false;
        const complete = function browser_remote_event_complete():void {
                if (refresh === false) {
                    remote.delay(item.test);
                }
            },
            action = function browser_remote_event_action(index:number):void {
                let element:HTMLElement,
                    config:testBrowserEvent,
                    htmlElement:HTMLInputElement,
                    event:Event,
                    delay:number;
                do {
                    config = item.test.interaction[index];
                    if (config.event === "refresh") {
                        if (index === 0) {
                            location.reload();
                        } else {
                            remote.error("The event 'refresh' was provided not as the first event of a test", "", 0, 0, null);
                            return;
                        }
                    } else if (config.event === "wait") {
                        delay = (isNaN(Number(config.value)) === true)
                            ? 0
                            : Number(config.value);
                        index = index + 1;
                        setTimeout(function browser_remote_event_action_delayNext():void {
                            if (index < eventLength) {
                                browser_remote_event_action(index);
                            } else {
                                complete();
                            }
                        }, delay);
                        return;
                    } else if (config.event !== "refresh-interaction") {
                        element = remote.node(config.node, null) as HTMLElement;
                        if (remote.domFailure === true) {
                            remote.domFailure = false;
                            return;
                        }
                        if (element === null || element === undefined) {
                            network.testBrowser([
                                [false, `event error ${String(element)}`, config.node.nodeString]
                            ], item.index, item.action);
                            browser.testBrowser = null;
                            return;
                        }
                        if (config.event === "move") {
                            htmlElement = element as HTMLInputElement;
                            htmlElement.style.top = `${config.coords[0]}em`;
                            htmlElement.style.left = `${config.coords[1]}em`;
                        } else if (config.event === "setValue") {
                            config.value = config.value
                                .replace(/string-replace-hash-hashDevice/g, browser.data.hashDevice)
                                .replace(/string-replace-hash-hashUser/g, browser.data.hashUser);
                            htmlElement = element as HTMLInputElement;
                            if (config.value.indexOf("replace\u0000") === 0) {
                                const values:[string, string] = ["", ""],
                                    parent:Element = element.parentNode as Element,
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
                                    const tabIndex:number = element.tabIndex;
                                    event = new KeyboardEvent(config.event, {
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
                                event = new MouseEvent(config.event, {
                                    altKey: remote.keyAlt,
                                    ctrlKey: remote.keyControl,
                                    shiftKey: remote.keyShift
                                });
                                element.dispatchEvent(event);
                            } else {
                                event = document.createEvent("Event");
                                event.initEvent(config.event, true, true);
                                element.dispatchEvent(event);
                            }
                        }
                    }
                    index = index + 1;
                } while (index < eventLength);
                complete();
            },
            eventLength:number = item.test.interaction.length;
        if (item.action === "nothing") {
            return;
        }
        remote.action = item.action;
        remote.index = item.index;
        browser.testBrowser = item;
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
        action(0);
    },

    /* Get the value of the specified property/attribute */
    getProperty: function browser_remote_getProperty(test:testBrowserTest):primitive {
        const element:Element = remote.node(test.node, test.target[0]),
            pLength = test.target.length - 1,
            method = function browser_remote_getProperty_method(prop:Object, name:string):primitive {
                if (name.slice(name.length - 2) === "()") {
                    name = name.slice(0, name.length - 2);
                    // @ts-ignore - prop is some unknown DOM element or element property
                    return prop[name]();
                }
                // @ts-ignore - prop is some unknown DOM element or element property
                return prop[name];
            },
            property = function browser_remote_getProperty_property():primitive {
                let b:number = 1,
                    item:Object = method(element, test.target[0]);
                if (pLength > 1) {
                    do {
                        item = method(item, test.target[b]);
                        b = b + 1;
                    } while (b < pLength);
                }
                return method(item, test.target[b]);
            };
        if (test.type === "element") {
            return false;
        }
        if (element === null) {
            return null;
        }
        if (element === undefined || pLength < 0) {
            return undefined;
        }
        return (test.type === "attribute")
            ? element.getAttribute(test.target[0])
            : (pLength === 0)
                ? method(element, test.target[0])
                : property();
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
    node: function browser_remote_node(dom:testBrowserDOM, property:string):Element {
        let element:Document|Element = document,
            node:[domMethod, string, number],
            a:number = 0,
            fail:string = "";
        const nodeLength:number = dom.length,
            str:string[] = ["document"];
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
                    element = element[node[0]];
                }
                str.push(".");
                str.push(node[0]);
            } else if (node[0] === "childNodes" && node[2] !== null) {
                if (fail === "") {
                    element = element.childNodes[node[2]] as Element;
                }
                str.push(".childNodes[");
                str.push(String(node[2]));
                str.push("]");
            } else if (node[2] === null || node[0] === "getElementById") {
                if (fail === "") {
                    // @ts-ignore - TypeScript cannot implicitly walk the DOM by combining data structures and DOM methods
                    element = element[node[0]](node[1]);
                }
                str.push(".");
                str.push(node[0]);
                str.push("(\"");
                str.push(node[1]);
                str.push("\")");
            } else {
                str.push(".");
                str.push(node[0]);
                str.push("(\"");
                str.push(node[1]);
                str.push("\")");
                str.push("[");
                // @ts-ignore - TypeScript cannot implicitly walk the DOM by combining data structures and DOM methods
                if (node[2] < 0 && element[node[0]](node[1]) !== null && element[node[0]](node[1]).length > 0) {
                    if (fail === "") {
                        // @ts-ignore - TypeScript cannot implicitly walk the DOM by combining data structures and DOM methods
                        element = element[node[0]](node[1])[element[node[0]](node[1]).length - 1];
                    }
                    // @ts-ignore - TypeScript cannot implicitly walk the DOM by combining data structures and DOM methods
                    str.push(String(element[node[0]](node[1]).length - 1));
                } else {
                    if (fail === "") {
                        // @ts-ignore - TypeScript cannot implicitly walk the DOM by combining data structures and DOM methods
                        element = element[node[0]](node[1])[node[2]];
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
            network.testBrowser([
                [false, fail, dom.nodeString]
            ], remote.index, remote.action);
            remote.domFailure = true;
            return null;
        }
        return element as Element;
    },

    /* Process all cases of a test scenario for a given test item */
    report: function browser_remote_report(test:testBrowserTest[], index:number):void {
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
            network.testBrowser(result, index, remote.action);
        }
    },

    /* Converts a primitive of any type into a string for presentation */
    stringify: function browser_remote_raw(primitive:primitive):string {
        return (typeof primitive === "string")
            ? `"${primitive.replace(/"/g, "\\\"")}"`
            : String(primitive);
    }

};


export default remote;