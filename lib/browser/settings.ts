
/* lib/browser/settings - A collection of utilities and event handlers associated with processing the users application state and system settings. */
import browser from "./browser.js";
import modal from "./modal.js";
import network from "./network.js";

const settings:module_settings = {};

/* Add user color options to the settings menu */
settings.addUserColor = function local_settings_addUserColor(user:string, settingsBody:HTMLElement) {
    const users:string[] = Object.keys(browser.users),
        length:number = users.length,
        newSection:boolean = (length === 2 && browser.loadTest === false),
        ul:HTMLElement = (newSection === true)
            ? document.createElement("ul")
            : <HTMLElement>settingsBody.getElementsByClassName("user-color-list")[0];
    if (length > 0) {
        const li:HTMLElement = document.createElement("li"),
            p:HTMLElement = document.createElement("p"),
            section:HTMLElement = document.createElement("div");
        let span:HTMLElement,
            label:HTMLElement,
            input:HTMLInputElement,
            text:Text;
        if (newSection === true) {
            const h3:HTMLElement = document.createElement("h3");
            ul.setAttribute("class", "user-color-list");
            section .setAttribute("class", "section");
            h3.innerHTML = "◩ User Color Definitions";
            section.appendChild(h3);
        }
        p.innerHTML = user;
        li.appendChild(p);
        label = document.createElement("label");
        input = document.createElement("input");
        span = document.createElement("span");
        span.setAttribute("class", "swatch");
        span.style.background = browser.users[user].color[0];
        label.appendChild(span);
        input.type = "text";
        input.value = browser.users[user].color[0].replace("#", "");
        input.onblur = settings.userColor;
        input.onkeyup = settings.userColor;
        label.appendChild(input);
        text = document.createTextNode("Body Color");
        label.appendChild(text);
        li.appendChild(label);
        label = document.createElement("label");
        input = document.createElement("input");
        span = document.createElement("span");
        span.setAttribute("class", "swatch");
        span.style.background = browser.users[user].color[1];
        label.appendChild(span);
        input.type = "text";
        input.value = browser.users[user].color[1].replace("#", "");
        input.onblur = settings.userColor;
        input.onkeyup = settings.userColor;
        label.appendChild(input);
        text = document.createTextNode("Heading Color");
        label.appendChild(text);
        li.appendChild(label);
        ul.appendChild(li);
        if (newSection === true) {
            section.append(ul);
            settingsBody.appendChild(section);
        }
    }
};

/* Update the user color information in the style tag */
settings.applyUserColors = function local_settings_applyUserColors(user:string, colors:[string, string]):void {
    const prefix:string = `#spaces .box[data-agent="${user}"] `;
    let scheme:string = browser.pageBody.getAttribute("class");
    if (scheme === null) {
        scheme = "default";
    }
    if (colors[0] === settings.colorDefaults[scheme][0] && colors[1] === settings.colorDefaults[scheme][1]) {
        // colors are defaults for the current scheme
        browser.style.innerHTML = browser.style.innerHTML.replace(`${prefix}.body,#spaces #users button[data-agent="${user}"]:hover{background-color:${browser.users[user].color[0]}}`, "");
        browser.style.innerHTML = browser.style.innerHTML.replace(`${prefix} h2.heading{background-color:${browser.users[user].color[1]}}`, "");
    } else if (browser.style.innerHTML.indexOf(prefix) > -1) {
        // replace changed colors in the style tag if present
        browser.style.innerHTML = browser.style.innerHTML.replace(`${prefix}.body,#spaces #users button[data-agent="${user}"]:hover{background-color:${browser.users[user].color[0]}}`, `${prefix}.body,#spaces #users button[data-agent="${user}"]:hover{background-color:${colors[0]}}`);
        browser.style.innerHTML = browser.style.innerHTML.replace(`${prefix} h2.heading{background-color:${browser.users[user].color[1]}}`, `${prefix} h2.heading{background-color:${colors[1]}}`);
    } else {
        // add new styles if not present
        browser.style.innerHTML = `${browser.style.innerHTML + prefix}.body,#spaces #users button[data-agent="${user}"]:hover{background-color:${colors[0]}}${prefix} h2.heading{background-color:${colors[1]}}`;
    }
    browser.users[user].color[0] = colors[0];
    browser.users[user].color[1] = colors[1];
};

/* Enable or disable audio from the settings menu */
settings.audio = function local_settings_compression(event:MouseEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target;
    if (element.value === "on") {
        browser.data.audio = true;
    } else {
        browser.data.audio = false;
    }
    if (browser.loadTest === false) {
        network.storage("settings");
    }
};

settings.colorDefaults = {
    "dark": ["#222", "#333"],
    "default": ["#fff", "#eee"]
};

