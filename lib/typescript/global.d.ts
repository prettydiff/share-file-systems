/* lib/typescript/global.d - TypeScript interfaces used in many unrelated areas of the application. */

/**
 * An agent represents a connection point, such as a user or personal device.
 * ```typescript
 * interface agent {
 *     deviceData: deviceData;
 *     ipAll: transmit_addresses_IP;
 *     ipSelected: string;
 *     name: string;
 *     ports: ports;
 *     shares: agentShares;
 *     status: activityStatus;
 * }
 * type activityStatus = "" | "active" | "deleted" | "idle" | "offline";
 * ``` */
interface agent {
    deviceData: deviceData;
    ipAll: transmit_addresses_IP;
    ipSelected: string;
    name: string;
    ports: ports;
    shares: agentShares;
    status: activityStatus;
}

/**
 * An object to assist with asynchronously counting agents against a prior known total.
 * ```typescript
 * interface agentCounts {
 *     count: number;
 *     total: number;
 * }
 * ``` */
interface agentCounts {
    count: number;
    total: number;
}

/**
 * Stores agent specific data for the invitation process.
 * ```typescript
 * interface agentInvite {
 *     devices: agents;
 *     hashDevice: string;
 *     hashUser: string;
 *     ipAll: transmit_addresses_IP;
 *     ipSelected: string;
 *     nameDevice: string;
 *     nameUser: string;
 *     ports: ports;
 *     shares: agentShares;
 * }
 * ``` */
interface agentInvite {
    devices: agents;
    hashDevice: string;
    hashUser: string;
    ipAll: transmit_addresses_IP;
    ipSelected: string;
    modal: string;
    nameDevice: string;
    nameUser: string;
    ports: ports;
    shares: agentShares;
}

/**
 * Stores a list of agent IDs by type.
 * ```typescript
 * interface agentList {
 *     [key:string]: string[];
 * }
 * ``` */
interface agentList {
    [key:string]: string[];
}

/**
 * A data model used within common.agents method.
 * ```typescript
 * interface agentNames {
 *     agent?: string;
 *     agentType: agentType;
 *     share?: string;
 * }
 * ``` */
interface agentNames {
    agent?: string;
    agentType: agentType;
    share?: string;
}

/**
 * A grouping of agents, such as agents by agent type.
 * ```typescript
 * interface agents {
 *     [key:string]: agent;
 * }
 * ``` */
interface agents {
    [key:string]: agent;
}

/**
 * A data object representing a single share instance.
 * ```typescript
 * interface agentShare {
 *     execute: boolean;
 *     name: string;
 *     readOnly: boolean;
 *     type: fileType;
 * }
 * type fileType = "directory" | "file" | "link";
 * ``` */
interface agentShare {
    execute: boolean;
    name: string;
    readOnly: boolean;
    type: fileType;
}

/**
 * A grouping of shares by share identifiers.
 * ```typescript
 * interface agentShares {
 *     [key:string]: agentShare;
 * }
 * ``` */
interface agentShares {
    [key:string]: agentShare;
}

/**
 * Stores a value whether a given agent is online or not.
 * ```typescript
 * interface agentSummary {
 *     device: stringStore;
 *     user: stringStore;
 * }
 * ``` */
interface agentSummary {
    device: stringStore;
    user: stringStore;
}

/**
 * Device specific hardware data used to populate device share modals.
 * ```typescript
 * interface deviceData {
 *     cpuCores: number;
 *     cpuID: string;
 *     platform: string;
 *     memTotal: number;
 *     osType: string;
 *     osVersion: string;
 * }
 * ``` */
interface deviceData {
    cpuCores: number;
    cpuID: string;
    platform: string;
    memTotal: number;
    osType: string;
    osVersion: string;
}

/**
 * Any simple object used to store a list of boolean values. Helpful for use as a list of flags in the case where multiple asynchronous events execute simultaneously.
 * ```typescript
 * interface flagList {
 *     [key:string]: boolean;
 * }
 * ``` */
interface flagList {
    [key:string]: boolean;
}

/**
 * A means of packaging port data into a single object.
 * ```typescript
 * interface ports {
 *     http: number;
 *     ws: number;
 * }
 * ``` */
interface ports {
    http: number;
    ws: number;
}

/**
 * The primary data type of all supported services.
 * ```typescript
 * interface socketData {
 *     data: socketDataType;
 *     service: requestType;
 * }
 * type socketDataType = Buffer | service_agentHash | service_agentManagement | service_agentResolve | service_agentStatus | service_copy | service_error | service_copy_file | service_copy_fileRequest | service_fileStatus | service_fileSystem | service_fileSystemDetails | service_hashShare | service_invite | service_log | service_message | service_settings | service_stringGenerate | service_testBrowser;
 * ``` */
interface socketData {
    data: socketDataType;
    service: requestType;
}

/**
 * A non-specific object limited to mapping a string value to a key name.
 * ```typescript
 * interface stringStore {
 *     [key:string]: string;
 * }
 * ``` */
interface stringStore {
    [key:string]: string;
}