/* lib/typescript/test.d - TypeScript interfaces used test automation. */

import { ServerResponse } from "http";
declare global {

    // test application
    interface serverOutput {
        agent: string;
        agentType: agentType;
        server: httpServer;
        webPort: number;
        wsPort: number;
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
        test: testItem;
        testType: testListType;
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
        methods: {
            execute: (args:testBrowserArgs) => void;
            exit: (index:number) => void;
            iterate: (index:number) => void;
            remote: (item:testBrowserRoute, serverResponse:ServerResponse) => void;
            remoteClose: (exit:string, serverResponse:ServerResponse) => void;
            remoteReturn: (item:testBrowserRoute) => void;
            reset: (serverResponse:ServerResponse) => void;
            resetComplete: (serverResponse:ServerResponse) => void;
            resetResponse: (data:testBrowserRoute, serverResponse:ServerResponse) => void;
            result: (item:testBrowserRoute, serverResponse:ServerResponse) => void;
            route: (data:testBrowserRoute, serverResponse:ServerResponse) => void;
        };
        port: number;
        remoteAgents: number;
        server?: httpServer;
        transmissionReturned: number;
        transmissionSent: number;
    }
    interface testBrowserArgs {
        callback: (message:string, failCount:number) => void;
        demo: boolean;
        mode: testBrowserMode;
        noClose: boolean;
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
            ip: string;
            port: number;
            secure: boolean;
        }
    }
    interface testBrowserRoute {
        action: testBrowserAction;
        exit: string;
        index: number;
        result: [boolean, string, string][];
        test: testBrowserItem;
        transfer: testBrowserTransfer;
    }
    interface testBrowserTest {
        node: testBrowserDOM;
        qualifier: qualifier;
        target: string[];
        type: "attribute" | "element" | "property";
        value: boolean | null | number | string;
    }
    interface testBrowserTransfer {
        agent: string;
        ip: string;
        port: number;
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
                [key:string]: httpServer;
            };
            user: {
                [key:string]: httpServer;
            };
        };
        tests?: testServiceInstance[];
    }
    interface testServiceInstance {
        artifact?: string;
        command: any;
        file?: string;
        name: string;
        qualifier: qualifier;
        shares?: testServiceShares;
        test: object | string;
    }
    interface testServiceShares {
        local?: agentShares;
        remote?: agentShares;
    }
    interface testTemplateCopyStatus {
        "file-list-status": copyStatus;
    }
    interface testTemplate {
        command: {
            [key: string]: any;
        };
        name: string;
        qualifier: qualifier;
        test: string;
    }
    interface testTemplateFileService {
        command: {
            "fs": fileService;
        };
        name: string;
        qualifier: qualifier;
        test: testServiceFileTarget;
    }
    interface testTemplateHeartbeatComplete {
        command: {
            "heartbeat-complete": heartbeat;
        };
        name: string;
        qualifier: qualifier;
        test: {
            "heartbeat-status": heartbeat;
        };
    }
    interface testTemplateHeartbeatUpdate {
        command: {
            "heartbeat-update": heartbeatUpdate;
        };
        name: string;
        qualifier: qualifier;
        test: string;
    }
    interface testTemplateInvite extends testTemplate {
        command: {
            "invite": invite;
        };
    }
    interface testTemplateStorage extends testTemplate {
        command: {
            "storage": {
                data: agents | ui_data;
                response: ServerResponse;
                type: storageType;
            };
        };
    }
    interface testTemplateUpdateRemote extends testTemplate{
        command: {
            "fs-update-remote": fsUpdateRemote;
        };
    }
    // ------------------------------------

    // test terminal command simulations
    interface testSimulationApplication {
        execute?: (config:testExecute) => void;
        tests: testItem[]
    }
    // ------------------------------------
}
