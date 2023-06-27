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
 * Manages population of agent hash from the login form
 * ```typescript
 * interface module_agentHash {
 *     receive: (socketData:socketData) => void;
 *     send: (nameDevice:HTMLInputElement, nameUser:HTMLInputElement) => void;
 * }
 * ``` */
interface module_agentHash {
    receive: (socketData:socketData) => void;
    send: (nameDevice:HTMLInputElement, nameUser:HTMLInputElement) => void;
}

/**
 * Manages agent data in the browser.
 * ```typescript
 * interface module_agentManagement {
 *     content: {
 *         deleteAgents: () => HTMLElement;
 *         inviteRemote: (invitation:service_invite, name:string) => HTMLElement;
 *         inviteStart: () => HTMLElement;
 *         menu: (view:"delete"|"edit_names"|"invite") => HTMLElement;
 *         modifyAgents: () => HTMLElement;
 *     };
 *     events: {
 *         confirm: (event:MouseEvent) => void;
 *         confirmInvite: (event:MouseEvent, options:config_modal) => void;
 *         confirmModify: (event:MouseEvent) => void;
 *         deleteShare: (event:MouseEvent) => void;
 *         deleteToggle: (event:MouseEvent) => void;
 *         displayIP: (event:MouseEvent) => void;
 *         inviteDecline: (event:MouseEvent) => void;
 *         invitePortValidation: (event:Event) => void;
 *         inviteTypeToggle: (event:MouseEvent) => void;
 *         modeToggle: (event:MouseEvent) => void;
 *     };
 *     tools: {
 *         addAgent: (input:agentManagement_addAgent) => void;
 *         confirmDelete: (box:modal) => void;
 *         deleteAgent: (agent:string, agentType:agentType) => void;
 *         inviteAccept: (box:modal) => void;
 *         inviteComplete: (invitation:service_invite) => void;
 *         inviteReceive: (invitation:service_invite) => void;
 *         inviteTransmissionReceipt: (socketData:socketData) => void;
 *         modifyReceive: (socketData:socketData) => void;
 *     };
 * }
 * ``` */
