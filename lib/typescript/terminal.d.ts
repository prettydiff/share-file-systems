/* lib/typescript/terminal.d - TypeScript interfaces used by terminal specific libraries. */

import { ServerResponse, IncomingHttpHeaders } from "http";
import { Server } from "net";
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

    // error
    interface httpException extends NodeJS.ErrnoException {
        address: string;
        port: number;
    }
    // ------------------------------------
    
    // hash
    interface hashInput {
        algorithm?: hash;
        callback: Function;
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
        dataString: string;
        ip: string;
        task: requestType;
        serverResponse: ServerResponse;
    }
    interface heartbeatShare {
        distribution: string[];
        payload: agents;
        type: agentType;
    }
    // ------------------------------------

    // httpClient
    interface httpConfiguration {
        agent:string;
        agentType: agentType;
        callback: (message:Buffer|string, headers:IncomingHttpHeaders) => void;
        ip: string;
        payload: Buffer|string;
        port: number;
        requestError: (error:httpException, agent?:string, type?:agentType) => void;
        requestType: requestType;
        responseError: (error:httpException, agent?:string, type?:agentType) => void;
    }
    interface httpError {
        agent: string;
        callType: "request" | "response";
        error: NodeJS.ErrnoException;
        type: agentType;
    }
    interface httpServer extends Server {
        port: number;
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

    // response
    interface responseConfig {
        message: Buffer | string;
        mimeType: mimeType;
        responseType: requestType;
        serverResponse: ServerResponse;
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
        data: agents | messageItem[] | ui_data;
        serverResponse: ServerResponse;
        type: settingsType;
    }
    interface settingsItems {
        device: agents;
        message: messageItem[];
        configuration: ui_data;
        user: agents;
    }
    // ------------------------------------

}