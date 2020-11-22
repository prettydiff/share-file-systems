/* lib/typescript/fileService.d - TypeScript interfaces used by the file services. */

import { ServerResponse, IncomingHttpHeaders, IncomingMessage } from "http";
declare global {
    interface completeStatus {
        countFile: number;
        failures: number;
        percent: number;
        writtenSize: number;
    }
    interface copyStatus {
        failures: string[];
        fileList?: directoryList;
        message: string;
        target: string;
    }
    interface fileService {
        action      : serviceType;
        agent       : string;
        agentType   : agentType;
        copyAgent   : string;
        copyShare?  : string;
        copyType    : agentType;
        depth       : number;
        id          : string;
        location    : string[];
        name        : string;
        remoteWatch?: string;
        share       : string;
        watch       : string;
    }
    interface fileServiceRequest {
        callback: (message:Buffer|string, headers:IncomingHttpHeaders) => void;
        data: fileService;
        errorMessage: string;
        serverResponse: ServerResponse;
        stream: (message:IncomingMessage) => void;
    }
    interface fileServiceRequestFiles {
        data: fileService;
        fileData: remoteCopyListData;
        logRecursion: boolean;
        serverResponse: ServerResponse;
    }
    interface fileServiceWatch {
        data: fileService;
        logRecursion: boolean;
        serverResponse: ServerResponse;
        value: string;
    }
    interface fsRemote {
        dirs: directoryList | "missing" | "noShare" | "readOnly";
        fail: string[];
        id: string;
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
    interface remoteCopyList {
        callback: Function;
        data: fileService;
        files: [string, string, string, number][];
        index: number;
        length: number;
        logRecursion: boolean;
    }
    interface remoteCopyListData {
        directories: number;
        fileCount: number;
        fileSize: number;
        list: [string, string, string, number][];
        stream: boolean;
    }
}