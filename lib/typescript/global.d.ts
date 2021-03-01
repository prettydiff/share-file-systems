/* lib/typescript/global.d - TypeScript interfaces used in many unrelated areas of the application. */
import { ServerResponse } from "http";
declare global {
    interface agent {
        ipAll: networkAddresses;
        ipSelected: string;
        name: string;
        port: number;
        shares: agentShares;
    }
    interface agentList {
        device: string[];
        user: string[];
    }
    interface agentNames {
        agent?: string;
        agentType: agentType;
        share?: string;
    }
    interface agentOnline {
        agent: string;
        agentType: agentType;
        ipAll: networkAddresses;
        ipSelected: string;
        mode: testListType;
    }
    interface agents {
        [key:string]: agent;
    }
    interface agentShare {
        execute: boolean;
        name: string;
        readOnly: boolean;
        type: shareType;
    }
    interface agentShares {
        [key:string]: agentShare;
    }
    interface error {
        error: string;
        stack: string[];
    }
    interface flagList {
        [key:string]: boolean;
    }
    interface hashAgent {
        device: string;
        user: string;
    }
    interface hashShare {
        device: string;
        share: string;
        type: shareType;
    }
    interface hashShareResponse {
        device: string;
        hash: string;
        share: string;
        type: shareType;
    }
    interface heartbeatUpdate {
        agentFrom: "localhost-browser" | "localhost-terminal";
        broadcastList: heartbeatShare;
        response: ServerResponse;
        shares: agents;
        status: heartbeatStatus;
        type: agentType;
    }
    interface nodeError extends Error {
        address: string;
        code: string;
        Error: Error;
        port: number;
    }
    interface nodeLists {
        empty_line: boolean;
        heading: string;
        obj: any;
        property: "each" | string;
        total: boolean;
    }
    interface stringData {
        content: string;
        id: string;
        path: string;
    }
    interface stringDataList extends Array<stringData> {
        [index:number]: stringData;
    }
}