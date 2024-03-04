
/* lib/browser/utilities/modal_footerResize - An event handler associated with resizing the footer areas of certain modals. */

const modal_footerResize = function browser_utilities_modalFooterResize(event:MouseEvent):void {
    const element:HTMLElement = event.target,
        box:modal = element.getAncestor("box", "class"),
        body:HTMLElement = box.getElementsByClassName("body")[0] as HTMLElement,
        bottom:HTMLElement = box.getElementsByClassName("side-b")[0] as HTMLElement,
        top:HTMLElement = box.getElementsByClassName("side-t")[0] as HTMLElement,
        width:number = (box.clientWidth - 19) / 10,
        title:HTMLElement = box.getElementsByTagName("h2")[0];
    body.style.width = `${width}em`;
    bottom.style.width = `${width}em`;
    top.style.width = `${width}em`;
    title.style.width = `${(box.clientWidth - 17) / 10}em`;
    element.style.width = "100%";
};

export default modal_footerResize;