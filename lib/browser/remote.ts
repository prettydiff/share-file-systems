
/* lib/browser/remote - A collection of instructions to allow event execute from outside the browser, like a remote control. */

import browser from "./browser.js";
import network from "./network.js";

const remote:module_remote = {
    index: -1
};

remote.delay = function local_remote_delay(config:testBrowserItem):void {
    let a:number = 0;
    const delay:number = 50,
        maxTries:number = 200,
        delayFunction = function local_remote_delay_timeout():void {
            const testResult:[boolean, string, string] = remote.evaluate(config.delay);
            if (testResult[0] === true) {
                if (config.test.length > 0) {
                    remote.test(config.test, config.index);
                } else {
                    network.testBrowserLoaded([testResult], config.index);
                }
                return;
            }
            a = a + 1;
            if (a === maxTries) {
                network.testBrowserLoaded([
                    [false, "delay timeout", config.delay.nodeString],
                    remote.evaluate(config.delay)
                ], config.index);
                return;
            }
            setTimeout(local_remote_delay_timeout, delay);
        };
    // eslint-disable-next-line
    console.log(`Executing delay on test campaign ${config.index}: ${config.name}`);
    if (config.delay === undefined) {
        remote.test(config.test, config.index);
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
remote.evaluate = function local_remote_evaluate(config:testBrowserTest):[boolean, string, string] {
    const rawValue:primitive|Element = (config.type === "element")
            ? remote.node(config.node, config)
            : remote.getProperty(config),
        qualifier:qualifier = config.qualifier,
        configString:string = <string>config.value;
    if (qualifier === "is" && rawValue === configString) {
        return [true, "", config.nodeString];
    }
    if (qualifier === "not" && rawValue !== configString) {
        return [true, "", config.nodeString];
    }
    if (typeof rawValue !== typeof configString) {
        return [false, remote.stringify(<primitive>rawValue), config.nodeString];
    }
    if (typeof rawValue === "string") {
        const index:number = rawValue.indexOf(configString);
        if (qualifier === "begins" && index === 0) {
            return [true, "", config.nodeString];
        }
        if (qualifier === "contains" && index > -1) {
            return [true, "", config.nodeString];
        }
        if (qualifier === "ends" && rawValue.slice(rawValue.length - configString.length) === configString) {
            return [true, "", config.nodeString];
        }
        if (qualifier === "not contains" && index < 0) {
            return [true, "", config.nodeString];
        }
    }
    if (typeof rawValue === "number") {
        if (qualifier === "greater" && rawValue > config.value) {
            return [true, "", config.nodeString];
        }
        if (qualifier === "lesser" && rawValue < config.value) {
            return [true, "", config.nodeString];
        }
    }
    if (config.type === "element") {
        return [false, "element", config.nodeString];
    }
    return [false, remote.stringify(<primitive>rawValue), config.nodeString];
};

// process a single event instance
remote.event = function local_remote_testEvent(testItem:testBrowserItem, pageLoad:boolean):void {
    let a:number = 0,
        element:HTMLElement,
        config:testBrowserEvent,
        htmlElement:HTMLInputElement,
        action:Event,
        alt:boolean = false,
        ctrl:boolean = false,
        shift:boolean = false,
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
                element = <HTMLElement>remote.node(config.node, null);
                if (element === null || element === undefined) {
                    remote.test(testItem.test, testItem.index);
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
                        let tabIndex:number = element.tabIndex;
                        element.tabIndex = 0;
                        element.dispatchEvent(new Event("focus"));
                        if (config.value === "Alt") {
                            if (config.event === "keydown") {
                                alt = true;
                            } else {
                                alt = false;
                            }
                        } else if (config.value === "Control") {
                            if (config.event === "keydown") {
                                ctrl = true;
                            } else {
                                ctrl = false;
                            }
                        } else if (config.value === "Shift") {
                            if (config.event === "keydown") {
                                shift = true;
                            } else {
                                shift = false;
                            }
                        } else {
                            action = new KeyboardEvent(config.event, {
                                key: config.value,
                                altKey: alt,
                                ctrlKey: ctrl,
                                shiftKey: shift
                            });
                        }
                        element.dispatchEvent(action);
                        element.tabIndex = tabIndex;
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
remote.getProperty = function local_remote_getProperty(config:testBrowserTest):primitive {
    const element:Element = remote.node(config.node, config),
        pLength = config.target.length - 1,
        method = function local_remote_getProperty_method(prop:Object, name:string):primitive {
            if (name.slice(name.length - 2) === "()") {
                name = name.slice(0, name.length - 2);
                return prop[name]();
            }
            return prop[name];
        },
        property = function local_remote_getProperty_property():primitive {
            let b:number = 1,
                item:Object = method(element, config.target[0]);
            if (pLength > 1) {
                do {
                    item = method(item, config.target[b]);
                    b = b + 1;
                } while (b < pLength);
            }
            return method(item, config.target[b]);
        };
    if (config.type === "element") {
        return false;
    }
    if (element === null) {
        return null;
    }
    if (element === undefined || pLength < 0) {
        return undefined;
    }
    return (config.type === "attribute")
        ? element.getAttribute(config.target[0])
        : (pLength === 0)
            ? method(element, config.target[0])
            : property();
};

// gather a DOM node using instructions from a data structure
remote.node = function local_remote_node(dom:browserDOM[], test:testBrowserTest):Element {
    let element:Element|Document = document,
        node:[domMethod, string, number],
        a:number = 0;
    const nodeLength:number = dom.length,
        str:string[] = ["document"];
    do {
        node = dom[a];
        if (node[1] === "") {
            element = element[node[0]];
            str.push(".");
            str.push(node[0]);
        } else if (node[2] === null) {
            element = element[node[0]](node[1]);
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
                element = element[node[0]](node[1])[element[node[0]](node[1]).length - 1];
                str.push(String(element[node[0]](node[1]).length - 1));
            } else {
                element = element[node[0]](node[1])[node[2]];
                str.push(String(node[2]));
            }
            str.push("]");
        }
        if (element === null || element === undefined) {
            if (test !== null) {
                test.nodeString = str.join("");
            }
            if (element === undefined) {
                return undefined;
            }
            return null;
        }
        a = a + 1;
    } while (a < nodeLength);
    if (test !== null) {
        test.nodeString = str.join("");
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
remote.test = function local_remote_test(config:testBrowserTest[], index:number):void {
    let a:number = 0;
    const result:[boolean, string, string][] = [],
        length:number = config.length;
    if (length > 0) {
        do {
            result.push(remote.evaluate(config[a]));
            a = a + 1;
        } while (a < length);
        network.testBrowserLoaded(result, index);
    }
};


export default remote;