interface module_agentManagement {
    content: {
        deleteAgents: () => HTMLElement;
        inviteRemote: (invitation:service_invite, name:string) => HTMLElement;
        inviteStart: () => HTMLElement;
        menu: (view:"delete"|"edit_names"|"invite") => HTMLElement;
        modifyAgents: () => HTMLElement;
    };
    events: {
        confirm: (event:MouseEvent) => void;
        confirmInvite: (event:MouseEvent, options:config_modal) => void;
        confirmModify: (event:MouseEvent) => void;
        deleteShare: (event:MouseEvent) => void;
        deleteToggle: (event:MouseEvent) => void;
        displayIP: (event:MouseEvent) => void;
        inviteDecline: (event:MouseEvent) => void;
        invitePortValidation: (event:Event) => void;
        inviteTypeToggle: (event:MouseEvent) => void;
        modeToggle: (event:MouseEvent) => void;
    };
    tools: {
        addAgent: (input:agentManagement_addAgent) => void;
        confirmDelete: (box:modal) => void;
        deleteAgent: (agent:string, agentType:agentType) => void;
        inviteAccept: (box:modal) => void;
        inviteComplete: (invitation:service_invite) => void;
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
 *     receive   : (socketData:socketData) => void;                     // Receives status data from remote agents.
 *     selfStatus: service_agentStatus;                                 // Stores the configuration for a network transmission.
 *     start     : () => void;                                          // Initiates local agent status timer on page load.
 * }
 * ``` */
interface module_agentStatus {
    active: (event:KeyboardEvent|MouseEvent|TouchEvent) => void;
    idle: () => void;
    idleDelay: NodeJS.Timeout;
    receive: (socketData:socketData) => void;
    selfStatus: service_agentStatus;
    start: () => void;
}

/**
 * Module definition for browser-side websocket handling.
 * ```typescript
 * interface module_browserSocket {
 *     error: () => void;                     // An error handling method.
 *     hash : string;                         // Stores a hash value used to authenticate a client hash tunnel at the server.
 *     send : (data:socketData) => void;      // Packages micro-service data for transmission in the application's micro-service format.
 *     sock : websocket_local;                // Provides a web socket object in a way that allows for explicit type declarations, reuse, and without angering the TypeScript gods.
 *     start: (callback: () => void) => void; // Initiates a web socket client from the browser.
 * }
 * ``` */
 interface module_browserSocket {
    error: () => void;
    hash: string;
    send: (data:socketData) => void;
    sock: websocket_local;
    start: (callback: () => void, hashDevice:string) => void;
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
 *     colorDefaults: browser_colorList; // An object associating color information to color scheme names.
 *     content      : () => HTMLElement; // Generates the configuration modal content to populate into the configuration modal.
 *     events: {
 *         agentColor       : (event:Event) => void;      // Specify custom agent color configurations.
 *         audio            : (event:MouseEvent) => void; // Assign changes to the audio option to settings.
 *         colorScheme      : (event:MouseEvent) => void; // Changes the color scheme of the page by user interaction.
 *         configurationText: (event:Event) => void;      // Processes settings changes from either text input or select lists.
 *         detailsToggle    : (event:MouseEvent) => void; // Shows and hides text explaining compression.
 *         modal            : (event:MouseEvent) => void; // Generates the configuration modal and fills it with content.
 *     };
 *     tools: {
 *         addUserColor    : (agent:string, type:agentType, configElement?:HTMLElement)) => void; // Add agent color options to the configuration modal content.
 *         applyAgentColors: (agent:string, type:agentType, colors:[string, string]) => void;     // Update the specified color information against the default colors of the current color scheme.
 *         radio           : (element:HTMLElement) => void;                                       // Sets a class on a grandparent element to apply style changes to the corresponding label.
 *         styleText       : (input:configuration_styleText) => void;                             // Generates the CSS code for an agent specific style change and populates it into an HTML style tag.
 *     };
 * }
 * ``` */
interface module_configuration {
    colorDefaults: browser_colorList;
    content: () => HTMLElement;
    events: {
        agentColor: (event:Event) => void;
        audio: (event:MouseEvent) => void;
        colorScheme: (event:MouseEvent) => void;
        configurationText: (event:Event) => void;
        detailsToggle: (event:MouseEvent) => void;
    };
    tools: {
        addUserColor: (agent:string, type:agentType, configElement?:HTMLElement) => void;
        applyAgentColors: (agent:string, type:agentType, colors:[string, string]) => void;
        radio: (element:HTMLElement) => void;
        styleText: (input:configuration_styleText) => void;
    };
}

/**
 * Creates and populates the right click context menu for the file navigate modal types.
 * ```typescript
 * interface module_context {
 *     clipboard: string;                          // Stores a file copy state pending a paste or cut action.
 *     content: (event:MouseEvent) => HTMLElement; // Creates the HTML content of the context menu.
 *     element: HTMLElement;                       // Stores a reference to the element.target associated with a given menu item.
 *     events: {
 *         contextMenuRemove: () => void;            // Removes the file system context menu from the DOM
 *         copy             : (event:Event) => void; // Handler for the *Copy* menu button, which stores file system address information in the application's clipboard.
 *         destroy          : (event:Event) => void; // Handler for the *Destroy* menu button, which is responsible for deleting file system artifacts.
 *         fsNew            : (event:Event) => void; // Handler for the *New Directory* and *New File* menu buttons.
 *         menu             : (event:Event) => void; // Generates the context menu which populates with different menu items depending upon event.target of the right click.
 *         paste            : (event:Event) => void; // Handler for the *Paste* menu item which performs the file copy operation over the network.
 *     };
 *     type: contextType; // Stores a context action type for awareness to the context action event handler.
 * }
 * type contextType = "" | "Base64" | "copy" | "cut" | "directory" | "Edit" | "file" | "Hash";
 * ``` */
interface module_context {
    clipboard: string;
    content:(event:MouseEvent) => HTMLElement;
    element: HTMLElement;
    events: {
        contextMenuRemove: () => void;
        copy: (event:Event) => void;
        destroy: (event:Event) => void;
        fsNew: (event:Event) => void;
        menu: (event:Event) => void;
        paste: (event:Event) => void;
    };
    type: contextType;
}

/**
 * Generates the user experience associated with file system interaction.
 * ```typescript
 * interface module_fileBrowser {
 *     content: {
 *         dataString     : (socketData:socketData) => void; // Populate content into modals for string output operations, such as: Base64, Hash, File Read.
 *         detailsContent : (id:string) => void;             // Generates the initial content and network request for file system details.
 *         detailsResponse: (socketData:socketData) => void; // Generates the contents of a details type modal from file system data.
 *         footer         : () => HTMLElement;               // Generates the status bar content for the file browser modal.
 *         list           : (location:string, dirs:directory_response, message:string) => HTMLElement; // Generates the contents of a file system list for population into a file navigate modal.
 *         status         : (socketData:socketData) => void; // Translates messaging into file system lists for the appropriate modals.
 *     };
 *     dragFlag: dragFlag; // Allows the drag handler to identify whether the shift or control/command keys are pressed while selecting items from the file list.
 *     events: {
 *         back       : (event:MouseEvent) => void;               // Handler for the back button, which steps back to the prior file system location of the given agent stored in the modal's navigation history.
 *         directory  : (event:KeyboardEvent|MouseEvent) => void; // Handler for navigation into a directory by means of double click.
 *         drag       : (event:MouseEvent|TouchEvent) => void;    // Move file system artifacts from one location to another by means of double click.
 *         execute    : (event:KeyboardEvent|MouseEvent) => void; // Allows operating system execution of a file by double click interaction.
 *         expand     : (event:MouseEvent) => void;               // Opens a directory into a child list without changing the location of the current modal.
 *         keyExecute : (event:KeyboardEvent) => void;            // Allows file execution by keyboard control, such as pressing the *Enter* key.
 *         listFocus  : (event:MouseEvent) => void;               // When clicking on a file list give focus to an input field in that list so that the list can receive focus.
 *         parent     : (event:MouseEvent) => void;               // Handler to navigate into the parent directory by click the parent navigate button.
 *         rename     : (event:KeyboardEvent|MouseEvent) => void; // Converts a file system item text into a text input field so that the artifact can be renamed.
 *         saveFile   : (event:MouseEvent) => void;               // A handler for an interaction that allows writing file changes to the file system.
 *         search     : (event?:FocusEvent|KeyboardEvent|MouseEvent, searchElement?:HTMLInputElement, callback?:(event:Event, callback:(event:MouseEvent, dragBox:HTMLElement) => void) => void) => void; // Sends a search query in order to receive a filtered list of file system artifacts.
 *         searchFocus: (event:FocusEvent) => void;               // Provides an interaction that enlarges and reduces the width of the search field.
 *         select     : (event:KeyboardEvent|MouseEvent) => void; // Select a file system item for interaction by click.
 *         text       : (event:FocusEvent|KeyboardEvent|MouseEvent) => void; // Allows changing file system location by changing the text address of the current location.
 *     };
 *     tools: {
 *         listFail    : (count:number, box:modal) => void; // Display status information when the Operating system locks files from access.
 *         listItem    : (item:directory_item, extraClass:string) => HTMLElement; // Generates the HTML content for a single file system artifacts that populates a file system list.
 *         modalAddress: (event:FocusEvent|KeyboardEvent|MouseEvent, config:config_modal_history) => void; // Updates the file system address of the current file navigate modal in response to navigating to different locations.
 *     };
 * }
 * type dragFlag = "" | "control" | "shift";
 * ``` */
interface module_fileBrowser {
    content: {
        dataString: (socketData:socketData) => void;
        detailsContent: (id:string) => void;
        detailsResponse: (socketData:socketData) => void;
        footer: () => HTMLElement;
        list: (location:string, dirs:directory_response, message:string) => HTMLElement;
        status: (socketData:socketData) => void;
    };
    dragFlag: dragFlag;
    events: {
        back: (event:MouseEvent) => void;
        directory: (event:KeyboardEvent|MouseEvent) => void;
        drag: (event:MouseEvent|TouchEvent) => void;
        execute: (event:KeyboardEvent|MouseEvent) => void;
        expand: (event:MouseEvent) => void;
        keyExecute: (event:KeyboardEvent) => void;
        listFocus: (event:MouseEvent) => void;
        parent: (event:MouseEvent) => void;
        rename: (event:KeyboardEvent|MouseEvent) => void;
        saveFile: (event:MouseEvent) => void;
        search: (event?:FocusEvent|KeyboardEvent|MouseEvent, searchElement?:HTMLInputElement, callback?:(event:Event, callback:(event:MouseEvent, dragBox:HTMLElement) => void) => void) => void;
        searchFocus: (event:FocusEvent) => void;
        select: (event:KeyboardEvent|MouseEvent) => void;
        text: (event:FocusEvent|KeyboardEvent|MouseEvent) => void;
    };
    tools: {
        listFail: (count:number, box:modal) => void;
        listItem: (item:directory_item, extraClass:string) => HTMLElement;
        modalAddress: (event:FocusEvent|KeyboardEvent|MouseEvent, config:config_modal_history) => void;
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
 *     tools: {
 *         kill : (modal:config_modal) => void;             // Destroys a media stream to the local hardware and closes the corresponding modal.
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
    tools: {
        kill: (modal:config_modal) => void;
    };
}

/**
 * Generates text message modals and all associated interactions.
 * ```typescript
 * interface module_message {
 *     content: {
 *         footer: (mode:messageMode, value:string) => HTMLElement;                 // Called from modal.create to supply the footer area modal content.
 *         modal : (text:string, placeholder:string) => [HTMLElement, HTMLElement]; // Generates a message modal.
 *     };
 *     events: {
 *         keySubmit  : (event:KeyboardEvent) => void;            // Submits a text message on key press, such as pressing the 'Enter' key.
 *         modeToggle : (event:MouseEvent) => void;               // Toggles between code type input and text type input.
 *         shareButton: (event:MouseEvent) => void;               // Creates a message button for the *share* modals.
 *         submit     : (event:KeyboardEvent|MouseEvent) => void; // Submit event handler to take message text into a data object for transmission across a network.
 *     };
 *     tools: {
 *         populate:(modalId:string) => void;                                           // Populate stored messages into message modals.
 *         post    : (item:message_item, target:messageTarget, modalId:string) => void; // Visually display the submitted and received messages as modal content.
 *         receive : (socketData:socketData) => void;                                   // Receives message updates from the network.
 *     };
 * }
 * type messageMode = "code" | "text";
 * type messageTarget = "agentFrom" | "agentTo";
 * ``` */
interface module_message {
    content: {
        footer: (mode:messageMode, value:string) => HTMLElement;
        modal: (text:string, placeholder:string) => [HTMLElement, HTMLElement];
    };
    events: {
        keySubmit: (event:KeyboardEvent) => void;
        modeToggle: (event:MouseEvent) => void;
        shareButton: (event:MouseEvent) => void;
        submit: (event:KeyboardEvent|MouseEvent) => void;
    };
    tools: {
        populate:(modalId:string) => void;
        post: (item:message_item, target:messageTarget, modalId:string) => void;
        receive: (socketData:socketData) => void;
    };
}

/**
 * Provides generic modal specific interactions such as resize, move, generic modal buttons, and so forth.
 * ```typescript
 * interface module_modal {
 *     content: (options:config_modal) => modal; // Creates a new modal.
 *     events: {
 *         close         : (event:MouseEvent) => void;                  // Closes a modal by removing it from the DOM, removing it from state, and killing any associated media.
 *         closeEnduring : (event:MouseEvent) => void;                  // Modal types that are enduring are hidden, not destroyed, when closed.
 *         confirm       : (event:MouseEvent) => void;                  // Handling for an optional confirmation button.
 *         footerResize  : (event:MouseEvent) => void;                  // If a resizable textarea element is present in the modal outside the body this ensures the body is the correct size.
 *         importSettings: (event:MouseEvent) => void;                  // Handler for import/export modals that modify saved settings from an imported JSON string then reloads the page.
 *         maximize      : (event:MouseEvent, callback?:() => void, target?:HTMLElement) => void; // Maximizes a modal to fill the view port.
 *         minimize      : (event:MouseEvent, callback?:() => void, target?:HTMLElement) => void; // Minimizes a modal to the tray at the bottom of the page.
 *         move          : (event:MouseEvent|TouchEvent) => void;       // Allows dragging a modal around the screen.
 *         resize        : (event:MouseEvent|TouchEvent) => void;       // Resizes a modal respective to the event target, which could be any of 4 corners or 4 sides.
 *         textSave      : (event:Event) => void;                       // Handler to push the text content of a text-pad modal into settings so that it is saved.
 *         textTimer     : (event:KeyboardEvent) => void;               // A timing event so that contents of a text-pad modal are automatically save after a brief duration of focus blur.
 *         unMinimize    : (event:MouseEvent) => void;                  // Restores a minimized modal to its prior size and location.
 *         zTop          : (event:KeyboardEvent|MouseEvent, elementInput?:HTMLElement) => void; // Processes visual overlapping or depth of modals.
 *     };
 *     tools: {
 *         dynamicWidth : (box:modal, width:number, buttonCount:number) => [number, number]; // uniformly calculates widths for modal headings and status bars.
 *         forceMinimize: (id:string) => void; // Modals that do not have a minimize button still need to conform to minimize from other interactions.
 *     };
 * }
 * ``` */
interface module_modal {
    content: (options:config_modal) => modal;
    events: {
        close: (event:MouseEvent) => void;
        closeEnduring: (event:MouseEvent) => void;
        confirm: (event:MouseEvent) => void;
        footerResize: (event:MouseEvent) => void;
        importSettings: (event:MouseEvent) => void;
        maximize: (event:MouseEvent, callback?:() => void, target?:HTMLElement) => void;
        minimize: (event:MouseEvent, callback?:() => void, target?:HTMLElement) => void;
        move: (event:MouseEvent|TouchEvent) => void;
        resize: (event:MouseEvent|TouchEvent) => void;
        textSave: (event:Event) => void;
        textTimer: (event:KeyboardEvent) => void;
        unMinimize: (event:MouseEvent) => void;
        zTop: (event:KeyboardEvent|MouseEvent, elementInput?:HTMLElement) => void;
    };
    tools: {
        dynamicWidth: (box:modal, width:number, buttonCount:number) => [number, number];
        forceMinimize: (id:string) => void;
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
 *         "invite-accept": modal_open;
 *         "media": modal_open;
 *         "message": modal_open;
 *         "shares": modal_open;
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
        "invite-accept": modal_open;
        "media": modal_open;
        "message": modal_open;
        "shares": modal_open;
        "terminal": modal_open;
        "text-pad": modal_open;
    };
    titles: {
        [key:string]: {
            icon: string;
            menu: boolean;
            text: string;
        };
    };
}

/**
 * Builds HTTP request bodies for transfer to the terminal.
 * ```typescript
 * interface module_network {
 *     configuration: () => void;                                         // A convenience method for setting state changes to a file.
 *     http         : (socketData:socketData) => void;                    // Prepares XHR and manages response text.
 *     receive      : (dataString:string) => void;                        // Receives data from the network.
 *     send         : (data:socketDataType, service:service_type) => void; // Provides a means for allowing arbitrary HTTP requests.
 * }
 * ``` */
interface module_network {
    configuration: () => void;
    http: (socketData:socketData) => void;
    receive: (dataString:string) => void;
    send: (data:socketDataType, service:service_type) => void;
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
 * Populates the various agent modals, device details, and share data lists.
 * ```typescript
 * interface module_share {
 *     content: (agent:string, agentType:agentType|"") => HTMLElement; // Generates the content of the share modal.
 *     events: {
 *         context : (event:Event) => void;      // Handler for the File Navigate context menu item *Add a Share*.
 *         readOnly: (event:MouseEvent) => void; // Toggle a share between read only and full access.
 *     }
 *     tools: {
 *         hash    : (socketData) => void;       // Generates a hash identifier for a new share
 *         update  : (exclusion:string) => void; // Updates the content of device shares in response to messaging from the network and local user interaction.
 *     }
 * }
 * ``` */
interface module_share {
    content: (agent:string, agentType:agentType|"") => HTMLElement;
    events: {
        context: (event:Event) => void;
        readOnly: (event:MouseEvent) => void;
    };
    tools: {
        hash: (socketData:socketData) => void;
        update: (exclusion:string) => void;
    };
}

/**
 * A list of common tools that only apply to the browser side of the application.
 * ```typescript
 * interface module_util {
 *     audio            : (name:string) => void;                             // Plays audio in the browser.
 *     delay            : () => HTMLElement;                                 // Create a div element with a spinner and class name of 'delay'.
 *     dragBox          : (event:MouseEvent|TouchEvent, callback:(event:MouseEvent, dragBox:HTMLElement) => void) => void; // Draw a selection box to capture a collection of items into a selection.
 *     dragList         : (event:MouseEvent, dragBox:HTMLElement) => void;   // Selects list items in response to drawing a drag box.
 *     fileAgent        : (element:HTMLElement, copyElement:HTMLElement, address?:string) => [fileAgent, fileAgent, fileAgent]; // Produces fileAgent objects for service_fileSystem and service_copy.
 *     formKeys         : (event:KeyboardEvent, submit:() => void) => void;  // Provides form execution on key down of 'Enter' key to input fields not in a form.
 *     getAgent         : (element:HTMLElement) => agentId;                  // Get the agent of a given modal.
 *     keys             : (event:KeyboardEvent) => void;                     // Executes shortcut key combinations.
 *     radioListItem    : (config:config_radioListItem) => void) => Element; // Creates a radio button inside a list item element.
 *     sanitizeHTML     : (input:string) => string;                          // Make a string safe to inject via innerHTML.
 *     screenPosition   : (node:HTMLElement) => DOMRect;                     // Gathers the view port position of an element.
 *     selectedAddresses: (element:HTMLElement, type:string) => [string, fileType, string][]; // Gather the selected addresses and types of file system artifacts in a fileNavigator modal.
 *     selectNone       : (element:HTMLElement) => void;                     // Remove selections of file system artifacts in a given fileNavigator modal.
 * }
 * type agency = [string, boolean, agentType];
 * type fileType = "directory" | "file" | "link";
 * ``` */
interface module_util {
    audio: (name:string) => void;
    delay: () => HTMLElement;
    dragBox: (event:MouseEvent|TouchEvent, callback:(event:MouseEvent, dragBox:HTMLElement) => void) => void;
    dragList: (event:MouseEvent, dragBox:HTMLElement) => void;
    fileAgent: (element:HTMLElement, copyElement:HTMLElement, address?:string) => [fileAgent, fileAgent, fileAgent];
    formKeys: (event:KeyboardEvent, submit:() => void) => void;
    getAgent: (element:HTMLElement) => agentId;
    keys: (event:KeyboardEvent) => void;
    radioListItem: (config:config_radioListItem) => HTMLElement;
    sanitizeHTML: (input:string) => string;
    screenPosition: (node:HTMLElement) => DOMRect;
    selectedAddresses: (element:HTMLElement, type:string) => [string, fileType, string][];
    selectNone: (element:HTMLElement) => void;
}