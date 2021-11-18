/* lib/typescript/services.d - Stores definitions of the various service data objects, such as those that comprise the socketData transfer type. */

/**
 * Lists agents by agent types.
 * ```typescript
 * interface service_agentDeletion {
 *     device: string[];
 *     user: string[];
 * }
 * ``` */
 interface service_agentDeletion {
    device: string[];
    user: string[];
}

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
 * Sends update notifications via heartbeat logic when agent data changes, such as a change to shares.
 * ```typescript
 * interface service_agentUpdate {
 *     action: "update";
 *     agentFrom: "localhost-browser" | "localhost-terminal";
 *     broadcastList: {
 *         distribution: string[];
 *         payload: agents;
 *         type: agentType;
 *     };
 *     shares: agents;
 *     status: heartbeatStatus;
 *     type: agentType;
 * }
 * ``` */
interface service_agentUpdate {
    action: "update";
    agentFrom: "localhost-browser" | "localhost-terminal";
    broadcastList: {
        distribution: string[];
        payload: agents;
        type: agentType;
    };
    shares: agents;
    status: heartbeatStatus;
    type: agentType;
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
 * The data package for heartbeat actions across the network.
 * ```typescript
 * interface service_heartbeat {
 *     action: heartbeatAction;
 *     agentTo: string;
 *     agentFrom: string;
 *     agentType: agentType;
 *     shares: agents;
 *     shareType: agentType;
 *     status: heartbeatStatus | service_agentDeletion;
 * }
 * ``` */
interface service_heartbeat {
    action: heartbeatAction;
    agentTo: string;
    agentFrom: string;
    agentType: agentType;
    shares: agents;
    shareType: agentType;
    status: heartbeatStatus | service_agentDeletion;
}

/**
 * A configuration object used in multiple invite module methods.
 * ```typescript
 * interface service_invite {
 *     action: inviteAction;
 *     agentRequest: agentInvite;
 *     agentResponse: agentInvite;
 *     message: string;
 *     modal: string;
 *     status: inviteStatus;
 *     type: agentType;
 * }
 * type inviteAction = "invite-complete" | "invite-request" | "invite-response" | "invite-start";
 * type inviteStatus = "accepted" | "declined" | "invited";
 * ``` */
interface service_invite {
    action: inviteAction;
    agentRequest: agentInvite;
    agentResponse: agentInvite;
    message: string;
    modal: string;
    status: inviteStatus;
    type: agentType;
}

/**
 * Saves user generated data and configurations to a file.
 * ```typescript
 * interface service_settings {
 *     settings: agents | service_message | ui_data;
 *     type: settingsType;
 * }
 * ``` */
interface service_settings {
    settings: agents | service_message | ui_data;
    type: settingsType;
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

/**
 * The data object for transferring browser test automation items across the network.
 * ```typescript
 * interface service_testBrowser {
 *     action: testBrowserAction;
 *     exit: string;
 *     index: number;
 *     result: [boolean, string, string][];
 *     test: testBrowserItem;
 *     transfer: testBrowserTransfer;
 * }
 * type testBrowserAction = "close" | "nothing" | "request" | "reset-browser" | "reset-complete" | "reset-request" | "reset-response" | "respond" | "result";
 * ```
 */
interface service_testBrowser {
    action: testBrowserAction;
    exit: string;
    index: number;
    result: [boolean, string, string][];
    test: testBrowserItem;
    transfer: testBrowserTransfer;
}