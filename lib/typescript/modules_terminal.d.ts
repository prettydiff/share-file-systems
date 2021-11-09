/* lib/typescript/modules_terminal.d - TypeScript interfaces that define master library modules used in the terminal. */

import { ServerResponse, IncomingMessage } from "http";
import { Server } from "net";

declare global {
    /**
     * Methods for handling HTTP traffic.
     */
    interface agent_http {
        receive: (request:IncomingMessage, serverResponse:ServerResponse) => void;
        request: (config:httpRequest) => void;
        requestCopy: (config:httpCopyRequest) => void;
        respond: (config:responseConfig) => void;
        respondEmpty: (transmit:transmit) => void;
        server: (serverOptions:serverOptions, serverCallback:serverCallback) => void;
    }

    /**
     * Methods for handling the various stages of the web socket lifecycle.
     */
    interface agent_ws {
        broadcast: (payload:Buffer|socketData, listType:websocketClientType) => void;
        clientList: {
            browser: socketList;
            device: socketList;
            user: socketList;
        };
        listener: (socket:socketClient) => void;
        open: (config:websocketOpen) => void;
        send: (payload:Buffer|socketData, socket:socketClient, opcode?:1|2|8|9) => void;
        server: (config:websocketServer) => Server;
    }

    /**
     * A list of methods used for build tasks and tasks associated with the *test* command.
     */
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

    /**
     * A map of command names to their respective terminal handlers.
     */
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
        service: (serverOptions?:serverOptions, serverCallback?:serverCallback) => void;
        test: () => void;
        test_browser: () => void;
        test_service: () => void;
        test_simulation: () => void;
        update:() => void;
        version: () => void;
        websocket: () => void;
    }

    /**
     * Methods that comprise the heartbeat tasks.
     */
    interface heartbeatObject {
        "complete": () => void;
        "delete-agents": () => void;
        "update": () => void;
    }

    /**
     * Methods for processing the various stages of the invitation process.
     */
    interface inviteActions {
        "invite-complete": () => void;
        "invite-request": () => void;
        "invite-response": () => void;
        "invite-start": () => void;
    }

    /**
     * Methods for managing and routing file system copy across a network and the security model.
     */
    interface systemServiceCopy {
        actions: {
            requestFiles: (config:service_fileRequest, transmit:transmit) => void;
            requestList: (data:service_copy, index:number, transmit:transmit) => void;
            sameAgent: (data:service_copy, transmit:transmit) => void;
            sendFile: (data:service_copyFile, transmit:transmit) => void;
        };
        cutStatus: (data:service_copy, fileList:remoteCopyListData, transmit:transmit) => void;
        status: (config:copyStatusConfig, transmit:transmit) => void;
    }

    /**
     * Methods for managing file system actions other than copy/cut across a network and the security model.
     */
    interface systemServiceFile {
        actions: {
            changeName: (data:service_fileSystem, transmit:transmit) => void;
            close: (data:service_fileSystem, transmit:transmit) => void;
            destroy: (data:service_fileSystem, transmit:transmit) => void;
            directory: (data:service_fileSystem, transmit:transmit) => void;
            execute: (data:service_fileSystem, transmit:transmit) => void;
            newArtifact: (data:service_fileSystem, transmit:transmit) => void;
            read: (data:service_fileSystem, transmit:transmit) => void;
            write: (data:service_fileSystem, transmit:transmit) => void;
        };
        menu: (data:service_fileSystem, transmit:transmit) => void;
        statusBroadcast: (data:service_fileSystem, status:service_fileStatus) => void;
        statusMessage: (data:service_fileSystem, transmit:transmit, dirs:directoryResponse) => void;
    }

    /**
     * Methods associated with the browser test automation logic.
     */
    interface testBrowserMethods {
        close: (data:service_testBrowser) => void;
        delay: (config:testBrowserDelay) => void;
        execute: (args:testBrowserArgs) => void;
        exit: (index:number) => void;
        iterate: (index:number) => void;
        request: (item:service_testBrowser) => void;
        ["reset-browser"]: (data:service_testBrowser) => void;
        ["reset-complete"]: () => void;
        ["reset-request"]: (data:service_testBrowser) => void;
        respond: (item:service_testBrowser) => void;
        result: (item:service_testBrowser) => void;
        route: (socketData:socketData, transmit:transmit) => void;
        sendBrowser: (item:service_testBrowser) => void;
    }
}