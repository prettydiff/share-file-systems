
type characterKey = "" | "control" | "control-shift" | "shift";
type directoryItem = [string, "error" | "file" | "directory" | "link", string, number, number, Stats];
type eventCallback = (event:Event, callback:Function) => void;
type heartbeatStatus = "" | "active" | "idle" | "offline";
type messageList = [string, string];
type messageListError = [string, string, string[]];
type messageType = "errors" | "status" | "users";
type modalType = "details" | "export" | "fileEdit" | "fileNavigate" | "invite-accept" | "invite-request" | "shares" | "systems" | "textPad";
type qualifier = "begins" | "contains" | "ends" | "file begins" | "file contains" | "file ends" | "file is" | "file not" | "file not contains" | "filesystem contains" | "filesystem not contains" | "is" | "not" | "not contains";
type serviceFS = "fs-base64" | "fs-close" | "fs-copy" | "fs-copy-file" | "fs-copy-list" | "fs-copy-request" | "fs-copy-self" | "fs-cut" | "fs-cut-file" | "fs-cut-list" | "fs-cut-request" | "fs-cut-self" | "fs-destroy" | "fs-details" | "fs-directory" | "fs-hash" | "fs-new" | "fs-read" | "fs-rename" | "fs-write";
type serviceType = serviceFS | "invite-status" | "messages" | "settings";
type ui_input = "cancel" | "close" | "confirm" | "maximize" | "minimize" | "save" | "text";

interface applications {
    [key:string]: Function;
}
interface appName {
    command: string,
    name: string
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
    characterKey: string;
    content: HTMLElement;
    data: ui_data;
    loadTest: boolean;
    localNetwork:localNetwork;
    messages:messages;
    pageBody:HTMLElement;
    socket?:WebSocket;
    style:HTMLStyleElement;
}
interface clipboard {
    agent: string;
    data : string[];
    id   : string;
    type : string;
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
interface dataString extends EventHandlerNonNull {
    (Event, element?:HTMLElement, type?: "Base64" | "Edit" | "Hash"): void;
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
interface fileService {
    action      : serviceType;
    agent       : string;
    copyAgent   : string;
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
    dirs: directoryList | "missing";
    id: string;
}
interface fsUpdateRemote {
    agent: string;
    dirs: directoryList;
    location:string;
}
interface FSWatcher extends Function {
    close: Function;
}
interface functionEvent extends EventHandlerNonNull {
    (Event?:Event): void;
}
interface hashInput {
    callback: Function;
    directInput: boolean;
    id?: string;
    parent?: number;
    source: Buffer | string;
    stat?: Stats;
}
interface hashOutput {
    filePath: string;
    hash: string;
    id?: string;
    parent?: number;
    stat?: Stats;
}
interface heartbeat {
    ip: string;
    port: number;
    refresh: boolean;
    status: heartbeatStatus;
    user: string;
}
interface httpClient {
    callback: Function;
    data: fileService;
    errorMessage: string;
    response: any;
}
interface invite {
    action: "invite" | "invite-request" | "invite-response" | "invite-complete";
    family: "ipv4" | "ipv6";
    ip: string;
    message: string;
    modal: string;
    name: string;
    port: number;
    shares: [string, string][];
    status: "accepted" | "declined" | "invited";
}
interface localNetwork {
    family: "ipv4" | "ipv6";
    ip: string;
    httpPort: number;
    wsPort: number;
    tcpPort: number;
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
    heartbeat?: (status:"active"|"idle", refresh:boolean) => void;
    inviteAccept?:(configuration:invite) => void;
    inviteRequest?: (configuration:invite) => void;
    messages?: Function;
    settings?: Function;
}
interface module_context {
    copy?: (element: HTMLElement, type: "copy" | "cut") => void;
    dataString?: dataString;
    destroy?: (element: HTMLElement) => void;
    details?: context;
    fsNew?: (element: HTMLElement, type: "directory" | "file") => void;
    menu?: EventHandlerNonNull;
    menuRemove?: functionEvent;
    paste?: (element: HTMLElement) => void;
    share?: (element: HTMLElement) => void;
}
interface module_fs {
    directory?: EventHandlerNonNull;
    expand?: EventHandlerNonNull;
    list?: (location:string, list:directoryList) => HTMLElement;
    listItem?: (item:directoryItem, extraClass:string) => HTMLElement;
    navigate?: navigate;
    parent?: EventHandlerNonNull;
    rename?: EventHandlerNonNull;
    saveFile?: EventHandlerNonNull;
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
    addUser?: (username:string) => void;
    commas?: (number:number) => string;
    dateFormat?: (date:Date) => string;
    delay?: () => HTMLElement;
    dragSelect?: eventCallback;
    fixHeight?: functionEvent;
    getAgent?: (element:HTMLElement) => string;
    inviteStart?: modalSettings;
    inviteRespond?: (message:string) => void;
    keys?: (event:KeyboardEvent) => void;
    keyup?: (event:KeyboardEvent) => void;
    login?: EventHandlerNonNull;
    menu?: EventHandlerNonNull;
    prettyBytes?: (an_integer:number) => string;
    selectedAddresses?: (element:HTMLElement, type:string) => [string, string][];
    selectNone?:(element:HTMLElement) => void;
}
interface navigate extends EventHandlerNonNull {
    (Event, path?:string, agentName?:string): void;
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
    hash: boolean;
    path: string;
    recursive: boolean;
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
    callback:Function;
    files:[string, string, string, number][];
    id:string;
    index:number;
    length:number;
}
interface remoteCopyListData {
    directories: number;
    fileCount:number;
    fileSize:number;
    id:string;
    list:[string, string, string, number][]
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
interface stringData {
    content: string;
    id: string;
    path: string;
}
interface stringDataList extends Array<stringData> {
    [index:number]: stringData;
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
    users: {
        [key:string]: {
            color:[string, string];
            shares:[string, string][]
        }
    }
    zIndex: number;
}
interface ui_modal {
    agent: string;
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
    status_bar?: boolean;
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