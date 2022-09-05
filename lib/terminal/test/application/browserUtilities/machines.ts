/* lib/terminal/test/application/browserUtilities/machines - An object expressing a map of the various remote machines. */

import { CpuInfo, cpus } from "os";

const cpu:CpuInfo[] = cpus(),
    name:string = (cpu[0].model.indexOf("E5-1660") > 0)
        ? "desktop"
        : "laptop",
    machines:testBrowserMachines = {
        desktop: {
            self: {
                ip: "192.168.56.1",
                port: 443,
                secure: true
            },
            VM1: {
                ip: "192.168.56.101",
                port: 443,
                secure: true
            },
            VM2: {
                ip: "192.168.56.102",
                port: 443,
                secure: true
            },
            VM3: {
                ip: "192.168.56.103",
                port: 443,
                secure: true
            },
            VM4: {
                ip: "192.168.56.104",
                port: 443,
                secure: true
            }
        },
        laptop: {
            self: {
                ip: "192.168.56.1",
                port: 443,
                secure: true
            },
            VM1: {
                ip: "192.168.56.125",
                port: 443,
                secure: true
            },
            VM2: {
                ip: "192.168.56.124",
                port: 443,
                secure: true
            },
            VM3: {
                ip: "192.168.56.123",
                port: 443,
                secure: true
            },
            VM4: {
                ip: "192.168.56.122",
                port: 443,
                secure: true
            }
        }
    };

export default machines[name];