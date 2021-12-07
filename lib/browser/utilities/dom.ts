
/* lib/browser/utilities/dom - Extensions to the DOM to provide navigational functionality not present from the standard methods */

import browser from "../browser.js";
import util from "./util.js";

const dom = function browser_dom():void {
    // getAncestor - A method to walk up the DOM towards the documentElement.
    // * identifier: string - The string value to search for.
    // * selector: "class", "id", "name" - The part of the element to compare the identifier against.
    const getAncestor = function browser_dom_getAncestor(identifier:string, selector:selector):Element {
            // eslint-disable-next-line
            let start:Element = (this === document) ? document.documentElement : this;
            const test = function browser_dom_getAncestor_test():boolean {
                    if (selector === "class") {
                        if (start.getAttribute("class") === identifier) {
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
                    if (util.name(start) === identifier) {
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
                start = start.parentNode as Element;
                if (start === null) {
                    return null;
                }
            } while (start !== document.documentElement && test() === false);
            return start;
        },
        // getElementByAttribute - Search all descendant elements containing a matching attribute with matching value and returns an array of corresponding elements.
        // * name: string - The name of the attribute to search for.  An empty string means accept every attribute name.
        // * value: string - The attribute value to search for.  An empty string means accept any attribute value.
        getElementsByAttribute = function browser_dom_getElementsByAttribute(name:string, value:string):Element[] {
            // eslint-disable-next-line
            const start:Element = (this === document) ? document.documentElement : this,
                attrs:Attr[]    = start.getNodesByType(2) as Attr[],
                out:Element[]   = [];
            if (typeof name !== "string") {
                name = "";
            }
            if (typeof value !== "string") {
                value = "";
            }
            attrs.forEach(function browser_dom_getElementsByAttribute_each(item:Attr):void {
                if (item.name === name || name === "") {
                    if (item.value === value || value === "") {
                        out.push(item.ownerElement);
                    }
                }
            });
            return out;
        },
        // getElementsByText - Returns an array of descendant elements containing the white space trimmed text.
        // * textValue: string - The text to match.  The value must exactly match the complete text node value after trimming white space.
        // * castSensitive: boolean - Whether case sensitivity should apply.
        getElementsByText = function browser_dom_getElementsByText(textValue:string, caseSensitive?:boolean):Element[] {
            // eslint-disable-next-line
            const start:Element = (this === document) ? document.documentElement : this,
                texts:Text[]    = start.getNodesByType(3) as Text[],
                out:Element[]   = [];
            if (typeof textValue !== "string") {
                textValue = "";
            } else {
                textValue = textValue.replace(/^\s+/, "").replace(/\s+$/, "");
            }
            if (typeof caseSensitive !== "boolean") {
                caseSensitive = false;
            }
            texts.forEach(function browser_dom_getElementsByText_each(item:Text):void {
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
        // getNodesByType - Returns an array of DOM nodes matching the provided node type.
        // * typeValue: string|number = The value must be a node type name or a node type number (0-12)
        // - An empty string, "all", or 0 means gather all descendant nodes regardless of type.
        // - For standard values see: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        getNodesByType = function browser_dom_getNodesByType(typeValue:number|string):Node[] {
            const valueString:string = (typeof typeValue === "string") ? `${typeValue.toLowerCase().replace("_node", "")}_node` : "",
                numb:number = (isNaN(Number(typeValue)) === false)
                    ? Math.round(Number(typeValue))
                    : null,
                output:Node[] = [],
                child = function browser_dom_getNodesByType_child(recurse:Element):void {
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
                                output.push(children[a] as Element);
                            }
                            if (children[a].nodeType === 1) {
                                //recursion magic
                                browser_dom_getNodesByType_child(children[a] as Element);
                            }
                            a = a + 1;
                        } while (a < len);
                    }
                },
                types:number = (function browser_dom_getNodesByType_types():number {
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

            // eslint-disable-next-line
            child((this === document) ? document.documentElement : this);
            return output;
        },
        // getModalsByType - Returns a list of modals matching a given modal type
        // * The optional type argument indicates what type of modals to return
        // * The default type value is "all" or undefined which returns all modals
        getModalsByModalType = function browser_dom_getModalsByModalType(type:modalType|"all"):Element[] {
            const keys:string[] = Object.keys(browser.data.modals),
                length:number = keys.length,
                output:Element[] = [];
            let a:number = 0;
            if (typeof type !== "string") {
                type = "all";
            }
            do {
                if (type === "all" || browser.data.modals[keys[a]].type === type) {
                    output.push(document.getElementById(keys[a]));
                }
                a = a + 1;
            } while (a < length);
            return output;
        };

    // Create a document method
    document.getElementsByAttribute          = getElementsByAttribute;
    document.getNodesByType                  = getNodesByType;
    document.getModalsByModalType            = getModalsByModalType;
    document.getElementsByText               = getElementsByText;

    // Ensure dynamically created elements get these methods too
    Element.prototype.getAncestor            = getAncestor;
    Element.prototype.getElementsByAttribute = getElementsByAttribute;
    Element.prototype.getNodesByType         = getNodesByType;
    Element.prototype.getElementsByText      = getElementsByText;
};

export default dom;