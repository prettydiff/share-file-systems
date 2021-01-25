/* lib/terminal/test/samples/browser_machines - An object expressing a map of the various remote machines. */

import { cpus } from "os";

const name:string = (cpus().length > 4)
        ? "desktop"
        : "laptop",
    machines:testBrowserMachines = {
        desktop: {
            self: {
                ip: "192.168.56.1",
                port: 80,
                secure: false
            },
            VM1: {
                ip: "192.168.56.101",
                port: 80,
                secure: false
            },
            VM2: {
                ip: "192.168.56.102",
                port: 80,
                secure: false
            },
            VM3: {
                ip: "192.168.56.103",
                port: 80,
                secure: false
            },
            VM4: {
                ip: "192.168.56.104",
                port: 80,
                secure: false
            }
        },
        laptop: {
            self: {
                ip: "192.168.56.1",
                port: 80,
                secure: false
            },
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
        }
    };

export default machines[name];