
import browser from "./browser.js";
import context from "./context.js";
import fs from "./fs.js";
import modal from "./modal.js";
import network from "./network.js";
import settings from "./settings.js";
import util from "./util.js";

const share:module_share = {};

/* Adds users to the user bar */
share.addUser = function local_share_addUser(user:string):void {
    const li:HTMLLIElement = document.createElement("li"),
        button:HTMLElement = document.createElement("button"),
        name:string = (user.lastIndexOf("@localhost") === user.length - "@localhost".length)
            ? "localhost"
            : user,
        addStyle = function local_share_addUser_addStyle() {
            let body:string,
                heading:string;
            const prefix:string = `#spaces .box[data-agent="${user}"] `;
            if (browser.users[user].color[0] === "") {
                body = browser.users.localhost.color[0];
                heading = browser.users.localhost.color[1];
                browser.users[user].color = [body, heading];
            } else {
                body = browser.users[user].color[0];
                heading = browser.users[user].color[1];
            }
            browser.style.innerHTML = browser.style.innerHTML + [
                `#spaces #users button[data-agent="${user}"],${prefix}.status-bar,${prefix}.footer,${prefix} h2.heading{background-color:${heading}}`,
                `${prefix}.body,#spaces #users button[data-agent="${user}"]:hover{background-color:${body}}`
            ].join("");
        },
        sharesModal = function local_share_addUser_sharesModal(event:MouseEvent) {
            let element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
                name:string;
            element = util.getAncestor(element, "button", "tag");
            name = element.lastChild.textContent.replace(/^\s+/, "");
            share.modal(event, name, null);
        },
        modals:string[] = Object.keys(browser.data.modals),
        length: number = modals.length;
    let a:number = 0,
        shareUser:HTMLElement;
    button.innerHTML = `<em class="status-active">●<span> Active</span></em><em class="status-idle">●<span> Idle</span></em><em class="status-offline">●<span> Offline</span></em> ${user}`;
    if (name === "localhost") {
        button.setAttribute("class", "active");
    } else {
        button.setAttribute("class", "offline");
        button.setAttribute("data-agent", user);
        addStyle();
    }
    button.onclick = sharesModal;
    li.appendChild(button);
    document.getElementById("users").getElementsByTagName("ul")[0].appendChild(li);
    if (name === "localhost") {
        button.setAttribute("id", "localhost");
    }
    if (browser.loadTest === false) {
        settings.addUserColor(user, <HTMLElement>document.getElementById("settings-modal").getElementsByClassName("settings")[0]);
        do {
            if (browser.data.modals[modals[a]].type === "shares" && browser.data.modals[modals[a]].agent === "") {
                shareUser = document.createElement("li");
                shareUser.appendChild(share.content(user));
                document.getElementById(modals[a]).getElementsByClassName("userList")[0].appendChild(shareUser);
            }
            a = a + 1;
        } while (a < length);
        network.storage("users", false);
    }
};

