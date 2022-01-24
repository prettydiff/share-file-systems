/* lib/typescript/browser.d - TypeScript interfaces used by browser specific libraries. */

// audio

/**
 * Stores audio data as a base64 string and associated meta data.
 * ```typescript
 * interface audio {
 *     [key:string]: {
 *         data: string;
 *         licenseAddress: string;
 *         licenseName: string;
 *         seconds: number;
 *         url: string;
 *     };
 * }
 * ``` */
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

// configuration

/**
 * Stores two color values against an agent identifier.
 * ```typescript
 * interface colorList {
 *     [key:string]: color;
 * }
 * ``` */
interface colorList {
    [key:string]: color;
}

/**
 * Stores lists of agent colors by agent type.
 * ```typescript
 * interface colors {
 *     device: colorList;
 *     user: colorList;
 * }
 * ``` */
interface colors {
    device: colorList;
    user: colorList;
}

/**
 * A configuration object used with configuration.styleText method.
 * ``` typescript
 * interface styleText{
 *     agent: string;
 *     colors: [string, string];
 *     replace: boolean;
 *     type: agentType;
 * }
 * ``` */
interface styleText{
    agent: string;
    colors: [string, string];
    replace: boolean;
    type: agentType;
}
// ------------------------------------

// context

/**
 * Temporarily stores selected file selection data in response to user interactions, such as a copy event.
 * ```typescript
 * interface clipboard {
 *     agent: string;
 *     agentType: agentType;
 *     data: string[];
 *     id: string;
 *     share: string;
 *     type: contextType;
 * }
 * type copyTypes = "copy-file" | "copy-request-files" | "copy-request";
 * ``` */
interface clipboard {
    agent: string;
    agentType: agentType;
    data: string[];
    id: string;
    share: string;
    type: contextType;
}

/**
 * A map of supported context functions that generate the associated context menu items and assign their respective handlers.
 */
interface contextFunctions {
    base64: () => void;
    copy: () => void;
    cut: () => void;
    destroy: () => void;
    details: () => void;
    edit: () => void;
    hash: () => void;
    newDirectory: () => void;
    newFile: () => void;
    paste: () => void;
    rename: () => void;
    share: () => void;
}
// ------------------------------------

// fileBrowser

/**
 * A store of numbers used to populate the file system details modal.
 * ```typescript
 * interface fsDetailCounts {
 *     directories: number;
 *     files: number;
 *     links: number;
 *     size: number;
 * }
 * ``` */
interface fsDetailCounts {
    directories: number;
    files: number;
    links: number;
    size: number;
}
// ------------------------------------

// invite

/**
 * Object used to identity identify specific DOM input nodes on the invitation request form.
 * ```typescript
 * interface inviteIndexes {
 *     ip: number;
 *     port: number;
 *     type: number;
 * }
 * ``` */
interface inviteIndexes {
    ip: number;
    port: number;
    type: number;
}

/**
 * The data extracted from the invite request form.
 * ```typescript
 * interface inviteSaved {
 *     ip: string;
 *     message: string;
 *     port: string;
 *     type: agentType;
 * }
 * ``` */
interface inviteSaved {
    ip: string;
    message: string;
    port: string;
    type: agentType;
}
// ------------------------------------

// modals

/**
 * A collection of methods for resizing a modal from different respective sides/corners.
 */
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
// ------------------------------------

// network
/**
 * This generally describes the method list available to browser network receiver.
 * ```typescript
 * interface postActions {
 *     [key:string]: (socketData:socketData) => void;
 * }
 * ``` */
interface browserActions {
    [key:string]: (socketData:socketData) => void;
}
// ------------------------------------

// share

/**
 * Configuration object from the share.addAgent method.
 * ```typescript
 * interface addAgent {
 *     hash: string;
 *     name: string;
 *     type: agentType;
 * }
 * ``` */
interface addAgent {
    callback?: () => void;
    hash: string;
    name: string;
    type: agentType;
}
// ------------------------------------

// tutorial

/**
 * A user step in the tutorial data.
 * ```typescript
 * interface tutorialData {
 *     description: [string, string][];
 *     event: eventName;
 *     node: testBrowserDOM;
 *     title: string;
 * }
 * type eventName = "blur" | "click" | "contextmenu" | "dblclick" | "focus" | "keydown" | "keyup" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "move" | "refresh-interaction" | "refresh" | "resize" | "select" | "setValue" | "touchend" | "touchstart" | "wait";
 * ``` */
interface tutorialData {
    description: [string, string][];
    event: eventName;
    node: testBrowserDOM;
    title: string;
}
// ------------------------------------

// utils

/**
 * Defines a bounding space for a rectangle draw from one corner to the opposite.  Used for selecting items in a file list.
 * ```typescript
 * interface perimeter {
 *     bottom: number;
 *     left: number;
 *     right: number;
 *     top: number;
 * }
 * ``` */
interface perimeter {
    bottom: number;
    left: number;
    right: number;
    top: number;
}
// ------------------------------------

// webSocket

/**
 * Module definition for browser-side websocket handling.
 * ```typescript
 * interface browserSocket {
 *     send: (data:socketData) => void;
 *     start: (callback: () => void) => void;
 * }
 * ``` */
interface browserSocket {
    send: (data:socketData) => void;
    start: (callback: () => void, hashDevice:string) => void;
}

/**
 * The WebSocket onmessage handler receives an event object like any other native event handler, but there is a data property specific to web socket events.  There should be a TypeScript type to cover this, but there is isn't, so I created it.
 * ```typescript
 * interface SocketEvent extends Event {
 *     data: string;
 * }
 * ``` */
interface SocketEvent extends Event {
    data: string;
}

/**
 * Defines an empty function used to bypass some constraints between TypeScript types and socket client definitions.
 * ```typescript
 * interface WebSocketLocal extends WebSocket {
 *     new (address:string, protocols:string[]): WebSocket;
 * }
 * ``` */
interface WebSocketLocal extends WebSocket {
    new (address:string, protocols:string[]): WebSocket;
}
// ------------------------------------