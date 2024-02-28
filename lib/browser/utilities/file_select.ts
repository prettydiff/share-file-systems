
/* lib/browser/utilities/file_select - Changes a file list item to a selected state. */

import browser from "./browser.js";
import util from "./util.js";
import zTop from "./zTop.js";

const file_select = function browser_utilities_fileSelect(event:KeyboardEvent|MouseEvent):void {
    event.preventDefault();
    util.contextMenuRemove();
    const keyboardEvent:KeyboardEvent = event as KeyboardEvent,
        element:HTMLElement = (function browser_utilities_fileSelect_element():HTMLElement {
            const el:HTMLElement = event.target;
            if (el.lowName() === "li") {
                return el;
            }
            return el.getAncestor("li", "tag");
        }()),
        setClasses = function browser_utilities_fileSelect_setClasses(el:HTMLElement, className:string, selectState:boolean):void {
            const parent:HTMLElement = el.parentNode;
            if (selectState === true) {
                if (className !== null && className.indexOf("cut") > -1) {
                    el.setAttribute("class", "cut");
                } else {
                    el.removeAttribute("class");
                }
                parent.getElementsByTagName("input")[0].checked = false;
                delete modalData.selection[el.getElementsByTagName("label")[0].innerHTML];
            } else {
                if (className !== null && className.indexOf("cut") > -1) {
                    el.setAttribute("class", "selected cut");
                } else {
                    el.setAttribute("class", "selected");
                }
                parent.getElementsByTagName("input")[0].checked = true;
                modalData.selection[el.getElementsByTagName("label")[0].innerHTML] = "selected";
            }
        },
        p:HTMLElement = element.getElementsByTagName("p")[0],
        classy:string = p.getAttribute("class"),
        parent:HTMLElement = p.parentNode,
        input:HTMLInputElement = parent.getElementsByTagName("input")[0],
        state:boolean = input.checked;
    let body:HTMLElement = p,
        box:modal,
        modalData:config_modal;
    if (document.getElementById("newFileItem") === null) {
        if (browser.dragFlag !== "") {
            event.preventDefault();
            event.stopPropagation();
        }
        input.focus();
        zTop(keyboardEvent);
        body = body.getAncestor("body", "class");
        box = body.parentNode.parentNode;
        modalData = browser.ui.modals[box.getAttribute("id")];

        if (document.getElementById("dragBox") !== null) {
            return;
        }

        if (keyboardEvent.ctrlKey === true || browser.dragFlag === "control") {
            setClasses(p, classy, state);
        } else if (keyboardEvent.shiftKey === true || browser.dragFlag === "shift") {
            const liList:HTMLCollectionOf<HTMLElement> = body.getElementsByTagName("p"),
                shift = function browser_utilities_fileSelect_shift(index:number, end:number):void {
                    let liClassy:string;
                    if (state === true) {
                        do {
                            liClassy = liList[index].getAttribute("class");
                            setClasses(liList[index], liClassy, state);
                            index = index + 1;
                        } while (index < end);
                    } else {
                        do {
                            liClassy = liList[index].getAttribute("class");
                            setClasses(liList[index], liClassy, state);
                            index = index + 1;
                        } while (index < end);
                    }
                },
                listLength:number = liList.length;
            let a:number = 0,
                focus:HTMLElement = browser.ui.modals[box.getAttribute("id")].focus,
                elementIndex:number = -1,
                focusIndex:number = -1;
            if (focus === null || focus === undefined) {
                browser.ui.modals[box.getAttribute("id")].focus = liList[0];
                focus = liList[0];
            }
            do {
                if (liList[a] === p) {
                    elementIndex = a;
                    if (focusIndex > -1) {
                        break;
                    }
                } else if (liList[a] === focus) {
                    focusIndex = a;
                    if (elementIndex > -1) {
                        break;
                    }
                }
                a = a + 1;
            } while (a < listLength);
            if (focusIndex === elementIndex) {
                setClasses(p, classy, state);
                if (state === true) {
                    input.checked = false;
                } else {
                    input.checked = true;
                }
            } else if (focusIndex > elementIndex) {
                shift(elementIndex, focusIndex);
            } else {
                shift(focusIndex + 1, elementIndex + 1);
            }
        } else {
            const inputs:HTMLCollectionOf<HTMLInputElement> = body.getElementsByTagName("input"),
                inputsLength:number = inputs.length,
                selected:boolean = (p.getAttribute("class") !== null && p.getAttribute("class").indexOf("selected") > -1);
            let a:number = 0,
                item:HTMLElement,
                itemClass:string,
                itemParent:HTMLElement;
            do {
                if (inputs[a].checked === true) {
                    itemParent = inputs[a].parentNode.parentNode;
                    item = itemParent.getElementsByTagName("p")[0];
                    itemClass = item.getAttribute("class");
                    setClasses(item, itemClass, true);
                }
                a = a + 1;
            } while (a < inputsLength);
            input.checked = true;
            if (selected === false) {
                setClasses(p, classy, false);
                modalData.selection = {};
            }
        }
        modalData.focus = p;
        browser.configuration();
    }
};

export default file_select;