/* lib/typescript/modules_browser.d - TypeScript interfaces that define master library modules used in the browser. */

/**
 * Extends the DOM's Document interface to include custom methods.
 */
interface Document {
    activeElement: HTMLElement;
    getElementsByAttribute: (name:string, value:string) => HTMLElement[];
    getElementsByText: (textValue:string, caseSensitive?:boolean) => HTMLElement[];
    getModalsByModalType: (type:modalType|"all") => HTMLElement[];
    getNodesByType: (typeValue:number | string) => Node[];
    highlight: (element:HTMLElement) => void;
    removeHighlight: (element:HTMLElement) => void;
}

/**
 * Extends the DOM's Element interface to include custom methods.
 */
interface Element {
    addClass: (className:string) => void;
    appendText: (text:string, empty?:boolean) => void;
    getAncestor: (identifier:string, selector:selector) => HTMLElement;
    getElementsByAttribute: (name:string, value:string) => HTMLElement[];
    getElementsByText: (textValue:string, caseSensitive?:boolean) => HTMLElement[];
    getNodesByType: (typeValue:number | string) => Node[];
    highlight: () => void;
    lowName: () => string;
    parentNode: HTMLElement;
    removeClass: (className:string) => void;
    removeHighlight: () => void;
}

interface FocusEvent {
    target: HTMLElement;
}
interface KeyboardEvent {
    target: HTMLElement;
}
interface MouseEvent {
    target: HTMLElement;
}
interface TouchEvent {
    target: HTMLElement;
}

/**
 * Manages agent data in the browser.
 * ```typescript
 * interface module_agentManagement {
 *     content: {
 *         inviteStart: () => HTMLElement;
 *         menu: (view:"delete"|"edit_names"|"invite") => HTMLElement;
 *     };
 *     events: {
 *         displayIP: (event:MouseEvent) => void;
 *         invitePortValidation: (event:Event) => void;
 *         inviteTypeToggle: (event:MouseEvent) => void;
 *         modeToggle: (event:MouseEvent) => void;
 *     };
 *     tools: {
 *         addAgent: (input:agentManagement_addAgent) => void;
 *         inviteComplete: (invitation:service_invite, modal:HTMLElement) => void;
 *         inviteReceive: (invitation:service_invite) => void;
 *         inviteTransmissionReceipt: (socketData:socketData) => void;
 *         modifyReceive: (socketData:socketData) => void;
 *     };
 * }
 * ``` */
interface module_agentManagement {
    content: {
        inviteStart: () => HTMLElement;
        menu: (view:"delete"|"edit_names"|"invite") => HTMLElement;
    };
    events: {
        displayIP: (event:MouseEvent) => void;
        invitePortValidation: (event:Event) => void;
        inviteTypeToggle: (event:MouseEvent) => void;
        modeToggle: (event:MouseEvent) => void;
    };
    tools: {
        addAgent: (input:agentManagement_addAgent) => void;
        inviteComplete: (invitation:service_invite, modal:HTMLElement) => void;
        inviteReceive: (invitation:service_invite) => void;
        inviteTransmissionReceipt: (socketData:socketData) => void;
        modifyReceive: (socketData:socketData) => void;
    };
}

/**
 * Manages local agent activity status from the browser.
 * ```typescript
 * interface module_agentStatus {
 *     active    : (event:KeyboardEvent|MouseEvent|TouchEvent) => void; // Converts local agent status to "active".
 *     idle      : () => void;                                          // Converts local agent status to "idle".
 *     idleDelay : NodeJS.Timeout                                       // Stores the current delay timer.
 *     selfStatus: service_agentStatus;                                 // Stores the configuration for a network transmission.
 *     start     : () => void;                                          // Initiates local agent status timer on page load.
 * }
 * ``` */
interface module_agentStatus {
    active: (event:KeyboardEvent|MouseEvent|TouchEvent) => void;
    idle: () => void;
    idleDelay: NodeJS.Timeout;
    selfStatus: service_agentStatus;
    start: () => void;
}

