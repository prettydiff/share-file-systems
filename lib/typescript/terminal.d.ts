/* lib/typescript/terminal.d - TypeScript interfaces used by terminal specific libraries. */

import { ServerResponse } from "http";
import { Server, Socket } from "net";

declare global {

    // agentData

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
    // ------------------------------------

    // base64

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
    // ------------------------------------

    // build

    /**
     * Determines the order of tasks by task type from object *buildPhaseList*.
     * ```typescript
     * interface buildOrder {
     *     build: buildPhase[];
     *     test: buildPhase[];
     * }
     * ``` */
    interface buildOrder {
        build: buildPhase[];
        test: buildPhase[];
    }

    /**
     * Certificates span two build phases, one for certificate creation and the second in os_specific tasks for installation.
     * ```typescript
     * interface certFlags {
     *     forced: boolean;
     *     path: string;
     *     selfSign: boolean;
     * }
     * ``` */
    interface certFlags {
        forced: boolean;
        path: string;
        selfSign: boolean;
    }

    /**
     * Stores data gathered from the comments on the top line of each code file to build automated documentation in build task *libReadme*.
     * ```typescript
     * interface docItem {
     *     description: string;
     *     name: string;
     *     namePadded: string;
     *     path: string;
     * }
     * ``` */
    interface docItem {
        description: string;
        name: string;
        namePadded: string;
        path: string;
    }

    /**
     * Stores handlers for a fs.stat operation used to identify the type of POSIX operating system by location of root certificate store available.
     * ```typescript
     * interface posixDistribution {
     *     arch: (statErr:NodeJS.ErrnoException) => void;
     *     darwin: (statErr:NodeJS.ErrnoException) => void;
     *     fedora: (statErr:NodeJS.ErrnoException) => void;
     *     ubuntu: (statErr:NodeJS.ErrnoException) => void;
     * }
     * ``` */
    interface posixDistribution {
        arch: (statErr:NodeJS.ErrnoException) => void;
        darwin: (statErr:NodeJS.ErrnoException) => void;
        fedora: (statErr:NodeJS.ErrnoException) => void;
        ubuntu: (statErr:NodeJS.ErrnoException) => void;
    }
    // ------------------------------------

    // certificate

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
    // ------------------------------------

    // commandList

    /**
     * The parent structure for storing command related documentation.
     * ```typescript
     * interface commandDocumentation {
     *     [key:string]: commandItem;
     * }
     * ``` */
    interface commandDocumentation {
        [key:string]: commandItem;
    }

    /**
     * The code example component of a *commandItem* portion of documentation.
     * ```typescript
     * interface commandExample {
     *     code: string;
     *     defined: string;
     * }
     * ``` */
    interface commandExample {
        code: string;
        defined: string;
    }

    /**
     * A single item of documentation that comprises the *commandDocumentation* list.
     * ```typescript
     * interface commandItem {
     *     description: string;
     *     example: commandExample[];
     * }
     * ``` */
    interface commandItem {
        description: string;
        example: commandExample[];
    }

    /**
     * An object used in the processing of *commandItem* types from JSON data points to formatted output to print to terminal.
     * ```typescript
     * interface nodeLists {
     *     empty_line: boolean;
     *     heading: string;
     *     obj: commandDocumentation;
     *     property: "description" | "each" | "example";
     *     total: boolean;
     * }
     * ``` */
    interface nodeLists {
        empty_line: boolean;
        heading: string;
        obj: commandDocumentation;
        property: "description" | "each" | "example";
        total: boolean;
    }
    // ------------------------------------

    // configurations - lib/configurations.json - global application environment rules
    interface configurationApplication {
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
        "package-lock.json": {
            name: string;
            version: string;
            lockfileVersion: number;
            requires: boolean;
            dependencies: {
                [key:string]: {
                    integrity: string;
                    resolved: string;
                    version: string;
                };
            };
            devDependencies: stringStore;
        };
    }
    interface eslintDelimiterItem {
        [key:string]: {
            delimiter: string;
            requireLast: boolean;
        };
    }
    interface packageJSON {
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
    // ------------------------------------

    // copy

    /**
     * Provides statistics to verbose output of the copy command.
     * ```typescript
     * interface copyStats {
     *     dirs: number;
     *     error: number;
     *     files: number;
     *     link: number;
     *     size: number;
     * }
     * ``` */
    interface copyStats {
        dirs: number;
        error: number;
        files: number;
        link: number;
        size: number;
    }
    // ------------------------------------

    // directory

    /**
     * Meta data comprising the final index of a *directoryItem*.
     * ```typescript
     * interface directoryData {
     *     atimeMs: number;
     *     ctimeMs: number;
     *     linkPath: string;
     *     linkType: "" | "directory" | "file";
     *     mode: number;
     *     mtimeMs: number;
     *     size: number;
     * }
     * ``` */
    interface directoryData {
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
     * interface directoryList extends Array<directoryItem> {
     *     [index:number]: directoryItem;
     *     failures?: string[];
     * }
     * type directoryItem = [string, fileType, string, number, number, directoryData, string];
     * type fileType = "directory" | "error" | "file" | "link";
     * ``` */
    interface directoryList extends Array<directoryItem> {
        [index:number]: directoryItem;
        failures?: string[];
    }
    // ------------------------------------
    
    // hash

    /**
     * The output structure of the *hash* command.
     * ```typescript
     * interface hashOutput {
     *     filePath: string;
     *     hash: string;
     *     id?: string;
     *     parent?: number;
     *     stat?: directoryData;
     * }
     * ``` */
    interface hashOutput {
        filePath: string;
        hash: string;
        id?: string;
        parent?: number;
        stat?: directoryData;
    }
    // ------------------------------------

    // httpAgent

    /**
     * Output of method utilities/getAddress which stores the primary local and remote IP addresses for a given agent.
     * ```typescript
     * interface addresses {
     *     local: string;
     *     remote: string;
     * }
     * ``` */
    interface addresses {
        local: string;
        remote: string;
    }

    /**
     * Stores certificate data in advance of launching a service using HTTPS or WSS protocols.
     * ```typescript
     * interface certificate {
     *     certificate: {
     *         ca: string;
     *         cert: string;
     *         key: string;
     *     };
     *     flag: {
     *         ca: boolean;
     *         crt: boolean;
     *         key: boolean;
     *     };
     * }
     * ``` */
    interface certificate {
        certificate: {
            ca: string;
            cert: string;
            key: string;
        };
        flag: {
            ca: boolean;
            crt: boolean;
            key: boolean;
        };
    }

    /**
     * This generally describes the method list available to server/transmission/receiver.
     * ```typescript
     * interface postActions {
     *     [key:string]: (socketData:socketData, transmit:transmit) => void;
     * }
     * ``` */
    interface postActions {
        [key:string]: (socketData:socketData, transmit:transmit) => void;
    }

    /**
     * A container for a socket and the type of protocol that socket represents as necessary to separate services from transmission.
     * ```typescript
     * interface transmit {
     *     socket: ServerResponse | Socket;
     *     type: "http" | "ws";
     * }
     * ``` */
    interface transmit {
        socket: ServerResponse | Socket;
        type: "http" | "ws";
    }
    // ------------------------------------

    // message

    /**
     * The means of describing a text message item.  The corresponding service is just an array of messageItem types.
     * ```typescript
     * interface messageItem {
     *     agentFrom: string;
     *     agentTo: string;
     *     agentType: agentType;
     *     date: number;
     *     offline?: boolean;
     *     message: string;
     *     mode: messageMode;
     * }
     * ``` */
    interface messageItem {
        agentFrom: string;
        agentTo: string;
        agentType: agentType;
        date: number;
        offline?: boolean;
        message: string;
        mode: messageMode;
    }
    // ------------------------------------

    // remove

    /**
     * A container of numbers for providing statistics to verbose output of command *remove*.
     * ```typescript
     * interface removeCount {
     *     dirs: number;
     *     file: number;
     *     link: number;
     *     size: number;
     * }
     * ``` */
    interface removeCount {
        dirs: number;
        file: number;
        link: number;
        size: number;
    }
    // ------------------------------------

    // server

    /**
     * Parameters for an optional callback function to the agent_http.server method in the cases where other utilities are spawning an http server.
     * ```typescript
     * interface serverCallback {
     *     agent: string;
     *     agentType: agentType;
     *     callback: (output:serverOutput) => void;
     * }
     * ``` */
    interface serverCallback {
        agent: string;
        agentType: agentType;
        callback: (output:serverOutput) => void;
    }

    /**
     * The object returned to the optional callback of agent_http.server.
     * ```typescript
     * interface serverOutput {
     *     agent: string;
     *     agentType: agentType;
     *     ports: ports;
     *     server: Server;
     * }
     * ``` */
    interface serverOutput {
        agent: string;
        agentType: agentType;
        ports: ports;
        server: Server;
    }
    // ------------------------------------

    // settings

    /**
     * A means of organizing all stored data types into a single object for portability.
     * ```typescript
     * interface settingsItems {
     *     device: agents;
     *     message: service_message;
     *     configuration: ui_data;
     *     user: agents;
     * }
     * ``` */
    interface settingsItems {
        device: agents;
        message: service_message;
        configuration: ui_data;
        user: agents;
    }
    // ------------------------------------

    // websocket

    /**
     * Extends the native *Socket* type to represent a websocket instance with additional properties.
     * ```typescript
     * interface socketClient extends Socket {
     *     fragment: Buffer[];
     *     pong: bigint;
     *     opcode: number;
     *     sessionId: string;
     *     status: socketStatus;
     *     type: agentType | "browser";
     * }
     * ``` */
     interface socketClient extends Socket {
        fragment: Buffer[];
        opcode: number;
        sessionId: string;
        status: socketStatus;
        type: agentType | "browser";
    }

    /**
     * A construct necessary to describe the binary frame header of a websocket message as defined in RFC 6455.
     * ```typescript
     * interface socketFrame {
     *     fin: boolean;
     *     rsv1: string;
     *     rsv2: string;
     *     rsv3: string;
     *     opcode: number;
     *     mask: boolean;
     *     len: number;
     *     extended: number;
     *     maskKey: Buffer;
     *     payload: Buffer;
     *     startByte: number;
     * }
     * ``` */
    interface socketFrame {
        fin: boolean;
        rsv1: string;
        rsv2: string;
        rsv3: string;
        opcode: number;
        mask: boolean;
        len: number;
        extended: number;
        maskKey: Buffer;
        payload: Buffer;
        startByte: number;
    }

    /**
     * Describes the storage mechanism of property agent_ws.clientList.
     * ```typescript
     * interface socketList {
     *     [key:string]: socketClient;
     * }
     * ``` */
    interface socketList {
        [key:string]: socketClient;
    }

    /**
     * Display the status of agent sockets
     * ```typescript
     * interface websocketStatus {
     *     device: {
     *         [key:string]: socketStatusItem;
     *     };
     *     user: {
     *         [key:string]: socketStatusItem;
     *     };
     * }
     * ``` */
    interface websocketStatus {
        device: {
            [key:string]: websocketStatusItem;
        };
        user: {
            [key:string]: websocketStatusItem;
        };
    }

    interface websocketStatusItem {
        portLocal: number;
        portRemote: number;
        status: socketStatus;
    }
    // ------------------------------------
}