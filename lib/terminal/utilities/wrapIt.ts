
/* lib/terminal/utilities/wrapIt - A tool to perform word wrap when printing text to the shell. */
const wrapIt = function terminal_wrapIt(outputArray:string[], string:string):void {
    const wrap:number = 100;
    if (string.length > wrap) {
        const indent:string = (function terminal_wrapIt_indent():string {
                const len:number = string.length;
                let inc:number = 0,
                    num:number = 2,
                    str:string = "";
                if ((/^(\s*((\u002a|-)\s*)?\w+\s*:)/).test(string.replace(/\u001b\[\d+m/g, "")) === false) {
                    return "";
                }
                do {
                    if (string.charAt(inc) === ":") {
                        break;
                    }
                    if (string.charAt(inc) === "\u001b") {
                        if (string.charAt(inc + 4) === "m") {
                            inc = inc + 4;
                        } else {
                            inc = inc + 3;
                        }
                    } else {
                        num = num + 1;
                    }
                    inc = inc + 1;
                } while (inc < len);
                inc = 0;
                do {
                    str = str + " ";
                    inc = inc + 1;
                } while (inc < num);
                return str;
            }()),
            formLine = function terminal_wrapIt_formLine():void {
                let inc:number = 0,
                    wrapper:number = wrap;
                do {
                    if (string.charAt(inc) === "\u001b") {
                        if (string.charAt(inc + 3) === "m") {
                            wrapper = wrapper + 3;
                        } else if (string.charAt(inc + 4) === "m") {
                            wrapper = wrapper + 4;
                        }
                    }
                    inc = inc + 1;
                } while (inc < wrapper);
                inc = wrapper;
                if (string.charAt(wrapper) !== " " && string.length > wrapper) {
                    do {
                        wrapper = wrapper - 1;
                    } while (wrapper > 0 && string.charAt(wrapper) !== " ");
                    if (wrapper === 0 || wrapper === indent.length - 1) {
                        wrapper = inc;
                        do {
                            wrapper = wrapper + 1;
                        } while (wrapper < string.length && string.charAt(wrapper) !== " ");
                    }
                }
                outputArray.push(string.slice(0, wrapper).replace(/\s+$/, ""));
                string = string.slice(wrapper + 1).replace(/^\s+/, "");
                if (string.length + indent.length > wrap) {
                    string = indent + string;
                    terminal_wrapIt_formLine();
                } else if (string !== "") {
                    outputArray.push(indent + string);
                }
            };
        formLine();
    } else {
        outputArray.push(string);
    }
};

export default wrapIt;