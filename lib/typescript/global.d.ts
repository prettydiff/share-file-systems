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
 * Lists agents by agent types.
 * ```typescript
 * interface agentList {
 *     device: string[];
 *     user: string[];
 * }
 * ``` */
interface agentList {
    device: string[];
    user: string[];
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
 *     device: {
 *         [key:string]: string;
 *     };
 *     user: {
 *         [key:string]: string;
 *     };
 * }
 * ``` */
interface agentSummary {
    device: {
        [key:string]: string;
    };
    user: {
        [key:string]: string;
    };
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
 * type socketDataType = agentList | Buffer | heartbeat | heartbeatUpdate | invite | logData | messageItem[] | NodeJS.ErrnoException | service_agentResolve | service_copy | service_copyFile | service_fileRequest | service_fileStatus | service_fileSystem | service_fileSystemDetails | service_hashAgent | service_hashShare | service_stringGenerate | settings | testBrowserRoute;
 * ``` */
interface socketData {
    data: socketDataType;
    service: requestType;
}