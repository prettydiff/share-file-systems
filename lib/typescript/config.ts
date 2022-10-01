/* lib/typescript/config.d - TypeScript interfaces defining method configurations. */

import { AddressInfo } from "net";
import { IncomingMessage } from  "http";

declare global {

    /**
     * For common.agents of common/common.
     * ```typescript
     * interface config_agentIdentity {
     *     complete?: (counts:agentCounts) => void;
     *     countBy: "agent" | "agentType" | "share";
     *     perAgent?: (agentNames:agentNames, counts:agentCounts) => void;
     *     perAgentType?: (agentNames:agentNames, counts:agentCounts) => void;
     *     perShare?: (agentNames:agentNames, counts:agentCounts) => void;
     *     source: browser | settings_item | terminalVariables;
     * }
     * ``` */
    interface config_agentIdentity{
        complete?: (counts:agentCounts) => void;
        countBy: "agent" | "agentType" | "share";
        perAgent?: (agentNames:agentNames, counts:agentCounts) => void;
        perAgentType?: (agentNames:agentNames, counts:agentCounts) => void;
        perShare?: (agentNames:agentNames, counts:agentCounts) => void;
        source: browser | settings_item | terminalVariables_settings;
    }

    /**
     * For base64 of terminal/commands/library/base64.
     * ```typescript
     * interface config_command_base64 {
     *     callback: (title:string, output:base64Output) => void;
     *     direction: "decode" | "encode";
     *     id: string;
     *     source: string;
     * }
     * ``` */
    interface config_command_base64 {
        callback: (title:string, output:base64Output) => void;
        direction: "decode" | "encode";
        id: string;
        source: string;
    }

    /**
     * For build of terminal/commands/library/build
     * ```typescript
     * interface config_command_build {
     *     force_certificate: boolean;
     *     force_port: boolean;
     *     no_compile: boolean;
     *     test: boolean;
     *     type_validate: boolean;
     * }
     * ``` */
    interface config_command_build {
        force_certificate: boolean;
        force_port: boolean;
        no_compile: boolean;
        test: boolean;
        type_validate: boolean;
    }

    /**
     * For certificate of terminal/commands/library/certificate.
     * ```typescript
     * interface config_command_certificate {
     *     callback: commandCallback;
     *     days: number;
     *     location: string;
     *     names: {
     *         intermediate: certificate_name;
     *         organization: string;
     *         root: certificate_name;
     *         server: certificate_name;
     *     };
     *     selfSign: boolean;
     * }
     * ``` */
    interface config_command_certificate {
        callback: commandCallback;
        days: number;
        location: string;
        names: {
            intermediate: certificate_name;
            organization: string;
            root: certificate_name;
            server: certificate_name;
        };
        selfSign: boolean;
    }

    /**
     * For copy of terminal/commands/library/copy.
     * ```typescript
     * interface config_command_copy {
     *     callback: (title:string, text:string[], output?:copy_stats) => void;
     *     destination: string;
     *     exclusions: string[];
     *     replace: boolean;
     *     target: string;
     * }
     * ``` */
    interface config_command_copy {
        callback: (title:string, text:string[], output?:copy_stats) => void;
        destination: string;
        exclusions: string[];
        replace: boolean;
        target: string;
    }

    /**
     * For directory of terminal/commands/library/directory.
     * ```typescript
     * interface config_command_directory {
     *     callback: (title:string, text:string[], dir:directory_list | string[]) => void;
     *     depth: number;
     *     exclusions: string[];
     *     mode: directory_mode;
     *     path: string;
     *     search: string;
     *     symbolic: boolean;
     * }
     * type searchType = "fragment" | "negation" | "regex";
     * ``` */
    interface config_command_directory {
        callback: (title:string, text:string[], dir:directory_list | string[]) => void;
        depth: number;
        exclusions: string[];
        mode: directory_mode;
        path: string;
        search: string;
        symbolic: boolean;
    }

    /**
     * For hash of terminal/commands/library/hash.
     * ```typescript
     * interface config_command_hash {
     *     algorithm: hash;
     *     callback: (title:string, hashOutput:hashOutput) => void;
     *     digest: "base64" | "hex";
     *     directInput: boolean;
     *     id: string;
     *     list: boolean;
     *     parent: number;
     *     source: Buffer | string;
     *     stat: directory_data;
     * }
     * type hash = "blake2d512" | "blake2s256" | "sha1" | "sha3-224" | "sha3-256" | "sha3-384" | "sha3-512" | "sha384" | "sha512-224" | "sha512-256" | "sha512" | "shake128" | "shake256";
     * ``` */
    interface config_command_hash {
        algorithm: hash;
        callback: (title:string, hashOutput:hash_output) => void;
        digest: "base64" | "hex";
        directInput: boolean;
        id: string;
        list: boolean;
        parent: number;
        source: Buffer | string;
        stat: directory_data;
    }

    /**
     * For content of browser/content/configuration.
     * ```typescript
     * interface config_configuration_textSection {
     *     button: boolean;
     *     name: string;
     *     options: string[];
     *     textLabel: string;
     *     textPara: string;
     *     title: string;
     *     type: "radio" | "select" | "text";
     *     value: string;
     * }
     * ``` */
    interface config_configuration_textSection {
        button: boolean;
        name: string;
        options: string[];
        textLabel: string;
        textPara: string;
        title: string;
        type: "radio" | "select" | "text";
        value: string;
    }

    /**
     * For serviceCopy.actions.rename of terminal/server/services/fileCopy.
     * ```typescript
     * interface config_copy_rename {
     *     agentRequest: fileAgent;
     *     callback: (filePath:string) => void;
     *     modalAddress: string;
     *     newName?: string;
     *     path: string;
     *     type: fileType;
     * }
     * ``` */
    interface config_copy_rename {
        agentRequest: fileAgent;
        callback: (filePath:string) => void;
        modalAddress: string;
        newName?: string;
        path: string;
        type: fileType;
    }

    /**
     * For serviceCopy.security of terminal/server/services/fileCopy.
     * ```typescript
     * interface config_copy_security {
     *     agentRequest: fileAgent;
     *     agentSource: fileAgent;
     *     agentWrite: fileAgent;
     *     callback: () => void;
     *     change: boolean;
     *     location: string;
     *     self: copyAgent;
     * }
     * ``` */
    interface config_copy_security {
        agentRequest: fileAgent;
        agentSource: fileAgent;
        agentWrite: fileAgent;
        callback: () => void;
        change: boolean;
        location: string;
        self: copyAgent;
    }

    /**
     * For serviceCopy.status.copy of terminal/server/services/fileCopy.
     * ```typescript
     * interface config_copy_status {
     *     agentSource: fileAgent;
     *     agentRequest: fileAgent;
     *     agentWrite: fileAgent;
     *     countFile: number;
     *     directory: boolean;
     *     failures: number;
     *     location: string[];
     *     message: string;
     *     totalSize: number;
     *     writtenSize: number;
     * }
     * ``` */
    interface config_copy_status {
        agentSource: fileAgent;
        agentRequest: fileAgent;
        agentWrite: fileAgent;
        countFile: number;
        directory: boolean;
        failures: number;
        location: string[];
        message: string;
        totalSize: number;
        writtenSize: number;
    }

    /**
     * For global_events.modal.fileNavigate (optional) of browser/content/global_events.
     * ```typescript
     * interface config_fileNavigate {
     *     agentName: string;
     *     agentType: agentType;
     *     path: string;
     *     readOnly: boolean;
     *     share: string;
     * }
     * ``` */
    interface config_fileNavigate {
        agentName: string;
        agentType: agentType;
        path: string;
        readOnly: boolean;
        share: string;
    }

    /**
     * For transmit_http.request of terminal/server/transmission/transmit_http.
     * ```typescript
     * interface config_http_request {
     *     agent:string;
     *     agentType: agentType;
     *     callback: (message:socketData, response:IncomingMessage) => void;
     *     ip: string;
     *     payload: socketData;
     *     port: number;
     *     stream: boolean;
     * }
     * ``` */
    interface config_http_request {
        agent:string;
        agentType: agentType;
        callback: (message:socketData, response:IncomingMessage) => void;
        ip: string;
        payload: socketData;
        port: number;
        stream: boolean;
    }

    /**
     * For transmit_http.response of terminal/server/transmission/transmit_http.
     * ```typescript
     * interface config_http_respond {
     *     message: Buffer | string;
     *     mimeType: mimeType;
     *     responseType: requestType;
     *     serverResponse: httpSocket_response;
     * }
     * ``` */
    interface config_http_respond {
        message: Buffer | string;
        mimeType: mimeType;
        responseType: requestType;
        serverResponse: httpSocket_response;
    }

    /**
     * For transmit_http.server of terminal/server/transmission/transmit_http.
     * ```typescript
     * interface config_http_server {
     *     browser: boolean;
     *     host: string;
     *     port: number;
     *     test: boolean;
     * }
     * ``` */
    interface config_http_server {
        browser: boolean;
        host: string;
        port: number;
        test: boolean;
    }

    /**
     * For processing of *documentation_command_item* of terminal/utilities/list.
     * ```typescript
     * interface config_list {
     *     empty_line: boolean;
     *     heading: string;
     *     obj: documentation_command;
     *     property: "description" | "each" | "example";
     *     total: boolean;
     * }
     * ``` */
    interface config_list {
        empty_line: boolean;
        heading: string;
        obj: documentation_command;
        property: "description" | "each" | "example";
        total: boolean;
    }

    /**
     * For media.tools.modal of browser/content/media.
     * ```typescript
     * interface config_mediaModal {
     *     agent: string;
     *     agentType: agentType;
     *     mediaType: mediaType;
     * }
     * type mediaType = "audio" | "video";
     * ``` */
    interface config_mediaModal {
        agent: string;
        agentType: agentType;
        mediaType: mediaType;
    }

    /**
     * For modal.content of browser/utilities/modal.
     * ```typescript
     * interface config_modal {
     *     agent: string;
     *     agentIdentity: boolean;
     *     agentType: agentType;
     *     callback?: () => void;
     *     content: Element;
     *     focus?: Element;
     *     height?: number;
     *     history?: string[];
     *     id?: string;
     *     inputs?: ui_input[];
     *     left?: number;
     *     move?: boolean;
     *     read_only: boolean;
     *     resize?: boolean;
     *     scroll?: boolean;
     *     search?: [string, string];
     *     selection?: stringStore;
     *     share?: string;
     *     single?: boolean;
     *     status?: modalStatus;
     *     status_bar?: boolean;
     *     status_text?: string;
     *     text_event?: (event:Event) => void;
     *     text_placeholder?: string;
     *     text_value?: string;
     *     timer?: number;
     *     title: string;
     *     top?: number;
     *     type: modalType;
     *     width?: number;
     *     zIndex?: number;
     * }
     * type modalStatus = "hidden" | "maximized" | "minimized" | "normal";
     * type modalType = "agent-management" | "configuration" | "details" | "document" | "export" | "fileEdit" | "fileNavigate" | "invite-accept" | "media" | "message" | "shares" | "textPad";
     * type ui_input = "cancel" | "close" | "confirm" | "maximize" | "minimize" | "save" | "text";
     * ``` */
    interface config_modal {
        agent: string;
        agentIdentity: boolean;
        agentType: agentType;
        callback?: () => void;
        content: Element;
        focus?: Element;
        height?: number;
        history?: string[];
        id?: string;
        inputs?: ui_input[];
        left?: number;
        move?: boolean;
        read_only: boolean;
        resize?: boolean;
        scroll?: boolean;
        search?: [string, string];
        selection?: stringStore;
        share?: string;
        single?: boolean;
        status?: modalStatus;
        status_bar?: boolean;
        status_text?: string;
        text_event?: (event:Event) => void;
        text_placeholder?: string;
        text_value?: string;
        timer?: number;
        title: string;
        top?: number;
        type: modalType;
        width?: number;
        zIndex?: number;
    }

    /**
     * For fileBrowser.modalAddress method of browser/content/file_browser.
     * ```typescript
     * interface config_modalHistory {
     *     address: string;
     *     history: boolean;
     *     id: string;
     *     payload: service_fileSystem;
     * }
     * ``` */
    interface config_modalHistory {
        address: string;
        history: boolean;
        id: string;
        payload: service_fileSystem;
    }

    /**
     * For util.radioListItem method of browser/utilities/util.
     * ```typescript
     * interface config_radioListItem {
     *     defaultValue: string;
     *     handler: (event:MouseEvent) => void;
     *     list: string[];
     *     name: string;
     *     parent: Element;
     * }
     * ``` */
    interface config_radioListItem {
        defaultValue: string;
        handler: (event:MouseEvent) => void;
        list: string[];
        name: string;
        parent: Element;
    }

    /**
     * For rename of terminal/utilities/rename.
     * ```typescript
     * interface config_rename {
     *     callback: (error:NodeJS.ErrnoException, newList:directory_list[]) => void;
     *     destination: string;
     *     list: directory_list[];
     *     replace: boolean;
     * }
     * ``` */
    interface config_rename {
        callback: (error:NodeJS.ErrnoException, newList:directory_list[]) => void;
        destination: string;
        list: directory_list[];
        replace: boolean;
    }

    /**
     * For browser.methods.delay of terminal/test/application/browser.
     * ```typescript
     * interface config_test_browserDelay {
     *     action: () => void;
     *     browser: boolean;
     *     delay: number;
     *     message: string;
     * }
     * ``` */
    interface config_test_browserDelay {
        action: () => void;
        browser: boolean;
        delay: number;
        message: string;
    }

    /**
     * For browser.methods.execute of terminal/test/application/execute.
     * ```typescript
     * interface config_test_browserExecute {
     *     callback: commandCallback;
     *     demo: boolean;
     *     mode: test_browserMode;
     *     noClose: boolean;
     * }
     * ``` */
    interface config_test_browserExecute {
        callback: commandCallback;
        demo: boolean;
        mode: test_browserMode;
        noClose: boolean;
    }

    /**
     * For evaluation of terminal/test/application/evaluation.
     * ```typescript
     * interface config_test_evaluation {
     *     callback: commandCallback;
     *     fail: number;
     *     index: number;
     *     list: number[];
     *     test: test_item | test_service;
     *     testType: "service" | "simulation";
     *     values: [string, string, string];
     * }
     * ``` */
    interface config_test_evaluation {
        callback: commandCallback;
        fail: number;
        index: number;
        list: number[];
        test: test_item | test_service;
        testType: "service" | "simulation";
        values: [string, string, string];
    }

    /**
     * For service.execute of terminal/test/application/service and simulation.execute of terminal/test/application/simulation
     * ```typescript
     * interface config_test_execute {
     *     complete: commandCallback;
     *     fail: number;
     *     index: number;
     *     list: number[];
     * }
     * ``` */
    interface config_test_execute {
        complete: commandCallback;
        fail: number;
        index: number;
        list: number[];
    }

    /**
     * For transmitLogger of terminal/server/transmission/transmit_logger
     * ```typescript
     * interface config_transmit_logger {
     *     direction:"receive"|"send";
     *     size: number;
     *     socketData:{
     *         data:Buffer | socketDataType | string;
     *         service:requestType;
     *     };
     *     transmit:transmit_type;
     * }
     * ``` */
    interface config_transmit_logger {
        direction:"receive"|"send";
        size: number;
        socketData:{
            data:Buffer | socketDataType | string;
            service:requestType;
        };
        transmit:transmit_type;
    }

    /**
     * For transmit_ws.agentUpdate of terminal/server/transmission/transmit_ws.
     * ```typescript
     * interface config_websocket_agentUpdate {
     *     hash: string;
     *     ip: transmit_addresses_IP;
     *     ipSelected: string;
     *     map: websocket_map;
     *     shares: agentShares;
     *     status: activityStatus;
     *     type: agentType;
     * }
     * ``` */
    interface config_websocket_agentUpdate {
        hash: string;
        ip: transmit_addresses_IP;
        ipSelected: string;
        map: websocket_map;
        shares: agentShares;
        status: activityStatus;
        type: agentType;
    }

    /**
     * For transmit_ws.createSocket of terminal/server/transmission/transmit_ws.
     * ```typescript
     * interface config_websocket_create {
     *     callbackRequest: (socket:websocket_client) => void;
     *     handler: websocket_agentHandler;
     *     hash: string;
     *     headers: string[];
     *     ip: string;
     *     port: number;
     *     type: socketType;
     * }
     * ``` */
    interface config_websocket_create {
        callbackRequest: (socket:websocket_client) => void;
        handler: websocket_agentHandler;
        hash: string;
        headers: string[];
        ip: string;
        port: number;
        type: socketType;
    }

    /**
     * For transmit_ws.socketExtensions of terminal/server/transmission/transmit_ws.
     * ```typescript
     * interface config_websocket_extensions {
     *     callback: (socket:websocket_client) => void;
     *     handler: websocket_agentHandler;
     *     identifier: string;
     *     role: "client"|"server";
     *     socket: websocket_client;
     *     type: socketType;
     *     update: string;
     * }
     * ``` */
    interface config_websocket_extensions {
        callback: (socket:websocket_client) => void;
        handler: websocket_agentHandler;
        identifier: string;
        role: "client"|"server";
        socket: websocket_client;
        type: socketType;
        update: string;
    }

    /**
     * For transmit_ws.openAgent of terminal/server/transmission/transmit_ws.
     * ```typescript
     * interface config_websocket_openAgent {
     *     agent: string;
     *     callback: (socket:websocket_client) => void;
     *     type: agentType;
     * }
     * ``` */
    interface config_websocket_openAgent {
        agent: string;
        callback: (socket:websocket_client) => void;
        type: agentType;
    }

    /**
     * For transmit_ws.openService of terminal/server/transmission/transmit_ws.
     * ```typescript
     * interface config_websocket_openService {
     *     callback: (socket:websocket_client) => void;
     *     handler: websocket_agentHandler;
     *     hash: string;
     *     ip: string;
     *     port: number;
     *     type: socketType;
     * }
     * ``` */
    interface config_websocket_openService {
        callback: (socket:websocket_client) => void;
        handler: websocket_agentHandler;
        hash: string;
        ip: string;
        port: number;
        type: socketType;
    }

    /**
     * For transmit_ws.server of terminal/server/transmission/transmit_ws.
     * ```typescript
     * interface config_websocket_server {
     *     callback: (addressInfo:AddressInfo) => void;
     *     host: string;
     *     options: transmit_tlsOptions;
     *     port: number;
     * }
     * ``` */
    interface config_websocket_server {
        callback: (addressInfo:AddressInfo) => void;
        host: string;
        options: transmit_tlsOptions;
        port: number;
    }

    /**
     * For writeStream of terminal/utilities/writeStream
     * ```typescript
     * interface config_writeStream {
     *     callback: (error:NodeJS.ErrnoException) => void;
     *     destination: string;
     *     source: string;
     *     stat: directory_data;
     * }
     * ``` */
    interface config_writeStream {
        callback: (error:NodeJS.ErrnoException) => void;
        destination: string;
        source: Buffer | string;
        stat: directory_data;
    }
}