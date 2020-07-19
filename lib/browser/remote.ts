
/* lib/browser/remote - A collection of instructions to allow event execute from outside the browser, like a remote control. */

import network from "./network.js";

const remote:module_remote = {};

// process a single event instance
remote.event = function local_remote_testEvent(testItem:testBrowserItem):void {
    let a:number = 0,
        element:Element,
        config:testBrowserEvent;
    const eventLength:number = testItem.interaction.length;
    remote.index = testItem.index;
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
        remote.test(testItem.test);
    }, 500);
};

remote.index = -1;

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
remote.test = function local_remote_test(config:testBrowserTest[]):void {
    let a:number = 0,
        b:number = 0,
        element:Element,
        pLength:number,
        property:Object;
    const result:boolean[] = [],
        length:number = config.length;
    do {
        element = remote.node(config[a].node);
        if (element === null) {
            result.push(false);
        } else if (config[a].type === "attribute") {
            if (config[a].value === element.getAttribute(config[a].target[0])) {
                result.push(true);
            } else {
                result.push(false);
            }
        } else if (config[a].type === "property") {
            pLength = config[a].target.length - 1;
            if (pLength < 1) {
                // only one property
                if (config[a].value === element[config[a].target[0]]) {
                    result.push(true);
                } else {
                    result.push(false);
                }
            } else {
                // many properties
                property = element[config[a].target[0]];
                b = 1;
                if (pLength > 1) {
                    do {
                        property = property[config[a].target[b]];
                        b = b + 1;
                    } while (b < pLength);
                }
                if (config[a].value === property[config[a].target[b]] === true) {
                    result.push(true);
                } else {
                    result.push(false);
                }
            }
        }
        a = a + 1;
    } while (a < length);
    network.testBrowserLoaded(result);
}


export default remote;