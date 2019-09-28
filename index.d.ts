
type characterKey = "" | "control" | "shift";
type directoryItem = [string, "error" | "file" | "directory" | "link", number, number, Stats];
type heartbeatStatus = "" | "active" | "idle" | "offline";
type messageList = [string, string];
type messageListError = [string, string, string[]];
type messageType = "errors" | "status" | "users";
type modalType = "details" | "export" | "fileNavigate" | "invite-accept" | "invite-request" | "shares" | "systems" | "textPad";
type qualifier = "begins" | "contains" | "ends" | "file begins" | "file contains" | "file ends" | "file is" | "file not" | "file not contains" | "filesystem contains" | "filesystem not contains" | "is" | "not" | "not contains";
type serviceFS = "fs-base64" | "fs-close" | "fs-copy" | "fs-cut" | "fs-destroy" | "fs-details" | "fs-hash" | "fs-new" | "fs-read" | "fs-rename";
type serviceType = serviceFS | "invite-status" | "messages" | "settings";
type ui_input = "cancel" | "close" | "confirm" | "maximize" | "minimize" | "text";

interface applications {
    [key:string]: Function;
}
interface appName {
    command: string,
    name: string
}
interface browser {
    characterKey: string;
    content: HTMLElement;
    data: ui_data;
    loadTest: boolean;
    localNetwork:localNetwork;
    messages:messages;
    pageBody:HTMLElement;
}
interface clipboard {
    type: string;
    data: string[];
    id  : string;
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
interface dataString extends EventHandlerNonNull {
    (Event, element?:HTMLElement, type?: "Hash" | "Base64"): void;
}
interface directoryList extends Array<directoryItem> {
    [index:number]: directoryItem;
}
interface Document {
    getNodesByType: Function;
    getElementsByAttribute: Function;
}
interface Element {
    getNodesByType: Function;
    getElementsByAttribute: Function;
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
interface FSWatcher extends Function {
    close: Function;
}
interface functionEvent extends EventHandlerNonNull {
    (Event?:Event): void;
}
interface heartbeat {
    ip: string;
    port: number;
    status: heartbeatStatus;
    user: string;
}
interface invite {
    action: "invite-status";
    family: "ipv4" | "ipv6";
    ip: string;
    message: string;
    modal: string;
    name: string;
    port: number;
    shares: [string, string][];
    status: "accepted" | "declined" | "invited";
}
interface inviteHeartbeat extends invite {
    user: string;
}
interface inviteError {
    error: string;
    modal: string;
}
interface localNetwork {
    family: "ipv4" | "ipv6";
    ip: string;
    port: number;
    wsPort: number;
    serverPort: number;
}
interface localService {
    action: serviceType;
    agent: string;
    depth: number;
    location: string[];
    name : string;
    watch: string;
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
interface modalSettings extends EventHandlerNonNull {
    (Event, user?:string, configuration?:ui_modal): void;
}
interface module_network {
    fs?: (localService, callback:Function, id?:string) => void;
    heartbeat?: (status:"active"|"idle") => void;
    inviteAccept?:(configuration:invite) => void;
    inviteRequest?: (configuration:invite) => void;
    messages?: Function;
    settings?: Function;
}
interface module_context {
    copy?: (HTMLElement, type: "copy" | "cut") => void;
    dataString?: dataString;
    destroy?: (HTMLElement) => void;
    details?: context;
    fsNew?: (HTMLElement, type: "directory" | "file") => void;
    menu?: EventHandlerNonNull;
    menuRemove?: functionEvent;
    paste?: (HTMLElement) => void; 
    share?: (HTMLElement) => void;
}
interface module_fs {
    directory?: EventHandlerNonNull;
    expand?: EventHandlerNonNull;
    list?: (location:string, listString:string) => HTMLElement;
    navigate?: navigate;
    parent?: EventHandlerNonNull;
    rename?: EventHandlerNonNull;
    select?: EventHandlerNonNull;
    text?: EventHandlerNonNull;
}
interface module_modal {
    close?: EventHandlerNonNull;
    closeDecline?: (event:MouseEvent, action:Function) => void;
    confirm?: EventHandlerNonNull;
    create?: (options:ui_modal) => HTMLElement;
    export?: EventHandlerNonNull;
    importSettings?: EventHandlerNonNull;
    maximize?: EventHandlerNonNull;
    minimize?: EventHandlerNonNull;
    move?: EventHandlerNonNull;
    resize?: EventHandlerNonNull;
    shares?: modalSettings;
    systems?: EventHandlerNonNull;
    textPad?: textPad;
    textSave?: EventHandlerNonNull;
    zTop?: EventHandlerNonNull;
}
interface module_systems {
    expand?: EventHandlerNonNull;
    message?: (type:string, content:string, timeStore?:string) => void;
    tabs?: EventHandlerNonNull;
}
interface module_util {
    addUser?: (username:string, shares:[string, string][]) => void;
    commas?: (number:number) => string;
    dateFormat?: (date:Date) => string;
    delay?: () => HTMLElement;
    fixHeight?: functionEvent;
    inviteStart?: modalSettings;
    inviteRespond?: (message:string) => void;
    fsObject?: (item:directoryItem, extraClass:string) => HTMLElement;
    login?: EventHandlerNonNull;
    menu?: EventHandlerNonNull;
    prettyBytes?: (an_integer:number) => string;
    selectedAddresses?: (element:HTMLElement, type:string) => [string, string][];
    selectNone?:(element:HTMLElement) => void;
}
interface navigate extends EventHandlerNonNull {
    (Event, path?:string): void;
}
interface nodeCopyParams {
    callback:Function;
    destination:string;
    exclusions:string[];
    target:string;
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
interface readDirectory {
    callback: Function;
    depth: number;
    exclusions: string[];
    path: string;
    recursive: boolean;
    symbolic: boolean;
}
interface readFile {
    callback: Function;
    index: number;
    path: string;
    stat: Stats;
}
interface serverError {
    stack: string[];
    error: string;
}
interface serverVars {
    addresses: [[string, string, string][], number]
    socketReceiver: any;
    socketList: any;
    timeStore:number;
    serverPort: number;
    watches: {
        [key:string]: FSWatcher;
    };
    webPort: number;
    wsPort: number;
}
interface simulationItem {
    artifact?: string;
    command: string;
    file?: string;
    qualifier: qualifier;
    test: string;
}
interface SocketEvent extends Event{
    data: string;
}
interface Stats {
    dev: number;
    ino: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    blksize: number;
    blocks: number;
    atimeMs: number;
    mtimeMs: number;
    ctimeMs: number;
    birthtimeMs: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;
    isBlockDevice: Function;
    isCharacterDevice: Function;
    isDirectory: Function;
    isFIFO: Function;
    isFile: Function;
    isSocket: Function;
    isSymbolicLink: Function;
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
interface textPad extends EventHandlerNonNull {
    (Event, value?:string, title?:string): void;
}
interface ui_data {
    modals: {
        [key:string]: ui_modal;
    };
    modalTypes: string[];
    name: string;
    shares: {
        [key:string]: [string, string][]
    };
    zIndex: number;
}
interface ui_modal {
    content: HTMLElement;
    focus?: HTMLElement;
    height?: number;
    id?: string;
    inputs?: ui_input[];
    left?: number;
    move?: boolean;
    resize?: boolean;
    single?: boolean;
    status?: "hidden" | "maximized" | "minimized" | "normal";
    text_event?: EventHandlerNonNull;
    text_placeholder?: string;
    text_value?: string;
    title: string;
    top?: number;
    type: modalType;
    width?: number;
    zIndex?: number;
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