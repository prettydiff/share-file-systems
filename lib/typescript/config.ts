/* lib/typescript/config.d - TypeScript interfaces defining method configurations. */

import { AddressInfo } from "net";

declare global {

    // environment - browser

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
     * For modal.content of browser/utilities/modal.
     * ```typescript
     * interface config_modal {
     *     agent: string;
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
     * type modalType = "configuration" | "details" | "document" | "export" | "fileEdit" | "fileNavigate" | "invite-accept" | "invite-request" | "media" | "message" | "share_delete" | "shares" | "textPad";
     * type ui_input = "cancel" | "close" | "confirm" | "maximize" | "minimize" | "save" | "text";
     * ``` */
    interface config_modal {
        agent: string;
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
    // ------------------------------------

    // environment - common

    /**
     * For common.agents of common/common.
     * ```typescript
     * interface config_agentIdentity {
     *     complete?: (counts:agentCounts) => void;
     *     countBy: "agent" | "agentType" | "share";
     *     perAgent?: (agentNames:agentNames, counts:agentCounts) => void;
     *     perAgentType?: (agentNames:agentNames, counts:agentCounts) => void;
     *     perShare?: (agentNames:agentNames, counts:agentCounts) => void;
     *     source: browser | settingsItems | terminalVariables;
     * }
     * ``` */
    interface config_agentIdentity{
        complete?: (counts:agentCounts) => void;
        countBy: "agent" | "agentType" | "share";
        perAgent?: (agentNames:agentNames, counts:agentCounts) => void;
        perAgentType?: (agentNames:agentNames, counts:agentCounts) => void;
        perShare?: (agentNames:agentNames, counts:agentCounts) => void;
        source: browser | settingsItems | terminalVariables_settings;
    }
    // ------------------------------------

    // environment - terminal

    /**
     * For base64 of terminal/commands/base64.
     * ```typescript
     * interface config_command_base64 {
     *     callback: (output:base64Output) => void;
     *     id: string;
     *     source: string;
     * }
     * ``` */
        interface config_command_base64 {
        callback: (output:base64Output) => void;
        id: string;
        source: string;
    }

    /**
     * For certificate of terminal/commands/certificate.
     * ```typescript
     * interface config_command_certificate {
     *     caDomain: string;
     *     callback: () => void;
     *     caName: string;
     *     days: number;
     *     domain: string;
     *     location: string;
     *     name: string;
     *     organization: string;
     *     selfSign: boolean;
     * }
     * ``` */
    interface config_command_certificate {
        caDomain: string;
        callback: () => void;
        caName: string;
        days: number;
        domain: string;
        location: string;
        name: string;
        organization: string;
        selfSign: boolean;
    }

    /**
     * For copy of terminal/commands/copy.
     * ```typescript
     * interface config_command_copy {
     *     callback: (output:copyStats) => void;
     *     destination: string;
     *     exclusions: string[];
     *     replace: boolean;
     *     target: string;
     * }
     * ``` */
    interface config_command_copy {
        callback: (output:copyStats) => void;
        destination: string;
        exclusions: string[];
        replace: boolean;
        target: string;
    }

    /**
     * For directory of terminal/commands/directory.
     * ```typescript
     * interface config_command_directory {
     *     callback: (dir:directoryList | string[], searchType?:searchType) => void;
     *     depth: number;
     *     exclusions: string[];
     *     mode: directoryMode;
     *     path: string;
     *     search?: string;
     *     symbolic: boolean;
     * }
     * type searchType = "fragment" | "negation" | "regex";
     * ``` */
    interface config_command_directory {
        callback: (dir:directoryList | string[], searchType?:searchType) => void;
        depth: number;
        exclusions: string[];
        mode: directoryMode;
        path: string;
        search?: string;
        symbolic: boolean;
    }

    /**
     * For hash of terminal/commands/hash.
     * ```typescript
     * interface config_command_hash {
     *     algorithm?: hash;
     *     callback: (hashOutput:hashOutput) => void;
     *     digest?: "base64" | "hex";
     *     directInput: boolean;
     *     id?: string;
     *     parent?: number;
     *     source: Buffer | string;
     *     stat?: directoryData;
     * }
     * type hash = "blake2d512" | "blake2s256" | "sha1" | "sha3-224" | "sha3-256" | "sha3-384" | "sha3-512" | "sha384" | "sha512-224" | "sha512-256" | "sha512" | "shake128" | "shake256";
     * ``` */
    interface config_command_hash {
        algorithm?: hash;
        callback: (hashOutput:hashOutput) => void;
        digest?: "base64" | "hex";
        directInput: boolean;
        id?: string;
        parent?: number;
        source: Buffer | string;
        stat?: directoryData;
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
     * For serviceCopy.status.copy of terminal/server/services/fileCopy.
     * ```typescript
     * interface config_copy_status {
     *     agentSource: fileAgent;
     *     agentRequest: fileAgent;
     *     agentWrite: fileAgent;
     *     countFile: number;
     *     cut: boolean;
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
        cut: boolean;
        directory: boolean;
        failures: number;
        location: string[];
        message: string;
        totalSize: number;
        writtenSize: number;
    }

    /**
     * For transmit_http.response of terminal/server/transmission/transmit_http.
     * ```typescript
     * interface config_http_respond {
     *     message: Buffer | string;
     *     mimeType: mimeType;
     *     responseType: requestType;
     *     serverResponse: agentStream;
     * }
     * ``` */
    interface config_http_respond {
        message: Buffer | string;
        mimeType: mimeType;
        responseType: requestType;
        serverResponse: agentStream;
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
     *     callback: testCallback;
     *     demo: boolean;
     *     mode: testBrowserMode;
     *     noClose: boolean;
     * }
     * ``` */
    interface config_test_browserExecute {
        callback: testCallback;
        demo: boolean;
        mode: testBrowserMode;
        noClose: boolean;
    }

    /**
     * For evaluation of terminal/test/application/evaluation.
     * ```typescript
     * interface config_test_evaluation {
     *     callback: testCallback;
     *     fail: number;
     *     index: number;
     *     list: number[];
     *     test: testItem | testService;
     *     testType: "service" | "simulation";
     *     values: [string, string, string];
     * }
     * ``` */
    interface config_test_evaluation {
        callback: testCallback;
        fail: number;
        index: number;
        list: number[];
        test: testItem | testService;
        testType: "service" | "simulation";
        values: [string, string, string];
    }

    /**
     * For service.execute of terminal/test/application/service and simulation.execute of terminal/test/application/simulation
     * ```typescript
     * interface config_test_execute {
     *     complete: testCallback;
     *     fail: number;
     *     index: number;
     *     list: number[];
     * }
     * ``` */
    interface config_test_execute {
        complete: testCallback;
        fail: number;
        index: number;
        list: number[];
    }

    /**
     * For transmit_ws.open of terminal/server/transmission/transmit_ws.
     * ```typescript
     * interface config_websocket_open {
     *     agent: string;
     *     agentType: agentType;
     *     callback: (socket:socketClient) => void;
     * }
     * ``` */
    interface config_websocket_open {
        agent: string;
        agentType: agentType;
        callback: (socket:socketClient) => void;
    }

    /**
     * For transmit_ws.server of terminal/server/transmission/transmit_ws.
     * ```typescript
     * interface config_websocket_server {
     *     address: string;
     *     callback: (addressInfo:AddressInfo) => void;
     *     cert: {
     *         cert: string;
     *         key: string;
     *     };
     *     port: number;
     * }
     * ``` */
    interface config_websocket_server {
        address: string;
        callback: (addressInfo:AddressInfo) => void;
        cert: {
            ca: string;
            cert: string;
            key: string;
        };
        port: number;
    }
}