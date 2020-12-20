
/* lib/browser/dom - Extensions to the DOM to provide navigational functionality not present from the standard methods */

import browser from "./browser.js";

/* lib/browser/dom - Extensions to the DOM to provide navigational function not present from the standard methods */
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
                    if (start.nodeName.toLowerCase() === identifier) {
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
                start = <Element>start.parentNode;
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
                attrs:Attr[]    = <Attr[]>start.getNodesByType(2),
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
                texts:Text[]    = <Text[]>start.getNodesByType(3),
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
        getNodesByType = function browser_dom_getNodesByType(typeValue:string|number):Node[] {
            const valueString:string = (typeof typeValue === "string") ? typeValue.toLowerCase() : "",
                // eslint-disable-next-line
                root:Element = (this === document) ? document.documentElement : this,
                numb:number = (isNaN(Number(typeValue)) === false)
                    ? Number(typeValue)
                    : 0;
            let types:number = (numb > 12 || numb < 0)
                ? 0
                : Math.round(numb);

            // If input is a string and supported standard value
            // associate to the standard numeric type
            if (valueString === "all" || typeValue === "") {
                types = 0;
            } else if (valueString === "element_node") {
                types = 1;
            } else if (valueString === "attribute_node") {
                types = 2;
            } else if (valueString === "text_node") {
                types = 3;
            } else if (valueString === "cdata_section_node") {
                types = 4;
            } else if (valueString === "entity_reference_node") {
                types = 5;
            } else if (valueString === "entity_node") {
                types = 6;
            } else if (valueString === "processing_instruction_node") {
                types = 7;
            } else if (valueString === "comment_node") {
                types = 8;
            } else if (valueString === "document_node") {
                types = 9;
            } else if (valueString === "document_type_node") {
                types = 10;
            } else if (valueString === "document_fragment_node") {
                types = 11;
            } else if (valueString === "notation_node") {
                types = 12;
            }

            // A handy dandy function to trap all the DOM walking
            return (function browser_dom_getNodesByType_walking():Node[] {
                const output:Node[] = [],
                    child  = function browser_dom_getNodesByType_walking_child(x:Element):void {
                        const children:NodeListOf<ChildNode> = x.childNodes;
                        let a:NamedNodeMap    = x.attributes,
                            b:number    = a.length,
                            c:number    = 0;
                        // Special functionality for attribute types.
                        if (b > 0 && (types === 2 || types === 0)) {
                            do {
                                output.push(a[c]);
                                c = c + 1;
                            } while (c < b);
                        }
                        b = children.length;
                        c = 0;
                        if (b > 0) {
                            do {
                                if (children[c].nodeType === types || types === 0) {
                                    output.push(<Element>children[c]);
                                }
                                if (children[c].nodeType === 1) {
                                    //recursion magic
                                    browser_dom_getNodesByType_walking_child(<Element>children[c]);
                                }
                                c = c + 1;
                            } while (c < b);
                        }
                    };
                child(root);
                return output;
            }());
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
}

export default dom;