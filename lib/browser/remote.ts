
/* lib/browser/remote - A collection of instructions to allow event execute from outside the browser, like a remote control. */

import browser from "./browser.js";
import network from "./network.js";

const remote:module_remote = {
    domFailure: false,
    index: -1,
    keyAlt: false,
    keyControl: false,
    keyShift: false
};

remote.delay = function local_remote_delay(config:testBrowserItem):void {
    let a:number = 0;
    const delay:number = 50,
        maxTries:number = 200,
        delayFunction = function local_remote_delay_timeout():void {
            const testResult:[boolean, string, string] = remote.evaluate(config.delay, config);
            if (testResult[0] === true) {
                if (config.unit.length > 0) {
                    remote.test(config.unit, config.index, config);
                } else {
                    network.testBrowserLoaded([testResult], config.index);
                }
                return;
            }
            a = a + 1;
            if (a === maxTries) {
                network.testBrowserLoaded([
                    [false, "delay timeout", config.delay.node.nodeString],
                    remote.evaluate(config.delay, config)
                ], config.index);
                return;
            }
            setTimeout(local_remote_delay_timeout, delay);
        };
    // eslint-disable-next-line
    console.log(`Executing delay on test campaign ${config.index}: ${config.name}`);
    if (config.delay === undefined) {
        remote.test(config.unit, config.index, config);
    } else {
        setTimeout(delayFunction, delay);
    }
};

// report javascript errors as test failures
// eslint-disable-next-line
remote.error = function local_remote_error(message:string, source:string, line:number, col:number, error:Error):void {
    network.testBrowserLoaded([[false, JSON.stringify({
        file: source,
        column: col,
        line: line,
        message: message,
        stack: (error === null)
            ? null
            : error.stack
    }), "error"]], remote.index);
};

// determine whether a given test item is pass or fail
remote.evaluate = function local_remote_evaluate(test:testBrowserTest, config:testBrowserItem):[boolean, string, string] {
    const rawValue:primitive|Element = (test.type === "element")
            ? remote.node(test.node, config)
            : remote.getProperty(test, config),
        qualifier:qualifier = test.qualifier,
        configString:string = <string>test.value;
    if (qualifier === "is" && rawValue === configString) {
        return [true, "", test.node.nodeString];
    }
    if (qualifier === "not" && rawValue !== configString) {
        return [true, "", test.node.nodeString];
    }
    if (typeof rawValue !== typeof configString) {
        return [false, remote.stringify(<primitive>rawValue), test.node.nodeString];
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
    return [false, remote.stringify(<primitive>rawValue), test.node.nodeString];
};

// process a single event instance
remote.event = function local_remote_testEvent(testItem:testBrowserItem, pageLoad:boolean):void {
    let a:number = 0,
        element:HTMLElement,
        config:testBrowserEvent,
        htmlElement:HTMLInputElement,
        action:Event,
        refresh:boolean = false,
        stringReplace = function local_remote_testEvent_stringReplace(str:string):string {
            return str
                .replace(/string-replace-hash-hashDevice/g, browser.data.hashDevice)
                .replace(/string-replace-hash-hashUser/g, browser.data.hashUser);
        };
    const eventLength:number = testItem.interaction.length;
    if (remote.index < testItem.index) {
        remote.index = testItem.index;
        browser.testBrowser = testItem;
        do {
            if (testItem.interaction[a].event === "refresh-interaction") {
                if (pageLoad === true) {
                    remote.delay(testItem);
                    return;
                }
                refresh = true;
            }
            a = a + 1;
        } while (a < eventLength);

        a = 0;
        do {
            config = testItem.interaction[a];
            if (config.event === "refresh") {
                if (a === 0) {
                    location.reload();
                } else {
                    remote.error("The event 'refresh' was provided not as the first event of a campaign", "", 0, 0, null);
                    return;
                }
            } else if (testItem.interaction[a].event !== "refresh-interaction") {
                element = <HTMLElement>remote.node(config.node, testItem);
                if (remote.domFailure === true) {
                    remote.domFailure = false;
                    return;
                }
                if (element === null || element === undefined) {
                    network.testBrowserLoaded([
                        [false, `event error ${String(element)}`, config.node.nodeString]
                    ], testItem.index);
                    browser.testBrowser = null;
                    return;
                }
                if (config.event === "move") {
                    htmlElement = <HTMLInputElement>element;
                    htmlElement.style.top = `${config.coords[0]}em`;
                    htmlElement.style.left = `${config.coords[1]}em`;
                } else if (config.event === "setValue") {
                    htmlElement = <HTMLInputElement>element;
                    htmlElement.value = stringReplace(config.value);
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
                            action = new KeyboardEvent(config.event, {
                                key: config.value,
                                altKey: remote.keyAlt,
                                ctrlKey: remote.keyControl,
                                shiftKey: remote.keyShift
                            });
                            element.tabIndex = 0;
                            element.dispatchEvent(new Event("focus"));
                            element.dispatchEvent(action);
                            element.tabIndex = tabIndex;
                        }
                    } else if (config.event === "click" || config.event === "contextmenu" || config.event === "dblclick" || config.event === "mousedown" || config.event === "mouseenter" || config.event === "mouseleave" || config.event === "mousemove" || config.event === "mouseout" || config.event === "mouseover" || config.event === "mouseup" || config.event === "touchend" || config.event === "touchstart") {
                        action = new MouseEvent(config.event, {
                            altKey: remote.keyAlt,
                            ctrlKey: remote.keyControl,
                            shiftKey: remote.keyShift
                        });
                        element.dispatchEvent(action);
                    } else {
                        action = document.createEvent("Event");
                        action.initEvent(config.event, false, true);
                        element.dispatchEvent(action);
                    }
                }
            }
            a = a + 1;
        } while (a < eventLength);
        if (refresh === false) {
            remote.delay(testItem);
        }
    }
};

