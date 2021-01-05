/* lib/typescript/fileService.d - TypeScript interfaces used by the file services. */

import { ServerResponse, IncomingHttpHeaders, IncomingMessage } from "http";
declare global {
    interface completeStatus {
        countFile: number;
        failures: number;
        percent: number;
        writtenSize: number;
    }
    interface copyActions {
        sameAgent: () => void;
    }
    interface copyStatus {
        failures: string[];
        fileList?: directoryList;
        id: string;
        message: string;
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
        originAgent : string;
        remoteWatch?: string;
        share       : string;
        watch       : string;
    }
    interface fileServiceActions {
        close: (serverResponse:ServerResponse, data:fileService) => void;
        destroy: (serverResponse:ServerResponse, data:fileService) => void;
        directory: (serverResponse:ServerResponse, data:fileService) => void;
        newArtifact: (serverResponse:ServerResponse, data:fileService) => void;
        read: (serverResponse:ServerResponse, data:fileService) => void;
        rename: (serverResponse:ServerResponse, data:fileService) => void;
        write: (serverResponse:ServerResponse, data:fileService) => void;
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
    interface fileServiceSystem {
        actions: fileServiceActions;
        dirCallback: (serverResponse:ServerResponse, data:fileService) => void;
        menu: (serverResponse:ServerResponse, data:fileService) => void;
        respond: fsRespond;
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