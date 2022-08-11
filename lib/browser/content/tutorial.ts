/* lib/browser/content/tutorial - An interactive tutorial explaining the application. */

import browser from "../utilities/browser.js";
import modal from "../utilities/modal.js";
import network from "../utilities/network.js";
import remote from "../utilities/remote.js";

const tutorial = function browser_content_tutorial():void {
    let index:number = 0,
        delay:number,
        eventName:string,
        action:(event:Event) => void = null;
    const tutorialData:tutorialData[] = [
            {
                description: [
                    ["h4", "Notes"],
                    ["p", "This is an interactive tutorial designed to guide you through various basic features of the application. You may escape this tutorial at any time by <strong>clicking</strong> the <strong>close button</strong> on the top right corner of this modal."],
                    ["p", "At each step in the tutorial focus will be shifted to the area of concentration which will also be marked by a brightly colored dashed outline."],
                    ["p", "You may skip any step in this tutorial by pressing the <strong>ESC</strong> key on your keyboard. If that fails to work click anywhere in the application and try again as focus was shifted."],
                    ["hr", ""],
                    ["h4", "Step 1: Access the main menu"],
                    ["p", "For the first step please click the <strong>main menu button</strong> at the top left corner of the application window."]
                ],
                event: "click",
                node: [
                    ["getElementById", "menuToggle", null]
                ],
                title: "Welcome to Share File Systems"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> on the <strong>File Navigator button</strong> from the main menu to open a File Navigate modal."]
                ],
                event: "click",
                node: [
                    ["getElementById", "fileNavigator", null]
                ],
                title: "Open a File Navigate modal"
            },
            {
                description: [
                    ["p", "This tutorial messaging is likely overlapping our File Navigator modal, so let's move it out of the way."],
                    ["p", "If you are a not a mouse user press the <strong>ESC</strong> key to move to the next tutorial step."]
                ],
                event: "mouseup",
                node: [
                    ["getModalsByModalType", "document", -1],
                    ["getElementsByClassName", "heading", 0],
                    ["getElementsByTagName", "button", 0]
                ],
                title: "Move a modal"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> onto the <strong>address bar</strong> of the file navigator modal."],
                    ["p", "In this address field you may freely type a file system path to display another file system location. After typing in the new address press the <em>Enter</em> key to change the file system location."],
                    ["p", "Preceding this address field are three buttons: Back, Reload, and Parent."],
                    ["ul", null],
                    ["li", "The <em>Back</em> button returns the file navigator modal to a prior location."],
                    ["li", "The <em>Reload</em> button refreshes the contents of the file navigator modal at the current location."],
                    ["li", "The <em>Parent</em> button directs the modal to the parent directory."],
                    [null, null],
                    ["p", "To activate a file system artifact either double click it with your mouse or select it and press the Enter key. Activation like this fails if more than one file system artifact is selected. If the file system item is a directory you navigate into that directory, otherwise the item is executed by the default application for that file type in the operating system. If activating a file from a remote device or user it is copied to the local device and then executed, where that download location is available to change in the configuration modal."]
                ],
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", -1],
                    ["getElementsByClassName", "fileAddress", 0],
                    ["getElementsByTagName", "input", 0]
                ],
                title: "Let's look at file navigation"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> onto the <strong>search bar</strong> of the file navigator modal."],
                    ["p", "The search field expands when in focus and returns to a small size when focus is lost allowing enough space to type longer search queries."],
                    ["p", "Search supports three different search modes. All descending files and directories from the given location are searched."],
                    ["ul", null],
                    ["li", "The default search text is executed as a fragment where matching files and directories contain that fragment at any position."],
                    ["li", "Any search that begins with a <strong>!</strong> (exclamation character) is a negative search that returns results not containing the search fragment at any position of the file or directory name."],
                    ["li", "Search fragments that begin and end with a <strong>/</strong> (forward slash character) are converted to a regular expression that allows searching by complex patterns. Some examples include searching for files using social security numbers or search for files that start or end with a given set of characters and are a certain character length."],
                    [null, null],
                    ["p", "Wildcards, such as <em>*</em> in Windows searches, are not supported."]
                ],
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", -1],
                    ["getElementsByClassName", "fileSearch", 0],
                    ["getElementsByTagName", "input", 0]
                ],
                title: "File system search"
            },
            {
                description: [
                    ["p", "At any time view the contents of a directory by <strong>clicking</strong> on the <strong>expansion button</strong>. This allows viewing a child directory contents without moving from the current directory location."]
                ],
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", -1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByClassName", "expansion", 0]
                ],
                title: "Expand a directory"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> on the <strong>first file list item</strong> in the file list to select it."],
                    ["p", "Multiple items may be manually selected by holding the <strong>CTRL</strong> keyboard key and clicking on other file list items. To select a range of items hold the <strong>Shift</strong> keyboard key and select a different file list item."],
                    ["p", "Execute an artifact by double clicking it or selecting it and pressing the <strong>Enter</strong> keyboard key if only a single item is selected. If the artifact is a directory the file navigator modal changes to that directory's location. Other artifacts open into operating system's default application for the given file type."]
                ],
                event: "click",
                node: [
                    ["getModalsByModalType", "fileNavigate", -1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                title: "Select an artifact"
            },
            {
                description: [
                    ["p", "<strong>Right click</strong> on the <strong>selected file list item</strong> to display the context menu. The options available in the context menu differ by area of focus:"],
                    ["ul", null],
                    ["li", "File list (outside file list item)"],
                    ["li", "Directory"],
                    ["li", "File"],
                    [null, null],
                    ["p", "Current context menu options:"],
                    ["ul", null],
                    ["li", "<strong>Details</strong> - If used on a file this provides file size and modified, accessed, and created (MAC) date time groups. If used on a directory it provides the total size of all descendant files, MAC date groups, a count of descendant file system artifacts, and shows up to the 100 largest files, and up to the 100 most recently updated files."],
                    ["li", "<strong>Share</strong> - Allows access to a file system artifact by another user."],
                    ["li", "<strong>Edit File as Text</strong> - Displays the contents of a file converted to UTF8 text into a textarea and allows saving changes to that file's contents."],
                    ["li", "<strong>Hash</strong> - Displays a cryptographic hash of the file system artifact. The choice of hash functions is available in the application's configuration options (available from the main menu), but defaults to SHA3-512."],
                    ["li", "<strong>Base64</strong> - Displays the contents of a file converted to base64 text encoding in UTF8."],
                    ["li", "<strong>New Directory</strong> - Creates a new directory in a name you specify."],
                    ["li", "<strong>New File</strong> - Creates a new file in a name you specify."],
                    ["li", "<strong>Copy</strong> - Copies file system artifact locations to the application's clipboard."],
                    ["li", "<strong>Cut</strong> - Same as copy, except that selected artifacts will are pending deletion upon paste."],
                    ["li", "<strong>Paste</strong> - Writes file system artifacts to the given location from the application's clipboard. This option is disabled if the clipboard is empty."],
                    ["li", "<strong>Rename</strong> - Allows renaming of a file system artifact. This option is not available if multiple file system artifacts are selected."],
                    ["li", "<strong>Destroy</strong> - Removes the selected file system artifacts."]

                ],
                event: "contextmenu",
                node: [
                    ["getModalsByModalType", "fileNavigate", -1],
                    ["getElementsByClassName", "fileList", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByTagName", "p", 0]
                ],
                title: "Display the context menu"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> the <strong>Share button</strong> from the context menu."],
                    ["p", "Sharing allows other users access to your resources. There is no access restriction upon other personal devices, so this restriction only applies to other persons."],
                    ["p", "All shares default to a <em>read only</em> status."]
                ],
                event: "click",
                node: [
                    ["getElementById", "contextMenu", null],
                    ["getElementsByTagName", "li", 1],
                    ["getElementsByTagName", "button", 0]
                ],
                title: "Share a file system artifact"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> the <strong>All Shares button</strong> located on the right side of the application. This modal lists shares from all devices and users."],
                    ["p", "There are other buttons below the <em>All Shares button</em> for listing information for just devices, users, or any specific device or user. More information is available for device shares including hardware details."]
                ],
                event: "click",
                node: [
                    ["getElementById", "agentList", null],
                    ["getElementsByTagName", "button", 0]
                ],
                title: "Access the shares modal"
            },
            {
                description: [
                    ["p", "In the shares modal the recently shared file system artifact is listed as an item under the local device."],
                    ["p", "By default shares are read only which do not allow any modifications such as write files, creating directories, rename things, or deleting things. See that the last button associated with this share says <em>Grant Full Access</em>. Clicking that button allows remote users to create, delete, and modify file system items at that location. Read only access is restored by simply clicking that button again. Changes in shares and share status occur in real time and are sent to remote devices and users immediately."],
                    ["p", "<strong>Click</strong> the <strong>share</strong> to move to the next step."]
                ],
                event: "click",
                node: [
                    ["getModalsByModalType", "shares", -1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "ul", 0],
                    ["getElementsByTagName", "ul", 0],
                    ["getElementsByTagName", "li", -1]
                ],
                title: "View the shared file system artifact"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> the <strong>file system address</strong> of the given share."],
                    ["p", "This opens the file system to the given share of the device or user represented by the current modal, which allows navigating the file system of the remote device or user. With the file system open for a remote device or user you can easily copy and paste file system artifacts exactly the same as moving them from one directory to another."],
                    ["p", "Copy and paste works through using the right-click context menu, familiar keyboard shortcut combinations, as well as drag and drop just like using your favorite operating system. Multiple file system artifacts can be moved with a single copy and paste event. Even across a network, <strong>file integrity is guaranteed</strong> by comparing file hash before and after the file transfer."],
                    ["p", "Device share types feature a <em>File System Root</em> button as a convenience to access the top of the file system, because devices are not security restricted only to the availability of shares the way users are."]
                ],
                event: "click",
                node: [
                    ["getModalsByModalType", "shares", -1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "ul", 0],
                    ["getElementsByTagName", "li", 0],
                    ["getElementsByClassName", "device-share", 0]
                ],
                title: "Open the file system from a share"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> the <strong>delete this share button</strong> which is the first button in the share comprising a large red X like character."]
                ],
                event: "click",
                node: [
                    ["getModalsByModalType", "shares", -1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "ul", 0],
                    ["getElementsByTagName", "ul", 0],
                    ["getElementsByTagName", "li", -1],
                    ["getElementsByTagName", "button", 0]
                ],
                title: "Delete share"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> on the <strong>main menu button</strong> on the top left corner of the application."]
                ],
                event: "click",
                node: [
                    ["getElementById", "menuToggle", null]
                ],
                title: "Return to the main menu for the Text Pad"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> on the <strong>Text Pad button</strong> to open a text pad application."]
                ],
                event: "click",
                node: [
                    ["getElementById", "textPad", null]
                ],
                title: "Open a Text Pad"
            },
            {
                description: [
                    ["p", "<strong>Type</strong> any text into the body of the <strong>Text Pad</strong> application."],
                    ["p", "The typed text content of the text pad automatically saves when either the current Text Pad application loses focus or after 15 seconds of inactivity. Simply refresh the page and the text content will still be there."]
                ],
                event: "keyup",
                node: [
                    ["getModalsByModalType", "textPad", -1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "textarea", 0]
                ],
                title: "Type into the Text Pad"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> on the <strong>main menu button</strong> on the top left corner of the application."]
                ],
                event: "click",
                node: [
                    ["getElementById", "menuToggle", null]
                ],
                title: "Return to the main menu for the Invitation modal"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> on the <strong>Add Device or Invite User button</strong> to open an Invitation modal."]
                ],
                event: "click",
                node: [
                    ["getElementById", "agent-invite", null]
                ],
                title: "Open an Invitation modal"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> on the <strong>Personal Device radio button</strong>."],
                    ["p", "Personal devices enjoy no sharing restrictions with intention to share across physical devices owned by the same person. This relationship allows full access to the file system and all available capabilities."]
                ],
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-request", -1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "input", 0]
                ],
                title: "Personal Device"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> on the <strong>User radio button</strong>."],
                    ["p", "Users can only access resources that are explicitly shared and all file system shares are read-only by default."]
                ],
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-request", -1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "input", 1]
                ],
                title: "User"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> on the <strong>IP Address input</strong>."],
                    ["p", "The application supports both IPv6 and IPv4 with preference to IPv6. Don't worry if you don't know the difference. IP Addresses function as your online postal address in that they convey your device's logical location on the network and/or internet."]
                ],
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-request", -1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "input", 2]
                ],
                title: "IP Address"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> on the <strong>Invitation Message input</strong>."],
                    ["p", "A text message is optional, but strongly recommended so the remote user knows who you are."],
                    ["p", "This tutorial intentionally skipped over the field above for <em>port</em>. That field is the service port the remote user/device is listening on and if blank defaults to 443 or 80."]
                ],
                event: "click",
                node: [
                    ["getModalsByModalType", "invite-request", -1],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByTagName", "textarea", 0]
                ],
                title: "Invitation message"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> on the <strong>main menu button</strong> on the top left corner of the application."]
                ],
                event: "click",
                node: [
                    ["getElementById", "menuToggle", null]
                ],
                title: "Return to the main menu for the Configuration modal"
            },
            {
                description: [
                    ["p", "<strong>Click</strong> on the <strong>Configuration button</strong> to open the Configuration modal."]
                ],
                event: "click",
                node: [
                    ["getElementById", "configuration", null]
                ],
                title: "Open the Configuration modal"
            },
            {
                description: [
                    ["p", "The Configuration modal stores all the various settings available to the user."],
                    ["p", "Scroll down to find the color scheme settings. <strong>Click</strong> on the <strong>Dark radio button</strong> to change the color scheme."]
                ],
                event: "click",
                node: [
                    ["getModalsByModalType", "configuration", 0],
                    ["getElementsByClassName", "body", 0],
                    ["getElementsByText", "Dark", 0]
                ],
                title: "Change the color scheme"
            }
        ],
        dataLength:number = tutorialData.length,
        currentNode = function browser_content_tutorial_currentNode(current:HTMLElement):void {
            current.style.outlineColor = "var(--outline)";
            current.style.outlineStyle = "dashed";
            current.style.outlineWidth = "0.2em";
            action = (current === null || current === undefined)
                ? null
                // @ts-ignore - TS cannot resolve a string to a GlobalEventHandlersEventMap object key name
                : current[eventName];
            // @ts-ignore - TS cannot resolve a string to a GlobalEventHandlersEventMap object key name
            current[eventName] = function browser_content_tutorial_content_handler(event:Event):void {
                if (current === undefined) {
                    return;
                }
                current.style.outline = "none";
                if (action !== null && action !== undefined) {
                    action(event);
                }
                // @ts-ignore - TS cannot resolve a string to a GlobalEventHandlersEventMap object key name
                current[eventName] = action;
                nextStep(current);
            };
            current.focus();
        },
        nextStep = function browser_content_tutorial_nextStep(node:HTMLElement):void {
            index = index + 1;
            network.configuration();
            body.innerHTML = "";
            if (index < dataLength) {
                const tutorialContent:Element = content();
                node = remote.node(tutorialData[index].node, null) as HTMLElement;
                currentNode(node);
                if (tutorialContent !== null) {
                    body.appendChild(tutorialContent);
                }
            } else {
                const div:Element = document.createElement("div"),
                    p:Element = document.createElement("p"),
                    heading:Element = document.createElement("h3");
                heading.innerHTML = "Tutorial complete!";
                p.innerHTML = "Please <strong>click the red close button</strong> in the top left corner of this modal to exit the tutorial.";
                div.appendChild(heading);
                div.appendChild(p);
                body.appendChild(div);
                browser.pageBody.onkeydown = null;
            }
        },
        activate:(event:KeyboardEvent) => void = function browser_content_tutorial_document(event:KeyboardEvent):void {
            if (event.key === "Escape") {
                const node:HTMLElement = remote.node(tutorialData[index].node, null) as HTMLElement;
                if (node !== null && node !== undefined) {
                    node.style.outline = "none";
                }
                clearTimeout(delay);
                nextStep(node);
            }
        },
        content = function browser_content_tutorial_content():Element {
            const wrapper:Element = document.createElement("div"),
                heading:Element = document.createElement("h3"),
                dataItem:tutorialData = tutorialData[index],
                node = remote.node(tutorialData[index].node, null) as HTMLElement;
            let parent:Element = wrapper;
            eventName = `on${dataItem.event}`;
            clearTimeout(delay);
            if (node === undefined || node === null) {
                nextStep(node);
                return null;
            }
            heading.innerHTML = (index > 0)
                ? `Step ${index + 1} of ${dataLength}: ${dataItem.title}`
                : dataItem.title;
            wrapper.appendChild(heading);
            dataItem.description.forEach(function browser_content_tutorial_content_description(value:[string, string]):void {
                if (value[0] === null) {
                    parent = parent.parentNode as Element;
                } else {
                    const el:Element = document.createElement(value[0]);
                    parent.appendChild(el);
                    if (value[1] === null) {
                        parent = el;
                    } else {
                        el.innerHTML = value[1];
                    }
                }
            });
            if (dataItem.event === "wait") {
                delay = setTimeout(nextStep, 5000);
            }
            wrapper.setAttribute("class", "document");
            return wrapper;
        },
        modalConfig:config_modal = {
            agent: browser.data.hashDevice,
            agentIdentity: false,
            agentType: "device",
            content: content(),
            height: 600,
            inputs: ["close"],
            move: false,
            read_only: true,
            title: "🗎 Tutorial",
            type: "document"
        },
        contentModal:HTMLElement = modal.content(modalConfig) as HTMLElement,
        close:HTMLElement = contentModal.getElementsByClassName("buttons")[0].getElementsByClassName("close")[0] as HTMLElement,
        body:HTMLElement = contentModal.getElementsByClassName("body")[0] as HTMLElement;
    contentModal.style.zIndex = "10001";
    close.onclick = function browser_content_tutorial_close(event:MouseEvent):void {
        const node = remote.node(tutorialData[index].node, null) as HTMLElement;
        browser.data.tutorial = false;
        browser.pageBody.onkeydown = null;
        if (node !== null) {
            node.style.outlineStyle = "none";
            // @ts-ignore - TS cannot resolve a string to a GlobalEventHandlersEventMap object key name
            node[eventName] = action;
        }
        modal.events.close(event);
    };
    browser.pageBody.onkeydown = activate;
    currentNode(remote.node(tutorialData[0].node, null) as HTMLElement);
};

export default tutorial;