/**
 * Module definition for browser-side websocket handling.
 * ```typescript
 * interface module_browserSocket {
 *     error        : () => void;                                                          // An error handling method.
 *     hash         : string;                                                              // Stores a hash value used to authenticate a client hash tunnel at the server.
 *     sock         : websocket_local;                                                     // Provides a web socket object in a way that allows for explicit type declarations, reuse, and without angering the TypeScript gods.
 *     start        : (callback: () => void, hashDevice:string, type:string) => WebSocket; // Initiates a web socket client from the browser.
 *     type         : string;                                                              // Stores the submitted type value.
 * }
 * ``` */
interface module_browserSocket {
    error: () => void;
    hash: string;
    sock: websocket_local;
    start: (callback: () => void, hashDevice:string, type:string) => WebSocket;
    type: string;
}

/**
 * Interaction methods for the command terminal in the browser.
 * ```typescript
 * interface module_browserTerminal {
 *     content: () => [HTMLElement, HTMLElement];
 *     events: {
 *         close: (event:MouseEvent) => void;
 *         command: (event:KeyboardEvent) => void;
 *         keyInput: (event:KeyboardEvent) => void;
 *         keyOutput: (event:KeyboardEvent) => void;
 *         receive: (socketData:socketData) => void;
 *     };
 *     tools: {
 *         controlKeys: (event:KeyboardEvent, list:HTMLElement) => void;
 *         populate: (box:modal, logs:string[], restore:boolean) => void;
 *         send: (box:modal, command:string, autoComplete:boolean) => void;
 *     };
 * }
 * ``` */
interface module_browserTerminal {
    content: () => [HTMLElement, HTMLElement];
    events: {
        close: (event:MouseEvent) => void;
        command: (event:KeyboardEvent) => void;
        keyInput: (event:KeyboardEvent) => void;
        keyOutput: (event:KeyboardEvent) => void;
        receive: (socketData:socketData) => void;
    };
    tools: {
        controlKeys: (event:KeyboardEvent, list:HTMLElement) => void;
        populate: (box:modal, logs:string[], restore:boolean) => void;
        send: (box:modal, command:string, autoComplete:boolean) => void;
    };
}

/**
 * Provides globally available utilities, such as string formatting tools.
 * ```typescript
 * interface module_common {
 *     agents      : (config:agentsConfiguration) => void;                  // Provides a means to loop through agent types, agents, and shares against a supplied function.
 *     capitalize  : (input:string) => string;                              // Converts the first character of a string to a capital letter if that first character is a lowercase letter.
 *     commas      : (input:number) => string;                              // Converts a number into a string with commas separating character triplets from the right.
 *     dateFormat  : (date:Date) => string;                                 // Converts a date object into US Army date format.
 *     prettyBytes : (input:number) => string;                              // Converts a number into an abbreviated exponent of 2 describing storage size, example: 2134321 => 2.0MB.
 *     sortFileList: (dirs:directory_list, location:string, sortName:fileSort) => directory_list; // sorts directory_list items by user preference.
 *     time        : (date:Date) => string;                                 // Produce a formatted time string from a date object.
 *     userData    : (devices:agents, type:agentType, hash:string) => agent // Generates shares and ip address from all devices representative of the user.
 * }
 * ``` */
interface module_common {
    agents: (config:config_agentIdentity) => void;
    capitalize: (input:string) => string;
    commas: (input:number) => string;
    dateFormat: (date:Date) => string;
    prettyBytes: (input:number) => string;
    sortFileList: (dirs:directory_list, location:string, sortName:fileSort) => directory_list;
    time: (date:Date) => string;
    userData: (devices:agents, type:agentType, hash:string) => userData;
}

