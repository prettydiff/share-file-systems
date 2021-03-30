/* lib/typescript/terminal.d - TypeScript interfaces used by terminal specific libraries. */

import { Stats } from "fs";
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
        source: browser | serverVars | storageItems;
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
    interface commandExample {
        code: string;
        defined: string;
    }
    interface commandItem {
        description: string;
        example: commandExample[];
    }
    interface commandList {
        [key:string]: commandItem;
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
        target: string;
    }
    // ------------------------------------

    // directory
    interface directoryData {
        atimeMs: number;
        ctimeMs: number;
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
        directInput: boolean;
        id?: string;
        parent?: number;
        source: Buffer | string;
        stat?: Stats;
    }
    interface hashList {
        [key:string]: string;
    }
    interface hashOutput {
        filePath: string;
        hash: string;
        id?: string;
        parent?: number;
        stat?: Stats;
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
        agentType: agentType;
        callback: (message:Buffer|string, headers:IncomingHttpHeaders) => void;
        ip: string;
        payload: Buffer|string;
        port: number;
        requestError: (error:nodeError, agent?:string, type?:agentType) => void;
        requestType: requestType;
        responseError: (error:nodeError, agent?:string, type?:agentType) => void;
    }
    interface httpError {
        agent: string;
        callType: "request" | "response";
        error: nodeError;
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
        message: string;
    }
    // ------------------------------------

    // methodPOST
    interface postActions {
        [key:string]: () => void;
    }
    // ------------------------------------

    // readFile
    interface readFile {
        callback: Function;
        id?: string;
        index: number;
        path: string;
        stat: directoryData;
    }
    // ------------------------------------

    // remove
    interface removeCount {
        dirs: number;
        file: number;
        link: number;
        size: number;
    }
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

    // storage
    interface storage {
        data: agents | messageItem[] | ui_data;
        serverResponse: ServerResponse;
        type: storageType;
    }
    interface storageItems {
        device: agents;
        message: messageItem[];
        settings: ui_data;
        user: agents;
    }
    // ------------------------------------

}