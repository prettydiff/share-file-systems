/* lib/typescript/test.d - TypeScript interfaces used test automation. */

import { Server } from "net";

declare global {

    // test application

    /**
     * The parameter passed to test/application/complete.ts for completion messaging to the terminal.
     * ```typescript
     * interface testComplete {
     *     callback: (message:string, failCount:number) => void;
     *     fail: number;
     *     testType: testListType | "selected";
     *     total: number;
     * }
     * ``` */
    interface testComplete {
        callback: (message:string, failCount:number) => void;
        fail: number;
        testType: testListType | "selected";
        total: number;
    }

    /**
     * Configuration object passed test/application/evaluation.ts.
     * ```typescript
     * interface testEvaluation {
     *     callback: (message:string, failCount:number) => void;
     *     fail: number;
     *     index: number;
     *     list: number[];
     *     test: testItem | testService;
     *     testType: "service" | "simulation";
     *     values: [string, string, string];
     * }
     * ``` */
    interface testEvaluation {
        callback: (message:string, failCount:number) => void;
        fail: number;
        index: number;
        list: number[];
        test: testItem | testService;
        testType: "service" | "simulation";
        values: [string, string, string];
    }

    /**
     * Provides the guidance to launch testing for *service* and *simulation* types of test automation.
     * ```typescript
     * interface testExecute {
     *     complete: () => void;
     *     fail: number;
     *     index: number;
     *     list: number[];
     * }
     * ``` */
    interface testExecute {
        complete: (message:string, failCount:number) => void;
        fail: number;
        index: number;
        list: number[];
    }

    /**
     * A storage of test items for *service* and *simulation* types of test automation used in iterating and evaluating test items.
     * ```typescript
     * interface testTypeCollection {
     *     service: testServiceApplication;
     *     simulation: testSimulationApplication;
     * }
     * ``` */
    interface testTypeCollection {
        service: testServiceApplication;
        simulation: testSimulationApplication;
    }
    // ------------------------------------

    // test in browser

    /**
     * Configuration object from the *execute* method of the browser application logic.
     * ```typescript
     * interface testBrowserArgs {
     *     callback: (message:string, failCount:number) => void;
     *     demo: boolean;
     *     mode: testBrowserMode;
     *     noClose: boolean;
     * }
     * ``` */
    interface testBrowserArgs {
        callback: (message:string, failCount:number) => void;
        demo: boolean;
        mode: testBrowserMode;
        noClose: boolean;
    }

    /**
     * Configuration object for a delay method necessary to eliminate race conditions and impose arbitrary delays.
     * ```typescript
     * interface testBrowserDelay {
     *     action: () => void;
     *     browser: boolean;
     *     delay: number;
     *     message: string;
     * }
     * ``` */
    interface testBrowserDelay {
        action: () => void;
        browser: boolean;
        delay: number;
        message: string;
    }

    /**
     * Extends the *browserDOM* array, which provides a list of methods to walk the DOM, with a property that allows conversion of the logic into a string for human reading.
     * ```typescript
     * interface testBrowserDOM extends Array<browserDOM> {
     *     nodeString?: string;
     * }
     * ``` */
    interface testBrowserDOM extends Array<browserDOM> {
        nodeString?: string;
    }

    /**
     * A means to describe event interaction item to execute in the browser.
     * ```typescript
     * interface testBrowserEvent {
     *     coords?: [number, number];
     *     event: eventName;
     *     node: testBrowserDOM;
     *     value?: string;
     * }
     * ``` */
    interface testBrowserEvent {
        coords?: [number, number];
        event: eventName;
        node: testBrowserDOM;
        value?: string;
    }

    /**
     * A single test item to execute and evaluate in the browser comprising 0 or more points of interaction and 0 or more points of evaluation.
     * ```typescript
     * interface testBrowserItem {
     *     delay?: testBrowserTest;
     *     interaction: testBrowserEvent[];
     *     machine: string;
     *     name: string;
     *     unit: testBrowserTest[];
     * }
     * ``` */
    interface testBrowserItem {
        delay?: testBrowserTest;
        interaction: testBrowserEvent[];
        machine: string;
        name: string;
        unit: testBrowserTest[];
    }

    /**
     * Describes a storage of virtual machines to simulate testing against remote agents across a network.
     * ```typescript
     * interface testBrowserMachines {
     *     [key:string]: {
     *         [key:string]: {
     *             ip: string;
     *             port: number;
     *             secure: boolean;
     *         };
     *     };
     * }
     * ``` */
    interface testBrowserMachines {
        [key:string]: {
            [key:string]: {
                ip: string;
                port: number;
                secure: boolean;
            };
        };
    }

    /**
     * A point of evaluation for a *testBrowserItem* instance.
     * ```typescript
     * interface testBrowserTest {
     *     node: testBrowserDOM;
     *     qualifier: qualifier;
     *     target: string[];
     *     type: "attribute" | "element" | "property";
     *     value: boolean | number | string | null;
     * }
     * ``` */
    interface testBrowserTest {
        node: testBrowserDOM;
        qualifier: qualifier;
        target: string[];
        type: "attribute" | "element" | "property";
        value: boolean | number | string | null;
    }

    /**
     * Provides a means of transforming a remote machine identity into network criteria for sending tests across a network.
     * ```typescript
     * interface testBrowserTransfer {
     *     agent: string;
     *     ip: string;
     *     port: number;
     * }
     * ``` */
    interface testBrowserTransfer {
        agent: string;
        ip: string;
        port: number;
    }

    /**
     * A configuration object for convenience function test/application/browserUtilities/modalAddress.ts.
     * ```typescript
     * interface testModalAddress {
     *     address: string;
     *     index: number;
     *     lastItem: string;
     *     machine: string;
     * }
     * ``` */
    interface testModalAddress {
        address: string;
        index: number;
        lastItem: string;
        machine: string;
    }
    // ------------------------------------

    // test services

    /**
     * The *service* test type application described as an object.
     * ```typescript
     * interface testServiceApplication {
     *     addServers?: (callback:() => void) => void;
     *     execute?: (config:testExecute) => void;
     *     killServers?: (complete:testComplete) => void;
     *     populate?:() => void;
     *     serverRemote: {
     *         device: {
     *             [key:string]: Server;
     *         };
     *         user: {
     *             [key:string]: Server;
     *         };
     *     };
     *     tests?: testService[];
     * }
     * ``` */
    interface testServiceApplication {
        addServers?: (callback:() => void) => void;
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

    /**
     * Defines the test item list for *service* type test automation.
     * ```typescript
     * interface testService {
     *     artifact?: string;
     *     command: socketData;
     *     file?: string;
     *     name: string;
     *     qualifier: qualifier;
     *     shares?: {
     *         local?: agentShares;
     *         remote?: agentShares;
     *     };
     *     test: service_fileStatus | service_fileSystemDetails | socketData | string;
     * }
     * ``` */
    interface testService {
        artifact?: string;
        command: socketData;
        file?: string;
        name: string;
        qualifier: qualifier;
        shares?: {
            local?: agentShares;
            remote?: agentShares;
        };
        test: service_fileStatus | service_fileSystemDetails | socketData | string;
    }
    // ------------------------------------

    // test terminal command simulations

    /**
     * Defines a single test entry in the simulation test type.
     * ```typescript
     * interface testItem {
     *     artifact?: string;
     *     command: string;
     *     file?: string;
     *     qualifier: qualifier | qualifierFile;
     *     test: string;
     * }
     * ``` */
    interface testItem {
        artifact?: string;
        command: string;
        file?: string;
        qualifier: qualifier | qualifierFile;
        test: string;
    }

    /**
     * Defines the *simulation* type test application as an object.
     * ```typescript
     * interface testSimulationApplication {
     *     execute?: (config:testExecute) => void;
     *     tests: testItem[];
     * }
     * ``` */
    interface testSimulationApplication {
        execute?: (config:testExecute) => void;
        tests: testItem[];
    }
    // ------------------------------------
}
