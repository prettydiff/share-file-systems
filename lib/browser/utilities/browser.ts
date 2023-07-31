
/* lib/browser/utilities/browser - A list of declared variables globally available to the browser instance of the application. */
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
    ui: {
        audio: true,
        brotli: 7,
        color: "default",
        colors: {
            device: {},
            user: {}
        },
        fileSort: "file-system-type",
        hashType: "sha3-512",
        minimizeAll: false,
        modals: {},
        modalTypes: [],
        statusTime: 15000,
        storage: "",
        tutorial: true,
        zIndex: 0
    },
    visible: true
};

export default browser;