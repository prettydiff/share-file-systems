/* lib/typescript/browser.d - TypeScript interfaces used by browser specific libraries. */

// audio
interface audio {
    [key:string]: {
        data: string;
        licenseAddress: string;
        licenseName: string;
        seconds: number;
        url: string;
    };
}
// ------------------------------------

// context
interface clipboard {
    agent: string;
    agentType: agentType;
    data: string[];
    id: string;
    share: string;
    type: string;
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
interface fsDetailCounts {
    directories: number;
    files: number;
    links: number;
    size: number;
}
// ------------------------------------

// dom
interface Document {
    getElementsByAttribute: (name:string, value:string) => Element[];
    getModalsByModalType: (type:modalType|"all") => Element[];
    getNodesByType: (typeValue:number | string) => Node[];
    getElementsByText: (textValue:string, caseSensitive?:boolean) => Element[];
}
interface Element {
    getAncestor: (identifier:string, selector:selector) => Element;
    getElementsByAttribute: (name:string, value:string) => Element[];
    getNodesByType: (typeValue:number | string) => Node[];
    getElementsByText: (textValue:string, caseSensitive?:boolean) => Element[];
}
// ------------------------------------

// fileBrowser
interface modalHistoryConfig {
    address: string;
    history: boolean;
    id: string;
    payload: systemDataFile;
}
interface navConfig {
    agentName: string;
    agentType: agentType;
    path: string;
    readOnly: boolean;
    share: string;
}
// ------------------------------------

// invite
interface addAgent {
    type: agentType;
    hash: string;
    name: string;
    save: boolean;
}
interface invite {
    action: inviteAction;
    deviceName: string;
    deviceHash: string;
    ipAll: networkAddresses;
    ipSelected: string;
    message: string;
    modal: string;
    port: number;
    shares: agents;
    status: inviteStatus;
    type: agentType;
    userHash: string;
    userName: string;
}
interface inviteIndexes {
    ip: number;
    port: number;
    type: number;
}
interface invitePayload {
    action: inviteAction;
    ipAll: networkAddresses;
    ipSelected: string;
    message: string;
    modal: string;
    port: number;
    status: inviteStatus;
    type: agentType;
}
interface inviteSaved {
    ip: string;
    message: string;
    port: string;
    type: agentType;
}
// ------------------------------------

// modals
interface borderMethods {
    b: (event:MouseEvent|TouchEvent) => void;
    bl: (event:MouseEvent|TouchEvent) => void;
    br: (event:MouseEvent|TouchEvent) => void;
    l: (event:MouseEvent|TouchEvent) => void;
    r: (event:MouseEvent|TouchEvent) => void;
    t: (event:MouseEvent|TouchEvent) => void;
    tl: (event:MouseEvent|TouchEvent) => void;
    tr: (event:MouseEvent|TouchEvent) => void;
}
interface modal {
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
    selection?: {
        [key:string]: string;
    };
    share?: string;
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
// ------------------------------------

// networks
interface hashShareConfiguration {
    callback:(responseType:requestType, responseText:string) => void;
    device: string;
    share: string;
    type: shareType;
}
interface networkConfig {
    callback: (responseType:requestType, responseText:string) => void;
    error: string;
    payload: string;
    type: requestType;
}
// ------------------------------------

// settings
interface colorList {
    [key:string]: color;
}
interface colors {
    device: colorList;
    user: colorList;
}
interface styleText{
    agent: string;
    colors: [string, string];
    replace: boolean;
    type: agentType;
}
// ------------------------------------

// share
interface shareButton {
    index: number;
    name: string;
    type: agentType;
}
// ------------------------------------

// utils
interface perimeter {
    bottom: number;
    left: number;
    right: number;
    top: number;
}
// ------------------------------------

// webSocket
interface SocketEvent extends Event {
    data: string;
}
interface WebSocketLocal extends WebSocket {
    new (address:string): WebSocket;
}
// ------------------------------------