/**
 * Methods for generating the configuration modal and its interactions.
 * ```typescript
 * interface module_configuration {
 *     content      : () => HTMLElement; // Generates the configuration modal content to populate into the configuration modal.
 *     events: {
 *         agentColor       : (event:Event) => void;         // Specify custom agent color configurations.
 *         audio            : (event:MouseEvent) => void;    // Assign changes to the audio option to settings.
 *         backgroundWindow : (event:KeyboardEvent) => void; // Blur event from the Window Background Display text fields.
 *         colorScheme      : (event:MouseEvent) => void;    // Changes the color scheme of the page by user interaction.
 *         configurationText: (event:Event) => void;         // Processes settings changes from either text input or select lists.
 *         detailsToggle    : (event:MouseEvent) => void;    // Shows and hides text explaining compression.
 *         modal            : (event:MouseEvent) => void;    // Generates the configuration modal and fills it with content.
 *     };
 *     tools: {
 *         addUserColor    : (agent:string, type:agentType, configElement?:HTMLElement)) => void; // Add agent color options to the configuration modal content.
 *         applyAgentColors: (agent:string, type:agentType, colors:[string, string]) => void;     // Update the specified color information against the default colors of the current color scheme.
 *         socketMap       : (socketData:socketData) => void;                                     // Receives a service message and produces a content update for the socket list modal.
 *     };
 * }
 * ``` */
interface module_configuration {
    content: () => HTMLElement;
    events: {
        agentColor: (event:Event) => void;
        audio: (event:MouseEvent) => void;
        backgroundWindow: (event:KeyboardEvent) => void;
        colorScheme: (event:MouseEvent) => void;
        configurationText: (event:Event) => void;
        detailsToggle: (event:MouseEvent) => void;
    };
    tools: {
        addUserColor: (agent:string, type:agentType, configElement?:HTMLElement) => void;
        applyAgentColors: (agent:string, type:agentType, colors:[string, string]) => void;
        socketMap: (socketData:socketData) => void;
    };
}

/**
 * Creates and populates the right click context menu for the file navigate modal types.
 * ```typescript
 * interface module_context {
 *     clipboard: string;                          // Stores a file copy state pending a paste or cut action.
 *     content: (event:MouseEvent) => HTMLElement; // Creates the HTML content of the context menu.
 *     events: {
 *         copy    : (event:Event) => void; // Handler for the *Copy* menu button, which stores file system address information in the application's clipboard.
 *         destroy : (event:Event) => void; // Handler for the *Destroy* menu button, which is responsible for deleting file system artifacts.
 *         fsNew   : (event:Event) => void; // Handler for the *New Directory* and *New File* menu buttons.
 *         keys    : (event:KeyboardEvent) => void; // Executes shortcut key combinations.
 *         menu    : (event:Event) => void; // Generates the context menu which populates with different menu items depending upon event.target of the right click.
 *         paste   : (event:Event) => void; // Handler for the *Paste* menu item which performs the file copy operation over the network.
 *         rename  : (event:KeyboardEvent|MouseEvent) => void; // Converts a file system item text into a text input field so that the artifact can be renamed.
 *         share   : (event:Event) => void; // Handler for sharing a resource.
 *     };
 * }
 * type contextType = "" | "Base64" | "copy" | "cut" | "directory" | "Edit" | "file" | "Hash";
 * ``` */
interface module_context {
    clipboard: string;
    content:(event:MouseEvent) => HTMLElement;
    events: {
        copy: (event:Event) => void;
        destroy: (event:Event) => void;
        fsNew: (event:Event) => void;
        keys: (event:KeyboardEvent) => void;
        menu: (event:Event) => void;
        paste: (event:Event) => void;
        rename: (event:KeyboardEvent|MouseEvent) => void;
        share: (event:Event) => void;
    };
}

/**
 * Generates the user experience associated with file system interaction.
 * ```typescript
 * interface module_fileBrowser {
 *     content: {
 *         footer         : () => HTMLElement;               // Generates the status bar content for the file browser modal.
 *         list           : (location:string, dirs:directory_response, message:string) => HTMLElement; // Generates the contents of a file system list for population into a file navigate modal.
 *         status         : (socketData:socketData) => void; // Translates messaging into file system lists for the appropriate modals.
 *     };
 *     events: {
 *         drag       : (event:MouseEvent|TouchEvent) => void;    // Move file system artifacts from one location to another by means of double click.
 *         execute    : (event:KeyboardEvent|MouseEvent) => void; // Allows operating system execution of a file by double click interaction.
 *         expand     : (event:MouseEvent) => void;               // Opens a directory into a child list without changing the location of the current modal.
 *         keyExecute : (event:KeyboardEvent) => void;            // Allows file execution by keyboard control, such as pressing the *Enter* key.
 *         listFocus  : (event:MouseEvent) => void;               // When clicking on a file list give focus to an input field in that list so that the list can receive focus.
 *     };
 *     tools: {
 *         listFail         : (count:number, box:modal) => void;                                  // Display status information when the Operating system locks files from access.
 *         listItem         : (item:directory_item, extraClass:string) => HTMLElement;            // Generates the HTML content for a single file system artifacts that populates a file system list.
 *     };
 * }
 * ``` */
