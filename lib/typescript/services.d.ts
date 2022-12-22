/* lib/typescript/services.d - Stores definitions of the various service data objects, such as those that comprise the socketData transfer type. */

// cspell:words brotli

/**
 * A data object for associating hash identifiers to a new local device.
 * ```typescript
 * interface service_agentHash {
 *     device: string;
 *     deviceData: deviceData;
 *     user: string;
 * }
 * ``` */
 interface service_agentHash {
    device: string;
    deviceData: deviceData;
    user: string;
}

/**
 * A data object to change agents from the available agent lists.
 * ```typescript
 * interface service_agentManagement {
 *     action: "add" | "delete" | "modify" | "rename";
 *     agents: {
 *         device: agents;
 *         user: agents;
 *     };
 *     agentFrom: string;
 *     deviceUser: string;
 * }
 * ``` */
interface service_agentManagement {
    action: "add" | "delete" | "modify" | "rename";
    agents: {
        device: agents;
        user: agents;
    };
    agentFrom: string;
    deviceUser: string;
}

/**
 * A data object to convey the online status of a remote agent.
 * ```typescript
 * interface service_agentResolve {
 *     agent: string;
 *     agentType: agentType;
 *     ipAll: transmit_addresses_ip;
 *     ipSelected: string;
 *     mode: test_listType;
 * }
 * ``` */
interface service_agentResolve {
    agent: string;
    agentType: agentType;
    ipAll: transmit_addresses_IP;
    ipSelected: string;
    mode: test_listType;
}

/**
 * Indicates whether a given agent is online or offline.
 * ```typescript
 * interface service_agentStatus {
 *     agent: string;
 *     agentType: agentType;
 *     broadcast: boolean;
 *     respond: boolean;
 *     status: activityStatus;
 * }
 * ``` */
interface service_agentStatus {
    agent: string;
    agentType: agentType;
    broadcast: boolean;
    respond: boolean;
    status: activityStatus;
}

/**
 * A data object that initiates the various services associated with the file copy process.
 * ```typescript
 * interface service_copy {
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
 * Sends the contents of a requested file.
 * ```typescript
 * interface service_copy_send_file {
 *     agentRequest: fileAgent;
 *     agentSource : fileAgent;
 *     agentWrite  : fileAgent;
 *     brotli      : brotli;
 *     file_name   : string;
 *     file_size   : number;
 *     path_source : string;
 *     path_write  : string;
 * }
 * ``` */
interface service_copy_send_file {
    agentRequest: fileAgent;
    agentSource : fileAgent;
    agentWrite  : fileAgent;
    brotli      : brotli;
    file_name   : string;
    file_size   : number;
    path_source : string;
    path_write  : string;
}

/**
 * Sends a file list from the source of a copy transaction so that the write agent can create the necessary directory structure
 * ```typescript
 * interface service_copy_write {
 *     agentRequest: fileAgent;
 *     agentSource : fileAgent;
 *     agentWrite  : fileAgent;
 *     cut         : boolean;
 *     execute     : boolean;
 *     hash        : string;
 *     ip          : string;
 *     list        : directory_list[];
 *     listData    : copyStats;
 *     port        : number;
 * }
 * ``` */
 interface service_copy_write {
    agentRequest: fileAgent;
    agentSource : fileAgent;
    agentWrite  : fileAgent;
    cut         : boolean;
    execute     : boolean;
    hash        : string;
    ip          : string;
    list        : directory_list[];
    listData    : copy_stats;
    port        : number;
}

/**
 * Sends a list of files to delete on the source agent from the write agent
 * ```typescript
 * interface service_cut {
 *     agentRequest: fileAgent;
 *     agentSource : fileAgent;
 *     agentWrite  : fileAgent;
 *     failList    : string[];
 *     fileList    : fileTypeList;
 * }
 * ``` */
interface service_cut {
    agentRequest: fileAgent;
    agentSource : fileAgent;
    agentWrite  : fileAgent;
    failList    : string[];
    fileList    : fileTypeList;
}

/**
 * Extends error messaging to provide routing data.
 * ```typescript
 * interface service_error extends NodeJS.ErrnoException {
 *     agentRequest: fileAgent;
 *     agentSource: fileAgent;
 * }
 * ``` */
interface service_error extends NodeJS.ErrnoException {
    agentRequest: fileAgent;
    agentSource: fileAgent;
}

/**
 * A data object that initiates the various file system services except file copy.
 * ```typescript
 * interface service_fileSystem {
 *     action      : actionFile;
 *     agentRequest: fileAgent;
 *     agentSource : fileAgent;
 *     agentWrite  : null;
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
 *     dirs: directory_response;
 *     id: string;
 * }
 * ``` */
interface service_fileSystem_details {
    agentRequest: fileAgent;
    dirs: directory_response;
    id: string;
}

/**
 * Delivers a file list as well as messaging for a File Navigator's status bar.
 * ```typescript
 * interface service_fileSystem_status {
 *     agentRequest: fileAgent;
 *     agentSource: fileAgent;
 *     fileList: directory_response;
 *     message: string;
 * }
 * ``` */
interface service_fileSystem_status {
    agentRequest: fileAgent;
    agentSource: fileAgent;
    fileList: directory_response;
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
 * A data object for associating a hash as an identifier for a new share.
 * ```typescript
 * interface service_hashShare {
 *     device: string;
 *     hash: string;
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
 * A console command to enter as input to an operating system command terminal.
 * ```typescript
 * interface service_console_input {
 *     agentRequest: agentNames;
 *     agentSource: agentNames;
 *     directory: string;
 *     instruction: string;
 * }
 * ``` */
interface service_terminal_input {
    agentRequest: agentNames;
    agentSource: agentNames;
    directory: string;
    instruction: string;
}

/**
 * Logs to populate a command terminal.
 * ```typescript
 * interface service_console_input {
 *     agentRequest: agentNames;
 *     agentSource: agentNames;
 *     logs: string[];
 * }
 * ``` */
interface service_terminal_output {
    agentRequest: agentNames;
    agentSource: agentNames;
    logs: string[];
}

/**
 * The data object for transferring browser test automation items across the network.
 * ```typescript
 * interface service_testBrowser {
 *     action: test_browserAction;
 *     exit: string;
 *     index: number;
 *     result: [boolean, string, string][];
 *     test: test_browserItem;
 * }
 * type test_browserAction = "close" | "nothing" | "reset" | "reset-complete" | "result";
 * ```
 */
interface service_testBrowser {
    action: test_browserAction;
    exit: string;
    index: number;
    result: [boolean, string, string][];
    test: test_browserItem;
}