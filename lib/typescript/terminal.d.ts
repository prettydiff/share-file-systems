/* lib/typescript/terminal.d - TypeScript interfaces used by terminal specific libraries. */

import { ServerResponse, IncomingMessage } from "http";
import { Server, Socket } from "net";
declare global {

    // agents
    interface agentCounts {
        count: number;
        total: number;
    }
    interface agentsConfiguration {
        complete?: (counts:agentCounts) => void;
        countBy: "agent" | "agentType" | "share";
        perAgent?: (agentNames:agentNames, counts:agentCounts) => void;
        perAgentType?: (agentNames:agentNames, counts:agentCounts) => void;
        perShare?: (agentNames:agentNames, counts:agentCounts) => void;
        source: browser | serverVars | settingsItems;
    }
    // ------------------------------------

    // agent_data
    interface agentData {
        device: agents;
        user: agents;
    }
    // ------------------------------------

    // agent_online
    interface agentOutput {
        agent: string;
        agentType: agentType;
        status: "bad" | "good";
        type: "request" | "response";
    }
    // ------------------------------------

    // base64
    interface base64Input {
        callback: Function;
        id: string;
        source: string;
    }
    interface base64Output {
        base64: string;
        filePath: string;
        id: string;
    }
    // ------------------------------------

    // build
    interface buildOrder {
        build: buildPhase[];
        test: buildPhase[];
    }
    interface buildPhaseList {
        browserSelf:() => void;
        clearStorage:() => void;
        commands:() => void;
        configurations:() => void;
        libReadme:() => void;
        lint:() => void;
        service:() => void;
        shellGlobal:() => void;
        simulation:() => void;
        typescript:() => void;
        version:() => void;
    }
    interface docItem {
        description: string;
        name: string;
        namePadded: string;
        path: string;
    }
    // ------------------------------------

    // certificate
    interface certificate {
        certificate: {
            cert: string;
            key: string;
        };
        flag: {
            crt: boolean;
            key: boolean;
        };
    }
    interface certificate_input {
        caDomain: string;
        callback: (logs:string[]) => void;
        caName: string;
        days: number;
        domain: string;
        location: string;
        mode: "create" | "remove";
        name: string;
        organization: string;
        selfSign: boolean;
    }
    interface certificate_remove {
        ca: certificate_remove_item;
        root: certificate_remove_item;
    }
    interface certificate_remove_item {
        command: string;
        flag: boolean;
        logs: string[];
    }
    // ------------------------------------

    // commandList
    interface commandDocumentation {
        [key:string]: commandItem;
    }
    interface commandExample {
        code: string;
        defined: string;
    }
    interface commandItem {
        description: string;
        example: commandExample[];
    }
    interface commandList {
        agent_data: () => void;
        agent_online: () => void;
        base64: (input?:base64Input) => void;
        build: (test?:boolean, callback?:() => void) => void;
        certificate: (config?:certificate_input) => void;
        commands: () => void;
        copy: (params?:copyParams) => void;
        directory: (parameters?:readDirectory) => void;
        get: (address?:string, callback?:(file:Buffer|string) => void) => void;
        hash: (input?:hashInput) => void;
        lint: (callback?:(complete:string, failCount:number) => void) => void;
        mkdir: (dirToMake?:string, callback?:(typeError:Error) => void) => void;
        remove: (filePath?:string, callback?:() => void) => void;
        service: (serverCallback?:serverCallback) => void;
        test: () => void;
        test_browser: () => void;
        test_service: () => void;
        test_simulation: () => void;
        update:() => void;
        version: () => void;
    }
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
            devDependencies: {
                [key:string]: string;
            };
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
        bugs: {
            [key:string]: string;
        };
        command: string;
        description: string;
        devDependencies: {
            [key:string]: string;
        };
        directories: {
            [key:string]: string;
        };
        keywords: string[];
        license: string;
        main: string;
        name: string;
        repository: {
            type: string;
            url: string;
        };
        scripts: {
            [key:string]: string;
        };
        type: "module";
        version: string;
    }
    // ------------------------------------

    // copy
    interface copyLog {
        file: boolean;
        link: boolean;
        mkdir: boolean;
    }
    interface copyStats {
        dirs: number;
        error: number;
        files: number;
        link: number;
        size: number;
    }
    interface copyParams {
        callback: (output:[number, number, number]) => void;
        destination: string;
        exclusions: string[];
        replace: boolean;
        target: string;
    }
    // ------------------------------------

    // directory
    interface directoryData {
        atimeMs: number;
        ctimeMs: number;
        linkPath: string;
        linkType: "" | "directory" | "file";
        mode: number;
        mtimeMs: number;
        size: number;
    }
    interface directoryList extends Array<directoryItem> {
        [index:number]: directoryItem;
        failures?: string[];
    }
    interface readDirectory {
        callback: Function;
        depth: number;
        exclusions: string[];
        mode: directoryMode;
        path: string;
        search?: string;
        symbolic: boolean;
    }
    // ------------------------------------
    
    // hash
    interface hashInput {
        algorithm?: hash;
        callback: Function;
        digest?: "base64" | "hex";
        directInput: boolean;
        id?: string;
        parent?: number;
        source: Buffer | string;
        stat?: directoryData;
    }
    interface hashList {
        [key:string]: string;
    }
    interface hashOutput {
        filePath: string;
        hash: string;
        id?: string;
        parent?: number;
        stat?: directoryData;
    }
    // ------------------------------------

   // heartbeat
   interface heartbeat {
        agentTo: string;
        agentFrom: string;
        agentType: agentType;
        shares: agents;
        shareType: agentType;
        status: agentList | heartbeatStatus;
    }
    interface heartbeatBroadcast {
        deleted: agentList;
        list: heartbeatShare;
        requestType: "heartbeat-complete" | "heartbeat-delete-agents";
        sendShares: boolean;
        status: heartbeatStatus;
    }
    interface heartbeatObject {
        complete: (dataPackage:socketData, transmit:transmit, remoteIP:string) => void;
        deleteAgents: (dataPackage:socketData) => void;
        update: (dataPackage:socketData) => void;
    }
    interface heartbeatShare {
        distribution: string[];
        payload: agents;
        type: agentType;
    }
    // ------------------------------------

    // httpAgent
    interface addresses {
        local: string;
        remote: string;
    }
    interface httpCopyRequest {
        agent: string;
        agentType: agentType;
        dataString: string;
        transmit: transmit;
    }
    interface httpAgent {
        receive: (request:IncomingMessage, serverResponse:ServerResponse) => void;
        request: (config:httpRequest) => void;
        requestCopy: (config:httpCopyRequest) => void;
        respond: (config:responseConfig) => void;
    }
    interface httpError {
        agent: string;
        callType: "request" | "response";
        error: NodeJS.ErrnoException;
        type: agentType;
    }
    interface httpRequest {
        agent:string;
        agentType: agentType;
        callback: (message:socketData) => void;
        ip: string;
        payload: socketData;
        port: number;
    }
    interface httpServer extends Server {
        port: number;
    }
    interface responseConfig {
        message: Buffer | string;
        mimeType: mimeType;
        responseType: requestType;
        serverResponse: ServerResponse;
    }
    interface socketData {
        data: socketDataType;
        service: requestType;
    }
    interface transmit {
        socket: ServerResponse | Socket;
        type: "http" | "ws";
    }
    // ------------------------------------

    // message
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

    // methodPOST
    interface postActions {
        [key:string]: () => void;
    }
    // ------------------------------------

    // remove
    interface removeCount {
        dirs: number;
        file: number;
        link: number;
        size: number;
    }
    // ------------------------------------

    // server
    interface serverCallback {
        agent: string;
        agentType: agentType;
        callback: (output:serverOutput) => void;
    }
    // ------------------------------------

    // settings
    interface settings {
        settings: agents | messageItem[] | ui_data;
        type: settingsType;
    }
    interface settingsItems {
        device: agents;
        message: messageItem[];
        configuration: ui_data;
        user: agents;
    }
    // ------------------------------------

    // websocket
    interface socketClient extends Socket {
        closeFlag: boolean;
        fragment: Buffer[];
        opcode: number;
        sessionId: string;
    }
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
    }
    interface socketList {
        [key:string]: socketClient;
    }
    interface websocket {
        broadcast: (payload:Buffer|socketData, listType:websocketClientType) => void;
        clientList: {
            browser: socketList;
            device: socketList;
            user: socketList;
        };
        listener: (socket:socketClient) => void;
        open: (config:websocketOpen) => void;
        send: (payload:Buffer|socketData, socket:socketClient) => void;
        server: (config:websocketServer) => Server;
    }
    interface websocketOpen {
        agent: string;
        agentType: agentType;
        callback: () => void;
    }
    interface websocketServer {
        address: string;
        callback: (port:number) => void;
        cert: {
            cert: string;
            key: string;
        };
        port: number;
    }
    // ------------------------------------
}