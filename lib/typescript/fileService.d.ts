/* lib/typescript/fileService.d - TypeScript interfaces used by the file services. */

import { ServerResponse, IncomingHttpHeaders, IncomingMessage } from "http";
declare global {
    interface completeStatus {
        countFile: number;
        failures: number;
        percent: string;
        writtenSize: number;
    }
    interface copyFileRequest {
        brotli: number;
        file_location: string;
        size: number;
        start_location: string;
    }
    interface copyStatus {
        failures: string[];
        fileList?: directoryList;
        id: string;
        message: string;
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
        logRecursion: boolean;
        serverResponse: ServerResponse;
        value: string;
    }
    interface fsRemote {
        dirs: directoryList | "missing" | "noShare" | "readOnly";
        fail: string[];
        id: string;
    }
    interface fsRespond {
        copy: (serverResponse:ServerResponse, data:copyStatus) => void;
        dir: (serverResponse:ServerResponse, data:fsRemote) => void;
        error: (serverResponse:ServerResponse, message:string, action:serviceType) => void;
        read: (serverResponse:ServerResponse, list:stringDataList, action:serviceType) => void;
    }
    interface fsUpdateRemote {
        agent: string;
        agentType: agentType;
        dirs: directoryList;
        fail: string[];
        location: string;
        status?: copyStatus;
    }
    interface nodeCopyParams {
        callback: Function;
        destination: string;
        exclusions: string[];
        target: string;
    }
    interface remoteCopyListData {
        directories: number;
        fileCount: number;
        fileSize: number;
        list: [string, string, string, number][];
        stream: boolean;
    }
    interface systemDataCopy {
        action     : copyTypes;
        agent      : string;
        agentType  : agentType;
        copyAgent  : string;
        copyShare? : string;
        copyType   : agentType;
        cut        : boolean;
        destination: string;
        id         : string;
        location   : string[];
        originAgent: string;
    }
    interface systemDataFile {
        action      : serviceType;
        agent       : string;
        agentType   : agentType;
        depth       : number;
        id          : string;
        location    : string[];
        name        : string;
        remoteWatch?: string;
        share       : string;
        watch       : string;
    }
    interface systemRequestFiles {
        data: systemDataCopy;
        fileData: remoteCopyListData;
        logRecursion: boolean;
    }
    interface systemServiceCopy {
        actions: {
            requestFiles: (serverResponse:ServerResponse, config:systemRequestFiles) => void;
            requestList: (serverResponse:ServerResponse, data:systemDataCopy, index:number) => void;
            sameAgent: (serverResponse:ServerResponse, data:systemDataCopy) => void;
            sendFile: (serverResponse:ServerResponse, data:copyFileRequest) => void;
        };
        copyMessage: (numbers:completeStatus, cut:boolean) => string;
        percent: (numerator:number, denominator:number) => string;
    }
    interface systemServiceFile {
        actions: {
            close: (serverResponse:ServerResponse, data:systemDataFile) => void;
            destroy: (serverResponse:ServerResponse, data:systemDataFile) => void;
            directory: (serverResponse:ServerResponse, data:systemDataFile) => void;
            newArtifact: (serverResponse:ServerResponse, data:systemDataFile) => void;
            read: (serverResponse:ServerResponse, data:systemDataFile) => void;
            rename: (serverResponse:ServerResponse, data:systemDataFile) => void;
            write: (serverResponse:ServerResponse, data:systemDataFile) => void;
        };
        dirCallback: (serverResponse:ServerResponse, data:systemDataFile) => void;
        menu: (serverResponse:ServerResponse, data:systemDataFile) => void;
        respond: fsRespond;
    }
}