/* lib/browser/tutorial - An interactive tutorial explaining the application. */

import browser from "./browser.js";
import fileBrowser from "./fileBrowser.js";
import modal from "./modal.js";
import network from "./network.js";
import remote from "./remote.js";
import util from "./util.js";

const tutorial = function browser_tutorial():void {
    let index:number = 0;
    const data:tutorialData[] = [
            {
                description: [
                    "This is an interactive tutorial designed to guide you through various basic features of the application. You may escape this tutorial at any time by clicking the close button on the top right corner of this modal.",
                    "At each step in the application focus will be shifted to the area of concentration which will also be marked by a brightly colored dashed outline.",
                    "For the first step please click the <strong>main menu button</strong> at the top left corner of the application window."
                ],
                event: "click",
                handler: util.menu,
                node: [
                    ["getElementById", "menuToggle", null]
                ],
                title: "Welcome to Share File Systems"
            },
            {
                description: [
                    "This is the main menu where most of the application's functionality is offered.",
                    "Tutorial will move to the next step in 5 seconds."
                ],
                event: "wait",
                handler: null,
                node: [
                    ["getElementById", "menu", null]
                ],
                title: "Main menu"
            },
            {
                description: [
                    "<strong>Click</strong> on the <strong>File Navigator button</strong> to open a File Navigate modal."
                ],
                event: "click",
                handler: fileBrowser.navigate,
                node: [
                    ["getElementById", "fileNavigator", null]
                ],
                title: "Open a File Navigate modal"
            },
            {
                description: [
                    "This tutorial messaging is probably overlapping our File Navigator modal, so let's move it out of the way."
                ],
                event: "mouseup",
                handler: null,
                node: [
                    ["getModalsByModalType", "document", 0],
                    ["getElementsByClassName", "heading", 0],
                    ["getElementsByTagName", "button", 0]
                ],
                title: "Move a modal"
            }
        ],
        dataLength:number = data.length,
        nextStep = function browser_tutorial_nextStep():void {
            index = index + 1;
            network.settings("configuration", null);
            body.innerHTML = "";
            if (index < dataLength) {
                body.appendChild(content(index));
            } else {
                const div:Element = document.createElement("div"),
                    p:Element = document.createElement("p"),
                    heading:Element = document.createElement("h3");
                heading.innerHTML = "Tutorial complete!";
                p.innerHTML = "Please <strong>click the red close button</strong> in the top left corner of this modal to exit the tutorial.";
                div.appendChild(heading);
                div.appendChild(p);
                body.appendChild(div);
            }
        },
        content = function browser_tutorial_content(index:number):Element {
            const wrapper:Element = document.createElement("div"),
                heading:Element = document.createElement("h3"),
                node:HTMLElement = remote.node(data[index].node, null) as HTMLElement,
                handler = function browser_tutorial_content_handler(event:Event):void {
                    const target:HTMLElement = event.target as HTMLElement;
                    target.style.outline = "none";
                    if (data[index].handler !== null) {
                        data[index].handler(event);
                    }
                    // @ts-ignore - TS cannot resolve a string to a GlobalEventHandlersEventMap object key name
                    target[`on${data[index].event}`] = data[index].handler;
                    nextStep();
                };
            heading.innerHTML = data[index].title;
            wrapper.appendChild(heading);
            data[index].description.forEach(function browser_tutorial_content_description(value):void {
                const p:Element = document.createElement("p");
                p.innerHTML = value;
                wrapper.appendChild(p);
            });
            if (data[index].event === "wait") {
                setTimeout(nextStep, 5000);
            } else {
                node.style.outlineWidth = "0.2em";
                node.style.outlineStyle = "dashed";
                // @ts-ignore - TS cannot resolve a string to a GlobalEventHandlersEventMap object key name
                node[`on${data[index].event}`] = handler;
                node.focus();
            }
            wrapper.setAttribute("class", "document");
            return wrapper;
        },
        modalConfig:modal = {
            agent: browser.data.hashDevice,
            agentType: "device",
            content: content(0),
            inputs: ["close"],
            move: false,
            read_only: true,
            title: "Tutorial",
            type: "document"
        },
        contentModal:HTMLElement = modal.create(modalConfig) as HTMLElement,
        body:HTMLElement = contentModal.getElementsByClassName("body")[0] as HTMLElement;
    contentModal.style.zIndex = "10001";
};

export default tutorial;