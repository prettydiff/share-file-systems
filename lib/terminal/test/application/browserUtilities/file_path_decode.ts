/* lib/terminal/test/application/browserUtilities/file_path_decode - Transforms a custom encoded file path into a local operation system specific file path. */

import vars from "../../../utilities/vars.js";

const filePathDecode = function terminal_test_application_browserUtilities_filePathDecode(testItem:testBrowserItem, testString:string):testBrowserItem|string {
    const path = function terminal_test_application_browserUtilities_filePathDecode_path(input:string):string {
        let index:number = input.indexOf("<PATH>")
        const alter = function terminal_test_application_browserUtilities_filePathDecode_path_adjust():void {
                let sep:string = (vars.sep === "/")
                        ? "/"
                        : ((input.charAt(0) === "{" && input.charAt(input.length - 1) === "}") || (input.charAt(0) === "[" && input.charAt(input.length - 1) === "]"))
                            ? "\\\\"
                        : "\\",
                    endLength:number = 7;
                const endNormal:number = input.indexOf("</PATH>"),
                    endForced:number = input.indexOf("</PATH-forced>"),
                    endIndex:number = (function terminal_test_application_browserUtilities_filePathDecode_path_adjust_endIndex():number {
                        if (endForced < 0) {
                            return endNormal;
                        }
                        if (endNormal < 0) {
                            if (vars.sep === "\\") {
                                sep = "\\\\";
                            }
                            endLength = 14;
                            return endForced;
                        }
                        if (endForced < endNormal) {
                            if (vars.sep === "\\") {
                                sep = "\\\\";
                            }
                            endLength = 14;
                            return endForced;
                        }
                        return endNormal;
                    }()),
                    start:string = (index > 0)
                        ? input.slice(0, index)
                        : "",
                    middle:string = input.slice(index + 6, endIndex),
                    middleParsed:string = (middle === "**projectPath**")
                        ? middle.replace(/\*\*projectPath\*\*/g, vars.projectPath.slice(0, vars.projectPath.length - 1)).replace(/\/|\\/g, sep)
                        : middle.replace(/\*\*projectPath\*\*/g, vars.projectPath).replace(/\/|\\/g, sep),
                    end:string = input.slice(endIndex + endLength);
                input = start + middleParsed + end;
            };
        if (index < 0) {
            return input;
        }
        do {
            alter();
            index = input.indexOf("<PATH>");
        } while(index > -1);
        return input;
    };

    if (testItem === null) {
        return path(testString);
    }

    let a:number = testItem.interaction.length,
        b:number = 0;
    do {
        a = a - 1;
        if (typeof testItem.interaction[a].value === "string") {
            testItem.interaction[a].value = path(testItem.interaction[a].value);
        }
        if (testItem.interaction[a].node !== null && testItem.interaction[a].node.length > 0) {
            b = testItem.interaction[a].node.length;
            do {
                b = b - 1;
                if (typeof testItem.interaction[a].node[b][1] === "string") {
                    testItem.interaction[a].node[b][1] = path(testItem.interaction[a].node[b][1]);
                }
            } while (b > 0);
        }
    } while (a > 0);
    a = testItem.unit.length;
    if (a > 0) {
        do {
            a = a - 1;
            if (typeof testItem.unit[a].value === "string") {
                testItem.unit[a].value = path(<string>testItem.unit[a].value);
            }
            b = testItem.unit[a].node.length;
            do {
                b = b - 1;
                if (typeof testItem.unit[a].node[b][1] === "string") {
                    testItem.unit[a].node[b][1] = path(testItem.unit[a].node[b][1]);
                }
            } while (b > 0);
        } while (a > 0);
    }
    if (testItem.delay !== undefined && typeof testItem.delay.value === "string") {
        testItem.delay.value = path(testItem.delay.value);
        b = testItem.delay.node.length;
        do {
            b = b - 1;
            if (typeof testItem.delay.node[b][1] === "string") {
                testItem.delay.node[b][1] = path(testItem.delay.node[b][1]);
            }
        } while (b > 0);
    }
    return testItem;
};

export default filePathDecode;