/* Generate the content of a share modal */
share.content = function local_share_content(user:string):HTMLElement {
    if (user === undefined) {
        return document.getElementById("systems-modal");
    }
    const userKeys:string[] = Object.keys(browser.users),
        keyLength:number = userKeys.length,
        fileNavigate = function local_share_content_fileNavigate(event:MouseEvent):void {
            const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
                path:string = element.firstChild.textContent,
                type:string = element.getAttribute("class"),
                slash:string = (path.indexOf("/") > -1 && (path.indexOf("\\") < 0 || path.indexOf("\\") > path.indexOf("/")))
                    ? "/"
                    : "\\";
            let address:string,
                agent:string = element.parentNode.parentNode.previousSibling.firstChild.textContent;
            if (type === "file" || type === "link") {
                const dirs:string[] = path.replace(/\\/g, "/").split("/");
                dirs.pop();
                address = dirs.join(slash);
            } else {
                address = path;
            }
            fs.navigate(event, {
                agentName: agent,
                path: address,
                readOnly: (agent !== "localhost" && element.getElementsByClassName("read-only-status")[0].innerHTML === "(Read Only)")
            });
        };
    let users:HTMLElement,
        eachUser:HTMLElement;
    if (typeof user === "string" && user.indexOf("@localhost") === user.length - 10) {
        user = "localhost";
    }
    if (keyLength === 1 && browser.users.localhost.shares.length === 0) {
        users = document.createElement("h3");
        users.innerHTML = "There are no shares at this time.";
    } else {
        let userName:HTMLElement,
            itemList:HTMLElement,
            item:HTMLElement,
            button:HTMLElement,
            del:HTMLElement,
            readOnly:HTMLElement,
            status:HTMLElement,
            span:HTMLElement,
            a:number = 0,
            b:number = 0,
            shareLength:number,
            type:string;
        const eachItem = function local_share_content_eachItem(userName:string):void {
            item = document.createElement("li");
            button = document.createElement("button");
            type = browser.users[userName].shares[b].type;
            button.setAttribute("class", type);
            button.innerHTML = browser.users[userName].shares[b].name;
            status = document.createElement("strong");
            status.setAttribute("class", "read-only-status");
            status.innerHTML = (browser.users[userName].shares[b].readOnly === true)
                ? "(Read Only)"
                : "(Full Access)"
            button.appendChild(status);
            if (type === "directory" || type === "file" || type === "link") {
                button.onclick = fileNavigate;
            }
            if (userName === "localhost") {
                readOnly = document.createElement("button");
                if (browser.users.localhost.shares[b].readOnly === true) {
                    item.setAttribute("class", "localhost");
                    readOnly.setAttribute("class", "grant-full-access");
                    readOnly.innerHTML = ("Grant Full Access");
                } else {
                    item.setAttribute("class", "localhost full-access");
                    readOnly.setAttribute("class", "make-read-only");
                    readOnly.innerHTML = ("Make Read Only");
                }
                readOnly.onclick = share.readOnly;
                del = document.createElement("button");
                del.setAttribute("class", "delete");
                del.setAttribute("title", "Delete this share");
                del.innerHTML = "\u2718<span>Delete this share</span>";
                del.onclick = share.itemDelete;
                span = document.createElement("span");
                span.setAttribute("class", "clear");
                item.appendChild(del);
                item.appendChild(button);
                item.appendChild(readOnly);
                item.appendChild(button);
                item.appendChild(span);
            } else {
                if (browser.users[userName].shares[b].readOnly === true) {
                    item.removeAttribute("class");
                } else {
                    item.setAttribute("class", "full-access");
                }
                item.appendChild(button);
            }
            itemList.appendChild(item);
        };
        if (user === "") {
            users = document.createElement("ul");
            users.setAttribute("class", "userList");
            do {
                eachUser = document.createElement("li");
                userName = document.createElement("h3");
                userName.setAttribute("class", "user");
                userName.innerHTML = userKeys[a];
                eachUser.appendChild(userName);
                shareLength = browser.users[userKeys[a]].shares.length;
                if (shareLength > 0) {
                    b = 0;
                    itemList = document.createElement("ul");
                    do {
                        eachItem(userKeys[a]);
                        b = b + 1;
                    } while (b < shareLength);
                } else {
                    itemList = document.createElement("p");
                    itemList.innerHTML = "This user is not sharing anything.";
                }
                eachUser.appendChild(itemList);
                users.appendChild(eachUser);
                a = a + 1;
            } while (a < keyLength);
        } else {
            shareLength = browser.users[user].shares.length;
            users = document.createElement("div");
            users.setAttribute("class", "userList");
            userName = document.createElement("h3");
            userName.setAttribute("class", "user");
            userName.innerHTML = user;
            if (shareLength === 0) {
                itemList = document.createElement("p");
                itemList.innerHTML = `User ${user} is not sharing anything.`;
            } else {
                itemList = document.createElement("ul");
                do {
                    eachItem(user);
                    b = b + 1;
                } while (b < shareLength);
            }
            users.appendChild(userName);
            users.appendChild(itemList);
        }
    }
    return users;
};

/* Share utility for the context menu list */
share.context = function local_share_context():void {
    const element:HTMLElement = context.element,
        shareLength:number = browser.users.localhost.shares.length,
        addresses:[string, string][] = util.selectedAddresses(element, "share"),
        addressesLength:number = addresses.length;
    let a:number = 0,
        b:number = 0;
    if (shareLength > 0) {
        do {
            b = 0;
            do {
                if (addresses[a][0] === browser.users.localhost.shares[b].name && addresses[a][1] === browser.users.localhost.shares[b].type) {
                    break;
                }
                b = b + 1;
            } while (b < shareLength);
            if (b === shareLength) {
                browser.users.localhost.shares.push({
                    execute: false,
                    name: addresses[a][0],
                    readOnly: true,
                    type: <shareType>addresses[a][1]
                });
            }
            a = a + 1;
        } while (a < addressesLength);
    } else {
        do {
            browser.users.localhost.shares.push({
                execute: false,
                name: addresses[a][0],
                readOnly: true,
                type: <shareType>addresses[a][1]
            });
            a = a + 1;
        } while (a < addressesLength);
    }
    util.selectNone(element);
    share.update("localhost", browser.users.localhost.shares);
    network.storage("users");
    context.element = null;
};

