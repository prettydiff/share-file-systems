/* lib/typescript/terminal.d - TypeScript interfaces used by terminal specific libraries. */

/**
 * Stores agent related connection information used for command *agent_data*.
 * ```typescript
 * interface agentData {
 *     device: agents;
 *     user: agents;
 * }
 * ``` */
interface agentData {
    device: agents;
    user: agents;
}

/**
 * Object output by command *base64*.
 * ```typescript
 * interface base64Output {
 *     base64: string;
 *     filePath: string;
 *     id: string;
 * }
 * ``` */
interface base64Output {
    base64: string;
    filePath: string;
    id: string;
}

/**
 * Determines the order of tasks by task type from object *buildPhaseList*.
 * ```typescript
 * interface build_order {
 *     build: buildPhase[];
 *     test: buildPhase[];
 * }
 * ``` */
interface build_order {
    build: buildPhase[];
    test: buildPhase[];
}

/**
 * Creates the files for the global shell command respective of whether the code uses commonjs or standard modules.
 * ```typescript
 * interface build_moduleType {
 *     exportString: RegExp|string;
 *     extension: string;
 *     importPath: string;
 * }
 * ``` */
interface build_moduleType {
    exportString: RegExp|string;
    extension: string;
    importPath: string;
}

/**
 * Stores handlers for a fs.stat operation used to identify the type of POSIX operating system by location of root certificate store available.
 * ```typescript
 * interface build_posix_distribution {
 *     arch: (statErr:NodeJS.ErrnoException) => void;
 *     darwin: (statErr:NodeJS.ErrnoException) => void;
 *     fedora: (statErr:NodeJS.ErrnoException) => void;
 *     ubuntu: (statErr:NodeJS.ErrnoException) => void;
 * }
 * ``` */
interface build_posix_distribution {
    arch: (statErr:NodeJS.ErrnoException) => void;
    darwin: (statErr:NodeJS.ErrnoException) => void;
    fedora: (statErr:NodeJS.ErrnoException) => void;
    ubuntu: (statErr:NodeJS.ErrnoException) => void;
}

/**
 * Stores OS distribution specific instructions for given tasks.
 * ```typescript
 * interface build_posix_tools {
 *     install: build_posix_tools_item;
 *     package: build_posix_tools_item;
 *     toolCAP: build_posix_tools_item;
 *     toolNSS: build_posix_tools_item;
 *     trust: build_posix_tools_item;
 * }
 * ``` */
interface build_posix_tools {
    install: build_posix_tools_item;
    package: build_posix_tools_item;
    toolCAP: build_posix_tools_item;
    toolNSS: build_posix_tools_item;
    trust: build_posix_tools_item;
}

/**
 * Describes a given instruction across various supported OS distributions.
 * ```typescript
 * interface build_posix_tools_item {
 *     arch: string;
 *     darwin: string;
 *     fedora: string;
 *     ubuntu: string;
 * }
 * ``` */
interface build_posix_tools_item {
    arch: string;
    darwin: string;
    fedora: string;
    ubuntu: string;
}

/**
 * Certificates span two build phases, one for certificate creation and the second in os_specific tasks for installation.
 * ```typescript
 * interface certificate_flags {
 *     forced: boolean;
 *     path: string;
 *     selfSign: boolean;
 * }
 * ``` */
interface certificate_flags {
    forced: boolean;
    path: string;
    selfSign: boolean;
}

/**
 * Used by the *certificate* command's config to determine named certificate identities.
 * ```typescript
 * interface certificate_name {
 *     domain: string;
 *     fileName: string;
 * }
 * ``` */
    interface certificate_name {
    domain: string;
    fileName: string;
}

/**
 * Used by the *certificate* command in the removal of certificates.
 * ```typescript
 * interface certificate_remove {
 *     ca: certificate_remove_item;
 *     root: certificate_remove_item;
 * }
 * ``` */
