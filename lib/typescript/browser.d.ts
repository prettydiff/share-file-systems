/* lib/typescript/browser.d - TypeScript interfaces used by browser specific libraries. */

/**
 * Configuration object from the share.addAgent method.
 * ```typescript
 * interface agentManagement_addAgent {
 *     hash: string;
 *     name: string;
 *     type: agentType;
 * }
 * ``` */
interface agentManagement_addAgent {
    callback?: () => void;
    hash: string;
    name: string;
    type: agentType;
}

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

/**
 * Stores two color values against an agent identifier.
 * ```typescript
 * interface browser_colorList {
 *     [key:string]: color;
 * }
 * ``` */
interface browser_colorList {
    [key:string]: color;
}

/**
 * Stores lists of agent colors by agent type.
 * ```typescript
 * interface browser_colors {
 *     device: colorList;
 *     user: colorList;
 * }
 * ``` */
interface browser_colors {
    device: browser_colorList;
    user: browser_colorList;
}

/**
 * A configuration object used with configuration.styleText method.
 * ``` typescript
 * interface configuration_styleText extends agency {
 *     colors: [string, string];
 *     replace: boolean;
 * }
 * ``` */
interface configuration_styleText extends agency {
    colors: [string, string];
    replace: boolean;
}

/**
 * Temporarily stores selected file selection data in response to user interactions, such as a copy event.
 * ```typescript
 * interface context_clipboard extends agency {
 *     data: string[];
 *     id: string;
 *     share: string;
 *     type: contextType;
 * }
 * type copyTypes = "copy-file" | "copy-request-files" | "copy-request";
 * ``` */
interface context_clipboard extends agency {
    data: string[];
    id: string;
    share: string;
    type: contextType;
}

/**
 * A map of supported context menu functions that generate the associated context menu items and assign their respective handlers.
 */
interface context_functions {
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

/**
 * A store of numbers used to populate the file system details modal.
 * ```typescript
 * interface fileBrowser_DetailCounts {
 *     directories: number;
 *     files: number;
 *     links: number;
 *     size: number;
 * }
 * ``` */
interface fileBrowser_DetailCounts {
    directories: number;
    files: number;
    links: number;
    size: number;
}

/**
 * Object used to identity identify specific DOM input nodes on the invitation request form.
 * ```typescript
 * interface inviteIndexes {
 *     ip: number;
 *     port: number;
 *     type: number;
 * }
 * ``` */
interface invite_indexes {
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
interface invite_saved {
    ip: string;
    message: string;
    port: string;
    type: agentType;
}

/**
 * An HTML Element plus properties specifically describing modals in the UI.
 * ```typescript
 * interface modal extends HTMLElement {
 *     socket?: WebSocket;
 *     timer?: number;
 * }
 * ``` */
interface modal extends HTMLElement {
    socket?: WebSocket;
    timer?: number;
}

/**
 * A collection of methods for resizing a modal from different respective sides/corners.
 * ```typescript
 * interface modal_borderMethods {
 *     b: (event:MouseEvent|TouchEvent) => void;
 *     bl: (event:MouseEvent|TouchEvent) => void;
 *     br: (event:MouseEvent|TouchEvent) => void;
 *     l: (event:MouseEvent|TouchEvent) => void;
 *     r: (event:MouseEvent|TouchEvent) => void;
 *     t: (event:MouseEvent|TouchEvent) => void;
 *     tl: (event:MouseEvent|TouchEvent) => void;
 *     tr: (event:MouseEvent|TouchEvent) => void;
 * }
 * ``` */
interface modal_borderMethods {
    b: (event:MouseEvent|TouchEvent) => void;
    bl: (event:MouseEvent|TouchEvent) => void;
    br: (event:MouseEvent|TouchEvent) => void;
    l: (event:MouseEvent|TouchEvent) => void;
    r: (event:MouseEvent|TouchEvent) => void;
    t: (event:MouseEvent|TouchEvent) => void;
    tl: (event:MouseEvent|TouchEvent) => void;
    tr: (event:MouseEvent|TouchEvent) => void;
}

/**
 * This generally describes the method list available to browser network receiver.
 * ```typescript
 * interface postActions {
 *     [key:string]: (socketData:socketData) => void;
 * }
 * ``` */
interface network_actions {
    [key:string]: (socketData:socketData) => void;
}

/**
 * Stores generated HTML content per agent and agent type for share modal types.
 * ```typescript
 * interface share_content_sections {
 *     device: HTMLElement,
 *     user: HTMLElement
 * }
 * ``` */
interface share_content_sections {
    device: HTMLElement;
    user: HTMLElement;
}

/**
 * A means to step through entries to the browser terminal.
 * ```typescript
 * interface terminal_scroll {
 *     entries: number[]
 *     position: number;
 * }
 * ``` */
interface terminal_scroll {
    entries: number[];
    position: number;
}

/**
 * A user step in the tutorial data.
 * ```typescript
 * interface tutorial_data {
 *     description: [string, string][];
 *     event: eventName;
 *     node: test_browserDOM;
 *     title: string;
 * }
 * type eventName = "blur" | "click" | "contextmenu" | "dblclick" | "focus" | "keydown" | "keyup" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "move" | "refresh-interaction" | "refresh" | "resize" | "select" | "setValue" | "touchend" | "touchstart" | "wait";
 * ``` */
interface tutorial_data {
    description: [string, string][];
    event: eventName;
    node: test_browserDOM;
    title: string;
}

/**
 * The WebSocket onmessage handler receives an event object like any other native event handler, but there is a data property specific to web socket events.  There should be a TypeScript type to cover this, but there is isn't, so I created it.
 * ```typescript
 * interface websocket_event extends Event {
 *     data: string;
 * }
 * ``` */
interface websocket_event extends Event {
    data: string;
}

/**
 * Extends the browser web socket data type to support a type property.
 * ```typescript
 * interface websocket_browser extends WebSocket {
 *     type: string;
 * }
 * ``` */
interface websocket_browser extends WebSocket {
    type: string;
}

/**
 * Defines an empty function used to bypass some constraints between TypeScript types and socket client definitions.
 * ```typescript
 * interface websocket_local extends WebSocket {
 *     new (address:string, protocols:string[]): WebSocket;
 * }
 * ``` */
interface websocket_local extends WebSocket {
    new (address:string, protocols:string[]): WebSocket;
}