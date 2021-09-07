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
        serverResponse: ServerResponse;
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
        callback: (message:Buffer | string, headers:IncomingHttpHeaders) => void;
        data: copyFileRequest | systemDataCopy | systemDataFile | systemRequestFiles;
        dataString: string;
        dataType: "copy" | "file";
        requestType: requestType;
        serverResponse: ServerResponse;
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
        serverResponse: ServerResponse;
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
        data: systemDataCopy;
        fileData: remoteCopyListData;
    }
    interface systemServiceCopy {
        actions: {
            requestFiles: (serverResponse:ServerResponse, config:systemRequestFiles) => void;
            requestList: (serverResponse:ServerResponse, data:systemDataCopy, index:number) => void;
            sameAgent: (serverResponse:ServerResponse, data:systemDataCopy) => void;
            sendFile: (serverResponse:ServerResponse, data:copyFileRequest) => void;
        };
        cutStatus: (data:systemDataCopy, fileList:remoteCopyListData) => void;
        status: (config:copyStatusConfig) => void;
    }
    interface systemServiceFile {
        actions: {
            changeName: (serverResponse:ServerResponse, data:systemDataFile) => void;
            close: (serverResponse:ServerResponse, data:systemDataFile) => void;
            destroy: (serverResponse:ServerResponse, data:systemDataFile) => void;
            directory: (serverResponse:ServerResponse, data:systemDataFile) => void;
            execute: (serverResponse:ServerResponse, data:systemDataFile) => void;
            newArtifact: (serverResponse:ServerResponse, data:systemDataFile) => void;
            read: (serverResponse:ServerResponse, data:systemDataFile) => void;
            write: (serverResponse:ServerResponse, data:systemDataFile) => void;
        };
        menu: (serverResponse:ServerResponse, data:systemDataFile) => void;
        respond: {
            details: (serverResponse:ServerResponse, details:fsDetails) => void;
            error: (serverResponse:ServerResponse, message:string) => void;
            read: (serverResponse:ServerResponse, list:stringData[]) => void;
            status: (serverResponse:ServerResponse, status:fileStatusMessage) => void;
            write: (serverResponse:ServerResponse) => void;
        };
        statusBroadcast: (data:systemDataFile, status:fileStatusMessage) => void;
        statusMessage: (serverResponse:ServerResponse, data:systemDataFile, dirs:directoryResponse) => void;
    }
}