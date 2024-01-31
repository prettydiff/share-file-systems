
/* lib/browser/content/configuration - A collection of utilities and event handlers associated with processing the application state and system configuration. */

// cspell: words colspan
import browser from "../utilities/browser.js";
import common from "../../common/common.js";
import network from "../utilities/network.js";
import util from "../utilities/util.js";

/**
 * Methods for generating the configuration modal and its interactions.
 * ```typescript
 * interface module_configuration {
 *     colorDefaults: browser_colorList; // An object associating color information to color scheme names.
 *     content      : () => HTMLElement; // Generates the configuration modal content to populate into the configuration modal.
 *     events: {
 *         agentColor       : (event:Event) => void;         // Specify custom agent color configurations.
 *         audio            : (event:MouseEvent) => void;    // Assign changes to the audio option to settings.
 *         backgroundWindow : (event:KeyboardEvent) => void; // Blur event from the Window Background Display text fields.
 *         colorScheme      : (event:MouseEvent) => void;    // Changes the color scheme of the page by user interaction.
 *         configurationText: (event:Event) => void;         // Processes settings changes from either text input or select lists.
 *         detailsToggle    : (event:MouseEvent) => void;    // Shows and hides text explaining compression.
 *         modal            : (event:MouseEvent) => void;    // Generates the configuration modal and fills it with content.
 *     };
 *     tools: {
 *         addUserColor    : (agent:string, type:agentType, configElement?:HTMLElement)) => void; // Add agent color options to the configuration modal content.
 *         applyAgentColors: (agent:string, type:agentType, colors:[string, string]) => void;     // Update the specified color information against the default colors of the current color scheme.
 *         radio           : (element:HTMLElement) => void;                                       // Sets a class on a grandparent element to apply style changes to the corresponding label.
 *         socketMap       : (socketData:socketData) => void;                                     // Receives a service message and produces a content update for the socket list modal.
 *         styleText       : (input:configuration_styleText) => void;                             // Generates the CSS code for an agent specific style change and populates it into an HTML style tag.
 *     };
 * }
 * ``` */