interface module_fileBrowser {
    content: {
        footer: () => HTMLElement;
        list: (location:string, dirs:directory_response, message:string) => HTMLElement;
        status: (socketData:socketData) => void;
    };
    events: {
        drag: (event:MouseEvent|TouchEvent) => void;
        execute: (event:KeyboardEvent|MouseEvent) => void;
        expand: (event:MouseEvent) => void;
        keyExecute: (event:KeyboardEvent) => void;
        listFocus: (event:MouseEvent) => void;
    };
    tools: {
        listFail: (count:number, box:modal) => void;
        listItem: (item:directory_item, location:string, extraClass:string) => HTMLElement;
    };
}

/**
 * Provides audio/video access from browser APIs and all associated interactions.
 * ```typescript
 * interface module_media {
 *     content: (mediaType:mediaType, height:number, width:number) => HTMLElement; // Creates an audio or video HTML element to populate into a media modal.
 *     events: {
 *         close      : (event:MouseEvent) => void;            // Kill any media stream when closing the modal
 *         selfDrag   : (event:MouseEvent|TouchEvent) => void; // Allows dragging a thumbnail of local webcam video from one corner of a video modal to another.
 *     };
 * }
 * type mediaType = "audio" | "video";
 * ``` */
interface module_media {
    content: (mediaType:mediaType, height:number, width:number) => HTMLElement;
    events: {
        close: (event:MouseEvent) => void;
        selfDrag: (event:MouseEvent|TouchEvent) => void;
    };
}

/**
 * Generates text message modals and all associated interactions.
 * ```typescript
 * interface module_message {
 *     content: {
 *         footer: (mode:messageMode, value:string) => HTMLElement;                 // Called from modal.create to supply the footer area modal content.
 *     };
 *     events: {
 *         shareButton: (event:MouseEvent) => void;               // Creates a message button for the *share* modals.
 *     };
 *     tools: {
 *         populate:(modalId:string) => void;                                           // Populate stored messages into message modals.
 *         receive : (socketData:socketData) => void;                                   // Receives message updates from the network.
 *     };
 * }
 * type messageMode = "code" | "text";
 * type messageTarget = "agentFrom" | "agentTo";
 * ``` */
interface module_message {
    content: {
        footer: (mode:messageMode, value:string) => HTMLElement;
    };
    events: {
        shareButton: (event:MouseEvent) => void;
    };
    tools: {
        populate:(modalId:string) => void;
        receive: (socketData:socketData) => void;
    };
}

/**
 * Provides generic modal specific interactions such as resize, move, generic modal buttons, and so forth.
 * ```typescript
 * interface module_modal {
 *     content: (options:config_modal) => modal; // Creates a new modal.
 *     events: {
 *         closeEnduring : (event:MouseEvent) => void;                               // Modal types that are enduring are hidden, not destroyed, when closed.
 *         footerResize  : (event:MouseEvent) => void;                               // If a resizable textarea element is present in the modal outside the body this ensures the body is the correct size.
 *         maximize      : (event:MouseEvent, callback?:() => void, target?:HTMLElement) => void; // Maximizes a modal to fill the view port.
 *         minimize      : (event:MouseEvent, callback?:() => void, target?:HTMLElement) => void; // Minimizes a modal to the tray at the bottom of the page.
 *         move          : (event:MouseEvent|TouchEvent) => void;                    // Allows dragging a modal around the screen.
 *         resize        : (event:MouseEvent|TouchEvent, boxElement?:modal) => void; // Resizes a modal respective to the event target, which could be any of 4 corners or 4 sides.
 *         textSave      : (event:Event) => void;                                    // Handler to push the text content of a text-pad modal into settings so that it is saved.
 *         textTimer     : (event:KeyboardEvent) => void;                            // A timing event so that contents of a text-pad modal are automatically save after a brief duration of focus blur.
 *     };
 *     tools: {
 *         dynamicWidth : (box:modal, width:number, buttonCount:number) => [number, number]; // uniformly calculates widths for modal headings and status bars.
 *         forceMinimize: (id:string) => void;                                               // Modals that do not have a minimize button still need to conform to minimize from other interactions.
 *         textModal    : (title:string, value:string, type:modalType) => HTMLElement;       // Defines the content of a textarea modal in a uniform way.
 *     };
 * }
 * ``` */
