
/* lib/browser/utilities/browser - A list of declared variables globally available to the browser instance of the application. */
const browser:browser = {
    content: document.getElementById("content-area"),
    data: {
        audio: true,
        brotli: 7,
        color: "default",
        colors: {
            device: {},
            user: {}
        },
        fileSort: "file-system-type",
        hashDevice: "",
        hashType: "sha3-512",
        hashUser: "",
        minimizeAll: false,
        modals: {},
        modalTypes: [],
        nameDevice: "",
        nameUser: "",
        statusTime: 15000,
        storage: "",
        tutorial: true,
        zIndex: 0
    },
    device: {},
    loading: true,
    network: null,
    message: [],
    pageBody: document.getElementsByTagName("body")[0],
    socket: null,
    style: document.createElement("style"),
    testBrowser: null,
    title: "",
    user: {},
    visible: true
};

export default browser;