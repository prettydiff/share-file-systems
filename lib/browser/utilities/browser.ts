
/* lib/browser/utilities/browser - A list of declared variables globally available to the browser instance of the application. */

import uiDefault from "../../common/uiDefault.js";

const browser:browser = {
    agents: {
        device: {},
        user: {}
    },
    content: document.getElementById("content-area"),
    identity: {
        hashDevice: "",
        hashUser: "",
        nameDevice: "",
        nameUser: "",
        secretDevice: "",
        secretUser: ""
    },
    loading: true,
    loadQueue: [],
    network: null,
    message: [],
    pageBody: document.getElementsByTagName("body")[0],
    scrollbar: 0,
    socket: null,
    style: document.createElement("style"),
    testBrowser: null,
    title: "",
    ui: uiDefault,
    visible: true
};

export default browser;