/* Creates a confirmation modal listing users for deletion */
share.deleteList = function local_share_deleteList(event:MouseEvent, configuration?:ui_modal):void {
    const content:HTMLElement = document.createElement("div"),
        p:HTMLElement = document.createElement("p"),
        ul:HTMLElement = document.createElement("ul"),
        users:users = browser.users,
        names:string[] = Object.keys(users),
        length:number = names.length;
    let li:HTMLElement,
        a:number = 0,
        input:HTMLInputElement,
        label:HTMLElement,
        text:Text;
    p.setAttribute("class", "summary");
    if (length > 1) {
        p.innerHTML = "<strong>Please be warned that confirming this change is permanent.</strong> The user will be deleted from your devices and you from theirs.";
        ul.setAttribute("class", "sharesDeleteList");
        do {
            if (names[a] !== "localhost") {
                li = document.createElement("li");
                label = document.createElement("label");
                input = document.createElement("input");
                text = document.createTextNode(names[a]);
                input.type = "checkbox";
                input.onclick = share.deleteToggle;
                label.appendChild(input);
                label.appendChild(text);
                li.appendChild(label);
                ul.appendChild(li);
            }
            a = a + 1;
        } while (a < length);
        content.appendChild(p);
        content.appendChild(ul);
    } else {
        p.innerHTML = "No users to delete."
        content.appendChild(p);
    }
    if (configuration === undefined) {
        modal.create({
            agent: "localhost",
            content: content,
            inputs: (length > 1)
                ? ["confirm", "cancel", "close"]
                : ["close"],
            read_only: false,
            single: true,
            title: "<span class=\"icon-delete\">☣</span> Delete Shares",
            type: "share_delete",
            width: 750
        });
        network.storage("settings");
    } else {
        configuration.agent = "localhost";
        configuration.content = content;
        if (length > 1) {
            configuration.inputs = ["confirm", "cancel", "close"];
        } else {
            configuration.inputs = ["close"];
        }
        configuration.single = true;
        configuration.title = "<span class=\"icon-delete\">☣</span> Delete Shares";
        configuration.type = "share_delete";
        modal.create(configuration);
    }
};

/* Changes visual state of items in the shares delete list as they are checked or unchecked*/
share.deleteToggle = function local_shares_deleteToggle(event:MouseEvent):void {
    const element:HTMLInputElement = <HTMLInputElement>event.srcElement || <HTMLInputElement>event.target,
        label:HTMLElement = <HTMLElement>element.parentNode;
    if (element.checked === true) {
        label.setAttribute("class", "checked");
    } else {
        label.removeAttribute("class");
    }
};

/* Terminates one or more users */
share.deleteUser = function local_shares_deleteUser(box:HTMLElement):void {
    const body:HTMLElement = <HTMLElement>box.getElementsByClassName("body")[0],
        list:HTMLCollectionOf<HTMLElement> = body.getElementsByTagName("li"),
        users:HTMLCollectionOf<HTMLElement> = document.getElementById("users").getElementsByTagName("li"),
        names:string[] = [],
        modals:string[] = Object.keys(browser.data.modals),
        modalsLength:number = modals.length,
        userColors:HTMLCollectionOf<HTMLElement> = document.getElementById("settings-modal").getElementsByClassName("user-color-list")[0].getElementsByTagName("li");
    let a:number = list.length,
        usersLength:number = users.length,
        b:number = 3,
        c:number,
        text:string,
        length:number,
        h3:HTMLCollectionOf<HTMLElement>,
        close:HTMLButtonElement,
        colorLength:number = userColors.length;
    do {
        a = a - 1;
        if (list[a].getElementsByTagName("input")[0].checked === true) {
            text = list[a].lastChild.textContent;
            names.push(text);
            list[a].parentNode.removeChild(list[a]);
            delete browser.users[text];
        }
    } while (a > 0);
    if (names.length < 1) {
        return;
    }
    a = 0;
    length = names.length;
    do {
        b = usersLength;
        // loop through user buttons to remove the user
        do {
            b = b - 1;
            if (users[b].getElementsByTagName("button")[0].getAttribute("data-agent") === names[a]) {
                users[b].parentNode.removeChild(users[b]);
                break;
            }
        } while (b > 3);
        usersLength = usersLength - 1;

        // loop through shares modals to remove the deleted user
        c = 0;
        do {
            if (browser.data.modals[modals[c]].type === "shares") {
                // on the all shares modal simply remove the concerned user
                if (browser.data.modals[modals[c]].agent === "") {
                    h3 = document.getElementById(modals[c]).getElementsByTagName("h3");
                    b = h3.length;
                    do {
                        b = b - 1;
                        if (h3[b].innerHTML.indexOf(names[a]) === 0) {
                            h3[b].parentNode.parentNode.removeChild(h3[b].parentNode);
                        }
                    } while (b > 0);
                // simply close the deleted user's share modals
                } else if (browser.data.modals[modals[c]].agent === names[a]) {
                    close = <HTMLButtonElement>document.getElementById(modals[c]).getElementsByClassName("close")[0];
                    close.click();
                }
            }
            c = c + 1;
        } while (c < modalsLength);
        
        // loop through user colors
        c = 0;
        do {
            if (userColors[c].getElementsByTagName("p")[0].innerHTML === names[a]) {
                userColors[c].parentNode.removeChild(userColors[c]);
            }
            c = c + 1;
        } while (c < colorLength);
        colorLength = colorLength - 1;
        a = a + 1;
    } while (a < length);
    network.storage("users");
};

