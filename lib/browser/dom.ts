
/* lib/browser/dom - Extensions to the DOM to provide navigational function not present from the standard methods */
const dom = function local_dom():void {
    const getAncestor = function local_dom_getAncestor(identifier:string, selector:selector):Element {
            // eslint-disable-next-line
            let start:Element = (this === document) ? document.documentElement : this;
            const test = function local_dom_getAncestor_test():boolean {
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
        getElementsByAttribute = function local_dom_getElementsByAttribute(name:string, value:string):Element[] {
            // eslint-disable-next-line
            const attrs:Attr[] = this.typeFunction(2),
                out:Element[]   = [];
            if (typeof name !== "string") {
                name = "";
            }
            if (typeof value !== "string") {
                value = "";
            }
            attrs.forEach(function local_dom_getElementsByAttribute_loop(item) {
                if (item.name === name || name === "") {
                    if (item.value === value || value === "") {
                        out.push(item.ownerElement);
                    }
                }
            });
            return out;
        },
        getNodesByType = function local_dom_getNodesByType(typeValue:string|number):Node[] {
            let types:number     = 0;
            const valueTest:string = (typeof typeValue === "string") ? typeValue.toUpperCase() : "",
                // eslint-disable-next-line
                root:Element = (this === document) ? document.documentElement : this;

            // Normalize string input for case insensitivity.
            if (typeof typeValue === "string") {
                typeValue = typeValue.toLowerCase();
            }

            // If input is a string and supported standard value
            // associate to the standard numeric type
            if (typeValue === "all") {
                types = 0;
            } else if (typeValue === "element_node") {
                types = 1;
            } else if (typeValue === "attribute_node") {
                types = 2;
            } else if (typeValue === "text_node") {
                types = 3;
            } else if (typeValue === "cdata_section_node") {
                types = 4;
            } else if (typeValue === "entity_reference_node") {
                types = 5;
            } else if (typeValue === "entity_node") {
                types = 6;
            } else if (typeValue === "processing_instruction_node") {
                types = 7;
            } else if (typeValue === "comment_node") {
                types = 8;
            } else if (typeValue === "document_node") {
                types = 9;
            } else if (typeValue === "document_type_node") {
                types = 10;
            } else if (typeValue === "document_fragment_node") {
                types = 11;
            } else if (typeValue === "notation_node") {
                types = 12;
            }

            // If input is type string but the value is a supported number
            if (isNaN(Number(valueTest)) === false && (valueTest.length === 1 || valueTest === "10" || valueTest === "11" || valueTest === "12")) {
                types = Number(valueTest);
            }

            // If input is a supported number
            if (valueTest === "" && (typeValue === 0 || typeValue === 1 || typeValue === 2 || typeValue === 3 || typeValue === 4 || typeValue === 5 || typeValue === 6 || typeValue === 7 || typeValue === 8 || typeValue === 9 || typeValue === 10 || typeValue === 11 || typeValue === 12)) {
                types = typeValue;
            }

            // A handy dandy function to trap all the DOM walking
            return (function local_dom_getNodesByType_walking():Node[] {
                const output:Node[] = [],
                    child  = function local_dom_getNodesByType_walking_child(x:Element):void {
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
                                    local_dom_getNodesByType_walking_child(<Element>children[c]);
                                }
                                c = c + 1;
                            } while (c < b);
                        }
                    };
                child(root);
                return output;
            }());
        };

    // Create a document method
    document.getElementsByAttribute = getElementsByAttribute;
    document.getNodesByType         = getNodesByType;

    // Ensure dynamically created elements get this method too
    Element.prototype.getAncestor            = getAncestor;
    Element.prototype.getElementsByAttribute = getElementsByAttribute;
    Element.prototype.getNodesByType         = getNodesByType;

    // Disabling addEventListener via reassignment because the preferred pattern is directly assigning handlers to the respective events
    Element.prototype.addEventListener       = function local_getNodesByType_addEventListener():Element {
        // eslint-disable-next-line
        console.log(`addEventListener used on ${this}\naddEventListener is not supported in this application.`);
        return undefined;
    }; 

}

export default dom;