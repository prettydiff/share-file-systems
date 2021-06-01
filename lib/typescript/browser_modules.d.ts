/* lib/typescript/browser_modules.d - TypeScript interfaces that define master library modules used in the browser. */

interface module_common {
    agents: (agents:agentsConfiguration) => void;
    capitalize: (input:string) => string;
    commas: (number:number) => string;
    prettyBytes: (an_integer:number) => string;
    selfShares: (devices:agents, deleted:agentList) => agentShares;
}
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
interface module_context {
    copy: (event:Event) => void;
    dataString: (event:Event) => void;
    destroy: EventHandlerNonNull;
    details: (Event:Event) => void;
    element: Element;
    fsNew: (event:Event) => void;
    menu: (event:MouseEvent) => void;
    menuRemove: () => void;
    paste: EventHandlerNonNull;
    type: contextType;
}
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
    searchFocus: EventHandlerNonNull;
    select: (event:Event) => void;
    text: (event:Event) => void;
}
interface module_invite {
    accept: (box:Element) => void;
    addAgents: (invitation:invite) => void;
    complete: (invitation:invite) => void;
    decline: (event:MouseEvent) => void;
    error: (inviteData:invite) => void;
    payload: (config:invitePayload) => invite;
    portValidation: (event:KeyboardEvent) => void;
    request: (event:Event, options:modal) => void;
    respond: (invitation:invite) => void;
    start: (event:Event, configuration?:modal) => void;
    typeToggle: (event:Event) => void;
}
interface module_message {
    footer: (mode:messageMode, value:string) => Element;
    keySubmit: EventHandlerNonNull;
    modal: (configuration:modal, agentType:agentType, agentName:string) => Element;
    modeToggle: (event:Event) => void;
    populate:(modalId:string) => void;
    post: (item:messageItem, target:messageTarget, modalId:string) => void;
    shareButton: (event:Event) => void;
    submit: (event:Event) => void;
}
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
    move: EventHandlerNonNull;
    resize: (event:MouseEvent|TouchEvent) => void;
    textPad: (event:Event, value?:string, title?:string) => void;
    textSave: (event:Event) => void;
    textTimer: (event:KeyboardEvent) => void;
    unMinimize: (event:MouseEvent) => void;
    zTop: (event:KeyboardEvent|MouseEvent, elementInput?:Element) => void;
}
interface module_network {
    copy: (configuration:systemDataCopy, callback:(responseText:string) => void, id?:string) => void;
    deleteAgents: (deleted:agentList) => void;
    fileBrowser: (configuration:systemDataFile, callback:(responseText:string) => void, id?:string) => void;
    hashDevice: (callback:Function) => void;
    hashShare: (configuration:hashShareConfiguration) => void;
    heartbeat: (status:heartbeatStatus, update:boolean) => void;
    inviteAccept: (configuration:invite) => void;
    inviteRequest: (configuration:invite) => void;
    message: (message:messageItem) => void;
    // eslint-disable-next-line
    log: (...params:unknown[]) => void;
    settings: (type:settingsType, callback:() => void) => void;
    testBrowser: (payload:[boolean, string, string][], index:number, task:testBrowserAction) => void;
    xhr: (config:networkConfig) => void;
}
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
    stringify: (primitive:primitive) => string;
}
interface module_share {
    addAgent: (input:addAgent) => void;
    content: (agent:string, agentType:agentType|"") => Element;
    context: EventHandlerNonNull;
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
interface module_util {
    audio: (name:string) => void;
    dateFormat: (date:Date) => string;
    delay: () => Element;
    dragBox: eventCallback;
    dragList: (event:MouseEvent, dragBox:Element) => void;
    fileListStatus: (data:fileStatusMessage) => void;
    fixHeight: () => void;
    formKeys: (event:KeyboardEvent, submit:Function) => void;
    getAgent: (element:Element) => agency;
    keys: (event:KeyboardEvent) => void;
    menu: EventHandlerNonNull;
    menuBlur: EventHandlerNonNull;
    minimizeAll: EventHandlerNonNull;
    minimizeAllFlag: boolean;
    name: (item:Element) => string;
    sanitizeHTML: (input:string) => string;
    screenPosition: (node:Element) => ClientRect;
    selectedAddresses: (element:Element, type:string) => [string, shareType, string][];
    selectNone:(element:Element) => void;
    time: (date:Date) => string;
}