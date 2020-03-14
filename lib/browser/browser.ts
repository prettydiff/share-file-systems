
/* lib/browser/browser - A list of declared variables globally available to the browser instance of the application. */
const browser:browser = {
    content: document.getElementById("content-area"),
    data: {
        audio: true,
        brotli: 7,
        color: "default",
        hash: "sha3-512",
        modals: {},
        modalTypes: [],
        name: "",
        zIndex: 0
    },
    loadTest: true,
    localNetwork: (function local_network():localNetwork {
        let str:string = document.getElementsByTagName("body")[0].innerHTML,
            pattern:string = "<!--network:";
        str = str.slice(str.indexOf(pattern) + pattern.length);
        str = str.slice(0, str.indexOf("-->"));
        return JSON.parse(str);
    }()),
    messages: {
        status: [],
        users: [],
        errors: []
    },
    pageBody: document.getElementsByTagName("body")[0],
    style: document.createElement("style"),
    users: {
        localhost: {
            color: ["#fff", "#eee"],
            shares: []
        }
    }
};

export default browser;