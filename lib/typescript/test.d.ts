/* lib/typescript/test.d - TypeScript interfaces used test automation. */

import { ServerResponse } from "http";
import { Server } from "net";

declare global {

    // test application
    interface serverOutput {
        agent: string;
        agentType: agentType;
        ports: ports;
        server: Server;
    }
    interface testComplete {
        callback: Function;
        fail: number;
        testType: testListType | "selected";
        total: number;
    }
    interface testEvaluation {
        callback: Function;
        fail: number;
        index: number;
        list: number[];
        test: testItem | testService;
        testType: "service" | "simulation";
        values: [string, string, string];
    }
    interface testExecute {
        complete: Function;
        fail: number;
        index: number;
        list: number[];
    }
    interface testItem {
        artifact?: string;
        command: string;
        file?: string;
        qualifier: qualifier | qualifierFile;
        test: string;
    }
    interface testTypeCollection {
        service: testServiceApplication;
        simulation: testSimulationApplication;
    }
    // ------------------------------------

    // test in browser
    interface testBrowserApplication {
        agent: string;
        args: testBrowserArgs;
        exitMessage: string;
        exitType: 0 | 1;
        index: number;
        ip: string;
        methods: testBrowserMethods;
        port: number;
        remoteAgents: number;
    }
    interface testBrowserArgs {
        callback: (message:string, failCount:number) => void;
        demo: boolean;
        mode: testBrowserMode;
        noClose: boolean;
    }
    interface testBrowserDelay {
        action: () => void;
        browser: boolean;
        delay: number;
        message: string;
    }
    interface testBrowserDOM extends Array<browserDOM> {
        nodeString?: string;
    }
    interface testBrowserEvent {
        coords?: [number, number];
        event: eventName;
        node: testBrowserDOM;
        value?: string;
    }
    interface testBrowserItem {
        delay?: testBrowserTest;
        interaction: testBrowserEvent[];
        machine: string;
        name: string;
        unit: testBrowserTest[];
    }
    interface testBrowserMachines {
        [key:string]: {
            [key:string]: {
                ip: string;
                port: number;
                secure: boolean;
            };
        };
    }
    interface testBrowserTest {
        node: testBrowserDOM;
        qualifier: qualifier;
        target: string[];
        type: "attribute" | "element" | "property";
        value: boolean | number | string | null;
    }
    interface testBrowserTransfer {
        agent: string;
        ip: string;
        port: number;
    }
    interface testModalAddress {
        address: string;
        index: number;
        lastItem: string;
        machine: string;
    }
    // ------------------------------------

    // test services
    interface testServiceApplication {
        addServers?: (callback:Function) => void;
        execute?: (config:testExecute) => void;
        killServers?: (complete:testComplete) => void;
        populate?:() => void;
        serverRemote: {
            device: {
                [key:string]: Server;
            };
            user: {
                [key:string]: Server;
            };
        };
        tests?: testService[];
    }
    interface testServiceShares {
        local?: agentShares;
        remote?: agentShares;
    }
    interface testServiceSettings {
        "settings": {
            data: agents | ui_data;
            response: ServerResponse;
            type: settingsType;
        };
    }
    interface testService {
        artifact?: string;
        command: socketData;
        file?: string;
        name: string;
        qualifier: qualifier;
        shares?: testServiceShares;
        test: heartbeat | service_fileStatus | service_fileSystemDetails | socketData | string;
    }
    // ------------------------------------

    // test terminal command simulations
    interface testSimulationApplication {
        execute?: (config:testExecute) => void;
        tests: testItem[];
    }
    // ------------------------------------
}
