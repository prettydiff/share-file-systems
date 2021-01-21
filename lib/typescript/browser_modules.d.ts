/* lib/typescript/browser_modules.d - TypeScript interfaces that define master library modules used in the browser. */

interface module_common {
    agents: (agents:agentsConfiguration) => void;
    capitalize: (input:string) => string;
    commas: (number:number) => string;
    deviceShare: (devices:agents, deleted:agentList) => agentShares;
    prettyBytes: (an_integer:number) => string; 
}
interface module_context {
    copy?: EventHandlerNonNull;
    dataString?: EventHandlerNonNull;
    destroy?: EventHandlerNonNull;
    details?: (Event:Event, element?:Element) => void;
    element: Element;
    fsNew?: EventHandlerNonNull;
    menu?: EventHandlerNonNull;
    menuRemove?: () => void;
    paste?: EventHandlerNonNull;
    type: contextType;
}
interface module_fileBrowser {
    back?: EventHandlerNonNull;
    directory?: EventHandlerNonNull;
    drag?: EventHandlerNonNull;
    dragFlag?: dragFlag;
    expand?: EventHandlerNonNull;
    list?: (location:string, dirData:fsRemote) => [Element, number, string];
    listFail?: (count:number, box: Element) => void;
    listFocus?: EventHandlerNonNull;
    listItem?: (item:directoryItem, extraClass:string) => Element;
    navigate?: (Event:Event, config?: navConfig) => void;
    parent?: EventHandlerNonNull;
    rename?: EventHandlerNonNull;
    saveFile?: EventHandlerNonNull;
    search?: (event?:Event|KeyboardEvent, searchElement?:HTMLInputElement, callback?:Function) => void;
    searchBlur?: EventHandlerNonNull;
    searchFocus?: EventHandlerNonNull;
    select?: EventHandlerNonNull;
    text?: EventHandlerNonNull;
}
interface module_invite {
    accept?: (box:Element) => void;
    addAgents?: (invitation:invite) => void;
    complete?: (invitation:invite) => void;
    decline?: EventHandlerNonNull;
    error?: (inviteData:invite) => void;
    payload?: (config:invitePayload) => invite;
    portValidation?: EventHandlerNonNull;
    request?: (event:MouseEvent, options:modal) => void;
    respond?: (invitation:invite) => void;
    start?: (event:MouseEvent, configuration?:modal) => void;
    typeToggle?: EventHandlerNonNull;
}
interface module_message {
    footer?: () => Element;
    modal?: (configuration:modal) => void;
    mousedown: boolean;
    post?: (item:messageItem) => void;
    shareButton?: EventHandlerNonNull;
    submit?: EventHandlerNonNull;
    textareaDown?: EventHandlerNonNull;
    textareaResize?: EventHandlerNonNull;
    textareaUp?: EventHandlerNonNull;
}
interface module_modal {
    close?: EventHandlerNonNull;
    closeEnduring?: EventHandlerNonNull;
    confirm?: EventHandlerNonNull;
    create?: (options:modal) => Element;
    export?: EventHandlerNonNull;
    importSettings?: EventHandlerNonNull;
    maximize?: (Event:Event, callback?:() => void) => void;
    minimize?: (Event:Event, callback?:() => void) => void;
    move?: EventHandlerNonNull;
    resize?: EventHandlerNonNull;
    textPad?: (Event:Event, value?:string, title?:string) => void;
    textSave?: EventHandlerNonNull;
    textTimer?: EventHandlerNonNull;
    unMinimize?: EventHandlerNonNull;
    zTop?: (event:Event, elementInput?: Element) => void;
}
interface module_network {
    copy?: (copyService, callback:Function, id?:string) => void;
    deleteAgents?: (deleted:agentList) => void;
    fileBrowser?: (localService, callback:Function, id?:string) => void;
    hashDevice?: (callback:Function) => void;
    hashShare?: (configuration:hashShareConfiguration) => void;
    heartbeat?: (status:heartbeatStatus, update:boolean) => void;
    inviteAccept?:(configuration:invite) => void;
    inviteRequest?: (configuration:invite) => void;
    message?: (message:messageItem) => void;
    storage?: (type:storageType, callback:() => void) => void;
    testBrowser?: (payload:[boolean, string, string][], index:number, task:testBrowserAction) => void;
    xhr?: (config:networkConfig) => void;
}
interface module_remote {
    action: testBrowserAction;
    delay?: (config:testBrowserItem) => void;
    domFailure: boolean;
    error?: (message:string, source:string, line:number, col:number, error:Error) => void;
    evaluate?: (test:testBrowserTest) => [boolean, string, string];
    event?: (item:testBrowserRoute, pageLoad:boolean) => void;
    getProperty?: (test:testBrowserTest) => primitive;
    index: number;
    keyAlt: boolean;
    keyControl: boolean;
    keyShift: boolean;
    node?: (dom:testBrowserDOM, property:string) => Element;
    report?: (test:testBrowserTest[], index:number) => void;
    stringify?: (primitive:primitive) => string;
}
interface module_settings {
    addUserColor?: (agent:string, type:agentType, settingsBody:Element) => void;
    agentColor?: EventHandlerNonNull;
    applyAgentColors?: (agent:string, type:agentType, colors:[string, string]) => void;
    audio?: EventHandlerNonNull;
    colorDefaults?: colorList;
    colorScheme?: EventHandlerNonNull;
    compressionText?: (event:KeyboardEvent|FocusEvent) => void;
    compressionToggle?: EventHandlerNonNull;
    modal?: EventHandlerNonNull;
    modalContent?: () => Element;
    radio?:(element:Element) => void;
    styleText?: (input:styleText) => void;
}
interface module_share {
    addAgent?: (input:addAgent) => void;
    content?: (agent:string, agentType:agentType|"") => Element;
    context?: EventHandlerNonNull;
    deleteAgent?: (agent:string, agentType:agentType) => void;
    deleteAgentList?: (box:Element) => void;
    deleteItem?: EventHandlerNonNull;
    deleteList?: (event:MouseEvent, configuration?:modal) => void;
    deleteListContent?: () => Element;
    deleteToggle?: EventHandlerNonNull;
    modal?: (agent:string, agentType:agentType|"", configuration:modal|null) => void;
    readOnly?: EventHandlerNonNull;
    update?: (exclusion:string) => void;
}
interface module_util {
    audio?: (name:string) => void;
    dateFormat?: (date:Date) => string;
    delay?: () => Element;
    dragBox?: eventCallback;
    dragList?: (event:Event, dragBox:Element) => void;
    fileListStatus?: (data:copyStatus) => void;
    fixHeight?: () => void;
    formKeys?: (event:KeyboardEvent, submit:Function) => void;
    getAgent?: (element:Element) => agency;
    keys?: (event:KeyboardEvent) => void;
    login?: EventHandlerNonNull;
    menu?: EventHandlerNonNull;
    menuBlur?: EventHandlerNonNull;
    minimizeAll?: EventHandlerNonNull;
    minimizeAllFlag?: boolean;
    selectedAddresses?: (element:Element, type:string) => [string, shareType, string][];
    selectNone?:(element:Element) => void;
    time?: (date:Date) => string;
}