/* Change the color scheme */
settings.colorScheme = function local_settings_colorScheme(event:MouseEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        oldScheme:string = browser.data.color,
        users:string[] = Object.keys(browser.users),
        userLength:number = users.length;
    let a:number = 0,
        b:number = 0,
        swatches:HTMLCollectionOf<Element>,
        swatch1:HTMLElement,
        swatch2:HTMLElement,
        inputs:HTMLCollectionOf<HTMLInputElement>;
    if (element.value === "default") {
        browser.pageBody.removeAttribute("class");
    } else {
        browser.pageBody.setAttribute("class", element.value);
    }
    if (userLength > 0) {
        const userList:HTMLElement = <HTMLElement>document.getElementById("settings-modal").getElementsByClassName("user-color-list")[0],
            settingsList:HTMLCollectionOf<HTMLElement> = (userList === undefined)
                ? null
                : userList.getElementsByTagName("li"),
            listLength:number = (settingsList === null)
                ? 0
                : settingsList.length;
        do {
            if (browser.users[users[a]].color[0] === settings.colorDefaults[oldScheme][0] && browser.users[users[a]].color[1] === settings.colorDefaults[oldScheme][1]) {
                browser.users[users[a]].color[0] = settings.colorDefaults[element.value][0];
                browser.users[users[a]].color[1] = settings.colorDefaults[element.value][1];
                if (users[a] !== "localhost") {
                    settings.applyUserColors(users[a], [browser.users[users[a]].color[0], browser.users[users[a]].color[1]]);
                }
                b = 0;
                do {
                    if (settingsList[b].getElementsByTagName("p")[0].innerHTML === users[a]) {
                        swatches = settingsList[b].getElementsByClassName("swatch");
                        swatch1 = <HTMLElement>swatches[0];
                        swatch2 = <HTMLElement>swatches[1];
                        inputs = settingsList[b].getElementsByTagName("input");
                        swatch1.style.background = browser.users[users[a]].color[0];
                        swatch2.style.background = browser.users[users[a]].color[1];
                        inputs[0].value = browser.users[users[a]].color[0].replace("#", "");
                        inputs[1].value = browser.users[users[a]].color[1].replace("#", "");
                    }
                    b = b + 1;
                } while (b < listLength);
            } else if (users[a] !== "localhost" && browser.users[users[a]].color[0] === settings.colorDefaults[element.value][0] && browser.users[users[a]].color[1] === settings.colorDefaults[element.value][1]) {
                settings.applyUserColors(users[a], [browser.users[users[a]].color[0], browser.users[users[a]].color[1]]);
            }
            a = a + 1;
        } while (a < userLength);
    }
    browser.data.color = <colorScheme>element.value;
    if (browser.loadTest === false) {
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

/* The content of the settings modal */
settings.modalContent = function local_settings_modalContent():HTMLElement {
    const settingsBody:HTMLElement = document.createElement("div"),
        random:string = Math.random().toString(),
        createSection = function local_settings_modalContent(title:string):HTMLElement {
            const container:HTMLElement = document.createElement("div"),
                h3:HTMLElement = document.createElement("h3");
            container.setAttribute("class", "section");
            h3.innerHTML = title;
            container.appendChild(h3);
            return container;
        };
    let section:HTMLElement,
        p:HTMLElement = document.createElement("p"),
        select:HTMLElement,
        option:HTMLOptionElement,
        label:HTMLElement = document.createElement("label"),
        input:HTMLInputElement = document.createElement("input"),
        button:HTMLElement = document.createElement("button"),
        text:Text = document.createTextNode("Compression level. Accepted values are 0 - 11"),
        users:string[] = Object.keys(browser.users),
        length:number = users.length;
    settingsBody.setAttribute("class", "settings");

    // brotli compression
    section = createSection("🗜 Brotli Compression Level");
    input.type = "text";
    input.value = browser.data.brotli.toString();
    input.name = "brotli";
    input.onkeyup = settings.text;
    input.onblur = settings.text;
    label.appendChild(input);
    label.appendChild(text);
    p.appendChild(label);
    section.appendChild(p);
    button.onclick = settings.compressionToggle;
    button.innerHTML = "More information ⇣";
    section.appendChild(button);
    p = document.createElement("p");
    p.innerHTML = "In this application compression is applied to file system artifacts traveling from one device to another across a network. There is substantial CPU overhead in decompressing files. The ideal case for applying compression is extremely large files that take longer to transfer than the decompress. It is advised to disable compression if on a very fast local network or transferring many small files. Compression can be disabled by setting the value to 0.";
    p.setAttribute("class", "compression-details");
    p.style.display = "none";
    section.appendChild(p);
    settingsBody.appendChild(section);

    // hash algorithm
    section = createSection("⋕ Hash Algorithm");
    input = document.createElement("input");
    label = document.createElement("label");
    text = document.createTextNode("Hash Algorithm");
    select = document.createElement("select");
    p = document.createElement("p");
    {
        const hashes:hash[] = ["blake2d512", "blake2s256", "sha3-224", "sha3-256", "sha3-384", "sha3-512", "sha512-224", "sha512-256", "shake128", "shake256"],
            length:number = hashes.length;
        let a:number = 0;
        do {
            option = document.createElement("option");
            option.innerHTML = hashes[a];
            if (browser.data.hash === hashes[a]) {
                option.selected = true;
            }
            select.appendChild(option);
            a = a + 1;
        } while (a < length);
    }
    select.onchange = settings.text;
    label.appendChild(select);
    label.appendChild(text);
    p.appendChild(label);
    section.appendChild(p);
    settingsBody.appendChild(section);

    // audio
    section  = createSection("🔊 Allow Audio");
    p = document.createElement("p");
    label = document.createElement("label");
    input = document.createElement("input");
    label.setAttribute("class", "radio");
    input.type = "radio";
    input.name = `audio-${random}`;
    input.value = "on";
    input.checked = true;
    input.onclick = settings.audio;
    text = document.createTextNode("On");
    label.appendChild(text);
    label.appendChild(input);
    p.appendChild(label);
    label = document.createElement("label");
    input = document.createElement("input");
    label.setAttribute("class", "radio");
    input.type = "radio";
    input.name = `audio-${random}`;
    input.value = "off";
    input.onclick = settings.audio;
    text = document.createTextNode("Off");
    label.appendChild(text);
    label.appendChild(input);
    p.appendChild(label);
    section.appendChild(p);
    settingsBody.appendChild(section);

    // color scheme
    section = createSection("▣ Color Theme");
    p = document.createElement("p");
    label = document.createElement("label");
    input = document.createElement("input");
    label.setAttribute("class", "radio");
    input.type = "radio";
    input.checked = true;
    input.name = `color-scheme-${random}`;
    input.value = "default";
    input.onclick = settings.colorScheme;
    label.innerHTML = "Default";
    label.appendChild(input);
    p.appendChild(label);
    label = document.createElement("label");
    input = document.createElement("input");
    label.setAttribute("class", "radio");
    input.type = "radio";
    input.name = `color-scheme-${random}`;
    input.value = "dark";
    input.onclick = settings.colorScheme;
    label.innerHTML ="Dark";
    label.appendChild(input);
    p.appendChild(label);
    section.appendChild(p);
    settingsBody.appendChild(section);

    // user colors
    if (length > 0) {
        const ul:HTMLElement = document.createElement("ul");
        let a:number = 0;
        ul.setAttribute("class", "user-color-list");
        section = createSection("◩ User Color Definitions");
        p = document.createElement("p");
        p.innerHTML = "Accepted format is 3 or 6 digit hexadecimal (0-f)";
        p.setAttribute("class", "user-color-list-p");
        section.appendChild(p);
        section.append(ul);
        settingsBody.appendChild(section);
        do {
            if (users[a] !== "localhost") {
                settings.addUserColor(users[a], settingsBody);
            }
            a = a + 1;
        } while (a < length);
    }
    return settingsBody;
};

/* Settings compression level */
settings.text = function local_settings_text(event:KeyboardEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target;
    if (element.value.replace(/\s+/, "") !== "" && (event.type === "blur" || (event.type === "change" && element.nodeName.toLowerCase() === "select") || (event.type === "keyup" && event.keyCode === 13))) {
        const numb:number = Number(element.value),
            parent:HTMLElement = <HTMLElement>element.parentNode,
            parentText:string = parent.innerHTML.toLowerCase();
        if (parentText.indexOf("brotli") > 0) {
            if (isNaN(numb) === true || numb < 0 || numb > 11) {
                element.value = browser.data.brotli.toString();
            }
            element.value = Math.floor(numb).toString();
            browser.data.brotli = <brotli>Math.floor(numb);
        } else if (parentText.indexOf("hash") > 0) {
            browser.data.hash = <hash>element.value;
        }
        network.storage("settings");
    }
};

/* specify custom user color settings */
settings.userColor = function local_settings_modal(event:KeyboardEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        colorTest:RegExp = (/^#(([0-9a-fA-F]{3})|([0-9a-fA-F]{6}))$/),
        color:string = `#${element.value.replace(/\s+/g, "").replace(/^#/, "")}`,
        parent:HTMLElement = <HTMLElement>element.parentNode;
    if (colorTest.test(color) === true) {
        if (event.type === "blur" || (event.type === "keyup" && event.keyCode === 13)) {
            const item:HTMLElement = <HTMLElement>parent.parentNode,
                user:string = item.getElementsByTagName("p")[0].innerHTML;
            if (parent.innerHTML.indexOf("Body") > 0) {
                settings.applyUserColors(user, [color, browser.users[user].color[1]]);
            } else {
                settings.applyUserColors(user, [browser.users[user].color[0], color]);
            }
            network.storage("users");
        } else if (event.type === "keyup") {
            const span:HTMLElement = parent.getElementsByTagName("span")[0];
            span.style.background = color;
        }
    }
};

export default settings;