interface module_modal {
    content: (options:config_modal) => modal;
    events: {
        closeEnduring: (event:MouseEvent) => void;
        footerResize: (event:MouseEvent) => void;
        maximize: (event:MouseEvent, callback?:() => void, target?:HTMLElement) => void;
        minimize: (event:MouseEvent, callback?:() => void, target?:HTMLElement) => void;
        move: (event:MouseEvent|TouchEvent) => void;
        resize: (event:MouseEvent|TouchEvent, boxElement?:modal) => void;
        textSave: (event:Event) => void;
        textTimer: (event:KeyboardEvent) => void;
    };
    tools: {
        dynamicWidth: (box:modal, width:number, buttonCount:number) => [number, number];
        forceMinimize: (id:string) => void;
        textModal: (title:string, value:string, type:modalType) => HTMLElement;
    };
}

/**
 * Provides a central location for the configuration of modals by modal type.
 * ```typescript
 * interface module_modalConfiguration {
 *     modals: {
 *         "agent-management": modal_open;
 *         "configuration": modal_open;
 *         "details": modal_open;
 *         "document": modal_open;
 *         "export": modal_open;
 *         "file-edit": modal_open;
 *         "file-navigate": modal_open;
 *         "invite-ask": modal_open;
 *         "media": modal_open;
 *         "message": modal_open;
 *         "shares": modal_open;
 *         "socket-map": modal_open;
 *         "terminal": modal_open;
 *         "text-pad": modal_open;
 *     };
 *     titles: {
 *         [key:string]: {
 *             icon: string;
 *             menu: boolean;
 *             text: string;
 *         };
 *     };
 * }
 * ``` */
interface module_modalConfiguration {
    modals: {
        "agent-management": modal_open;
        "configuration": modal_open;
        "details": modal_open;
        "document": modal_open;
        "export": modal_open;
        "file-edit": modal_open;
        "file-navigate": modal_open;
        "invite-ask": modal_open;
        "media": modal_open;
        "message": modal_open;
        "shares": modal_open;
        "socket-map": modal_open;
        "terminal": modal_open;
        "text-pad": modal_open;
    };
}

/**
 * A browser remote control interface used for browser test automation.
 * ```typescript
 * interface module_remote {
 *     action     : test_browserAction;                                   // A property holding the action property value of the current test item.
 *     delay      : (config:test_browserItem) => void;                    // A utility to delay execution of evaluation criteria if the current test item features a delay property.
 *     domFailure : boolean;                                              // A flag indicating whether an event resulted in a DOM failure for reporting to the terminal.
 *     error      : (message:string, source:string, line:number, col:number, error:Error) => void; // Gathers JavaScript errors from the page for reporting to the terminal as a test failure.
 *     evaluate   : (test:test_browserTest) => [boolean, string, string]; // Executes the units of evaluation provided in a test item.
 *     event      : (item:service_testBrowser, pageLoad:boolean) => void; // Executes the events provided in a test item.
 *     getProperty: (test:test_browserTest) => [HTMLElement, primitive];  // Retrieve the value of the specified DOM property or attribute.
 *     index      : number;                                               // A property holding the index of the current test item.
 *     keyAlt     : boolean;                                              // A flag indicating whether the Alt key is pressed and not released while executing further events.
 *     keyControl : boolean;                                              // A flag indicating whether the Control/Command key is pressed and not released while executing further events.
 *     keyShift   : boolean;                                              // A flag indicating whether the Shift key is pressed and not released while executing further events.
 *     node       : (dom:test_browserDOM, property:string) => HTMLElement;// Retrieves a DOM node from the page by reading instructions from the test item.
 *     receive    : (socketData:socketData) => void;                      // Receives test instructions from the terminal and will either close the browser or execute *remote.event*.
 *     report     : (test:test_browserTest[], index:number) => void;      // Generates the evaluation report for sending to the terminal.
 *     sendTest   : (payload:[boolean, string, string][], index:number, task:test_browserAction) => void; // Sends test results to terminal.
 *     stringify  : (primitive:primitive) => string;                      // Converts a primitive of any type into a string for presentation.
 * }
 * type primitive = boolean | number | string | null | undefined;
 * type testBrowserAction = "close" | "nothing" | "reset" | "reset-complete" | "result";
 * ``` */
