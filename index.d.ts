
type directoryItem = [string, "error" | "file" | "directory" | "link" | "screen", number, number, Stats];
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
interface flags {
    error: boolean;
    write: string;
}
interface localService {
    action: string;
    agent: string;
    location: string;
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
    error: string[];
}
interface simulationItem {
    artifact?: string;
    command: string;
    file?: string;
    qualifier: qualifier;
    test: string;
}
interface Stats {
    dev: number,
    ino: number,
    mode: number,
    nlink: number,
    uid: number,
    gid: number,
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
interface ui_modal {
    content: HTMLElement;
    height?: number;
    inputs?: ui_input[];
    left?: number;
    move?: boolean;
    resize?: boolean;
    single?: boolean;
    status?: "maximized" | "minimized" | "normal";
    text_event?: EventHandlerNonNull;
    text_placeholder?: string;
    text_value?: string;
    title: string;
    top?: number;
    type: string;
    width?: number;
}
interface ui_data {
    modals: {
        [key:string]: ui_modal;
    };
    modalTypes: string[];
    zIndex: number;
}
interface updateFS{
    agent: string;
    callback: Function;
    location: string;
}
interface version {
    command: string;
    date: string;
    name: string;
    number: string;
    port: number;
}