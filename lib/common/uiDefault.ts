
/* lib/common/uiDefault - A storage of an object with default values globally reused. */

const uiDefault:ui_data = {
    audio: true,
    brotli: 7,
    color: "default",
    colorBackgrounds: {
        "blush":   ["rgba(255,255,255,0.5)", "rgba(224,200,200,0.75)", "blur(2em)"],
        "dark":    ["rgba(32,32,32,0.75)",   "rgba(16,16,16,0.75)",    "blur(2em)"],
        "default": ["rgba(255,255,255,0.5)", "rgba(216,216,216,0.75)", "blur(2em)"]
    },
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
};

export default uiDefault;