interface certificate_remove {
    ca: certificate_remove_item;
    root: certificate_remove_item;
}

/**
 * A reusable component in the removal of certificates.
 * ```typescript
 * interface certificate_remove_item {
 *     command: string;
 *     flag: boolean;
 *     logs: string[];
 * }
 * ``` */
interface certificate_remove_item {
    command: string;
    flag: boolean;
    logs: string[];
}

/** 
 * Stores various configuration files written at build time.
 * ```typescript
 * interface configuration_application {
 *     // cspell:disable-next-line
 *     ".eslintignore": string[];
 *     ".eslintrc.json": {
 *         env: {
 *             [key:string]: boolean;
 *         };
 *         extends: string;
 *         parser: string;
 *         parserOptions: {
 *             ecmaVersion: number;
 *             sourceType: "module";
 *         };
 *         plugins: string[];
 *         root: boolean;
 *         rules: {
 *             [key:string]: eslintCustom | eslintDelimiter | string[] | boolean | 0;
 *         };
 *     };
 *     ".gitignore": string[];
 *     // cspell:disable-next-line
 *     ".npmignore": string[];
 *     versionDate: number;
 * }
 * ``` */
interface configuration_application {
    // cspell:disable-next-line
    ".eslintignore": string[];
    ".eslintrc.json": {
        env: {
            [key:string]: boolean;
        };
        extends: string;
        parser: string;
        parserOptions: {
            ecmaVersion: number;
            sourceType: "module";
        };
        plugins: string[];
        root: boolean;
        rules: {
            [key:string]: eslintCustom | eslintDelimiter | string[] | boolean | 0;
        };
    };
    ".gitignore": string[];
    // cspell:disable-next-line
    ".npmignore": string[];
    versionDate: number;
}

/**
 * Provides a data structure as required by interface *configuration_application*.
 * ```typescript
 * interface configuration_eslint_item {
 *     [key:string]: {
 *         delimiter: string;
 *         requireLast: boolean;
 *     };
 * }
 * ``` */
interface configuration_eslint_item {
    [key:string]: {
        delimiter: string;
        requireLast: boolean;
    };
}

/**
 * Describes the portion of package.json file used in this application.
 * ```typescript
 * interface configuration_packageJSON {
 *     author: string;
 *     bin: string;
 *     bugs: stringStore;
 *     command: string;
 *     description: string;
 *     devDependencies: stringStore;
 *     directories: stringStore;
 *     keywords: string[];
 *     license: string;
 *     main: string;
 *     name: string;
 *     repository: {
 *         type: string;
 *         url: string;
 *     };
 *     scripts: stringStore;
 *     type: "module";
 *     version: string;
 * }
 * ``` */
interface configuration_packageJSON {
    author: string;
    bin: string;
    bugs: stringStore;
    command: string;
    description: string;
    devDependencies: stringStore;
    directories: stringStore;
    keywords: string[];
    license: string;
    main: string;
    name: string;
    repository: {
        type: string;
        url: string;
    };
    scripts: stringStore;
    type: "module";
    version: string;
}

/**
 * Provides statistics to verbose output of the copy command.
 * ```typescript
 * interface copy_stats {
 *     dirs: number;
 *     error: number;
 *     files: number;
 *     link: number;
 *     size: number;
 * }
 * ``` */
interface copy_stats {
    dirs: number;
    error: number;
    files: number;
    link: number;
    size: number;
}

/**
 * Meta data comprising the fifth index of a *directory_item*.
 * ```typescript
 * interface directory_data {
 *     atimeMs: number;
 *     ctimeMs: number;
 *     linkPath: string;
 *     linkType: "" | "directory" | "file";
 *     mode: number;
 *     mtimeMs: number;
 *     size: number;
 * }
 * ``` */
interface directory_data {
    atimeMs: number;
    ctimeMs: number;
    linkPath: string;
    linkType: "" | "directory" | "file";
    mode: number;
    mtimeMs: number;
    size: number;
}

