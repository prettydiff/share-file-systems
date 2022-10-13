/* lib/terminal/test/application/browserUtilities/machines - An object expressing a map of the various remote machines. */


const machines:test_browserMachines = {
    self: {
        ip: "192.168.56.1",
        port: 444,
        secure: true
    },
    VM1: {
        ip: "192.168.56.101",
        port: 444,
        secure: true
    },
    VM2: {
        ip: "192.168.56.102",
        port: 444,
        secure: true
    },
    VM3: {
        ip: "192.168.56.103",
        port: 444,
        secure: true
    },
    VM4: {
        ip: "192.168.56.104",
        port: 444,
        secure: true
    }
};

export default machines;