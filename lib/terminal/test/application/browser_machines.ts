/* lib/terminal/test/samples/browser_machines - An object expressing a map of the various remote machines. */

const machines:testBrowserMachines = {
    VM1: {
        ip: "192.168.56.125",
        port: 80,
        secure: false
    },
    VM2: {
        ip: "192.168.56.124",
        port: 80,
        secure: false
    },
    VM3: {
        ip: "192.168.56.123",
        port: 80,
        secure: false
    },
    VM4: {
        ip: "192.168.56.122",
        port: 80,
        secure: false
    }
};

export default machines;