interface module_remote {
    action: test_browserAction;
    delay: (config:test_browserItem) => void;
    domFailure: boolean;
    error: (message:string, source:string, line:number, col:number, error:Error) => void;
    evaluate: (test:test_browserTest) => [boolean, string, string];
    event: (item:service_testBrowser, pageLoad:boolean) => void;
    getProperty: (test:test_browserTest) => [HTMLElement, primitive];
    index: number;
    keyAlt: boolean;
    keyControl: boolean;
    keyShift: boolean;
    node: (dom:test_browserDOM, property:string) => HTMLElement;
    receive: (socketData:socketData) => void;
    report: (test:test_browserTest[], index:number) => void;
    sendTest: (payload:[boolean, string, string][], index:number, task:test_browserAction) => void;
    stringify: (primitive:primitive) => string;
}

/**
 * A list of common tools that only apply to the browser side of the application.
 * ```typescript
 * interface module_util {
 *     audio            : (name:string) => void;                             // Plays audio in the browser.
 *     contextMenuRemove: () => void;                                        // Removes the file system context menu from the DOM
 *     delay            : () => HTMLElement;                                 // Create a div element with a spinner and class name of 'delay'.
 *     dragBox          : (event:MouseEvent|TouchEvent, callback:(event:MouseEvent, dragBox:HTMLElement) => void) => void; // Draw a selection box to capture a collection of items into a selection.
 *     dragList         : (event:MouseEvent, dragBox:HTMLElement) => void;   // Selects list items in response to drawing a drag box.
 *     fileAgent        : (element:HTMLElement, copyElement:HTMLElement, address?:string) => [fileAgent, fileAgent, fileAgent]; // Produces fileAgent objects for service_fileSystem and service_copy.
 *     formKeys         : (event:KeyboardEvent, submit:() => void) => void;  // Provides form execution on key down of 'Enter' key to input fields not in a form.
 *     getAgent         : (element:HTMLElement) => agentId;                  // Get the agent of a given modal.
 *     radioListItem    : (config:config_radioListItem) => void) => Element; // Creates a radio button inside a list item element.
 *     sanitizeHTML     : (input:string) => string;                          // Make a string safe to inject via innerHTML.
 *     screenPosition   : (node:HTMLElement) => DOMRect;                     // Gathers the view port position of an element.
 * }
 * type agency = [string, boolean, agentType];
 * type fileType = "directory" | "file" | "link";
 * ``` */
interface module_util {
    audio: (name:string) => void;
    contextMenuRemove: () => void;
    delay: () => HTMLElement;
    dragBox: (event:MouseEvent|TouchEvent, callback:(event:MouseEvent, dragBox:HTMLElement) => void) => void;
    dragList: (event:MouseEvent, dragBox:HTMLElement) => void;
    fileAgent: (element:HTMLElement, copyElement:HTMLElement, address?:string) => [fileAgent, fileAgent, fileAgent];
    formKeys: (event:KeyboardEvent, submit:() => void) => void;
    getAgent: (element:HTMLElement) => agentId;
    radioListItem: (config:config_radioListItem) => HTMLElement;
    sanitizeHTML: (input:string) => string;
    screenPosition: (node:HTMLElement) => DOMRect;
}