// get the value of the specified property/attribute
remote.getProperty = function local_remote_getProperty(test:testBrowserTest, config:testBrowserItem):primitive {
    const element:Element = remote.node(test.node, config),
        pLength = test.target.length - 1,
        method = function local_remote_getProperty_method(prop:Object, name:string):primitive {
            if (name.slice(name.length - 2) === "()") {
                name = name.slice(0, name.length - 2);
                return prop[name]();
            }
            return prop[name];
        },
        property = function local_remote_getProperty_property():primitive {
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
};

// gather a DOM node using instructions from a data structure
remote.node = function local_remote_node(dom:testBrowserDOM, config:testBrowserItem):Element {
    let element:Element|Document = document,
        node:[domMethod, string, number],
        a:number = 0,
        fail:string = "";
    const nodeLength:number = dom.length,
        str:string[] = ["document"];
    do {
        node = dom[a];
        if (node[0] === "getElementById" && a > 0) {
            fail = "getElementById";
        }
        if (node[0] === "childNodes" && node[2] === null) {
            fail = "childNodes";
        }
        if (node[1] === "" || node[1] === null || node[0] === "documentElement" || node[0] === "firstChild" || node[0] === "lastChild" || node[0] === "nextSibling" || node[0] === "parentNode" || node[0] === "previousSibling") {
            if (fail === "") {
                element = element[node[0]];
            }
            str.push(".");
            str.push(node[0]);
        } else if (node[0] === "childNodes" && node[2] !== null) {
            if (fail === "") {
                element = <Element>element.childNodes[node[2]];
            }
            str.push(".childNodes[");
            str.push(String(node[2]));
            str.push("]");
        } else if (node[2] === null) {
            if (fail === "") {
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
            if (node[2] < 0 && element[node[0]](node[1]) !== null && element[node[0]](node[1]).length > 0) {
                if (fail === "") {
                    element = element[node[0]](node[1])[element[node[0]](node[1]).length - 1];
                }
                str.push(String(element[node[0]](node[1]).length - 1));
            } else {
                if (fail === "") {
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
    if (fail === "getElementById") {
        network.testBrowserLoaded([
            [false, "Bad test. Method 'getElementById' must only occur as the first DOM method", dom.nodeString]
        ], config.index);
        remote.domFailure = true;
        return null;
    }
    if (fail === "childNodes") {
        network.testBrowserLoaded([
            [false, "Bad test. Property 'childNodes' requires an index value as the third data point of a DOM item: [\"childNodes\", null, 1]", dom.nodeString]
        ], config.index);
        remote.domFailure = true;
        return null;
    }
    return <Element>element;
};

// converts a primitive of any type into a string for presentation
remote.stringify = function local_remote_raw(primitive:primitive):string {
    return (typeof primitive === "string")
        ? `"${primitive.replace(/"/g, "\\\"")}"`
        : String(primitive);
};

//process all cases of a test scenario for a given test item
remote.test = function local_remote_test(test:testBrowserTest[], index:number, config:testBrowserItem):void {
    let a:number = 0;
    const result:[boolean, string, string][] = [],
        length:number = test.length;
    if (length > 0) {
        do {
            result.push(remote.evaluate(test[a], config));
            if (remote.domFailure === true) {
                remote.domFailure = false;
                return;
            }
            a = a + 1;
        } while (a < length);
        network.testBrowserLoaded(result, index);
    }
};


export default remote;