/* Delete a localhost share */
share.itemDelete = function local_share_itemDelete(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        parent:HTMLElement = <HTMLElement>element.parentNode,
        address:string = parent.getElementsByClassName("read-only-status")[0].previousSibling.textContent,
        shares:userShares = browser.users.localhost.shares,
        length:number = shares.length;
    let a:number = 0;
    parent.parentNode.removeChild(parent);
    do {
        if (shares[a].name === address) {
            shares.splice(a, 1);
            break;
        }
        a = a + 1;
    } while (a < length);
    network.storage("users");
};

/* Displays a list of shared items for each user */
share.modal = function local_shares_modal(event:MouseEvent, user?:string, configuration?:ui_modal):void {
    const userKeys:string[] = Object.keys(browser.users),
        keyLength:number = userKeys.length;
    let users:HTMLElement;
    if (user === undefined) {
        user = "";
    } else if (typeof user === "string" && user.indexOf("@localhost") === user.length - 10) {
        user = "localhost";
    }
    users = share.content(user);
    if (keyLength === 1 && browser.users.localhost.shares.length === 0) {
        modal.create({
            agent: user,
            content: users,
            inputs: ["close", "maximize", "minimize"],
            read_only: false,
            title: "⌘ All Shares",
            type: "shares",
            width: 800
        });
    } else {
        const title:string = (user === "")
            ? "⌘ All Shares"
            : `⌘ Shares for user - ${user}`;
        if (configuration === undefined || configuration === null) {
            configuration = {
                agent: user,
                content: users,
                read_only: false,
                title: title,
                type: "shares",
                width: 800
            };
        } else {
            configuration.content = users;
            configuration.title = title;
            configuration.type = "shares";
        }
        configuration.text_value = user;
        configuration.inputs = ["close", "maximize", "minimize"];
        modal.create(configuration);
    }
};

/* Toggle a share between read only and full access */
share.readOnly = function local_share_readOnly(event:MouseEvent):void {
    const element:HTMLElement = <HTMLElement>event.srcElement || <HTMLElement>event.target,
        parent:HTMLElement = <HTMLElement>element.parentNode,
        address:string = parent.getElementsByClassName("read-only-status")[0].previousSibling.textContent,
        shares:userShares = browser.users.localhost.shares,
        length:number = shares.length,
        span:HTMLElement = <HTMLElement>parent.getElementsByClassName("read-only-status")[0];
    let a:number = 0;
    do {
        if (shares[a].name === address) {
            if (shares[a].readOnly === true) {
                shares[a].readOnly = false;
            } else {
                shares[a].readOnly = true;
            }
            break;
        }
        a = a + 1;
    } while (a < length);
    if (element.getAttribute("class") === "grant-full-access") {
        element.setAttribute("class", "make-read-only");
        parent.setAttribute("class", "localhost full-access");
        element.innerHTML = "Make Read Only";
        span.innerHTML = "(Full Access)";
    } else {
        element.setAttribute("class", "grant-full-access");
        parent.setAttribute("class", "localhost");
        element.innerHTML = "Grant Full Access";
        span.innerHTML = "(Read Only)";
    }
    network.storage("users");
};

