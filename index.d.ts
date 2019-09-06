
type characterKey = "" | "control" | "shift";
type directoryItem = [string, "error" | "file" | "directory" | "link" | "screen", number, number, Stats];
type messageList = [string, string];
type messageListError = [string, string, string[]];
type messageType = "errors" | "status" | "users";
type qualifier = "begins" | "contains" | "ends" | "file begins" | "file contains" | "file ends" | "file is" | "file not" | "file not contains" | "filesystem contains" | "filesystem not contains" | "is" | "not" | "not contains";
type ui_input = "cancel" | "close" | "confirm" | "maximize" | "minimize" | "text";

interface applications {
    [key:string]: Function;
}
interface appName {
    command: string,
    name: string
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
interface directoryList extends Array<directoryItem> {
    [key:number]: directoryItem;
}
interface children<T> extends Array<T> {}
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
interface functionEvent extends EventHandlerNonNull {
    (Event?:Event): void;
}
interface localService {
    action: string;
    agent: string;
    depth: number;
    location: string;
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
interface network {
    fileDetails?: Function;
    fs?: Function;
    messages?: Function;
    settings?: Function;
}
interface nodeCopyParams {
    callback:Function;
    destination:string;
    exclusions:string[];
    target:string;
}
interface nodeError extends Error {
    code: string;
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
interface readFS{
    agent: string;
    callback: Function;
    depth: number;
    element: HTMLElement;
    id?: string;
    location: string;
}
interface serverError {
    stack: string[];
    error: string;
}
interface simulationItem {
    artifact?: string;
    command: string;
    file?: string;
    qualifier: qualifier;
    test: string;
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
interface ui {
    context: {
        menu?: EventHandlerNonNull;
        menuRemove?: functionEvent;
    };
    fs: {
        expand?: EventHandlerNonNull;
        navigate?: EventHandlerNonNull;
        parent?: EventHandlerNonNull;
        select?: EventHandlerNonNull;
        share?: EventHandlerNonNull;
        text?: EventHandlerNonNull;
    };
    modal: {
        close?: EventHandlerNonNull;
        create?: (options:ui_modal) => void;
        export?: EventHandlerNonNull;
        import?: EventHandlerNonNull;
        maximize?: EventHandlerNonNull;
        minimize?: EventHandlerNonNull;
        move?: EventHandlerNonNull;
        resize?: EventHandlerNonNull;
        systems?: EventHandlerNonNull;
        textPad?: EventHandlerNonNull;
        textSave?: EventHandlerNonNull;
        zTop?: EventHandlerNonNull;
    };
    systems: {
        expand?: EventHandlerNonNull;
        message?: (type:string, content:string, timeStore?:string) => void;
        tabs?: EventHandlerNonNull;
    };
    util: {
        addUser?: (username:string, ip:string) => void;
        commas?: (number:number) => string;
        dateFormat?: (date:Date) => string;
        fixHeight?: functionEvent;
        login?: EventHandlerNonNull;
        menu?: EventHandlerNonNull;
        prettyBytes?: (an_integer:number) => string;
    };
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
    type: string;
    width?: number;
    zIndex?: number;
}
interface ui_data {
    modals: {
        [key:string]: ui_modal;
    };
    modalTypes: string[];
    name: string;
    zIndex: number;
}
interface version {
    command: string;
    date: string;
    name: string;
    number: string;
    port: number;
}