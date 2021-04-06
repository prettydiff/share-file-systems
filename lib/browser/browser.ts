
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
        zIndex: 0
    },
    device: {},
    loadFlag: true,
    localNetwork: (function browser_localNetwork():localNetwork {
        let str:string = document.getElementsByTagName("body")[0].innerHTML,
            pattern:string = "<!--network:";
        str = str.slice(str.indexOf(pattern) + pattern.length);
        str = str.slice(0, str.indexOf("-->"));
        return JSON.parse(str);
    }()),
    message: [],
    pageBody: document.getElementsByTagName("body")[0],
    style: document.createElement("style"),
    testBrowser: null,
    user: {}
};

export default browser;