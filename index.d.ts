
import { Stats } from "fs";
import { Server } from "net";

declare global {

    type agency = [string, boolean, agentType];
    type agentType = "device" | "user";
    type brotli = 0|1|2|3|4|5|6|7|8|9|10|11;
    type color = [string, string];
    type colorScheme = "dark" | "default";
    type directoryItem = [string, "error" | "file" | "directory" | "link", string, number, number, Stats | "stat"];
    type directoryMode = "hash" | "list" | "read" | "search";
    type dragFlag = "" | "control" | "shift";
    type eventCallback = (event:Event, callback:Function) => void;
    type hash = "blake2d512" | "blake2s256" | "sha3-224" | "sha3-256" | "sha3-384" | "sha3-512" | "sha384" | "sha512" | "sha512-224" | "sha512-256" | "shake128" | "shake256";
    type heartbeatStatus = "" | "active" | "idle" | "offline";
    type messageList = [string, string];
    type messageListError = [string, string, string[]];
    type messageType = "errors" | "status" | "users";
    type modalStatus = "hidden" | "maximized" | "minimized" | "normal";
    type modalType = "details" | "export" | "fileEdit" | "fileNavigate" | "invite-accept" | "invite-request" | "shares" | "share_delete" | "settings" | "systems" | "textPad";
    type contextType = "" | "Base64" | "copy" | "cut" | "directory" | "Edit" | "file" | "Hash";
    type qualifier = "begins" | "contains" | "ends" | "file begins" | "file contains" | "file ends" | "file is" | "file not" | "file not contains" | "filesystem contains" | "filesystem not contains" | "is" | "not" | "not contains";
    type selector = "class" | "id" | "tag";
    type serviceFS = "fs-base64" | "fs-close" | "fs-copy" | "fs-copy-file" | "fs-copy-list" | "fs-copy-list-remote" | "fs-copy-request" | "fs-copy-self" | "fs-cut" | "fs-cut-file" | "fs-cut-list" | "fs-cut-list-remote" | "fs-cut-remove" | "fs-cut-request" | "fs-cut-self" | "fs-destroy" | "fs-details" | "fs-directory" | "fs-hash" | "fs-new" | "fs-read" | "fs-rename" | "fs-search" | "fs-write";
    type serverTask = storageType | "fs" | "fs-update-remote" | "hashDevice" | "hashShare" | "heartbeat" | "invite";
    type serviceType = serviceFS | "invite-status" | "messages" | "settings";
    type shareType = "directory" | "file" | "link";
    type storageType = "device" | "messages" | "settings" | "user";
    type testListType = "service" | "simulation";
    type testServiceFileTarget = fsRemote | string | stringData[] | testTemplateCopyStatus;
    type ui_input = "cancel" | "close" | "confirm" | "maximize" | "minimize" | "save" | "text";

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
        source: browser | serverVars;
    }
    interface agentNames {
        agent?: string;
        agentType: agentType;
        share?: string;
    }
    interface agents {
        device: string[];
        user: string[];
    }
    interface appName {
        command: string,
        name: string
    }
    interface audio {
        [key:string]: {
            data: string;
            licenseAddress: string;
            licenseName: string;
            seconds: number;
            url: string;
        }
    }
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
    interface browser {
        content: HTMLElement;
        data: ui_data;
        device: devices;
        loadTest: boolean;
        localNetwork:localNetwork;
        messages:messages;
        pageBody:HTMLElement;
        socket?:WebSocket;
        style:HTMLStyleElement;
        user: devices;
    }
    interface clipboard {
        agent: string;
        agentType: agentType;
        data: string[];
        id: string;
        type: string;
    }
    interface colorList {
        [key:string]: color;
    }
    interface colors {
        device: colorList;
        user: colorList;
    }
    interface commandList {
        [key:string]: {
            description: string;
            example: {
                code: string,
                defined: string
            }[];
        }
    }
    interface context extends EventHandlerNonNull {
        (Event, element?:HTMLElement): void;
    }
    interface contextFunctions {
        base64: Function;
        copy: Function;
        cut: Function;
        destroy: Function;
        details: Function;
        edit: Function;
        hash: Function;
        newDirectory: Function;
        newFile: Function;
        paste: Function;
        rename: Function;
        share: Function;
    }
    interface contextNew extends EventHandlerNonNull {
        (Event, element?:HTMLElement, type?:string): void;
    }
    interface completeStatus {
        countFile: number;
        failures: number;
        percent: number;
        writtenSize: number;
    }
    interface copyStatus {
        failures:string[];
        message:string;
        target:string;
    }
    interface device {
        ip: string;
        name: string;
        port: number;
        shares: deviceShares;
    }
    interface devices {
        [key:string]: device;
    }
    interface deviceShare {
        execute: boolean;
        name: string;
        readOnly: boolean;
        type: shareType;
    }
    interface deviceShares {
        [key:string]: deviceShare;
    }
    interface directoryList extends Array<directoryItem> {
        [index:number]: directoryItem;
        failures?: string[];
    }
    interface docItem {
        description: string,
        name: string,
        namePadded: string;
        path: string
    }
    interface Document {
        getNodesByType: Function;
        getElementsByAttribute: Function;
    }
    interface Element {
        getNodesByType: Function;
        getElementsByAttribute: Function;
    }
    interface fileService {
        action      : serviceType;
        agent       : string;
        agentType   : agentType;
        copyAgent   : string;
        copyType    : agentType;
        depth       : number;
        id          : string;
        location    : string[];
        name        : string;
        remoteWatch?: string;
        watch       : string;
    }
    interface fileStore extends Array<[number, string, string, Buffer]> {
        [index:number]: [number, string, string, Buffer]
    }
    interface flags {
        error: boolean;
        write: string;
    }
    interface fsDetails {
        directories: number;
        files: number;
        links: number;
        size: number;
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
        location:string;
        status?:string;
    }
    interface FSWatcher extends Function {
        close: Function;
        time: number;
    }
    interface hashInput {
        algorithm?: hash;
        callback: Function;
        directInput: boolean;
        id?: string;
        parent?: number;
        source: Buffer | string;
        stat?: Stats | "stat";
    }
    interface hashOutput {
        filePath: string;
        hash: string;
        id?: string;
        parent?: number;
        stat?: Stats | "stat";
    }
    interface hashShare {
        device: string;
        share: string;
        type: string;
    }
    interface hashShareConfiguration {
        callback:(string) => void;
        device: string;
        share: string;
        type: shareType;
    }
    interface hashShareResponse {
        device: string;
        hash: string;
        share: string;
        type: string;
    }
    interface hashUser {
        device: string;
        user: string;
    }
    interface heartbeat {
        agent: string;
        agentType: agentType;
        shares: deviceShares | devices | "";
        status: heartbeatStatus;
        user: string;
    }
    interface httpConfiguration {
        agentType: agentType,
        callback: Function;
        callbackType: "body" | "object";
        errorMessage: string;
        id: string;
        ip: string;
        payload: Buffer|string;
        port: number;
        remoteName: string;
        requestError?: (error:nodeError, agent?:string, type?:agentType) => void;
        response?: any;
        responseError?: (error:nodeError, agent?:string, type?:agentType) => void;
    }
    interface httpServer extends Server {
        port: number;
    }
    interface invite {
        action: "invite" | "invite-request" | "invite-response" | "invite-complete";
        deviceName: string;
        deviceHash: string;
        ip: string;
        message: string;
        modal: string;
        name: string;
        port: number;
        shares: deviceShares | devices;
        status: "accepted" | "declined" | "invited";
        type: agentType;
        userHash: string;
        userName: string;
    }
    interface inviteIndexes {
        ip: number,
        port: number,
        type: number
    }
    interface inviteSaved {
        ip: string;
        message: string;
        port: string;
        type: agentType;
    }
    interface localNetwork {
        family: "ipv4" | "ipv6";
        ip: string;
        httpPort: number;
        wsPort: number;
    }
    interface messageError {
        error:string;
        stack:string[];
    }
    interface messages {
        status: messageList[];
        users: messageList[];
        errors: messageListError[];
    }
    interface methodList {
        [key:string]: Function;
    }
    interface modalSettings extends EventHandlerNonNull {
        (Event, user?:string, configuration?:ui_modal): void;
    }
    interface modalTop extends EventHandlerNonNull {
        (Event, srcElement?:HTMLElement): void;
    }
    interface modifyFile {
        end: string;
        source: string;
        target: string;
        start: string;
    }
    interface module_context {
        copy?: EventHandlerNonNull;
        dataString?: EventHandlerNonNull;
        destroy?: EventHandlerNonNull;
        details?: context;
        detailsList?: EventHandlerNonNull;
        element?: HTMLElement;
        fsNew?: EventHandlerNonNull;
        menu?: EventHandlerNonNull;
        menuRemove?: () => void;
        paste?: EventHandlerNonNull;
        type?: contextType;
    }
    interface module_fs {
        back?: EventHandlerNonNull;
        directory?: EventHandlerNonNull;
        drag?: EventHandlerNonNull;
        dragFlag?: dragFlag;
        expand?: EventHandlerNonNull;
        list?: (location:string, dirData:fsRemote) => [HTMLElement, number, string];
        listFail?: (count:number, box:HTMLElement) => void;
        listFocus?: EventHandlerNonNull;
        listItem?: (item:directoryItem, extraClass:string) => HTMLElement;
        navigate?: navigate;
        parent?: EventHandlerNonNull;
        rename?: EventHandlerNonNull;
        saveFile?: EventHandlerNonNull;
        search?: (event?:Event|KeyboardEvent, searchElement?:HTMLInputElement, callback?:Function) => void;
        searchBlur?: EventHandlerNonNull;
        searchFocus?: EventHandlerNonNull;
        select?: EventHandlerNonNull;
        text?: EventHandlerNonNull;
    }
    interface module_invite {
        accept?: (box:HTMLElement) => void;
        decline?: EventHandlerNonNull;
        portValidation?: EventHandlerNonNull;
        removeWarning?: EventHandlerNonNull;
        request?: (event:MouseEvent, options:ui_modal) => void;
        respond?: (message:string) => void;
        start?: sharesDeleteList;
        typeToggle?: EventHandlerNonNull;
    }
    interface module_modal {
        close?: EventHandlerNonNull;
        confirm?: EventHandlerNonNull;
        create?: (options:ui_modal) => HTMLElement;
        export?: EventHandlerNonNull;
        importSettings?: EventHandlerNonNull;
        maximize?: EventHandlerNonNull;
        minimize?: EventHandlerNonNull;
        move?: EventHandlerNonNull;
        resize?: EventHandlerNonNull;
        textPad?: textPad;
        textSave?: EventHandlerNonNull;
        textTimer?: EventHandlerNonNull;
        zTop?: modalTop;
    }
    interface module_network {
        fs?: (localService, callback:Function, id?:string) => void;
        hashDevice?: (callback:Function) => void;
        hashShare?: (configuration:hashShareConfiguration) => void;
        heartbeat?: (status:"active"|"idle", share:boolean) => void;
        inviteAccept?:(configuration:invite) => void;
        inviteRequest?: (configuration:invite) => void;
        storage?: (type:storageType) => void;
    }
    interface module_settings {
        addUserColor?: (agent:string, type:agentType, settingsBody:HTMLElement) => void;
        agentColor?: EventHandlerNonNull;
        applyAgentColors?: (agent:string, type:agentType, colors:[string, string]) => void;
        audio?: EventHandlerNonNull;
        colorDefaults?: colorList;
        colorScheme?: EventHandlerNonNull;
        compressionToggle?: EventHandlerNonNull;
        modal?: EventHandlerNonNull;
        modalContent?: () => HTMLElement;
        styleText?: (input:styleText) => void;
        text?: (event:KeyboardEvent|FocusEvent) => void;
    }
    interface module_share {
        addAgent?: (agentName:string, id:string, type:agentType) => void;
        content?: (agent:string, agentType:agentType|"") => HTMLElement;
        context?: EventHandlerNonNull;
        deleteList?: (event:MouseEvent, configuration?:ui_modal) => void;
        deleteToggle?: EventHandlerNonNull;
        deleteUser?: (box:HTMLElement) => void;
        itemDelete?: EventHandlerNonNull;
        modal?: (agent:string, agentType:agentType|"", configuration:ui_modal|null) => void;
        readOnly?: EventHandlerNonNull;
        update?: (updateShareConfiguration) => void;
    }
    interface module_systems {
        close?: EventHandlerNonNull;
        expand?: EventHandlerNonNull;
        message?: (type:string, content:string, timeStore?:string) => void;
        modal?: EventHandlerNonNull;
        modalContent?: () => HTMLElement;
        tabs?: EventHandlerNonNull;
    }
    interface module_util {
        audio?: (name:string) => void;
        dateFormat?: (date:Date) => string;
        delay?: () => HTMLElement;
        dragBox?: eventCallback;
        dragList?: (event:Event, dragBox:HTMLElement) => void;
        fileListStatus?: (text:string) => void;
        fixHeight?: () => void;
        formKeys?: (event:KeyboardEvent, submit:Function) => void;
        getAncestor?: (start:HTMLElement, identifier:string, selector:selector) => HTMLElement;
        getAgent?: (element:HTMLElement) => agency;
        keys?: (event:KeyboardEvent) => void;
        login?: EventHandlerNonNull;
        menu?: EventHandlerNonNull;
        minimizeAll?: EventHandlerNonNull;
        minimizeAllFlag?: boolean;
        selectedAddresses?: (element:HTMLElement, type:string) => [string, shareType, string][];
        selectExpression?: RegExp;
        selectNone?:(element:HTMLElement) => void;
    }
    interface navConfig {
        agentName: string;
        agentType: agentType;
        nameDevice: string;
        path: string;
        readOnly: boolean;
    }
    interface navigate extends EventHandlerNonNull {
        (Event, config?: navConfig): void;
    }
    interface nodeCopyParams {
        callback: Function;
        destination: string;
        exclusions: string[];
        target: string;
    }
    interface nodeError extends Error {
        code: string;
        Error: Error;
        port: number;
    }
    interface nodeFileProps {
        atime: number;
        mode: number;
        mtime: number;
    }
    interface nodeLists {
        empty_line: boolean;
        heading: string;
        obj: any;
        property: "each" | string;
        total: boolean;
    }
    interface perimeter {
        bottom: number;
        left: number;
        right: number;
        top: number;
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
    interface readFile {
        callback: Function;
        id?: string;
        index: number;
        path: string;
        stat: Stats;
    }
    interface remoteCopyList {
        callback: Function;
        files: [string, string, string, number][];
        id: string;
        index: number;
        length: number;
    }
    interface remoteCopyListData {
        directories: number;
        fileCount: number;
        fileSize: number;
        id: string;
        list: [string, string, string, number][];
        stream: boolean;
    }
    interface selection {
        [key:string]: string;
    }
    interface serverCallback {
        callback:(output:serverOutput) => void;
        agent: string;
        agentType: agentType;
    }
    interface serverError {
        stack: string[];
        error: string;
    }
    interface serverOutput {
        agent: string;
        agentType: agentType;
        webPort: number;
        wsPort: number;
    }
    interface serverVars {
        addresses: [[string, string, string][], number];
        brotli: brotli;
        device: devices;
        hashDevice: string;
        hashType: hash;
        hashUser: string;
        nameDevice: string;
        nameUser: string;
        status: heartbeatStatus;
        timeStore: number;
        user: devices;
        watches: {
            [key:string]: FSWatcher;
        };
        webPort: number;
        wsPort: number;
    }
    interface serviceFlags {
        local: boolean;
        remote: boolean;
    }
    interface shareButton {
        index: number;
        name: string;
        type: agentType;
    }
    interface sharesDeleteList extends EventHandlerNonNull {
        (event:MouseEvent, configuration?:ui_modal): void;
    }
    interface shareUpdateConfiguration {
        agent:string;
        id?: string;
        shares:deviceShares|"deleted";
        type: agentType;
    }
    interface shareUpdate {
        user: string;
        shares: deviceShares;
    }
    interface SocketEvent extends Event {
        data: string;
    }
    interface socketError {
        error: string;
        stack: string[];
    }
    interface stringData {
        content: string;
        id: string;
        path: string;
    }
    interface stringDataList extends Array<stringData> {
        [index:number]: stringData;
    }
    interface storage {
        messages?: messages;
        settings?: ui_data;
        send: boolean;
        users?: devices;
    }
    interface storageFlag {
        [key:string]: boolean;
    }
    interface storageItems {
        device: devices;
        messages: messages;
        settings: ui_data;
        user: devices;
    }
    interface styleText{
        agent: string;
        colors: [string, string];
        replace: boolean;
        type: agentType;
    }
    interface terminalVariables {
        binary_check: RegExp;
        cli: string;
        command: string;
        commands: commandList;
        cwd: string;
        exclusions: string[];
        flags: {
            error: boolean;
            write: string;
        },
        js: string;
        node: {
            child : any;
            crypto: any;
            fs    : any;
            http  : any;
            https : any;
            net   : any;
            os    : any;
            path  : any;
            zlib  : any;
        };
        projectPath: string;
        sep: string;
        startTime: [number, number];
        text: {
            [key:string]: string;
        };
        verbose: boolean;
        version: version;
        ws: any;
    }
    interface testComplete {
        callback: Function;
        fail: number;
        testType: testListType | "selected";
        total: number;
    }
    interface testEvaluation {
        test: testItem;
        testType: testListType;
        values: [string, string, string];
    }
    interface testItem {
        artifact?: string;
        command: string;
        file?: string;
        qualifier: qualifier;
        test: string;
    }
    interface testMessage {
        fail: number;
        index: number;
        messages: [string, string];
        name: string;
        test: testItem;
        testType: testListType | "selected";
    }
    interface testServiceArray extends Array<testServiceInstance> {
        [index:number]: testServiceInstance;
        addServers?: (callback:Function) => void;
        execute?: (index:number, increment:Function) => void;
        killServers?: (complete:testComplete) => void;
        serverRemote?: {
            device: {
                [key:string]: httpServer;
            };
            user: {
                [key:string]: httpServer;
            };
        };
    }
    interface testServiceInstance {
        artifact?: string;
        command: any;
        file?: string;
        name: string;
        qualifier: qualifier;
        shares?: testServiceShares;
        test: object | string;
    }
    interface testServiceShares {
        local?: deviceShares;
        remote?: deviceShares;
    }
    interface testSimulationArray extends Array<testItem> {
        [index:number]: testItem;
        execute?: (index:number, increment:Function) => void;
    }
    interface testTemplateCopyStatus {
        "file-list-status": copyStatus;
    }
    interface testTemplate {
        command: {
            [key: string]: any;
        };
        name: string;
        qualifier: qualifier;
        test: string;
    }
    interface testTemplateDevice extends testTemplate {
        command: {
            "device": devices;
        };
    }
    interface testTemplateFileService {
        command: {
            "fs": fileService;
        };
        name: string;
        qualifier: qualifier;
        test: testServiceFileTarget;
    }
    interface testTemplateHeartbeat {
        command: {
            "heartbeat": heartbeat;
        };
        name: string;
        qualifier: qualifier;
        test: {
            "heartbeat-response": heartbeat;
        } | string;
    }
    interface testTemplateInvite extends testTemplate {
        command: {
            "invite": invite;
        };
    }
    interface testTemplateMessages extends testTemplate {
        command: {
            "messages": messages;
        };
    }
    interface testTemplateSettings extends testTemplate {
        command: {
            "settings": ui_data;
        };
    }
    interface testTemplateUpdateRemote extends testTemplate{
        command: {
            "fs-update-remote": fsUpdateRemote;
        };
    }
    interface testTemplateUser extends testTemplate {
        command: {
            "user": devices;
        };
    }
    interface textPad extends EventHandlerNonNull {
        (Event, value?:string, title?:string): void;
    }
    interface ui_data {
        audio: boolean;
        brotli: brotli;
        color: colorScheme;
        colors: colors;
        hashDevice: string;
        hashType: hash;
        hashUser: string;
        modals: {
            [key:string]: ui_modal;
        };
        modalTypes: string[];
        nameDevice: string;
        nameUser: string;
        zIndex: number;
    }
    interface ui_modal {
        agent: string;
        agentType: agentType;
        content: HTMLElement;
        focus?: HTMLElement;
        height?: number;
        history?: string[];
        id?: string;
        inputs?: ui_input[];
        left?: number;
        move?: boolean;
        read_only: boolean;
        resize?: boolean;
        search?: [string, string];
        selection?: selection;
        single?: boolean;
        status?: modalStatus;
        status_bar?: boolean;
        status_text?: string;
        text_event?: EventHandlerNonNull;
        text_placeholder?: string;
        text_value?: string;
        timer?: number;
        title: string;
        top?: number;
        type: modalType;
        width?: number;
        zIndex?: number;
    }
    interface userExchange {
        agent: string;
        shares: deviceShares;
        status: string;
        user: string;
    }
    interface version {
        command: string;
        date: string;
        name: string;
        number: string;
        port: number;
    }
    interface watches {
        [key:string]: any;
    }

}