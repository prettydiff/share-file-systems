
/* lib/browser/utilities/file_select_none - Ensures all items in a file list display and function in an unselected state. */

const file_select_none = function browser_utilities_fileSelectNone(element:HTMLElement):void {
    const box:modal = element.getAncestor("box", "class"),
        fileList:HTMLElement = box.getElementsByClassName("fileList")[0] as HTMLElement,
        child:HTMLElement = (fileList === undefined)
            ? null
            : fileList.firstChild as HTMLElement,
        inputs:HTMLCollectionOf<HTMLInputElement> = (fileList === undefined)
            ? null
            : fileList.getElementsByTagName("input"),
        inputLength:number = (fileList === undefined)
            ? 0
            : inputs.length,
        p:HTMLCollectionOf<Element> = (fileList === undefined)
            ? null
            : fileList.getElementsByTagName("p");
    let a:number = 0;
    if (fileList === undefined || document.getElementById("newFileItem") !== null || child.getAttribute("class") === "empty-list") {
        return;
    }
    if (inputLength > 0) {
        do {
            if (inputs[a].type === "checkbox") {
                inputs[a].checked = false;
                p[a].removeAttribute("class");
            }
            a = a + 1;
        } while (a < inputLength);
    }
};

export default file_select_none;