/* lib/typescript/fileService.d - TypeScript interfaces used by the file services. */

/**
 * A configuration object used in various methods of the fileSystem/serviceCopy.ts library.
 * ```typescript
 * interface copyStatusConfig {
 *     agentSource: fileAgent;
 *     agentWrite: fileAgent;
 *     countFile: number;
 *     directory: boolean;
 *     failures: number;
 *     location: string[];
 *     message: string;
 *     totalSize: number;
 *     writtenSize: number;
 * }
 * ``` */
interface copyStatusConfig {
    agentSource: fileAgent;
    agentWrite: fileAgent;
    countFile: number;
    directory: boolean;
    failures: number;
    location: string[];
    message: string;
    totalSize: number;
    writtenSize: number;
}

/**
 * Used for routing agent specific data through file system and copy related services.
 * ```typescript
 * interface fileAgent {
 *     id: string;
 *     modalAddress: string;
 *     share: string;
 *     type: agentType;
 * }
 * ``` */
interface fileAgent {
    id: string;
    modalAddress: string;
    share: string;
    type: agentType;
}

/**
 * A configuration object of the fileSystem/route.ts library.
 * ```typescript
 * interface fileRoute {
 *     agent: string;
 *     agentData: "agent"|"agentSource"|"agentWrite"|"data.agent";
 *     agentType: agentType;
 *     callback: (message:socketData) => void;
 *     data: service_copy | service_copyFile | service_fileRequest | service_fileSystem;
 *     requestType: requestType;
 *     transmit: transmit;
 * }
 * ``` */
interface fileRoute {
    agent: string;
    agentData: "agent"|"agentSource"|"agentWrite"|"data.agent";
    agentType: agentType;
    callback: (message:socketData) => void;
    data: service_copy | service_copyFile | service_copyFileRequest | service_fileSystem;
    requestType: requestType;
    transmit: transmit;
}

/**
 * A configuration object for fileSystem/user.ts
 * ```typescript
 * interface fileUser {
 *     action: fileAction | "copy-request" | "cut";
 *     agent: fileAgent;
 *     callback: (device:string) => void;
 *     transmit: transmit;
 * }
 * type fileAction = "fs-base64" | "fs-close" | "fs-destroy" | "fs-details" | "fs-directory" | "fs-execute" | "fs-hash" | "fs-new" | "fs-read" | "fs-rename" | "fs-search" | "fs-write";
 * ``` */
interface fileUser {
    action: fileAction | "copy-request" | "cut";
    agent: fileAgent;
    callback: (device:string) => void;
    transmit: transmit;
}

/**
 * Defines a list of file system objects to request from a remote agent for file copy.
 * ```typescript
 * interface remoteCopyListData {
 *     directories: number;
 *     fileCount: number;
 *     fileSize: number;
 *     list: [string, string, string, number][];
 * }
 * ``` */
interface remoteCopyListData {
    directories: number;
    fileCount: number;
    fileSize: number;
    list: [string, string, string, number][];
}