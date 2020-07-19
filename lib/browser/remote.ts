
/* lib/browser/remote - A collection of instructions to allow event execute from outside the browser, like a remote control. */

const remote:module_remote = {};

// process a single event instance
remote.event = function local_remote_testEvent(testItem:testBrowserItem):void {
    let a:number = 0,
        b:number = 0,
        element:Element|Document,
        event:testBrowserEvent,
        node:[domMethod, string, number],
        nodeLength:number;
    const eventLength:number = testItem.interaction.length,
        eventInstance = function local_remote_testEvent_eventInstance(eventName:eventName, element:Element):void {
            const event:Event = document.createEvent("Event");
            event.initEvent(eventName, false, true);
            element.dispatchEvent(event);
        };
    do {
        event = testItem.interaction[a];
        nodeLength = event.node.length;
        element = document;
        b = 0;
        if (event.event === "refresh") {
            location.reload();
        } else {
            do {
                node = event.node[b];
                if (node[1] === "") {
                    element = element[node[0]];
                } else if (node[2] === null) {
                    element = element[node[0]](node[1]);
                } else {
                    element = element[node[0]](node[1])[node[2]];
                }
                b = b + 1;
            } while (b < nodeLength);
            if (event.event === "setValue") {
                const htmlElement:HTMLInputElement = <HTMLInputElement>element;
                htmlElement.value = event.value;
            } else {
                eventInstance(event.event, <Element>element);
            }
        }
        a = a + 1;
    } while (a < eventLength);
    //console.log(testItem.test);
};

export default remote;