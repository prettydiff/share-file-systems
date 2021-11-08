/* lib/typescript/modules_browser.d - TypeScript interfaces that define master library modules used in the browser. */

/**
 * Extends the DOM's Document interface to include custom methods.
 */
interface Document {
    getElementsByAttribute: (name:string, value:string) => Element[];
    getModalsByModalType: (type:modalType|"all") => Element[];
    getNodesByType: (typeValue:number | string) => Node[];
    getElementsByText: (textValue:string, caseSensitive?:boolean) => Element[];
}

/**
 * Extends the DOM's Element interface to include custom methods.
 */
interface Element {
    getAncestor: (identifier:string, selector:selector) => Element;
    getElementsByAttribute: (name:string, value:string) => Element[];
    getNodesByType: (typeValue:number | string) => Node[];
    getElementsByText: (textValue:string, caseSensitive?:boolean) => Element[];
}

/**
 * Provides globally available utilities, such as string formatting tools.  Function arguments are specified as sub-lists.
 */
interface module_common {
    agents: (config:agentsConfiguration) => void;
    capitalize: (input:string) => string;
    commas: (input:number) => string;
    prettyBytes: (input:number) => string;
    selfShares: (devices:agents, deleted:agentList) => agentShares;
}

/**
 * Provides the interactions associated with the Configuration modal
 */
interface module_configuration {
    addUserColor: (agent:string, type:agentType, configurationBody:Element) => void;
    agentColor: (event:Event) => void;
    applyAgentColors: (agent:string, type:agentType, colors:[string, string]) => void;
    audio: (event:MouseEvent) => void;
    colorDefaults: colorList;
    colorScheme: (event:MouseEvent) => void;
    configurationText: (event:Event) => void;
    detailsToggle: (event:MouseEvent) => void;
    modal: (event:MouseEvent) => void;
    modalContent: () => Element;
    radio: (element:Element) => void;
    styleText: (input:styleText) => void;
}
/**
 * Provides interactions associated with the right-click context menu for file system modals.
 */
interface module_context {
    copy: (event:Event) => void;
    dataString: (event:Event) => void;
    destroy: (event:Event) => void;
    details: (Event:Event) => void;
    element: Element;
    fsNew: (event:Event) => void;
    menu: (event:MouseEvent) => void;
    menuRemove: () => void;
    paste: (event:Event) => void;
    type: contextType;
}
/**
 * Provides all aspects of the file system modals from requesting file system data, building content, and generating the respective interactions.
 */
interface module_fileBrowser {
    back: (event:Event) => void;
    details: (response:string) => void;
    directory: (event:Event) => void;
    drag: (event:MouseEvent|TouchEvent) => void;
    dragFlag: dragFlag;
    execute: (event:Event) => void;
    expand: (event:Event) => void;
    keyExecute: (event:KeyboardEvent) => void;
    list: (location:string, dirs:directoryResponse, message:string) => Element;
    listFail: (count:number, box: Element) => void;
    listFocus: (event:Event) => void;
    listItem: (item:directoryItem, extraClass:string) => Element;
    modalAddress: (config:modalHistoryConfig) => void;
    navigate: (Event:Event, config?: navConfig) => void;
    parent: (event:Event) => void;
    rename: (event:Event) => void;
    saveFile: (event:Event) => void;
    search: (event?:Event, searchElement?:HTMLInputElement, callback?:Function) => void;
    searchFocus: (event:Event) => void;
    select: (event:Event) => void;
    text: (event:Event) => void;
}
/**
 * Provides invite modal content, invite messaging handling, and all associated interactions.
 */
interface module_invite {
    accept: (box:Element) => void;
    addAgents: (invitation:invite) => void;
    complete: (invitation:invite) => void;
    decline: (event:MouseEvent) => void;
    payload: (config:invitePayload) => invite;
    portValidation: (event:KeyboardEvent) => void;
    request: (event:Event, options:modal) => void;
    respond: (invitation:invite) => void;
    start: (event:Event, configuration?:modal) => void;
    typeToggle: (event:Event) => void;
}
/**
 * Provides audio/video access from browser APIs and all associated interactions.
 */
interface module_media {
    element: (mediaType:mediaType, height:number, width:number) => Element;
    kill: (modal:modal) => void;
    modal: (mediaConfig:mediaConfig) => Element;
    selfDrag: (event:Event) => void;
}
/**
 * Generates text message modals and all associated interactions.
 */
