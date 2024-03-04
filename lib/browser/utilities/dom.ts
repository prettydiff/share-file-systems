
/* lib/browser/utilities/dom - Extensions to the DOM to provide navigational functionality not present from the standard methods */

import browser from "./browser.js";

const dom = function browser_utilities_dom():void {
    // addClass - adds a new class value to an element's class attribute if not already present
    // * className:string - The name of the class to add.
    const addClass = function browser_utilities_dom_addClass(className:string):void {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-restricted-syntax
            const element:HTMLElement = this,
                classy:string = element.getAttribute("class"),
                classes:string[] = (classy === null)
                    ? []
                    : classy.split(" ");
            if (classes.indexOf(className) > -1) {
                return;
            }
            if (classes.length < 1) {
                element.setAttribute("class", className);
            } else {
                element.setAttribute("class", `${classy} ${className}`);
            }
        },
        // add text to an DOM element
        // * text: string - The text string to append.
        appendText = function browser_utilities_dom_appendText(text:string):void {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-restricted-syntax
            const element:HTMLElement = this;
            if (text !== "") {
                element.appendChild(document.createTextNode(text));
            }
        },
        // empty - A method to remove all child nodes from an element.
        empty = function browser_utilities_dom_empty():void {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-restricted-syntax
            const start:HTMLElement = this,
                children:NodeListOf<ChildNode> = start.childNodes;
            let len:number = children.length;
            if (len > 0) {
                do {
                    len = len - 1;
                    start.removeChild(children[len]);
                } while (len > 0);
            }
        },
        // getAncestor - A method to walk up the DOM towards the documentElement.
        // * identifier: string - The string value to search for.
        // * selector: "class", "id", "name" - The part of the element to compare the identifier against.
        getAncestor = function browser_utilities_dom_getAncestor(identifier:string, selector:selector):HTMLElement {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-restricted-syntax
            let start:HTMLElement = (this === document) ? document.documentElement : this;
            const test = function browser_utilities_dom_getAncestor_test():boolean {
                    if (selector === "class") {
                        const classy:string = start.getAttribute("class"),
                            classes:string[] = (classy === null)
                                ? []
                                : classy.split(" ");
                        if (classes.indexOf(identifier) > -1) {
                            return true;
                        }
                        return false;
                    }
                    if (selector === "id") {
                        if (start.getAttribute("id") === identifier) {
                            return true;
                        }
                        return false;
                    }
                    if (start.lowName() === identifier) {
                        return true;
                    }
                    return false;
                };
            if (start === null || start === undefined) {
                return null;
            }
            if (start === document.documentElement || test() === true) {
                return start;
            }
            do {
                start = start.parentNode;
                if (start === null) {
                    return null;
                }
            } while (start !== document.documentElement && test() === false);
            return start;
        },
        // getElementByAttribute - Search all descendant elements containing a matching attribute with matching value and returns an array of corresponding elements.
        // * name: string - The name of the attribute to search for.  An empty string means accept every attribute name.
        // * value: string - The attribute value to search for.  An empty string means accept any attribute value.
        getElementsByAttribute = function browser_utilities_dom_getElementsByAttribute(name:string, value:string):HTMLElement[] {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-restricted-syntax
            const start:HTMLElement = (this === document) ? document.documentElement : this,
                attrs:Attr[]    = start.getNodesByType(2) as Attr[],
                out:HTMLElement[]   = [];
            if (typeof name !== "string") {
                name = "";
            }
            if (typeof value !== "string") {
                value = "";
            }
            attrs.forEach(function browser_utilities_dom_getElementsByAttribute_each(item:Attr):void {
                if (item.name === name || name === "") {
                    if (item.value === value || value === "") {
                        out.push(item.ownerElement as HTMLElement);
                    }
                }
            });
            return out;
        },
        // getElementsByText - Returns an array of descendant elements containing the white space trimmed text.
        // * textValue: string - The text to match.  The value must exactly match the complete text node value after trimming white space.
        // * castSensitive: boolean - Whether case sensitivity should apply.
        getElementsByText = function browser_utilities_dom_getElementsByText(textValue:string, caseSensitive?:boolean):HTMLElement[] {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-restricted-syntax
            const start:HTMLElement = (this === document) ? document.documentElement : this,
                texts:Text[]    = start.getNodesByType(3) as Text[],
                out:HTMLElement[]   = [];
            if (typeof textValue !== "string") {
                textValue = "";
            } else {
                textValue = textValue.replace(/^\s+/, "").replace(/\s+$/, "");
            }
            if (typeof caseSensitive !== "boolean") {
                caseSensitive = false;
            }
            texts.forEach(function browser_utilities_dom_getElementsByText_each(item:Text):void {
                const text:string = (caseSensitive === true)
                    ? item.textContent.toLowerCase()
                    : item.textContent;
                if (textValue === "" && text.replace(/\s+/, "") !== "") {
                    out.push(item.parentElement);
                } else if (textValue !== "" && text.replace(/^\s+/, "").replace(/\s+$/, "") === textValue) {
                    out.push(item.parentElement);
                }
            });
            return out;
        },
        // getModalsByType - Returns a list of modals matching a given modal type
        // * The optional type argument indicates what type of modals to return
        // * The default type value is "all" or undefined which returns all modals
        getModalsByModalType = function browser_utilities_dom_getModalsByModalType(type:modalType|"all"):HTMLElement[] {
            const keys:string[] = Object.keys(browser.ui.modals),
                keyLength:number = keys.length,
                output:HTMLElement[] = [];
            let a:number = 0;
            if (typeof type !== "string") {
                type = "all";
            }
            if (keyLength > 0) {
                do {
                    if (type === "all" || browser.ui.modals[keys[a]].type === type) {
                        output.push(document.getElementById(keys[a]));
                    }
                    a = a + 1;
                } while (a < keyLength);
            }
            return output;
        },
        // getNodesByType - Returns an array of DOM nodes matching the provided node type.
        // * typeValue: string|number = The value must be a node type name or a node type number (0-12)
        // - An empty string, "all", or 0 means gather all descendant nodes regardless of type.
        // - For standard values see: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        getNodesByType = function browser_utilities_dom_getNodesByType(typeValue:number|string):Node[] {
            const valueString:string = (typeof typeValue === "string") ? `${typeValue.toLowerCase().replace("_node", "")}_node` : "",
                numb:number = (isNaN(Number(typeValue)) === false)
                    ? Math.round(Number(typeValue))
                    : null,
                output:Node[] = [],
                child = function browser_utilities_dom_getNodesByType_child(recurse:HTMLElement):void {
                    const children:NodeListOf<ChildNode> = recurse.childNodes,
                        len:number              = children.length,
                        attributes:NamedNodeMap = recurse.attributes,
                        atLen:number            = attributes.length;
                    let a:number                = 0;
                    // Special functionality for attribute types.
                    if (atLen > 0 && (types === 2 || types === 0)) {
                        do {
                            output.push(attributes[a]);
                            a = a + 1;
                        } while (a < atLen);
                    }
                    a = 0;
                    if (len > 0) {
                        do {
                            if (children[a].nodeType === types || types === 0) {
                                output.push(children[a]);
                            }
                            if (children[a].nodeType === 1) {
                                //recursion magic
                                browser_utilities_dom_getNodesByType_child(children[a] as HTMLElement);
                            }
                            a = a + 1;
                        } while (a < len);
                    }
                },
                types:number = (function browser_utilities_dom_getNodesByType_types():number {
                    if (valueString === "element_node") {
                        return 1;
                    }
                    if (valueString === "attribute_node") {
                        return 2;
                    }
                    if (valueString === "text_node") {
                        return 3;
                    }
                    if (valueString === "cdata_section_node") {
                        return 4;
                    }
                    if (valueString === "entity_reference_node") {
                        return 5;
                    }
                    if (valueString === "entity_node") {
                        return 6;
                    }
                    if (valueString === "processing_instruction_node") {
                        return 7;
                    }
                    if (valueString === "comment_node") {
                        return 8;
                    }
                    if (valueString === "document_node") {
                        return 9;
                    }
                    if (valueString === "document_type_node") {
                        return 10;
                    }
                    if (valueString === "document_fragment_node") {
                        return 11;
                    }
                    if (valueString === "notation_node") {
                        return 12;
                    }
                    if (numb !== null && numb < 13 && numb > -1) {
                        return numb;
                    }
                    return 0;
                }());

            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, no-restricted-syntax
            child((this === document) ? document.documentElement : this);
            return output;
        },
        // highlight - Adds a class name to an element where that class name results in a CSS animated outline and focuses the element
        // * element: HTMLElement (optional) - A specified element to modify, default is the "this" value executed on an element.
        highlight = function browser_utilities_dom_highlight(element?:HTMLElement):void {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-restricted-syntax
            const item:HTMLElement = (this === document)
                    ? element
                    // eslint-disable-next-line no-restricted-syntax
                    : this,
                classy:string = (item === element)
                    ? null
                    : item.getAttribute("class"),
                classes:string[] = (classy === null)
                    ? null
                    : classy.split(" "),
                el:HTMLElement = (item === undefined)
                    ? null
                    : (item.nodeName.toLowerCase() === "input")
                        ? item.parentNode
                        : (classes !== null && (classes.indexOf("body") > -1 || classes.indexOf("fileList") > -1))
                            ? item.getAncestor("box", "class")
                            : item,
                position:string = (el === null)
                    ? null
                    : getComputedStyle(el).position;
            if (el === null) {
                return;
            }
            el.addClass("highlight");
            if (position !== "absolute" && position !== "relative" && position !== "fixed") {
                el.style.position = "relative";
            }
            el.focus();
        },
        // return a tag's lowercase name.  XML is case sensitive, but HTML returns uppercase tag names
        lowName = function browser_utilities_dom_lowName():string {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, no-restricted-syntax
            return this.tagName.toLowerCase();
        },
        // removes a single class name from an element's class attribute value
        // * className: string - The name of the class to remove.
        removeClass = function browser_utilities_dom_removeClass(className:string):void {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-restricted-syntax
            const element:HTMLElement = this,
                classy:string = element.getAttribute("class"),
                classes:string[] = (classy === null)
                    ? []
                    : classy.split(" "),
                index:number = classes.indexOf(className);
            if (index < 0) {
                return;
            }
            classes.splice(index, 1);
            if (classes.length < 1) {
                element.removeAttribute("class");
            } else {
                element.setAttribute("class", classes.join(" "));
            }
        },
        // removes the "highlight" class name from a given element
        // * element: HTMLElement (optional) - A specified element to modify, default is the "this" value executed on an element.
        removeHighlight = function browser_utilities_dom_removeHighlight(element?:HTMLElement):void {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-restricted-syntax
            const item:HTMLElement = (this === document)
                    ? element
                    // eslint-disable-next-line no-restricted-syntax
                    : this,
                el:HTMLElement = (item === undefined)
                    ? null
                    : (item.nodeName.toLowerCase() === "input")
                        ? item.parentNode
                        : item,
                style:string = (el === null)
                    ? null
                    : el.getAttribute("style");
            if (el === null) {
                return;
            }
            el.removeClass("highlight");
            if (style !== null && style.indexOf("position") > -1) {
                el.style.position = "static";
            }
        };

    // Create a document method
    document.getElementsByAttribute          = getElementsByAttribute;
    document.getNodesByType                  = getNodesByType;
    document.getModalsByModalType            = getModalsByModalType;
    document.getElementsByText               = getElementsByText;
    document.highlight                       = highlight;
    document.removeHighlight                 = removeHighlight;

    // Ensure dynamically created elements get these methods too
    Element.prototype.addClass               = addClass;
    Element.prototype.appendText             = appendText;
    Element.prototype.empty                  = empty;
    Element.prototype.getAncestor            = getAncestor;
    Element.prototype.getElementsByAttribute = getElementsByAttribute;
    Element.prototype.getNodesByType         = getNodesByType;
    Element.prototype.getElementsByText      = getElementsByText;
    Element.prototype.highlight              = highlight;
    Element.prototype.lowName                = lowName;
    Element.prototype.removeClass            = removeClass;
    Element.prototype.removeHighlight        = removeHighlight;
};

export default dom;