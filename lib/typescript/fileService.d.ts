/* lib/typescript/fileService.d - TypeScript interfaces used by the file services. */

import { ServerResponse, IncomingHttpHeaders, IncomingMessage } from "http";
declare global {
    interface copyFileRequest {
        agent: fileAgent;
        brotli: number;
        file_name: string;
        file_location: string;
        size: number;
    }
    interface copyStatusConfig {
        agentSource: fileAgent;
        agentWrite: fileAgent;
        countFile: number;
        directory: boolean;
        failures: number;
        location: string[];
        message: string;
        totalSize: number;
        writtenSize: number;
    }
    interface fileAgent {
        id: string;
        modalAddress: string;
        share: string;
        type: agentType;
    }
    interface fileRoute {
        agent: string;
        agentData: "agent"|"agentSource"|"agentWrite"|"data.agent";
        agentType: agentType;
        callback: (message:socketData) => void;
        data: copyFileRequest | systemDataCopy | systemDataFile | systemRequestFiles;
        requestType: requestType;
        transmit: transmit;
    }
    interface fileServiceRequest {
        callback: (message:Buffer|string, headers:IncomingHttpHeaders) => void;
        data: systemDataFile;
        errorMessage: string;
        serverResponse: ServerResponse;
        stream: (message:IncomingMessage) => void;
    }
    interface fileServiceWatch {
        data: systemDataFile;
        serverResponse: ServerResponse;
        value: string;
    }
    interface fileStatusMessage {
        address: string;
        agent: string;
        agentType: agentType;
        fileList: directoryResponse;
        message: string;
    }
    interface fileUser {
        action: copyTypes | fileAction | "cut";
        agent: fileAgent;
        callback: (device:string) => void;
        transmit: transmit;
    }
    interface fsDetails {
        dirs: directoryResponse;
        id: string;
    }
    interface remoteCopyListData {
        directories: number;
        fileCount: number;
        fileSize: number;
        list: [string, string, string, number][];
    }
    interface systemDataCopy {
        action     : copyTypes;
        agentSource: fileAgent;
        agentWrite : fileAgent;
        cut        : boolean;
        execute    : boolean;
        location   : string[];
    }
    interface systemDataFile {
        action  : fileAction;
        agent   : fileAgent;
        depth   : number;
        location: string[];
        name    : string;
    }
    interface systemRequestFiles {
        action: "copy-request-files";
        copyData: systemDataCopy;
        fileData: remoteCopyListData;
    }
    interface systemServiceCopy {
        actions: {
            requestFiles: (config:systemRequestFiles, transmit:transmit) => void;
            requestList: (data:systemDataCopy, index:number, transmit:transmit) => void;
            sameAgent: (data:systemDataCopy, transmit:transmit) => void;
            sendFile: (data:copyFileRequest, transmit:transmit) => void;
        };
        cutStatus: (data:systemDataCopy, fileList:remoteCopyListData, transmit:transmit) => void;
        status: (config:copyStatusConfig, transmit:transmit) => void;
    }
    interface systemServiceFile {
        actions: {
            changeName: (data:systemDataFile, transmit:transmit) => void;
            close: (data:systemDataFile, transmit:transmit) => void;
            destroy: (data:systemDataFile, transmit:transmit) => void;
            directory: (data:systemDataFile, transmit:transmit) => void;
            execute: (data:systemDataFile, transmit:transmit) => void;
            newArtifact: (data:systemDataFile, transmit:transmit) => void;
            read: (data:systemDataFile, transmit:transmit) => void;
            write: (data:systemDataFile, transmit:transmit) => void;
        };
        menu: (data:systemDataFile, transmit:transmit) => void;
        statusBroadcast: (data:systemDataFile, status:fileStatusMessage) => void;
        statusMessage: (data:systemDataFile, transmit:transmit, dirs:directoryResponse) => void;
    }
}