interface module_message {
    footer: (mode:messageMode, value:string) => Element;
    keySubmit: (event:Event) => void;
    modal: (configuration:modal, agentType:agentType, agentName:string) => Element;
    modeToggle: (event:Event) => void;
    populate:(modalId:string) => void;
    post: (item:messageItem, target:messageTarget, modalId:string) => void;
    shareButton: (event:Event) => void;
    submit: (event:Event) => void;
    videoButton: (event:Event) => void;
}
/**
 * Provides generic modal specific interactions such as resize, move, generic modal buttons, and so forth.
 */
interface module_modal {
    close: (event:MouseEvent) => void;
    closeEnduring: (event:MouseEvent) => void;
    confirm: (event:MouseEvent) => void;
    create: (options:modal) => Element;
    export: (event:MouseEvent) => void;
    footerResize: (event:MouseEvent) => void;
    forceMinimize: (id:string) => void;
    importSettings: (event:MouseEvent) => void;
    maximize: (event:Event, callback?:() => void) => void;
    minimize: (event:Event, callback?:() => void) => void;
    move: (event:Event) => void;
    resize: (event:MouseEvent|TouchEvent) => void;
    textPad: (event:Event, config?:modal) => Element;
    textSave: (event:Event) => void;
    textTimer: (event:KeyboardEvent) => void;
    unMinimize: (event:MouseEvent) => void;
    zTop: (event:KeyboardEvent|MouseEvent, elementInput?:Element) => void;
}
/**
 * Builds HTTP request bodies for transfer to the terminal.
 */
interface module_network {
    configuration: () => void;
    heartbeat: (status:heartbeatStatus, update:boolean) => void;
    send:(data:socketDataType, service:requestType, callback:(responseString:string) => void) => void;
}
/**
 * A browser remote control interface used for browser test automation.
 */
interface module_remote {
    action: testBrowserAction;
    delay: (config:testBrowserItem) => void;
    domFailure: boolean;
    error: (message:string, source:string, line:number, col:number, error:Error) => void;
    evaluate: (test:testBrowserTest) => [boolean, string, string];
    event: (item:testBrowserRoute, pageLoad:boolean) => void;
    getProperty: (test:testBrowserTest) => primitive;
    index: number;
    keyAlt: boolean;
    keyControl: boolean;
    keyShift: boolean;
    node: (dom:testBrowserDOM, property:string) => Element;
    report: (test:testBrowserTest[], index:number) => void;
    sendTest: (payload:[boolean, string, string][], index:number, task:testBrowserAction) => void;
    stringify: (primitive:primitive) => string;
}
/**
 * Populates the various agent modals, device details, and share data lists.
 */
interface module_share {
    addAgent: (input:addAgent) => void;
    content: (agent:string, agentType:agentType|"") => Element;
    context: (event:Event) => void;
    deleteAgent: (agent:string, agentType:agentType) => void;
    deleteAgentList: (box:Element) => void;
    deleteItem: (event:MouseEvent) => void;
    deleteList: (event:MouseEvent, configuration?:modal) => void;
    deleteListContent: () => Element;
    deleteToggle: (event:MouseEvent) => void;
    modal: (agent:string, agentType:agentType|"", configuration:modal|null) => void;
    readOnly: (event:MouseEvent) => void;
    update: (exclusion:string) => void;
}
/**
 * A list of common tools that only apply to the browser side of the application.
 */
interface module_util {
    audio: (name:string) => void;
    dateFormat: (date:Date) => string;
    delay: () => Element;
    dragBox: eventCallback;
    dragList: (event:MouseEvent, dragBox:Element) => void;
    fileListStatus: (data:service_fileStatus) => void;
    fixHeight: () => void;
    formKeys: (event:KeyboardEvent, submit:Function) => void;
    getAgent: (element:Element) => agency;
    keys: (event:KeyboardEvent) => void;
    menu: (event:Event) => void;
    menuBlur: (event:Event) => void;
    minimizeAll: (event:Event) => void;
    minimizeAllFlag: boolean;
    name: (item:Element) => string;
    sanitizeHTML: (input:string) => string;
    screenPosition: (node:Element) => DOMRect;
    selectedAddresses: (element:Element, type:string) => [string, shareType, string][];
    selectNone:(element:Element) => void;
    time: (date:Date) => string;
}