const configuration:module_configuration = {

    /* Default color definitions for the various supported color schemes */
    colorDefaults: {
        "blush": ["fff", "fee"],
        "dark": ["222", "333"],
        "default": ["fff", "eee"]
    },

    content: function browser_content_configuration_content():HTMLElement {
        const configurationBody:HTMLElement = document.createElement("div"),
            random:string = Math.random().toString(),
            keys:string[] = Object.keys(configuration.colorDefaults),
            createSection = function browser_content_configuration_content_createSection(title:string):HTMLElement {
                const container:HTMLElement = document.createElement("div"),
                    h3:HTMLElement = document.createElement("h3");
                container.setAttribute("class", "section");
                h3.appendText(title);
                container.appendChild(h3);
                return container;
            },
            perAgentType = function browser_content_configuration_content_perAgentType(agentType:agentType):void {
                const ul:HTMLElement = document.createElement("ul");
                section = createSection(`◩ ${common.capitalize(agentType)} Color Definitions`);
                p = document.createElement("p");
                p.appendText("Accepted format is 3 or 6 digit hexadecimal (0-f)");
                section.appendChild(p);
                ul.setAttribute("class", `${agentType}-color-list`);
                section.appendChild(ul);
                configurationBody.appendChild(section);
            },
            textSection = function browser_content_configuration_content_textSection(config:config_configuration_textSection):void {
                section = createSection(config.title);
                if (config.type === "radio") {
                    p = document.createElement("ul");
                    util.radioListItem({
                        defaultValue: config.value,
                        handler: configuration.events[config.name as "audio"|"colorScheme"],
                        list: config.options,
                        name: `${config.name}-${random}`,
                        parent: p
                    });
                } else if (config.type === "select") {
                    p = document.createElement("p");
                    label = document.createElement("label");
                    select = document.createElement("select");
                    {
                        const length:number = config.options.length;
                        let a:number = 0;
                        do {
                            option = document.createElement("option");
                            option.appendText(config.options[a]);
                            option.value = config.options[a].toLowerCase().replace(/\s+/g, "-");
                            if (config.value === config.options[a].toLowerCase().replace(/\s+/g, "-")) {
                                option.selected = true;
                            }
                            select.appendChild(option);
                            a = a + 1;
                        } while (a < length);
                    }
                    select.onchange = configuration.events.configurationText;
                    label.appendChild(select);
                    label.appendText(config.textLabel);
                    p.appendChild(label);
                } else if (config.type === "text") {
                    p = document.createElement("p");
                    label = document.createElement("label");
                    input = document.createElement("input");
                    input.type = "text";
                    input.value = config.value;
                    input.name = config.name;
                    input.onkeyup = configuration.events.configurationText;
                    input.onblur = configuration.events.configurationText;
                    label.appendChild(input);
                    label.appendText(config.textLabel);
                    p.appendChild(label);
                }
                section.appendChild(p);
                if (config.button === true) {
                    p = document.createElement("p");
                    button = document.createElement("button");
                    button.onclick = configuration.events.detailsToggle;
                    button.appendText("More information ⇣");
                    button.setAttribute("type", "button");
                    section.appendChild(button);
                    p.appendText(config.textPara);
                    p.setAttribute("class", "configuration-details");
                    p.style.display = "none";
                    section.appendChild(p);
                }
                configurationBody.appendChild(section);
            },
            defaultBackground:colorBackgrounds = {
                "blush":   ["rgba(255,255,255,0.5)", "rgba(224,200,200,0.75)", "blur(2em)"],
                "dark":    ["rgba(32,32,32,0.75)",   "rgba(16,16,16,0.75)",    "blur(2em)"],
                "default": ["rgba(255,255,255,0.5)", "rgba(216,216,216,0.75)", "blur(2em)"]
            };
        let section:HTMLElement,
            p:HTMLElement,
            select:HTMLElement,
            option:HTMLOptionElement,
            label:HTMLElement,
            input:HTMLInputElement,
            button:HTMLElement;
        configurationBody.setAttribute("class", "configuration");

        // audio
        textSection({
            button: false,
            name: "audio",
            options: ["On", "Off"],
            textLabel: null,
            textPara: null,
            title: "🔊 Allow Audio",
            type: "radio",
            value: (browser.ui.audio === true)
                ? "On"
                : "Off"
        });

        // color scheme
        textSection({
            button: false,
            name: "colorScheme",
            options: (function browser_content_configuration_content_colorNames():string[] {
                const keysProper:string[] = [];
                keys.forEach(function browser_content_configuration_content_colorNames_each(value:string):void {
                    keysProper.push(common.capitalize(value));
                });
                return keysProper.sort();
            }()),
            textLabel: null,
            textPara: null,
            title: "🖌 Color Theme",
            type: "radio",
            value: (configuration.colorDefaults[browser.ui.color] === undefined)
                ? "default"
                : browser.ui.color
        });

        // file sort
        textSection({
            button: false,
            name: null,
            options: ["Alphabetically Ascending", "Alphabetically Descending", "File Extension", "File Modified Ascending", "File Modified Descending", "File System Type", "Size Ascending", "Size Descending"],
            textLabel: "File Sort Options",
            textPara: null,
            title: "ᐳ File Sort",
            type: "select",
            value: browser.ui.fileSort
        });

        // brotli compression
        textSection({
            button: true,
            name: "brotli",
            options: null,
            textLabel: "Compression level. Accepted values are 0 - 11",
            textPara: "In this application compression is applied to file system artifacts traveling from one device to another across a network. There is substantial CPU overhead in decompressing files. The ideal case for applying compression is extremely large files that take longer to transfer than the decompress. It is advised to disable compression if on a very fast local network or transferring many small files. Compression can be disabled by setting the value to 0.",
            title: "🗜 Brotli Compression Level",
            type: "text",
            value: browser.ui.brotli.toString()
        });

        // storage location
        textSection({
            button: true,
            name: "storage",
            options: null,
            textLabel: "File storage location",
            textPara: "When attempting to execute a file stored on a remote device/user that file must first be copied to the local device.  This setting determines the location where such filed will be written.",
            title: "⍒ Remote Execution Storage Location",
            type: "text",
            value: browser.ui.storage
        });

        // hash algorithm
        textSection({
            button: false,
            name: null,
            options: ["blake2d512", "blake2s256", "sha3-224", "sha3-256", "sha3-384", "sha3-512", "sha512-224", "sha512-256", "shake128", "shake256"],
            textLabel: "Hash Algorithm",
            textPara: null,
            title: "⌗ Hash Algorithm",
            type: "select",
            value: browser.ui.hashType
        });

        // per agent colors
        perAgentType("device");
        perAgentType("user");

        // window backgrounds
        section = createSection("☐ Window Background Display");
        p = document.createElement("p");
        p.appendText("Press 'enter' key on focused input field to execute changes.");
        section.appendChild(p);
        keys.forEach(function browser_content_configuration_content_sectionBackgroundDisplay(key:string):void {
            const fields = function browser_content_configuration_content_sectionBackgroundDisplay_fields(index:number, title:string):void {
                    const em:HTMLElement = document.createElement("em");
                    em.appendText(defaultBackground[key][index]);
                    label = document.createElement("label");
                    input = document.createElement("input");
                    input.setAttribute("type", "text");
                    input.setAttribute("name", `${key}-${index}`);
                    input.value = browser.ui.colorBackgrounds[key][index];
                    input.onkeyup = configuration.events.backgroundWindow;
                    label.appendChild(input);
                    label.appendText(title);
                    label.appendChild(em);
                    p.appendChild(label);
                },

                strong:HTMLElement = document.createElement("strong");
            p = document.createElement("p");
            p.setAttribute("class", "configuration-background");
            strong.appendText(`Color Scheme ${key}`);
            p.appendChild(strong);
            fields(0, "Window Background - CSS background property on windows - ");
            fields(1, "Textarea Background - CSS background property on input and textarea elements - ");
            fields(2, "Window Blur - CSS backdrop-filter on windows - ");
            section.appendChild(p);
        });
        configurationBody.appendChild(section);

        return configurationBody;
    },

    events: {

        /* specify custom agent color configuration */
        agentColor: function browser_content_configuration_agentColor(event:Event):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                keyboard:KeyboardEvent = event as KeyboardEvent,
                colorTest:RegExp = (/^(([0-9a-fA-F]{3})|([0-9a-fA-F]{6}))$/),
                color:string = `${element.value.replace(/\s+/g, "").replace("#", "")}`,
                parent:HTMLElement = element.parentNode;
            if (colorTest.test(color) === true) {
                if (event.type === "blur" || (event.type === "keyup" && keyboard.key === "Enter")) {
                    const item:HTMLElement = parent.parentNode,
                        ancestor:HTMLElement = element.getAncestor("ul", "tag"),
                        type:agentType = ancestor.getAttribute("class").split("-")[0] as agentType,
                        agent:string = item.dataset.agent,
                        swatch:HTMLElement = parent.getElementsByClassName("swatch")[0] as HTMLElement;
                    element.value = color;
                    if (parent.innerHTML.indexOf("Body") > 0) {
                        configuration.tools.applyAgentColors(agent, type, [color, browser.ui.colors[type][agent][1]]);
                    } else {
                        configuration.tools.applyAgentColors(agent, type, [browser.ui.colors[type][agent][0], color]);
                    }
                    swatch.style.background = `#${color}`;
                    network.configuration();
                } else if (event.type === "keyup") {
                    const span:HTMLElement = parent.getElementsByTagName("span")[0];
                    span.style.background = color;
                }
            }
        },

        /* Enable or disable audio from the configuration menu */
        audio: function browser_content_configuration_audio(event:MouseEvent):void {
            const element:HTMLInputElement = event.target as HTMLInputElement;
            if (element.value === "on") {
                browser.ui.audio = true;
            } else {
                browser.ui.audio = false;
            }
            configuration.tools.radio(element);
            if (browser.loading === false) {
                network.configuration();
            }
        },

        /* Blur event from the Window Background Display text fields */
        backgroundWindow: function browser_content_configuration_backgroundWindow(event:KeyboardEvent):void {
            const key:string = event.key.toLowerCase();
            if (key === "enter") {
                const target:HTMLInputElement = event.target as HTMLInputElement,
                    name:string = target.getAttribute("name"),
                    value:string = target.value,
                    color:string = name.split("-")[0],
                    index:number = Number(name.split("-")[1]),
                    indexMap:string[] = [
                        `.${color} #spaces .box div.body{background:`,
                        `.${color} #spaces .box input, .${color} #spaces .box textarea{background:`,
                        `.${color} #spaces .box .body, .${color} #spaces .box textarea{backdrop-filter:`
                    ],
                    existingCSS:string[] = browser.style.firstChild.textContent.split("\n"),
                    newProperty:string = `${indexMap[index] + value}}`;
                let css:number = existingCSS.length;
                do {
                    css = css - 1;
                    if (existingCSS[css].indexOf(indexMap[index]) === 0) {
                        existingCSS[css] = newProperty;
                        browser.ui.colorBackgrounds[color][index] = value;
                        network.configuration();
                        browser.style.appendText(existingCSS.join("\n"), true);
                        return;
                    }
                } while (css > 0);
            }
        },

        /* Change the color scheme */
        colorScheme: function browser_content_configuration_colorScheme(event:MouseEvent):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                oldScheme:string = (configuration.colorDefaults[browser.ui.color] === undefined)
                    ? "default"
                    : browser.ui.color,
                complete = function browser_content_configuration_colorScheme_complete(counts:agentCounts):void {
                    counts.count = counts.count + 1;
                    if (counts.count === agentsTotal) {
                        browser.ui.color = element.value;
                        if (browser.loading === false) {
                            network.configuration();
                        }
                    }
                };
            let agentColors:HTMLCollectionOf<HTMLElement>,
                agentsTotal:number = 0;
            browser.pageBody.setAttribute("class", element.value);

            common.agents({
                complete: complete,
                countBy: "agent",
                perAgent: function browser_content_configuration_colorScheme_perAgent(agentNames:agentNames, counts:agentCounts):void {
                    if (agentColors === null || (agentNames.agentType === "user" && agentNames.agent === browser.identity.hashUser)) {
                        complete(counts);
                        return;
                    }
                    const agent:string = agentNames.agent,
                        agentType:agentType = agentNames.agentType,
                        color:color = browser.ui.colors[agentType][agent],
                        agentLength:number = agentColors.length;
                    let c:number = 0,
                        swatches:HTMLCollectionOf<Element>,
                        swatch1:HTMLElement,
                        swatch2:HTMLElement,
                        inputs:HTMLCollectionOf<HTMLInputElement>;
                    if (color[0] === configuration.colorDefaults[oldScheme][0] && color[1] === configuration.colorDefaults[oldScheme][1]) {
                        color[0] = configuration.colorDefaults[element.value][0];
                        color[1] = configuration.colorDefaults[element.value][1];
                    }
                    configuration.tools.applyAgentColors(agent, agentType, [color[0], color[1]]);
                    if (agentLength > 0) {
                        do {
                            if (agentColors[c].dataset !== undefined && agentColors[c].dataset.agent === agent) {
                                swatches = agentColors[c].getElementsByClassName("swatch");
                                swatch1 = swatches[0] as HTMLElement;
                                swatch2 = swatches[1] as HTMLElement;
                                inputs = agentColors[c].getElementsByTagName("input");
                                swatch1.style.background = `#${color[0]}`;
                                swatch2.style.background = `#${color[1]}`;
                                inputs[0].value = color[0];
                                inputs[1].value = color[1];
                                break;
                            }
                            c = c + 1;
                        } while (c < agentLength);
                    }
                    complete(counts);
                },
                perAgentType: function browser_content_configuration_colorScheme_perAgent(agentNames:agentNames):void {
                    const list:HTMLElement = document.getElementsByClassName(`${agentNames.agentType}-color-list`)[0] as HTMLElement;
                    if (list === undefined) {
                        agentColors = null;
                    } else {
                        agentColors =  document.getElementsByClassName(`${agentNames.agentType}-color-list`)[0].getElementsByTagName("li");
                        agentsTotal = agentsTotal + agentColors.length;
                    }
                },
                source: browser
            });
            configuration.tools.radio(element);
        },

        /* Process various settings by text input or select list */
        configurationText: function browser_content_configuration_configurationText(event:Event):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                keyboard:KeyboardEvent = event as KeyboardEvent;
            if (element.value.replace(/\s+/, "") !== "" && (event.type === "blur" || (event.type === "change" && element.lowName() === "select") || (event.type === "keyup" && keyboard.key === "Enter"))) {
                const numb:number = Number(element.value),
                    parent:HTMLElement = element.parentNode,
                    parentText:string = parent.innerHTML.toLowerCase();
                if (parentText.indexOf("brotli") > 0) {
                    if (isNaN(numb) === true || numb < 0 || numb > 11) {
                        element.value = browser.ui.brotli.toString();
                    }
                    element.value = Math.floor(numb).toString();
                    browser.ui.brotli = Math.floor(numb) as brotli;
                } else if (parentText.indexOf("hash") > -1) {
                    browser.ui.hashType = element.value as hash;
                } else if (parentText.indexOf("storage") > -1) {
                    browser.ui.storage = element.value;
                } else if (parentText.indexOf("file sort") > -1) {
                    browser.ui.fileSort = element.value as fileSort;
                }
                network.configuration();
            }
        },

        /* Shows and hides additional textual information about compression */
        detailsToggle: function browser_content_configuration_detailsToggle(event:MouseEvent):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                parent:HTMLElement = element.parentNode,
                info:HTMLElement = parent.getElementsByClassName("configuration-details")[0] as HTMLElement;
            if (info.style.display === "none") {
                info.style.display = "block";
                element.appendText("Less information ⇡", true);
            } else {
                info.style.display = "none";
                element.appendText("More information ⇣", true);
            }
        }
    },

    tools: {
        /* Add agent color options to the configuration modal content */
        addUserColor: function browser_content_configuration_addUserColor(agent:string, type:agentType, configElement:HTMLElement):void {
            const config:HTMLElement = (configElement === undefined || configElement === null)
                    ? document.getElementById("configuration-modal").getElementsByClassName("body")[0].firstChild as HTMLElement
                    : configElement,
                ul:HTMLElement = config.getElementsByClassName(`${type}-color-list`)[0] as HTMLElement,
                li:HTMLElement = document.createElement("li"),
                p:HTMLElement = document.createElement("p"),
                agentColor:[string, string] = browser.ui.colors[type][agent];
            let span:HTMLElement,
                label:HTMLElement,
                input:HTMLInputElement;
            p.appendText(browser.agents[type][agent].name);
            li.setAttribute("data-agent", agent);
            li.appendChild(p);

            label = document.createElement("label");
            input = document.createElement("input");
            span = document.createElement("span");
            span.setAttribute("class", "swatch");
            span.style.background = `#${agentColor[0]}`;
            label.appendChild(span);
            input.type = "text";
            input.value = agentColor[0];
            input.onblur = configuration.events.agentColor;
            input.onkeyup = configuration.events.agentColor;
            label.appendChild(input);
            label.appendText("Body Color");
            li.appendChild(label);

            label = document.createElement("label");
            input = document.createElement("input");
            span = document.createElement("span");
            span.setAttribute("class", "swatch");
            span.style.background = `#${agentColor[1]}`;
            label.appendChild(span);
            input.type = "text";
            input.value = agentColor[1];
            input.onblur = configuration.events.agentColor;
            input.onkeyup = configuration.events.agentColor;
            label.appendChild(input);
            label.appendText("Heading Color");
            li.appendChild(label);

            ul.appendChild(li);
        },

        /* Update the agent color information in the style tag */
        applyAgentColors: function browser_content_configuration_applyUserColors(agent:string, type:agentType, colors:[string, string]):void {
            const prefix:string = `#spaces .box[data-agent="${agent}"] `,
                style:string = browser.style.innerHTML,
                styleText:configuration_styleText = {
                    agent: agent,
                    agentType: type,
                    colors: colors,
                    replace: true
                };
            let scheme:string = browser.pageBody.getAttribute("class");
            if (scheme === null) {
                scheme = "default";
            }
            if (colors[0] === configuration.colorDefaults[scheme][0] && colors[1] === configuration.colorDefaults[scheme][1]) {
                // colors are defaults for the current scheme
                styleText.colors = ["", ""];
                configuration.tools.styleText(styleText);
            } else if (style.indexOf(prefix) > -1) {
                // replace changed colors in the style tag if present
                configuration.tools.styleText(styleText);
            } else {
                // add new styles if not present
                styleText.replace = false;
                configuration.tools.styleText(styleText);
            }
            browser.ui.colors[type][agent][0] = colors[0];
            browser.ui.colors[type][agent][1] = colors[1];
        },

        /* Sets a class on a grandparent element to apply style changes to the corresponding label */
        radio: function browser_content_configuration_radio(element:HTMLElement):void {
            const parent:HTMLElement = element.parentNode,
                grandParent:HTMLElement = parent.parentNode,
                labels:HTMLCollectionOf<Element> = grandParent.getElementsByTagName("label"),
                length:number = labels.length;
            let a:number = 0;
            do {
                labels[a].setAttribute("class", "radio");
                a = a + 1;
            } while (a < length);
            parent.setAttribute("class", "radio-checked");
        },

        socketMap: function browser_content_configuration_socketMap(socketData:socketData):void {
            const list:socketMap = socketData.data as socketMap,
                keys:string[] = Object.keys(list),
                len:number = keys.length,
                body:HTMLElement = document.getElementById("socketMap-modal").getElementsByClassName("body")[0] as HTMLElement,
                p:HTMLElement = document.createElement("p");
            body.removeChild(body.firstChild);
            if (len > 0) {
                const table:HTMLElement = document.createElement("table"),
                    cell = function browser_content_configuration_socketMap_cell(text:string, tagName:"td"|"th", parent:HTMLElement):void {
                        const tag:HTMLElement = document.createElement(tagName);
                        if (bodySection === true && tagName === "th") {
                            const span:HTMLElement = document.createElement("span"),
                                name:string = (browser.agents.device[text] === undefined)
                                    ? ""
                                    : browser.agents.device[text].name;
                            span.appendText(name);
                            tag.appendChild(span);
                            tag.appendText(` - ${text}`);
                            tag.setAttribute("colspan", "7");
                        } else {
                            tag.appendText(text);
                        }
                        parent.appendChild(tag);
                    };
                let section:HTMLElement = document.createElement("thead"),
                    tr:HTMLElement = document.createElement("tr"),
                    indexDevice:number = 0,
                    indexSocket:number = 0,
                    device:socketMapItem[] = null,
                    deviceLen:number = 0,
                    bodySection:boolean = false,
                    type:agentType = null;
                cell("Type", "th", tr);
                cell("Status", "th", tr);
                cell("Local Address", "th", tr);
                cell("Local Port", "th", tr);
                cell("Remote Address", "th", tr);
                cell("Remote Port", "th", tr);
                cell("Name", "th", tr);
                section.appendChild(tr);
                table.appendChild(section);
                section = document.createElement("tbody");
                bodySection = true;
                do {
                    device = list[keys[indexDevice]];
                    deviceLen = device.length;
                    indexSocket = 0;
                    if (deviceLen > 0) {
                        tr = document.createElement("tr");
                        cell(keys[indexDevice], "th", tr);
                        section.appendChild(tr);
                        do {
                            // agent deletion can result in a race condition to report the updated socket list containing deleted agent data
                            if (
                                (device[indexSocket].type !== "device" && device[indexSocket].type !== "user") ||
                                ((device[indexSocket].type === "device" || device[indexSocket].type === "user") && browser.agents[type] !== undefined && browser.agents[type][device[indexSocket].name] !== undefined)
                            ) {
                                tr = document.createElement("tr");
                                cell(device[indexSocket].type, "td", tr);
                                cell(device[indexSocket].status, "td", tr);
                                if (device[indexSocket].status === "open") {
                                    cell(device[indexSocket].localAddress, "td", tr);
                                    cell(device[indexSocket].localPort.toString(), "td", tr);
                                    cell(device[indexSocket].remoteAddress, "td", tr);
                                    cell(device[indexSocket].remotePort.toString(), "td", tr);
                                } else {
                                    cell("", "td", tr);
                                    cell("", "td", tr);
                                    cell("", "td", tr);
                                    cell("", "td", tr);
                                }
                                if (device[indexSocket].type === "device" || device[indexSocket].type === "user") {
                                    type = device[indexSocket].type as agentType;
                                    cell(`${browser.agents[type][device[indexSocket].name].name} - ${device[indexSocket].name}`, "td", tr);
                                } else {
                                    cell(device[indexSocket].name, "td", tr);
                                }
                                if (device[indexSocket].status === "end" || device[indexSocket].status === "closed") {
                                    tr.setAttribute("class", "closed");
                                } else if (device[indexSocket].status === "pending") {
                                    tr.setAttribute("class", "pending");
                                }
                                section.appendChild(tr);
                            }
                            indexSocket = indexSocket + 1;
                        } while (indexSocket < deviceLen);
                    }
                    indexDevice = indexDevice + 1;
                } while (indexDevice < len);
                table.setAttribute("class", "socket-map");
                table.appendChild(section);
                body.appendChild(table);
                return;
            }
            p.setAttribute("class", "socket-map");
            p.appendText("No open sockets.");
            body.appendChild(p);
        },

        /* Applies agent color definitions */
        styleText: function browser_content_configuration_styleText(input:configuration_styleText):void {
            const template:string[] = [
                `#spaces .box[data-agent="${input.agent}"] .body,`,
                `#spaces #${input.agentType} button[data-agent="${input.agent}"]:hover{background-color:#`,
                browser.ui.colors[input.agentType][input.agent][0],
                "}",
                `#spaces #${input.agentType} button[data-agent="${input.agent}"],`,
                `#spaces .box[data-agent="${input.agent}"] .status-bar,`,
                `#spaces .box[data-agent="${input.agent}"] .footer,`,
                `#spaces .box[data-agent="${input.agent}"] h2.heading{background-color:#`,
                browser.ui.colors[input.agentType][input.agent][1],
                "}"
            ];
            if (input.replace === true) {
                if (input.colors[0] === "" && input.colors[1] === "") {
                    // removes an agent's colors
                    browser.style.appendText(browser.style.innerHTML.replace(template.join(""), ""), true);
                } else {
                    const old:string = template.join("");
                    if (input.colors[0] !== "") {
                        template[2] = input.colors[0];
                    }
                    if (input.colors[1] !== "") {
                        template[8] = input.colors[1];
                    }
                    // updates an agent's colors
                    browser.style.appendText(browser.style.innerHTML.replace(old, template.join("")), true);
                }
            } else {
                if (input.colors[0] !== "") {
                    template[2] = input.colors[0];
                }
                if (input.colors[1] !== "") {
                    template[8] = input.colors[1];
                }
                // adds an agent's colors
                browser.style.appendText(browser.style.innerHTML + template.join(""), true);
            }
        }
    }

};

export default configuration;