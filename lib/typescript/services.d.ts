/* lib/typescript/services.d - Stores definitions of the various service data objects, such as those that comprise the socketData transfer type. */

/**
 * A data object to convey the online status of a remote agent.
 * ```typescript
 * interface service_agentResolve {
 *     agent: string;
 *     agentType: agentType;
 *     ipAll: networkAddresses;
 *     ipSelected: string;
 *     mode: testListType;
 * }
 * ``` */
interface service_agentResolve {
    agent: string;
    agentType: agentType;
    ipAll: networkAddresses;
    ipSelected: string;
    mode: testListType;
}

/**
 * A data object that initiates the various services associated with the file copy process.
 * ```typescript
 * interface service_copy {
 *     action     : copyTypes;
 *     agentSource: fileAgent;
 *     agentWrite : fileAgent;
 *     cut        : boolean;
 *     execute    : boolean;
 *     location   : string[];
 * }
 * ``` */
 interface service_copy {
    action     : copyTypes;
    agentSource: fileAgent;
    agentWrite : fileAgent;
    cut        : boolean;
    execute    : boolean;
    location   : string[];
}

/**
 * A data object used to return a file from a remote source through an intermediary agent.
 * ```typescript
 * interface service_copyFile {
 *     agent: fileAgent;
 *     brotli: number;
 *     file_name: string;
 *     file_location: string;
 *     size: number;
 * }
 * ``` */
interface service_copyFile {
    agent: fileAgent;
    brotli: number;
    file_name: string;
    file_location: string;
    size: number;
}

/**
 * A data object to request a specific file from a remote agent for file copy.
 * ```typescript
 * interface service_fileRequest {
 *     action: "copy-request-files";
 *     copyData: service_copy;
 *     fileData: remoteCopyListData;
 * }
 * ``` */
interface service_fileRequest {
    action: "copy-request-files";
    copyData: service_copy;
    fileData: remoteCopyListData;
}

/**
 * Delivers a file list as well as messaging for a File Navigator's status bar.
 * ```typescript
 * interface service_fileStatus {
 *     address: string;
 *     agent: string;
 *     agentType: agentType;
 *     fileList: directoryResponse;
 *     message: string;
 * }
 * ``` */
interface service_fileStatus {
    address: string;
    agent: string;
    agentType: agentType;
    fileList: directoryResponse;
    message: string;
}

/**
 * A data object that initiates the various file system services except file copy.
 * ```typescript
 * interface service_fileSystem {
 *     action  : fileAction;
 *     agent   : fileAgent;
 *     depth   : number;
 *     location: string[];
 *     name    : string;
 * }
 * ``` */
    interface service_fileSystem {
    action  : fileAction;
    agent   : fileAgent;
    depth   : number;
    location: string[];
    name    : string;
}

/**
 * Packages a file list along with a modal ID for the browser code to populate a file system details modal.
 * ```typescript
 * interface service_fileSystemDetails {
 *     dirs: directoryResponse;
 *     id: string;
 * }
 * ``` */
interface service_fileSystemDetails {
    dirs: directoryResponse;
    id: string;
}

/**
 * A data object for associating hash identifiers to a new local device.
 * ```typescript
 * interface service_hashAgent {
 *     device: string;
 *     deviceData: deviceData;
 *     user: string;
 * }
 * ``` */
interface service_hashAgent {
    device: string;
    deviceData: deviceData;
    user: string;
}

/**
 * A data object for associating a hash as an identifier for a new share.
 * ```typescript
 * interface service_hashShare {
 *     device: string;
 *     share: string;
 *     type: shareType;
 * }
 * ``` */
// describes data necessary to create a hash name for a new share
interface service_hashShare {
    device: string;
    hash: string;
    share: string;
    type: shareType;
}

/**
 * A data object for any service that primarily generates string data such as: base64, file edits, and arbitrary hashes
 * ```typescript
 * interface service_stringGenerate {
 *     content: string;
 *     id: string;
 *     path: string;
 * }
 * ``` */
interface service_stringGenerate {
    content: string;
    id: string;
    path: string;
}