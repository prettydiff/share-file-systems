
/* lib/browser/utilities/message_post - A utility to process and text messages for transport and display in the UI. */

import browser from "./browser.js";
import common from "../../common/common.js";

// cspell: words agentType

const message_post = function browser_utilities_messagePost(item:message_item, target:messageTarget, modal:modal):void {
    const tr:HTMLElement = document.createElement("tr"),
        meta:HTMLElement = document.createElement("th"),
        messageCell:HTMLElement = document.createElement("td"),
        tbody:HTMLElement = modal.getElementsByClassName("message-content")[0].getElementsByTagName("tbody")[0],
        posts:HTMLCollectionOf<HTMLTableRowElement> = tbody.getElementsByTagName("tr"),
        postsLength:number = posts.length,
        // a simple test to determine if the message is coming from this agent (though not necessarily this device if sent to a user)
        self = function browser_utilities_messagePost_self(hash:string):boolean {
            if (item.agentType === "device" && hash === browser.identity.hashDevice) {
                return true;
            }
            if (item.agentType === "user" && hash === browser.identity.hashUser) {
                return true;
            }
            return false;
        },
        // a regex handler to convert unicode character entity references
        unicode = function browser_utilities_messagePost_unicode(reference:string):string {
            const output:string[] = [];
            reference.split("\\u").forEach(function browser_utilities_messagePost_unicode_split(value:string) {
                output.push(String.fromCharCode(Number(`0x${value}`)));
            });
            return output.join("");
        },
        // a regex handler to convert html code point character entity references
        decimal = function browser_utilities_messagePost_decimal(reference:string):string {
            return String.fromCodePoint(Number(reference.replace("&#", "").replace(";", "")));
        },
        // a regex handler to convert html decimal character entity references
        html = function browser_utilities_messagePost_html(reference:string):string {
            return String.fromCodePoint(Number(reference.replace("&#x", "0x").replace(";", "")));
        },
        date:Date = new Date(item.date);
    let messageText:string = (item.mode === "code")
        ? `<p>${item.message}</p>`
        : `<p>${item.message
            .replace(/^\s+/, "")
            .replace(/\s+$/, "")
            .replace(/(?<!\\)(\\u[0-9a-f]{4})+/g, unicode)
            .replace(/&#\d+;/g, decimal)
            .replace(/&#x[0-9a-f]+;/, html)
            .replace(/(\r?\n)+/g, "</p><p>")}</p>`;
    if (item.mode === "text") {
        const strings:string[] = messageText.split("http"),
            stringsLength:number = strings.length;
        if (stringsLength > 1) {
            let a:number = 1,
                b:number = 0,
                segment:number = 0;
            do {
                if ((/^s?:\/\//).test(strings[a]) === true) {
                    b = 0;
                    segment = strings[a].length;
                    do {
                        if ((/\s|</).test(strings[a].charAt(b)) === true) {
                            break;
                        }
                        b = b + 1;
                    } while (b < segment);
                    if (b === segment) {
                        strings[a] = `<a target="_blank" href="http${strings[a]}">http${strings[a]}</a>`;
                    } else {
                        strings[a] = `<a target="_blank" href="http${strings[a].slice(0, b)}">http${strings[a].slice(0, b)}</a>${strings[a].slice(b)}`;
                    }
                }
                a = a + 1;
            } while (a < stringsLength);
            messageText = strings.join("");
        }
    }
    // eslint-disable-next-line no-restricted-syntax
    messageCell.innerHTML = messageText;
    messageCell.setAttribute("class", item.mode);
    tr.setAttribute("data-agentFrom", item.agentFrom);
    if (item.agentType === "user" && item.agentFrom === browser.identity.hashUser) {
        const strong:HTMLElement = document.createElement("strong"),
            em:HTMLElement = document.createElement("em");
        strong.appendText(browser.identity.nameUser);
        em.appendText(common.dateFormat(date));
        meta.appendChild(strong);
        meta.appendText(" ");
        meta.appendChild(em);
    } else if (item.agentType === "device" && item.agentFrom === browser.identity.hashDevice) {
        const strong:HTMLElement = document.createElement("strong"),
            em:HTMLElement = document.createElement("em");
        strong.appendText(browser.identity.nameDevice);
        em.appendText(common.dateFormat(date));
        meta.appendChild(strong);
        meta.appendText(" ");
        meta.appendChild(em);
    } else {
        const strong:HTMLElement = document.createElement("strong"),
            em:HTMLElement = document.createElement("em"),
            span:HTMLElement = document.createElement("span");
        span.appendText(common.capitalize(item.agentType));
        strong.appendText(browser.agents[item.agentType][item.agentFrom].name);
        em.appendText(common.dateFormat(date));
        meta.appendChild(span);
        meta.appendText(" ");
        meta.appendChild(strong);
        meta.appendText(" ");
        meta.appendChild(em);
    }
    tr.appendChild(meta);
    tr.appendChild(messageCell);
    if (postsLength > 0) {
        if (posts[0].dataset.agentFrom === item.agentFrom) {
            if (posts[0].getAttribute("class") === null) {
                posts[0].setAttribute("class", "prior");
            } else {
                posts[0].setAttribute("class", `${posts[0].getAttribute("class")} prior`);
            }
            if (self(item.agentFrom) === true) {
                tr.setAttribute("class", "message-self");
            }
        } else {
            if (self(item.agentFrom) === true) {
                tr.setAttribute("class", "base message-self");
            } else {
                tr.setAttribute("class", "base");
            }
        }
    } else {
        if (self(item.agentFrom) === true) {
            tr.setAttribute("class", "base message-self");
        } else {
            tr.setAttribute("class", "base");
        }
    }
    tbody.insertBefore(tr.cloneNode(true), tbody.firstChild);
};

export default message_post;