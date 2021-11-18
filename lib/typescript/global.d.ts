/* lib/typescript/global.d - TypeScript interfaces used in many unrelated areas of the application. */

/**
 * An agent represents a connection point, such as a user or personal device.
 * ```typescript
 * interface agent {
 *     deviceData: deviceData;
 *     ipAll: networkAddresses;
 *     ipSelected: string;
 *     name: string;
 *     ports: ports;
 *     shares: agentShares;
 *     status: heartbeatStatus;
 * }
 * type heartbeatStatus = "" | "active" | "deleted" | "idle" | "offline";
 * ``` */
interface agent {
    deviceData: deviceData;
    ipAll: networkAddresses;
    ipSelected: string;
    name: string;
    ports: ports;
    shares: agentShares;
    status: heartbeatStatus;
}

/**
 * Configuration object used with method common.agents.
 * ```typescript
 * interface agentsConfiguration {
 *     complete?: (counts:agentCounts) => void;
 *     countBy: "agent" | "agentType" | "share";
 *     perAgent?: (agentNames:agentNames, counts:agentCounts) => void;
 *     perAgentType?: (agentNames:agentNames, counts:agentCounts) => void;
 *     perShare?: (agentNames:agentNames, counts:agentCounts) => void;
 *     source: browser | serverVars | settingsItems;
 * }
 * ``` */
interface agentsConfiguration {
    complete?: (counts:agentCounts) => void;
    countBy: "agent" | "agentType" | "share";
    perAgent?: (agentNames:agentNames, counts:agentCounts) => void;
    perAgentType?: (agentNames:agentNames, counts:agentCounts) => void;
    perShare?: (agentNames:agentNames, counts:agentCounts) => void;
    source: browser | serverVars | settingsItems;
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
 * Stores agent specific data for the invitation process.
 * ```typescript
 * interface agentInvite {
 *     hashDevice: string;
 *     hashUser: string;
 *     ipAll: networkAddresses;
 *     ipSelected: string;
 *     nameDevice: string;
 *     nameUser: string;
 *     ports: ports;
 *     shares: agents;
 * }
 * ``` */
interface agentInvite {
    hashDevice: string;
    hashUser: string;
    ipAll: networkAddresses;
    ipSelected: string;
    modal: string;
    nameDevice: string;
    nameUser: string;
    ports: ports;
    shares: agents;
}

/**
 * A data object representing a single share instance.
 * ```typescript
 * interface agentShare {
 *     execute: boolean;
 *     name: string;
 *     readOnly: boolean;
 *     type: shareType;
 * }
 * type shareType = "directory" | "file" | "link";
 * ``` */
interface agentShare {
    execute: boolean;
    name: string;
    readOnly: boolean;
    type: shareType;
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
 * type socketDataType = Buffer | NodeJS.ErrnoException | service_agentDeletion | service_agentResolve | service_agentUpdate | service_copy | service_copyFile | service_fileRequest | service_fileStatus | service_fileSystem | service_fileSystemDetails | service_hashAgent | service_hashShare | service_heartbeat | service_invite | service_log | service_message | service_settings | service_stringGenerate | service_testBrowser;
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