/* lib/typescript/types.d - TypeScript static types. */

// cspell:words brotli

type actionFile = "fs-base64" | "fs-destroy" | "fs-details" | "fs-directory" | "fs-execute" | "fs-hash" | "fs-new" | "fs-read" | "fs-rename" | "fs-search" | "fs-write";
type actionCopy = "copy-request-list" | "copy-send-list";
type activityStatus = "" | "active" | "deleted" | "idle" | "offline";
type agency = [string, boolean, agentType];
type agentCopy = agentTransmit | "agentWrite";
type agentTextList = [agentType, string][];
type agentTransmit = "agentRequest" | "agentSource";
type agentType = "device" | "user";
type brotli = 0|1|2|3|4|5|6|7|8|9|10|11;
type browserDOM = [domMethod, string, number];
type buildPhase = "browserSelf" | "bundleCSS" | "bundleJS" | "certificate" | "clearStorage" | "commands" | "configurations" | "libReadme" | "lint" | "os_specific" | "service" | "shellGlobal" | "simulation" | "typescript_compile" | "typescript_validate" | "version";
type byte = [0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1];
type certArgs = "intermediate-domain"|"intermediate-fileName"|"location"|"organization"|"root-domain"|"root-fileName"|"server-domain"|"server-fileName";
type certKey = "ca" | "crt" | "key";
type color = [string, string];
type commands = "agent_data" | "agent_online" | "base64" | "build" | "certificate" | "commands" | "copy" | "directory" | "get" | "hash" | "lint" | "mkdir" | "perf" | "remove" | "service" | "test_browser" | "test_service" | "test_simulation" | "test" | "typescript" | "update" | "version" | "websocket";
type contextType = "" | "Base64" | "copy" | "cut" | "directory" | "Edit" | "file" | "Hash";
type directory_item = [string, fileType, string, number, number, directory_data, string];
type directory_mode = "array" | "hash" | "list" | "read" | "search" | "type";
type directory_response = directory_list | "missing" | "noShare" | "readOnly";
type domMethod = "activeElement" | "addClass" | "childNodes" | "documentElement" | "firstChild" | "getAncestor" | "getElementById" | "getElementsByAttribute" | "getElementsByClassName" | "getElementsByName" | "getElementsByTagName" | "getElementsByText" | "getModalsByModalType" | "getNodesByType" | "lastChild" | "nextSibling" | "parentNode" | "previousSibling" | "removeClass" | "window";
type dragFlag = "" | "control" | "shift";
type eslintCustom = ["error", ...{message:string;selector:string;}[]];
type eslintDelimiter = ["error", ...configuration_eslint_item[]];
type eventName = "blur" | "click" | "contextmenu" | "dblclick" | "focus" | "keydown" | "keyup" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "move" | "refresh-interaction" | "refresh" | "resize" | "select" | "setValue" | "touchend" | "touchstart" | "wait";
type fileSort = "alphabetically-ascending" | "alphabetically-descending" | "file-extension" | "file-modified-ascending" | "file-modified-descending" | "file-system-type" | "size-ascending" | "size-descending";
type fileSystemReadType = "base64" | "hash" | "read";
type fileType = "directory" | "error" | "file" | "link";
type fileTypeList = [string, fileType][];
type hash = "blake2d512" | "blake2s256" | "sha1" | "sha3-224" | "sha3-256" | "sha3-384" | "sha3-512" | "sha384" | "sha512-224" | "sha512-256" | "sha512" | "shake128" | "shake256";
type hashTypes = "agent-hash" | "hash-share";
type inviteAction = "invite-complete" | "invite-request" | "invite-response" | "invite-start";
type inviteStatus = "accepted" | "declined" | "ignored" | "invited";
type keys_configuration = "audio" | "brotli" | "color" | "colors" | "fileSort" | "hashDevice" | "hashType" | "hashUser" | "minimizeAll" | "modals" | "modalTypes" | "nameDevice" | "nameUser" | "statusTime" | "storage" | "tutorial" | "zIndex";
type keys_stateDefault = "configuration" | "device" | "message" | "queue" | "user";
type mediaType = "audio" | "video";
type messageMode = "code" | "text";
type messageTarget = "agentFrom" | "agentTo";
type mimeType = "application/javascript" | "application/json" | "application/octet-stream" | "application/x-www-form-urlencoded" | "application/xhtml+xml" | "image/jpeg" | "image/png" | "image/svg+xml" | "text/css" | "text/html" | "text/plain";
type modalStatus = "hidden" | "maximized" | "minimized" | "normal";
type modalType = "agent-management" | "configuration" | "details" | "document" | "export" | "file-edit" | "file-navigate" | "invite-accept" | "media" | "message" | "shares" | "terminal" | "text-pad";
type perfType = "socket";
type posix = "arch" | "darwin" | "fedora" | "ubuntu";
type primitive = boolean | number | string | null | undefined;
type qualifier = "begins" | "contains" | "ends" | "greater" | "is" | "lesser" | "not contains" | "not";
type qualifierFile = "file begins" | "file contains" | "file ends" | "file is" | "file not contains" | "file not" | "filesystem contains" | "filesystem not contains";
type resizeDirection = "b" | "bl" | "br" | "l" | "r" | "t" | "tl" | "tr";
type searchType = "fragment" | "negation" | "regex";
type selector = "class" | "id" | "tag";
// eslint-disable-next-line
type service_log = any[];
type service_message = message_item[];
type service_type = "agent-hash" | "agent-management" | "agent-online" | "agent-status" | "copy-list-request" | "copy-list" | "copy-send-file" | "copy" | "cut" | "error" | "file-system-details" | "file-system-status" | "file-system-string" | "file-system" | "GET" | "hash-share" | "invite" | "log" | "message" | "perf-socket" | "response-no-action" | "settings" | "terminal" | "test-browser";
type settingsType = agentType | "configuration" | "message" | "queue";
type socketDataType = Buffer | service_agentHash | service_agentManagement | service_agentResolve | service_agentStatus | service_copy | service_copy_send_file | service_copy_write | service_cut | service_error | service_fileSystem | service_fileSystem_details | service_fileSystem_status | service_fileSystem_string | service_hashShare | service_invite | service_log | service_message | service_settings | service_terminal | service_testBrowser;
type socketStatus = "closed" | "end" | "open" | "pending";
type socketType = agentType | "browser" | "perf" | "send-file" | "test-browser";
type test_browserAction = "close" | "nothing" | "reset-complete" | "reset" | "result";
type test_browserMode = agentType | "remote" | "self";
type test_listType = "" | "browser_device" | "browser_remote" | "browser_self" | "browser_user" | "service" | "simulation";
type test_logFlag = test_listType | "";
type ui_input = "cancel" | "close" | "confirm" | "maximize" | "minimize" | "save" | "text";
type userData = [agentShares, transmit_addresses_IP];

// typed functions
type directory_sort = (a:directory_item, b:directory_item) => -1 | 1;
type receiver = (socketData:socketData, transmit:transmit_type) => void;
type commandCallback = (title:string, text:string[], fail:boolean) => void;
type modal_open = (event:Event, config?:config_modal) => modal;
type websocket_messageHandler = (resultBuffer:Buffer) => void;