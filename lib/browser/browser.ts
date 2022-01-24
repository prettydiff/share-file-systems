
/* lib/browser/browser - A list of declared variables globally available to the browser instance of the application. */
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
        hashDevice: "",
        hashType: "sha3-512",
        hashUser: "",
        modals: {},
        modalTypes: [],
        nameDevice: "",
        nameUser: "",
        storage: "",
        tutorial: true,
        zIndex: 0
    },
    device: {},
    loadComplete: null,
    loading: true,
    localNetwork: null,
    message: [],
    pageBody: document.getElementsByTagName("body")[0],
    socket: null,
    style: document.createElement("style"),
    testBrowser: null,
    user: {}
};

export default browser;