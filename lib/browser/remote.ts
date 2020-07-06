
/* lib/browser/remote - A collection of instructions to allow event execute from outside the browser, like a remote control. */

const remote:module_remote = {};

remote.event = function local_remote_event(nodeString:string, selector:selector, eventName:string):void {
    const event:Event = document.createEvent(eventName),
        node:Element = document.getElementById(selector);
    event.initEvent(eventName, false, true);
    node.dispatchEvent(event);
};

export default remote;