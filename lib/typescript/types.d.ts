/* lib/typescript/types.d - TypeScript static types. */

type agency = [string, boolean, agentType];
type agentTextList = [agentType, string][];
type agentType = "device" | "user";
type brotli = 0|1|2|3|4|5|6|7|8|9|10|11;
type browserDOM = [domMethod, string, number];
type buildPhase = "browserSelf" | "clearStorage" | "commands" | "configurations" | "libReadme" | "lint" | "service" | "shellGlobal" | "simulation" | "typescript" | "version";
type byte = [0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1, 0|1];
type certKey = "crt" | "key";
type color = [string, string];
type colorScheme = "dark" | "default";
type commands = "agent_data" | "agent_online" | "base64" | "build" | "certificate" | "commands" | "copy" | "directory" | "get" | "hash" | "lint" | "mkdir" | "remove" | "service" | "test_browser" | "test_service" | "test_simulation" | "test" | "update" | "version";
type copyTypes = "copy-file" | "copy-request-files" | "copy-request";
type contextType = "" | "Base64" | "copy" | "cut" | "directory" | "Edit" | "file" | "Hash";
type directoryItem = [string, "directory" |  "error" | "file" | "link", string, number, number, directoryData];
type directoryMode = "array" | "hash" | "list" | "read" | "search";
type directoryResponse = directoryList | "missing" | "noShare" | "readOnly";
type domMethod = "activeElement" | "childNodes" | "documentElement" | "firstChild" | "getAncestor" | "getElementById" | "getElementsByAttribute" | "getElementsByClassName" | "getElementsByName" | "getElementsByTagName" | "getElementsByText" | "getModalsByModalType" | "getNodesByType" | "lastChild" | "nextSibling" | "parentNode" | "previousSibling" | "window";
type dragFlag = "" | "control" | "shift";
type eslintCustom = ["error", ...{selector:string;message:string;}[]];
type eslintDelimiter = ["error", ...eslintDelimiterItem[]];
type eventCallback = (event:Event, callback:(event:MouseEvent, dragBox:Element) => void) => void;
type eventName = "blur" | "click" | "contextmenu" | "dblclick" | "focus" | "keydown" | "keyup" | "mousedown" | "mouseenter" | "mouseleave" | "mousemove" | "mouseout" | "mouseover" | "mouseup" | "move" | "refresh-interaction" | "refresh" | "resize" | "select" | "setValue" | "touchend" | "touchstart" | "wait";
type fileAction = "fs-base64" | "fs-destroy" | "fs-details" | "fs-directory" | "fs-execute" | "fs-hash" | "fs-new" | "fs-read" | "fs-rename" | "fs-search" | "fs-write";
type hash = "blake2d512" | "blake2s256" | "sha1" | "sha3-224" | "sha3-256" | "sha3-384" | "sha3-512" | "sha384" | "sha512-224" | "sha512-256" | "sha512" | "shake128" | "shake256";
type hashTypes = "hash-device" | "hash-share" | "hash-user";
type heartbeatAction = "complete" | "delete-agents" | "status" | "update";
type heartbeatStatus = "" | "active" | "deleted" | "idle" | "offline";
type inviteAction = "invite-complete" | "invite-request" | "invite-response" | "invite-start";
type inviteStatus = "accepted" | "declined" | "invited";
type mediaType = "audio" | "video";
type messageMode = "code" | "text";
type messageTarget = "agentFrom" | "agentTo";
type mimeType = "application/javascript" | "application/json" | "application/octet-stream" | "application/x-www-form-urlencoded" | "application/xhtml+xml" | "image/jpeg" | "image/png" | "image/svg+xml" | "text/css" | "text/html" | "text/plain";
type modalStatus = "hidden" | "maximized" | "minimized" | "normal";
type modalType = "configuration" | "details" | "document" | "export" | "fileEdit" | "fileNavigate" | "invite-accept" | "invite-request" | "media" | "message" | "share_delete" | "shares" | "textPad";
type primitive = boolean | number | string | null | undefined;
type qualifier = "begins" | "contains" | "ends" | "greater" | "is" | "lesser" | "not contains" | "not";
type qualifierFile = "file begins" | "file contains" | "file ends" | "file is" | "file not contains" | "file not" | "filesystem contains" | "filesystem not contains";
type requestType = hashTypes | "agent-online" | "browser-log" | "copy" | "error" | "file-list-status-device" | "file-list-status-user" | "forbidden" | "fs" | "GET" | "heartbeat" | "invite" | "message" | "reload" | "response-no-action" | "settings" | "test-browser";
type resizeDirection = "b" | "bl" | "br" | "l" | "r" | "t" | "tl" | "tr";
type searchType = "fragment" | "negation" | "regex";
type selector = "class" | "id" | "tag";
// eslint-disable-next-line
type service_log = any[];
type service_message = messageItem[];
type settingsType = "configuration" | "device" | "message" | "user";
type shareType = "directory" | "file" | "link";
type socketDataType = Buffer | NodeJS.ErrnoException | service_agentDeletion | service_agentResolve | service_copy | service_copyFile | service_fileRequest | service_fileStatus | service_fileSystem | service_fileSystemDetails | service_hashAgent | service_hashShare | service_heartbeat | service_invite | service_log | service_message | service_settings | service_stringGenerate | service_testBrowser;
type testBrowserAction = "close" | "nothing" | "request" | "reset-browser" | "reset-complete" | "reset-request" | "reset-response" | "respond" | "result";
type testBrowserMode = "device" | "remote" | "self" | "user";
type testListType = "" | "browser_device" | "browser_remote" | "browser_self" | "browser_user" | "service" | "simulation";
type testLogFlag = testListType | "";
type ui_input = "cancel" | "close" | "confirm" | "maximize" | "minimize" | "save" | "text";
type websocketClientType = "browser" | "device" | "user";