/**
 * The output of command *directory*.
 *
 * directoryItem Schema
 * * 0 - string, Absolute path of the file system artifact at its source
 * * 1 - fileType
 * * 2 - string, hash value, empty string unless fileType is "file" and args.hash === true and be aware this is exceedingly slow on large directory trees
 * * 3 - number, index in parent child items
 * * 4 - number, number of child items
 * * 5 - directoryData, a custom subset of Stats object
 * * 6 - string, written path as determined by utilities/rename.ts
 *
 * - failures - an object property on the array containing a list of read or access failures
 *
 * ```typescript
 * interface directory_list extends Array<directory_item> {
 *     failures?: string[];
 *     [index:number]: directoryItem;
 * }
 * type directory_item = [string, fileType, string, number, number, directory_data, string];
 * type fileType = "directory" | "error" | "file" | "link";
 * ``` */
interface directory_list extends Array<directory_item> {
    failures?: string[];
    [index:number]: directory_item;
}

/**
 * The parent structure for storing command related documentation.
 * ```typescript
 * interface documentation_command {
 *     [key:string]: documentation_command_item;
 * }
 * ``` */
interface documentation_command {
    [key:string]: documentation_command_item;
}

/**
 * The code example component of a *commandItem* portion of documentation.
 * ```typescript
 * interface documentation_command_example {
 *     code: string;
 *     defined: string;
 * }
 * ``` */
interface documentation_command_example {
    code: string;
    defined: string;
}

/**
 * A single item of documentation that comprises the *commandDocumentation* list.
 * ```typescript
 * interface documentation_command_item {
 *     description: string;
 *     example: commandExample[];
 * }
 * ``` */
interface documentation_command_item {
    description: string;
    example: documentation_command_example[];
}

/**
 * Stores data gathered from the comments on the top line of each code file to build automated documentation in build task *libReadme*.
 * ```typescript
 * interface documentation_file_item {
 *     description: string;
 *     name: string;
 *     namePadded: string;
 *     path: string;
 * }
 * ``` */
interface documentation_file_item {
    description: string;
    name: string;
    namePadded: string;
    path: string;
}

/**
 * The output structure of the *hash* command.
 * ```typescript
 * interface hash_output {
 *     filePath: string;
 *     hash: string;
 *     id?: string;
 *     parent?: number;
 *     stat?: directory_data;
 * }
 * ``` */
interface hash_output {
    filePath: string;
    hash: string;
    id?: string;
    parent?: number;
    stat?: directory_data;
}

/**
 * Parameters for an optional callback function to the agent_http.server method in the cases where other utilities are spawning an http server.
 * ```typescript
 * interface http_server_callback extends agency {
 *     callback: (output:http_server_output) => void;
 * }
 * ``` */
interface http_server_callback extends agency {
    callback: (output:http_server_output) => void;
}

/**
 * The object returned to the optional callback of agent_http.server.
 * ```typescript
 * interface http_server_output extends agency {
 *     log: string[];
 *     ports: ports;
 *     server: node_http_Server;
 * }
 * ``` */
interface http_server_output extends agency {
    log: string[];
    ports: ports;
    server: node_http_Server;
}

/**
 * Provides identity to an HTTP socket.
 * ```typescript
 * interface httpSocket_agent {
 *     hash: string;
 *     type: agentType;
 * }
 * ``` */
interface httpSocket_agent {
    hash: string;
    type: agentType;
}

/**
 * The means of describing a text message item.  The corresponding service is just an array of messageItem types.
 * ```typescript
 * interface message_item {
 *     agentFrom: string;
 *     agentTo: string;
 *     agentType: agentType;
 *     date: number;
 *     message: string;
 *     mode: messageMode;
 *     offline?: boolean;
 * }
 * ``` */
