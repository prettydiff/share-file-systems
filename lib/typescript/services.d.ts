/* lib/typescript/services.d - Stores definitions of the various service data objects, such as those that comprise the socketData transfer type. */

/**
 * A data object to change agents from the available agent lists.
 * ```typescript
 * interface service_agentManagement {
 *     action: "add" | "delete" | "modify";
 *     agents: agents;
 *     agentType: agentType;
 *     from: "browser" | "device" | "invite" | "user";
 * }
 * ``` */
interface service_agentManagement {
    action: "add" | "delete" | "modify";
    agentFrom: string;
    agents: {
        device: agents;
        user: agents;
    };
}

/**
 * Indicates whether a given agent is online or offline.
 * ```typescript
 * interface service_agentStatus {
 *     agent: string;
 *     agentType: agentType;
 *     broadcast: boolean;
 *     status: activityStatus;
 * }
 * ``` */
interface service_agentStatus {
    agent: string;
    agentType: agentType;
    broadcast: boolean;
    status: activityStatus;
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
 * A data object that initiates the various services associated with the file copy process.
 * ```typescript
 * interface service_copy {
 *     action      : copyTypes;
 *     agentRequest: fileAgent;
 *     agentSource : fileAgent;
 *     agentWrite  : fileAgent;
 *     cut         : boolean;
 *     execute     : boolean;
 *     location    : string[];
 * }
 * ``` */
 interface service_copy {
    agentRequest: fileAgent;
    agentSource : fileAgent;
    agentWrite  : fileAgent;
    cut         : boolean;
    execute     : boolean;
    location    : string[];
}

/**
 * A data object used to return a file from a remote source through an intermediary agent.
 * ```typescript
 * interface service_copy_file {
 *     agent: fileAgent;
 *     brotli: number;
 *     file_name: string;
 *     file_location: string;
 *     size: number;
 * }
 * ``` */
interface service_copy_file {
    agentRequest: fileAgent;
    agentSource: fileAgent;
    agentWrite: fileAgent;
    brotli: number;
    file_name: string;
    file_location: string;
    size: number;
}

/**
 * Sends a file list from the source of a copy transaction so that the write agent can create the necessary directory structure
 * ```typescript
 * interface service_copy_list {
 *     agentRequest: fileAgent;
 *     agentWrite: fileAgent;
 *     list: copyListItem[];
 * }
 * ``` */
interface service_copy_list {
    agentRequest: fileAgent;
    agentWrite: fileAgent;
    list: copyListItem[];
}

/**
 * A data object to request a specific file from a remote agent for file copy.
 * ```typescript
 * interface service_copy_fileRequest {
 *     copyData: service_copy;
 *     fileData: remoteCopyListData;
 * }
 * ``` */
interface service_copy_fileRequest {
    copyData: service_copy;
    fileData: remoteCopyListData;
}

/**
 * Extends error messaging to provide routing data.
 * ```typescript
 * interface error extends NodeJS.ErrnoException {
 *     agent: fileAgent;
 * }
 * ``` */
interface service_error extends NodeJS.ErrnoException {
    agent: fileAgent;
}

/**
 * A data object that initiates the various file system services except file copy.
 * ```typescript
 * interface service_fileSystem {
 *     action      : actionFile;
 *     agentRequest: fileAgent;
 *     agentSource : fileAgent;
 *     depth       : number;
 *     location    : string[];
 *     name        : string;
 * }
 * ``` */
interface service_fileSystem {
    action      : actionFile;
    agentRequest: fileAgent;
    agentSource : fileAgent;
    agentWrite  : null;
    depth       : number;
    location    : string[];
    name        : string;
}

/**
 * Packages a file list along with a modal ID for the browser code to populate a file system details modal.
 * ```typescript
 * interface service_fileSystem_Details {
 *     agentRequest: fileAgent;
 *     dirs: directoryResponse;
 *     id: string;
 * }
 * ``` */
interface service_fileSystem_details {
    agentRequest: fileAgent;
    dirs: directoryResponse;
    id: string;
}

/**
 * Delivers a file list as well as messaging for a File Navigator's status bar.
 * ```typescript
 * interface service_fileSystem_status {
 *     address: string;
 *     agentRequest: fileAgent;
 *     fileList: directoryResponse;
 *     message: string;
 * }
 * ``` */
interface service_fileSystem_status {
    agentRequest: fileAgent;
    agentTarget: fileAgent;
    fileList: directoryResponse;
    message: string;
}

/**
 * A data object for any service that primarily generates string data such as: base64, file edits, and arbitrary hashes
 * ```typescript
 * interface service_fileSystem_string {
 *     agentRequest: fileAgent;
 *     files: fileRead[];
 *     type: fileSystemReadType;
 * }
 * ``` */
interface service_fileSystem_string {
    agentRequest: fileAgent;
    files: fileRead[];
    type: fileSystemReadType;
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
 *     type: fileType;
 * }
 * ``` */
// describes data necessary to create a hash name for a new share
interface service_hashShare {
    device: string;
    hash: string;
    share: string;
    type: fileType;
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
 *     shares:
 *     status: inviteStatus;
 *     type: agentType;
 * }
 * type inviteAction = "invite-complete" | "invite-request" | "invite-response" | "invite-start";
 * type inviteStatus = "accepted" | "declined" | "ignored" | "invited";
 * ``` */
interface service_invite {
    action: inviteAction;
    agentRequest: agentInvite;
    agentResponse: agentInvite;
    message: string;
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