/* lib/browser/tutorial - An interactive tutorial explaining the application. */

import browser from "./browser.js";
import modal from "./modal.js";
import remote from "./remote.js";
import util from "./util.js";

const tutorial = function browser_tutorial(config:modal):void {
    let index:number = 0;
    const spaces:Element = document.getElementById("spaces"),
        data:tutorialData[] = [
            {
                description: [
                    "This is an interactive tutorial designed to guide you through various basic features of the application. You may escape this tutorial at any time by clicking the close button on the top right corner of this modal.",
                    "For the first step please click the main menu button at the top left corner of the application window."
                ],
                event: "click",
                handler: util.menu,
                node: [
                    ["getElementById", "menuToggle", null]
                ],
                title: "Welcome to Share File Systems"
            }
        ],
        dataLength:number = data.length,
        screen:HTMLElement = document.createElement("div"),
        nextStep = function browser_tutorial_nextStep():void {
            index = index + 1;
            if (index < dataLength) {

            } else {
                
            }
        },
        content = function browser_tutorial_content(index:number):Element {
            const wrapper:Element = document.createElement("div"),
                heading:Element = document.createElement("h3"),
                node:HTMLElement = remote.node(data[index].node, null) as HTMLElement,
                clone:HTMLElement = node.cloneNode(true) as HTMLElement,
                handler = function browser_tutorial_content_handler(event:Event):void {
                    const target:Element = event.target as Element;
                    spaces.removeChild(target);
                    data[index].handler(event);
                    nextStep();
                };
            let position:ClientRect;
            heading.innerHTML = data[index].title;
            wrapper.appendChild(heading);
            data[index].description.forEach(function browser_tutorial_content_description(value):void {
                const p:Element = document.createElement("p");
                p.innerHTML = value;
                wrapper.appendChild(p);
            });
            clone.style.zIndex = "10000";
            clone.style.position = "absolute";
            position = util.screenPosition(clone);
            clone.style.top = `${position.top}px`;
            clone.style.left = `${position.left}px`;
            // @ts-ignore - TS cannot resolve a string to a GlobalEventHandlersEventMap object key
            clone[`on${data[index].event}`] = handler;
            spaces.appendChild(clone);
            wrapper.setAttribute("class", "document");
            return wrapper;
        },
        modalConfig:modal = (config === null)
            ? {
                agent: browser.data.hashDevice,
                agentType: "device",
                content: content(0),
                inputs: ["close"],
                move: false,
                read_only: true,
                title: "Tutorial",
                type: "document"
            }
            : (function browser_tutorial_content():modal {
                if (config.timer === undefined) {
                    config.timer = 0;
                }
                config.content = content(config.timer);
                return config;
            }()),
        contentModal:HTMLElement = modal.create(modalConfig) as HTMLElement;
    screen.setAttribute("id", "tutorial-screen");
    spaces.appendChild(screen);
    contentModal.style.zIndex = "10001";
    screen.onmouseup = function browser_tutorial_mouseup():void {
        contentModal.style.zIndex = "10001";
    };
};

export default tutorial;