/* lib/typescript/test.d - TypeScript interfaces used test automation. */

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
 * The parameter passed to test/application/complete.ts for completion messaging to the terminal.
 * ```typescript
 * interface testComplete {
 *     callback: testCallback;
 *     failures: number;
 *     testType: testListType | "selected";
 *     total: number;
 * }
 * ``` */
interface testComplete {
    callback: testCallback;
    failures: number;
    testType: testListType | "selected";
    total: number;
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
    test: service_fileSystem_details | service_fileSystem_status | socketData | string;
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
    service: module_test_serviceApplication;
    simulation: module_test_simulationApplication;
}
