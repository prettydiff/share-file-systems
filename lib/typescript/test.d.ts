/* lib/typescript/test.d - TypeScript interfaces used test automation. */

/**
 * Extends the *browserDOM* array, which provides a list of methods to walk the DOM, with a property that allows conversion of the logic into a string for human reading.
 * ```typescript
 * interface test_browserDOM extends Array<browserDOM> {
 *     nodeString?: string;
 * }
 * ``` */
interface test_browserDOM extends Array<browserDOM> {
    nodeString?: string;
}

/**
 * A means to describe event interaction item to execute in the browser.
 * ```typescript
 * interface test_browserEvent {
 *     coords?: [number, number];
 *     event: eventName;
 *     node: test_browserDOM;
 *     value?: string;
 * }
 * ``` */
interface test_browserEvent {
    coords?: [number, number];
    event: eventName;
    node: test_browserDOM;
    value?: string;
}

/**
 * A single test item to execute and evaluate in the browser comprising 0 or more points of interaction and 0 or more points of evaluation.
 * ```typescript
 * interface test_browserItem {
 *     delay?: test_browserTest;
 *     interaction: test_browserEvent[];
 *     machine: string;
 *     name: string;
 *     unit: test_browserTest[];
 * }
 * ``` */
interface test_browserItem {
    delay?: test_browserTest;
    interaction: test_browserEvent[];
    machine: string;
    name: string;
    unit: test_browserTest[];
}

/**
 * Describes a storage of virtual machines to simulate testing against remote agents across a network.
 * ```typescript
 * interface test_browserMachines {
 *     [key:string]: {
 *         ip: string;
 *         port: number;
 *         secure: boolean;
 *     };
 * }
 * ``` */
interface test_browserMachines {
    [key:string]: {
        ip: string;
        port: number;
        secure: boolean;
    };
}

/**
 * A point of evaluation for a *test_browserItem* instance.
 * ```typescript
 * interface test_browserTest {
 *     node: test_browserDOM;
 *     qualifier: qualifier;
 *     target: string[];
 *     type: "attribute" | "element" | "property";
 *     value: boolean | number | string | null;
 * }
 * ``` */
interface test_browserTest {
    node: test_browserDOM;
    qualifier: qualifier;
    target: string[];
    type: "attribute" | "element" | "property";
    value: boolean | number | string | null;
}

/**
 * The parameter passed to test/application/complete.ts for completion messaging to the terminal.
 * ```typescript
 * interface test_complete {
 *     callback: commandCallback;
 *     failures: number;
 *     testType: test_listType | "selected";
 *     total: number;
 * }
 * ``` */
interface test_complete {
    callback: commandCallback;
    failures: number;
    testType: test_listType | "selected";
    total: number;
}

/**
 * A configuration object for convenience function test/application/browserUtilities/modalAddress.ts.
 * ```typescript
 * interface test_modalAddress {
 *     address: string;
 *     index: number;
 *     lastItem: string;
 *     machine: string;
 * }
 * ``` */
interface test_modalAddress {
    address: string;
    index: number;
    lastItem: string;
    machine: string;
}

/**
 * Defines a single test entry in the simulation test type.
 * ```typescript
 * interface test_item {
 *     artifact?: string;
 *     command: string;
 *     file?: string;
 *     qualifier: qualifier | qualifierFile;
 *     test: string;
 * }
 * ``` */
interface test_item {
    artifact?: string;
    command: string;
    file?: string;
    qualifier: qualifier | qualifierFile;
    test: string;
}

/**
 * Defines the test item list for *service* type test automation.
 * ```typescript
 * interface test_service {
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
interface test_service {
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
 * interface test_typeCollection {
 *     service: testServiceApplication;
 *     simulation: testSimulationApplication;
 * }
 * ``` */
interface test_typeCollection {
    service: module_test_serviceApplication;
    simulation: module_test_simulationApplication;
}
