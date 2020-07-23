
/* lib/browser/remote - A collection of instructions to allow event execute from outside the browser, like a remote control. */

import network from "./network.js";

const remote:module_remote = {};

// process a single event instance
remote.event = function local_remote_testEvent(testItem:testBrowserItem):void {
    let a:number = 0,
        element:Element,
        config:testBrowserEvent;
    const eventLength:number = testItem.interaction.length;
    do {
        config = testItem.interaction[a];
        if (config.event === "refresh") {
            location.reload();
        } else {
            element = remote.node(config.node);
            if (config.event === "setValue") {
                const htmlElement:HTMLInputElement = <HTMLInputElement>element;
                htmlElement.value = config.value;
            } else {
                const action:Event = document.createEvent("Event");
                action.initEvent(config.event, false, true);
                element.dispatchEvent(action);
            }
        }
        a = a + 1;
    } while (a < eventLength);
    setTimeout(function local_remote_testEvent_delay(){
        remote.test(testItem.test, testItem.index);
    }, 500);
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
            element = element[node[0]](node[1])[node[2]];
        }
        a = a + 1;
    } while (a < nodeLength);
    return <Element>element;
};

//process all cases of a test scenario for a given test item
remote.test = function local_remote_test(config:testBrowserTest[], index:number):void {
    let a:number = 0,
        element:Element;
    const result:[boolean, string][] = [],
        length:number = config.length,
        attribution = function local_remote_test_attribution():void {
            const stringify = function local_remote_test_attribution_raw(input:primitive):string {
                    return (typeof input === "string")
                        ? `"${input.replace(/"/g, "\\\"")}"`
                        : String(input);
                },
                getProperty = function local_remote_test_attribution_getProperty():primitive {
                    const pLength = config[a].target.length - 1,
                        property = function local_remote_test_attribution_getProperty_property():primitive {
                            let b:number = 1,
                                property:Object = element[config[a].target[0]];
                            if (pLength > 1) {
                                do {
                                    property = property[config[a].target[b]];
                                    b = b + 1;
                                } while (b < pLength);
                            }
                            return property[config[a].target[b]];
                        };
                    return (config[a].type === "attribute")
                        ? element.getAttribute(config[a].target[0])
                        : (pLength < 1)
                            ? element[config[a].target[0]]
                            : property();
                },
                rawValue:primitive = getProperty(),
                qualifier:qualifier = config[a].qualifier,
                configString:string = <string>config[a].value,
                index:number = (typeof rawValue === "string" && typeof configString === "string")
                    ? rawValue.indexOf(configString)
                    : -1;
            if (qualifier === "begins" && index === 0) {
                result.push([true, ""]);
            } else if (qualifier === "contains" && index > -1) {
                result.push([true, ""]);
            } else if (qualifier === "ends" && typeof rawValue === "string" && typeof configString === "string" && index === rawValue.length - configString.length) {
                result.push([true, ""]);
            } else if (qualifier === "is" && rawValue === configString) {
                result.push([true, ""]);
            } else if (qualifier === "not" && rawValue !== configString) {
                result.push([true, ""]);
            } else if (qualifier === "not contains" && typeof rawValue === "string" && typeof configString === "string" && index < 0) {
                result.push([true, ""]);
            } else {
                result.push([false, stringify(rawValue)]);
            }
        };
    do {
        element = remote.node(config[a].node);
        if (element === null) {
            result.push([false, null]);
        } else {
            attribution();
        }
        a = a + 1;
    } while (a < length);
    network.testBrowserLoaded(result, index);
}


export default remote;