interface message_item {
    agentFrom: string;
    agentTo: string;
    agentType: agentType;
    date: number;
    message: string;
    mode: messageMode;
    offline?: boolean;
}

/**
 * I cannot find a TypeScript name reference to the node class SystemError that extends Error.errors, so this is a custom name.
 * ```typescript
 * interface NetworkError extends NodeJS.ErrnoException {
 *     port: number;
 * }
 * ``` */
interface NetworkError extends NodeJS.ErrnoException {
    port: number;
}

/**
 * A container of numbers for providing statistics to verbose output of command *remove*.
 * ```typescript
 * interface remove_count {
 *     dirs: number;
 *     file: number;
 *     link: number;
 *     size: number;
 * }
 * ``` */
interface remove_count {
    dirs: number;
    file: number;
    link: number;
    size: number;
}

/**
 * A means of organizing all stored data types into a single object for portability.
 * ```typescript
 * interface settings_item {
 *     agents: agentData;
 *     identity: identity;
 *     message: service_message;
 *     queue: transmit_queue;
 *     ui: ui_data;
 * }
 * ``` */
interface settings_item {
    agents: agentData;
    identity: identity;
    message: service_message;
    queue: transmit_queue;
    ui: ui_data;
}

/**
 * Retains a list of IP addresses separated as IPv4 and IPv6.
 * ```typescript
 * interface transmit_addresses_IP {
 *    IPv4: string[];
 *    IPv6: string[];
 * }
 * ``` */
interface transmit_addresses_IP {
    IPv4: string[];
    IPv6: string[];
}

/**
 * Output of method utilities/getAddress which stores the primary local and remote IP addresses for a given socket.
 * ```typescript
 * interface transmit_addresses_socket {
 *     local: {
 *         address: string;
 *         port: number;
 *     };
 *     remote: {
 *         address: string;
 *         port: number;
 *     };
 * }
 * ``` */
interface transmit_addresses_socket {
    local: {
        address: string;
        port: number;
    };
    remote: {
        address: string;
        port: number;
    };
}

/**
 * A naming convention passed into the sender.send method.
 * ```typescript
 * interface transmit_agents {
 *     device: string;
 *     user: string;
 * }
 * ``` */
interface transmit_agents {
    device: string;
    user: string;
}

/**
 * A message queue store.
 * ```typescript
 * interface transmit_queue {
 *     device: {
 *         [key:string]: socketData[];
 *     };
 *     user: {
 *         [key:string]: socketData[];
 *     };
 * }
 * ``` */
interface transmit_queue {
    device: {
        [key:string]: socketData[];
    };
    user: {
        [key:string]: socketData[];
    };
}

/**
 * This generally describes the method list available to server/transmission/receiver.
 * ```typescript
 * interface transmit_receiver {
 *     [key:string]: receiver;
 * }
 * ``` */
interface transmit_receiver {
    [key:string]: receiver;
}

/**
 * Stores options for starting a TLS server.
 * ```typescript
 * interface transmit_tlsOptions {
 *     fileFlag: {
 *         ca: boolean;
 *         crt: boolean;
 *         key: boolean;
 *     };
 *     options: {
 *         ca: string;
 *         cert: string;
 *         key: string;
 *     };
 * }
 * ``` */
interface transmit_tlsOptions {
    fileFlag: {
        ca: boolean;
        crt: boolean;
        key: boolean;
    };
    options: {
        ca: string;
        cert: string;
        key: string;
    };
}

/**
 * A container for a socket and the type of protocol that socket represents as necessary to separate services from transmission.
 * ```typescript
 * interface transmit_type {
 *     socket: httpSocket_request | httpSocket_response | websocket_client;
 *     type: "http" | "ws";
 * }
 * ``` */
interface transmit_type {
    socket: httpSocket_request | httpSocket_response | websocket_client;
    type: "http" | "ws";
}

