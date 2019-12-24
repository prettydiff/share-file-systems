
import browser from "./browser.js";
import modal from "./modal.js";
import network from "./network.js";

const settings:module_settings = {};

settings.colorScheme = function local_settings_colorScheme(event:MouseEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target;
    if (element.value === "default") {
        browser.pageBody.removeAttribute("class");
    } else {
        browser.pageBody.setAttribute("class", element.value);
    }
    browser.data.color = <colorScheme>element.value;
    network.storage("settings");
};

/* Settings compression level */
settings.compression = function local_settings_compression(event:KeyboardEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target;
    if (element.value.replace(/\s+/, "") !== "" && (event.type === "blur" || (event.type === "keyup" && event.keyCode === 13))) {
        const numb:number = Number(element.value);
        if (isNaN(numb) === true || numb < 0 || numb > 11) {
            element.value = browser.data.brotli.toString();
        }
        element.value = Math.floor(numb).toString();
        browser.data.brotli = <brotli>Math.floor(numb);
        network.storage("settings");
    }
};

/* Shows and hides additional textual information about compression */
settings.compressionToggle = function local_settings_compressionToggle(event:MouseEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        parent:HTMLElement = <HTMLElement>element.parentNode,
        info:HTMLElement = <HTMLElement>parent.getElementsByClassName("compression-details")[0];
    if (info.style.display === "none") {
        info.style.display = "block";
        element.innerHTML = "Less information ⇡";
    } else {
        info.style.display = "none";
        element.innerHTML = "More information ⇣";
    }
};

/* Shows the settings modal */
settings.modal = function local_settings_modal(event:MouseEvent):void {
    const settings:HTMLElement = document.getElementById("settings-modal"),
        data:ui_modal = browser.data.modals["settings-modal"];
    modal.zTop(event, settings);
    if (data.status === "hidden") {
        settings.style.display = "block";
    }
    data.status = "normal";
};

/* specify custom user color settings */
settings.userColor = function local_settings_modal(event:KeyboardEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        colorTest:RegExp = (/^#(([0-9a-fA-F]{3})|([0-9a-fA-F]{6}))$/),
        parent:HTMLElement = <HTMLElement>element.parentNode;
    element.value = element.value.replace(/\s+/g, "");
    if (colorTest.test(element.value) === true) {
        if (event.type === "blur" || (event.type === "keyup" && event.keyCode === 13)) {
            const item:HTMLElement = <HTMLElement>parent.parentNode,
                user:string = item.getElementsByTagName("p")[0].innerHTML,
                prefix:string = `#spaces .box[data-agent="${user}"] `;
            if (parent.innerHTML.indexOf("Foreground") > 0) {
                browser.style.innerHTML = browser.style.innerHTML.replace(`${prefix}.body,#spaces #users button[data-agent="${user}"]:hover{background-color:${browser.users[user].color[0]}}`, `${prefix}.body,#spaces #users button[data-agent="${user}"]:hover{background-color:${element.value}}`);
                browser.users[user].color[0] = element.value;
            } else {
                browser.style.innerHTML = browser.style.innerHTML.replace(`${prefix} h2.heading{background-color:${browser.users[user].color[1]}}`, `${prefix} h2.heading{background-color:${element.value}}`);
                browser.users[user].color[1] = element.value;
            }
            network.storage("users");
        } else if (event.type === "keyup") {
            const span:HTMLElement = parent.getElementsByTagName("span")[0];
            span.style.background = element.value;
        }
    }
};

export default settings;