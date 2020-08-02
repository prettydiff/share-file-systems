
/* lib/browser/remote - A collection of instructions to allow event execute from outside the browser, like a remote control. */

import network from "./network.js";

const remote:module_remote = {};

remote.delay = function local_remote_delay(config:testBrowserItem):void {
    let a:number = 0;
    const delay:number = 50,
        maxTries:number = 40,
        delayFunction = function local_remote_delay_timeout():void {
            if (remote.evaluate(config.delay)[0] === true) {
                return remote.test(config.test, config.index);
            }
            a = a + 1;
            if (a === maxTries) {
                network.testBrowserLoaded([
                    [false, "delay timeout"],
                    [false, remote.stringify(remote.getProperty(config.delay))]
                ], config.index);
                return;
            }
            setTimeout(local_remote_delay_timeout, delay);
        };
    // eslint-disable-next-line
    console.log(`Executing delay on test: ${config.name}`);
    setTimeout(delayFunction, delay);
};

// determine whether a given test item is pass or fail
remote.evaluate = function local_remote_evaluate(config:testBrowserTest):[boolean, string] {
    const rawValue:primitive|Element = (config.type === "element")
            ? remote.node(config.node)
            : remote.getProperty(config),
        qualifier:qualifier = config.qualifier,
        configString:string = <string>config.value,
        index:number = (typeof rawValue === "string" && typeof configString === "string")
            ? rawValue.indexOf(configString)
            : -1;
    if (qualifier === "begins" && index === 0) {
        return [true, ""];
    }
    if (qualifier === "contains" && index > -1) {
        return [true, ""];
    }
    if (qualifier === "ends" && typeof rawValue === "string" && typeof configString === "string" && index === rawValue.length - configString.length) {
        return [true, ""];
    }
    if (qualifier === "greater" && typeof rawValue === "number" && typeof config.value === "number" && rawValue > config.value) {
        return [true, ""];
    }
    if (qualifier === "is" && rawValue === configString) {
        return [true, ""];
    }
    if (qualifier === "lesser" && typeof rawValue === "number" && typeof config.value === "number" && rawValue < config.value) {
        return [true, ""];
    }
    if (qualifier === "not" && rawValue !== configString) {
        return [true, ""];
    }
    if (qualifier === "not contains" && typeof rawValue === "string" && typeof configString === "string" && index < 0) {
        return [true, ""];
    }
    if (config.type === "element") {
        return [false, "element"];
    }
    return [false, remote.stringify(<primitive>rawValue)];
};

// process a single event instance
remote.event = function local_remote_testEvent(testItem:testBrowserItem):void {
    let a:number = 0,
        element:Element,
        config:testBrowserEvent,
        htmlElement:HTMLInputElement,
        action:Event;
    const eventLength:number = testItem.interaction.length;
    do {
        config = testItem.interaction[a];
        if (config.event === "refresh") {
            location.reload();
        } else {
            element = remote.node(config.node);
            if (element === null) {
                remote.test(testItem.test, testItem.index);
                return;
            }
            if (config.event === "setValue") {
                htmlElement = <HTMLInputElement>element;
                htmlElement.value = config.value;
            } else {
                action = document.createEvent("Event");
                action.initEvent(config.event, false, true);
                element.dispatchEvent(action);
            }
        }
        a = a + 1;
    } while (a < eventLength);
    if (testItem.delay === undefined) {
        remote.test(testItem.test, testItem.index);
        return;
    }
    remote.delay(testItem);
};

// get the value of the specified property/attribute
remote.getProperty = function local_remote_getProperty(config:testBrowserTest):primitive {
    const element:Element = remote.node(config.node),
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
    if (element === null) {
        return null;
    }
    if (element === undefined) {
        return undefined;
    }
    return (config.type === "attribute")
        ? element.getAttribute(config.target[0])
        : (pLength < 1)
            ? method(element, config.target[0])
            : property();
};

// gather a DOM node using instructions from a data structure
remote.node = function local_remote_node(config:browserDOM[]):Element {
    let element:Element|Document = document,
        node:[domMethod, string, number],
        a:number = 0;
    const nodeLength:number = config.length;
    do {
        node = config[a];
        if (node[1] === "") {
            element = element[node[0]];
        } else if (node[2] === null) {
            element = element[node[0]](node[1]);
        } else {
            if (node[2] < 0 && element[node[0]](node[1]) !== null && element[node[0]](node[1]).length > 0) {
                element = element[node[0]](node[1])[element[node[0]](node[1]).length - 1];
            } else {
                element = element[node[0]](node[1])[node[2]];
            }
        }
        if (element === null || element === undefined) {
            return null;
        }
        a = a + 1;
    } while (a < nodeLength);
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
    const result:[boolean, string][] = [],
        length:number = config.length;
    do {
        result.push(remote.evaluate(config[a]));
        a = a + 1;
    } while (a < length);
    network.testBrowserLoaded(result, index);
};


export default remote;