/**
 * Extends the native *Socket* type to represent a websocket instance with additional properties.
 * ```typescript
 * interface websocket_client extends node_tls_TLSSocket {
 *     fragment: Buffer[];
 *     frame: Buffer[];
 *     frameExtended: number;
 *     handler: websocket_messageHandler;
 *     hash: string;
 *     ping: (ttl:bigint, callback:(err:NodeJS.ErrnoException, roundtrip:bigint) => void) => void;
 *     pong: {
 *         [key:string]: websocket_pong;
 *     };
 *     queue: Buffer[];
 *     role: "client"|"server";
 *     status: socketStatus;
 *     type: socketType;
 * }
 * ``` */
    interface websocket_client extends node_tls_TLSSocket {
    fragment: Buffer;
    frame: Buffer;
    frameExtended: number;
    handler: websocket_messageHandler;
    hash: string;
    ping: (ttl:number, callback:(err:NodeJS.ErrnoException, roundtrip:bigint) => void) => void;
    pong: {
        [key:string]: websocket_pong;
    };
    queue: Buffer[];
    role: "client"|"server";
    status: socketStatus;
    type: socketType;
}

/**
 * A construct necessary to describe the binary frame header of a websocket message as defined in RFC 6455.
 * ```typescript
 * interface websocket_frame {
 *     extended: number;
 *     fin: boolean;
 *     len: number;
 *     mask: boolean;
 *     maskKey: Buffer;
 *     opcode: number;
 *     rsv1: boolean;
 *     rsv2: boolean;
 *     rsv3: boolean;
 *     startByte: number;
 * }
 * ``` */
interface websocket_frame {
    extended: number;
    fin: boolean;
    len: number;
    mask: boolean;
    maskKey: Buffer;
    opcode: number;
    rsv1: boolean;
    rsv2: boolean;
    rsv3: boolean;
    startByte: number;
}

/**
 * Describes the storage mechanism of property agent_ws.clientList.
 * ```typescript
 * interface websocket_list {
 *     [key:string]: websocket_client;
 * }
 * ``` */
interface websocket_list {
    [key:string]: websocket_client;
}

/**
 * Meta data parsed from the second byte of a frame header.
 * ```typescript
 * interface websocket_meta {
 *     lengthExtended: number;
 *     lengthShort: number;
 *     mask: boolean;
 *     startByte: number;
 * }
 * ``` */
interface websocket_meta {
    lengthExtended: number;
    lengthShort: number;
    mask: boolean;
    startByte: number;
}

/**
 * Provides data storage for ping details by which a corresponding pong may reference.
 * ```typescript
 * interface websocket_pong {
 *     callback: (err:NodeJS.ErrnoException, roundTrip:bigint) => void;
 *     start: bigint;
 *     timeOut: NodeJS.Timeout;
 *     timeOutMessage: NodeJS.ErrnoException;
 *     ttl: bigint;
 * }
 * ``` */
interface websocket_pong {
    callback: (err:NodeJS.ErrnoException, roundTrip:bigint) => void;
    start: bigint;
    timeOut: NodeJS.Timeout;
    timeOutMessage: NodeJS.ErrnoException;
    ttl: bigint;
}

/**
 * Display the status of agent sockets
 * ```typescript
 * interface websocket_status {
 *     device: {
 *         [key:string]: socket_status_item;
 *     };
 *     user: {
 *         [key:string]: socket_status_item;
 *     };
 * }
 * ``` */
interface websocket_status {
    device: {
        [key:string]: websocket_status_item;
    };
    user: {
        [key:string]: websocket_status_item;
    };
}

/**
 * Provides an agent socket status descriptor.
 * ```typescript
 * interface websocket_status_item {
 *     portLocal: number;
 *     portRemote: number;
 *     status: socketStatus;
 * }
 * ``` */
interface websocket_status_item {
    portLocal: number;
    portRemote: number;
    status: socketStatus;
}