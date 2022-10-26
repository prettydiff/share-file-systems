
/* lib/browser/content/configuration - A collection of utilities and event handlers associated with processing the application state and system configuration. */

import browser from "../utilities/browser.js";
import common from "../../common/common.js";
import network from "../utilities/network.js";
import util from "../utilities/util.js";

/**
 * Methods for generating the configuration modal and its interactions.
 * ```typescript
 * interface module_configuration {
 *     colorDefaults: browser_colorList;// An object associating color information to color scheme names.
 *     content      : () => Element;    // Generates the configuration modal content to populate into the configuration modal.
 *     events: {
 *         agentColor       : (event:Event) => void;      // Specify custom agent color configurations.
 *         audio            : (event:MouseEvent) => void; // Assign changes to the audio option to settings.
 *         colorScheme      : (event:MouseEvent) => void; // Changes the color scheme of the page by user interaction.
 *         configurationText: (event:Event) => void;      // Processes settings changes from either text input or select lists.
 *         detailsToggle    : (event:MouseEvent) => void; // Shows and hides text explaining compression.
 *         modal            : (event:MouseEvent) => void; // Generates the configuration modal and fills it with content.
 *     };
 *     tools: {
 *         addUserColor    : (agent:string, type:agentType, configurationBody:Element) => void; // Add agent color options to the configuration modal content.
 *         applyAgentColors: (agent:string, type:agentType, colors:[string, string]) => void;   // Update the specified color information against the default colors of the current color scheme.
 *         radio           : (element:Element) => void;                                         // Sets a class on a grandparent element to apply style changes to the corresponding label.
 *         styleText       : (input:configuration_styleText) => void;                           // Generates the CSS code for an agent specific style change and populates it into an HTML style tag.
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

    content: function browser_content_configuration_content():Element {
        const configurationBody:Element = document.createElement("div"),
            random:string = Math.random().toString(),
            createSection = function browser_content_configuration_content_createSection(title:string):Element {
                const container:Element = document.createElement("div"),
                    h3:Element = document.createElement("h3");
                container.setAttribute("class", "section");
                h3.innerHTML = title;
                container.appendChild(h3);
                return container;
            },
            perAgentType = function browser_content_configuration_content_perAgentType(agentType:agentType):void {
                const ul:Element = document.createElement("ul");
                section = createSection(`◩ ${common.capitalize(agentType)} Color Definitions`);
                p = document.createElement("p");
                p.innerHTML = "Accepted format is 3 or 6 digit hexadecimal (0-f)";
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
                    text = document.createTextNode(config.textLabel);
                    select = document.createElement("select");
                    {
                        const length:number = config.options.length;
                        let a:number = 0;
                        do {
                            option = document.createElement("option");
                            option.innerHTML = config.options[a];
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
                    label.appendChild(text);
                    p.appendChild(label);
                } else if (config.type === "text") {
                    p = document.createElement("p");
                    label = document.createElement("label");
                    text = document.createTextNode(config.textLabel);
                    input = document.createElement("input");
                    input.type = "text";
                    input.value = config.value;
                    input.name = config.name;
                    input.onkeyup = configuration.events.configurationText;
                    input.onblur = configuration.events.configurationText;
                    label.appendChild(input);
                    label.appendChild(text);
                    p.appendChild(label);
                }
                section.appendChild(p);
                if (config.button === true) {
                    p = document.createElement("p");
                    button = document.createElement("button");
                    button.onclick = configuration.events.detailsToggle;
                    button.innerHTML = "More information ⇣";
                    button.setAttribute("type", "button");
                    section.appendChild(button);
                    p.innerHTML = config.textPara;
                    p.setAttribute("class", "configuration-details");
                    p.style.display = "none";
                    section.appendChild(p);
                }
                configurationBody.appendChild(section);
            };
        let section:Element,
            p:HTMLElement,
            select:HTMLElement,
            option:HTMLOptionElement,
            label:Element,
            input:HTMLInputElement,
            button:HTMLElement,
            text:Text;
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
            value: (browser.data.audio === true)
                ? "On"
                : "Off"
        });

        // color scheme
        textSection({
            button: false,
            name: "colorScheme",
            options: (function browser_content_configuration_content_colorNames():string[] {
                const keys:string[] = Object.keys(configuration.colorDefaults);
                keys.forEach(function browser_content_configuration_content_colorNames_each(value:string, index:number, arr:string[]):void {
                    arr[index] = common.capitalize(value);
                });
                return keys.sort();
            }()),
            textLabel: null,
            textPara: null,
            title: "▣ Color Theme",
            type: "radio",
            value: (configuration.colorDefaults[browser.data.color] === undefined)
                ? "default"
                : browser.data.color
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
            value: browser.data.fileSort
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
            value: browser.data.brotli.toString()
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
            value: browser.data.storage
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
            value: browser.data.hashType
        });

        perAgentType("device");
        perAgentType("user");
        common.agents({
            countBy: "agent",
            perAgent: function browser_content_configuration_content_perAgent(agentNames:agentNames):void {
                configuration.tools.addUserColor(agentNames.agent, agentNames.agentType, configurationBody);
            },
            source: browser
        });
        return configurationBody;
    },

    events: {

        /* specify custom agent color configuration */
        agentColor: function browser_content_configuration_agentColor(event:Event):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                keyboard:KeyboardEvent = event as KeyboardEvent,
                colorTest:RegExp = (/^(([0-9a-fA-F]{3})|([0-9a-fA-F]{6}))$/),
                color:string = `${element.value.replace(/\s+/g, "").replace("#", "")}`,
                parent:Element = element.parentNode as Element;
            if (colorTest.test(color) === true) {
                if (event.type === "blur" || (event.type === "keyup" && keyboard.key === "Enter")) {
                    const item:Element = parent.parentNode as Element,
                        ancestor:Element = element.getAncestor("ul", "tag"),
                        type:agentType = ancestor.getAttribute("class").split("-")[0] as agentType,
                        agent:string = item.getAttribute("data-agent"),
                        swatch:HTMLElement = parent.getElementsByClassName("swatch")[0] as HTMLElement;
                    element.value = color;
                    if (parent.innerHTML.indexOf("Body") > 0) {
                        configuration.tools.applyAgentColors(agent, type, [color, browser.data.colors[type][agent][1]]);
                    } else {
                        configuration.tools.applyAgentColors(agent, type, [browser.data.colors[type][agent][0], color]);
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
                browser.data.audio = true;
            } else {
                browser.data.audio = false;
            }
            configuration.tools.radio(element);
            if (browser.loading === false) {
                network.configuration();
            }
        },

        /* Change the color scheme */
        colorScheme: function browser_content_configuration_colorScheme(event:MouseEvent):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                oldScheme:string = (configuration.colorDefaults[browser.data.color] === undefined)
                    ? "default"
                    : browser.data.color,
                complete = function browser_content_configuration_colorScheme_complete(counts:agentCounts):void {
                    counts.count = counts.count + 1;
                    if (counts.count === agentsTotal) {
                        browser.data.color = element.value;
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
                    if (agentColors === null || (agentNames.agentType === "user" && agentNames.agent === browser.data.hashUser)) {
                        complete(counts);
                        return;
                    }
                    const agent:string = agentNames.agent,
                        agentType:agentType = agentNames.agentType,
                        color:color = browser.data.colors[agentType][agent],
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
                    do {
                        if (agentColors[c].getAttribute("data-agent") === agent) {
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
                    complete(counts);
                },
                perAgentType: function browser_content_configuration_colorScheme_perAgent(agentNames:agentNames):void {
                    const list:Element = document.getElementsByClassName(`${agentNames.agentType}-color-list`)[0];
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
            if (element.value.replace(/\s+/, "") !== "" && (event.type === "blur" || (event.type === "change" && util.name(element) === "select") || (event.type === "keyup" && keyboard.key === "Enter"))) {
                const numb:number = Number(element.value),
                    parent:Element = element.parentNode as Element,
                    parentText:string = parent.innerHTML.toLowerCase();
                if (parentText.indexOf("brotli") > 0) {
                    if (isNaN(numb) === true || numb < 0 || numb > 11) {
                        element.value = browser.data.brotli.toString();
                    }
                    element.value = Math.floor(numb).toString();
                    browser.data.brotli = Math.floor(numb) as brotli;
                } else if (parentText.indexOf("hash") > -1) {
                    browser.data.hashType = element.value as hash;
                } else if (parentText.indexOf("storage") > -1) {
                    browser.data.storage = element.value;
                } else if (parentText.indexOf("file sort") > -1) {
                    browser.data.fileSort = element.value as fileSort;
                }
                network.configuration();
            }
        },

        /* Shows and hides additional textual information about compression */
        detailsToggle: function browser_content_configuration_detailsToggle(event:MouseEvent):void {
            const element:HTMLInputElement = event.target as HTMLInputElement,
                parent:Element = element.parentNode as Element,
                info:HTMLElement = parent.getElementsByClassName("configuration-details")[0] as HTMLElement;
            if (info.style.display === "none") {
                info.style.display = "block";
                element.innerHTML = "Less information ⇡";
            } else {
                info.style.display = "none";
                element.innerHTML = "More information ⇣";
            }
        }
    },

    tools: {
        /* Add agent color options to the configuration modal content */
        addUserColor: function browser_content_configuration_addUserColor(agent:string, type:agentType, configurationBody:Element):void {
            const ul:Element = configurationBody.getElementsByClassName(`${type}-color-list`)[0],
                li:Element = document.createElement("li"),
                p:Element = document.createElement("p"),
                agentColor:[string, string] = browser.data.colors[type][agent];
            let span:HTMLElement,
                label:Element,
                input:HTMLInputElement,
                text:Text;
            p.innerHTML = browser[type][agent].name;
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
            text = document.createTextNode("Body Color");
            label.appendChild(text);
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
            text = document.createTextNode("Heading Color");
            label.appendChild(text);
            li.appendChild(label);

            ul.appendChild(li);
        },

        /* Update the agent color information in the style tag */
        applyAgentColors: function browser_content_configuration_applyUserColors(agent:string, type:agentType, colors:[string, string]):void {
            const prefix:string = `#spaces .box[data-agent="${agent}"] `,
                style:string = browser.style.innerHTML,
                styleText:configuration_styleText = {
                    agent: agent,
                    colors: colors,
                    replace: true,
                    type: type
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
            browser.data.colors[type][agent][0] = colors[0];
            browser.data.colors[type][agent][1] = colors[1];
        },

        /* Sets a class on a grandparent element to apply style changes to the corresponding label */
        radio: function browser_content_configuration_radio(element:Element):void {
            const parent:HTMLElement = element.parentNode as HTMLElement,
                grandParent:Element = parent.parentNode as Element,
                labels:HTMLCollectionOf<Element> = grandParent.getElementsByTagName("label"),
                length:number = labels.length;
            let a:number = 0;
            do {
                labels[a].setAttribute("class", "radio");
                a = a + 1;
            } while (a < length);
            parent.setAttribute("class", "radio-checked");
        },

        /* Applies agent color definitions */
        styleText: function browser_content_configuration_styleText(input:configuration_styleText):void {
            const template:string[] = [
                `#spaces .box[data-agent="${input.agent}"] .body,`,
                `#spaces #${input.type} button[data-agent="${input.agent}"]:hover{background-color:#`,
                browser.data.colors[input.type][input.agent][0],
                "}",
                `#spaces #${input.type} button[data-agent="${input.agent}"],`,
                `#spaces .box[data-agent="${input.agent}"] .status-bar,`,
                `#spaces .box[data-agent="${input.agent}"] .footer,`,
                `#spaces .box[data-agent="${input.agent}"] h2.heading{background-color:#`,
                browser.data.colors[input.type][input.agent][1],
                "}"
            ];
            if (input.replace === true) {
                if (input.colors[0] === "" && input.colors[1] === "") {
                    // removes an agent's colors
                    browser.style.innerHTML = browser.style.innerHTML.replace(template.join(""), "");
                } else {
                    const old:string = template.join("");
                    if (input.colors[0] !== "") {
                        template[2] = input.colors[0];
                    }
                    if (input.colors[1] !== "") {
                        template[8] = input.colors[1];
                    }
                    // updates an agent's colors
                    browser.style.innerHTML = browser.style.innerHTML.replace(old, template.join(""));
                }
            } else {
                if (input.colors[0] !== "") {
                    template[2] = input.colors[0];
                }
                if (input.colors[1] !== "") {
                    template[8] = input.colors[1];
                }
                // adds an agent's colors
                browser.style.innerHTML = browser.style.innerHTML + template.join("");
            }
        }
    }

};

export default configuration;