/* Updates the contents of share modals */
share.update = function local_share_update(user:string, shares:userShares|"deleted", id?:string):void {
    let a:number = 0,
        b:number = 0,
        shareBest:number = -1,
        shareTop:number = -1,
        title:HTMLElement,
        box:HTMLElement,
        body:HTMLElement,
        titleText:string,
        parentDirectory:HTMLElement,
        back:HTMLElement,
        header:HTMLElement,
        headings:HTMLCollectionOf<HTMLElement>,
        close:HTMLButtonElement,
        address:string,
        fileShares:boolean = false;
    const modals:string[] = (id === undefined)
            ? Object.keys(browser.data.modals)
            : [id],
        modalLength:number = modals.length,
        shareLength:number = (shares === "deleted")
            ? 0
            : shares.length,
        windows:boolean = (function local_util_shareUpdate_windows():boolean {
            if (shares === "deleted" || shareLength < 1) {
                return false;
            }
            do {
                if (shares[b].type === "directory" || shares[b].type === "file" || shares[b].type === "link") {
                    fileShares = true;
                    if (shares[0].name.charAt(0) === "\\" || (/^\w:\\/).test(shares[0].name) === true) {
                        return true;
                    }
                    return false;
                }
                b = b + 1;
            } while (b < shareLength);
            return false;
        }());
    if (shares !== "deleted") {
        browser.users[user].shares = shares;
    }
    do {
        box = document.getElementById(modals[a]);
        if (browser.data.modals[modals[a]].type === "shares" && (browser.data.modals[modals[a]].agent === "" || browser.data.modals[modals[a]].agent === user)) {
            if (shares === "deleted") {
                if (browser.data.modals[modals[a]].agent === user) {
                    close = <HTMLButtonElement>box.getElementsByClassName("close")[0];
                    close.click();
                } else {
                    body = <HTMLElement>box.getElementsByClassName("body")[0];
                    headings = body.getElementsByTagName("h3");
                    b = headings.length;
                    do {
                        b = b - 1;
                        if (headings[b].innerHTML === user) {
                            headings[b].parentNode.parentNode.removeChild(headings[b].parentNode);
                            break;
                        }
                    } while (b > 0);
                }
            } else {
                body = <HTMLElement>box.getElementsByClassName("body")[0];
                body.innerHTML = "";
                body.appendChild(share.content(browser.data.modals[modals[a]].agent));
            }
        } else if (fileShares === true && browser.data.modals[modals[a]].type === "fileNavigate" && browser.data.modals[modals[a]].agent === user) {
            if (shares === "deleted") {
                close = <HTMLButtonElement>box.getElementsByClassName("close")[0];
                close.click();
            } else if (shareLength > 0) {
                b = 0;
                shareBest = -1;
                shareTop = -1;
                title = <HTMLElement>box.getElementsByClassName("heading")[0].getElementsByTagName("button")[0];
                titleText = title.innerHTML;
                parentDirectory = <HTMLElement>box.getElementsByClassName("parentDirectory")[0];
                back = <HTMLElement>box.getElementsByClassName("backDirectory")[0];
                header = <HTMLElement>parentDirectory.parentNode;
                address = browser.data.modals[modals[a]].text_value;
                do {
                    if (address.indexOf(shares[b].name) === 0 || (windows === true && address.toLowerCase().indexOf(shares[b].name.toLowerCase()) === 0)) {
                        if (shareBest < 0) {
                            shareBest = b;
                            shareTop = b;
                        }
                        if (shares[b].name.length > shares[shareBest].name.length) {
                            shareBest = b;
                        } else if (shares[b].name.length < shares[shareTop].name.length) {
                            shareTop = b;
                        }
                    }
                    b = b + 1;
                } while (b < shareLength);
                if (shareBest > -1) {
                    if (browser.data.modals[box.getAttribute("id")].agent !== "localhost") {
                        if (shares[shareBest].readOnly === true) {
                            titleText = titleText.replace(/\s+(\(Read\s+Only\)\s+)?-\s+/, " (Read Only) - ");
                            title.innerHTML = titleText;
                            browser.data.modals[modals[a]].title = titleText;
                            browser.data.modals[modals[a]].read_only = true;
                        } else {
                            titleText = titleText.replace(" (Read Only)", "");
                            title.innerHTML = titleText;
                            browser.data.modals[modals[a]].title = titleText;
                            browser.data.modals[modals[a]].read_only = false;
                        }
                        if (address === shares[shareTop].name || (windows === true && address.toLowerCase() === shares[shareTop].name.toLowerCase())) {
                            parentDirectory.style.display = "none";
                            back.style.marginLeft = "-6em";
                            header.style.paddingLeft = "10.5em";
                        } else {
                            parentDirectory.style.display = "inline-block";
                            back.style.marginLeft = "-9em";
                            header.style.paddingLeft = "15em";
                        }
                    }
                }
            }
        }
        a = a + 1;
    } while (a < modalLength);
};

export default share;