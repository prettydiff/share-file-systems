
/* lib/browser/utilities/terminal_send - Transmit terminal IO on a custom socket. */

import browser from "./browser.js";

// cspell: words agenttype

const terminal_send = function browser_utilities_terminalSend(box:modal, command:string, autoComplete:boolean):void {

    // send close signal on modal close
    // capture c + ctrl - without alt or shift

    const agentType:agentType = box.dataset.agenttype as agentType,
        payload:service_terminal = {
            agentRequest: (agentType === "device")
                ? {
                    agent: browser.identity.hashDevice,
                    agentType: "device",
                    share: box.getAttribute("id")
                }
                : {
                    agent: browser.identity.hashUser,
                    agentType: "user"
                },
            agentSource: {
                agent: box.dataset.agent,
                agentType: agentType
            },
            autoComplete: (autoComplete === true)
                ? box.getElementsByTagName("textarea")[0].selectionStart
                : -1,
            directory: box.getElementsByClassName("terminal-cwd")[0].innerHTML,
            id: box.getAttribute("id"),
            instruction: command,
            logs: [],
            target: "agentSource"
        };
    // box.socket.send(JSON.stringify({
    //     data: payload,
    //     service: "terminal"
    // }));
    browser.send(payload, "terminal");
};

export default terminal_send;